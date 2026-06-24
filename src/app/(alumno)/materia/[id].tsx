import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Clock, MapPin, Calendar, Plus, X, ChevronLeft, BookOpen, Edit2 } from 'lucide-react-native';
import { Card } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import { materiasService } from '@/services/materiasService';
import { eventosService } from '@/services/eventosService';
import { useAuth } from '@/context/AuthContext';
import { Materia } from '@/lib/supabase/database.types';

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

export default function MateriaDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { perfil } = useAuth();

  const [materia, setMateria] = useState<Materia | null>(null);
  const [eventos, setEventos] = useState<SubjectEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para formulario de evento
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('Parcial');
  const [fecha, setFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Estados para horario
  const [schedule, setSchedule] = useState<SubjectSchedule | null>(null);
  const [showEditSchedule, setShowEditSchedule] = useState(false);
  const [scheduleDay, setScheduleDay] = useState('Lunes');
  const [scheduleRoom, setScheduleRoom] = useState('');
  const [scheduleStart, setScheduleStart] = useState(new Date(new Date().setHours(15, 0, 0, 0)));
  const [scheduleEnd, setScheduleEnd] = useState(new Date(new Date().setHours(17, 0, 0, 0)));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const scheduleKey = `@materia_schedule_${id}`;

  const cargarDatos = async () => {
    if (!id || !perfil?.id) return;
    try {
      setLoading(true);
      const [materiaData, eventosData] = await Promise.all([
        materiasService.getById(id),
        eventosService.getByMateria(id),
      ]);
      setMateria(materiaData);

      const formattedEvents: SubjectEvent[] = (eventosData || []).map((e: any) => ({
        id: e.id,
        title: e.titulo,
        type: e.tipo === 'parcial' ? 'Parcial' : e.tipo === 'tp' ? 'TP' : 'Exposición',
        date: formatDate(new Date(e.fecha)),
      }));
      setEventos(formattedEvents);

      const savedSchedule = await AsyncStorage.getItem(scheduleKey);
      if (savedSchedule) {
        const parsed: SubjectSchedule = JSON.parse(savedSchedule);
        setSchedule(parsed);
        setScheduleDay(parsed.day);
        setScheduleRoom(parsed.room);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [id, perfil?.id])
  );

  const formatDate = (date: Date) => {
    const formatted = date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const tipoMapeo: Record<string, 'parcial' | 'tp' | 'exposicion'> = {
    Parcial: 'parcial',
    TP: 'tp',
    Exposición: 'exposicion',
  };

  const guardarEvento = async () => {
    if (!titulo || !perfil?.id || !id) return;

    const nuevoEvento = await eventosService.create(perfil.id, {
      titulo,
      id_materia: id,
      fecha: fecha.toISOString().split('T')[0],
      tipo: tipoMapeo[tipo] || 'parcial',
    });

    if (nuevoEvento) {
      const eventoFormateado: SubjectEvent = {
        id: nuevoEvento.id,
        title: nuevoEvento.titulo,
        type: tipo,
        date: formatDate(fecha),
      };
      setEventos([...eventos, eventoFormateado]);
      setTitulo('');
      setTipo('Parcial');
      setFecha(new Date());
      setShowAddEvent(false);
      Alert.alert('Éxito', 'Evento guardado');
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  const guardarHorario = async () => {
    if (!scheduleRoom) return;
    const nuevoHorario: SubjectSchedule = {
      day: scheduleDay,
      startTime: formatTime(scheduleStart),
      endTime: formatTime(scheduleEnd),
      room: scheduleRoom,
    };
    setSchedule(nuevoHorario);
    setShowEditSchedule(false);
    try {
      await AsyncStorage.setItem(scheduleKey, JSON.stringify(nuevoHorario));
    } catch (e) {
      console.error(e);
    }
  };

  const eliminarEvento = async (eventoId: string) => {
    const success = await eventosService.delete(eventoId);
    if (success) {
      setEventos(eventos.filter((e) => e.id !== eventoId));
    }
  };

  if (loading || !materia) {
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {materia.nombre}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <BookOpen size={24} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Detalles de la materia</Text>
              <View style={styles.infoDetailRow}>
                <Clock size={14} color={colors.textSecondary} />
                <Text style={styles.infoDetailText}>{materia.horas_anuales} horas anuales</Text>
                <Text style={styles.infoDot}>•</Text>
                <Text style={styles.infoDetailText}>Nivel {materia.nivel}</Text>
              </View>
            </View>
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Horario de Cursada</Text>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowEditSchedule(!showEditSchedule)}
          >
            {showEditSchedule ? (
              <X size={18} color={colors.primary} />
            ) : (
              <Edit2 size={18} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {showEditSchedule ? (
          <View style={styles.configSection}>
            <Text style={styles.inputLabel}>Día de la semana</Text>
            <View style={styles.daySelector}>
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, index) => {
                const dayName = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][index];
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayBtn, scheduleDay === dayName && styles.dayBtnActive]}
                    onPress={() => setScheduleDay(dayName)}
                  >
                    <Text style={[styles.dayBtnText, scheduleDay === dayName && styles.dayBtnTextActive]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.timePickersRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Hora Inicio</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => {
                    setShowEndPicker(false);
                    setShowStartPicker(true);
                  }}
                >
                  <Clock size={18} color={colors.textSecondary} />
                  <Text style={styles.pickerButtonText}>{formatTime(scheduleStart)} hs</Text>
                </TouchableOpacity>
                {showStartPicker && (
                  <View style={styles.timePickerContainer}>
                    <DateTimePicker
                      value={scheduleStart}
                      mode="time"
                      display="spinner"
                      textColor={colors.textPrimary}
                      onChange={(event, selectedDate) => {
                        if (selectedDate) setScheduleStart(selectedDate);
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
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => {
                    setShowStartPicker(false);
                    setShowEndPicker(true);
                  }}
                >
                  <Clock size={18} color={colors.textSecondary} />
                  <Text style={styles.pickerButtonText}>{formatTime(scheduleEnd)} hs</Text>
                </TouchableOpacity>
                {showEndPicker && (
                  <View style={styles.timePickerContainer}>
                    <DateTimePicker
                      value={scheduleEnd}
                      mode="time"
                      display="spinner"
                      textColor={colors.textPrimary}
                      onChange={(event, selectedDate) => {
                        if (selectedDate) setScheduleEnd(selectedDate);
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
              value={scheduleRoom}
              onChangeText={setScheduleRoom}
            />

            <TouchableOpacity style={styles.primaryButton} onPress={guardarHorario}>
              <Text style={styles.primaryButtonText}>Guardar Horario</Text>
            </TouchableOpacity>
          </View>
        ) : schedule ? (
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Clock size={24} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{schedule.day}</Text>
                <View style={styles.infoDetailRow}>
                  <Clock size={14} color={colors.textSecondary} />
                  <Text style={styles.infoDetailText}>
                    {schedule.startTime} a {schedule.endTime} hs
                  </Text>
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
            <Text style={styles.emptyStateText}>No hay horario asignado.</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tus Eventos ({eventos.length})</Text>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowAddEvent(!showAddEvent)}
          >
            {showAddEvent ? (
              <X size={18} color={colors.primary} />
            ) : (
              <Plus size={18} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {showAddEvent && (
          <View style={styles.configSection}>
            <Text style={styles.inputLabel}>Título del Evento</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Trabajo Práctico 1"
              placeholderTextColor={colors.textTertiary}
              value={titulo}
              onChangeText={setTitulo}
            />

            <Text style={styles.inputLabel}>Fecha</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
              <Calendar size={18} color={colors.textSecondary} />
              <Text style={styles.pickerButtonText}>{formatDate(fecha)}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={fecha}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'spinner'}
                textColor={colors.textPrimary}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) setFecha(selectedDate);
                }}
              />
            )}

            <Text style={styles.inputLabel}>Tipo</Text>
            <View style={styles.typeSelector}>
              {['Parcial', 'TP', 'Exposición'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, tipo === t && styles.typeBtnActive]}
                  onPress={() => setTipo(t)}
                >
                  <Text style={[styles.typeBtnText, tipo === t && styles.typeBtnTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={guardarEvento}>
              <Text style={styles.primaryButtonText}>Guardar Evento</Text>
            </TouchableOpacity>
          </View>
        )}

        {eventos.length > 0 ? (
          <View style={styles.eventsList}>
            {eventos.map((ev) => (
              <View key={ev.id} style={styles.eventListItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventListTitle}>{ev.title}</Text>
                  <View style={styles.eventListSub}>
                    <Text
                      style={[
                        styles.eventListType,
                        { color: ev.type === 'Parcial' ? colors.warning : colors.primary },
                      ]}
                    >
                      {ev.type}
                    </Text>
                    <Text style={styles.eventListDate}> • {ev.date}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => eliminarEvento(ev.id)}>
                  <X size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          !showAddEvent && (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No hay eventos programados.</Text>
            </View>
          )
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: fontSize.md, color: colors.textSecondary },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  backButton: { padding: spacing.xs, marginLeft: -8, marginRight: spacing.xs },
  title: { fontSize: fontSize.xl, fontFamily: fontFamily.bold, color: colors.textPrimary },

  scrollContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },

  infoCard: { padding: spacing.md, marginBottom: spacing.md, backgroundColor: colors.card },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconContainer: {
    backgroundColor: colors.primary + '20',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  infoContent: { flex: 1 },
  infoTitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  infoDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoDetailText: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary },
  infoDot: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textTertiary, marginHorizontal: 4 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  sectionTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, color: colors.textPrimary },
  iconBtn: { padding: spacing.xs, backgroundColor: colors.primary + '15', borderRadius: borderRadius.sm },

  configSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.bold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.textPrimary,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  pickerButtonText: { fontSize: fontSize.md, fontFamily: fontFamily.regular, color: colors.textPrimary },

  typeSelector: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  typeBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.md,
  },
  typeBtnActive: { backgroundColor: colors.primary + '15', borderColor: colors.primary },
  typeBtnText: { fontSize: fontSize.xs, fontFamily: fontFamily.medium, color: colors.textSecondary },
  typeBtnTextActive: { color: colors.primary, fontFamily: fontFamily.bold },

  daySelector: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  dayBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.md,
  },
  dayBtnActive: { backgroundColor: colors.primary + '15', borderColor: colors.primary },
  dayBtnText: { fontSize: fontSize.xs, fontFamily: fontFamily.medium, color: colors.textSecondary },
  dayBtnTextActive: { color: colors.primary, fontFamily: fontFamily.bold },

  timePickersRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  timePickerContainer: { alignItems: 'center', marginTop: spacing.sm },
  pickerSaveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  pickerSaveBtnText: { color: colors.white, fontSize: fontSize.sm, fontFamily: fontFamily.bold },

  primaryButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  primaryButtonText: { color: colors.white, fontSize: fontSize.md, fontFamily: fontFamily.bold },

  eventsList: { gap: spacing.sm },
  eventListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  eventListTitle: { fontSize: fontSize.sm, fontFamily: fontFamily.bold, color: colors.textPrimary, flexShrink: 1 },
  eventListSub: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  eventListType: { fontSize: fontSize.xs, fontFamily: fontFamily.bold },
  eventListDate: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textSecondary },

  emptyStateContainer: { padding: spacing.md, alignItems: 'center' },
  emptyStateText: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textTertiary },
});