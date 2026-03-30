import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Position, Company, StageType, JDStatus } from '../types';
import { supabase } from '../utils/supabase';
import { calculateElapsedDays } from '../utils/utils';
import { positions as initialPositions } from '../data/mockData';

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
  updateHiringStats: (stats: HiringStats) => Promise<void>;
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  positions: Position[];
  addPosition: (pos: Position) => Promise<void>;
  updatePosition: (id: string, pos: Partial<Position>) => Promise<void>;
  deletePosition: (id: string) => Promise<void>;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  sortedPositions: Position[];
  fetchSupabaseData: () => Promise<void>;
  syncWithExcelData: () => Promise<void>; // 엑셀 데이터 강제 동기화 추가
  dashboardSearch: string;
  setDashboardSearch: (s: string) => void;
}

const ADMIN_PASSWORD = '1111';

// 포지션 정렬 로직
function sortPositions(positions: Position[]): Position[] {
  return [...positions].sort((a, b) => {
    if (a.company !== b.company) return a.company.localeCompare(b.company);
    const dateA = a.open_date || '9999-12-31';
    const dateB = b.open_date || '9999-12-31';
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    if (a.department !== b.department) return a.department.localeCompare(b.department);
    return a.team.localeCompare(b.team);
  });
}

// 포지션 데이터를 기반으로 통계 계산
function calculateStatsFromPositions(positions: Position[]): HiringStats {
  const stats: HiringStats = {
    gcCare: { fulltime: 0, contract: 0, intern: 0, total: 0 },
    gcMediai: { fulltime: 0, contract: 0, intern: 0, total: 0 },
    totalFulltime: 0, totalContract: 0, totalIntern: 0, grandTotal: 0,
  };

  positions.forEach(p => {
    if (!p.is_active) return; // 활성 포지션만 통계에 포함
    const companyKey = p.company === 'GC케어' ? 'gcCare' : 'gcMediai';
    const type = p.employment_type === '정규직' ? 'fulltime' : p.employment_type === '계약직' ? 'contract' : 'intern';
    
    stats[companyKey][type] += p.headcount;
    stats[companyKey].total += p.headcount;
    if (type === 'fulltime') stats.totalFulltime += p.headcount;
    if (type === 'contract') stats.totalContract += p.headcount;
    if (type === 'intern') stats.totalIntern += p.headcount;
    stats.grandTotal += p.headcount;
  });

  return stats;
}


