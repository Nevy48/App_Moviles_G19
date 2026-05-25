import { Commission } from '@/types';

const careerInfo = {
  id: 'utn-sistemas-2023',
  universidad: 'UTN FRLP',
  nombre: 'Ingeniería en Sistemas de Información',
  plan: 'Plan 2023',
  tituloIntermedio: 'Analista Universitario en Sistemas',
  tituloFinal: 'Ingeniero en Sistemas de Información',
  creditosTotales: 42,
};

const SUBJECTS: Array<{
  id: string;
  num: string;
  name: string;
  hours: string;
  level: number;
  correlCursada: string[];
  correlAprobada: string[];
  comisiones?: Commission[];
  isElectivePlaceholder?: boolean;
  isSeminario?: boolean;
  targetHours?: number;
}> = [
  { id: 'UTN-AM1', num: '01', name: 'Análisis Matemático I', hours: '5 hs/sem', level: 1, correlCursada: [], correlAprobada: [], comisiones: [{ id: 'S10', duration: 'A', dias: [{ nombre: 'Martes', inicio: '08:00', fin: '12:00' }] }] },
  { id: 'UTN-AGA', num: '02', name: 'Algebra y Geometría Analítica', hours: '5 hs/sem', level: 1, correlCursada: [], correlAprobada: [], comisiones: [{ id: 'S10', duration: 'A', dias: [{ nombre: 'Viernes', inicio: '08:00', fin: '12:00' }] }] },
  { id: 'UTN-F1', num: '03', name: 'Fisica I', hours: '5 hs/sem', level: 1, correlCursada: [], correlAprobada: [], comisiones: [{ id: 'S10', duration: 'A', dias: [{ nombre: 'Miércoles', inicio: '09:00', fin: '13:00' }] }] },
  { id: 'UTN-ING1', num: '04', name: 'Inglés I', hours: '2 hs/sem', level: 1, correlCursada: [], correlAprobada: [] },
  { id: 'SIS-5', num: '05', name: 'Lógica y Estructuras Discretas', hours: '3 hs/sem', level: 1, correlCursada: [], correlAprobada: [], comisiones: [{ id: 'S10', duration: 'A', dias: [{ nombre: 'Lunes', inicio: '12:00', fin: '14:15' }] }] },
  { id: 'SIS-6', num: '06', name: 'Algoritmos y Estructuras de Datos', hours: '5 hs/sem', level: 1, correlCursada: [], correlAprobada: [], comisiones: [{ id: 'S10', duration: 'A', dias: [{ nombre: 'Lunes', inicio: '08:00', fin: '10:15' }, { nombre: 'Jueves', inicio: '09:30', fin: '11:00' }] }] },
  { id: 'SIS-7', num: '07', name: 'Arquitecturas de Computadoras', hours: '4 hs/sem', level: 1, correlCursada: [], correlAprobada: [], comisiones: [{ id: 'S10', duration: 'A', dias: [{ nombre: 'Jueves', inicio: '08:00', fin: '09:30' }, { nombre: 'Viernes', inicio: '12:00', fin: '13:30' }] }] },
  { id: 'SIS-8', num: '08', name: 'Sistemas y Procesos de Negocio', hours: '3 hs/sem', level: 1, correlCursada: [], correlAprobada: [], comisiones: [{ id: 'S10', duration: 'A', dias: [{ nombre: 'Jueves', inicio: '11:15', fin: '13:30' }] }] },
  { id: 'UTN-AM2', num: '09', name: 'Análisis Matemático II', hours: '5 hs/sem', level: 2, correlCursada: ['UTN-AM1', 'UTN-AGA'], correlAprobada: [], comisiones: [{ id: 'S21', duration: 'A', dias: [{ nombre: 'Lunes', inicio: '10:30', fin: '12:45' }, { nombre: 'Jueves', inicio: '09:45', fin: '11:15' }] }] },
  { id: 'UTN-F2', num: '10', name: 'Fisica II', hours: '5 hs/sem', level: 2, correlCursada: ['UTN-AM1', 'UTN-F1'], correlAprobada: [], comisiones: [{ id: 'S21', duration: 'A', dias: [{ nombre: 'Lunes', inicio: '08:00', fin: '10:15' }, { nombre: 'Martes', inicio: '13:00', fin: '15:00' }] }] },
  { id: 'UTN-IYS', num: '11', name: 'Ingeniería y Sociedad', hours: '2 hs/sem', level: 2, correlCursada: [], correlAprobada: [], comisiones: [{ id: 'S21', duration: 'A', dias: [{ nombre: 'Martes', inicio: '10:30', fin: '12:00' }] }] },
  { id: 'UTN-ING2', num: '12', name: 'Inglés II', hours: '2 hs/sem', level: 2, correlCursada: ['UTN-ING1'], correlAprobada: [] },
  { id: 'SIS-13', num: '13', name: 'Sintaxis y Semántica del Lenguaje', hours: '4 hs/sem', level: 2, correlCursada: ['SIS-5', 'SIS-6'], correlAprobada: [], comisiones: [{ id: 'S21', duration: '1', dias: [{ nombre: 'Miércoles', inicio: '08:00', fin: '12:00' }, { nombre: 'Viernes', inicio: '10:30', fin: '12:45' }] }] },
  { id: 'SIS-14', num: '14', name: 'Paradigmas de Programación', hours: '4 hs/sem', level: 2, correlCursada: ['SIS-5', 'SIS-6'], correlAprobada: [], comisiones: [{ id: 'S21', duration: '2', dias: [{ nombre: 'Miércoles', inicio: '08:00', fin: '12:00' }, { nombre: 'Viernes', inicio: '10:30', fin: '12:45' }] }] },
  { id: 'SIS-15', num: '15', name: 'Sistemas Operativos', hours: '4 hs/sem', level: 2, correlCursada: ['SIS-7'], correlAprobada: [], comisiones: [{ id: 'S21', duration: 'A', dias: [{ nombre: 'Miércoles', inicio: '12:00', fin: '13:30' }, { nombre: 'Jueves', inicio: '08:00', fin: '09:30' }] }] },
  { id: 'SIS-16', num: '16', name: 'Análisis de Sistemas de Información (Integradora)', hours: '6 hs/sem', level: 2, correlCursada: ['SIS-6', 'SIS-8'], correlAprobada: [], comisiones: [{ id: 'S21', duration: 'A', dias: [{ nombre: 'Martes', inicio: '08:00', fin: '10:15' }, { nombre: 'Viernes', inicio: '08:00', fin: '10:15' }] }] },
  { id: 'UTN-PYE', num: '17', name: 'Probabilidades y Estadística', hours: '3 hs/sem', level: 3, correlCursada: ['UTN-AM1', 'UTN-AGA'], correlAprobada: [], comisiones: [{ id: 'S31', duration: 'A', dias: [{ nombre: 'Miércoles', inicio: '13:00', fin: '15:15' }] }] },
  { id: 'UTN-ECO', num: '18', name: 'Economía', hours: '3 hs/sem', level: 3, correlCursada: [], correlAprobada: ['UTN-AM1', 'UTN-AGA'], comisiones: [{ id: 'S31', duration: '2', dias: [{ nombre: 'Lunes', inicio: '08:00', fin: '10:15' }, { nombre: 'Jueves', inicio: '08:00', fin: '10:15' }] }] },
  { id: 'SIS-19', num: '19', name: 'Bases de Datos', hours: '4 hs/sem', level: 3, correlCursada: ['SIS-13', 'SIS-16'], correlAprobada: ['SIS-5', 'SIS-6'], comisiones: [{ id: 'S31', duration: '1', dias: [{ nombre: 'Lunes', inicio: '08:00', fin: '11:00' }, { nombre: 'Jueves', inicio: '11:00', fin: '14:00' }] }] },
  { id: 'SIS-20', num: '20', name: 'Desarrollo de Software', hours: '4 hs/sem', level: 3, correlCursada: ['SIS-14', 'SIS-16'], correlAprobada: ['SIS-5', 'SIS-6'], comisiones: [{ id: 'S31', duration: 'A', dias: [{ nombre: 'Jueves', inicio: '08:00', fin: '11:00' }] }] },
  { id: 'SIS-21', num: '21', name: 'Comunicación de Datos', hours: '4 hs/sem', level: 3, correlCursada: [], correlAprobada: ['UTN-F1', 'SIS-7'], comisiones: [{ id: 'S31', duration: '1', dias: [{ nombre: 'Miércoles', inicio: '10:15', fin: '13:00' }, { nombre: 'Viernes', inicio: '08:00', fin: '11:15' }] }] },
  { id: 'SIS-22', num: '22', name: 'Análisis Numérico', hours: '3 hs/sem', level: 3, correlCursada: ['UTN-AM2'], correlAprobada: ['UTN-AM1', 'UTN-AGA'], comisiones: [{ id: 'S31', duration: 'A', dias: [{ nombre: 'Lunes', inicio: '11:00', fin: '14:00' }] }] },
  { id: 'SIS-23', num: '23', name: 'Diseño de Sistemas de Información (Integradora)', hours: '6 hs/sem', level: 3, correlCursada: ['SIS-14', 'SIS-16'], correlAprobada: ['UTN-ING1', 'SIS-6', 'SIS-8'], comisiones: [{ id: 'S31', duration: 'A', dias: [{ nombre: 'Martes', inicio: '08:00', fin: '10:15' }, { nombre: 'Miércoles', inicio: '08:00', fin: '10:15' }] }] },
  { id: 'SIS-SEM', num: 'SEM', name: 'Seminario Integrador (Título Intermedio)', hours: 'Extra', level: 3, correlCursada: ['SIS-16'], correlAprobada: ['SIS-6', 'SIS-8', 'SIS-13', 'SIS-14'], isSeminario: true, comisiones: [{ id: 'S31', duration: 'A', dias: [{ nombre: 'Lunes', inicio: '16:00', fin: '17:30' }, { nombre: 'Jueves', inicio: '16:30', fin: '18:00' }] }] },
  { id: 'REQ3', num: 'E3', name: 'Electivas 3° Nivel', hours: 'Req: 4 hs anuales', level: 3, correlCursada: [], correlAprobada: [], isElectivePlaceholder: true, targetHours: 4 },
  { id: 'UTN-LEG', num: '24', name: 'Legislación', hours: '2 hs/sem', level: 4, correlCursada: ['UTN-IYS'], correlAprobada: [], comisiones: [{ id: 'S41', duration: '2', dias: [{ nombre: 'Lunes', inicio: '20:15', fin: '23:15' }] }] },
  { id: 'SIS-25', num: '25', name: 'Ingeniería y Calidad de Software', hours: '3 hs/sem', level: 4, correlCursada: ['SIS-19', 'SIS-20', 'SIS-23'], correlAprobada: ['SIS-13', 'SIS-14'], comisiones: [{ id: 'S41', duration: '1', dias: [{ nombre: 'Lunes', inicio: '18:00', fin: '22:30' }] }] },
  { id: 'SIS-26', num: '26', name: 'Redes de Datos', hours: '4 hs/sem', level: 4, correlCursada: ['SIS-15', 'SIS-21'], correlAprobada: [], comisiones: [{ id: 'S41', duration: '2', dias: [{ nombre: 'Miércoles', inicio: '17:30', fin: '20:30' }, { nombre: 'Viernes', inicio: '18:00', fin: '21:00' }] }] },
  { id: 'SIS-27', num: '27', name: 'Investigación Operativa', hours: '4 hs/sem', level: 4, correlCursada: ['UTN-PYE', 'SIS-22'], correlAprobada: [], comisiones: [{ id: 'S41', duration: '1', dias: [{ nombre: 'Miércoles', inicio: '18:00', fin: '20:00' }, { nombre: 'Jueves', inicio: '18:00', fin: '22:00' }] }] },
  { id: 'SIS-28', num: '28', name: 'Simulación', hours: '3 hs/sem', level: 4, correlCursada: ['UTN-PYE'], correlAprobada: ['UTN-AM2'], comisiones: [{ id: 'S41', duration: '1', dias: [{ nombre: 'Miércoles', inicio: '20:15', fin: '22:30' }, { nombre: 'Viernes', inicio: '18:00', fin: '20:15' }] }] },
  { id: 'SIS-29', num: '29', name: 'Tecnologías para la Automatización', hours: '3 hs/sem', level: 4, correlCursada: ['UTN-F2', 'SIS-22'], correlAprobada: ['UTN-AM2'], comisiones: [{ id: 'S41', duration: '2', dias: [{ nombre: 'Jueves', inicio: '18:00', fin: '22:30' }] }] },
  { id: 'SIS-30', num: '30', name: 'Administración de Sistemas de Información (Integradora)', hours: '6 hs/sem', level: 4, correlCursada: ['UTN-ECO', 'SIS-23'], correlAprobada: ['SIS-16'], comisiones: [{ id: 'S41', duration: 'A', dias: [{ nombre: 'Martes', inicio: '18:00', fin: '20:00' }, { nombre: 'Viernes', inicio: '20:30', fin: '23:00' }] }] },
  { id: 'REQ4', num: 'E4', name: 'Electivas 4° Nivel', hours: 'Req: 6 hs anuales', level: 4, correlCursada: [], correlAprobada: [], isElectivePlaceholder: true, targetHours: 6 },
  { id: 'SIS-31', num: '31', name: 'Inteligencia Artificial', hours: '3 hs/sem', level: 5, correlCursada: ['SIS-28'], correlAprobada: ['UTN-PYE', 'SIS-22'], comisiones: [{ id: 'S51', duration: '1', dias: [{ nombre: 'Sábado', inicio: '08:00', fin: '12:30' }] }] },
  { id: 'SIS-32', num: '32', name: 'Ciencia de Datos', hours: '3 hs/sem', level: 5, correlCursada: ['SIS-28'], correlAprobada: ['UTN-PYE', 'SIS-19'], comisiones: [{ id: 'S51', duration: '1', dias: [{ nombre: 'Miércoles', inicio: '18:00', fin: '20:15' }, { nombre: 'Jueves', inicio: '18:00', fin: '20:15' }] }] },
  { id: 'SIS-33', num: '33', name: 'Sistemas de Gestión', hours: '4 hs/sem', level: 5, correlCursada: ['UTN-ECO', 'SIS-27'], correlAprobada: ['SIS-23'], comisiones: [{ id: 'S51', duration: 'A', dias: [{ nombre: 'Lunes', inicio: '17:30', fin: '20:30' }] }] },
  { id: 'SIS-34', num: '34', name: 'Gestión Gerencial', hours: '3 hs/sem', level: 5, correlCursada: ['UTN-LEG', 'SIS-30'], correlAprobada: ['UTN-ECO'], comisiones: [{ id: 'S51', duration: '1', dias: [{ nombre: 'Lunes', inicio: '20:30', fin: '22:45' }, { nombre: 'Martes', inicio: '18:00', fin: '20:15' }] }] },
  { id: 'SIS-35', num: '35', name: 'Seguridad en los Sistemas de Información', hours: '3 hs/sem', level: 5, correlCursada: ['SIS-26', 'SIS-30'], correlAprobada: ['SIS-20', 'SIS-21'], comisiones: [{ id: 'S51', duration: '2', dias: [{ nombre: 'Lunes', inicio: '20:30', fin: '22:45' }, { nombre: 'Miércoles', inicio: '18:00', fin: '20:15' }] }] },
  { id: 'SIS-36', num: '36', name: 'Proyecto Final (Integradora)', hours: '6 hs/sem', level: 5, correlCursada: ['SIS-25', 'SIS-26', 'SIS-30'], correlAprobada: ['UTN-ING2', 'SIS-20', 'SIS-23'], comisiones: [{ id: 'S51', duration: 'A', dias: [{ nombre: 'Martes', inicio: '20:15', fin: '22:30' }, { nombre: 'Jueves', inicio: '20:30', fin: '22:45' }] }] },
  { id: 'REQ5', num: 'E5', name: 'Electivas 5° Nivel', hours: 'Req: 10 hs anuales', level: 5, correlCursada: [], correlAprobada: [], isElectivePlaceholder: true, targetHours: 10 },
  { id: 'PPS', num: 'PPS', name: 'Práctica Profesional Supervisada', hours: '200Hrs', level: 5, correlCursada: [], correlAprobada: [] },
];

