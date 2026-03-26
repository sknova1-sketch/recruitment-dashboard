// === 필터 커스텀 훅 ===
// 회사별/단계별/상태별/검색어 기반 포지션 필터링 로직

import { useState, useMemo, useCallback } from 'react';
import { Position, FilterState, Company, StageType, StatusFlag } from '../types';
import { getActivePositions } from '../utils/utils';

/** 필터 초기 상태 */
const initialFilter: FilterState = {
  company: '전체',
  stage: '전체',
  status: '전체',
  search: '',
};

/**
 * 포지션 필터링을 위한 커스텀 훅
 *
 * @param allPositions - 전체 포지션 데이터
 * @returns 필터 상태, 필터링된 포지션, 필터 변경 핸들러
 *
 * 왜 useMemo를 쓰는가?
 * - 25건 이상의 데이터를 매 렌더링마다 필터링하면 불필요한 연산이 발생
 * - useMemo로 필터 조건이 변경될 때만 재계산되도록 최적화
 */
export const useFilter = (allPositions: Position[]) => {
  const [filter, setFilter] = useState<FilterState>(initialFilter);
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  // 필터링된 포지션 목록
  const filteredPositions = useMemo(() => {
    let result = showOnlyActive ? getActivePositions(allPositions) : allPositions;

    // 회사 필터
    if (filter.company !== '전체') {
      result = result.filter(p => p.company === filter.company);
    }

    // 단계 필터
    if (filter.stage !== '전체') {
      result = result.filter(p => p.current_stage === filter.stage);
    }

    // 상태 필터
    if (filter.status !== '전체') {
      result = result.filter(p => p.status_flag === filter.status);
    }

    // 검색어 필터 (포지션명, 부서, 채용담당자 대상)
    if (filter.search.trim()) {
      const keyword = filter.search.toLowerCase();
      result = result.filter(p =>
        p.position_title.toLowerCase().includes(keyword) ||
        p.department.toLowerCase().includes(keyword) ||
        p.team.toLowerCase().includes(keyword) ||
        p.hiring_manager.toLowerCase().includes(keyword)
      );
    }

    return result;
  }, [allPositions, filter, showOnlyActive]);

  // 개별 필터 변경 핸들러
  const setCompany = useCallback((company: Company | '전체') => {
    setFilter(prev => ({ ...prev, company }));
  }, []);

  const setStage = useCallback((stage: StageType | '전체') => {
    setFilter(prev => ({ ...prev, stage }));
  }, []);

  const setStatus = useCallback((status: StatusFlag | '전체') => {
    setFilter(prev => ({ ...prev, status }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilter(prev => ({ ...prev, search }));
  }, []);

  // 필터 초기화
  const resetFilter = useCallback(() => {
    setFilter(initialFilter);
  }, []);

  return {
    filter,
    filteredPositions,
    showOnlyActive,
    setShowOnlyActive,
    setCompany,
    setStage,
    setStatus,
    setSearch,
    resetFilter,
  };
};
