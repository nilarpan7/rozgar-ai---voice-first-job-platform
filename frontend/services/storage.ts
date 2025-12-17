
// Simulating a database using LocalStorage
import { Job, User, Notification } from '../types';
import { MOCK_JOBS } from '../constants';

const KEYS = {
  USERS: 'rozgar_users',
  JOBS: 'rozgar_jobs',
  CURRENT_USER: 'rozgar_current_user'
};

// Initialize DB with mock data if empty
export const initDB = () => {
  if (!localStorage.getItem(KEYS.JOBS)) {
    localStorage.setItem(KEYS.JOBS, JSON.stringify(MOCK_JOBS));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([]));
  }
};

export const StorageService = {
  getUsers: (): User[] => {
    return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  },

  saveUser: (user: User) => {
    const users = StorageService.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  updateUser: (user: User) => {
    StorageService.saveUser(user);
    StorageService.setCurrentUser(user);
  },

  findUserByPhone: (phone: string): User | undefined => {
    const users = StorageService.getUsers();
    return users.find(u => u.phone === phone);
  },

  getJobs: (): Job[] => {
    return JSON.parse(localStorage.getItem(KEYS.JOBS) || '[]');
  },

  saveJob: (job: Job) => {
    const jobs = StorageService.getJobs();
    jobs.unshift(job); // Add to top
    localStorage.setItem(KEYS.JOBS, JSON.stringify(jobs));
  },

  updateJob: (updatedJob: Job) => {
    const jobs = StorageService.getJobs();
    const index = jobs.findIndex(j => j.id === updatedJob.id);
    if (index !== -1) {
      jobs[index] = updatedJob;
      localStorage.setItem(KEYS.JOBS, JSON.stringify(jobs));
    }
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  // Notification & Bookmark features
  toggleSaveJob: (userId: string, jobId: string): User | null => {
    const users = StorageService.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      const user = users[userIndex];
      const saved = user.savedJobIds || [];
      if (saved.includes(jobId)) {
        user.savedJobIds = saved.filter(id => id !== jobId);
      } else {
        user.savedJobIds = [...saved, jobId];
      }
      users[userIndex] = user;
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      StorageService.setCurrentUser(user);
      return user;
    }
    return null;
  }
};
