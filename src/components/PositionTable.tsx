// === 포지션 리스트 테이블 ===
// 업그레이드: 상태별 행 색상 코딩, 상태 배지, 단계 진행 바 추가

import { ChevronRight, Users } from 'lucide-react';
import { Position } from '../types';
import { formatDate } from '../utils/utils';

const STAGE_ORDER_LIST = ['접수', '서류검토', '1차면접', '2차면접', '처우협의', '입사확정', '채용완료'];
const getStageProgress = (stage: string) => {
  const idx = STAGE_ORDER_LIST.indexOf(stage);
  return idx < 0 ? 0 : Math.round((idx / (STAGE_ORDER_LIST.length - 1)) * 100);
};

const getStageStyle = (stage: string, isClosed: boolean) => {
  if (isClosed) return 'bg-emerald-50 text-emerald-600';
  switch (stage) {
    case '접수': return 'bg-gray-100 text-gray-600';
    case '서류검토': return 'bg-sky-50 text-sky-600';
    case '1차면접': return 'bg-orange-50 text-orange-600';
    case '2차면접': return 'bg-blue-50 text-blue-600';
    case '처우협의': return 'bg-violet-50 text-violet-600';
    case '입사확정': return 'bg-emerald-50 text-emerald-600';
    case '채용완료': return 'bg-emerald-100 text-emerald-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const getProgressBarColor = (stage: string) => {
  switch (stage) {
    case '접수': return 'bg-gray-400';
    case '서류검토': return 'bg-sky-400';
    case '1차면접': return 'bg-orange-400';
    case '2차면접': return 'bg-blue-500';
    case '처우협의': return 'bg-violet-500';
    case '입사확정': return 'bg-emerald-500';
    case '채용완료': return 'bg-emerald-600';
    default: return 'bg-gray-400';
  }
};

const getStatusBadgeStyle = (flag: string) => {
  switch (flag) {
    case '지연': return 'bg-red-50 text-red-500 border border-red-100';
    case '주의': return 'bg-amber-50 text-amber-600 border border-amber-100';
    case '정상': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    default: return 'bg-gray-100 text-gray-500';
  }
};

const getRowBg = (flag: string, isClosed: boolean) => {
  if (isClosed) return 'bg-gray-50/50 hover:bg-gray-100/50 opacity-80';
  switch (flag) {
    case '지연': return 'hover:bg-red-50/40';
    case '주의': return 'hover:bg-amber-50/40';
    default: return 'hover:bg-gray-50/60';
  }
};

interface PositionTableProps {
  title?: string;
  subtitle?: React.ReactNode;
  positions: Position[];
  onSelectPosition: (position: Position) => void;
  isClosed?: boolean;
}

export default function PositionTable({ title = '포지션 리스트', subtitle, positions, onSelectPosition, isClosed = false }: PositionTableProps) {
  return (
    <div className="neu-card overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <br />
          <h3 className={`text-[16px] font-bold ${isClosed ? 'text-gray-500' : 'text-gray-900'} tracking-tight`}>{title}</h3>
          <p className="text-[13px] text-gray-400 font-medium mt-1">
            {subtitle || (
              <>
                총 <span className={`font-semibold ${isClosed ? 'text-gray-600' : 'text-[#E8603C]'}`}>{positions.length}</span>건의 포지션
              </>
            )}
          </p>
        </div>
        {!isClosed && positions.length > 0 && (
          <div className="flex items-center gap-3 text-[11px] font-medium text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />정상</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />주의</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />지연</span>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="text-center px-5 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">회사</th>
              <th className="text-left px-5 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">팀/본부</th>
              <th className="text-left px-5 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">포지션명</th>
              <th className="text-center px-4 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">채용형태</th>
              <th className="text-center px-4 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">인원</th>
              <th className="text-center px-4 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">진행단계</th>
              <th className="text-center px-4 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">오픈일</th>
              <th className="text-center px-4 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">경과일</th>
              {!isClosed && <th className="text-center px-4 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">상태</th>}
              <th className="text-center px-4 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {positions.map((pos) => {
              const progress = getStageProgress(pos.current_stage);
              const rowBg = getRowBg(pos.status_flag, isClosed);
              const stageStyle = getStageStyle(pos.current_stage, isClosed);
              const progressColor = getProgressBarColor(pos.current_stage);
              return (
                <tr key={pos.id} onClick={() => onSelectPosition(pos)} className={`cursor-pointer transition-colors group ${rowBg}`}>
                  <td className="px-5 py-5 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-lg border text-[10px] font-semibold uppercase tracking-tight ${pos.company === 'GC케어' ? (isClosed ? 'border-gray-200 bg-gray-100 text-gray-500' : 'border-blue-100 bg-blue-50/50 text-blue-600') : (isClosed ? 'border-gray-200 bg-gray-100 text-gray-500' : 'border-gray-200 bg-gray-50/50 text-gray-500')}`}>
                      {pos.company === 'GC케어' ? 'CARE' : 'MEDIAI'}
                    </span>
                  </td>
                  <td className="px-5 py-5">
                    <span className="block font-semibold text-[13px] text-gray-800">{pos.team}</span>
                    <span className="text-gray-400 text-[11px] font-medium mt-0.5 block">{pos.department}</span>
                  </td>
                  <td className={`px-5 py-5 font-semibold transition-colors text-[14px] ${isClosed ? 'text-gray-600' : 'text-gray-900 group-hover:text-[#E8603C]'}`}>
                    {pos.position_title}
                  </td>
                  <td className="px-4 py-5 text-center text-gray-500 font-medium text-[13px]">{pos.employment_type}</td>
                  <td className={`px-4 py-5 text-center font-semibold ${isClosed ? 'text-gray-500' : 'text-gray-900'}`}>{pos.headcount}</td>
                  <td className="px-4 py-5 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-medium ${stageStyle}`}>{pos.current_stage}</span>
                      {!isClosed && (
                        <div className="w-full max-w-[80px] h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${progressColor}`} style={{ width: `${progress}%` }} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-5 text-center text-gray-400 font-medium text-[12px]">{formatDate(pos.open_date).replace('2024년 ', '')}</td>
                  <td className="px-4 py-5 text-center">
                    <span className={`font-semibold text-[13px] ${isClosed ? 'text-gray-400' : pos.total_elapsed_days > pos.target_days ? 'text-red-500' : 'text-gray-900'}`}>{pos.total_elapsed_days}일</span>
                    {!isClosed && <span className="text-gray-300 text-[12px] font-medium ml-1">/ {pos.target_days}</span>}
                  </td>
                  {!isClosed && (
                    <td className="px-4 py-5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${getStatusBadgeStyle(pos.status_flag)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pos.status_flag === '지연' ? 'bg-red-400' : pos.status_flag === '주의' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        {pos.status_flag}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-5 text-center">
                    <button className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all ${isClosed ? 'text-gray-300 group-hover:bg-gray-200 group-hover:text-gray-500' : 'group-hover:bg-[#E8603C] text-gray-300 group-hover:text-white'}`}>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {positions.length === 0 && (
              <tr>
                <td colSpan={10} className="px-8 py-24 text-center bg-gray-50/30">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="text-gray-800 font-semibold text-[15px]">조건에 일치하는 포지션이 없습니다</p>
                  <p className="text-gray-400 font-medium text-[13px] mt-1">필터 설정을 변경하여 다시 검색해주세요.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
