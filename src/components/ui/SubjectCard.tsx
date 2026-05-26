import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontWeight } from '@/constants/theme';
import { ExtendedSubjectStatus } from '@/store/userStore';

interface SubjectCardProps {
  name: string;
  code: string;
  status: ExtendedSubjectStatus;
  year: number;
  semester: 1 | 2;
  credits: number;
  difficulty: number;
  professor?: string;
  hours?: string;
  correlCursada?: string[];
  correlAprobada?: string[];
  comisiones?: any[];
  isElectivePlaceholder?: boolean;
  isSeminario?: boolean;
  onPress?: () => void;
  onStatusChange?: (status: ExtendedSubjectStatus) => void;
  canChangeTo?: ExtendedSubjectStatus[];
}

const statusConfig: Record<ExtendedSubjectStatus, { color: string; bgColor: string; textColor: string }> = {
  approved: { color: colors.success, bgColor: colors.success + '15', textColor: colors.success },       // Verde
  cursada: { color: colors.warning, bgColor: colors.warning + '15', textColor: colors.warning },         // Amarillo
  in_progress: { color: colors.primary, bgColor: colors.primary + '15', textColor: colors.primary },     // Azul
  pending: { color: colors.white, bgColor: 'rgba(255, 255, 255, 0.1)', textColor: colors.white },        // Blancas
  disabled: { color: colors.textTertiary, bgColor: colors.inputBackground, textColor: colors.textTertiary }, // Grises
  available: { color: colors.white, bgColor: colors.inputBackground, textColor: colors.white },          // Por si se usa en algún momento
};

const statusLabels: Record<ExtendedSubjectStatus, string> = {
  disabled: 'Bloqueada',
  available: 'Disponible',
  pending: 'Pendiente',
  in_progress: 'Cursando',
  cursada: 'Cursada',
  approved: 'Aprobada',
};

export const SubjectCard: React.FC<SubjectCardProps> = ({
  name,
  code,
  status,
  year,
  semester,
  hours,
  isElectivePlaceholder,
  isSeminario,
  onPress,
  onStatusChange,
  canChangeTo = [],
}) => {
  const config = statusConfig[status];
  const isDisabled = status === 'disabled';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={isDisabled ? 1 : 0.8}
      style={[styles.container, isDisabled && styles.containerDisabled]}
    >
      {/* Left colored bar indicating status */}
      <View style={[styles.statusBar, { backgroundColor: config.color }]} />

      <View style={styles.content}>
        {/* Top row: code + status badge */}
        <View style={styles.topRow}>
          <Text style={[styles.code, { color: isDisabled ? colors.textTertiary : colors.textSecondary }]}>
            {code}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
            <Text style={[styles.statusText, { color: config.textColor }]}>
              {statusLabels[status]}
            </Text>
          </View>
        </View>

        {/* Subject name - more prominent */}
        <Text style={[styles.name, isDisabled && styles.nameDisabled]} numberOfLines={2}>
          {name}
        </Text>

        {/* Hours - important info */}
        {hours && (
          <Text style={styles.hours}>{hours}</Text>
        )}

        {/* Badges */}
        {(isElectivePlaceholder || isSeminario) && (
          <View style={styles.badgesRow}>
            {isElectivePlaceholder && (
              <View style={[styles.badge, styles.electiveBadge]}>
                <Text style={styles.badgeText}>Electivas</Text>
              </View>
            )}
            {isSeminario && (
              <View style={[styles.badge, styles.seminarioBadge]}>
                <Text style={styles.badgeText}>Seminario</Text>
              </View>
            )}
          </View>
        )}

        {/* Year info */}
        <Text style={styles.yearInfo}>{year}° Año</Text>

        {/* Actions - only show if not disabled and has available transitions */}
        {!isDisabled && onStatusChange && canChangeTo.length > 0 && (
          <View style={styles.actionsContainer}>
            {canChangeTo.includes('pending') && (
              <TouchableOpacity
                style={[styles.actionButton, status === 'pending' && styles.activeAction]}
                onPress={() => onStatusChange('pending')}
              >
                <Text style={[styles.actionText, status === 'pending' && styles.activeActionText]}>Pendiente</Text>
              </TouchableOpacity>
            )}
            {canChangeTo.includes('in_progress') && (
              <TouchableOpacity
                style={[styles.actionButton, status === 'in_progress' && styles.activeAction]}
                onPress={() => onStatusChange('in_progress')}
              >
                <Text style={[styles.actionText, status === 'in_progress' && styles.activeActionText]}>Cursando</Text>
              </TouchableOpacity>
            )}
            {canChangeTo.includes('cursada') && (
              <TouchableOpacity
                style={[styles.actionButton, status === 'cursada' && styles.activeAction]}
                onPress={() => onStatusChange('cursada')}
              >
                <Text style={[styles.actionText, status === 'cursada' && styles.activeActionText]}>Cursada</Text>
              </TouchableOpacity>
            )}
            {canChangeTo.includes('approved') && (
              <TouchableOpacity
                style={[styles.actionButton, status === 'approved' && styles.activeAction]}
                onPress={() => onStatusChange('approved')}
              >
                <Text style={[styles.actionText, status === 'approved' && styles.activeActionText]}>Aprobada</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Disabled overlay message */}
        {isDisabled && (
          <Text style={styles.disabledText}>
            Completá correlativas para desbloquear
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  containerDisabled: {
    opacity: 0.6,
  },
  statusBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  code: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  name: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  nameDisabled: {
    color: colors.textTertiary,
  },
  hours: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  electiveBadge: {
    backgroundColor: colors.primary + '20',
  },
  seminarioBadge: {
    backgroundColor: colors.warning + '20',
  },
  badgeText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  yearInfo: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
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
  disabledText: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});