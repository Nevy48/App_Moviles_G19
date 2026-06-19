import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Perfil, Rol } from '@/lib/supabase/database.types';
import { authService, AuthUser } from '@/services/authService';

interface AuthState {
  user: AuthUser | null;
  perfil: Perfil | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  rol: Rol | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, nombreCompleto: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshPerfil: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    perfil: null,
    isLoading: true,
    isAuthenticated: false,
    rol: null,
  });

  const loadUser = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    const result = await authService.getCurrentUser();

    setState({
      user: result.user,
      perfil: result.perfil,
      isLoading: false,
      isAuthenticated: !!result.user,
      rol: result.perfil?.rol || null,
    });
  }, []);

  useEffect(() => {
    loadUser();

    const unsubscribe = authService.onAuthStateChange((user) => {
      if (user) {
        loadUser();
      } else {
        setState({
          user: null,
          perfil: null,
          isLoading: false,
          isAuthenticated: false,
          rol: null,
        });
      }
    });

    return unsubscribe;
  }, [loadUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    const result = await authService.signIn(email, password);

    if (result.error) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: result.error || 'Error desconocido' };
    }

    setState({
      user: result.user,
      perfil: result.perfil,
      isLoading: false,
      isAuthenticated: true,
      rol: result.perfil?.rol || null,
    });

    return { success: true };
  }, []);

  const signUp = useCallback(async (email: string, password: string, nombreCompleto: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    const result = await authService.signUp({ email, password, nombreCompleto });

    if (result.error) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: result.error || 'Error desconocido' };
    }

    setState({
      user: result.user,
      perfil: result.perfil,
      isLoading: false,
      isAuthenticated: true,
      rol: result.perfil?.rol || null,
    });

    return { success: true };
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setState({
      user: null,
      perfil: null,
      isLoading: false,
      isAuthenticated: false,
      rol: null,
    });
  }, []);

  const refreshPerfil = useCallback(async () => {
    if (!state.user) return;

    const perfil = await authService.getPerfil(state.user.id);
    setState(prev => ({
      ...prev,
      perfil,
      rol: perfil?.rol || null,
    }));
  }, [state.user]);

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    refreshPerfil,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

export function useRol(): Rol | null {
  const { rol } = useAuth();
  return rol;
}

export function useIsAdmin(): boolean {
  const { rol } = useAuth();
  return rol === 'admin';
}

export function useIsAlumno(): boolean {
  const { rol } = useAuth();
  return rol === 'alumno';
}
