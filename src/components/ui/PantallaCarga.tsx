import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors } from '@/constants';
import { spacing, fontSize, fontFamily } from '@/constants/theme';

interface PantallaCargaProps {
  mensaje?: string;
}

export const PantallaCarga = ({ mensaje }: PantallaCargaProps) => {
  return (
    <View style={styles.contenedor}>
      <ActivityIndicator size="large" color={colors.primary} />
      {mensaje && <Text style={styles.texto}>{mensaje}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Obligamos a que el fondo sea el de la app, eliminando el pantallazo blanco
    backgroundColor: colors.background,
  },
  texto: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
  },
});