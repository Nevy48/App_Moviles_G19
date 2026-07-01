import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LogOut,
  Settings,
  ChevronRight,
  Clock,
  BookOpen,
  Trash2,
} from 'lucide-react-native';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { planesService } from '@/services/planesService';

// Claves de almacenamiento para purgar datos al cambiar de carrera
const USER_PLAN_KEY = '@plan_id_alumno';
const STATUS_STORAGE_KEY = '@materias_status';
const SUBJECT_SCHEDULE_KEY = '@materia_schedule';

export default function AlumnoPerfilScreen() {
  const router = useRouter();
  const { perfil, user, signOut } = useAuth();
  const [nombreCarrera, setNombreCarrera] = useState<string>('Sin plan asignado');

  const cargarDatosPerfil = async () => {
    try {
      const planId = await AsyncStorage.getItem(USER_PLAN_KEY);
      if (planId) {
        const planData = await planesService.getById(planId);
        if (planData) {
          setNombreCarrera(planData.nombre);
        }
      } else {
        setNombreCarrera('Sin plan asignado');
      }
    } catch (error) {
      console.error('Error cargando plan en perfil:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarDatosPerfil();
    }, [])
  );

  const manejarCierreSesion = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres salir de la aplicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const manejarBajaPlan = () => {
    Alert.alert(
      'Abandonar Plan de Estudios',
      '¿Estás completamente seguro? Esta acción borrará de forma permanente tu progreso, materias aprobadas y horarios asignados en este dispositivo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, abandonar plan',
          style: 'destructive',
          onPress: async () => {
            // Purgar todos los datos academicos locales
            await AsyncStorage.multiRemove([USER_PLAN_KEY, STATUS_STORAGE_KEY, SUBJECT_SCHEDULE_KEY]);
            setNombreCarrera('Sin plan asignado');
            Alert.alert('Baja exitosa', 'Te has desvinculado de la carrera. Serás redirigido al catálogo.');
            router.push('/(alumno)/materias');
          },
        },
      ]
    );
  };

  const inicialesAvatar = perfil?.nombre_completo
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AL';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Perfil</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{inicialesAvatar}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{perfil?.nombre_completo || 'Usuario'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'Email no disponible'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.profileDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Rol</Text>
              <Text style={styles.detailValue}>Alumno</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Carrera Actual</Text>
              <Text style={styles.detailValue}>{nombreCarrera}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Acceso Rápido</Text>
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(alumno)/materias')}>
            <View style={styles.menuItemLeft}>
              <BookOpen size={20} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Mi Plan de Estudios</Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(alumno)/home')}>
            <View style={styles.menuItemLeft}>
              <Clock size={20} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Mis Eventos y Horarios</Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Settings size={20} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Preferencias Visuales</Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={manejarCierreSesion}>
            <View style={styles.menuItemLeft}>
              <LogOut size={20} color={colors.error} />
              <Text style={[styles.menuItemText, styles.logoutText]}>Cerrar Sesión</Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Mi Estado Académico v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  header: { paddingVertical: spacing.lg },
  title: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, color: colors.textPrimary },
  profileCard: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 64, height: 64, borderRadius: borderRadius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  avatarText: { fontSize: fontSize.xl, fontFamily: fontFamily.bold, color: colors.white },
  profileInfo: { flex: 1 },
  userName: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, color: colors.textPrimary },
  userEmail: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary, marginTop: spacing.xs },
  divider: { height: 1, backgroundColor: colors.cardBorder, marginVertical: spacing.md },
  profileDetails: { gap: spacing.md },
  detailItem: { gap: spacing.xs },
  detailLabel: { fontSize: fontSize.xs, fontFamily: fontFamily.monoRegular, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8 },
  detailValue: { fontSize: fontSize.md, fontFamily: fontFamily.medium, color: colors.textPrimary },
  sectionHeader: { marginTop: spacing.lg, marginBottom: spacing.sm },
  sectionTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, color: colors.textPrimary },
  menuCard: { backgroundColor: colors.card, borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.lg },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuItemText: { fontSize: fontSize.md, fontFamily: fontFamily.medium, color: colors.textPrimary },
  logoutText: { color: colors.error },
  menuDivider: { height: 1, backgroundColor: colors.cardBorder },
  version: { textAlign: 'center', fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textTertiary, marginTop: spacing.lg },
});