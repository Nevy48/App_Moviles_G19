import { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import { Settings, Shield, LogOut, MapPin, Save, Map as MapIcon, X } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase/client';
import MapView, { Marker } from 'react-native-maps';

export default function AdminConfiguracionScreen() {
  const { perfil, signOut } = useAuth();
  
  // Hacemos el cast seguro como lo arreglamos antes
  const perfilDatos = perfil as any;
  const [latitud, setLatitud] = useState(perfilDatos?.latitud?.toString() || '');
  const [longitud, setLongitud] = useState(perfilDatos?.longitud?.toString() || '');
  
  const [cargandoGps, setCargandoGps] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Estados para el Modal del Mapa
  const [modalMapaVisible, setModalMapaVisible] = useState(false);
  const [pinCoords, setPinCoords] = useState({ 
    latitude: parseFloat(perfilDatos?.latitud) || -34.9214, // Default a La Plata si no hay nada
    longitude: parseFloat(perfilDatos?.longitud) || -57.9545 
  });

  const abrirMapa = async () => {
    setCargandoGps(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la ubicación para centrar el mapa.');
      } else {
        const location = await Location.getCurrentPositionAsync({});
        setPinCoords({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      }
    } catch (error) {
      console.log('No se pudo obtener GPS, usando coordenadas por defecto.');
    } finally {
      setCargandoGps(false);
      setModalMapaVisible(true);
    }
  };

  const confirmarUbicacionMapa = () => {
    setLatitud(pinCoords.latitude.toString());
    setLongitud(pinCoords.longitude.toString());
    setModalMapaVisible(false);
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
      Alert.alert('Éxito', 'Ubicación actualizada. Los alumnos te encontrarán por cercanía.');
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

        {/* --- SECCIÓN DE GEOLOCALIZACIÓN --- */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <MapPin size={20} color={colors.primary} />
            </View>
            <Text style={styles.infoTitle}>Ubicación de la Institución</Text>
          </View>
          <Text style={styles.infoText}>
            Seleccioná la ubicación exacta de tu facultad para que los alumnos puedan encontrarte fácilmente.
          </Text>

          <View style={styles.locationForm}>
            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Latitud</Text>
                {/* Inputs bloqueados (editable={false}) para evitar que metan mano */}
                <TextInput style={[styles.input, { backgroundColor: colors.inputBackground }]} value={latitud} editable={false} />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Longitud</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.inputBackground }]} value={longitud} editable={false} />
              </View>
            </View>

            <TouchableOpacity style={styles.btnMap} onPress={abrirMapa} disabled={cargandoGps}>
              {cargandoGps ? <ActivityIndicator size="small" color={colors.white} /> : <MapIcon size={18} color={colors.white} />}
              <Text style={styles.btnMapText}>{cargandoGps ? 'Buscando GPS...' : 'Seleccionar en el Mapa'}</Text>
            </TouchableOpacity>

            <Button 
              title={guardando ? "Guardando..." : "Guardar Coordenadas"} 
              onPress={guardarCoordenadas}
              disabled={guardando}
              style={{ marginTop: spacing.md, backgroundColor: colors.success, borderColor: colors.success }}
            />
          </View>
        </Card>

        {/* --- MODO ADMINISTRADOR --- */}
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

      {/* --- MODAL DEL MAPA --- */}
      <Modal visible={modalMapaVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mové el marcador rojo</Text>
            <TouchableOpacity onPress={() => setModalMapaVisible(false)} style={styles.closeButton}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.mapContainer}>
            <MapView
              style={StyleSheet.absoluteFillObject}
              initialRegion={{
                latitude: pinCoords.latitude,
                longitude: pinCoords.longitude,
                latitudeDelta: 0.01, // Zoom de la cámara
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={pinCoords}
                draggable
                onDragEnd={(e) => setPinCoords(e.nativeEvent.coordinate)}
                title="Tu Facultad"
                description="Mantené presionado para mover el pin"
              />
            </MapView>
          </View>

          <View style={styles.modalFooter}>
            <Text style={styles.modalFooterText}>Mantené presionado el pin rojo para arrastrarlo a la ubicación exacta.</Text>
            <Button title="Confirmar Ubicación" onPress={confirmarUbicacionMapa} style={{ marginTop: spacing.sm }} />
          </View>
        </SafeAreaView>
      </Modal>

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
  
  // Formulario GPS
  locationForm: { marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: spacing.md },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between' },
  inputLabel: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.textSecondary, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: colors.inputBorder, borderRadius: borderRadius.md, padding: spacing.md, color: colors.textSecondary, fontFamily: fontFamily.regular },
  
  btnMap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.md, marginTop: spacing.md, gap: spacing.sm },
  btnMapText: { color: colors.white, fontFamily: fontFamily.bold, fontSize: fontSize.sm },
  
  contenedorSalida: { marginTop: spacing.md, paddingBottom: spacing.lg },
  botonSalir: { backgroundColor: colors.error + '15', borderColor: colors.error, borderWidth: 1 },
  textoBotonSalir: { color: colors.error },
  versionText: { textAlign: 'center', fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textTertiary, marginTop: spacing.sm },

  // Estilos del Modal del Mapa
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  modalTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, color: colors.textPrimary },
  closeButton: { padding: spacing.xs },
  mapContainer: { flex: 1, overflow: 'hidden' },
  modalFooter: { padding: spacing.md, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.cardBorder },
  modalFooterText: { fontSize: 12, fontFamily: fontFamily.regular, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.sm }
});