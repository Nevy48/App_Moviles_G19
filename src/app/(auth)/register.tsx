import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Input } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontWeight } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const logoUrl = 'https://res.cloudinary.com/disx14b4q/image/upload/v1779402010/image_2_bluupa.png';

const registerSchema = z.object({
  nombreCompleto: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombreCompleto: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    const result = await signUp(data.email, data.password, data.nombreCompleto);

    if (!result.success) {
      Alert.alert('Error de registro', result.error || 'No se pudo crear la cuenta');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['transparent', colors.primary + '10']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bgGradient}
      />

      <View style={styles.decorRect1} />
      <View style={styles.decorRect2} />

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
              <Text style={styles.welcomeTitle}>¡Comencemos!</Text>
              <View style={styles.logoWrapper}>
                <Image
                  source={{ uri: logoUrl }}
                  style={styles.logo}
                  contentFit="contain"
                  transition={200}
                  cachePolicy="memory-disk"
                />
              </View>
              <Text style={styles.title}>Crear Cuenta</Text>
              <Text style={styles.subtitle}>
                Unite a la comunidad académica
              </Text>
            </View>

            <View style={styles.form}>
              <Controller
                control={control}
                name="nombreCompleto"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Nombre completo"
                    placeholder="Tu nombre completo"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="words"
                    leftIcon={<User size={20} color={colors.textTertiary} />}
                    error={errors.nombreCompleto?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Email"
                    placeholder="tu@email.com"
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

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Confirmar Contraseña"
                    placeholder="••••••••"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!showPassword}
                    leftIcon={<Lock size={20} color={colors.textTertiary} />}
                    error={errors.confirmPassword?.message}
                  />
                )}
              />

              <Button
                title="Crear Cuenta"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                style={styles.button}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Ya tenés cuenta?</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.footerLink}>Iniciá Sesión</Text>
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
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorRect1: {
    position: 'absolute',
    top: '15%',
    right: -20,
    width: 120,
    height: 60,
    backgroundColor: colors.primary,
    opacity: 0.1,
    borderRadius: borderRadius.md,
    transform: [{ rotate: '-15deg' }],
  },
  decorRect2: {
    position: 'absolute',
    bottom: '10%',
    left: -30,
    width: 180,
    height: 40,
    backgroundColor: colors.primary,
    opacity: 0.05,
    borderRadius: borderRadius.md,
    transform: [{ rotate: '20deg' }],
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  welcomeTitle: {
    fontSize: 40,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
    letterSpacing: -1,
    textShadowColor: 'rgba(55, 129, 247, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  logoWrapper: {
    padding: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    opacity: 0.8,
  },
  form: {
    marginBottom: spacing.xl,
  },
  button: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.lg,
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
