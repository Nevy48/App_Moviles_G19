import { supabase } from '@/lib/supabase/client';
import { Correlativa, CorrelativaWithDetails, TipoCorrelativa } from '@/lib/supabase/database.types';

export interface CreateCorrelativaData {
  id_materia: string;
  id_correlativa: string;
  tipo: TipoCorrelativa;
}

export const correlativasService = {
  async getAll(): Promise<CorrelativaWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('correlativas')
        .select(`
          *,
          materia:materias!id_materia(nombre),
          correlativa:materias!id_correlativa(nombre)
        `);

      if (error) {
        console.error('Error fetching correlativas:', error);
        return [];
      }

      return (data || []).map((c: any) => ({
        ...c,
        materia_nombre: c.materia?.nombre,
        correlativa_nombre: c.correlativa?.nombre,
      }));
    } catch (err) {
      console.error('Error fetching correlativas:', err);
      return [];
    }
  },

  async getByMateria(materiaId: string): Promise<CorrelativaWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('correlativas')
        .select(`
          *,
          materia:materias!id_materia(nombre),
          correlativa:materias!id_correlativa(nombre)
        `)
        .eq('id_materia', materiaId);

      if (error) {
        console.error('Error fetching correlativas by materia:', error);
        return [];
      }

      return (data || []).map((c: any) => ({
        ...c,
        materia_nombre: c.materia?.nombre,
        correlativa_nombre: c.correlativa?.nombre,
      }));
    } catch (err) {
      console.error('Error fetching correlativas by materia:', err);
      return [];
    }
  },

  async create(correlativa: CreateCorrelativaData): Promise<Correlativa | null> {
    try {
      const { data, error } = await supabase
        .from('correlativas')
        .insert(correlativa as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating correlativa:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error creating correlativa:', err);
      return null;
    }
  },

  async delete(idMateria: string, idCorrelativa: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('correlativas')
        .delete()
        .eq('id_materia', idMateria)
        .eq('id_correlativa', idCorrelativa);

      if (error) {
        console.error('Error deleting correlativa:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error deleting correlativa:', err);
      return false;
    }
  },

  async getCorrelativasInfo(materiaId: string): Promise<{
    cursada: CorrelativaWithDetails[];
    aprobada: CorrelativaWithDetails[];
  }> {
    const all = await this.getByMateria(materiaId);

    return {
      cursada: all.filter(c => c.tipo === 'cursada'),
      aprobada: all.filter(c => c.tipo === 'aprobada'),
    };
  },
};
