// === 포지션 상세보기 패널 ===
// Antigravity 스타일: 프로세스 진행 상황만 표시
// 요청 #7: Applicants/View Posting/JD아이콘 삭제 → 프로세스 타임라인만

import { X, Building2 } from 'lucide-react';
import { Position } from '../types';
import { formatDate } from '../utils/utils';

interface PositionDetailPanelProps {
  position: Position | null;
  onClose: () => void;
}

export default function PositionDetailPanel({ position, onClose }: PositionDetailPanelProps) {
  if (!position) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* 슬라이드 패널 */}
      <div className={`fixed inset-y-0 right-0 w-[520px] bg-white shadow-2xl z-[60] transform transition-transform duration-500 ease-in-out ${position ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* 헤더 배경 (다크 뉴트럴) */}
          <div className="bg-gray-900 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <Building2 className="w-32 h-32 rotate-12" />
            </div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-all active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex gap-2">
                <span className="px-2.5 py-1.5 bg-white/10 backdrop-blur-md rounded-lg text-[11px] font-bold tracking-widest uppercase border border-white/5">
                  {position.company === 'GC케어' ? 'CARE' : 'MEDIAI'}
                </span>
                <span className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-widest uppercase border ${
                  position.is_active ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                }`}>
                  {position.is_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            </div>

            <div className="relative z-10">
              <h2 className="text-[26px] font-bold tracking-tight mb-2 leading-tight">{position.position_title}</h2>
              <div className="flex items-center gap-3 text-gray-400 font-medium text-[13px]">
                <span className="bg-white/10 px-2 py-0.5 rounded text-gray-200">{position.team}</span>
                <span className="w-1 h-1 rounded-full bg-gray-500" />
                <span>{position.department}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            {/* 채용 진행 프로세스 타임라인 */}
            <section>
              <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-8 border-l-4 border-gray-900 pl-3">Recruitment Progress</h3>
              <div className="space-y-6 relative pl-4">
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100" />
                {['접수', '서류검토', '1차면접', '2차면접', '처우협의', '입사확정', '채용완료'].map((stage, idx) => {
                  const stageOrder = ['접수', '서류검토', '1차면접', '2차면접', '처우협의', '입사확정', '채용완료'];
                  const currentIdx = stageOrder.indexOf(position.current_stage);
                  const isCurrent = position.current_stage === stage;
                  const isPast = currentIdx > idx;
                  
                  return (
                    <div key={stage} className="flex items-center gap-5 relative z-10">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                        isCurrent ? 'bg-[#E8603C] border-orange-200 ring-[5px] ring-orange-50 scale-110' : 
                        isPast ? 'bg-gray-300 border-white shadow-sm' : 'bg-white border-gray-200'
                      }`} />
                      <span className={`text-[15px] font-semibold tracking-tight ${
                        isCurrent ? 'text-[#E8603C]' : isPast ? 'text-gray-500' : 'text-gray-300'
                      }`}>
                        {stage}
                      </span>
                      {isCurrent && (
                        <span className="ml-auto px-3 py-1 bg-[#E8603C] text-white rounded-lg text-[10px] font-bold shadow-lg shadow-orange-300/30 uppercase tracking-widest">현재 단계</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 기본 정보 그리드 */}
            <section className="bg-gray-50 rounded-2xl p-7 space-y-5 border border-gray-100">
              <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                <span className="text-[13px] font-medium text-gray-400">채용 형태</span>
                <span className="text-[14px] font-semibold text-gray-800">{position.employment_type}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                <span className="text-[13px] font-medium text-gray-400">채용 인원</span>
                <span className="text-[14px] font-semibold text-gray-800">{position.headcount} 명</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                <span className="text-[13px] font-medium text-gray-400">포스팅 오픈일</span>
                <span className="text-[14px] font-semibold text-gray-800">{formatDate(position.open_date)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                <span className="text-[13px] font-medium text-gray-400">경과일</span>
                <span className={`text-[14px] font-semibold ${position.total_elapsed_days > position.target_days ? 'text-red-500' : 'text-gray-800'}`}>
                  {position.total_elapsed_days}일 / {position.target_days}일
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[13px] font-medium text-gray-400">현재 단계 경과</span>
                <span className="text-[14px] font-semibold text-gray-800">{position.days_in_stage}일</span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
