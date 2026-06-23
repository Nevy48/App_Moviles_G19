import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Button, Input } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';

const urlLogoInstitucional = 'https://res.cloudinary.com/disx14b4q/image/upload/v1779402010/image_2_bluupa.png';
const urlIconoGoogle = 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png';

const esquemaLogin = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormularioData = z.infer<typeof esquemaLogin>;

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormularioData>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: { email: '', password: '' },
  });

  const alEnviarFormulario = async (data: LoginFormularioData) => {
    const resultado = await signIn(data.email, data.password);
    if (!resultado.success) {
      Alert.alert('Error de autenticación', resultado.error || 'No se pudo iniciar sesión');
    }
  };

  const iniciarSesionGoogle = async () => {
    try {
      const { error } = await authService.signInWithGoogle();
      if (error) Alert.alert('Error', error);
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un error inesperado al conectar con Google');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} scrollEnabled={false} bounces={false}>
            
            {/* Header unificado en fila: Logo izquierda, Marca derecha */}
            <View style={styles.headerRow}>
              <Image source={{ uri: urlLogoInstitucional }} style={styles.logo} contentFit="contain" cachePolicy="memory-disk" />
              <View style={styles.titleColumn}>
                <Text style={styles.titleTextBase}>MI ESTADO</Text>
                <Text style={styles.titleTextResaltado}>ACADÉMICO</Text>
              </View>
            </View>
            
            <Text style={styles.subtitle}>Bienvenido de vuelta</Text>

            {/* Caja de Login encapsulada idéntica al componente var(--panel) de la web */}
            <View style={styles.loginBox}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Correo electrónico"
                    placeholder="alumno@mail.com"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon={<Mail size={20} color={colors.textTertiary} />}
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Contraseña"
                    placeholder="••••••••"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!mostrarPassword}
                    leftIcon={<Lock size={20} color={colors.textTertiary} />}
                    rightIcon={
                      <TouchableOpacity onPress={() => setMostrarPassword(!mostrarPassword)}>
                        {mostrarPassword ? <EyeOff size={20} color={colors.textTertiary} /> : <Eye size={20} color={colors.textTertiary} />}
                      </TouchableOpacity>
                    }
                    error={errors.password?.message}
                  />
                )}
              />

              <Button title="Iniciar Sesión" onPress={handleSubmit(alEnviarFormulario)} loading={isLoading} style={styles.submitButton} />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o ingresá con</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Botón de Google refinado con fondo blanco y tipografía oscura */}
              <TouchableOpacity style={styles.googleButtonWhite} onPress={iniciarSesionGoogle}>
                <Image source={{ uri: urlIconoGoogle }} style={styles.googleIcon} contentFit="contain" cachePolicy="memory-disk" />
                <Text style={styles.googleButtonText}>Continuar con Google</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>¿No tenés una cuenta?</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                  <Text style={styles.footerLink}>Registrate acá</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl, justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, marginBottom: spacing.sm },
  logo: { width: 55, height: 55 },
  titleColumn: { flexDirection: 'column', justifyContent: 'center' },
  // Buscar estas dos propiedades dentro de styles y modificarlas así:
  titleTextBase: { 
    fontSize: fontSize.xxl, 
    fontFamily: 'Syne-ExtraBold', // <-- Reemplazá aquí con el nombre exacto de tu fuente cargada
    color: colors.textPrimary, 
    letterSpacing: 0.5 
  },
  titleTextResaltado: { 
    fontSize: fontSize.xxl, 
    fontFamily: 'Syne-ExtraBold', // <-- Reemplazá aquí con el nombre exacto de tu fuente cargada
    color: colors.primary, 
    letterSpacing: 0.5, 
    marginTop: -4 
  },
  subtitle: { fontSize: fontSize.md, fontFamily: fontFamily.regular, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl, opacity: 0.9 },
  loginBox: { backgroundColor: colors.card, borderTransform: 'none', borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 20, padding: spacing.lg, width: '100%', maxWidth: 400, alignSelf: 'center', gap: spacing.xs },
  submitButton: { marginTop: spacing.md, marginBottom: spacing.sm },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.cardBorder },
  dividerText: { color: colors.textTertiary, marginHorizontal: spacing.md, fontSize: fontSize.xs, fontFamily: fontFamily.regular, textTransform: 'uppercase', letterSpacing: 1 },
  googleButtonWhite: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, backgroundColor: '#ffffff', borderWidth: 1, borderColor: colors.cardBorder, borderRadius: borderRadius.md, padding: spacing.md, width: '100%', marginTop: spacing.xs, marginBottom: spacing.sm },
  googleButtonText: { color: '#000000', fontSize: fontSize.md, fontFamily: fontFamily.bold },
  googleIcon: { width: 20, height: 20 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md, paddingBottom: spacing.xs },
  footerText: { color: colors.textSecondary, fontSize: fontSize.sm, fontFamily: fontFamily.regular },
  footerLink: { color: colors.primary, fontSize: fontSize.sm, fontFamily: fontFamily.bold },
});