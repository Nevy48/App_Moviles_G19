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
import { PlanEstudio } from '@/lib/supabase/database.types';
import { planesService } from '@/services/planesService';
import { Card, Button, Input } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontWeight } from '@/constants/theme';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react-native';
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
    const data = await planesService.getAll();
    setPlanes(data);
    setLoading(false);
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
    if (editingPlan) {
      const result = await planesService.update(editingPlan.id, {
        nombre: data.nombre,
        anio_resolucion: parseInt(data.anio_resolucion, 10),
      });

      if (result) {
        await loadData();
        closeModal();
      } else {
        Alert.alert('Error', 'No se pudo actualizar el plan');
      }
    } else {
      const result = await planesService.create({
        nombre: data.nombre,
        anio_resolucion: parseInt(data.anio_resolucion, 10),
      });

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
    <Card style={styles.planCard}>
      <View style={styles.planContent}>
        <View style={styles.planIcon}>
          <BookOpen size={24} color={colors.primary} />
        </View>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{item.nombre}</Text>
          <Text style={styles.planYear}>Resolución: {item.anio_resolucion}</Text>
        </View>
        <View style={styles.planActions}>
          <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionButton}>
            <Edit2 size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando planes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Planes de Estudio</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Plus size={20} color={colors.background} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={planes}
        renderItem={renderPlan}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <BookOpen size={40} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No hay planes de estudio</Text>
            <Text style={styles.emptySubtext}>Toca + para crear el primero</Text>
          </Card>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingPlan ? 'Editar Plan' : 'Nuevo Plan'}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Controller
              control={control}
              name="nombre"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Nombre del Plan"
                  placeholder="Ej: Plan 2024"
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
                  label="Año de Resolución"
                  placeholder="Ej: 2024"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  error={errors.anio_resolucion?.message}
                />
              )}
            />

            <Button
              title={editingPlan ? 'Actualizar' : 'Crear Plan'}
              onPress={handleSubmit(onSubmit)}
              style={styles.submitButton}
            />
          </View>
        </SafeAreaView>
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
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  planCard: {
    marginBottom: spacing.md,
  },
  planContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  planName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  planYear: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  planActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
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
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  cancelText: {
    fontSize: fontSize.md,
    color: colors.primary,
  },
  modalContent: {
    padding: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.xl,
  },
});
