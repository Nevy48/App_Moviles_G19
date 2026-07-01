import { supabase, supabase as supabaseUntyped } from '@/lib/supabase/client';
import { PlanEstudio } from '@/lib/supabase/database.types';

export const suscripcionesService = {
  // Ahora devuelve un array de planes suscritos
  async getPlanesSuscritos(alumnoId: string): Promise<PlanEstudio[]> {
    try {
      const { data, error } = await supabase
        .from('suscripciones_alumno')
        .select('id_plan, planes_estudio(*)')
        .eq('id_alumno', alumnoId);

      if (error || !data) return [];
      
      // Mapeamos para devolver solo los objetos de planes
      return data.map((item: any) => item.planes_estudio as PlanEstudio);
    } catch (err) {
      console.error('Error obteniendo suscripciones:', err);
      return [];
    }
  },

  // Vincula al alumno con un nuevo plan
  async seguirPlan(alumnoId: string, planId: string): Promise<{success: boolean, error?: string}> {
    try {
      const { error } = await (supabaseUntyped as any)
        .from('suscripciones_alumno')
        .insert({ id_alumno: alumnoId, id_plan: planId });

      if (error) {
        if (error.code === '23505' && error.message.includes('idx_unico_alumno_plan')) {
           return { success: true };
        }
        console.error('Error insertando plan:', error);
        return { success: false, error: `Error ${error.code}: ${error.message}` };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Purga la vinculación y todos los datos asociados (Borrado en Cascada Completo)
  async abandonarPlan(alumnoId: string, planId: string): Promise<boolean> {
      // Obtenemos las materias
      const { data: materias, error: errMaterias } = await supabase
        .from('materias')
        .select('id')
        .eq('id_plan', planId);

      if (materias && materias.length > 0) {
        const materiaIds = materias.map(m => m.id);
        
        // Borramos el progreso
        const { error: errProgreso } = await supabase
          .from('progreso_alumno')
          .delete()
          .eq('id_alumno', alumnoId)
          .in('id_materia', materiaIds);

        // Borramos los eventos asociados (Exámenes, TPs, etc.)
        const { error: errEventos } = await supabase
          .from('eventos_alumno')
          .delete()
          .eq('id_alumno', alumnoId)
          .in('id_materia', materiaIds);
      }

      // Borramos la suscripción principal
      const { error: errSuscripcion } = await supabase
        .from('suscripciones_alumno')
        .delete()
        .eq('id_alumno', alumnoId)
        .eq('id_plan', planId);
  }
};