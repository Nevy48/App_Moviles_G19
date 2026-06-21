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
import { Materia, CorrelativaWithDetails, TipoCorrelativa } from '@/lib/supabase/database.types';
import { correlativasService } from '@/services/correlativasService';
import { materiasService } from '@/services/materiasService';
import { Card, Button } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontWeight } from '@/constants/theme';
import { Plus, Trash2, Link2 } from 'lucide-react-native';

export default function AdminCorrelativasScreen() {
  const [correlativas, setCorrelativas] = useState<CorrelativaWithDetails[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMateria, setSelectedMateria] = useState<string>('');
  const [selectedCorrelativa, setSelectedCorrelativa] = useState<string>('');
  const [selectedTipo, setSelectedTipo] = useState<TipoCorrelativa>('cursada');

  const loadData = async () => {
    const [correlativasData, materiasData] = await Promise.all([
      correlativasService.getAll(),
      materiasService.getAll(),
    ]);
    setCorrelativas(correlativasData);
    setMaterias(materiasData);
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

  const onSubmit = async () => {
    if (!selectedMateria || !selectedCorrelativa) {
      Alert.alert('Error', 'Selecciona una materia y su correlativa');
      return;
    }

    if (selectedMateria === selectedCorrelativa) {
      Alert.alert('Error', 'Una materia no puede ser correlativa de sí misma');
      return;
    }

    const exists = correlativas.some(
      c => c.id_materia === selectedMateria && c.id_correlativa === selectedCorrelativa
    );

    if (exists) {
      Alert.alert('Error', 'Esta correlativa ya existe');
      return;
    }

    const result = await correlativasService.create({
      id_materia: selectedMateria,
      id_correlativa: selectedCorrelativa,
      tipo: selectedTipo,
    });

    if (result) {
      await loadData();
      closeModal();
    } else {
      Alert.alert('Error', 'No se pudo crear la correlativa');
    }
  };

  const handleDelete = (correlativa: CorrelativaWithDetails) => {
    Alert.alert(
      'Eliminar Correlativa',
      `¿Eliminar la correlativa "${correlativa.correlativa_nombre}" de "${correlativa.materia_nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const success = await correlativasService.delete(correlativa.id_materia, correlativa.id_correlativa);
            if (success) {
              await loadData();
            } else {
              Alert.alert('Error', 'No se pudo eliminar la correlativa');
            }
          },
        },
      ]
    );
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMateria('');
    setSelectedCorrelativa('');
    setSelectedTipo('cursada');
  };

  const getMateriaNombre = (id: string) => {
    return materias.find(m => m.id === id)?.nombre || 'Desconocida';
  };

  const getTipoLabel = (tipo: TipoCorrelativa) => {
    return tipo === 'cursada' ? 'Cursada' : 'Aprobada';
  };

  const renderCorrelativa = ({ item }: { item: CorrelativaWithDetails }) => (
    <Card style={styles.correlativaCard}>
      <View style={styles.correlativaContent}>
        <View style={styles.correlativaMain}>
          <Text style={styles.correlativaMateria}>{item.materia_nombre}</Text>
          <View style={styles.correlativaArrow}>
            <Link2 size={16} color={colors.textTertiary} />
            <Text style={styles.correlativaTipo}>{getTipoLabel(item.tipo)}</Text>
          </View>
          <Text style={styles.correlativaRequisito}>{item.correlativa_nombre}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
          <Trash2 size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando correlativas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Correlativas</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Plus size={20} color={colors.background} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={correlativas}
        renderItem={renderCorrelativa}
        keyExtractor={(item) => `${item.id_materia}-${item.id_correlativa}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Link2 size={40} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No hay correlativas</Text>
            <Text style={styles.emptySubtext}>Toca + para agregar la primera</Text>
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
            <Text style={styles.modalTitle}>Nueva Correlativa</Text>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Materia</Text>
            <TouchableOpacity
              style={styles.select}
              onPress={() => {
                Alert.alert(
                  'Seleccionar Materia',
                  undefined,
                  materias.map((m) => ({
                    text: m.nombre,
                    onPress: () => setSelectedMateria(m.id),
                  }))
                );
              }}
            >
              <Text style={styles.selectText}>
                {selectedMateria ? getMateriaNombre(selectedMateria) : 'Seleccionar materia'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Correlativa Requerida</Text>
            <TouchableOpacity
              style={styles.select}
              onPress={() => {
                const available = materias.filter(m => m.id !== selectedMateria);
                Alert.alert(
                  'Seleccionar Correlativa',
                  undefined,
                  available.map((m) => ({
                    text: m.nombre,
                    onPress: () => setSelectedCorrelativa(m.id),
                  }))
                );
              }}
            >
              <Text style={styles.selectText}>
                {selectedCorrelativa ? getMateriaNombre(selectedCorrelativa) : 'Seleccionar correlativa'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Tipo de Correlativa</Text>
            <View style={styles.tipoSelector}>
              <TouchableOpacity
                style={[styles.tipoOption, selectedTipo === 'cursada' && styles.tipoOptionSelected]}
                onPress={() => setSelectedTipo('cursada')}
              >
                <Text style={[styles.tipoOptionText, selectedTipo === 'cursada' && styles.tipoOptionTextSelected]}>
                  Cursada
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tipoOption, selectedTipo === 'aprobada' && styles.tipoOptionSelected]}
                onPress={() => setSelectedTipo('aprobada')}
              >
                <Text style={[styles.tipoOptionText, selectedTipo === 'aprobada' && styles.tipoOptionTextSelected]}>
                  Aprobada
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Crear Correlativa"
              onPress={onSubmit}
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
  correlativaCard: {
    marginBottom: spacing.md,
  },
  correlativaContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  correlativaMain: {
    flex: 1,
  },
  correlativaMateria: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  correlativaArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
    gap: spacing.xs,
  },
  correlativaTipo: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  correlativaRequisito: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    flexShrink: 1,
  },
  deleteButton: {
    padding: spacing.sm,
    minWidth: 40,
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
    marginTop: spacing.md,
  },
  select: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
  },
  selectText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  tipoSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tipoOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  tipoOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tipoOptionText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  tipoOptionTextSelected: {
    color: colors.background,
    fontWeight: fontWeight.medium,
  },
  submitButton: {
    marginTop: spacing.xl,
  },
});
