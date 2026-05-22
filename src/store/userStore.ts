import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, University, Career, Subject, SubjectStatus } from '@/types';
import {
  mockUniversities,
  mockFaculties,
  mockCareers,
  mockSubjects,
  mockUser,
  mockUserProgress,
} from '@/data/mocks';

interface UserState {
  // User data
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // University and career selection
  selectedUniversity: University | null;
  selectedCareer: Career | null;
  availableUniversities: University[];
  availableFaculties: typeof mockFaculties;
  availableCareers: Career[];

  // Subjects
  subjects: Subject[];
  userProgress: Record<string, SubjectStatus>;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  selectUniversity: (university: University) => void;
  selectCareer: (career: Career) => void;
  updateSubjectStatus: (subjectId: string, status: SubjectStatus) => void;
  logout: () => void;

  // Mock login for demo
  mockLogin: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      selectedUniversity: null,
      selectedCareer: null,
      availableUniversities: mockUniversities,
      availableFaculties: mockFaculties,
      availableCareers: mockCareers,
      subjects: mockSubjects,
      userProgress: mockUserProgress,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setLoading: (isLoading) => set({ isLoading }),

      selectUniversity: (university) => {
        const careers = mockCareers.filter(c => c.universityId === university.id);
        set({
          selectedUniversity: university,
          availableCareers: careers,
          selectedCareer: null,
        });
      },

      selectCareer: (career) => {
        const university = mockUniversities.find(u => u.id === career.universityId);
        set({ selectedCareer: career, selectedUniversity: university });
      },

      updateSubjectStatus: (subjectId, status) => {
        set((state) => ({
          userProgress: {
            ...state.userProgress,
            [subjectId]: status,
          },
        }));
      },

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          selectedUniversity: null,
          selectedCareer: null,
        }),

      // Mock login for demo purposes
      mockLogin: () => {
        const career = mockCareers.find(c => c.id === mockUser.careerId);
        const university = mockUniversities.find(u => u.id === mockUser.universityId);
        set({
          user: mockUser,
          isAuthenticated: true,
          selectedUniversity: university || null,
          selectedCareer: career || null,
          userProgress: mockUserProgress,
        });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Selectors
export const useIsAuthenticated = () => useUserStore(state => state.isAuthenticated);
export const useUser = () => useUserStore(state => state.user);
export const useSelectedUniversity = () => useUserStore(state => state.selectedUniversity);
export const useSelectedCareer = () => useUserStore(state => state.selectedCareer);
export const useUserProgress = () => useUserStore(state => state.userProgress);

export const useSubjectsByYear = () => {
  const subjects = useUserStore(state => state.subjects);
  const career = useUserStore(state => state.selectedCareer);
  const userProgress = useUserStore(state => state.userProgress);

  if (!career) return {};

  const careerSubjects = subjects.filter(s => s.careerId === career.id);

  const grouped = careerSubjects.reduce((acc, subject) => {
    const year = subject.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push({
      ...subject,
      status: userProgress[subject.id] || 'pending',
    });
    return acc;
  }, {} as Record<number, Array<Subject & { status: SubjectStatus }>>);

  return grouped;
};

export const useAcademicStats = () => {
  const career = useUserStore(state => state.selectedCareer);
  const userProgress = useUserStore(state => state.userProgress);
  const subjects = useUserStore(state => state.subjects);

  if (!career) {
    return {
      total: 0,
      approved: 0,
      inProgress: 0,
      pending: 0,
      percentage: 0,
      totalCredits: 0,
      completedCredits: 0,
    };
  }

  const careerSubjects = subjects.filter(s => s.careerId === career.id);
  const total = careerSubjects.length;
  let approved = 0;
  let inProgress = 0;

  Object.values(userProgress).forEach((status) => {
    if (status === 'approved') approved++;
    if (status === 'in_progress') inProgress++;
  });

  const pending = total - approved - inProgress;
  const percentage = total > 0 ? Math.round((approved / total) * 100) : 0;

  const completedCredits = careerSubjects
    .filter(s => userProgress[s.id] === 'approved')
    .reduce((acc, s) => acc + s.credits, 0);

  return {
    total,
    approved,
    inProgress,
    pending,
    percentage,
    totalCredits: career.totalCredits,
    completedCredits,
  };
};