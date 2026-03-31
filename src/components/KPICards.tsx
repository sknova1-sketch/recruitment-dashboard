// === KPI 카드 컴포넌트 ===
// Antigravity 스타일: 순백 뉴모픽 카드, 가로 배치
// 업그레이드: 지연 건수·평균 경과일·이번달 통계 추가

import { Briefcase, Building2, AlertTriangle, Clock, TrendingUp, CheckCircle2 } from 'lucide-react';
import { KPIData, Company } from '../types';

interface KPICardsProps {
  kpi: KPIData;
  onCardClick?: (company: Company | '전체') => void;
  selectedCompany?: Company | '전체';
}

export default function KPICards({ kpi, onCardClick, selectedCompany = '전체' }: KPICardsProps) {
  const cards = [
    {
      id: '전체' as const,
      label: '전체 채용공고',
      value: kpi.totalActive,
      subLabel: '활성화된 포지션 총계',
      icon: <Briefcase className="w-6 h-6 text-gray-400" />,
      badge: kpi.delayedCount > 0
        ? { text: `지연 ${kpi.delayedCount}건`, color: 'bg-red-50 text-red-500 border border-red-100' }
        : null,
    },
    {
      id: 'GC케어' as const,
      label: 'GC케어',
      value: kpi.gcCareCount,
      subLabel: '활성 채용 중',
      icon: <Building2 className="w-6 h-6 text-gray-400" />,
      badge: null,
    },
    {
      id: 'GC메디아이' as const,
      label: 'GC메디아이',
      value: kpi.gcMediaiCount,
      subLabel: '활성 채용 중',
      icon: <Building2 className="w-6 h-6 text-gray-400" />,
      badge: null,
    },
  ];

  const stats = [
    {
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      label: '지연 포지션',
      value: `${kpi.delayedCount}건`,
      color: kpi.delayedCount > 0 ? 'text-red-500' : 'text-gray-400',
      bg: kpi.delayedCount > 0 ? 'bg-red-50' : 'bg-gray-50',
    },
    {
      icon: <Clock className="w-3.5 h-3.5" />,
      label: '평균 경과일',
      value: `${kpi.avgElapsedDays}일`,
      color: kpi.avgElapsedDays > 30 ? 'text-amber-600' : 'text-emerald-600',
      bg: kpi.avgElapsedDays > 30 ? 'bg-amber-50' : 'bg-emerald-50',
    },
    {
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      label: '이번달 신규',
      value: `${kpi.newThisMonth}건`,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      label: '이번달 완료',
      value: `${kpi.completedThisMonth}건`,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((card, index) => {
          const isSelected = selectedCompany === card.id;
          return (
            <div
              key={card.label}
              onClick={() => onCardClick?.(card.id)}
              className={`neu-card px-7 py-6 flex items-center justify-between fade-in cursor-pointer transition-all duration-300 ${
                isSelected
                  ? 'shadow-[0_0_15px_rgba(139,92,246,0.25)] ring-1 ring-violet-200 bg-white'
                  : 'hover:bg-gray-50/50'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="space-y-1.5">
                <p className={`text-[14px] font-bold tracking-tight transition-colors ${isSelected ? 'text-violet-600' : 'text-gray-900'}`}>
                  {card.label}
                </p>
                <p className="text-[12px] text-gray-400 font-medium">{card.subLabel}</p>
                {card.badge && (
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${card.badge.color}`}>
                    {card.badge.text}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[36px] font-black tracking-tighter leading-none transition-colors ${isSelected ? 'text-violet-600' : 'text-gray-900'}`}>
                  {card.value}
                </span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${isSelected ? 'bg-violet-50 border-violet-100' : 'bg-gray-50 border-gray-100'}`}>
                  {isSelected ? <div className="text-violet-500">{card.icon}</div> : card.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="neu-card px-5 py-3.5 flex items-center gap-3 fade-in">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
               <p className="text-[11px] text-gray-400 font-medium">{stat.label}</p>
               <p className={`text-[15px] font-black leading-tight ${stat.color}`}>{stat.value}</p>
             </div>
           </div>
         ))}
       </div>
    </div>
  );
}
