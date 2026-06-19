import { supabase, supabase as supabaseUntyped } from '@/lib/supabase/client';
import { Materia } from '@/lib/supabase/database.types';

export interface CreateMateriaData {
  id_plan: string;
  nombre: string;
  nivel: number;
  horas_anuales: number;
}

export interface UpdateMateriaData {
  id_plan?: string;
  nombre?: string;
  nivel?: number;
  horas_anuales?: number;
}

export const materiasService = {
  async getAll(): Promise<Materia[]> {
    try {
      const { data, error } = await supabase
        .from('materias')
        .select('*')
        .order('nivel', { ascending: true })
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error fetching materias:', error);
        return [];
      }

      return (data as Materia[]) || [];
    } catch (err) {
      console.error('Error fetching materias:', err);
      return [];
    }
  },

  async getByPlan(planId: string): Promise<Materia[]> {
    try {
      const { data, error } = await supabase
        .from('materias')
        .select('*')
        .eq('id_plan', planId)
        .order('nivel', { ascending: true })
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error fetching materias by plan:', error);
        return [];
      }

      return (data as Materia[]) || [];
    } catch (err) {
      console.error('Error fetching materias by plan:', err);
      return [];
    }
  },

  async getById(id: string): Promise<Materia | null> {
    try {
      const { data, error } = await supabase
        .from('materias')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching materia:', error);
        return null;
      }

      return data as Materia;
    } catch (err) {
      console.error('Error fetching materia:', err);
      return null;
    }
  },

  async create(materia: CreateMateriaData): Promise<Materia | null> {
    try {
      const { data, error } = await (supabaseUntyped as any)
        .from('materias')
        .insert(materia)
        .select()
        .single();

      if (error) {
        console.error('Error creating materia:', error);
        return null;
      }

      return data as Materia;
    } catch (err) {
      console.error('Error creating materia:', err);
      return null;
    }
  },

  async update(id: string, updates: UpdateMateriaData): Promise<Materia | null> {
    try {
      const updateData = { ...updates, updated_at: new Date().toISOString() };
      const { data, error } = await (supabaseUntyped as any)
        .from('materias')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating materia:', error);
        return null;
      }

      return data as Materia;
    } catch (err) {
      console.error('Error updating materia:', err);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('materias')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting materia:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error deleting materia:', err);
      return false;
    }
  },
};
