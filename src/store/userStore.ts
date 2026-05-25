import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, University, Career, Subject, SubjectStatus } from '@/types';
import { mockUniversities, mockFaculties, mockUser, mockUserProgress } from '@/data/mocks';
import { getCareerData } from '@/data/careers';

export type ExtendedSubjectStatus = SubjectStatus | 'disabled' | 'available';

interface SubjectWithExtendedStatus extends Subject {
  status: ExtendedSubjectStatus;
  canChangeTo: ExtendedSubjectStatus[];
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedUniversity: University | null;
  selectedCareer: Career | null;
  availableUniversities: University[];
  availableFaculties: typeof mockFaculties;
  availableCareers: Career[];
  subjects: Subject[];
  userProgress: Record<string, SubjectStatus>;
  subjectsWithStatus: SubjectWithExtendedStatus[];
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  selectUniversity: (university: University) => void;
  selectCareer: (career: Career) => void;
  loadCareerData: (careerId: string) => void;
  updateSubjectStatus: (subjectId: string, status: SubjectStatus) => void;
  logout: () => void;
  mockLogin: () => void;
}

const evaluateCorrelatives = (
  subjects: Subject[],
  userProgress: Record<string, SubjectStatus>
): Record<string, ExtendedSubjectStatus> => {
  const statuses: Record<string, ExtendedSubjectStatus> = {};
  const progress: Record<string, ExtendedSubjectStatus> = {};

  // Initialize with user progress or pending
  subjects.forEach(s => {
    const currentStatus = userProgress[s.id];
    if (currentStatus === 'approved') {
      progress[s.id] = 'approved';
    } else if (currentStatus === 'in_progress') {
      progress[s.id] = 'in_progress';
    } else if (currentStatus === 'cursada') {
      progress[s.id] = 'cursada';
    } else {
      progress[s.id] = 'pending';
    }
  });

  // Iteratively evaluate correlativities until stable
  let changed = true;
  while (changed) {
    changed = false;

    subjects.forEach(subject => {
      const currentProgress = progress[subject.id];
      if (currentProgress === 'approved' || currentProgress === 'in_progress' || currentProgress === 'cursada') {
        return; // Already in a final state
      }

      if (subject.isElectivePlaceholder) {
        return;
      }

      // Check correlatives for cursada
      const canCursada = subject.correlCursada?.every((reqId: string) => {
        const reqStatus = progress[reqId];
        return reqStatus === 'cursada' || reqStatus === 'approved' || reqStatus === 'in_progress';
      }) ?? true;

      // Check correlatives for approved
      const canAprobada = subject.correlAprobada?.every((reqId: string) => {
        return progress[reqId] === 'approved';
      }) ?? true;

      const currentStatus = progress[subject.id];

      if ((!canAprobada || !canCursada) && currentStatus !== 'disabled') {
        progress[subject.id] = 'disabled';
        changed = true;
      } else if (canAprobada && canCursada && currentStatus === 'disabled') {
        progress[subject.id] = 'available';
        changed = true;
      }
    });
  }

  // Copy to output
  Object.keys(progress).forEach(key => {
    statuses[key] = progress[key];
  });

  return statuses;
};

