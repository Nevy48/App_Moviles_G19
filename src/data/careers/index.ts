import { University, Career, CalendarDay } from '@/types';
import * as UtnSistemas2023 from './utn/sistemas-2023';

export type { University, Career, CalendarDay };

// We need to cast the imported module to have proper typing
const careersRegistry: Record<string, typeof UtnSistemas2023> = {
  'utn-sistemas-2023': UtnSistemas2023,
};

export const getCareerData = (careerId: string) => {
  const data = careersRegistry[careerId];
  if (!data) {
    console.warn(`Carrera no encontrada: ${careerId}. Cargando plan por defecto.`);
    return careersRegistry['utn-sistemas-2023'];
  }
  return data;
};

export const getCareerById = (careerId: string) => getCareerData(careerId);

// Re-export career data for external use
export { UtnSistemas2023 };

// Feriados nacionales 2026
export const FERIADOS_NACIONALES: CalendarDay[] = [
  { fecha: '2026-03-23', motivo: 'Feriado puente', tipo: 'feriado' },
  { fecha: '2026-03-24', motivo: 'Día Nacional de la Memoria', tipo: 'feriado' },
  { fecha: '2026-04-02', motivo: 'Viernes Santo', tipo: 'feriado' },
  { fecha: '2026-04-03', motivo: 'Día del Veterano y de los Caídos', tipo: 'feriado' },
  { fecha: '2026-05-01', motivo: 'Día del Trabajador', tipo: 'feriado' },
  { fecha: '2026-05-25', motivo: 'Revolución de Mayo', tipo: 'feriado' },
  { fecha: '2026-06-15', motivo: 'Inmortalidad Gral. Güemes', tipo: 'feriado' },
  { fecha: '2026-06-20', motivo: 'Inmortalidad Gral. Belgrano', tipo: 'feriado' },
  { fecha: '2026-07-09', motivo: 'Día de la Independencia', tipo: 'feriado' },
  { fecha: '2026-07-10', motivo: 'Feriado puente', tipo: 'feriado' },
  { fecha: '2026-08-17', motivo: 'Inmortalidad Gral. San Martín', tipo: 'feriado' },
  { fecha: '2026-10-12', motivo: 'Día de la Diversidad Cultural', tipo: 'feriado' },
  { fecha: '2026-11-23', motivo: 'Día de la Soberanía Nacional', tipo: 'feriado' },
  { fecha: '2026-12-07', motivo: 'Feriado puente', tipo: 'feriado' },
  { fecha: '2026-12-08', motivo: 'Inmaculada Concepción', tipo: 'feriado' },
  { fecha: '2026-12-25', motivo: 'Navidad', tipo: 'feriado' },
];

// Calendario académico UTN FRLP
export const CALENDARIO_UTN: CalendarDay[] = [
  { fecha: '2026-04-22', motivo: '1º Turno Examen Final', tipo: 'finales' },
  { fecha: '2026-05-02', motivo: 'Día del Docente Universitario', tipo: 'feriado' },
  { fecha: '2026-05-19', motivo: 'Jornada de formación profesional', tipo: 'finales' },
  { fecha: '2026-05-20', motivo: 'Jornada de formación profesional', tipo: 'finales' },
  { fecha: '2026-05-21', motivo: 'Jornada de formación profesional', tipo: 'finales' },
  { fecha: '2026-05-27', motivo: '2º Turno Examen Final', tipo: 'finales' },
  { fecha: '2026-06-16', motivo: '3º Turno Examen Final', tipo: 'finales' },
  { fecha: '2026-07-20', motivo: 'Receso Invernal', tipo: 'feriado' },
  { fecha: '2026-07-21', motivo: 'Receso Invernal', tipo: 'feriado' },
  { fecha: '2026-07-22', motivo: 'Receso Invernal', tipo: 'feriado' },
  { fecha: '2026-07-23', motivo: 'Receso Invernal', tipo: 'feriado' },
  { fecha: '2026-07-24', motivo: 'Receso Invernal', tipo: 'feriado' },
  { fecha: '2026-07-27', motivo: 'Receso Invernal', tipo: 'feriado' },
  { fecha: '2026-07-28', motivo: 'Receso Invernal', tipo: 'feriado' },
  { fecha: '2026-07-29', motivo: 'Receso Invernal', tipo: 'feriado' },
  { fecha: '2026-07-30', motivo: 'Receso Invernal', tipo: 'feriado' },
  { fecha: '2026-07-31', motivo: 'Receso Invernal', tipo: 'feriado' },
  { fecha: '2026-08-07', motivo: '4º Turno Examen Final', tipo: 'finales' },
  { fecha: '2026-08-19', motivo: 'Día de la UTN', tipo: 'feriado' },
  { fecha: '2026-09-21', motivo: 'Día del Estudiante', tipo: 'feriado' },
  { fecha: '2026-09-22', motivo: 'Semana del Estudiante', tipo: 'feriado' },
  { fecha: '2026-09-23', motivo: 'Semana del Estudiante', tipo: 'feriado' },
  { fecha: '2026-09-24', motivo: 'Día de la Facultad (FRLP)', tipo: 'feriado' },
  { fecha: '2026-09-25', motivo: '5º Turno Examen Final', tipo: 'finales' },
  { fecha: '2026-10-13', motivo: '6º Turno Examen Final', tipo: 'finales' },
  { fecha: '2026-11-19', motivo: 'Aniversario de La Plata', tipo: 'feriado' },
  { fecha: '2026-11-26', motivo: 'Día del Trabajador No Docente', tipo: 'feriado' },
  { fecha: '2026-12-14', motivo: '7º Turno Examen Final', tipo: 'finales' },
  { fecha: '2026-12-15', motivo: '7º Turno Examen Final', tipo: 'finales' },
  { fecha: '2026-12-16', motivo: '7º Turno Examen Final', tipo: 'finales' },
  { fecha: '2026-12-17', motivo: '7º Turno Examen Final', tipo: 'finales' },
  { fecha: '2026-12-18', motivo: '7º Turno Examen Final', tipo: 'finales' },
];

export const getInhabiles = (careerId: string): CalendarDay[] => {
  const inhabiles = [...FERIADOS_NACIONALES];
  if (careerId?.startsWith('utn')) {
    inhabiles.push(...CALENDARIO_UTN);
  }
  return inhabiles;
};

export const isInhabil = (careerId: string, date: Date): boolean => {
  const dateStr = date.toISOString().split('T')[0];
  const inhabiles = getInhabiles(careerId);
  return inhabiles.some(h => h.fecha === dateStr);
};