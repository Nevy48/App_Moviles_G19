export type SubjectStatus = 'pending' | 'in_progress' | 'cursada' | 'approved';

export type DurationType = 'A' | '1' | '2' | 'C'; // Annual, 1st quarter, 2nd quarter, Both

export interface ScheduleDay {
  nombre: string;
  inicio: string;
  fin: string;
}

export interface Commission {
  id: string;
  duration: DurationType;
  dias: ScheduleDay[];
}

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
  tituloIntermedio?: string;
  tituloFinal?: string;
  plan?: string;
}

export interface CareerInfo {
  id: string;
  universidad: string;
  nombre: string;
  plan: string;
  tituloIntermedio?: string;
  tituloFinal?: string;
  creditosTotales: number;
}

export interface CareerData {
  careerInfo: CareerInfo;
  ALL: RawSubject[];
  SUBJECTS: RawSubject[];
  ELECTIVAS: Record<number, RawSubject[]>;
  getSubjectById: (id: string) => RawSubject | undefined;
}

// Raw subject from career data (before transformation to Subject)
export interface RawSubject {
  id: string;
  num?: string;
  name: string;
  hours?: string;
  level: number;
  correlCursada: string[];
  correlAprobada: string[];
  comisiones?: Commission[];
  isElectivePlaceholder?: boolean;
  isSeminario?: boolean;
  isOutdated?: boolean;
  annualHours?: number;
  targetHours?: number;
}

export interface CalendarDay {
  fecha: string;
  motivo: string;
  tipo: 'feriado' | 'finales' | 'paro';
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
  hours?: string;
  correlCursada?: string[];
  correlAprobada?: string[];
  comisiones?: Commission[];
  isElectivePlaceholder?: boolean;
  isSeminario?: boolean;
  isOutdated?: boolean;
  annualHours?: number;
  targetHours?: number;
  level?: number;
  num?: string;
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