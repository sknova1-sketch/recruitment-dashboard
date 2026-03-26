// === 필터 바 컴포넌트 ===
// BCG/맥킨지 스타일: 넉넉한 패딩, 세련된 드롭다운

import { Filter, RotateCcw } from 'lucide-react';
import { Company, StageType, StatusFlag } from '../types';
import { STAGE_ORDER } from '../utils/utils';

interface FilterBarProps {
  company: Company | '전체';
  stage: StageType | '전체';
  status: StatusFlag | '전체';
  onCompanyChange: (v: Company | '전체') => void;
  onStageChange: (v: StageType | '전체') => void;
  onStatusChange: (v: StatusFlag | '전체') => void;
  onReset: () => void;
  activeFilterCount: number;
}

export default function FilterBar({
  company,
  stage,
  status,
  onCompanyChange,
  onStageChange,
  onStatusChange,
  onReset,
  activeFilterCount,
}: FilterBarProps) {
  const stageOptions: (StageType | '전체')[] = ['전체', ...STAGE_ORDER.filter(s => s !== '채용완료')];

  return (
    <div className="bg-white rounded-3xl px-10 py-6 shadow-sm border border-slate-100/80 flex flex-wrap items-center gap-5">
      <div className="flex items-center gap-3 text-slate-400">
        <Filter className="w-5 h-5" />
        <span className="text-sm font-bold uppercase tracking-widest leading-none mt-0.5">Filter</span>
        {activeFilterCount > 0 && (
          <span className="px-2.5 py-1 bg-indigo-500 text-white text-[11px] rounded-lg font-bold shadow-sm shadow-indigo-500/20">
            {activeFilterCount}
          </span>
        )}
      </div>

      <div className="h-6 w-px bg-slate-100" />

      {/* 회사 필터 */}
      <div className="relative group">
        <select
          value={company}
          onChange={(e) => onCompanyChange(e.target.value as Company | '전체')}
          className="appearance-none px-6 py-3.5 bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer min-w-[140px]"
        >
          <option value="전체">전체 회사</option>
          <option value="GC케어">GC케어</option>
          <option value="GC메디아이">GC메디아이</option>
        </select>
      </div>

      {/* 진행 단계 필터 */}
      <div className="relative group">
        <select
          value={stage}
          onChange={(e) => onStageChange(e.target.value as StageType | '전체')}
          className="appearance-none px-6 py-3.5 bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer min-w-[140px]"
        >
          {stageOptions.map(s => (
            <option key={s} value={s}>{s === '전체' ? '전체 단계' : s}</option>
          ))}
        </select>
      </div>

      {/* 지연 여부 필터 */}
      <div className="relative group">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as StatusFlag | '전체')}
          className="appearance-none px-6 py-3.5 bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer min-w-[140px]"
        >
          <option value="전체">전체 상태</option>
          <option value="정상">정상</option>
          <option value="주의">주의</option>
          <option value="지연">지연</option>
        </select>
      </div>

      {/* 필터 초기화 */}
      {activeFilterCount > 0 && (
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3.5 text-sm font-black text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all ml-auto group"
        >
          <RotateCcw className="w-4 h-4 group-hover:rotate-[-180deg] transition-transform duration-500" />
          <span>초기화</span>
        </button>
      )}
    </div>
  );
}
