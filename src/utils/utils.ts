// === 채용 대시보드 유틸리티 함수 ===
// KPI 집계, 차트 데이터 변환, 병목 분석 등 핵심 로직

import { Position, KPIData, StageType, StageDistribution, DurationData, JobFamily } from '../types';

/** 모든 채용 단계 순서 (파이프라인 순) */
export const STAGE_ORDER: StageType[] = [
  '접수', '서류검토', '1차면접', '2차면접', '처우협의', '입사확정', '채용완료'
];

/** 활성 포지션만 필터링 (입사확정/채용완료 제외) */
export const getActivePositions = (positions: Position[]): Position[] =>
  positions.filter(p => p.is_active && p.current_stage !== '입사확정' && p.current_stage !== '채용완료');

/** 오픈일과 확정일(없으면 오늘)을 기준으로 경과일 계산 */
export const calculateElapsedDays = (openDate: string, completionDate?: string | null): number => {
  if (!openDate) return 0;
  const start = new Date(openDate).getTime();
  const end = completionDate ? new Date(completionDate).getTime() : new Date().getTime();
  const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

/** KPI 데이터 계산 */
export const calculateKPI = (positions: Position[]): KPIData => {
  const active = getActivePositions(positions);
  const gcCare = active.filter(p => p.company === 'GC케어');
  const gcMediai = active.filter(p => p.company === 'GC메디아이');

  // 평균 채용 소요기간 (활성 포지션 기준)
  const avgElapsedDays = active.length > 0
    ? Math.round(active.reduce((sum, p) => sum + p.total_elapsed_days, 0) / active.length)
    : 0;

  // 지연 포지션 수
  const delayedCount = active.filter(p => p.status_flag === '지연').length;

  // 이번 달(2026년 3월) 기준 신규 오픈 및 채용 완료
  const thisMonth = '2026-03';
  const newThisMonth = positions.filter(p => p.open_date.startsWith(thisMonth)).length;
  const completedThisMonth = positions.filter(
    p => !p.is_active && p.update_logs.some(log => log.date.startsWith(thisMonth))
  ).length;

  return {
    totalActive: active.length,
    gcCareCount: gcCare.length,
    gcMediaiCount: gcMediai.length,
    avgElapsedDays,
    delayedCount,
    newThisMonth,
    completedThisMonth,
  };
};

/** 채용 단계별 포지션 분포 데이터 생성 */
export const getStageDistribution = (positions: Position[]): StageDistribution[] => {
  const active = getActivePositions(positions);

  // 채용완료 단계 제외
  return STAGE_ORDER.filter(s => s !== '채용완료').map(stage => ({
    stage,
    count: active.filter(p => p.current_stage === stage).length,
    gcCare: active.filter(p => p.current_stage === stage && p.company === 'GC케어').length,
    gcMediai: active.filter(p => p.current_stage === stage && p.company === 'GC메디아이').length,
  }));
};

/** 직군별 평균 소요기간 데이터 생성 */
export const getDurationByJobFamily = (positions: Position[]): DurationData[] => {
  const active = getActivePositions(positions);
  const families = [...new Set(active.map(p => p.job_family))] as JobFamily[];

  return families.map(family => {
    const familyPositions = active.filter(p => p.job_family === family);
    const avgDays = Math.round(
      familyPositions.reduce((sum, p) => sum + p.total_elapsed_days, 0) / familyPositions.length
    );
    const targetDays = Math.round(
      familyPositions.reduce((sum, p) => sum + p.target_days, 0) / familyPositions.length
    );
    return { name: family, avgDays, targetDays };
  }).sort((a, b) => b.avgDays - a.avgDays);
};

/** 회사별 평균 소요기간 데이터 생성 */
export const getDurationByCompany = (positions: Position[]): DurationData[] => {
  const active = getActivePositions(positions);
  const companies = ['GC케어', 'GC메디아이'] as const;

  return companies.map(company => {
    const companyPositions = active.filter(p => p.company === company);
    if (companyPositions.length === 0) return { name: company, avgDays: 0, targetDays: 0 };

    const avgDays = Math.round(
      companyPositions.reduce((sum, p) => sum + p.total_elapsed_days, 0) / companyPositions.length
    );
    const targetDays = Math.round(
      companyPositions.reduce((sum, p) => sum + p.target_days, 0) / companyPositions.length
    );
    return { name: company, avgDays, targetDays };
  });
};

/** 병목 단계 Top 3 계산 (평균 체류일 기준) */
export const getBottleneckStages = (positions: Position[]): { stage: string; avgDays: number; count: number }[] => {
  const active = getActivePositions(positions);

  const stageStats = STAGE_ORDER
    .filter(s => s !== '채용완료')
    .map(stage => {
      const stagePositions = active.filter(p => p.current_stage === stage);
      if (stagePositions.length === 0) return { stage, avgDays: 0, count: 0 };
      const avgDays = Math.round(
        stagePositions.reduce((sum, p) => sum + p.days_in_stage, 0) / stagePositions.length
      );
      return { stage, avgDays, count: stagePositions.length };
    })
    .filter(s => s.count > 0)
    .sort((a, b) => b.avgDays - a.avgDays);

  return stageStats.slice(0, 3);
};

/** 전체 진행 건강도 계산 (0~100) */
export const calculateHealthScore = (positions: Position[]): number => {
  const active = getActivePositions(positions);
  if (active.length === 0) return 100;

  // 정상 비중으로 건강도 계산
  const normalCount = active.filter(p => p.status_flag === '정상').length;
  const cautionCount = active.filter(p => p.status_flag === '주의').length;

  // 정상=100점, 주의=50점, 지연=0점으로 가중 평균
  const score = Math.round(
    ((normalCount * 100) + (cautionCount * 50)) / active.length
  );
  return Math.min(100, Math.max(0, score));
};

/** 상태 플래그에 따른 색상 반환 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case '정상': return 'text-emerald-600 bg-emerald-50';
    case '주의': return 'text-amber-600 bg-amber-50';
    case '지연': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

/** 상태 플래그에 따른 dot 색상 반환 */
export const getStatusDotColor = (status: string): string => {
  switch (status) {
    case '정상': return 'bg-emerald-500';
    case '주의': return 'bg-amber-500';
    case '지연': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

/** 건강도 점수에 따른 라벨 */
export const getHealthLabel = (score: number): { label: string; color: string } => {
  if (score >= 80) return { label: '양호', color: 'text-emerald-600' };
  if (score >= 60) return { label: '보통', color: 'text-amber-600' };
  return { label: '주의 필요', color: 'text-red-600' };
};

/** 날짜 포맷 (YYYY-MM-DD → YY.MM.DD) */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
};
