import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontWeight } from '@/constants/theme';
import { Settings, Shield } from 'lucide-react-native';

export default function AdminConfiguracionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Settings size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Configuración</Text>
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Shield size={20} color={colors.primary} />
            <Text style={styles.infoTitle}>Modo Administrador</Text>
          </View>
          <Text style={styles.infoText}>
            Estás en el panel de administración. Aquí podrás gestionar todos los aspectos
            del sistema académico.
          </Text>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Funciones Disponibles</Text>
          <View style={styles.functionList}>
            <View style={styles.functionItem}>
              <Text style={styles.functionBullet}>•</Text>
              <Text style={styles.functionText}>Gestionar planes de estudio</Text>
            </View>
            <View style={styles.functionItem}>
              <Text style={styles.functionBullet}>•</Text>
              <Text style={styles.functionText}>Administrar materias</Text>
            </View>
            <View style={styles.functionItem}>
              <Text style={styles.functionBullet}>•</Text>
              <Text style={styles.functionText}>Configurar correlatividades</Text>
            </View>
            <View style={styles.functionItem}>
              <Text style={styles.functionBullet}>•</Text>
              <Text style={styles.functionText}>Ver estadísticas generales</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.versionCard}>
          <Text style={styles.versionLabel}>Versión de la App</Text>
          <Text style={styles.versionValue}>1.0.0</Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    paddingTop: spacing.lg,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  infoCard: {
    marginBottom: spacing.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
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
    color: colors.primary,
    marginRight: spacing.sm,
  },
  functionText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  versionCard: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  versionLabel: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
  versionValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
});
