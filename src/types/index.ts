export type SubjectStatus = 'pending' | 'in_progress' | 'approved';

export interface University {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  faculties: Faculty[];
}

export interface Faculty {
  id: string;
  universityId: string;
  name: string;
  shortName?: string;
  careers: Career[];
}

export interface Career {
  id: string;
  facultyId: string;
  universityId: string;
  name: string;
  shortName?: string;
  totalCredits: number;
  totalSubjects: number;
  years: number;
  subjects: Subject[];
}

export interface Subject {
  id: string;
  careerId: string;
  name: string;
  code: string;
  year: number;
  semester: 1 | 2;
  credits: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  professor?: string;
  tags: string[];
  correlatives: string[];
  description?: string;
}

export interface SubjectWithStatus extends Subject {
  status: SubjectStatus;
  userProgress?: UserSubjectProgress;
}

export interface Review {
  id: string;
  subjectId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  professor?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  universityId: string;
  careerId: string;
  createdAt: Date;
}

export interface UserSubjectProgress {
  userId: string;
  subjectId: string;
  status: SubjectStatus;
  approvedDate?: Date;
  grade?: number;
  observations?: string;
}

export interface AcademicProgress {
  userId: string;
  universityId: string;
  careerId: string;
  totalCredits: number;
  completedCredits: number;
  totalSubjects: number;
  completedSubjects: number;
  inProgressSubjects: number;
  pendingSubjects: number;
  percentage: number;
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedUniversity: University | null;
  selectedCareer: Career | null;
}