const ELECTIVAS = {
  3: [
    { id: 'SIS-E2', num: 'E1', name: 'Sistemas de Tiempo Real', hours: '6 hs/sem (3 hs anuales)', annualHours: 3, correlCursada: ['SIS-15'], correlAprobada: ['SIS-7'], comisiones: [{ id: 'S31', duration: '2', dias: [{ nombre: 'Miércoles', inicio: '15:30', fin: '17:45' }, { nombre: 'Viernes', inicio: '14:45', fin: '17:00' }] }] },
    { id: 'SIS-E3', num: 'E2', name: 'Tecnología y Gestión Web', hours: '4 hs/sem (2 hs anuales)', annualHours: 2, correlCursada: ['SIS-13', 'SIS-15'], correlAprobada: ['SIS-6'], comisiones: [{ id: 'S31', duration: '1', dias: [{ nombre: 'Viernes', inicio: '11:15', fin: '14:15' }] }] },
    { id: 'SIS-E4', num: 'E3', name: 'Sistemas de Transmisión y Redes Inalámbricas', hours: '4 hs/sem (2 hs anuales)', annualHours: 2, correlCursada: ['UTN-AM2'], correlAprobada: ['SIS-7'], comisiones: [{ id: 'S31', duration: '2', dias: [{ nombre: 'Sábado', inicio: '08:00', fin: '11:00' }] }] },
    { id: 'SIS-E5', num: 'E4', name: 'Responsabilidad Social e Institucional', hours: '4 hs/sem (2 hs anuales)', annualHours: 2, correlCursada: ['SIS-8', 'SIS-16'], correlAprobada: [], comisiones: [{ id: 'S31', duration: '1', dias: [{ nombre: 'Jueves', inicio: '19:15', fin: '20:45' }, { nombre: 'Viernes', inicio: '17:00', fin: '18:30' }] }] },
    { id: 'SIS-E6', num: 'E5', name: 'Comunicación Profesional', hours: '3 hs anuales', annualHours: 3, correlCursada: ['UTN-IYS'], correlAprobada: ['SIS-8'], comisiones: [{ id: 'S31', duration: 'A', dias: [{ nombre: 'Jueves', inicio: '14:00', fin: '16:15' }] }] },
  ],
  4: [
    { id: 'SIS-E7', num: 'E6', name: 'Administración de Base de Datos', hours: '4 hs/sem (2 hs anuales)', annualHours: 2, correlCursada: ['SIS-19'], correlAprobada: ['SIS-15'], comisiones: [{ id: 'S41', duration: '2', dias: [{ nombre: 'Martes', inicio: '20:15', fin: '23:15' }] }] },
    { id: 'SIS-E8', num: 'E7', name: 'Desarrollo de Software Cloud', hours: '4 hs/sem (2 hs anuales)', annualHours: 2, correlCursada: ['SIS-15', 'SIS-20', 'SIS-23'], correlAprobada: ['SIS-13', 'SIS-14'], comisiones: [{ id: 'S41', duration: '2', dias: [{ nombre: 'Lunes', inicio: '17:15', fin: '20:15' }] }] },
    { id: 'SIS-E9', num: 'E8', name: 'Diseño Inclusivo para Usuarios con Discapacidad', hours: '4 hs/sem (2 hs anuales)', annualHours: 2, correlCursada: ['SIS-23'], correlAprobada: ['SIS-16'], comisiones: [{ id: 'S41', duration: '1', dias: [{ nombre: 'Sábado', inicio: '11:00', fin: '14:00' }] }] },
    { id: 'SIS-E11', num: 'E9', name: 'Metodologías Agiles', hours: '6 hs/sem (3 hs anuales)', annualHours: 3, correlCursada: ['SIS-19', 'SIS-20', 'SIS-23'], correlAprobada: ['SIS-16'], comisiones: [{ id: 'S41', duration: '2', dias: [{ nombre: 'Miércoles', inicio: '20:30', fin: '22:45' }, { nombre: 'Sábado', inicio: '08:30', fin: '10:45' }] }] },
    { id: 'SIS-E13', num: 'E10', name: 'Tecnologías para la Explotación de la Información (1ª Cuatr.)', hours: '4 hs/sem (2 hs anuales)', annualHours: 2, correlCursada: ['UTN-PYE', 'SIS-23'], correlAprobada: ['SIS-14'], comisiones: [{ id: 'S41', duration: '1', dias: [{ nombre: 'Sábado', inicio: '08:00', fin: '11:00' }] }] },
    { id: 'SIS-E14', num: 'E11', name: 'Aplicaciones Moviles', hours: '4 hs/sem (2 hs anuales)', annualHours: 2, correlCursada: ['SIS-14', 'SIS-23'], correlAprobada: ['SIS-6'], comisiones: [{ id: 'S41', duration: '1', dias: [{ nombre: 'Martes', inicio: '20:15', fin: '23:15' }] }] },
  ],
  5: [
    { id: 'SIS-E15', num: 'E12', name: 'Ingeniería en Calidad', hours: '3 hs anuales', annualHours: 3, correlCursada: ['SIS-30'], correlAprobada: ['SIS-23'], comisiones: [{ id: 'S51', duration: 'A', dias: [{ nombre: 'Miércoles', inicio: '20:15', fin: '22:30' }] }] },
    { id: 'SIS-E17', num: 'E13', name: 'Protocolos y Seguridad en Redes Inalámbricas', hours: '4 hs/sem (2 hs anuales)', annualHours: 2, correlCursada: ['SIS-21', 'SIS-26'], correlAprobada: ['UTN-AM2', 'UTN-F2'], comisiones: [{ id: 'S51', duration: '1', dias: [{ nombre: 'Viernes', inicio: '20:15', fin: '23:15' }] }] },
    { id: 'SIS-E18', num: 'E14', name: 'Sistemas en la Industria 4.0', hours: '6 hs/sem (3 hs anuales)', annualHours: 3, correlCursada: ['SIS-19', 'SIS-21', 'SIS-25', 'SIS-26'], correlAprobada: ['SIS-7'], comisiones: [{ id: 'S51', duration: '2', dias: [{ nombre: 'Viernes', inicio: '18:00', fin: '22:30' }] }] },
    { id: 'SIS-E19', num: 'E15', name: 'Tecnologias de Información para la Gestión Empresarial', hours: '4 hs/sem (2 hs anuales)', annualHours: 2, correlCursada: ['SIS-25'], correlAprobada: ['SIS-23'], comisiones: [{ id: 'S51', duration: '1', dias: [{ nombre: 'Viernes', inicio: '17:15', fin: '20:15' }] }] },
    { id: 'SIS-E20', num: 'E16', name: 'Emprendedorismo', hours: '2 hs anuales', annualHours: 2, correlCursada: ['UTN-ECO', 'UTN-LEG'], correlAprobada: [], comisiones: [{ id: 'S51', duration: 'A', dias: [{ nombre: 'Lunes', inicio: '17:00', fin: '18:30' }] }] },
    { id: 'SIS-E21', num: 'E17', name: 'Gestión Operativa y Seguridad en Redes (2° Cuatr.)', hours: '6 hs/sem (3 hs anuales)', annualHours: 3, correlCursada: [], correlAprobada: ['SIS-26'], comisiones: [{ id: 'S51', duration: '2', dias: [{ nombre: 'Martes', inicio: '18:00', fin: '20:15' }, { nombre: 'Jueves', inicio: '18:00', fin: '20:15' }] }] },
  ],
};

const ALL = [
  ...SUBJECTS,
  ...ELECTIVAS[3],
  ...ELECTIVAS[4],
  ...ELECTIVAS[5],
];

function getSubjectById(id: string) {
  return ALL.find((s) => s.id === id);
}

export {
  careerInfo,
  SUBJECTS,
  ELECTIVAS,
  ALL,
  getSubjectById,
};