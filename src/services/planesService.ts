import { supabase } from '@/lib/supabase/client';
import { PlanEstudio, AdminInstitucional } from '@/lib/supabase/database.types';

export const planesService = {
  
  /**
   * Obtiene todos los administradores institucionales (Facultades)
   * Esto devuelve la lista de facultades disponibles en el sistema
   */
  async getAdminsInstitucionales(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('id, nombre_completo, institucion, latitud, longitud')
        .eq('rol', 'admin'); 

      if (error) {
        console.error('Error fetching admins:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Error fetching admins:', err);
      return [];
    }
  },

  /**
   * Obtiene todos los planes de estudio de una facultad específica
   * @param adminId ID del administrador/facultad
   */
  async getByAdmin(adminId: string): Promise<PlanEstudio[]> {
    try {
      const { data, error } = await supabase
        .from('planes_estudio')
        .select('*')
        .eq('id_admin', adminId)
        .order('nombre', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo planes por admin:', error);
      throw error;
    }
  },

  /**
   * Obtiene todos los planes de estudio del sistema
   */
  async getAll(): Promise<PlanEstudio[]> {
    try {
      const { data, error } = await supabase
        .from('planes_estudio')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo todos los planes:', error);
      throw error;
    }
  },

  /**
   * Obtiene un plan específico por ID
   * @param planId ID del plan
   */
  async getById(planId: string): Promise<PlanEstudio | null> {
    try {
      const { data, error } = await supabase
        .from('planes_estudio')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error obteniendo plan por ID:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo plan de estudio
   */
  async create(plan: Omit<PlanEstudio, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('planes_estudio')
        .insert([plan])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creando plan:', error);
      throw error;
    }
  },

  /**
   * Actualiza un plan existente
   */
  async update(planId: string, updates: Partial<Omit<PlanEstudio, 'id' | 'created_at'>>) {
    try {
      const { data, error } = await supabase
        .from('planes_estudio')
        .update(updates)
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error actualizando plan:', error);
      throw error;
    }
  },

  /**
   * Elimina un plan de estudio
   */
  async delete(planId: string) {
    try {
      const { error } = await supabase
        .from('planes_estudio')
        .delete()
        .eq('id', planId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error eliminando plan:', error);
      throw error;
    }
  },

  /**
   * Busca planes por nombre (para la barra de búsqueda)
   */
  async buscar(termino: string): Promise<PlanEstudio[]> {
    try {
      const { data, error } = await supabase
        .from('planes_estudio')
        .select('*')
        .ilike('nombre', `%${termino}%`)
        .order('nombre', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error buscando planes:', error);
      throw error;
    }
  },
};