const getAvailableTransitions = (
  currentStatus: ExtendedSubjectStatus,
  canCursada: boolean,
  canAprobada: boolean
): ExtendedSubjectStatus[] => {
  if (currentStatus === 'disabled') {
    return ['disabled'];
  }

  // From any other state, allow all transitions
  const available: ExtendedSubjectStatus[] = ['pending', 'in_progress'];

  if (canAprobada) {
    available.push('approved');
  }
  if (currentStatus === 'in_progress') {
    available.push('cursada');
  }
  if (currentStatus === 'approved') {
    // Can go back to cursando if already approved
    available.push('in_progress');
  }

  return [...new Set(available)];
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      selectedUniversity: null,
      selectedCareer: null,
      availableUniversities: mockUniversities,
      availableFaculties: mockFaculties,
      availableCareers: [],
      subjects: [],
      userProgress: {},
      subjectsWithStatus: [],

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setLoading: (isLoading) => set({ isLoading }),

      selectUniversity: (university) => {
        const careerData = getCareerData('utn-sistemas-2023');
        const careers: Career[] = [{
          id: careerData.careerInfo.id,
          facultyId: university.id,
          universityId: university.id,
          name: careerData.careerInfo.nombre,
          totalCredits: careerData.careerInfo.creditosTotales,
          totalSubjects: careerData.SUBJECTS.length,
          years: 5,
          subjects: [],
          tituloIntermedio: careerData.careerInfo.tituloIntermedio,
          tituloFinal: careerData.careerInfo.tituloFinal,
          plan: careerData.careerInfo.plan,
        }];

        set({
          selectedUniversity: university,
          availableCareers: careers,
          selectedCareer: null,
          subjects: [],
          subjectsWithStatus: [],
        });
      },

      selectCareer: (career) => {
        set({ selectedCareer: career });
        get().loadCareerData(career.id);
      },

      loadCareerData: (careerId: string) => {
        const careerData = getCareerData(careerId);
        const subjects: Subject[] = careerData.ALL.map((s: any) => ({
          id: s.id,
          careerId: careerData.careerInfo.id,
          name: s.name,
          code: s.num || s.id,
          year: s.level || 1,
          semester: 1 as const,
          credits: 0,
          difficulty: 3 as const,
          tags: [],
          correlatives: [],
          hours: s.hours,
          correlCursada: s.correlCursada || [],
          correlAprobada: s.correlAprobada || [],
          comisiones: s.comisiones,
          isElectivePlaceholder: s.isElectivePlaceholder,
          isSeminario: s.isSeminario,
          isOutdated: s.isOutdated,
          annualHours: s.annualHours,
          targetHours: s.targetHours,
          level: s.level,
          description: s.name,
        }));

        const statuses = evaluateCorrelatives(subjects, get().userProgress);
        const subjectsWithStatus: SubjectWithExtendedStatus[] = subjects.map(s => ({
          ...s,
          status: statuses[s.id] || 'pending',
          canChangeTo: getAvailableTransitions(
            statuses[s.id] || 'pending',
            s.correlCursada?.every((reqId: string) => ['cursada', 'approved', 'in_progress'].includes(statuses[reqId] || 'pending')) ?? true,
            s.correlAprobada?.every((reqId: string) => statuses[reqId] === 'approved') ?? true
          ),
        }));

        set({ subjects, subjectsWithStatus });
      },

      updateSubjectStatus: (subjectId, status) => {
        const currentProgress = get().userProgress;
        let newProgress: Record<string, SubjectStatus>;

        if (status === 'approved' || status === 'cursada') {
          newProgress = { ...currentProgress, [subjectId]: status };
        } else if (status === 'in_progress') {
          newProgress = { ...currentProgress, [subjectId]: 'in_progress' };
        } else {
          newProgress = { ...currentProgress, [subjectId]: 'pending' };
        }

        // Recalculate statuses based on new progress
        const statuses = evaluateCorrelatives(get().subjects, newProgress);
        const subjectsWithStatus: SubjectWithExtendedStatus[] = get().subjects.map(s => ({
          ...s,
          status: statuses[s.id] || 'pending',
          canChangeTo: getAvailableTransitions(
            statuses[s.id] || 'pending',
            s.correlCursada?.every((reqId: string) => ['cursada', 'approved', 'in_progress'].includes(statuses[reqId] || 'pending')) ?? true,
            s.correlAprobada?.every((reqId: string) => statuses[reqId] === 'approved') ?? true
          ),
        }));

        set({ userProgress: newProgress, subjectsWithStatus });
      },

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          selectedUniversity: null,
          selectedCareer: null,
          subjects: [],
          userProgress: {},
          subjectsWithStatus: [],
        }),

      mockLogin: () => {
        const careerData = getCareerData('utn-sistemas-2023');
        const career: Career = {
          id: careerData.careerInfo.id,
          facultyId: 'utn',
          universityId: 'utn',
          name: careerData.careerInfo.nombre,
          totalCredits: careerData.careerInfo.creditosTotales,
          totalSubjects: careerData.SUBJECTS.length,
          years: 5,
          subjects: [],
          tituloIntermedio: careerData.careerInfo.tituloIntermedio,
          tituloFinal: careerData.careerInfo.tituloFinal,
          plan: careerData.careerInfo.plan,
        };

        const university = mockUniversities.find(u => u.id === 'utn');

        const subjects: Subject[] = careerData.ALL.map((s: any) => ({
          id: s.id,
          careerId: careerData.careerInfo.id,
          name: s.name,
          code: s.num || s.id,
          year: s.level || 1,
          semester: 1 as const,
          credits: 0,
          difficulty: 3 as const,
          tags: [],
          correlatives: [],
          hours: s.hours,
          correlCursada: s.correlCursada || [],
          correlAprobada: s.correlAprobada || [],
          comisiones: s.comisiones,
          isElectivePlaceholder: s.isElectivePlaceholder,
          isSeminario: s.isSeminario,
          isOutdated: s.isOutdated,
          annualHours: s.annualHours,
          targetHours: s.targetHours,
          level: s.level,
          description: s.name,
        }));

        // Start with some progress for demo
        const initialProgress: Record<string, SubjectStatus> = {
          'UTN-AM1': 'approved',
          'UTN-AGA': 'approved',
          'UTN-F1': 'approved',
          'UTN-ING1': 'approved',
          'SIS-5': 'approved',
          'SIS-6': 'in_progress',
          'SIS-7': 'in_progress',
          'SIS-8': 'in_progress',
        };

        const statuses = evaluateCorrelatives(subjects, initialProgress);
        const subjectsWithStatus: SubjectWithExtendedStatus[] = subjects.map(s => ({
          ...s,
          status: statuses[s.id] || 'pending',
          canChangeTo: getAvailableTransitions(
            statuses[s.id] || 'pending',
            s.correlCursada?.every((reqId: string) => ['cursada', 'approved', 'in_progress'].includes(statuses[reqId] || 'pending')) ?? true,
            s.correlAprobada?.every((reqId: string) => statuses[reqId] === 'approved') ?? true
          ),
        }));

        set({
          user: mockUser,
          isAuthenticated: true,
          selectedUniversity: university || null,
          selectedCareer: career,
          availableCareers: [career],
          subjects,
          userProgress: initialProgress,
          subjectsWithStatus,
        });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useIsAuthenticated = () => useUserStore(state => state.isAuthenticated);
export const useUser = () => useUserStore(state => state.user);
export const useSelectedUniversity = () => useUserStore(state => state.selectedUniversity);
export const useSelectedCareer = () => useUserStore(state => state.selectedCareer);
export const useUserProgress = () => useUserStore(state => state.userProgress);

export const useSubjectsByYear = () => {
  const subjectsWithStatus = useUserStore(state => state.subjectsWithStatus);
  const career = useUserStore(state => state.selectedCareer);

  if (!career || subjectsWithStatus.length === 0) return {};

  const grouped = subjectsWithStatus.reduce((acc, subject) => {
    const year = subject.level || subject.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(subject);
    return acc;
  }, {} as Record<number, SubjectWithExtendedStatus[]>);

  return grouped;
};

export const useAcademicStats = () => {
  const career = useUserStore(state => state.selectedCareer);
  const subjectsWithStatus = useUserStore(state => state.subjectsWithStatus);

  if (!career) {
    return {
      total: 0,
      approved: 0,
      inProgress: 0,
      pending: 0,
      disabled: 0,
      percentage: 0,
      totalCredits: 0,
      completedCredits: 0,
    };
  }

  const total = subjectsWithStatus.filter(s => !s.isElectivePlaceholder).length;
  let approved = 0;
  let inProgress = 0;
  let cursada = 0;
  let disabled = 0;
  let pending = 0;

  subjectsWithStatus.forEach(s => {
    if (s.isElectivePlaceholder) return;
    switch (s.status) {
      case 'approved': approved++; break;
      case 'in_progress': inProgress++; break;
      case 'cursada': cursada++; break;
      case 'disabled': disabled++; break;
      default: pending++;
    }
  });

  const totalAvailable = total; // Excluding placeholders
  const percentage = totalAvailable > 0 ? Math.round((approved / totalAvailable) * 100) : 0;

  return {
    total,
    approved,
    inProgress,
    cursada,
    pending,
    disabled,
    percentage,
    totalCredits: career.totalCredits,
    completedCredits: approved * 8, // Rough estimate
  };
};