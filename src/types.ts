// === 채용 운영 대시보드 타입 정의 ===
// 채용 포지션 관련 모든 데이터 구조를 정의합니다.

/** 채용 진행 단계 */
export type StageType =
  | '접수'
  | '서류검토'
  | '1차면접'
  | '2차면접'
  | '처우협의'
  | '입사확정'
  | '채용완료';

/** 채용 상태 플래그 (적정 기간 대비) */
export type StatusFlag = '정상' | '주의' | '지연';

/** 직무기술서 상태 */
export type JDStatus = '미작성' | '작성중' | '검토중' | '완료';

/** 회사 구분 */
export type Company = 'GC케어' | 'GC메디아이';

/** 직군 구분 */
export type JobFamily = '개발' | '기획' | '디자인' | '마케팅' | '영업' | '경영지원' | '연구' | '품질' | '데이터';

/** 업데이트 로그 항목 */
export interface UpdateLog {
  date: string;
  content: string;
  author: string;
}

/** 채용 포지션 데이터 */
export interface Position {
  id: string;
  company: Company;
  department: string;
  team: string;
  position_title: string;
  job_family: JobFamily;
  employment_type: '정규직' | '계약직';
  headcount: number;
  hiring_manager: string;
  request_date: string;
  open_date: string;
  completion_date?: string | null;
  current_stage: StageType;
  days_in_stage: number;
  total_elapsed_days: number;
  target_days: number;
  status_flag: StatusFlag;
  applicant_count: number;
  interview_count: number;
  offer_count: number;
  jd_status: JDStatus;
  posting_url: string;
  jd_url: string;
  is_active: boolean;
  update_logs: UpdateLog[];
}

/** KPI 데이터 */
export interface KPIData {
  totalActive: number;
  gcCareCount: number;
  gcMediaiCount: number;
  avgElapsedDays: number;
  delayedCount: number;
  newThisMonth: number;
  completedThisMonth: number;
}

/** 필터 상태 */
export interface FilterState {
  company: Company | '전체';
  stage: StageType | '전체';
  status: StatusFlag | '전체';
  search: string;
}

/** 차트용 단계별 분포 데이터 */
export interface StageDistribution {
  stage: StageType;
  count: number;
  gcCare: number;
  gcMediai: number;
}

/** 차트용 소요기간 데이터 */
export interface DurationData {
  name: string;
  avgDays: number;
  targetDays: number;
}
