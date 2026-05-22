import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '@/constants';
import { borderRadius, spacing, shadows } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'glass';
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'md',
}) => {
  if (variant === 'glass') {
    return (
      <BlurView
        intensity={80}
        tint="dark"
        style={[styles.card, styles.glass, paddingStyles[padding], style]}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[styles.card, paddingStyles[padding], style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.md,
  },
  glass: {
    overflow: 'hidden',
  },
});

const paddingStyles = StyleSheet.create({
  sm: {
    padding: spacing.sm,
  },
  md: {
    padding: spacing.md,
  },
  lg: {
    padding: spacing.lg,
  },
});