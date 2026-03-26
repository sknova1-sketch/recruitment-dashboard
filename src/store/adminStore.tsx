// === 관리자 상태 관리 스토어 (확장: 즐겨찾기+정렬) ===
// 채용현황 + 포지션 CRUD + High Focus 즐겨찾기

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { Position, Company, StageType, JDStatus } from '../types';
import { positions as defaultPositions } from '../data/mockData';

/** 26년 채용 현황 데이터 구조 */
export interface HiringStats {
  gcCare: { fulltime: number; contract: number; intern: number; total: number };
  gcMediai: { fulltime: number; contract: number; intern: number; total: number };
  totalFulltime: number;
  totalContract: number;
  totalIntern: number;
  grandTotal: number;
}

interface AdminState {
  hiringStats: HiringStats;
  updateHiringStats: (stats: HiringStats) => void;
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  positions: Position[];
  addPosition: (pos: Position) => void;
  updatePosition: (id: string, pos: Partial<Position>) => void;
  deletePosition: (id: string) => void;
  // 즐겨찾기 (High Focus Position)
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  // 정렬된 포지션 (회사→오픈일→본부→팀)
  sortedPositions: Position[];
}

const ADMIN_PASSWORD = '1111';

const defaultHiringStats: HiringStats = {
  gcCare: { fulltime: 10, contract: 4, intern: 1, total: 15 },
  gcMediai: { fulltime: 9, contract: 0, intern: 0, total: 9 },
  totalFulltime: 19,
  totalContract: 4,
  totalIntern: 1,
  grandTotal: 24,
};

/** 포지션 정렬: 회사 → 오픈일(내림차순) → 본부 → 팀 */
function sortPositions(positions: Position[]): Position[] {
  return [...positions].sort((a, b) => {
    // 1. 회사 (GC메디아이 → GC케어 순)
    if (a.company !== b.company) return a.company.localeCompare(b.company);
    // 2. 오픈일 (과거순=오름차순, 즉 경과일 내림차순 효과)
    if (a.open_date !== b.open_date) return a.open_date.localeCompare(b.open_date);
    // 3. 본부
    if (a.department !== b.department) return a.department.localeCompare(b.department);
    // 4. 팀
    return a.team.localeCompare(b.team);
  });
}

const AdminContext = createContext<AdminState | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [hiringStats, setHiringStats] = useState<HiringStats>(() => {
    const stored = localStorage.getItem('hiringStats');
    return stored ? JSON.parse(stored) : defaultHiringStats;
  });

  const [positions, setPositions] = useState<Position[]>(() => {
    const stored = localStorage.getItem('positions');
    return stored ? JSON.parse(stored) : defaultPositions;
  });

  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('favorites');
    return stored ? new Set(JSON.parse(stored)) : new Set<string>();
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 정렬된 포지션 (메모이제이션)
  const sortedPositions = useMemo(() => sortPositions(positions), [positions]);

  const updateHiringStats = useCallback((stats: HiringStats) => {
    setHiringStats(stats);
    localStorage.setItem('hiringStats', JSON.stringify(stats));
  }, []);

  const login = useCallback((password: string): boolean => {
    if (password === ADMIN_PASSWORD) { setIsAuthenticated(true); return true; }
    return false;
  }, []);

  const logout = useCallback(() => setIsAuthenticated(false), []);

  const addPosition = useCallback((pos: Position) => {
    setPositions(prev => {
      const updated = [...prev, pos];
      localStorage.setItem('positions', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updatePosition = useCallback((id: string, partial: Partial<Position>) => {
    setPositions(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...partial } : p);
      localStorage.setItem('positions', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deletePosition = useCallback((id: string) => {
    setPositions(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('positions', JSON.stringify(updated));
      return updated;
    });
    // 즐겨찾기에서도 제거
    setFavorites(prev => {
      const next = new Set(prev);
      next.delete(id);
      localStorage.setItem('favorites', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('favorites', JSON.stringify([...next]));
      return next;
    });
  }, []);

  return (
    <AdminContext.Provider value={{
      hiringStats, updateHiringStats,
      isAuthenticated, login, logout,
      positions, sortedPositions, addPosition, updatePosition, deletePosition,
      favorites, toggleFavorite,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminState {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
}

export const STAGE_ORDER: StageType[] = ['접수', '서류검토', '1차면접', '2차면접', '최종면접', '처우협의', '입사확정'];
export const COMPANIES: Company[] = ['GC케어', 'GC메디아이'];
export const JD_STATUSES: JDStatus[] = ['미작성', '작성중', '검토중', '완료'];
