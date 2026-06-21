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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Materia, PlanEstudio } from '@/lib/supabase/database.types';
import { materiasService } from '@/services/materiasService';
import { planesService } from '@/services/planesService';
import { Card, Button, Input } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontWeight } from '@/constants/theme';
import { Plus, Edit2, Trash2, GraduationCap } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const materiaSchema = z.object({
  id_plan: z.string().min(1, 'Selecciona un plan'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  nivel: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
    message: 'Nivel debe ser un número >= 1',
  }),
  horas_anuales: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Horas debe ser un número válido',
  }),
});

type MateriaFormData = z.infer<typeof materiaSchema>;

export default function AdminMateriasScreen() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [planes, setPlanes] = useState<PlanEstudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMateria, setEditingMateria] = useState<Materia | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<MateriaFormData>({
    resolver: zodResolver(materiaSchema),
    defaultValues: {
      id_plan: '',
      nombre: '',
      nivel: '1',
      horas_anuales: '0',
    },
  });

  const loadData = async () => {
    const [materiasData, planesData] = await Promise.all([
      materiasService.getAll(),
      planesService.getAll(),
    ]);
    setMaterias(materiasData);
    setPlanes(planesData);
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

  const onSubmit = async (data: MateriaFormData) => {
    const materiaData = {
      id_plan: data.id_plan,
      nombre: data.nombre,
      nivel: parseInt(data.nivel, 10),
      horas_anuales: parseInt(data.horas_anuales, 10),
    };

    if (editingMateria) {
      const result = await materiasService.update(editingMateria.id, materiaData);
      if (result) {
        await loadData();
        closeModal();
      } else {
        Alert.alert('Error', 'No se pudo actualizar la materia');
      }
    } else {
      const result = await materiasService.create(materiaData);
      if (result) {
        await loadData();
        closeModal();
      } else {
        Alert.alert('Error', 'No se pudo crear la materia');
      }
    }
  };

  const handleDelete = (materia: Materia) => {
    Alert.alert(
      'Eliminar Materia',
      `¿Estás seguro de eliminar "${materia.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const success = await materiasService.delete(materia.id);
            if (success) {
              await loadData();
            } else {
              Alert.alert('Error', 'No se pudo eliminar la materia');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (materia: Materia) => {
    setEditingMateria(materia);
    reset({
      id_plan: materia.id_plan,
      nombre: materia.nombre,
      nivel: materia.nivel.toString(),
      horas_anuales: materia.horas_anuales.toString(),
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingMateria(null);
    reset({ id_plan: '', nombre: '', nivel: '1', horas_anuales: '0' });
  };

  const getPlanNombre = (planId: string) => {
    return planes.find(p => p.id === planId)?.nombre || 'Sin plan';
  };

  const groupedMaterias = materias.reduce((acc, materia) => {
    const nivel = materia.nivel;
    if (!acc[nivel]) {
      acc[nivel] = [];
    }
    acc[nivel].push(materia);
    return acc;
  }, {} as Record<number, Materia[]>);

  const sortedNiveles = Object.keys(groupedMaterias)
    .map(Number)
    .sort((a, b) => a - b);

  const renderMateria = ({ item }: { item: Materia }) => (
    <Card style={styles.materiaCard}>
      <View style={styles.materiaContent}>
        <View style={styles.materiaIcon}>
          <GraduationCap size={20} color={colors.primary} />
        </View>
        <View style={styles.materiaInfo}>
          <Text style={styles.materiaName}>{item.nombre}</Text>
          <View style={styles.materiaMeta}>
            <Text style={styles.materiaInfoText}>Nivel {item.nivel}</Text>
            <Text style={styles.materiaDot}>•</Text>
            <Text style={styles.materiaInfoText}>{item.horas_anuales}h</Text>
            <Text style={styles.materiaDot}>•</Text>
            <Text style={styles.planText}>{getPlanNombre(item.id_plan)}</Text>
          </View>
        </View>
        <View style={styles.materiaActions}>
          <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionButton}>
            <Edit2 size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
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
          <Text style={styles.loadingText}>Cargando materias...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Materias</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Plus size={20} color={colors.background} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedNiveles}
        keyExtractor={(item) => `nivel-${item}`}
        renderItem={({ item: nivel }) => (
          <View style={styles.nivelSection}>
            <Text style={styles.nivelTitle}>Nivel {nivel}</Text>
            {groupedMaterias[nivel].map((materia) => (
              <View key={materia.id}>{renderMateria({ item: materia })}</View>
            ))}
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <GraduationCap size={40} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No hay materias</Text>
            <Text style={styles.emptySubtext}>Toca + para crear la primera</Text>
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
              {editingMateria ? 'Editar Materia' : 'Nueva Materia'}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Plan de Estudio</Text>
            <TouchableOpacity
              style={styles.select}
              onPress={() => {
                if (planes.length === 0) {
                  Alert.alert('Error', 'No hay planes disponibles. Crea uno primero.');
                  return;
                }
                Alert.alert(
                  'Seleccionar Plan',
                  undefined,
                  planes.map((p) => ({
                    text: p.nombre,
                    onPress: () => {
                      reset({ ...control._formValues, id_plan: p.id });
                    },
                  }))
                );
              }}
            >
              <Text style={styles.selectText}>
                {planes.find(p => p.id === control._formValues.id_plan)?.nombre || 'Seleccionar plan'}
              </Text>
            </TouchableOpacity>
            {errors.id_plan && <Text style={styles.errorText}>{errors.id_plan.message}</Text>}

            <Controller
              control={control}
              name="nombre"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Nombre"
                  placeholder="Nombre de la materia"
                  value={value}
                  onChangeText={onChange}
                  error={errors.nombre?.message}
                />
              )}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Controller
                  control={control}
                  name="nivel"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Nivel"
                      placeholder="1"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="numeric"
                      error={errors.nivel?.message}
                    />
                  )}
                />
              </View>
              <View style={styles.halfInput}>
                <Controller
                  control={control}
                  name="horas_anuales"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Horas Anuales"
                      placeholder="0"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="numeric"
                      error={errors.horas_anuales?.message}
                    />
                  )}
                />
              </View>
            </View>

            <Button
              title={editingMateria ? 'Actualizar' : 'Crear Materia'}
              onPress={handleSubmit(onSubmit)}
              style={styles.submitButton}
            />
          </ScrollView>
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
  nivelSection: {
    marginBottom: spacing.xl,
  },
  nivelTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  materiaCard: {
    marginBottom: spacing.sm,
  },
  materiaContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  materiaIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  materiaInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  materiaName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  materiaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  materiaInfoText: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    flexShrink: 1,
  },
  materiaDot: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginHorizontal: spacing.xs,
  },
  planText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    flexShrink: 1,
  },
  materiaActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginLeft: spacing.xs,
  },
  actionButton: {
    padding: spacing.sm,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  select: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  selectText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.xl,
  },
});
