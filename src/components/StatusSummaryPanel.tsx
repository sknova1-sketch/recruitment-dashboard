// === 우측 사이드 패널 ===
// Antigravity 스타일: 주의 카드 + 채용 프로세스 개선 의견 + 26년 채용 현황

import { useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import { useAdmin } from '../store/adminStore';
import FeedbackModal from './FeedbackModal';

interface StatusSummaryPanelProps {
  totalActive: number;
}

export default function StatusSummaryPanel({ totalActive }: StatusSummaryPanelProps) {
  const { hiringStats } = useAdmin();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // 신호등 상태 결정 (총 활성 포지션 건수 기준)
  const getStatus = (count: number) => {
    if (count >= 18) {
      return { 
        activeIndex: 2, 
        message: '일정 지연이 예상되어 시급도가 높은 포지션 위주로 집중할 예정입니다.' 
      };
    }
    if (count >= 12) {
      return { 
        activeIndex: 1, 
        message: '채용 수요가 증가하여 우선순위에 기반한 리소스 배분이 필요합니다.' 
      };
    }
    return { 
      activeIndex: 0, 
      message: '최적의 상태로, 요청하신 포지션의 빠른 합격과 온보딩을 지원합니다.' 
    };
  };

  const status = getStatus(totalActive);

  return (
    <>
      <div className="flex flex-col gap-5 h-full">

        {/* 가로형 신호등 건강도 카드 */}
        <div className="neu-card p-6 flex flex-col justify-between text-left">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-[14px] font-bold text-gray-900 mb-3 tracking-tight">채용 파이프라인 신호등</h4>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[34px] font-black text-gray-900 tracking-tighter leading-none">{totalActive}</span>
                <span className="text-[13px] text-gray-400 font-bold">건 진행 중</span>
              </div>
            </div>
            
            {/* 신호등 우측 여백 배치 */}
            <div className="flex items-center gap-3 bg-gray-900 px-4 py-2.5 rounded-full border-4 border-gray-800 shadow-inner mt-1">
              <div className={`w-6 h-6 rounded-full transition-all duration-300 ${status.activeIndex === 0 ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)]' : 'border-2 border-dashed border-gray-600 bg-transparent opacity-40'}`} />
              <div className={`w-6 h-6 rounded-full transition-all duration-300 ${status.activeIndex === 1 ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]' : 'border-2 border-dashed border-gray-600 bg-transparent opacity-40'}`} />
              <div className={`w-6 h-6 rounded-full transition-all duration-300 ${status.activeIndex === 2 ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]' : 'border-2 border-dashed border-gray-600 bg-transparent opacity-40'}`} />
            </div>
          </div>
          
          <p className="text-[12.5px] text-gray-500 font-medium leading-relaxed truncate mt-2">
            {status.message}
          </p>
        </div>

        {/* 채용 프로세스 개선 의견 (클릭 시 50% 크기 새 창) */}
        <div 
          onClick={() => setFeedbackOpen(true)}
          className="neu-card p-6 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <MessageSquareText className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-gray-900">채용 프로세스</p>
            <p className="text-[14px] font-semibold text-gray-900">개선 의견</p>
          </div>
        </div>

        {/* 26년 채용 현황 카드 (관리자가 수정 가능한 데이터) */}
        <div className="neu-card p-6 flex-1">
          <h4 className="text-[14px] font-semibold text-gray-900 mb-4">26년 채용 현황</h4>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-gray-400 font-medium">
                <th className="text-left pb-3 font-medium"></th>
                <th className="text-center pb-3 font-medium">정규직</th>
                <th className="text-center pb-3 font-medium">계약직</th>
                <th className="text-center pb-3 font-medium">인턴</th>
                <th className="text-center pb-3 font-medium">종합</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-50">
                <td className="py-2.5 font-semibold text-gray-700 text-[13px]">GC케어</td>
                <td className="py-2.5 text-center text-gray-600 font-medium">{hiringStats.gcCare.fulltime}</td>
                <td className="py-2.5 text-center text-gray-600 font-medium">{hiringStats.gcCare.contract}</td>
                <td className="py-2.5 text-center text-gray-600 font-medium">{hiringStats.gcCare.intern}</td>
                <td className="py-2.5 text-center text-gray-900 font-semibold">{hiringStats.gcCare.total}</td>
              </tr>
              <tr className="border-t border-gray-50">
                <td className="py-2.5 font-semibold text-gray-700 text-[13px]">GC메디아이</td>
                <td className="py-2.5 text-center text-gray-600 font-medium">{hiringStats.gcMediai.fulltime}</td>
                <td className="py-2.5 text-center text-gray-600 font-medium">{hiringStats.gcMediai.contract}</td>
                <td className="py-2.5 text-center text-gray-600 font-medium">{hiringStats.gcMediai.intern}</td>
                <td className="py-2.5 text-center text-gray-900 font-semibold">{hiringStats.gcMediai.total}</td>
              </tr>
              <tr className="border-t border-gray-100 font-semibold">
                <td className="py-2.5 text-gray-900 text-[13px]"></td>
                <td className="py-2.5 text-center text-gray-900">{hiringStats.totalFulltime}</td>
                <td className="py-2.5 text-center text-gray-900">{hiringStats.totalContract}</td>
                <td className="py-2.5 text-center text-gray-900">{hiringStats.totalIntern}</td>
                <td className="py-2.5 text-center text-[#E8603C] font-bold">{hiringStats.grandTotal}</td>
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
