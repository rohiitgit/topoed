import { createSampleJobs } from '../services/jobs';

export const initializeSampleData = async () => {
  try {
    console.log('Initializing sample data...');
    await createSampleJobs();
    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};