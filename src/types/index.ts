export type UserRole = 'student' | 'professional' | 'firm';

export type JobType = 'internship' | 'freelance' | 'fulltime';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
  portfolio: PortfolioProject[];
  premium: boolean;
  createdAt: Date;
}

export interface UserProfile {
  name: string;
  profileImage?: string;
  skills: string[];
  software: string[];
  location: string;
  experience?: number;
  bio?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  type: JobType;
  location: string;
  remote: boolean;
  salary?: number;
  stipend?: number;
  description: string;
  requirements: string[];
  postedBy: string;
  featured: boolean;
  applications: number;
  createdAt: Date;
}

export interface PortfolioProject {
  id: string;
  userId: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  likes: number;
  comments: Comment[];
  createdAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: Date;
}