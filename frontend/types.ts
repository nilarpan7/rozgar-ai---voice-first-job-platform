
// Global window extension for Web Speech API and Leaflet
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    L: any; // Leaflet
  }
}

export enum UserRole {
  WORKER = 'WORKER',
  EMPLOYER = 'EMPLOYER',
  GUEST = 'GUEST'
}

export interface RecentSearch {
  text: string;
  role?: string;
  location?: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert';
  isRead: boolean;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  location?: string;
  skills?: string[]; // For workers
  experience?: string; // e.g., "2 years"
  companyName?: string; // For employers
  avatar?: string; // Optional URL or initial
  searchHistory?: RecentSearch[]; // New field for voice search history
  savedJobIds?: string[]; // For bookmarking
  audioResume?: string; // URL/Base64 of recorded audio intro
  notifications?: Notification[];
  isVerified?: boolean; // Identity verification
  badges?: string[]; // Skill badges
}

export type ApplicationStatus = 'PENDING' | 'SEEN' | 'INTERVIEW' | 'HIRED' | 'REJECTED';

export interface Application {
  userId: string;
  userName: string;
  userPhone: string;
  status: ApplicationStatus;
  appliedAt: string;
  userSkills?: string[];
  userExperience?: string;
}

export interface Job {
  id: string;
  title: string;
  location: string;
  wage: number;
  wageType: 'daily' | 'monthly';
  description: string;
  employerId: string;
  employerName: string;
  employerVerified?: boolean; // Trust badge
  postedAt: string; // ISO Date string
  category: string;
  urgent?: boolean;
  distance?: number; // Calculated in km (mock)
  status: 'OPEN' | 'CLOSED';
  applicants: Application[];
  coordinates?: { lat: number, lng: number }; // For map view
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  voiceCode: string; // BCP 47 language tag
}

export interface GeminiParsedIntent {
  role?: string;
  location?: string;
  minWage?: number;
  wageType?: 'daily' | 'monthly';
  intent: 'find_job' | 'post_job' | 'unknown';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingChunks?: any[]; // For Maps Grounding data
}

export interface SkillVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  category: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}
