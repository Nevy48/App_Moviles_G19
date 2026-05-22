import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontWeight } from '@/constants/theme';
import { SubjectStatus } from '@/types';

interface SubjectCardProps {
  name: string;
  code: string;
  status: SubjectStatus;
  year: number;
  semester: 1 | 2;
  credits: number;
  difficulty: number;
  professor?: string;
  onPress?: () => void;
  onStatusChange?: (status: SubjectStatus) => void;
}

const statusColors: Record<SubjectStatus, [string, string]> = {
  pending: ['#6B7280', '#4B5563'],
  in_progress: ['#FBBF24', '#D97706'],
  approved: ['#34D399', '#059669'],
};

const statusLabels: Record<SubjectStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'Cursando',
  approved: 'Aprobada',
};

export const SubjectCard: React.FC<SubjectCardProps> = ({
  name,
  code,
  status,
  year,
  semester,
  credits,
  difficulty,
  professor,
  onPress,
  onStatusChange,
}) => {
  const statusColor = statusColors[status];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.codeContainer}>
          <Text style={styles.code}>{code}</Text>
        </View>
        <LinearGradient
          colors={statusColor}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statusBadge}
        >
          <Text style={styles.statusText}>{statusLabels[status]}</Text>
        </LinearGradient>
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {name}
      </Text>

      <View style={styles.footer}>
        <View style={styles.infoContainer}>
          <Text style={styles.info}>{year}° Año</Text>
          <Text style={styles.info}>|</Text>
          <Text style={styles.info}>{semestreLabel(semester)}</Text>
        </View>

        <View style={styles.creditsContainer}>
          <Text style={styles.credits}>{credits} créditos</Text>
        </View>
      </View>

      <View style={styles.difficultyContainer}>
        {renderDifficulty(difficulty)}
      </View>

      {professor && (
        <Text style={styles.professor}>Prof: {professor}</Text>
      )}

      {onStatusChange && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, status === 'pending' && styles.activeAction]}
            onPress={() => onStatusChange('pending')}
          >
            <Text style={[styles.actionText, status === 'pending' && styles.activeActionText]}>Pendiente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, status === 'in_progress' && styles.activeAction]}
            onPress={() => onStatusChange('in_progress')}
          >
            <Text style={[styles.actionText, status === 'in_progress' && styles.activeActionText]}>Cursando</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, status === 'approved' && styles.activeAction]}
            onPress={() => onStatusChange('approved')}
          >
            <Text style={[styles.actionText, status === 'approved' && styles.activeActionText]}>Aprobada</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const semestreLabel = (semester: 1 | 2) =>
  semester === 1 ? '1° Cuatrimestre' : '2° Cuatrimestre';

const renderDifficulty = (level: number) => {
  const dots = [];
  for (let i = 1; i <= 5; i++) {
    dots.push(
      <View
        key={i}
        style={[
          styles.difficultyDot,
          i <= level ? styles.difficultyDotActive : styles.difficultyDotInactive,
        ]}
      />
    );
  }
  return dots;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  codeContainer: {
    backgroundColor: colors.inputBackground,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  code: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  name: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  info: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  creditsContainer: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  credits: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  difficultyDotActive: {
    backgroundColor: colors.warning,
  },
  difficultyDotInactive: {
    backgroundColor: colors.inputBorder,
  },
  professor: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.inputBackground,
    alignItems: 'center',
  },
  activeAction: {
    backgroundColor: colors.primary,
  },
  actionText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  activeActionText: {
    color: colors.white,
  },
});