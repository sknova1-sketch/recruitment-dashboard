import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Position, Company, StageType, JDStatus } from '../types';
import { supabase } from '../utils/supabase';
import { calculateElapsedDays } from '../utils/utils';

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
  dashboardSearch: string;
  setDashboardSearch: (s: string) => void;
}

const ADMIN_PASSWORD = '1111';

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

const emptyHiringStats: HiringStats = {
  gcCare: { fulltime: 0, contract: 0, intern: 0, total: 0 },
  gcMediai: { fulltime: 0, contract: 0, intern: 0, total: 0 },
  totalFulltime: 0, totalContract: 0, totalIntern: 0, grandTotal: 0,
};

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      hiringStats: emptyHiringStats,
      isAuthenticated: false,
      positions: [],
      sortedPositions: [],
      favorites: new Set<string>(),
      dashboardSearch: '',
      setDashboardSearch: (s) => set({ dashboardSearch: s }),

      fetchSupabaseData: async () => {
        try {
          const { data: posData, error: posError } = await supabase.from('positions').select('*');
          if (posError) throw posError;
          const enhancedPositions = (posData || []).map(p => ({
            ...p,
            total_elapsed_days: calculateElapsedDays(p.open_date, p.completion_date)
          }));
          const { data: statData, error: statError } = await supabase.from('hiring_stats').select('settings_json').eq('id', 1).single();
          if (statError && statError.code !== 'PGRST116') throw statError;
          set({ 
            positions: enhancedPositions, 
            sortedPositions: sortPositions(enhancedPositions),
            hiringStats: statData ? statData.settings_json : emptyHiringStats
          });
        } catch (error) {
          console.error('fetch error:', error);
        }
      },

      updateHiringStats: async (stats) => {
        try {
          const { error } = await supabase.from('hiring_stats').upsert({ id: 1, settings_json: stats });
          if (error) throw error;
          set({ hiringStats: stats });
        } catch (error) {
          console.error('updateHiringStats error:', error);
          alert('save failed');
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
            id: pos.id, company: pos.company, team: pos.team,
            department: pos.department, position_title: pos.position_title,
            employment_type: pos.employment_type, headcount: pos.headcount,
            current_stage: pos.current_stage, open_date: pos.open_date,
            completion_date: pos.completion_date, is_active: pos.is_active,
            job_family: pos.job_family, target_days: pos.target_days,
            days_in_stage: pos.days_in_stage
          });
          if (error) throw error;
          const posWithDays = { ...pos, total_elapsed_days: calculateElapsedDays(pos.open_date, pos.completion_date) };
          set((state) => {
            const updated = [...state.positions, posWithDays];
            return { positions: updated, sortedPositions: sortPositions(updated) };
          });
        } catch (error) {
          console.error('addPosition error:', error);
          alert('add failed');
        }
      },

      updatePosition: async (id, partial) => {
        try {
          const dbColumns = ['company','team','department','position_title','employment_type',
            'headcount','current_stage','open_date','completion_date','is_active',
            'job_family','target_days','days_in_stage'];
          const dbPayload: any = {};
          for (const key of dbColumns) {
            if (key in partial) dbPayload[key] = (partial as any)[key];
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
          console.error('updatePosition error:', error);
          alert('update failed');
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
            return { positions: updated, sortedPositions: sortPositions(updated), favorites: nextFavorites };
          });
        } catch (error) {
          console.error('deletePosition error:', error);
          alert('delete failed');
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
      name: 'recruitment-admin-storage',
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

export const STAGE_ORDER: StageType[] = ['\uC811\uC218','\uC11C\uB958\uAC80\uD1A0','1\uCC28\uBA74\uC811','2\uCC28\uBA74\uC811','\uCC98\uC6B0\uD611\uC758','\uC785\uC0AC\uD655\uC815','\uCC44\uC6A9\uC644\uB8CC'];
export const COMPANIES: Company[] = ['GC\uCF00\uC5B4','GC\uBA54\uB514\uC544\uC774'];
export const JD_STATUSES: JDStatus[] = ['\uBBF8\uC791\uC131','\uC791\uC131\uC911','\uAC80\uD1A0\uC911','\uC644\uB8CC'];
