import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable, PressableProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '@/constants';
import { borderRadius, spacing, shadows } from '@/constants/theme';

interface CardProps extends Omit<PressableProps, 'style'> {
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
  onPress,
  ...pressableProps
}) => {
  const content = (
    <>
      {children}
    </>
  );

  const cardStyle = [styles.card, paddingStyles[padding], style];

  if (variant === 'glass') {
    return (
      <Pressable onPress={onPress} style={cardStyle} {...pressableProps}>
        <BlurView
          intensity={80}
          tint="dark"
          style={[styles.glass, paddingStyles[padding] as ViewStyle]}
        >
          {content}
        </BlurView>
      </Pressable>
    );
  }

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={cardStyle} {...pressableProps}>
        {content}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{content}</View>;
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
    borderRadius: borderRadius.lg,
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
