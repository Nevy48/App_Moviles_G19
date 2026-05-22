import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Eye, EyeOff, Building2, GraduationCap } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontWeight } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';

const logoUrl = 'https://res.cloudinary.com/disx14b4q/image/upload/v1779402010/image_2_bluupa.png';

const registerSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
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
  const { mockLogin, setLoading, isLoading } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedCareer, setSelectedCareer] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);
      // Mock register - in real app would call Firebase
      mockLogin();
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Error', 'No se pudo completar el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image source={{ uri: logoUrl }} style={styles.logo} />
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>
              Completa tus datos para comenzar
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Nombre"
                  placeholder="Tu nombre"
                  value=""
                  onChangeText={() => {}}
                  autoCapitalize="words"
                  leftIcon={<User size={20} color={colors.textTertiary} />}
                  error={errors.firstName?.message}
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Apellido"
                  placeholder="Tu apellido"
                  value=""
                  onChangeText={() => {}}
                  autoCapitalize="words"
                  error={errors.lastName?.message}
                />
              </View>
            </View>

            <Input
              label="Email"
              placeholder="tu@email.com"
              value=""
              onChangeText={() => {}}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={20} color={colors.textTertiary} />}
              error={errors.email?.message}
            />

            <Input
              label="Universidad"
              placeholder="Selecciona tu universidad"
              value=""
              onChangeText={() => {}}
              leftIcon={<Building2 size={20} color={colors.textTertiary} />}
            />

            <Input
              label="Carrera"
              placeholder="Selecciona tu carrera"
              value=""
              onChangeText={() => {}}
              leftIcon={<GraduationCap size={20} color={colors.textTertiary} />}
            />

            <Input
              label="Contraseña"
              placeholder="••••••••"
              value=""
              onChangeText={() => {}}
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

            <Input
              label="Confirmar Contraseña"
              placeholder="••••••••"
              value=""
              onChangeText={() => {}}
              secureTextEntry={!showPassword}
              leftIcon={<Lock size={20} color={colors.textTertiary} />}
              error={errors.confirmPassword?.message}
            />

            <Button
              title="Crear Cuenta"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={styles.button}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerLink}>Inicia Sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  button: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  footerLink: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});