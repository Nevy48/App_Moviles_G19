import { supabase, supabase as supabaseUntyped } from '@/lib/supabase/client';

export interface ProgresoData {
  id_materia: string;
  estado: string;
  horarios: any[];
}

export const progresoService = {
  // Obtiene toda la malla curricular de un alumno específico
  async getProgresoAlumno(alumnoId: string): Promise<ProgresoData[]> {
    try {
      const { data, error } = await supabase
        .from('progreso_alumno')
        .select('*')
        .eq('id_alumno', alumnoId);

      if (error) {
        console.error('Error obteniendo progreso:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('Error obteniendo progreso:', err);
      return [];
    }
  },

  // Inserta o actualiza el estado y los horarios.
  async upsertProgreso(alumnoId: string, materiaId: string, estado: string, horarios: any[] = []): Promise<boolean> {
    try {
      const { error } = await (supabaseUntyped as any)
        .from('progreso_alumno')
        .upsert(
          { 
            id_alumno: alumnoId, 
            id_materia: materiaId, 
            estado, 
            horarios, 
            updated_at: new Date().toISOString() 
          }, 
          { onConflict: 'id_alumno, id_materia' }
        );

      if (error) {
        console.error('Error guardando progreso:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error guardando progreso:', err);
      return false;
    }
  }
};