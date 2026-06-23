import { supabase, supabase as supabaseUntyped } from '@/lib/supabase/client';
import { EventoAlumno, EventoAlumnoWithDetails, TipoEvento } from '@/lib/supabase/database.types';

export interface CreateEventoData {
  id_materia?: string | null;
  tipo: TipoEvento;
  titulo: string;
  fecha: string;
}

export interface UpdateEventoData {
  id_materia?: string | null;
  tipo?: TipoEvento;
  titulo?: string;
  fecha?: string;
}

export const eventosService = {
  async getByAlumno(alumnoId: string): Promise<EventoAlumnoWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('eventos_alumno')
        .select(`
          *,
          materia:materias(id, nombre)
        `)
        .eq('id_alumno', alumnoId)
        .order('fecha', { ascending: true });

      if (error) {
        console.error('Error fetching eventos:', error);
        return [];
      }

      return (data || []).map((e: any) => ({
        ...e,
        materia_nombre: e.materia?.nombre,
      }));
    } catch (err) {
      console.error('Error fetching eventos:', err);
      return [];
    }
  },

  async getById(id: string): Promise<EventoAlumno | null> {
    try {
      const { data, error } = await supabase
        .from('eventos_alumno')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching evento:', error);
        return null;
      }

      return data as EventoAlumno;
    } catch (err) {
      console.error('Error fetching evento:', err);
      return null;
    }
  },

  async create(alumnoId: string, evento: CreateEventoData): Promise<EventoAlumno | null> {
    try {
      const insertData = { ...evento, id_alumno: alumnoId };
      const { data, error } = await (supabaseUntyped as any)
        .from('eventos_alumno')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating evento:', error);
        return null;
      }

      return data as EventoAlumno;
    } catch (err) {
      console.error('Error creating evento:', err);
      return null;
    }
  },

  async update(id: string, updates: UpdateEventoData): Promise<EventoAlumno | null> {
    try {
      const updateData = { ...updates, updated_at: new Date().toISOString() };
      const { data, error } = await (supabaseUntyped as any)
        .from('eventos_alumno')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating evento:', error);
        return null;
      }

      return data as EventoAlumno;
    } catch (err) {
      console.error('Error updating evento:', err);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('eventos_alumno')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting evento:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error deleting evento:', err);
      return false;
    }
  },

  async getProximosEventos(alumnoId: string, limit: number = 5): Promise<EventoAlumnoWithDetails[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (!alumnoId || alumnoId === "") {
        return [];
      }
      
      const { data, error } = await supabase
        .from('eventos_alumno')
        .select(`
          *,
          materia:materias(id, nombre)
        `)
        .eq('id_alumno', alumnoId)
        .gte('fecha', today)
        .order('fecha', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching proximos eventos:', error);
        return [];
      }

      return (data || []).map((e: any) => ({
        ...e,
        materia_nombre: e.materia?.nombre,
      }));
    } catch (err) {
      console.error('Error fetching proximos eventos:', err);
      return [];
    }
  },
};