export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      hiringStats: calculateStatsFromPositions(initialPositions),
      isAuthenticated: false,
      positions: initialPositions,
      sortedPositions: sortPositions(initialPositions),
      favorites: new Set<string>(),
      dashboardSearch: '',
      setDashboardSearch: (s) => set({ dashboardSearch: s }),

      // Supabase 데이터베이스 패치 
      fetchSupabaseData: async () => {
        try {
          // 1. 포지션 정보 가져오기 (가져올 때 경과일 동적 재계산)
          const { data: posData, error: posError } = await supabase.from('positions').select('*');
          if (posError) throw posError;
          const enhancedPositions = (posData || []).map(p => ({
            ...p,
            total_elapsed_days: calculateElapsedDays(p.open_date, p.completion_date)
          }));

          // 2. 통계 정보 가져오기
          const { data: statData, error: statError } = await supabase.from('hiring_stats').select('settings_json').eq('id', 1).single();
          if (statError && statError.code !== 'PGRST116') throw statError; // PGRST116: no rows

          set({ 
            positions: enhancedPositions.length > 0 ? enhancedPositions : initialPositions, 
            sortedPositions: sortPositions(enhancedPositions.length > 0 ? enhancedPositions : initialPositions),
            hiringStats: statData ? statData.settings_json : (enhancedPositions.length > 0 ? calculateStatsFromPositions(enhancedPositions) : calculateStatsFromPositions(initialPositions))
          });
        } catch (error) {
          console.error("데이터 초기화 중 에러 발생:", error);
        }
      },

      // 엑셀 데이터(initialPositions)를 DB에 강제로 입히는 기능
      syncWithExcelData: async () => {
        try {
          if (!confirm("현재 DB의 모든 포지션 데이터를 엑셀 데이터로 덮어씌우시겠습니까?")) return;
          
          // 1. 기존 데이터 삭제 (ID 기준 혹은 전체 삭제 후 재삽입)
          // 여기서는 단순하게 전체 삭제 후 재삽입 시도
          const { error: delError } = await supabase.from('positions').delete().neq('id', '---'); 
          if (delError) throw delError;

          // 2. 엑셀 데이터 삽입
          const { error: insError } = await supabase.from('positions').insert(initialPositions.map(p => ({
            id: p.id,
            company: p.company,
            team: p.team,
            department: p.department,
            position_title: p.position_title,
            employment_type: p.employment_type,
            headcount: p.headcount,
            current_stage: p.current_stage,
            open_date: p.open_date,
            completion_date: p.completion_date,
            is_active: p.is_active,
            job_family: p.job_family,
            target_days: p.target_days,
            days_in_stage: p.days_in_stage
          })));
          if (insError) throw insError;

          // 3. 통계 데이터도 재계산하여 업서트
          const newStats = calculateStatsFromPositions(initialPositions);
          await supabase.from('hiring_stats').upsert({ id: 1, settings_json: newStats });

          alert("동기화 완료! 페이지를 새로고침 하세요.");
          window.location.reload();
        } catch (error) {
          console.error("동기화 에러:", error);
          alert("동기화 실패: " + (error as any).message);
        }
      },

      updateHiringStats: async (stats) => {
        try {
          // DB 업데이트
          const { error } = await supabase.from('hiring_stats').upsert({ id: 1, settings_json: stats });
          if (error) throw error;
          // Local 업데이트
          set({ hiringStats: stats });
        } catch (error) {
          console.error("통계 업데이트 에러:", error);
          alert("저장 실패!");
        }
      },

      login: (password) => {
        if (password === ADMIN_PASSWORD) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => set({ isAuthenticated: false }),

      addPosition: async (pos) => {
        try {
          const { error } = await supabase.from('positions').insert({
            id: pos.id,
            company: pos.company,
            team: pos.team,
            department: pos.department,
            position_title: pos.position_title,
            employment_type: pos.employment_type,
            headcount: pos.headcount,
            current_stage: pos.current_stage,
            open_date: pos.open_date,
            completion_date: pos.completion_date,
            is_active: pos.is_active,
            job_family: pos.job_family,
            target_days: pos.target_days,
            days_in_stage: pos.days_in_stage
          });
          if (error) throw error;
          
          // 로컬에도 계산된 일수를 즉시 반영
          const posWithDays = { ...pos, total_elapsed_days: calculateElapsedDays(pos.open_date, pos.completion_date) };
          set((state) => {
            const updated = [...state.positions, posWithDays];
            return { positions: updated, sortedPositions: sortPositions(updated) };
          });
        } catch (error) {
           console.error("포지션 추가 에러:", error);
           alert("포지션 추가 실패");
        }
      },

      updatePosition: async (id, partial) => {
         try {
           // DB에 존재하는 실제 컬럼만 필터링해서 업데이트 요청
           const dbColumns = [
             'company', 'team', 'department', 'position_title', 'employment_type', 
             'headcount', 'current_stage', 'open_date', 'completion_date', 'is_active', 
             'job_family', 'target_days', 'days_in_stage'
           ];
           const dbPayload: any = {};
           for (const key of dbColumns) {
             if (key in partial) {
               dbPayload[key] = (partial as any)[key];
             }
           }
           
           const { error } = await supabase.from('positions').update(dbPayload).eq('id', id);
           if (error) throw error;

           set((state) => {
             const updated = state.positions.map(p => {
               if (p.id === id) {
                 const newP = { ...p, ...partial };
                 newP.total_elapsed_days = calculateElapsedDays(newP.open_date, newP.completion_date);
                 return newP;
               }
               return p;
             });
             return { positions: updated, sortedPositions: sortPositions(updated) };
           });
         } catch (error) {
           console.error("포지션 수정 에러:", error);
           alert("포지션 수정 실패");
         }
      },

      deletePosition: async (id) => {
         try {
           const { error } = await supabase.from('positions').delete().eq('id', id);
           if (error) throw error;
           
           set((state) => {
             const updated = state.positions.filter(p => p.id !== id);
             const nextFavorites = new Set(state.favorites);
             nextFavorites.delete(id);
             return {
               positions: updated,
               sortedPositions: sortPositions(updated),
               favorites: nextFavorites
             };
           });
         } catch (error) {
           console.error("포지션 삭제 에러:", error);
           alert("포지션 삭제 실패");
         }
      },

      toggleFavorite: (id) => set((state) => {
        const next = new Set(state.favorites);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return { favorites: next };
      }),
    }),
    {
      name: 'recruitment-admin-storage-v2',
      // 로컬에는 '즐겨찾기' 및 초기 렌더링용 '캐시'만 저장
      partialize: (state) => ({
        favorites: Array.from(state.favorites), 
        hiringStats: state.hiringStats,
        positions: state.positions
      }),
      merge: (persistedState: any, currentState) => {
        const mergedPositions = persistedState?.positions || currentState.positions;
        return {
          ...currentState,
          ...persistedState,
          positions: mergedPositions,
          sortedPositions: sortPositions(mergedPositions),
          favorites: new Set(persistedState?.favorites || []),
        };
      },
    }
  )
);

export const STAGE_ORDER: StageType[] = ['접수', '서류검토', '1차면접', '2차면접', '처우협의', '입사확정', '채용완료'];
export const COMPANIES: Company[] = ['GC케어', 'GC메디아이'];
export const JD_STATUSES: JDStatus[] = ['미작성', '작성중', '검토중', '완료'];
