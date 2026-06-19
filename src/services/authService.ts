import { supabase, supabase as supabaseUntyped } from '@/lib/supabase/client';
import { Perfil, Rol } from '@/lib/supabase/database.types';

// For Expo apps, use auth.expo.io for email confirmation redirects
// This format works across platforms (iOS, Android, web)
const getRedirectUrl = () => {
  // In production, you can use your custom scheme or the Expo hosted URL
  // For email confirmations, auth.expo.io is recommended
  const scheme = 'miestadoacademico';
  return `${scheme}://`;
};

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResult {
  user: AuthUser | null;
  perfil: Perfil | null;
  error: string | null;
}

export interface RegisterData {
  email: string;
  password: string;
  nombreCompleto: string;
}

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, perfil: null, error: error.message };
      }

      const perfil = await this.getPerfil(data.user.id);

      return {
        user: data.user as AuthUser,
        perfil,
        error: null,
      };
    } catch (err) {
      return { user: null, perfil: null, error: 'Error inesperado' };
    }
  },

  async signUp(data: RegisterData): Promise<AuthResult> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.nombreCompleto,
          },
          emailRedirectTo: getRedirectUrl(),
        },
      });

      if (authError) {
        return { user: null, perfil: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, perfil: null, error: 'No se pudo crear el usuario' };
      }

      const perfil = await this.getPerfil(authData.user.id);

      return {
        user: authData.user as AuthUser,
        perfil,
        error: null,
      };
    } catch (err) {
      return { user: null, perfil: null, error: 'Error inesperado' };
    }
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getPerfil(userId: string): Promise<Perfil | null> {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching perfil:', error);
        return null;
      }

      return data as Perfil;
    } catch (err) {
      console.error('Error fetching perfil:', err);
      return null;
    }
  },

  async getCurrentUser(): Promise<AuthResult> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return { user: null, perfil: null, error: error?.message || 'No hay sesión' };
      }

      const perfil = await this.getPerfil(user.id);

      return {
        user: user as AuthUser,
        perfil,
        error: null,
      };
    } catch (err) {
      return { user: null, perfil: null, error: 'Error inesperado' };
    }
  },

  async updatePerfil(userId: string, updates: { nombre_completo?: string; rol?: Rol }): Promise<Perfil | null> {
    try {
      const { data, error } = await (supabaseUntyped as any)
        .from('perfiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating perfil:', error);
        return null;
      }

      return data as Perfil;
    } catch (err) {
      console.error('Error updating perfil:', err);
      return null;
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      callback(session?.user as AuthUser || null);
    });

    return () => subscription.unsubscribe();
  },
};
