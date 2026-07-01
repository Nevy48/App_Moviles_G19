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
      // Quitamos la propiedad 'activo' por si ese fue el problema en la BD
      const { error } = await (supabaseUntyped as any)
        .from('suscripciones_alumno')
        .insert({ id_alumno: alumnoId, id_plan: planId });

      if (error) {
        if (error.code === '23505') return { success: true }; // Si ya estaba anotado, lo tomamos como éxito
        console.error('Error insertando plan:', error);
        return { success: false, error: error.message }; // Devolvemos el por qué falló
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Elimina la suscripción
  async abandonarPlan(alumnoId: string, planId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('suscripciones_alumno')
        .delete()
        .eq('id_alumno', alumnoId)
        .eq('id_plan', planId);

      return !error;
    } catch (err) {
      return false;
    }
  }
};