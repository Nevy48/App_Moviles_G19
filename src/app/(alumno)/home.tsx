import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Image,
  LayoutAnimation,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  BookOpen,
  Clock,
  CheckCircle,
  Calendar,
  MapPin,
  X,
  Plus,
  Edit2,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Trash2
} from 'lucide-react-native';
import { Card, SubjectCard } from '@/components/ui';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { materiasService } from '@/services/materiasService';
import { eventosService } from '@/services/eventosService';
import { planesService } from '@/services/planesService';
import { progresoService } from '@/services/progresoService';
import { suscripcionesService } from '@/services/suscripcionesService';
import { Materia, PlanEstudio } from '@/lib/supabase/database.types';
export type ExtendedSubjectStatus = 'disabled' | 'available' | 'pending' | 'in_progress' | 'cursada' | 'approved';

type SubjectEvent = { id: string; title: string; type: string; date: string; id_materia?: string | null; };
type SubjectSchedule = { day: string; startTime: string; endTime: string; room: string; };
// Cambio a multiples horarios (Array)
type MateriaWithStatus = Materia & { status: ExtendedSubjectStatus; schedules?: SubjectSchedule[] };

const logoUrl = 'https://res.cloudinary.com/disx14b4q/image/upload/v1779402010/image_2_bluupa.png';

const SUBJECT_STATUS_KEY = '@materias_status';
const USER_PLAN_KEY = '@plan_id_alumno';
const SCHEDULES_MAP_KEY = '@horarios_materias_mapa';

