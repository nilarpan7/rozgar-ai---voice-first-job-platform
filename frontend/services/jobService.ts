
import { Job, User, ApplicationStatus } from '../types';
import { StorageService, initDB } from './storage';

// Ensure DB is initialized
initDB();

export const getJobs = async (filter?: { role?: string; location?: string }): Promise<Job[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  let results = StorageService.getJobs();

  if (filter) {
    if (filter.role) {
      const term = filter.role.toLowerCase();
      results = results.filter(j => 
        j.title.toLowerCase().includes(term) || 
        j.category.toLowerCase().includes(term) ||
        j.description.toLowerCase().includes(term)
      );
    }
    if (filter.location) {
      const loc = filter.location.toLowerCase();
      results = results.filter(j => 
        j.location.toLowerCase().includes(loc)
      );
    }
  }

  // Sort: Urgent first, then by date
  return results.sort((a, b) => {
    if (a.urgent && !b.urgent) return -1;
    if (!a.urgent && b.urgent) return 1;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });
};

export const getMyJobs = async (employerId: string): Promise<Job[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return StorageService.getJobs().filter(j => j.employerId === employerId);
};

export const getAppliedJobs = async (userId: string): Promise<Job[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return StorageService.getJobs().filter(j => j.applicants.some(a => a.userId === userId));
};

export const postJob = async (jobData: Omit<Job, 'id' | 'postedAt' | 'distance' | 'status' | 'applicants'>): Promise<Job> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newJob: Job = {
    ...jobData,
    id: Math.random().toString(36).substr(2, 9),
    postedAt: new Date().toISOString(),
    distance: Math.floor(Math.random() * 10) / 10, // Mock distance 0-10km
    status: 'OPEN',
    applicants: []
  };
  
  StorageService.saveJob(newJob);
  return newJob;
};

export const applyToJob = async (jobId: string, user: User): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const jobs = StorageService.getJobs();
    const job = jobs.find(j => j.id === jobId);
    
    if (job) {
        // Check if already applied
        const exists = job.applicants.some(a => a.userId === user.id);
        if (!exists) {
            job.applicants.push({
                userId: user.id,
                userName: user.name,
                userPhone: user.phone,
                status: 'PENDING',
                appliedAt: new Date().toISOString(),
                userSkills: user.skills,
                userExperience: user.experience
            });
            StorageService.updateJob(job);
        }
    }
};

export const updateApplicationStatus = async (jobId: string, userId: string, status: ApplicationStatus): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const jobs = StorageService.getJobs();
    const job = jobs.find(j => j.id === jobId);
    
    if (job) {
        const applicant = job.applicants.find(a => a.userId === userId);
        if (applicant) {
            applicant.status = status;
            StorageService.updateJob(job);
        }
    }
};

export const updateUserProfile = async (user: User): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    StorageService.updateUser(user);
    return user;
};
