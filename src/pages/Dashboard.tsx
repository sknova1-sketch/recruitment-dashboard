// === 채용 운영 대시보드 메인 페이지 ===
// 동적 포지션 + 정렬(회사→오픈일→본부→팀) + High Focus Position

import { useState, useMemo, useEffect } from 'react';
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
  const { sortedPositions, favorites, dashboardSearch, setDashboardSearch } = useAdmin();
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  const {
    filter,
    filteredPositions,
    allFilteredPositions,
    setSearch,
    setCompany,
  } = useFilter(sortedPositions);

  // 화면 진입 시 전역 상태에 검색어가 있다면 필터에 복원
  useEffect(() => {
    if (dashboardSearch && filter.search === '') {
      setSearch(dashboardSearch);
    }
  }, []);

  const handleSearch = (v: string) => {
    setSearch(v);
    setDashboardSearch(v); // 전역 스토어에 동시 업데이트
  };

  // KPI는 전체 포지션 기준
  const kpi = useMemo(() => calculateKPI(sortedPositions), [sortedPositions]);
  
  // High Focus 포지션 (즐겨찾기 된 것만)
  const highFocusPositions = useMemo(() => 
    filteredPositions.filter(p => favorites.has(p.id)), 
    [filteredPositions, favorites]
  );

  // 퍼널 차트용 데이터
  const funnelData = useMemo(() => {
    const active = filteredPositions.filter(p => p.is_active && p.current_stage !== '채용완료');
    const order = ['접수', '서류검토', '1차면접', '2차면접', '처우협의', '입사확정'];
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
          onSearch={handleSearch} 
          searchValue={filter.search} 
          currentPage={currentPage}
          onNavigate={onNavigate}
        />
      </div>

      <main className="w-full max-w-[1500px] px-6 pb-10 flex flex-col gap-5">
        {/* Row 1: 환영 메시지 + 빠른 요약 */}
        <section className="fade-in px-2 mt-2 flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-tight">
              채용 현황을 공유해드릴게요
            </h2>
            <p className="text-[12px] text-gray-400 font-medium mt-0.5">
              {(() => {
                const today = new Date();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                return `${today.getFullYear()}년 ${mm}월 ${dd}일 기준`;
              })()}
              &nbsp;·&nbsp;총 <strong className="text-gray-700">{kpi.totalActive}</strong>건 진행
              {kpi.delayedCount > 0 && (
                <> &nbsp;·&nbsp; <span className="text-red-500 font-semibold">⚠ 지연 {kpi.delayedCount}건</span></>
              )}
            </p>
          </div>
        </section>

        {/* Row 2: KPI 카드 */}
        <section className="fade-in" style={{ animationDelay: '0.05s' }}>
          <KPICards 
            kpi={kpi} 
            onCardClick={setCompany}
            selectedCompany={filter.company}
          />
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

        {/* Row 5: 활성 포지션 리스트 (정렬 적용) */}
        <section className="fade-in" style={{ animationDelay: '0.15s' }}>
          <PositionTable
            title="진행 중인 포지션"
            positions={filteredPositions.filter(p => p.current_stage !== '입사확정' && p.current_stage !== '채용완료')}
            onSelectPosition={setSelectedPosition}
          />
        </section>

        {/* Row 6: 채용 완료된 포지션 (완료일/오픈일 기준 정렬) */}
        {allFilteredPositions.some(p => p.current_stage === '입사확정' || p.current_stage === '채용완료') && (
          <section className="fade-in" style={{ animationDelay: '0.2s', marginTop: '10px' }}>
            <PositionTable
              title="채용 완료(Closed)"
              isClosed={true}
              positions={
                allFilteredPositions
                  .filter(p => p.current_stage === '입사확정' || p.current_stage === '채용완료')
                  .sort((a, b) => (b.open_date || '').localeCompare(a.open_date || ''))
              }
              onSelectPosition={setSelectedPosition}
            />
          </section>
        )}

        <br />
        <Footer />
      </main>

      <PositionDetailPanel
        position={selectedPosition}
        onClose={() => setSelectedPosition(null)}
      />
    </div>
  );
}
