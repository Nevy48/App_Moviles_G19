import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PlanEstudio } from '@/lib/supabase/database.types';
import { planesService } from '@/services/planesService';
import { Card, Button, Input } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import { Plus, Edit2, Trash2, BookOpen, X } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const planSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  anio_resolucion: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 1900 && Number(val) <= new Date().getFullYear() + 1, {
    message: 'Año de resolución inválido',
  }),
});

type PlanFormData = z.infer<typeof planSchema>;

export default function AdminPlanesScreen() {
  const router = useRouter();
  const [planes, setPlanes] = useState<PlanEstudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanEstudio | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      nombre: '',
      anio_resolucion: '',
    },
  });

  const loadData = async () => {
    try {
      const data = await planesService.getAll();
      setPlanes(data);
    } catch (e) {
      console.error('Error cargando planes de estudio:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const onSubmit = async (data: PlanFormData) => {
    const datosPlan = {
      nombre: data.nombre,
      anio_resolucion: parseInt(data.anio_resolucion, 10),
    };

    if (editingPlan) {
      const result = await planesService.update(editingPlan.id, datosPlan);
      if (result) {
        await loadData();
        closeModal();
      } else {
        Alert.alert('Error', 'No se pudo actualizar el plan');
      }
    } else {
      const result = await planesService.create(datosPlan);
      if (result) {
        await loadData();
        closeModal();
      } else {
        Alert.alert('Error', 'No se pudo crear el plan');
      }
    }
  };

  const handleDelete = (plan: PlanEstudio) => {
    Alert.alert(
      'Eliminar Plan',
      `¿Estás seguro de eliminar "${plan.nombre}"? Esta acción eliminará todas las materias asociadas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const success = await planesService.delete(plan.id);
            if (success) {
              await loadData();
            } else {
              Alert.alert('Error', 'No se pudo eliminar el plan');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (plan: PlanEstudio) => {
    setEditingPlan(plan);
    reset({
      nombre: plan.nombre,
      anio_resolucion: plan.anio_resolucion.toString(),
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingPlan(null);
    reset({ nombre: '', anio_resolucion: '' });
  };

  const renderPlan = ({ item }: { item: PlanEstudio }) => (
    <Card 
      style={styles.planCard} 
      onPress={() => router.push(`/(admin)/planes/${item.id}`)}
    >
      <View style={styles.planContent}>
        <View style={styles.planIcon}>
          <BookOpen size={22} color={colors.primary} />
        </View>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{item.nombre}</Text>
          <Text style={styles.planYear}>Resolución: {item.anio_resolucion}</Text>
        </View>
        {/* Contenedor de acciones aislado para evitar que interfiera con el onPress de la tarjeta */}
        <View style={styles.planActions}>
          <TouchableOpacity 
            onPress={() => openEditModal(item)} 
            style={styles.actionButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Edit2 size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDelete(item)} 
            style={styles.actionButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando planes de estudio...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Planes de Estudio</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Plus size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={planes}
        renderItem={renderPlan}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <BookOpen size={40} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No hay planes de estudio cargados</Text>
            <Text style={styles.emptySubtext}>Toca el botón + superior para registrar una nueva carrera.</Text>
          </Card>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentStyle}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPlan ? 'Editar Plan' : 'Nuevo Plan de Estudio'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Controller
                control={control}
                name="nombre"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Nombre de la Carrera / Plan"
                    placeholder="Ej: Ingeniería en Sistemas"
                    value={value}
                    onChangeText={onChange}
                    error={errors.nombre?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="anio_resolucion"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Año de la Resolución Ministerial"
                    placeholder="Ej: 2023"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    error={errors.anio_resolucion?.message}
                  />
                )}
              />

              <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit(onSubmit)}>
                <Text style={styles.primaryButtonText}>
                  {editingPlan ? 'Actualizar Registro' : 'Dar de Alta Plan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  planCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
  },
  planContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  planName: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  planYear: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    marginTop: 4,
    flexShrink: 1,
  },
  planActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.bold,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContentStyle: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    minHeight: '40%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalBody: {
    padding: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontFamily: fontFamily.bold,
  },
});