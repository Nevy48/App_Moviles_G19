import { supabase } from '@/lib/supabase/client';
import { supabase as supabaseUntyped } from '@/lib/supabase/client';
import { PlanEstudio } from '@/lib/supabase/database.types';

export interface CreatePlanData {
  nombre: string;
  anio_resolucion: number;
}

export interface UpdatePlanData {
  nombre?: string;
  anio_resolucion?: number;
}

export const planesService = {
  async getAll(): Promise<PlanEstudio[]> {
    try {
      const { data, error } = await supabase
        .from('planes_estudio')
        .select('*')
        .order('anio_resolucion', { ascending: false });

      if (error) {
        console.error('Error fetching planes:', error);
        return [];
      }

      return (data as PlanEstudio[]) || [];
    } catch (err) {
      console.error('Error fetching planes:', err);
      return [];
    }
  },

  async getById(id: string): Promise<PlanEstudio | null> {
    try {
      const { data, error } = await supabase
        .from('planes_estudio')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching plan:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return data as PlanEstudio;
    } catch (err) {
      console.error('Error fetching plan:', err);
      return null;
    }
  },

  async create(plan: CreatePlanData): Promise<PlanEstudio | null> {
    try {
      const { data, error } = await (supabaseUntyped as any)
        .from('planes_estudio')
        .insert(plan)
        .select()
        .single();

      if (error) {
        console.error('Error creating plan:', error);
        return null;
      }

      return data as PlanEstudio;
    } catch (err) {
      console.error('Error creating plan:', err);
      return null;
    }
  },

  async update(id: string, updates: UpdatePlanData): Promise<PlanEstudio | null> {
    try {
      const updateData = { ...updates, updated_at: new Date().toISOString() };
      const { data, error } = await (supabaseUntyped as any)
        .from('planes_estudio')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating plan:', error);
        return null;
      }

      return data as PlanEstudio;
    } catch (err) {
      console.error('Error updating plan:', err);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('planes_estudio')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting plan:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error deleting plan:', err);
      return false;
    }
  },
};
