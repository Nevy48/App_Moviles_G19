import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import { Settings, Shield, LogOut } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

export default function AdminConfiguracionScreen() {
  const { signOut } = useAuth();

  const manejarCierreSesion = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas salir del panel de administración?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Salir', 
          style: 'destructive', 
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Settings size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Configuración</Text>
        </View>

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

        <View style={styles.contenedorSalida}>
          <Button 
            title="Cerrar Sesión" 
            onPress={manejarCierreSesion}
            style={styles.botonSalir}
            textStyle={styles.textoBotonSalir}
            icon={<LogOut size={20} color={colors.error} />}
          />
        </View>

        <Text style={styles.versionText}>Mi Estado Académico v1.0.0 (Admin)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  header: { alignItems: 'center', marginBottom: spacing.xl, paddingTop: spacing.lg },
  iconWrapper: { width: 64, height: 64, borderRadius: borderRadius.full, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, color: colors.textPrimary },
  infoCard: { padding: spacing.md, marginBottom: spacing.md, backgroundColor: colors.card },
  infoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  iconContainer: { padding: spacing.xs, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  infoTitle: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.textPrimary },
  infoText: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary, lineHeight: 20 },
  sectionTitle: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.textPrimary, marginBottom: spacing.md },
  functionList: { gap: spacing.sm },
  functionItem: { flexDirection: 'row', alignItems: 'flex-start' },
  functionBullet: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.primary, marginRight: spacing.sm, lineHeight: 20 },
  functionText: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary, flex: 1, lineHeight: 20 },
  contenedorSalida: { marginTop: spacing.xl, paddingBottom: spacing.lg },
  botonSalir: { backgroundColor: colors.error + '15', borderColor: colors.error, borderWidth: 1 },
  textoBotonSalir: { color: colors.error },
  versionText: { textAlign: 'center', fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textTertiary, marginTop: spacing.xl },
});