export default function AlumnoHomeScreen() {
  const { perfil } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [materias, setMaterias] = useState<MateriaWithStatus[]>([]);
  const [events, setEvents] = useState<SubjectEvent[]>([]);
  const [planActivo, setPlanActivo] = useState<PlanEstudio | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados modales
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalView, setModalView] = useState<'main' | 'add_event' | 'edit_schedule' | 'select_day' | 'select_type' | 'select_date' | 'select_start_time' | 'select_end_time'>('main');
  const [selectedMateria, setSelectedMateria] = useState<MateriaWithStatus | null>(null);

  // Estados formulario eventos
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState('Parcial');
  const [newEventDate, setNewEventDate] = useState(new Date());

  // Estados formulario horario
  const [newScheduleDay, setNewScheduleDay] = useState('Lunes');
  const [newScheduleRoom, setNewScheduleRoom] = useState('');
  const [newScheduleStart, setNewScheduleStart] = useState(new Date(new Date().setHours(15, 0, 0, 0)));
  const [newScheduleEnd, setNewScheduleEnd] = useState(new Date(new Date().setHours(17, 0, 0, 0)));

  const [mostrarTodosEventos, setMostrarTodosEventos] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      if (!perfil?.id) return;

      // Usamos la función en plural que creamos en el servicio
      const planes = await suscripcionesService.getPlanesSuscritos(perfil.id);
      
      // Tomamos el primer plan activo (o null si el array está vacío)
      const plan = planes.length > 0 ? planes[0] : null;
      
      // Si no tiene plan, limpiamos estados y salimos
      if (!plan) { 
        setPlanActivo(null);
        setMaterias([]);
        setEvents([]);
        setLoading(false); 
        return; 
      }
      
      setPlanActivo(plan);

      // Si tiene plan, cargamos todo normalmente
      const [materiasData, progresoData, eventosData] = await Promise.all([
        materiasService.getByPlan(plan.id),
        progresoService.getProgresoAlumno(perfil.id),
        eventosService.getByAlumno(perfil.id)
      ]);
      
      const progresoMap = progresoData.reduce((acc: any, curr) => {
        acc[curr.id_materia] = { estado: curr.estado, horarios: curr.horarios || [] };
        return acc;
      }, {});

      setMaterias(materiasData.map(m => ({
        ...m,
        status: progresoMap[m.id]?.estado || 'pending',
        schedules: progresoMap[m.id]?.horarios || []
      })));

      setEvents(eventosData.map((e: any) => ({
        id: e.id,
        title: e.titulo,
        type: e.tipo === 'parcial' ? 'Parcial' : e.tipo === 'tp' ? 'TP' : 'Exposición',
        date: new Date(e.fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }),
        id_materia: e.id_materia,
      })));

    } catch (e) { 
        console.error(e); 
    } finally { 
        setLoading(false); 
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, [perfil?.id]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleEventos = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMostrarTodosEventos(!mostrarTodosEventos);
  };

  const openModal = (materia: MateriaWithStatus) => {
    setSelectedMateria(materia);
    setNewScheduleDay('Lunes');
    setNewScheduleRoom('');
    setModalView('main');
    setShowDetailModal(true);
  };

  const handleSaveEvent = async () => {
    if (!newEventTitle || !perfil?.id || !selectedMateria) return;
    const tipoMapeo: Record<string, 'parcial' | 'tp' | 'exposicion'> = { 'Parcial': 'parcial', 'TP': 'tp', 'Exposición': 'exposicion' };

    const eventoBackend = {
      titulo: newEventTitle,
      tipo: tipoMapeo[newEventType] || 'parcial',
      fecha: newEventDate.toISOString().split('T')[0],
      id_materia: selectedMateria.id,
    };

    const createdEvento = await eventosService.create(perfil.id, eventoBackend);
    if (createdEvento) {
      const newEvent: SubjectEvent = {
        id: createdEvento.id,
        title: createdEvento.titulo,
        type: newEventType,
        date: formatDate(newEventDate),
        id_materia: createdEvento.id_materia,
      };
      setEvents([...events, newEvent]);
    }
    setNewEventTitle(''); setModalView('main');
  };

  const handleDeleteEvent = async (id: string) => {
    const success = await eventosService.delete(id);
    if (success) setEvents(events.filter((e) => e.id !== id));
  };

  // Guardar un nuevo bloque horario en el Array
  const handleSaveSchedule = async () => {
    if (!selectedMateria || !perfil?.id) return;
    
    const newBlock = {
      day: newScheduleDay,
      startTime: formatTime(newScheduleStart),
      endTime: formatTime(newScheduleEnd),
      room: newScheduleRoom,
    };

    const updatedSchedules = [...(selectedMateria.schedules || []), newBlock];
    const updatedMaterias = materias.map(m => m.id === selectedMateria.id ? { ...m, schedules: updatedSchedules } : m);
    
    setMaterias(updatedMaterias);
    setSelectedMateria({ ...selectedMateria, schedules: updatedSchedules });

    // Guardamos directo en Supabase
    await progresoService.upsertProgreso(perfil.id, selectedMateria.id, selectedMateria.status, updatedSchedules);
    
    setNewScheduleRoom('');
    setModalView('main');
  };

  // Eliminar un bloque horario especifico
  const handleDeleteScheduleBlock = async (index: number) => {
    if (!selectedMateria || !perfil?.id) return;
    const updatedSchedules = selectedMateria.schedules?.filter((_, i) => i !== index) || [];
    
    const updatedMaterias = materias.map(m => m.id === selectedMateria.id ? { ...m, schedules: updatedSchedules } : m);
    setMaterias(updatedMaterias);
    setSelectedMateria({ ...selectedMateria, schedules: updatedSchedules });

    // Actualizamos el array en Supabase
    await progresoService.upsertProgreso(perfil.id, selectedMateria.id, selectedMateria.status, updatedSchedules);
  };

  // Formateador estricto para obviar el a.m / p.m de los sistemas nativos
  const formatTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const formatDate = (date: Date) => {
    const formatted = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Limites del calendario
  const today = new Date();
  const nextYearDate = new Date(today.getFullYear() + 1, 11, 31);

  const cursandoMaterias = materias.filter((m) => m.status === 'in_progress');
  
  // Extraemos todos los horarios y los agrupamos de Lunes a Sábado
  const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const todosLosHorarios = cursandoMaterias.flatMap(m => 
    (m.schedules || []).map(sch => ({ materia: m.nombre, ...sch }))
  );

  const horariosAgrupados = diasOrden.map(dia => ({
    dia,
    horarios: todosLosHorarios.filter(h => h.day === dia).sort((a, b) => a.startTime.localeCompare(b.startTime))
  })).filter(grupo => grupo.horarios.length > 0);

  const eventosDeMateriaSeleccionada = selectedMateria ? events.filter(e => e.id_materia === selectedMateria.id) : [];

  if (loading) return <SafeAreaView style={styles.container}><View style={styles.loadingContainer}><Text style={styles.loadingText}>Cargando tu estado...</Text></View></SafeAreaView>;

  if (!planActivo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyPlanContainer}>
          <BookOpen size={64} color={colors.primary} style={{ marginBottom: 20 }} />
          <Text style={styles.emptyTitle}>Aún no seleccionaste carrera</Text>
          <Text style={styles.emptySubtitle}>Ve a la pestaña de "Materias" para inscribirte en un Plan de Estudios.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = {
    total: materias.length || 1,
    approved: materias.filter((m) => m.status === 'approved').length,
    inProgress: cursandoMaterias.length,
    cursada: materias.filter((m) => m.status === 'cursada').length,
    percentage: Math.round((materias.filter((m) => m.status === 'approved').length / (materias.length || 1)) * 100),
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Hola, {perfil?.nombre_completo?.split(' ')[0] || 'Alumno'}</Text>
            <Text style={styles.careerText} numberOfLines={1}>{planActivo.nombre}</Text>
          </View>
          <Image source={{ uri: logoUrl }} style={styles.logo} />
        </View>

        <View style={styles.progressGradient}>
          <LinearGradient colors={[colors.primary + '40', colors.primary + '10']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.progressGradientChild}>
            <View style={styles.progressHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.progressTitle}>Progreso Académico</Text>
                <Text style={styles.progressSubtitle}>{stats.approved} de {stats.total} materias completadas</Text>
              </View>
              <View style={styles.percentageContainer}><Text style={styles.percentage}>{stats.percentage}%</Text></View>
            </View>
            <View style={{ width: '100%' }}><ProgressBar percentage={stats.percentage} showPercentage={false} height={8} color={[colors.primary, colors.primaryLight]} /></View>
            <View style={styles.progressStats}>
              <View style={styles.progressStat}><CheckCircle size={14} color={colors.success} /><Text style={styles.progressStatText}>{stats.approved} aprobadas</Text></View>
              <View style={styles.progressStat}><BookOpen size={14} color={colors.primary} /><Text style={styles.progressStatText}>{stats.inProgress} cursando</Text></View>
              <View style={styles.progressStat}><CheckCircle size={14} color={colors.warning} /><Text style={styles.progressStatText}>{stats.cursada} cursadas</Text></View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Horarios de Cursada</Text>
        </View>
        {horariosAgrupados.length > 0 ? (
          horariosAgrupados.map(grupo => (
            <View key={grupo.dia} style={{ marginBottom: spacing.md }}>
              <Text style={styles.daySubHeader}>{grupo.dia}</Text>
              {grupo.horarios.map((horario, index) => (
                <Card key={`${grupo.dia}-${index}`} style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <View style={styles.iconContainer}><Clock size={24} color={colors.primary} /></View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoTitle}>{horario.materia}</Text>
                      <View style={styles.infoDetailRow}>
                        <Clock size={14} color={colors.textSecondary} />
                        <Text style={styles.infoDetailText}>De {horario.startTime} a {horario.endTime} hs</Text>
                      </View>
                      {horario.room ? (
                        <View style={[styles.infoDetailRow, { marginTop: 4 }]}>
                          <MapPin size={14} color={colors.textSecondary} />
                          <Text style={styles.infoDetailText}>{horario.room}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No tienes horarios de cursada registrados.</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos Eventos</Text>
        </View>
        {events.length > 0 ? (
          <View>
            {events.slice(0, mostrarTodosEventos ? events.length : 3).map((event, index) => (
              <Card key={event.id} style={[styles.infoCard, { opacity: (!mostrarTodosEventos && index === 2 && events.length > 3) ? 0.4 : 1 }]}>
                <View style={styles.infoRow}>
                  <View style={[styles.iconContainer, { backgroundColor: event.type === 'Parcial' ? colors.warning + '20' : colors.primary + '20' }]}>
                    <Calendar size={24} color={event.type === 'Parcial' ? colors.warning : colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>{event.title}</Text>
                    <View style={styles.infoDetailRow}>
                      <Text style={[styles.infoDetailText, { color: event.type === 'Parcial' ? colors.warning : colors.primary, fontFamily: fontFamily.bold }]}>{event.type}</Text>
                      <Text style={styles.infoDot}>•</Text>
                      <Text style={styles.infoDetailText}>{event.date}</Text>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
            {events.length > 3 && (
              <TouchableOpacity style={styles.mostrarMasBtn} onPress={toggleEventos}>
                <Text style={styles.mostrarMasText}>{mostrarTodosEventos ? 'Ocultar eventos' : `Ver ${events.length - 3} eventos más`}</Text>
                {mostrarTodosEventos ? <ChevronUp size={16} color={colors.primary} /> : <ChevronDown size={16} color={colors.primary} />}
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No hay eventos próximos.</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Materias en curso</Text>
        </View>

        {cursandoMaterias.length > 0 ? (
          cursandoMaterias.map(materia => (
            <SubjectCard
              key={materia.id}
              name={materia.nombre}
              code={`Nivel ${materia.nivel}`}
              status={materia.status}
              year={materia.nivel}
              semester={1}
              credits={0}
              hours={`${materia.horas_anuales} hs`}
              correlCursada={[]}
              correlAprobada={[]}
              isElectivePlaceholder={false}
              isSeminario={false}
              onPress={() => openModal(materia)}
              canChangeTo={[]}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <BookOpen size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No estás cursando materias</Text>
            <Text style={styles.emptySubtitle}>Actualiza el estado desde tu Plan de Estudios.</Text>
          </View>
        )}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* MODAL INFERIOR DE GESTIÓN */}
      <Modal visible={showDetailModal && selectedMateria !== null} animationType="slide" transparent={true} onRequestClose={() => setShowDetailModal(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0} style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={styles.modalContent}>

              {modalView === 'main' && selectedMateria && (
                <>
                  <View style={styles.modalHeader}>
                    <View>
                      <Text style={styles.modalCode}>Nivel {selectedMateria.nivel}</Text>
                      <Text style={styles.modalTitle}>{selectedMateria.nombre}</Text>
                    </View>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setShowDetailModal(false)}>
                      <X size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                    <View style={styles.configSection}>
                      <View style={styles.configHeader}>
                        <Text style={styles.configTitle}>Horarios de Cursada</Text>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => setModalView('edit_schedule')}>
                          <Edit2 size={18} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                      
                      {selectedMateria.schedules && selectedMateria.schedules.length > 0 ? (
                        selectedMateria.schedules.map((sch, index) => (
                          <View key={index} style={[styles.schedulePreview, { marginBottom: 6 }]}>
                            <Clock size={16} color={colors.textSecondary} />
                            <Text style={styles.scheduleText}>{sch.day} de {sch.startTime} a {sch.endTime} hs</Text>
                            {sch.room ? (
                              <>
                                <MapPin size={16} color={colors.textSecondary} style={{ marginLeft: 8 }} />
                                <Text style={styles.scheduleText}>{sch.room}</Text>
                              </>
                            ) : null}
                          </View>
                        ))
                      ) : (
                        <Text style={styles.emptyConfigText}>No hay horarios asignados.</Text>
                      )}
                    </View>

                    <View style={styles.configSection}>
                      <View style={styles.configHeader}>
                        <Text style={styles.configTitle}>Eventos de la materia</Text>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => setModalView('add_event')}>
                          <Plus size={18} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                      {eventosDeMateriaSeleccionada.length > 0 ? (
                        <View style={styles.eventsList}>
                          {eventosDeMateriaSeleccionada.map((ev) => (
                            <View key={ev.id} style={styles.eventListItem}>
                              <View>
                                <Text style={styles.eventListTitle}>{ev.title}</Text>
                                <View style={styles.eventListSub}>
                                  <Text style={[styles.eventListType, { color: ev.type === 'Parcial' ? colors.warning : colors.primary }]}>{ev.type}</Text>
                                  <Text style={styles.eventListDate}> • {ev.date}</Text>
                                </View>
                              </View>
                              <TouchableOpacity onPress={() => handleDeleteEvent(ev.id)}><X size={20} color={colors.error} /></TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.emptyConfigText}>No hay eventos programados.</Text>
                      )}
                    </View>
                  </ScrollView>
                </>
              )}

              {/* VISTA AÑADIR EVENTO */}
              {modalView === 'add_event' && (
                <>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity style={styles.backButton} onPress={() => setModalView('main')}><ChevronLeft size={24} color={colors.textPrimary} /></TouchableOpacity>
                    <Text style={styles.modalTitleCenter}>Nuevo Evento</Text>
                    <View style={{ width: 40 }} />
                  </View>
                  <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
                    <Text style={styles.inputLabel}>Título del Evento</Text>
                    <TextInput style={styles.input} placeholder="Ej. Trabajo Práctico 1" placeholderTextColor={colors.textTertiary} value={newEventTitle} onChangeText={setNewEventTitle} />
                    
                    <Text style={styles.inputLabel}>Fecha</Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => setModalView('select_date')}>
                      <Calendar size={18} color={colors.textSecondary} /><Text style={styles.pickerButtonText}>{formatDate(newEventDate)}</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.inputLabel}>Tipo</Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => setModalView('select_type')}>
                      <BookOpen size={18} color={colors.textSecondary} /><Text style={styles.pickerButtonText}>{newEventType}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.primaryButton} onPress={handleSaveEvent}><Text style={styles.primaryButtonText}>Guardar Evento</Text></TouchableOpacity>
                  </ScrollView>
                </>
              )}

              {/* VISTA GESTIONAR HORARIOS (MULTIPLES) */}
              {modalView === 'edit_schedule' && selectedMateria && (
                <>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity style={styles.backButton} onPress={() => setModalView('main')}><ChevronLeft size={24} color={colors.textPrimary} /></TouchableOpacity>
                    <Text style={styles.modalTitleCenter}>Configurar Horarios</Text>
                    <View style={{ width: 40 }} />
                  </View>
                  <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
                    
                    <Text style={styles.inputLabel}>Bloques Guardados</Text>
                    {selectedMateria.schedules && selectedMateria.schedules.length > 0 ? (
                      selectedMateria.schedules.map((sch, idx) => (
                        <View key={idx} style={styles.scheduleBlockItem}>
                          <Text style={styles.infoDetailText}>{sch.day}, {sch.startTime} a {sch.endTime} {sch.room ? `(${sch.room})` : ''}</Text>
                          <TouchableOpacity onPress={() => handleDeleteScheduleBlock(idx)}>
                            <Trash2 size={18} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptyConfigText}>Sin bloques cargados.</Text>
                    )}

                    <View style={styles.divider} />
                    <Text style={[styles.modalTitleCenter, { textAlign: 'center', marginVertical: spacing.sm }]}>Agregar Nuevo Bloque</Text>

                    <Text style={styles.inputLabel}>Día de la semana</Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => setModalView('select_day')}>
                      <Calendar size={18} color={colors.textSecondary} /><Text style={styles.pickerButtonText}>{newScheduleDay}</Text>
                    </TouchableOpacity>

                    <View style={styles.timePickersRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Hora Inicio</Text>
                        <TouchableOpacity style={styles.pickerButton} onPress={() => setModalView('select_start_time')}>
                          <Clock size={18} color={colors.textSecondary} /><Text style={styles.pickerButtonText}>{formatTime(newScheduleStart)} hs</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{ width: spacing.md }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Hora Fin</Text>
                        <TouchableOpacity style={styles.pickerButton} onPress={() => setModalView('select_end_time')}>
                          <Clock size={18} color={colors.textSecondary} /><Text style={styles.pickerButtonText}>{formatTime(newScheduleEnd)} hs</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    <Text style={styles.inputLabel}>Aula / Ubicación (Opcional)</Text>
                    <TextInput style={styles.input} placeholder="Ej. Aula 12" placeholderTextColor={colors.textTertiary} value={newScheduleRoom} onChangeText={setNewScheduleRoom} />
                    
                    <TouchableOpacity style={styles.primaryButton} onPress={handleSaveSchedule}>
                      <Text style={styles.primaryButtonText}>Añadir Horario</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </>
              )}

              {/* VISTAS SELECTORAS NATIVAS */}
              {modalView === 'select_type' && (
                <>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity style={styles.backButton} onPress={() => setModalView('add_event')}><ChevronLeft size={24} color={colors.textPrimary} /></TouchableOpacity>
                    <Text style={styles.modalTitleCenter}>Seleccionar Tipo</Text>
                    <View style={{ width: 40 }} />
                  </View>
                  <ScrollView style={styles.modalBody}>
                    {['Parcial', 'TP', 'Exposición'].map(t => (
                      <TouchableOpacity key={t} style={styles.selectionListItem} onPress={() => { setNewEventType(t); setModalView('add_event'); }}>
                        <Text style={styles.selectionListText}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              {modalView === 'select_day' && (
                <>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity style={styles.backButton} onPress={() => setModalView('edit_schedule')}><ChevronLeft size={24} color={colors.textPrimary} /></TouchableOpacity>
                    <Text style={styles.modalTitleCenter}>Seleccionar Día</Text>
                    <View style={{ width: 40 }} />
                  </View>
                  <ScrollView style={styles.modalBody}>
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(d => (
                      <TouchableOpacity key={d} style={styles.selectionListItem} onPress={() => { setNewScheduleDay(d); setModalView('edit_schedule'); }}>
                        <Text style={styles.selectionListText}>{d}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              {modalView === 'select_date' && (
                <>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity style={styles.backButton} onPress={() => setModalView('add_event')}><ChevronLeft size={24} color={colors.textPrimary} /></TouchableOpacity>
                    <Text style={styles.modalTitleCenter}>Seleccionar Fecha</Text>
                    <View style={{ width: 40 }} />
                  </View>
                  <View style={styles.modalBody}>
                    <View style={styles.pickerContainerCentral}>
                      <Text style={styles.pickerColumnLabels}>DÍA       /       MES       /       AÑO</Text>
                      <DateTimePicker 
                        value={newEventDate} 
                        mode="date" 
                        display="spinner"
                        locale="es-AR"
                        minimumDate={today}
                        maximumDate={nextYearDate}
                        textColor={colors.textPrimary}
                        onChange={(e, date) => { if (date) setNewEventDate(date); }} 
                      />
                    </View>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => setModalView('add_event')}>
                      <Text style={styles.primaryButtonText}>Confirmar Fecha</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {modalView === 'select_start_time' && (
                <>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity style={styles.backButton} onPress={() => setModalView('edit_schedule')}><ChevronLeft size={24} color={colors.textPrimary} /></TouchableOpacity>
                    <Text style={styles.modalTitleCenter}>Hora de Inicio</Text>
                    <View style={{ width: 40 }} />
                  </View>
                  <View style={styles.modalBody}>
                    <View style={styles.pickerContainerCentral}>
                      <Text style={styles.pickerColumnLabels}>HORA    :    MINUTOS</Text>
                      <DateTimePicker 
                        value={newScheduleStart} 
                        mode="time" 
                        is24Hour={true}
                        locale="en-GB"
                        display="spinner"
                        textColor={colors.textPrimary}
                        onChange={(e, date) => { if (date) setNewScheduleStart(date); }} 
                      />
                    </View>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => setModalView('edit_schedule')}>
                      <Text style={styles.primaryButtonText}>Confirmar Hora</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {modalView === 'select_end_time' && (
                <>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity style={styles.backButton} onPress={() => setModalView('edit_schedule')}><ChevronLeft size={24} color={colors.textPrimary} /></TouchableOpacity>
                    <Text style={styles.modalTitleCenter}>Hora de Fin</Text>
                    <View style={{ width: 40 }} />
                  </View>
                  <View style={styles.modalBody}>
                    <View style={styles.pickerContainerCentral}>
                      <Text style={styles.pickerColumnLabels}>HORA    :    MINUTOS</Text>
                      <DateTimePicker 
                        value={newScheduleEnd} 
                        mode="time" 
                        is24Hour={true}
                        locale="en-GB"
                        display="spinner"
                        textColor={colors.textPrimary}
                        onChange={(e, date) => { if (date) setNewScheduleEnd(date); }} 
                      />
                    </View>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => setModalView('edit_schedule')}>
                      <Text style={styles.primaryButtonText}>Confirmar Hora</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: fontSize.md, color: colors.textSecondary },
  emptyPlanContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  scrollContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.lg },
  greeting: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, color: colors.textPrimary },
  careerText: { fontSize: fontSize.md, fontFamily: fontFamily.monoRegular, color: colors.textSecondary, marginTop: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.8, paddingRight: 10 },
  logo: { width: 48, height: 48, borderRadius: borderRadius.md },
  progressGradient: { backgroundColor: colors.card, borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.lg },
  progressGradientChild: { padding: spacing.lg },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md, gap: spacing.md },
  progressTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, color: colors.textPrimary },
  progressSubtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary, marginTop: spacing.xs },
  percentageContainer: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  percentage: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, color: colors.white },
  progressStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg, flexWrap: 'wrap', gap: 10 },
  progressStat: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  progressStatText: { fontSize: fontSize.xs, fontFamily: fontFamily.medium, color: colors.textSecondary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm, marginTop: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, color: colors.textPrimary },
  infoCard: { padding: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.card },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconContainer: { backgroundColor: colors.primary + '20', padding: spacing.md, borderRadius: borderRadius.lg },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.textPrimary, marginBottom: spacing.xs },
  infoDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoDetailText: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary },
  infoDot: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textTertiary, marginHorizontal: 4 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl, backgroundColor: colors.inputBackground, borderRadius: borderRadius.lg, marginTop: spacing.sm },
  emptyTitle: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.textSecondary, marginTop: spacing.md },
  emptySubtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xs, paddingHorizontal: spacing.lg },
  emptyStateContainer: { padding: spacing.md, alignItems: 'center' },
  emptyStateText: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textTertiary },
  mostrarMasBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.xs, marginTop: -15, backgroundColor: 'transparent' },
  mostrarMasText: { color: colors.primary, fontFamily: fontFamily.bold, fontSize: fontSize.sm },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.card, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '90%', minHeight: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  modalCode: { fontSize: fontSize.sm, fontFamily: fontFamily.monoBold, color: colors.primary },
  modalTitle: { fontSize: fontSize.xl, fontFamily: fontFamily.bold, color: colors.textPrimary, marginTop: spacing.xs, maxWidth: '85%' },
  modalTitleCenter: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, color: colors.textPrimary },
  closeButton: { padding: spacing.xs },
  backButton: { padding: spacing.xs, marginLeft: -8 },
  modalBody: { padding: spacing.lg },

  configSection: { marginTop: spacing.sm, marginBottom: spacing.lg, padding: spacing.md, backgroundColor: colors.inputBackground, borderRadius: borderRadius.md },
  configHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  configTitle: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.textPrimary },
  iconBtn: { padding: spacing.xs, backgroundColor: colors.primary + '15', borderRadius: borderRadius.sm },
  schedulePreview: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  scheduleText: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary, marginLeft: 6 },
  scheduleBlockItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.background, padding: spacing.sm, borderRadius: borderRadius.sm, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.cardBorder },
  emptyConfigText: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textTertiary, fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: colors.cardBorder, marginVertical: spacing.md },

  eventsList: { gap: spacing.sm },
  eventListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: spacing.sm, borderRadius: borderRadius.sm, borderLeftWidth: 3, borderLeftColor: colors.primary },
  eventListTitle: { fontSize: fontSize.sm, fontFamily: fontFamily.bold, color: colors.textPrimary, flexShrink: 1 },
  eventListSub: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  eventListType: { fontSize: fontSize.xs, fontFamily: fontFamily.bold },
  eventListDate: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textSecondary },

  inputLabel: { fontSize: fontSize.sm, fontFamily: fontFamily.bold, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: borderRadius.md, padding: spacing.md, fontSize: fontSize.md, fontFamily: fontFamily.regular, color: colors.textPrimary },
  
  timePickersRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  pickerButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.sm, marginTop: spacing.xs },
  pickerButtonText: { fontSize: fontSize.md, fontFamily: fontFamily.regular, color: colors.textPrimary },
  
  pickerContainerCentral: { alignItems: 'center', justifyContent: 'center', marginVertical: spacing.lg },
  pickerColumnLabels: { fontSize: fontSize.xs, fontFamily: fontFamily.bold, color: colors.textSecondary, marginBottom: -10, zIndex: 10, letterSpacing: 2 },
  
  selectionListItem: { paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  selectionListText: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.textPrimary, textAlign: 'center' },

  primaryButton: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.xl },
  primaryButtonText: { color: colors.white, fontSize: fontSize.md, fontFamily: fontFamily.bold },
  daySubHeader: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.primary, marginBottom: spacing.sm, marginTop: spacing.xs, textTransform: 'uppercase', letterSpacing: 1 },
});