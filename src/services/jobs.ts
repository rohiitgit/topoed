import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { firestore, auth } from './firebase';
import { Job, JobType } from '../types';

export interface JobFilters {
  type?: JobType[];
  location?: string;
  remote?: boolean;
  search?: string;
}

export const createJob = async (jobData: Omit<Job, 'id' | 'createdAt' | 'applications'>): Promise<string> => {
  try {
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to post jobs');
    }

    const newJob = {
      ...jobData,
      postedBy: auth.currentUser.uid,
      applications: 0,
      createdAt: Timestamp.now(),
    };

    console.log('Creating job:', newJob);
    const docRef = await addDoc(collection(firestore, 'jobs'), newJob);
    console.log('Job created with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

export const getJobs = async (filters?: JobFilters): Promise<Job[]> => {
  try {
    console.log('Fetching jobs with filters:', filters);
    
    let q = query(collection(firestore, 'jobs'), orderBy('createdAt', 'desc'));

    // Apply filters
    if (filters?.type && filters.type.length > 0) {
      q = query(q, where('type', 'in', filters.type));
    }

    if (filters?.remote !== undefined) {
      q = query(q, where('remote', '==', filters.remote));
    }

    const querySnapshot = await getDocs(q);
    const jobs: Job[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      jobs.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Job);
    });

    // Apply text search filter (client-side for now)
    let filteredJobs = jobs;
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredJobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply location filter (client-side)
    if (filters?.location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    console.log(`Found ${filteredJobs.length} jobs`);
    return filteredJobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

export const getFeaturedJobs = async (limitCount: number = 5): Promise<Job[]> => {
  try {
    const q = query(
      collection(firestore, 'jobs'),
      where('featured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const jobs: Job[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      jobs.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Job);
    });

    return jobs;
  } catch (error) {
    console.error('Error fetching featured jobs:', error);
    return [];
  }
};

export const getJobById = async (jobId: string): Promise<Job | null> => {
  try {
    const jobDoc = await getDoc(doc(firestore, 'jobs', jobId));
    
    if (jobDoc.exists()) {
      const data = jobDoc.data();
      return {
        id: jobDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Job;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching job:', error);
    throw error;
  }
};

export const applyToJob = async (jobId: string): Promise<void> => {
  try {
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to apply');
    }

    console.log('Applying to job:', jobId);
    
    // Increment application count
    await updateDoc(doc(firestore, 'jobs', jobId), {
      applications: increment(1)
    });

    // TODO: Store application record in separate collection
    // This will be implemented when we add the application tracking system

    console.log('Job application successful');
  } catch (error) {
    console.error('Error applying to job:', error);
    throw error;
  }
};

// Sample jobs for testing - we'll remove this later
export const createSampleJobs = async (): Promise<void> => {
  const sampleJobs = [
    {
      title: "Junior Architect",
      company: "Design Studio Pro",
      type: "fulltime" as JobType,
      location: "Mumbai",
      remote: false,
      salary: 450000,
      description: "Looking for a creative junior architect to join our team. Experience with AutoCAD, SketchUp, and Revit preferred.",
      requirements: ["AutoCAD", "SketchUp", "2+ years experience", "Bachelor's in Architecture"],
      featured: true
    },
    {
      title: "Freelance 3D Visualization Artist",
      company: "Urban Planners Inc",
      type: "freelance" as JobType,
      location: "Delhi",
      remote: true,
      stipend: 25000,
      description: "Need experienced 3D artist for residential project visualizations. Must be proficient in 3ds Max and V-Ray.",
      requirements: ["3ds Max", "V-Ray", "Portfolio required", "Freelancer"],
      featured: false
    },
    {
      title: "Architecture Intern",
      company: "Green Building Solutions",
      type: "internship" as JobType,
      location: "Bangalore",
      remote: false,
      stipend: 15000,
      description: "Internship opportunity for architecture students. Learn sustainable design practices and green building certification.",
      requirements: ["Architecture student", "CAD knowledge", "Eager to learn", "6-month commitment"],
      featured: true
    }
  ];

  for (const job of sampleJobs) {
    try {
      await createJob(job);
    } catch (error) {
      console.log('Sample job might already exist');
    }
  }
};