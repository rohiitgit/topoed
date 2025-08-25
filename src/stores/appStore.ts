import { create } from 'zustand';
import { Job, PortfolioProject } from '../types';
import { getJobs, getFeaturedJobs, JobFilters } from '../services/jobs';

interface AppState {
  jobs: Job[];
  featuredJobs: Job[];
  portfolioProjects: PortfolioProject[];
  loading: boolean;
  jobFilters: JobFilters;
  setJobs: (jobs: Job[]) => void;
  setFeaturedJobs: (jobs: Job[]) => void;
  setPortfolioProjects: (projects: PortfolioProject[]) => void;
  setLoading: (loading: boolean) => void;
  setJobFilters: (filters: JobFilters) => void;
  fetchJobs: () => Promise<void>;
  fetchFeaturedJobs: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  jobs: [],
  featuredJobs: [],
  portfolioProjects: [],
  loading: false,
  jobFilters: {},

  setJobs: (jobs: Job[]) => set({ jobs }),
  setFeaturedJobs: (jobs: Job[]) => set({ featuredJobs: jobs }),
  setPortfolioProjects: (projects: PortfolioProject[]) => set({ portfolioProjects: projects }),
  setLoading: (loading: boolean) => set({ loading }),
  setJobFilters: (filters: JobFilters) => set({ jobFilters: filters }),

  fetchJobs: async () => {
    try {
      set({ loading: true });
      const { jobFilters } = get();
      const jobs = await getJobs(jobFilters);
      set({ jobs });
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchFeaturedJobs: async () => {
    try {
      const featuredJobs = await getFeaturedJobs(3);
      set({ featuredJobs });
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
    }
  },
}));