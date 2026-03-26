// === 채용 운영 대시보드 메인 페이지 ===
// 동적 포지션 + 정렬(회사→오픈일→본부→팀) + High Focus Position

import { useState, useMemo } from 'react';
import { Position } from '../types';
import { useFilter } from '../hooks/useFilter';
import { calculateKPI } from '../utils/utils';
import { useAdmin } from '../store/adminStore';

import { PageType } from '../App';
import Header from '../components/Header';
import KPICards from '../components/KPICards';
import PositionFunnelChart from '../components/charts/PositionFunnelChart';
import StatusSummaryPanel from '../components/StatusSummaryPanel';
import PositionTable from '../components/PositionTable';
import PositionDetailPanel from '../components/PositionDetailPanel';
import HighFocusPosition from '../components/HighFocusPosition';
import Footer from '../components/Footer';

interface DashboardProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

export default function Dashboard({ currentPage, onNavigate }: DashboardProps) {
  // 정렬된 포지션 사용 (회사→오픈일→본부→팀)
  const { sortedPositions, favorites } = useAdmin();
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  const {
    filter,
    filteredPositions,
    setSearch,
  } = useFilter(sortedPositions);

  // KPI는 전체 포지션 기준
  const kpi = useMemo(() => calculateKPI(sortedPositions), [sortedPositions]);
  
  // High Focus 포지션 (즐겨찾기 된 것만)
  const highFocusPositions = useMemo(() => 
    filteredPositions.filter(p => favorites.has(p.id)), 
    [filteredPositions, favorites]
  );

  // 퍼널 차트용 데이터
  const funnelData = useMemo(() => {
    const active = filteredPositions.filter(p => p.is_active);
    const order = ['접수', '서류검토', '1차면접', '2차면접', '최종면접', '처우협의', '입사확정'];
    return order.map(stage => {
      const stagePos = active.filter(p => p.current_stage === stage);
      const count = stagePos.length;
      const avgDays = count > 0 ? Math.round(stagePos.reduce((sum, p) => sum + p.days_in_stage, 0) / count) : 0;
      return { stage, count, avgDays };
    });
  }, [filteredPositions]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center w-full overflow-x-hidden">
      <div className="w-full max-w-[1500px]">
        <Header 
          onSearch={setSearch} 
          searchValue={filter.search} 
          currentPage={currentPage}
          onNavigate={onNavigate}
        />
      </div>

      <main className="w-full max-w-[1500px] px-6 pb-10 flex flex-col gap-5">
        {/* Row 1: 환영 메시지 */}
        <section className="fade-in px-2 mt-2">
          <h2 className="text-[26px] font-bold text-gray-900 tracking-tight leading-tight">
            안녕하세요, 채용 현황을 공유해드릴게요
          </h2>
          <p className="text-[13px] text-gray-400 font-medium mt-1">
            (Hello, let us share the recruitment status with you.)
          </p>
        </section>

        {/* Row 2: KPI 카드 */}
        <section className="fade-in" style={{ animationDelay: '0.05s' }}>
          <KPICards kpi={kpi} />
        </section>

        {/* Row 3: 퍼널 (2/3) + 사이드패널 (1/3) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="lg:col-span-2">
            <PositionFunnelChart data={funnelData} />
          </div>
          <div className="lg:col-span-1">
            <StatusSummaryPanel totalActive={kpi.totalActive} />
          </div>
        </section>

        {/* Row 4: High Focus Position (즐겨찾기된 것만 표시) */}
        {highFocusPositions.length > 0 && (
          <section className="fade-in" style={{ animationDelay: '0.12s' }}>
            <HighFocusPosition
              positions={highFocusPositions}
              onSelectPosition={setSelectedPosition}
            />
          </section>
        )}

        {/* Row 5: 전체 포지션 리스트 (정렬 적용) */}
        <section className="fade-in" style={{ animationDelay: '0.15s' }}>
          <PositionTable
            positions={filteredPositions}
            onSelectPosition={setSelectedPosition}
          />
          <br />
          <Footer />
        </section>
      </main>

      <PositionDetailPanel
        position={selectedPosition}
        onClose={() => setSelectedPosition(null)}
      />
    </div>
  );
}
