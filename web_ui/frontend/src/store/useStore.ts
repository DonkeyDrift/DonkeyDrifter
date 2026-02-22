import { create } from 'zustand';

interface TubRecord {
  _index: number;
  _timestamp_ms: number;
  [key: string]: unknown;
}

interface AppState {
  config: Record<string, unknown> | null;
  configPath: string;
  tubPath: string;
  originalRecords: TubRecord[];
  records: TubRecord[];
  totalRecords: number;
  currentIndex: number;
  fields: string[];
  isLoading: boolean;
  isDragging: boolean;
  error: string | null;

  setConfig: (config: Record<string, unknown>, path: string) => void;
  setTub: (path: string, records: TubRecord[], fields: string[]) => void;
  setRecords: (records: TubRecord[]) => void;
  setAllRecords: (records: TubRecord[]) => void;
  setCurrentIndex: (index: number | ((prev: number) => number)) => void;
  setIsDragging: (isDragging: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  config: null,
  configPath: '/home/dkc/projects/mycar', // Default default
  tubPath: '/home/dkc/projects/mycar/data', // Default default
  originalRecords: [],
  records: [],
  totalRecords: 0,
  currentIndex: 0,
  fields: [],
  isLoading: false,
  isDragging: false,
  error: null,

  setConfig: (config, path) => set({ config, configPath: path }),
  setTub: (path, records, fields) =>
    set({
      tubPath: path,
      records,
      originalRecords: records,
      totalRecords: records.length,
      fields,
      currentIndex: 0,
    }),
  setRecords: (records) => set({ records, totalRecords: records.length }),
  setAllRecords: (records) =>
    set({
      records,
      originalRecords: records,
      totalRecords: records.length,
      currentIndex: 0,
    }),
  setCurrentIndex: (index) =>
    set((state) => ({
      currentIndex: typeof index === 'function' ? index(state.currentIndex) : index,
    })),
  setIsDragging: (isDragging) => set({ isDragging }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
