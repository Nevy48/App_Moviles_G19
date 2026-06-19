import React from 'react';
import { View, Text, StyleSheet, Pressable, PressableProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontWeight } from '@/constants/theme';
import { ProgressBar } from './ProgressBar';

interface StatsCardProps extends Omit<PressableProps, 'style'> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  gradientColors?: [string, string];
  progress?: number;
  progressLabel?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  gradientColors = [colors.primary + '30', colors.primary + '10'],
  progress,
  progressLabel,
  onPress,
  ...pressableProps
}) => {
  const content = (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.header}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.title}>{title}</Text>
      </View>

      <Text style={styles.value}>{value}</Text>

      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}

      {progress !== undefined && (
        <View style={styles.progressContainer}>
          <ProgressBar
            percentage={progress}
            label={progressLabel}
            height={6}
          />
        </View>
      )}
    </LinearGradient>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.container} {...pressableProps}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 150,
  },
  gradient: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  title: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  value: {
    color: colors.textPrimary,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
});
