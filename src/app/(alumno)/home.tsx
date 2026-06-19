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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
} from 'lucide-react-native';
import { Card, SubjectCard } from '@/components/ui';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { materiasService } from '@/services/materiasService';
import { eventosService } from '@/services/eventosService';
import { planesService } from '@/services/planesService';
import { Materia } from '@/lib/supabase/database.types';

export type ExtendedSubjectStatus = 'disabled' | 'available' | 'pending' | 'in_progress' | 'cursada' | 'approved';

type SubjectEvent = {
  id: string;
  title: string;
  type: string;
  date: string;
  id_materia?: string | null;
};

type SubjectSchedule = {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
};

type MateriaWithStatus = Materia & {
  status: ExtendedSubjectStatus;
};

const logoUrl = 'https://res.cloudinary.com/disx14b4q/image/upload/v1779402010/image_2_bluupa.png';

const SUBJECT_STATUS_KEY = '@materias_status';
const SUBJECT_SCHEDULE_KEY = '@materia_schedule';
const PLAN_ID_KEY = '@plan_id';
const PLAN_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; // Plan Ingeniería en Sistemas 2023

export default function AlumnoHomeScreen() {
  const { perfil } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [materias, setMaterias] = useState<MateriaWithStatus[]>([]);
  const [events, setEvents] = useState<SubjectEvent[]>([]);
  const [schedule, setSchedule] = useState<SubjectSchedule | null>(null);
  const [planNombre, setPlanNombre] = useState('Ingeniería en Sistemas');
  const [loading, setLoading] = useState(true);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalView, setModalView] = useState<'main' | 'add_event' | 'edit_schedule'>('main');
  const [selectedMateria, setSelectedMateria] = useState<MateriaWithStatus | null>(null);

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState('Parcial');
  const [newEventDate, setNewEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [newScheduleDay, setNewScheduleDay] = useState('Lunes');
  const [newScheduleRoom, setNewScheduleRoom] = useState('');
  const [newScheduleStart, setNewScheduleStart] = useState(new Date(new Date().setHours(15, 0, 0, 0)));
  const [newScheduleEnd, setNewScheduleEnd] = useState(new Date(new Date().setHours(17, 0, 0, 0)));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const loadData = async () => {
    try {
      // Load plan info
      const plan = await planesService.getById(PLAN_ID);
      if (plan) {
        setPlanNombre(plan.nombre.replace(' - Plan 2023', ''));
      }

      // Load subjects from Supabase
      const materiasData = await materiasService.getByPlan(PLAN_ID);

      // Load saved statuses from AsyncStorage
      const savedStatuses = await AsyncStorage.getItem(SUBJECT_STATUS_KEY);
      const statusMap: Record<string, ExtendedSubjectStatus> = savedStatuses ? JSON.parse(savedStatuses) : {};

      // Combine subjects with their statuses
      const materiasConStatus: MateriaWithStatus[] = materiasData.map((m) => ({
        ...m,
        status: statusMap[m.id] || 'pending',
      }));

      setMaterias(materiasConStatus);

      // Load schedule
      const savedSchedule = await AsyncStorage.getItem(SUBJECT_SCHEDULE_KEY);
      if (savedSchedule) {
        setSchedule(JSON.parse(savedSchedule));
        // Set the selected materia for the schedule
        const cursandoMateria = materiasConStatus.find((m) => m.status === 'in_progress');
        if (cursandoMateria) {
          setSelectedMateria(cursandoMateria);
        }
      }

      // Load events from Supabase if user is logged in
      if (perfil?.id) {
        const eventosData = await eventosService.getByAlumno(perfil.id);
        const formattedEvents: SubjectEvent[] = eventosData.map((e: any) => ({
          id: e.id,
          title: e.titulo,
          type: e.tipo === 'parcial' ? 'Parcial' : e.tipo === 'tp' ? 'TP' : 'Exposición',
          date: new Date(e.fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }),
          id_materia: e.id_materia,
        }));
        setEvents(formattedEvents);
      }
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [perfil?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const formatted = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const handleSaveEvent = async () => {
    if (!newEventTitle || !perfil?.id) return;

    const tipoMapeo: Record<string, 'parcial' | 'tp' | 'exposicion'> = {
      'Parcial': 'parcial',
      'TP': 'tp',
      'Exposición': 'exposicion',
    };

    const eventoBackend = {
      titulo: newEventTitle,
      tipo: tipoMapeo[newEventType] || 'parcial',
      fecha: newEventDate.toISOString().split('T')[0],
      id_materia: selectedMateria?.id || null,
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

    setNewEventTitle('');
    setNewEventType('Parcial');
    setNewEventDate(new Date());
    setModalView('main');
  };

  const handleDeleteEvent = async (id: string) => {
    const success = await eventosService.delete(id);
    if (success) {
      setEvents(events.filter((e) => e.id !== id));
    }
  };

  const handleSaveSchedule = async () => {
    if (!newScheduleRoom) return;
    const scheduleToAdd = {
      day: newScheduleDay,
      startTime: formatTime(newScheduleStart),
      endTime: formatTime(newScheduleEnd),
      room: newScheduleRoom,
    };
    setSchedule(scheduleToAdd);
    setModalView('main');
    try {
      await AsyncStorage.setItem(SUBJECT_SCHEDULE_KEY, JSON.stringify(scheduleToAdd));
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (materiaId: string, newStatus: ExtendedSubjectStatus) => {
    const updatedMaterias = materias.map((m) => {
      if (m.id === materiaId) {
        return { ...m, status: newStatus };
      }
      return m;
    });
    setMaterias(updatedMaterias);

    // Update selectedMateria if needed
    if (selectedMateria?.id === materiaId) {
      setSelectedMateria({ ...selectedMateria, status: newStatus });
    }

    // Save to AsyncStorage
    const statusMap: Record<string, ExtendedSubjectStatus> = {};
    updatedMaterias.forEach((m) => {
      statusMap[m.id] = m.status;
    });
    await AsyncStorage.setItem(SUBJECT_STATUS_KEY, JSON.stringify(statusMap));

    setShowDetailModal(false);
  };

  const openModal = (materia?: MateriaWithStatus) => {
    setModalView('main');
    if (materia) {
      setSelectedMateria(materia);
    }
    if (schedule) {
      setNewScheduleDay(schedule.day);
      setNewScheduleRoom(schedule.room);
    }
    setShowDetailModal(true);
  };

  const cursandoMaterias = materias.filter((m) => m.status === 'in_progress');
  const currentCursando = cursandoMaterias[0] || null;

  const stats = {
    total: materias.length,
    approved: materias.filter((m) => m.status === 'approved').length,
    inProgress: materias.filter((m) => m.status === 'in_progress').length,
    cursada: materias.filter((m) => m.status === 'cursada').length,
    pending: materias.filter((m) => m.status === 'pending').length,
    percentage: materias.length > 0 ? Math.round((materias.filter((m) => m.status === 'approved').length / materias.length) * 100) : 0,
  };

  const getUserName = () => {
    if (perfil?.nombre_completo) {
      const parts = perfil.nombre_completo.split(' ');
      return parts[0];
    }
    return 'Alumno';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {getUserName()}</Text>
            <Text style={styles.careerText}>{planNombre}</Text>
          </View>
          <Image source={{ uri: logoUrl }} style={styles.logo} />
        </View>

        <View style={styles.progressGradient}>
          <LinearGradient
            colors={[colors.primary + '40', colors.primary + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.progressGradientChild}
          >
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>Progreso Académico</Text>
                <Text style={styles.progressSubtitle}>
                  {stats.approved} de {stats.total} materias completadas
                </Text>
              </View>
              <View style={styles.percentageContainer}>
                <Text style={styles.percentage}>{stats.percentage}%</Text>
              </View>
            </View>
            <ProgressBar percentage={stats.percentage} showPercentage={false} height={10} color={[colors.primary, colors.primaryLight]} />
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <CheckCircle size={16} color={colors.success} />
                <Text style={styles.progressStatText}>{stats.approved} aprobadas</Text>
              </View>
              <View style={styles.progressStat}>
                <BookOpen size={16} color={colors.primary} />
                <Text style={styles.progressStatText}>{stats.inProgress} cursando</Text>
              </View>
              <View style={styles.progressStat}>
                <CheckCircle size={16} color={colors.warning} />
                <Text style={styles.progressStatText}>{stats.cursada} cursadas</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Horario de Hoy</Text>
        </View>
        {schedule && currentCursando ? (
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Clock size={24} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{currentCursando.nombre}</Text>
                <View style={styles.infoDetailRow}>
                  <Clock size={14} color={colors.textSecondary} />
                  <Text style={styles.infoDetailText}>{schedule.day} de {schedule.startTime} a {schedule.endTime} hs</Text>
                </View>
                <View style={[styles.infoDetailRow, { marginTop: 4 }]}>
                  <MapPin size={14} color={colors.textSecondary} />
                  <Text style={styles.infoDetailText}>{schedule.room}</Text>
                </View>
              </View>
            </View>
          </Card>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No hay horarios configurados para hoy.</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos Eventos</Text>
        </View>
        {events.length > 0 && currentCursando ? (
          events.slice(0, 3).map((event) => (
            <Card key={event.id} style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={[styles.iconContainer, { backgroundColor: event.type === 'Parcial' ? colors.warning + '20' : colors.primary + '20' }]}>
                  <Calendar size={24} color={event.type === 'Parcial' ? colors.warning : colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>{event.title}</Text>
                  <View style={styles.infoDetailRow}>
                    <Text style={[styles.infoDetailText, { color: event.type === 'Parcial' ? colors.warning : colors.primary }]}>{currentCursando.nombre}</Text>
                    <Text style={styles.infoDot}>•</Text>
                    <Text style={styles.infoDetailText}>{event.date}</Text>
                  </View>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No hay eventos próximos.</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Materias que estoy cursando</Text>
        </View>

        {currentCursando ? (
          <SubjectCard
            name={currentCursando.nombre}
            code={`Nivel ${currentCursando.nivel}`}
            status={currentCursando.status}
            year={currentCursando.nivel}
            semester={1}
            credits={4}
            hours={`${currentCursando.horas_anuales} hs`}
            correlCursada={[]}
            correlAprobada={[]}
            isElectivePlaceholder={false}
            isSeminario={false}
            onPress={() => openModal(currentCursando)}
            canChangeTo={['approved', 'cursada', 'in_progress', 'pending']}
          />
        ) : (
          <View style={styles.emptyState}>
            <BookOpen size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No estás cursando materias</Text>
            <Text style={styles.emptySubtitle}>
              Cambiá el estado de una materia a "Cursando" en tu Plan de Estudios para verla aquí.
            </Text>
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      <Modal visible={showDetailModal && selectedMateria !== null} animationType="slide" transparent={true} onRequestClose={() => setShowDetailModal(false)}>
        <View style={styles.modalOverlay}>
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
                      <Text style={styles.configTitle}>Horario de Cursada</Text>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => setModalView('edit_schedule')}>
                        <Edit2 size={18} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                    {schedule ? (
                      <View style={styles.schedulePreview}>
                        <Clock size={16} color={colors.textSecondary} />
                        <Text style={styles.scheduleText}>{schedule.day} de {schedule.startTime} a {schedule.endTime} hs</Text>
                        <MapPin size={16} color={colors.textSecondary} style={{ marginLeft: 8 }} />
                        <Text style={styles.scheduleText}>{schedule.room}</Text>
                      </View>
                    ) : (
                      <Text style={styles.emptyConfigText}>No hay horario asignado.</Text>
                    )}
                  </View>

                  <View style={styles.configSection}>
                    <View style={styles.configHeader}>
                      <Text style={styles.configTitle}>Eventos ({events.length})</Text>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => setModalView('add_event')}>
                        <Plus size={18} color={colors.primary} />
                      </TouchableOpacity>
                    </View>

                    {events.length > 0 ? (
                      <View style={styles.eventsList}>
                        {events.map((ev) => (
                          <View key={ev.id} style={styles.eventListItem}>
                            <View>
                              <Text style={styles.eventListTitle}>{ev.title}</Text>
                              <View style={styles.eventListSub}>
                                <Text style={[styles.eventListType, { color: ev.type === 'Parcial' ? colors.warning : colors.primary }]}>{ev.type}</Text>
                                <Text style={styles.eventListDate}> • {ev.date}</Text>
                              </View>
                            </View>
                            <TouchableOpacity onPress={() => handleDeleteEvent(ev.id)}>
                              <X size={20} color={colors.error} />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.emptyConfigText}>No hay eventos programados.</Text>
                    )}
                  </View>

                  <View style={styles.configSection}>
                    <View style={styles.configHeader}>
                      <Text style={styles.configTitle}>Cambiar estado</Text>
                    </View>
                    <View style={styles.statusGrid}>
                      {(['pending', 'in_progress', 'cursada', 'approved'] as ExtendedSubjectStatus[]).map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusBtn,
                            selectedMateria.status === status && styles.statusBtnActive,
                          ]}
                          onPress={() => handleStatusChange(selectedMateria.id, status)}
                        >
                          <Text
                            style={[
                              styles.statusBtnText,
                              selectedMateria.status === status && styles.statusBtnTextActive,
                            ]}
                          >
                            {status === 'pending' ? 'Pendiente' :
                             status === 'in_progress' ? 'Cursando' :
                             status === 'cursada' ? 'Cursada' : 'Aprobada'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </ScrollView>
              </>
            )}

            {modalView === 'add_event' && (
              <>
                <View style={styles.modalHeader}>
                  <TouchableOpacity style={styles.backButton} onPress={() => setModalView('main')}>
                    <ChevronLeft size={24} color={colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.modalTitleCenter}>Nuevo Evento</Text>
                  <View style={{ width: 40 }} />
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.inputLabel}>Título del Evento</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. Trabajo Práctico 1"
                    placeholderTextColor={colors.textTertiary}
                    value={newEventTitle}
                    onChangeText={setNewEventTitle}
                  />

                  <Text style={styles.inputLabel}>Fecha</Text>
                  <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
                    <Calendar size={18} color={colors.textSecondary} />
                    <Text style={styles.pickerButtonText}>{formatDate(newEventDate)}</Text>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={newEventDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'inline' : 'spinner'}
                      textColor={colors.textPrimary}
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(Platform.OS === 'ios');
                        if (selectedDate) setNewEventDate(selectedDate);
                      }}
                    />
                  )}

                  <Text style={styles.inputLabel}>Tipo</Text>
                  <View style={styles.typeSelector}>
                    {['Parcial', 'TP', 'Exposición'].map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.typeBtn, newEventType === t && styles.typeBtnActive]}
                        onPress={() => setNewEventType(t)}
                      >
                        <Text style={[styles.typeBtnText, newEventType === t && styles.typeBtnTextActive]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity style={styles.primaryButton} onPress={handleSaveEvent}>
                    <Text style={styles.primaryButtonText}>Guardar Evento</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {modalView === 'edit_schedule' && (
              <>
                <View style={styles.modalHeader}>
                  <TouchableOpacity style={styles.backButton} onPress={() => setModalView('main')}>
                    <ChevronLeft size={24} color={colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.modalTitleCenter}>Configurar Horario</Text>
                  <View style={{ width: 40 }} />
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.inputLabel}>Día de la semana</Text>
                  <View style={styles.daySelector}>
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, index) => {
                      const dayName = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][index];
                      return (
                        <TouchableOpacity
                          key={day}
                          style={[styles.dayBtn, newScheduleDay === dayName && styles.dayBtnActive]}
                          onPress={() => setNewScheduleDay(dayName)}
                        >
                          <Text style={[styles.dayBtnText, newScheduleDay === dayName && styles.dayBtnTextActive]}>{day}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.timePickersRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Hora Inicio</Text>
                      <TouchableOpacity style={styles.pickerButton} onPress={() => { setShowEndPicker(false); setShowStartPicker(true); }}>
                        <Clock size={18} color={colors.textSecondary} />
                        <Text style={styles.pickerButtonText}>{formatTime(newScheduleStart)} hs</Text>
                      </TouchableOpacity>
                      {showStartPicker && (
                        <View style={styles.timePickerContainer}>
                          <DateTimePicker
                            value={newScheduleStart}
                            mode="time"
                            display="spinner"
                            textColor={colors.textPrimary}
                            onChange={(event, selectedDate) => {
                              if (selectedDate) setNewScheduleStart(selectedDate);
                            }}
                          />
                          <TouchableOpacity style={styles.pickerSaveBtn} onPress={() => setShowStartPicker(false)}>
                            <Text style={styles.pickerSaveBtnText}>Guardar</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    <View style={{ width: spacing.md }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Hora Fin</Text>
                      <TouchableOpacity style={styles.pickerButton} onPress={() => { setShowStartPicker(false); setShowEndPicker(true); }}>
                        <Clock size={18} color={colors.textSecondary} />
                        <Text style={styles.pickerButtonText}>{formatTime(newScheduleEnd)} hs</Text>
                      </TouchableOpacity>
                      {showEndPicker && (
                        <View style={styles.timePickerContainer}>
                          <DateTimePicker
                            value={newScheduleEnd}
                            mode="time"
                            display="spinner"
                            textColor={colors.textPrimary}
                            onChange={(event, selectedDate) => {
                              if (selectedDate) setNewScheduleEnd(selectedDate);
                            }}
                          />
                          <TouchableOpacity style={styles.pickerSaveBtn} onPress={() => setShowEndPicker(false)}>
                            <Text style={styles.pickerSaveBtnText}>Guardar</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>Aula / Ubicación</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. Aula 12"
                    placeholderTextColor={colors.textTertiary}
                    value={newScheduleRoom}
                    onChangeText={setNewScheduleRoom}
                  />

                  <TouchableOpacity style={styles.primaryButton} onPress={handleSaveSchedule}>
                    <Text style={styles.primaryButtonText}>Guardar Horario</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: fontSize.md, color: colors.textSecondary },
  scrollContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.lg },
  greeting: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, color: colors.textPrimary },
  careerText: { fontSize: fontSize.md, fontFamily: fontFamily.monoRegular, color: colors.textSecondary, marginTop: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.8 },
  logo: { width: 48, height: 48, borderRadius: borderRadius.md },
  progressGradient: { backgroundColor: colors.card, borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.lg },
  progressGradientChild: { padding: spacing.lg },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  progressTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, color: colors.textPrimary },
  progressSubtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary, marginTop: spacing.xs },
  percentageContainer: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  percentage: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, color: colors.white },
  progressStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  progressStat: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  progressStatText: { fontSize: fontSize.sm, fontFamily: fontFamily.medium, color: colors.textSecondary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm, marginTop: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, color: colors.textPrimary },
  infoCard: { padding: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.card },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconContainer: { backgroundColor: colors.primary + '20', padding: spacing.md, borderRadius: borderRadius.lg },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.textPrimary, marginBottom: spacing.xs },
  infoDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  infoDetailText: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary, flexShrink: 1 },
  infoDot: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textTertiary, marginHorizontal: 4 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl, backgroundColor: colors.inputBackground, borderRadius: borderRadius.lg, marginTop: spacing.sm },
  emptyTitle: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.textSecondary, marginTop: spacing.md },
  emptySubtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xs, paddingHorizontal: spacing.lg },
  emptyStateContainer: { padding: spacing.md, alignItems: 'center' },
  emptyStateText: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textTertiary },

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
  emptyConfigText: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textTertiary, fontStyle: 'italic' },

  eventsList: { gap: spacing.sm },
  eventListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: spacing.sm, borderRadius: borderRadius.sm, borderLeftWidth: 3, borderLeftColor: colors.primary },
  eventListTitle: { fontSize: fontSize.sm, fontFamily: fontFamily.bold, color: colors.textPrimary, flexShrink: 1 },
  eventListSub: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  eventListType: { fontSize: fontSize.xs, fontFamily: fontFamily.bold },
  eventListDate: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textSecondary },

  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statusBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.card, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.inputBorder },
  statusBtnActive: { backgroundColor: colors.primary + '15', borderColor: colors.primary },
  statusBtnText: { fontSize: fontSize.sm, fontFamily: fontFamily.medium, color: colors.textSecondary },
  statusBtnTextActive: { color: colors.primary },

  inputLabel: { fontSize: fontSize.sm, fontFamily: fontFamily.bold, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: borderRadius.md, padding: spacing.md, fontSize: fontSize.md, fontFamily: fontFamily.regular, color: colors.textPrimary },
  typeSelector: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  typeBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: borderRadius.md },
  typeBtnActive: { backgroundColor: colors.primary + '15', borderColor: colors.primary },
  typeBtnText: { fontSize: fontSize.xs, fontFamily: fontFamily.medium, color: colors.textSecondary },
  typeBtnTextActive: { color: colors.primary, fontFamily: fontFamily.bold },

  daySelector: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  dayBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: borderRadius.md },
  dayBtnActive: { backgroundColor: colors.primary + '15', borderColor: colors.primary },
  dayBtnText: { fontSize: fontSize.xs, fontFamily: fontFamily.medium, color: colors.textSecondary },
  dayBtnTextActive: { color: colors.primary, fontFamily: fontFamily.bold },

  timePickersRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  pickerButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.sm },
  pickerButtonText: { fontSize: fontSize.md, fontFamily: fontFamily.regular, color: colors.textPrimary },
  timePickerContainer: { alignItems: 'center', marginTop: spacing.sm },
  pickerSaveBtn: { backgroundColor: colors.primary, paddingVertical: spacing.xs, paddingHorizontal: spacing.lg, borderRadius: borderRadius.sm, marginTop: spacing.sm },
  pickerSaveBtnText: { color: colors.white, fontSize: fontSize.sm, fontFamily: fontFamily.bold },

  primaryButton: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.xl },
  primaryButtonText: { color: colors.white, fontSize: fontSize.md, fontFamily: fontFamily.bold },
});
