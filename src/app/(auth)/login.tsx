import { Button, Input } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, fontSize, fontWeight, spacing } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

const logoUrl = 'https://res.cloudinary.com/disx14b4q/image/upload/v1779402010/image_2_bluupa.png';
const googleIconUrl = 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { mockLogin, setLoading, isLoading } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      // Simulación de login
      mockLogin();
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Error en login:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    mockLogin();
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      {/* Fondo con Degradado Superior */}
      <LinearGradient
        colors={[colors.primary + '15', 'transparent']}
        style={styles.topGradient}
      />
      
      {/* Líneas Decorativas Geométricas */}
      <View style={styles.decorLine1} />
      <View style={styles.decorLine2} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
              <View style={styles.logoWrapper}>
                <Image 
                  source={{ uri: logoUrl }} 
                  style={styles.logo} 
                  contentFit="contain"
                  transition={200}
                  cachePolicy="memory-disk"
                />
              </View>
              <Text style={styles.title}>Mi Estado Académico</Text>
              <Text style={styles.subtitle}>Ingresá tus credenciales para acceder</Text>
            </View>

            <View style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Correo electrónico"
                    placeholder="alumno@frlp.utn.edu.ar"
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
                    placeholder="Contraseña"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!showPassword}
                    leftIcon={<Lock size={20} color={colors.textTertiary} />}
                    rightIcon={
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                          <EyeOff size={20} color={colors.textTertiary} />
                        ) : (
                          <Eye size={20} color={colors.textTertiary} />
                        )}
                      </TouchableOpacity>
                    }
                    error={errors.password?.message}
                  />
                )}
              />

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              <Button
                title="Iniciar sesión"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                style={styles.button}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o ingresa con</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title="Continuar con Google"
                onPress={handleGoogleLogin}
                variant="outline"
                leftIcon={
                  <Image 
                    source={{ uri: googleIconUrl }} 
                    style={styles.googleIcon} 
                    contentFit="contain"
                    cachePolicy="memory-disk"
                  />
                }
                style={styles.googleButton}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿No tenés cuenta?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.footerLink}>Registrarse</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  decorLine1: {
    position: 'absolute',
    top: 100,
    left: -20,
    width: 100,
    height: 2,
    backgroundColor: colors.primary,
    opacity: 0.2,
    transform: [{ rotate: '45deg' }],
  },
  decorLine2: {
    position: 'absolute',
    bottom: 150,
    right: -30,
    width: 150,
    height: 2,
    backgroundColor: colors.primary,
    opacity: 0.1,
    transform: [{ rotate: '-30deg' }],
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  welcomeTitle: {
    fontSize: 48,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.md,
    letterSpacing: -1.5,
    textShadowColor: 'rgba(55, 129, 247, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  logoWrapper: {
    padding: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    // Sutil brillo para el logo
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
    opacity: 0.8,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  button: {
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.cardBorder,
  },
  dividerText: {
    color: colors.textTertiary,
    marginHorizontal: spacing.md,
    fontSize: fontSize.sm,
  },
  googleButton: {
    marginBottom: spacing.xl,
    borderColor: colors.cardBorder,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  footerLink: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});