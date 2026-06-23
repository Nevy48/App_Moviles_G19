import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import { Settings, Shield } from 'lucide-react-native';

export default function AdminConfiguracionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera Principal unificada */}
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Settings size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Configuración</Text>
        </View>

        {/* Tarjeta de Información de Rol */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Shield size={20} color={colors.primary} />
            </View>
            <Text style={styles.infoTitle}>Modo Administrador</Text>
          </View>
          <Text style={styles.infoText}>
            Estás en el panel de administración. Aquí podrás gestionar todos los aspectos
            del sistema académico de la aplicación.
          </Text>
        </Card>

        {/* Tarjeta de Lista de Funcionalidades */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Funciones Disponibles</Text>
          <View style={styles.functionList}>
            <View style={styles.functionItem}>
              <Text style={styles.functionBullet}>•</Text>
              <Text style={styles.functionText}>Gestionar planes de estudio nuevos y existentes</Text>
            </View>
            <View style={styles.functionItem}>
              <Text style={styles.functionBullet}>•</Text>
              <Text style={styles.functionText}>Administrar materias, niveles y asignación horaria</Text>
            </View>
            <View style={styles.functionItem}>
              <Text style={styles.functionBullet}>•</Text>
              <Text style={styles.functionText}>Configurar correlatividades y dependencias entre asignaturas</Text>
            </View>
            <View style={styles.functionItem}>
              <Text style={styles.functionBullet}>•</Text>
              <Text style={styles.functionText}>Ver métricas globales de la base de datos centralizada</Text>
            </View>
          </View>
        </Card>

        {/* Pie de página de versión imitando el formato del perfil del alumno */}
        <Text style={styles.versionText}>Mi Estado Académico v1.0.0 (Admin)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Hereda el fondo oscuro/claro global
  },
  scrollContent: {
    paddingHorizontal: spacing.md, // Sincronizado con la grilla del alumno[cite: 2, 4, 5]
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full, // Uso del token circular oficial[cite: 2, 5]
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.bold, // Corrección del bug tipográfico[cite: 2, 4, 5]
    color: colors.textPrimary,
  },
  infoCard: {
    padding: spacing.md, // Unificado con las tarjetas de información compartidas[cite: 2, 4]
    marginBottom: spacing.md,
    backgroundColor: colors.card,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm, // Transición profesional reemplazando márgenes duros[cite: 2, 4]
  },
  iconContainer: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.bold, // Reemplazo de fontWeight.semibold[cite: 2, 4]
    color: colors.textPrimary,
  },
  infoText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular, // Token tipográfico correcto[cite: 2, 4, 5]
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.bold, // Token tipográfico correcto[cite: 2, 4, 5]
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  functionList: {
    gap: spacing.sm,
  },
  functionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  functionBullet: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.bold,
    color: colors.primary,
    marginRight: spacing.sm,
    lineHeight: 20,
  },
  functionText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular, // Token tipográfico correcto[cite: 2, 4, 5]
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  versionText: {
    textAlign: 'center', // Réplica exacta del footer de perfil del alumno[cite: 5]
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    color: colors.textTertiary,
    marginTop: spacing.xl,
  },
});