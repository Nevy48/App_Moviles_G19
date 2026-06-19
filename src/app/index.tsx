import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/constants';

export default function Index() {
  // El redirect se maneja en _layout.tsx a través de useAuthRedirect
  // Este componente solo muestra una pantalla de carga mientras se verifica el auth state
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
