// === 포지션 리스트 테이블 ===
// 요청 #7: JD 열 삭제
// 요청 #3: 지원자·인터뷰·공고링크 이미 삭제됨

import { ChevronRight, Users } from 'lucide-react';
import { Position } from '../types';
import { formatDate } from '../utils/utils';

interface PositionTableProps {
  positions: Position[];
  onSelectPosition: (position: Position) => void;
}

export default function PositionTable({ positions, onSelectPosition }: PositionTableProps) {
  return (
    <div className="neu-card overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <br />
          <h3 className="text-[16px] font-bold text-gray-900 tracking-tight">포지션 리스트</h3>
          <p className="text-[13px] text-gray-400 font-medium mt-1">
            총 <span className="text-[#E8603C] font-semibold">{positions.length}</span>건의 활성 채용 공고
          </p>
        </div>
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
              <th className="text-center px-4 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {positions.map((pos) => (
              <tr
                key={pos.id}
                onClick={() => onSelectPosition(pos)}
                className="hover:bg-gray-50/60 cursor-pointer transition-colors group"
              >
                {/* 회사 */}
                <td className="px-5 py-5 text-center">
                  <span className={`
                    inline-block px-2.5 py-1 rounded-lg border text-[10px] font-semibold uppercase tracking-tight
                    ${pos.company === 'GC케어' 
                      ? 'border-blue-100 bg-blue-50/50 text-blue-600' 
                      : 'border-gray-200 bg-gray-50/50 text-gray-500'}
                  `}>
                    {pos.company === 'GC케어' ? 'CARE' : 'MEDIAI'}
                  </span>
                </td>

                {/* 팀/본부 */}
                <td className="px-5 py-5">
                  <span className="block font-semibold text-[13px] text-gray-800">{pos.team}</span>
                  <span className="text-gray-400 text-[11px] font-medium mt-0.5 block">{pos.department}</span>
                </td>

                {/* 포지션명 */}
                <td className="px-5 py-5 font-semibold text-gray-900 group-hover:text-[#E8603C] transition-colors text-[14px]">
                  {pos.position_title}
                </td>

                {/* 채용형태 */}
                <td className="px-4 py-5 text-center text-gray-500 font-medium text-[13px]">{pos.employment_type}</td>

                {/* 인원 */}
                <td className="px-4 py-5 text-center text-gray-900 font-semibold">{pos.headcount}</td>

                {/* 현재 단계 */}
                <td className="px-4 py-5 text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 ${pos.current_stage === '1차면접' ? 'bg-orange-50 text-orange-600' : pos.current_stage === '2차면접' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'} rounded-lg text-[12px] font-medium`}>
                    {pos.current_stage}
                  </span>
                </td>

                {/* 오픈일 */}
                <td className="px-4 py-5 text-center text-gray-400 font-medium text-[12px]">{formatDate(pos.open_date).replace('2024년 ', '')}</td>

                {/* 경과일 */}
                <td className="px-4 py-5 text-center">
                  <span className={`font-semibold text-[13px] ${pos.total_elapsed_days > pos.target_days ? 'text-red-500' : 'text-gray-900'}`}>{pos.total_elapsed_days}일</span>
                  <span className="text-gray-300 text-[12px] font-medium ml-1">/ {pos.target_days}</span>
                </td>

                {/* 상세보기 */}
                <td className="px-4 py-5 text-center">
                  <button
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg group-hover:bg-[#E8603C] text-gray-300 group-hover:text-white transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}

            {positions.length === 0 && (
              <tr>
                <td colSpan={9} className="px-8 py-24 text-center bg-gray-50/30">
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
