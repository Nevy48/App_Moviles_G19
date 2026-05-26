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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
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
} from 'lucide-react';
import { Card, SubjectCard } from '@/components/ui';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';

export type ExtendedSubjectStatus = 'disabled' | 'available' | 'pending' | 'in_progress' | 'cursada' | 'approved';

type SubjectEvent = {
  id: string;
  title: string;
  type: string;
  date: string;
};

type SubjectSchedule = {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
};

const logoUrl = 'https://res.cloudinary.com/disx14b4q/image/upload/v1779402010/image_2_bluupa.png';

const BASE_DUMMY_SUBJECT = {
  id: 'placeholder-1',
  name: 'Aplicaciones Móviles',
  code: '001',
  status: 'pending' as ExtendedSubjectStatus,
  level: 1,
  semester: 1,
  credits: 4,
  hours: '4 hs/sem',
  correlCursada: [],
  correlAprobada: [],
  isElectivePlaceholder: false,
  isSeminario: false,
  canChangeTo: ['approved', 'cursada', 'in_progress', 'pending'] as ExtendedSubjectStatus[],
};

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [subject, setSubject] = useState(BASE_DUMMY_SUBJECT);
  const [events, setEvents] = useState<SubjectEvent[]>([]);
  const [schedule, setSchedule] = useState<SubjectSchedule | null>(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalView, setModalView] = useState<'main' | 'add_event' | 'edit_schedule'>('main');

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

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const savedStatus = await AsyncStorage.getItem('@materia_prueba_status');
      if (savedStatus) {
        setSubject(prev => ({ ...prev, status: savedStatus as ExtendedSubjectStatus }));
      }
      const savedEvents = await AsyncStorage.getItem('@materia_events');
      if (savedEvents) setEvents(JSON.parse(savedEvents));
      const savedSchedule = await AsyncStorage.getItem('@materia_schedule');
      if (savedSchedule) setSchedule(JSON.parse(savedSchedule));
    } catch (e) {
      console.error(e);
    }
  };

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
    if (!newEventTitle) return;
    const eventToAdd = {
      id: Date.now().toString(),
      title: newEventTitle,
      type: newEventType,
      date: formatDate(newEventDate),
    };
    const updatedEvents = [...events, eventToAdd];
    setEvents(updatedEvents);
    setNewEventTitle('');
    setNewEventType('Parcial');
    setNewEventDate(new Date());
    setModalView('main');
    try {
      await AsyncStorage.setItem('@materia_events', JSON.stringify(updatedEvents));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const updatedEvents = events.filter(e => e.id !== id);
    setEvents(updatedEvents);
    try {
      await AsyncStorage.setItem('@materia_events', JSON.stringify(updatedEvents));
    } catch (e) {
      console.error(e);
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
      await AsyncStorage.setItem('@materia_schedule', JSON.stringify(scheduleToAdd));
    } catch (e) {
      console.error(e);
    }
  };

  const openModal = () => {
    setModalView('main');
    if (schedule) {
      setNewScheduleDay(schedule.day);
      setNewScheduleRoom(schedule.room);
    }
    setShowDetailModal(true);
  };

  const stats = {
    total: 1,
    approved: subject.status === 'approved' ? 1 : 0,
    inProgress: subject.status === 'in_progress' ? 1 : 0,
    cursada: subject.status === 'cursada' ? 1 : 0,
    pending: subject.status === 'pending' ? 1 : 0,
    percentage: subject.status === 'approved' ? 100 : 0,
  };

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
            <Text style={styles.greeting}>Hola, Mateo</Text>
            <Text style={styles.careerText}>Ingeniería en Sistemas</Text>
          </View>
          <Image source={{ uri: logoUrl }} style={styles.logo} />
        </View>

        <Card style={styles.progressCard} variant="glass">
          <LinearGradient
            colors={[colors.primary + '40', colors.primary + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.progressGradient}
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
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Horario de Hoy</Text>
        </View>
        {schedule && subject.status === 'in_progress' ? (
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Clock size={24} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{subject.name}</Text>
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
        {events.length > 0 && subject.status === 'in_progress' ? (
          events.map(event => (
            <Card key={event.id} style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={[styles.iconContainer, { backgroundColor: event.type === 'Parcial' ? colors.warning + '20' : colors.primary + '20' }]}>
                  <Calendar size={24} color={event.type === 'Parcial' ? colors.warning : colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>{event.title}</Text>
                  <View style={styles.infoDetailRow}>
                    <Text style={[styles.infoDetailText, { color: event.type === 'Parcial' ? colors.warning : colors.primary }]}>{subject.name}</Text>
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
        
        {subject.status === 'in_progress' ? (
          <SubjectCard
            name={subject.name}
            code={subject.code}
            status={subject.status}
            year={subject.level}
            semester={subject.semester}
            credits={subject.credits}
            hours={subject.hours}
            correlCursada={subject.correlCursada}
            correlAprobada={subject.correlAprobada}
            isElectivePlaceholder={subject.isElectivePlaceholder}
            isSeminario={subject.isSeminario}
            onPress={openModal}
            canChangeTo={subject.canChangeTo}
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

      <Modal visible={showDetailModal} animationType="slide" transparent={true} onRequestClose={() => setShowDetailModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {modalView === 'main' && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalCode}>{subject.code}</Text>
                    <Text style={styles.modalTitle}>{subject.name}</Text>
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
                        {events.map(ev => (
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
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(Platform.OS === 'ios');
                        if (selectedDate) setNewEventDate(selectedDate);
                      }}
                    />
                  )}

                  <Text style={styles.inputLabel}>Tipo</Text>
                  <View style={styles.typeSelector}>
                    {['Parcial', 'TP', 'Exposición'].map(t => (
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
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={newScheduleDay}
                      onValueChange={(itemValue) => setNewScheduleDay(itemValue)}
                      style={styles.picker}
                      dropdownIconColor={colors.textPrimary}
                    >
                      <Picker.Item label="Lunes" value="Lunes" color={colors.textPrimary} />
                      <Picker.Item label="Martes" value="Martes" color={colors.textPrimary} />
                      <Picker.Item label="Miércoles" value="Miércoles" color={colors.textPrimary} />
                      <Picker.Item label="Jueves" value="Jueves" color={colors.textPrimary} />
                      <Picker.Item label="Viernes" value="Viernes" color={colors.textPrimary} />
                      <Picker.Item label="Sábado" value="Sábado" color={colors.textPrimary} />
                    </Picker>
                  </View>

                  <View style={styles.timePickersRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Hora Inicio</Text>
                      <TouchableOpacity style={styles.pickerButton} onPress={() => setShowStartPicker(true)}>
                        <Clock size={18} color={colors.textSecondary} />
                        <Text style={styles.pickerButtonText}>{formatTime(newScheduleStart)} hs</Text>
                      </TouchableOpacity>
                      {showStartPicker && (
                        <DateTimePicker
                          value={newScheduleStart}
                          mode="time"
                          is24Hour={true}
                          display="default"
                          onChange={(event, selectedDate) => {
                            setShowStartPicker(Platform.OS === 'ios');
                            if (selectedDate) setNewScheduleStart(selectedDate);
                          }}
                        />
                      )}
                    </View>
                    <View style={{ width: spacing.md }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Hora Fin</Text>
                      <TouchableOpacity style={styles.pickerButton} onPress={() => setShowEndPicker(true)}>
                        <Clock size={18} color={colors.textSecondary} />
                        <Text style={styles.pickerButtonText}>{formatTime(newScheduleEnd)} hs</Text>
                      </TouchableOpacity>
                      {showEndPicker && (
                        <DateTimePicker
                          value={newScheduleEnd}
                          mode="time"
                          is24Hour={true}
                          display="default"
                          onChange={(event, selectedDate) => {
                            setShowEndPicker(Platform.OS === 'ios');
                            if (selectedDate) setNewScheduleEnd(selectedDate);
                          }}
                        />
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
  scrollContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.lg },
  greeting: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, color: colors.textPrimary },
  careerText: { fontSize: fontSize.md, fontFamily: fontFamily.monoRegular, color: colors.textSecondary, marginTop: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.8 },
  logo: { width: 48, height: 48, borderRadius: borderRadius.md },
  progressCard: { marginBottom: spacing.lg, padding: 0, overflow: 'hidden' },
  progressGradient: { padding: spacing.lg },
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
  infoDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoDetailText: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary },
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
  eventListTitle: { fontSize: fontSize.sm, fontFamily: fontFamily.bold, color: colors.textPrimary },
  eventListSub: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  eventListType: { fontSize: fontSize.xs, fontFamily: fontFamily.bold },
  eventListDate: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textSecondary },

  inputLabel: { fontSize: fontSize.sm, fontFamily: fontFamily.bold, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: borderRadius.md, padding: spacing.md, fontSize: fontSize.md, fontFamily: fontFamily.regular, color: colors.textPrimary },
  typeSelector: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  typeBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: borderRadius.md },
  typeBtnActive: { backgroundColor: colors.primary + '15', borderColor: colors.primary },
  typeBtnText: { fontSize: fontSize.xs, fontFamily: fontFamily.medium, color: colors.textSecondary },
  typeBtnTextActive: { color: colors.primary, fontFamily: fontFamily.bold },
  
  pickerContainer: { backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: borderRadius.md, overflow: 'hidden' },
  picker: { color: colors.textPrimary },
  timePickersRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  pickerButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.sm },
  pickerButtonText: { fontSize: fontSize.md, fontFamily: fontFamily.regular, color: colors.textPrimary },
  
  primaryButton: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.xl },
  primaryButtonText: { color: colors.white, fontSize: fontSize.md, fontFamily: fontFamily.bold },
});