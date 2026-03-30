// === 우측 사이드 패널 ===
// 업그레이드: 채용 건강도 점수 게이지 추가, 정보 밀도 개선

import { useState } from 'react';
import { MessageSquareText, Activity } from 'lucide-react';
import { useAdmin } from '../store/adminStore';
import FeedbackModal from './FeedbackModal';
import { calculateHealthScore, getHealthLabel } from '../utils/utils';

interface StatusSummaryPanelProps {
  totalActive: number;
}

export default function StatusSummaryPanel({ totalActive }: StatusSummaryPanelProps) {
  const { hiringStats, sortedPositions } = useAdmin();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // 신호등 상태 결정 (총 활성 포지션 건수 기준)
  const getStatus = (count: number) => {
    if (count >= 18) {
      return {
        activeIndex: 2,
        message: '일정 지연이 예상되어 시급도가 높은 포지션 위주로 집중할 예정입니다.',
      };
    }
    if (count >= 12) {
      return {
        activeIndex: 1,
        message: '채용 수요가 증가하여 우선순위에 기반한 리소스 배분이 필요합니다.',
      };
    }
    return {
      activeIndex: 0,
      message: '최적의 상태로, 요청하신 포지션의 빠른 합격과 온보딩을 지원합니다.',
    };
  };

  const status = getStatus(totalActive);

  // 건강도 점수 계산
  const healthScore = calculateHealthScore(sortedPositions);
  const { label: healthLabel, color: healthColor } = getHealthLabel(healthScore);

  // 게이지 SVG 파라미터
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - healthScore / 100);
  const gaugeColor =
    healthScore >= 80 ? '#10b981' : healthScore >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <>
      <div className="flex flex-col gap-5 h-full">

        {/* 가로형 신호등 건강도 카드 */}
        <div className="neu-card p-6 flex flex-col justify-between text-left">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-[14px] font-bold text-gray-900 mb-2 tracking-tight">채용 파이프라인 신호등</h4>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[34px] font-black text-gray-900 tracking-tighter leading-none">{totalActive}</span>
                <span className="text-[13px] text-gray-400 font-bold">건 진행 중</span>
              </div>
            </div>

            {/* 신호등 우측 여백 배치 */}
            <div className="flex items-center gap-3 bg-gray-900 px-4 py-2.5 rounded-full border-4 border-gray-800 shadow-inner mt-1">
              <div className={`w-6 h-6 rounded-full transition-all duration-300 ${status.activeIndex === 0 ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)]' : 'border-2 border-emerald-500/30 bg-transparent opacity-40'}`} />
              <div className={`w-6 h-6 rounded-full transition-all duration-300 ${status.activeIndex === 1 ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]' : 'border-2 border-amber-400/30 bg-transparent opacity-40'}`} />
              <div className={`w-6 h-6 rounded-full transition-all duration-300 ${status.activeIndex === 2 ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]' : 'border-2 border-red-500/30 bg-transparent opacity-40'}`} />
            </div>
          </div>

          <p className="text-[12px] text-gray-500 font-medium leading-relaxed mt-1">
            {status.message}
          </p>
        </div>

        {/* 채용 건강도 점수 카드 */}
        <div className="neu-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-gray-400" />
            <h4 className="text-[14px] font-bold text-gray-900 tracking-tight">채용 건강도</h4>
          </div>
          <div className="flex items-center gap-5">
            {/* SVG 게이지 */}
            <div className="relative flex-shrink-0">
              <svg width="90" height="90" className="-rotate-90">
                {/* 배경 트랙 */}
                <circle
                  cx="45"
                  cy="45"
                  r={radius}
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="8"
                />
                {/* 진행 게이지 */}
                <circle
                  cx="45"
                  cy="45"
                  r={radius}
                  fill="none"
                  stroke={gaugeColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[20px] font-black text-gray-900 leading-none">{healthScore}</span>
                <span className="text-[10px] text-gray-400 font-medium">/ 100</span>
              </div>
            </div>
            {/* 설명 */}
            <div>
              <p className={`text-[18px] font-black ${healthColor}`}>{healthLabel}</p>
              <p className="text-[11px] text-gray-400 font-medium mt-1 leading-relaxed">
                정상 포지션 비중 기준으로<br />채용 파이프라인 건강도를<br />산출합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 채용 프로세스 개선 의견 (클릭 시 50% 크기 새 창) */}
        <div
          onClick={() => setFeedbackOpen(true)}
          className="neu-card p-5 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <MessageSquareText className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-gray-900">채용 프로세스 개선 의견</p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">클릭해서 의견을 남겨주세요</p>
          </div>
        </div>

        {/* 26년 채용 현황 카드 */}
        <div className="neu-card p-6 flex-1">
          <h4 className="text-[14px] font-semibold text-gray-900 mb-4">26년 채용 현황</h4>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-gray-400 font-medium border-b border-gray-50">
                <th className="text-left pb-2.5 font-medium"></th>
                <th className="text-center pb-2.5 font-medium">정규직</th>
                <th className="text-center pb-2.5 font-medium">계약직</th>
                <th className="text-center pb-2.5 font-medium">인턴</th>
                <th className="text-center pb-2.5 font-medium text-gray-600">종합</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-50">
                <td className="py-2.5 font-semibold text-gray-700 text-[13px]">GC케어</td>
                <td className="py-2.5 text-center text-gray-600 font-medium">{hiringStats.gcCare.fulltime}</td>
                <td className="py-2.5 text-center text-gray-600 font-medium">{hiringStats.gcCare.contract}</td>
                <td className="py-2.5 text-center text-gray-600 font-medium">{hiringStats.gcCare.intern}</td>
                <td className="py-2.5 text-center text-gray-900 font-bold">{hiringStats.gcCare.total}</td>
              </tr>
              <tr className="border-t border-gray-50">
                <td className="py-2.5 font-semibold text-gray-700 text-[13px]">GC메디아이</td>
                <td className="py-2.5 text-center text-gray-600 font-medium">{hiringStats.gcMediai.fulltime}</td>
                <td className="py-2.5 text-center text-gray-600 font-medium">{hiringStats.gcMediai.contract}</td>
                <td className="py-2.5 text-center text-gray-600 font-medium">{hiringStats.gcMediai.intern}</td>
                <td className="py-2.5 text-center text-gray-900 font-bold">{hiringStats.gcMediai.total}</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="pt-3 pb-1 text-gray-500 text-[12px] font-medium">합계</td>
                <td className="pt-3 pb-1 text-center text-gray-800 font-semibold">{hiringStats.totalFulltime}</td>
                <td className="pt-3 pb-1 text-center text-gray-800 font-semibold">{hiringStats.totalContract}</td>
                <td className="pt-3 pb-1 text-center text-gray-800 font-semibold">{hiringStats.totalIntern}</td>
                <td className="pt-3 pb-1 text-center text-[#E8603C] font-black text-[14px]">{hiringStats.grandTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {/* 피드백 모달 */}
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
