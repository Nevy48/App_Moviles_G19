import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Building, ChevronRight, BookOpen, MapPin, Map as MapIcon, List } from 'lucide-react-native';
import * as Location from 'expo-location';
import { Card } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import { PlanEstudio } from '@/lib/supabase/database.types';
import MapView, { Marker, Callout } from 'react-native-maps';

interface BuscadorProps {
  vistaActual: 'facultades' | 'planes_facultad';
  setVistaActual: (v: 'facultades' | 'planes_facultad' | 'mi_plan' | 'preview_plan' | 'selector_planes') => void;
  facultades: any[];
  planesDisponibles: PlanEstudio[];
  verPlanesDeFacultad: (facultad: any) => void;
  verPreviewPlan: (plan: PlanEstudio) => void;
  facultadSeleccionada: any;
  onVolver?: () => void;
}

export const BuscadorInstituciones = ({
  vistaActual,
  setVistaActual,
  facultades,
  planesDisponibles,
  verPlanesDeFacultad,
  verPreviewPlan,
  facultadSeleccionada,
  onVolver
}: BuscadorProps) => {
  
  const [busqueda, setBusqueda] = useState('');
  const [listaInstituciones, setListaInstituciones] = useState<any[]>([]);
  const [cargandoGPS, setCargandoGPS] = useState(false);
  const [gpsActivo, setGpsActivo] = useState(false);
  
  // --- NUEVOS ESTADOS PARA EL MAPA ---
  const [modoMapa, setModoMapa] = useState(false);
  const [miUbicacion, setMiUbicacion] = useState<{latitude: number, longitude: number} | null>(null);

  useEffect(() => {
    setListaInstituciones(facultades);
  }, [facultades]);

  const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const obtenerUbicacionYOrdenar = async () => {
    setCargandoGPS(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso al GPS para buscar facultades cercanas.');
        setCargandoGPS(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Guardamos la ubicación para centrar el mapa
      setMiUbicacion({ latitude, longitude });

      const facultadesMapeadas = facultades.map(f => {
        if (f.latitud && f.longitud) {
          const dist = calcularDistancia(latitude, longitude, f.latitud, f.longitud);
          return { ...f, distancia: dist };
        }
        return { ...f, distancia: 999999 };
      }).sort((a, b) => a.distancia - b.distancia);

      setListaInstituciones(facultadesMapeadas);
      setGpsActivo(true);
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema obteniendo tu ubicación.');
    } finally {
      setCargandoGPS(false);
    }
  };

  if (vistaActual === 'facultades') {
    const facultadesFiltradas = listaInstituciones
      .filter(f => {
        const search = busqueda.toLowerCase();
        const inst = f.institucion ? f.institucion.toLowerCase() : "";
        const nombre = f.nombre_completo ? f.nombre_completo.toLowerCase() : "";
        return inst.includes(search) || nombre.includes(search);
      })
      .slice(0, gpsActivo ? 3 : listaInstituciones.length);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            {onVolver && (
            <TouchableOpacity onPress={onVolver} style={{ marginBottom: 15 }}>
              <Text style={{ color: colors.primary, fontFamily: fontFamily.bold }}>← Cancelar y Volver</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Instituciones</Text>
          <Text style={styles.subtitle}>Buscá tu facultad para ver sus planes</Text>
          
          <View style={styles.searchContainer}>
            <Search size={20} color={colors.textTertiary} />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Ej. UTN FRLP..." 
              placeholderTextColor={colors.textTertiary}
              value={busqueda} 
              onChangeText={setBusqueda}
            />
          </View>

          {/* --- BOTONERA: GPS Y TOGGLE DE MAPA --- */}
          <View style={styles.actionRow}>
            {!gpsActivo ? (
              <TouchableOpacity style={styles.gpsButton} onPress={obtenerUbicacionYOrdenar} disabled={cargandoGPS}>
                <MapPin size={16} color={colors.primary} />
                <Text style={styles.gpsButtonText}>
                  {cargandoGPS ? 'Buscando...' : 'Buscar cercanas'}
                </Text>
                {cargandoGPS && <ActivityIndicator size="small" color={colors.primary} style={{marginLeft: 8}}/>}
              </TouchableOpacity>
            ) : (
              <View style={[styles.gpsButton, { backgroundColor: colors.success + '15' }]}>
                <MapPin size={16} color={colors.success} />
                <Text style={[styles.gpsButtonText, { color: colors.success }]}>Top 3 Cercanas</Text>
              </View>
            )}

            {/* Botón para alternar Mapa/Lista */}
            <TouchableOpacity 
              style={styles.toggleButton} 
              onPress={() => setModoMapa(!modoMapa)}
            >
              {modoMapa ? <List size={20} color={colors.primary} /> : <MapIcon size={20} color={colors.primary} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* --- RENDERIZADO CONDICIONAL: MAPA O LISTA --- */}
        {modoMapa ? (
          <View style={styles.mapContainer}>
            <MapView
              style={StyleSheet.absoluteFillObject}
              initialRegion={{
                // Centramos en la ubicación del alumno si la tenemos, sino en La Plata por defecto
                latitude: miUbicacion?.latitude || -34.9214,
                longitude: miUbicacion?.longitude || -57.9545,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              showsUserLocation={true} // Esto dibuja el punto azul de Apple Maps automáticamente
            >
              {facultadesFiltradas.map((f) => {
                if (f.latitud && f.longitud) {
                  return (
                    <Marker
                      key={f.id}
                      coordinate={{ latitude: f.latitud, longitude: f.longitud }}
                      title={f.institucion}
                      description={f.distancia && f.distancia !== 999999 ? `A ${f.distancia.toFixed(1)} km - Toca para ver planes` : 'Toca para ver planes'}
                      onCalloutPress={() => verPlanesDeFacultad(f)} // Acción al tocar la "nubecita"
                    />
                  );
                }
                return null;
              })}
            </MapView>
          </View>
        ) : (
          <FlatList
            data={facultadesFiltradas}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No se encontraron instituciones.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <Card style={styles.planCard} onPress={() => verPlanesDeFacultad(item)}>
                <View style={styles.planCardContent}>
                  <View style={styles.planIconWrapper}><Building size={24} color={colors.primary} /></View>
                  <View style={styles.planInfo}>
                      <Text style={styles.planName}>{item.institucion || 'Institución'}</Text>
                      <Text style={styles.planYear}>Administrador: {item.nombre_completo}</Text>
                    {item.distancia && item.distancia !== 999999 && (
                      <Text style={styles.distanceText}>📍 a {item.distancia.toFixed(1)} km</Text>
                    )}
                  </View>
                  <ChevronRight size={20} color={colors.textTertiary} />
                </View>
              </Card>
            )}
          />
        )}
      </SafeAreaView>
    );
  }

  if (vistaActual === 'planes_facultad') {
    // ... (El código de planes_facultad se mantiene exactamente igual)
    const planesFiltrados = planesDisponibles.filter(plan => 
      plan.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setVistaActual('facultades')} style={{ marginBottom: 15 }}>
            <Text style={{ color: colors.primary, fontFamily: fontFamily.bold }}>← Volver a Instituciones</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Planes Disponibles</Text>
          <Text style={styles.subtitle}>{facultadSeleccionada?.institucion}</Text>
        </View>
        <FlatList
          data={planesFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Esta institución aún no cargó planes.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Card style={styles.planCard} onPress={() => verPreviewPlan(item)}>
              <View style={styles.planCardContent}>
                <View style={styles.planIconWrapper}><BookOpen size={24} color={colors.primary} /></View>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{item.nombre}</Text>
                  <Text style={styles.planYear}>Resolución: {item.anio_resolucion}</Text>
                </View>
                <ChevronRight size={20} color={colors.textTertiary} />
              </View>
            </Card>
          )}
        />
      </SafeAreaView>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, marginBottom: spacing.md },
  title: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, color: colors.textPrimary },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.xs },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBackground, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.inputBorder },
  searchInput: { flex: 1, paddingVertical: spacing.md, marginLeft: spacing.sm, color: colors.textPrimary, fontFamily: fontFamily.regular, fontSize: fontSize.md },
  
  // --- NUEVOS ESTILOS PARA LA BOTONERA ---
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  gpsButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '15', paddingVertical: 8, paddingHorizontal: 12, borderRadius: borderRadius.md },
  gpsButtonText: { color: colors.primary, fontFamily: fontFamily.bold, marginLeft: spacing.xs, fontSize: fontSize.sm },
  toggleButton: { padding: spacing.sm, backgroundColor: colors.primary + '15', borderRadius: borderRadius.md, justifyContent: 'center', alignItems: 'center' },
  mapContainer: { flex: 1, marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: borderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.cardBorder },
  
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  planCard: { marginBottom: spacing.md, backgroundColor: colors.card, padding: spacing.md },
  planCardContent: { flexDirection: 'row', alignItems: 'center' },
  planIconWrapper: { width: 48, height: 48, borderRadius: borderRadius.md, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  planInfo: { marginLeft: spacing.md, flex: 1 },
  planName: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.textPrimary },
  planYear: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary, marginTop: 4 },
  distanceText: { fontSize: 11, fontFamily: fontFamily.bold, color: colors.primary, marginTop: 4, backgroundColor: colors.primary + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: colors.textSecondary, fontSize: fontSize.md, fontFamily: fontFamily.medium },
});