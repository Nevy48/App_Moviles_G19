export type Rol = 'admin' | 'alumno';
export type TipoEvento = 'parcial' | 'tp' | 'exposicion';
export type TipoCorrelativa = 'cursada' | 'aprobada';

export interface Perfil {
  id: string;
  rol: Rol;
  nombre_completo: string;
  created_at: string;
  updated_at: string;
}

// ✨ NUEVO: Tabla de Facultades/Administradores
export interface AdminInstitucional {
  id: string;
  id_perfil: string;              // Referencia a Perfil con rol='admin'
  nombre_facultad: string;        // Nombre de la facultad
  nombre_completo?: string;       // Cached from Perfil para mostrar
  created_at: string;
  updated_at: string;
}

export interface PlanEstudio {
  id: string;
  nombre: string;
  anio_resolucion: number;
  // ✨ NUEVO: Vinculación con facultad
  id_admin?: string;              // Referencia a AdminInstitucional
  created_at: string;
  updated_at: string;
}

export interface Materia {
  id: string;
  id_plan: string;
  nombre: string;
  nivel: number;
  horas_anuales: number;
  created_at: string;
  updated_at: string;
}

export interface Correlativa {
  id_materia: string;
  id_correlativa: string;
  tipo: TipoCorrelativa;
  created_at: string;
}

export interface CorrelativaWithDetails extends Correlativa {
  materia_nombre?: string;
  correlativa_nombre?: string;
}

export interface EventoAlumno {
  id: string;
  id_alumno: string;
  id_materia: string | null;
  tipo: TipoEvento;
  titulo: string;
  fecha: string;
  created_at: string;
  updated_at: string;
}

export interface EventoAlumnoWithDetails extends EventoAlumno {
  materia_nombre?: string;
}

// ✨ NUEVO: Tipo para seguimiento de materias del alumno
export interface ProgresoAlumno {
  id: string;
  id_alumno: string;
  id_materia: string;
  estado: 'pending' | 'in_progress' | 'cursada' | 'approved';
  nota?: number;
  fecha_aprobacion?: string;
  created_at: string;
  updated_at: string;
}

// ✨ NUEVO: Tipo para suscripción a planes
export interface SuscripcionPlan {
  id: string;
  id_alumno: string;
  id_plan: string;
  fecha_inicio: string;
  fecha_fin?: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: Perfil;
        Insert: Omit<Perfil, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Perfil, 'id' | 'created_at'>>;
      };
      // ✨ NUEVO
      admins_institucionales: {
        Row: AdminInstitucional;
        Insert: Omit<AdminInstitucional, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AdminInstitucional, 'id' | 'created_at'>>;
      };
      planes_estudio: {
        Row: PlanEstudio;
        Insert: Omit<PlanEstudio, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PlanEstudio, 'id' | 'created_at'>>;
      };
      materias: {
        Row: Materia;
        Insert: Omit<Materia, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Materia, 'id' | 'created_at'>>;
      };
      correlativas: {
        Row: Correlativa;
        Insert: Omit<Correlativa, 'created_at'>;
        Update: Partial<Omit<Correlativa, 'created_at'>>;
      };
      eventos_alumno: {
        Row: EventoAlumno;
        Insert: Omit<EventoAlumno, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EventoAlumno, 'id' | 'created_at'>>;
      };
      progreso_alumno: {
        Row: ProgresoAlumno;
        Insert: Omit<ProgresoAlumno, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProgresoAlumno, 'id' | 'created_at'>>;
      };
      suscripciones_alumno: {
        Row: SuscripcionPlan;
        Insert: Omit<SuscripcionPlan, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SuscripcionPlan, 'id' | 'created_at'>>;
      };
    };
    Enums: {
      rol: Rol;
      tipo_evento: TipoEvento;
      tipo_correlativa: TipoCorrelativa;
    };
  };
}