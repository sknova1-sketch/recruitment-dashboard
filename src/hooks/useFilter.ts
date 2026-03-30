import { useState, useMemo, useCallback } from 'react';
import { Position, FilterState, Company, StageType, StatusFlag } from '../types';
import { getActivePositions } from '../utils/utils';

const initialFilter: FilterState = {
  company: '\uC804\uCCB4',
  stage: '\uC804\uCCB4',
  status: '\uC804\uCCB4',
  search: '',
};

export const useFilter = (allPositions: Position[]) => {
  const [filter, setFilter] = useState<FilterState>(initialFilter);
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  const allFilteredPositions = useMemo(() => {
    let result = allPositions;
    if (filter.company !== '\uC804\uCCB4') {
      result = result.filter(p => p.company === filter.company);
    }
    if (filter.stage !== '\uC804\uCCB4') {
      result = result.filter(p => p.current_stage === filter.stage);
    }
    if (filter.status !== '\uC804\uCCB4') {
      result = result.filter(p => p.status_flag === filter.status);
    }
    if (filter.search.trim()) {
      const keyword = filter.search.toLowerCase();
      result = result.filter(p =>
        (p.position_title || '').toLowerCase().includes(keyword) ||
        (p.department || '').toLowerCase().includes(keyword) ||
        (p.team || '').toLowerCase().includes(keyword)
      );
    }
    return result;
  }, [allPositions, filter]);

  const filteredPositions = useMemo(() => {
    return getActivePositions(allFilteredPositions);
  }, [allFilteredPositions]);

  const setCompany = useCallback((company: Company | '\uC804\uCCB4') => {
    setFilter(prev => ({ ...prev, company }));
  }, []);

  const setStage = useCallback((stage: StageType | '\uC804\uCCB4') => {
    setFilter(prev => ({ ...prev, stage }));
  }, []);

  const setStatus = useCallback((status: StatusFlag | '\uC804\uCCB4') => {
    setFilter(prev => ({ ...prev, status }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilter(prev => ({ ...prev, search }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter(initialFilter);
  }, []);

  return {
    filter,
    filteredPositions,
    allFilteredPositions,
    showOnlyActive,
    setShowOnlyActive,
    setCompany,
    setStage,
    setStatus,
    setSearch,
    resetFilter,
  };
};
