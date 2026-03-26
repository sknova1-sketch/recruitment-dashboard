// === High Focus Position 리스트 ===
// 관리자가 별(★) 표시한 전략적 우선순위 포지션을 별도 섹션에 표시
// 전체 리스트에서 '이동'하는 게 아니라 전체에도 그대로 보임

import { Star, ChevronRight, AlertTriangle, Zap, Shield } from 'lucide-react';
import { Position } from '../types';
import { formatDate } from '../utils/utils';

interface HighFocusPositionProps {
  positions: Position[];
  onSelectPosition: (position: Position) => void;
}

export default function HighFocusPosition({ positions, onSelectPosition }: HighFocusPositionProps) {
  if (positions.length === 0) return null;

  return (
    <div className="neu-card overflow-hidden border-l-4 border-l-amber-400">
      {/* 헤더 */}
      <div className="px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-gray-900 tracking-tight">High Focus Position</h3>
            <p className="text-[12px] text-gray-400 font-medium">전략적 우선순위 직무 · {positions.length}건</p>
          </div>
        </div>

        {/* 설명 토글 */}
        <details className="group">
          <summary className="text-[12px] text-amber-600 font-medium cursor-pointer hover:text-amber-700 transition-colors select-none">
            High Focus Position이란?
          </summary>
          <div className="mt-3 space-y-2.5 text-[12px] text-gray-500 leading-relaxed bg-amber-50/40 rounded-xl p-4">
            <p className="text-[12px] text-gray-600 font-medium">
              단순히 '급한 채용'을 넘어, 전사적 사업 목표 달성과 조직 안정화를 위해 채용팀의 리소스를 최우선으로 결집(Full-stack Support)하는 <strong className="text-gray-900">전략적 우선순위 직무</strong>를 의미합니다.
            </p>
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p><strong className="text-gray-800">Business Critical (사업적 시급성)</strong>: 해당 포지션의 공백이 매출 손실이나 프로젝트 중단 등 사업 운영에 즉각적인 타격을 줄 수 있는 경우.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p><strong className="text-gray-800">Recovery Focus (채용 지연 해결)</strong>: 공고 오픈 후 일정 기간 이상 채용이 지연되어, 현업 팀의 업무 과중이 심각하거나 채용 방식의 전면적인 재검토가 필요한 경우.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p><strong className="text-gray-800">Executive Mandate (전략적 중요도)</strong>: 경영진의 의사결정에 따라 신규 사업 진출이나 조직 개편을 위해 전사적으로 가장 먼저 확보해야 하는 경우.</p>
            </div>
          </div>
        </details>
      </div>

      {/* 리스트 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-amber-50/30 border-b border-gray-100">
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-amber-600 uppercase tracking-wider w-10">★</th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">회사</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">팀/본부</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">포지션명</th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">채용형태</th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">진행단계</th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">오픈일</th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">경과일</th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {positions.map((pos) => (
              <tr
                key={pos.id}
                onClick={() => onSelectPosition(pos)}
                className="hover:bg-amber-50/30 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-4 text-center">
                  <Star className="w-4 h-4 text-amber-400 mx-auto" fill="currentColor" />
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`
                    inline-block px-2.5 py-1 rounded-lg border text-[10px] font-semibold uppercase tracking-tight
                    ${pos.company === 'GC케어' 
                      ? 'border-blue-100 bg-blue-50/50 text-blue-600' 
                      : 'border-gray-200 bg-gray-50/50 text-gray-500'}
                  `}>
                    {pos.company === 'GC케어' ? 'CARE' : 'MEDIAI'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="block font-semibold text-[13px] text-gray-800">{pos.team}</span>
                  <span className="text-gray-400 text-[11px] font-medium mt-0.5 block">{pos.department}</span>
                </td>
                <td className="px-5 py-4 font-semibold text-gray-900 group-hover:text-amber-600 transition-colors text-[14px]">
                  {pos.position_title}
                </td>
                <td className="px-4 py-4 text-center text-gray-500 font-medium text-[13px]">{pos.employment_type}</td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 rounded-lg text-[12px] font-medium text-gray-600">
                    {pos.current_stage}
                  </span>
                </td>
                <td className="px-4 py-4 text-center text-gray-400 font-medium text-[12px]">{formatDate(pos.open_date).replace('2024년 ', '')}</td>
                <td className="px-4 py-4 text-center">
                  <span className={`font-semibold text-[13px] ${pos.total_elapsed_days > pos.target_days ? 'text-red-500' : 'text-gray-900'}`}>{pos.total_elapsed_days}일</span>
                  <span className="text-gray-300 text-[12px] font-medium ml-1">/ {pos.target_days}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg group-hover:bg-amber-500 text-gray-300 group-hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
