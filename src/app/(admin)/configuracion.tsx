import { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import { Settings, Shield, LogOut, MapPin, Save } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase/client';

export default function AdminConfiguracionScreen() {
  const { perfil, signOut } = useAuth();
  const perfilDatos = perfil as any;
  const [latitud, setLatitud] = useState(perfilDatos?.latitud?.toString() || '');
  const [longitud, setLongitud] = useState(perfilDatos?.longitud?.toString() || '');
  const [cargandoGps, setCargandoGps] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const obtenerUbicacion = async () => {
    setCargandoGps(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la ubicación.');
        setCargandoGps(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLatitud(location.coords.latitude.toString());
      setLongitud(location.coords.longitude.toString());
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación.');
    } finally {
      setCargandoGps(false);
    }
  };

  const guardarCoordenadas = async () => {
    if (!perfil?.id) return;
    setGuardando(true);
    try {
      const { error } = await (supabase as any)
        .from('perfiles')
        .update({ 
          latitud: parseFloat(latitud), 
          longitud: parseFloat(longitud) 
        })
        .eq('id', perfil.id);

      if (error) throw error;
      Alert.alert('Éxito', 'Ubicación actualizada correctamente. Los alumnos ahora podrán encontrarte por cercanía.');
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al guardar las coordenadas.');
    } finally {
      setGuardando(false);
    }
  };

  const manejarCierreSesion = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que deseas salir del panel de administración?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: async () => await signOut() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Settings size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Configuración</Text>
        </View>

        {/* --- NUEVA SECCIÓN DE GEOLOCALIZACIÓN --- */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <MapPin size={20} color={colors.primary} />
            </View>
            <Text style={styles.infoTitle}>Ubicación de la Institución</Text>
          </View>
          <Text style={styles.infoText}>
            Configura las coordenadas para que los alumnos te encuentren en la búsqueda por cercanía.
          </Text>

          <View style={styles.locationForm}>
            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Latitud</Text>
                <TextInput 
                  style={styles.input} 
                  value={latitud}
                  editable={false}
                  onChangeText={setLatitud} 
                  placeholder="-34.9214" 
                  keyboardType="numeric" 
                />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Longitud</Text>
                <TextInput 
                  style={styles.input} 
                  value={longitud} 
                  editable={false}
                  onChangeText={setLongitud} 
                  placeholder="-57.9545" 
                  keyboardType="numeric" 
                />
              </View>
            </View>

            <TouchableOpacity style={styles.btnGps} onPress={obtenerUbicacion} disabled={cargandoGps}>
              {cargandoGps ? <ActivityIndicator size="small" color={colors.primary} /> : <MapPin size={18} color={colors.primary} />}
              <Text style={styles.btnGpsText}>{cargandoGps ? 'Buscando...' : 'Usar mi ubicación actual'}</Text>
            </TouchableOpacity>

            <Button 
              title={guardando ? "Guardando..." : "Guardar Coordenadas"} 
              onPress={guardarCoordenadas}
              disabled={guardando}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </Card>
        {/* ---------------------------------------- */}

        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Shield size={20} color={colors.primary} />
            </View>
            <Text style={styles.infoTitle}>Modo Administrador</Text>
          </View>
          <Text style={styles.infoText}>
            Estás en el panel de administración. Aquí podrás gestionar todos los aspectos del sistema académico.
          </Text>
        </Card>

        <View style={styles.contenedorSalida}>
          <Button 
            title="Cerrar Sesión" 
            onPress={manejarCierreSesion}
            style={styles.botonSalir}
            textStyle={styles.textoBotonSalir}
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
  
  // Estilos del Formulario de GPS
  locationForm: { marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: spacing.md },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between' },
  inputLabel: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.textSecondary, marginBottom: 4 },
  input: { backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: borderRadius.md, padding: spacing.md, color: colors.textPrimary, fontFamily: fontFamily.regular },
  btnGps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary + '15', padding: spacing.md, borderRadius: borderRadius.md, marginTop: spacing.md, gap: spacing.sm },
  btnGpsText: { color: colors.primary, fontFamily: fontFamily.bold, fontSize: fontSize.sm },
  
  contenedorSalida: { marginTop: spacing.md, paddingBottom: spacing.lg },
  botonSalir: { backgroundColor: colors.error + '15', borderColor: colors.error, borderWidth: 1 },
  textoBotonSalir: { color: colors.error },
  versionText: { textAlign: 'center', fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textTertiary, marginTop: spacing.sm },
});