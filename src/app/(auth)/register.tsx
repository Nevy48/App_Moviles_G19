import { useState, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft } from 'lucide-react-native';
import { Button, Input } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const esquemaRegistro = z.object({
  nombreCompleto: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string(),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterFormularioData = z.infer<typeof esquemaRegistro>;

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [paso, setPaso] = useState(1);

  // Referencias para encadenar los inputs en el teclado
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const { control, handleSubmit, watch, trigger, formState: { errors } } = useForm<RegisterFormularioData>({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: { nombreCompleto: '', email: '', password: '', confirmPassword: '' },
  });

  const valorPassword = watch('password') || '';
  const valorConfirmPassword = watch('confirmPassword') || '';

  const requisitosValidacion = [
    { test: (p: string) => p.length >= 8 && p.length <= 16, label: 'Entre 8 y 16 caracteres' },
    { test: (p: string) => /[A-Z]/.test(p), label: 'Una letra mayúscula' },
    { test: (p: string) => /[a-z]/.test(p), label: 'Una letra minúscula' },
    { test: (p: string) => /[0-9]/.test(p), label: 'Un número' },
    { test: (p: string, cp: string) => p === cp && p.length > 0, label: 'Las contraseñas coinciden' }
  ];

  const todoEsValido = requisitosValidacion.every(req => req.test(valorPassword, valorConfirmPassword));

  const procesarSiguientePaso = async () => {
    const camposValidos = await trigger(['email', 'password', 'confirmPassword']);
    if (camposValidos && todoEsValido) {
      setPaso(2);
    } else if (!todoEsValido) {
      Alert.alert('Requisito faltante', 'La contraseña no cumple con las condiciones de seguridad.');
    }
  };

  const alEnviarFormulario = async (data: RegisterFormularioData) => {
    const resultado = await signUp(data.email, data.password, data.nombreCompleto);
    if (!resultado.success) {
      Alert.alert('Error de registro', resultado.error || 'No se pudo crear la cuenta');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled" // <--- SOLUCIONA LOS DOBLES TOQUES
          >
            
            <View style={styles.header}>
              <View style={styles.tituloContenedor}>
                <Text style={styles.tituloTextoBase}>CREAR </Text>
                <Text style={styles.tituloTextoResaltado}>CUENTA</Text>
              </View>
            </View>

            <View style={styles.registerBox}>
              
              {paso === 1 && (
                <View style={styles.bloqueContenido}>
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
                        // Teclado: Siguiente (Password)
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onSubmitEditing={() => passwordRef.current?.focus()}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        ref={passwordRef}
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
                        // Teclado: Siguiente (Confirm Password)
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="confirmPassword"
                    render={({ field: { onChange, value } }) => (
                      <Input 
                        ref={confirmPasswordRef}
                        label="Confirmar Contraseña" 
                        placeholder="••••••••" 
                        value={value} 
                        onChangeText={onChange} 
                        secureTextEntry={!mostrarPassword} 
                        leftIcon={<Lock size={20} color={colors.textTertiary} />} 
                        error={errors.confirmPassword?.message} 
                        // Teclado: Enter avanza al Paso 2
                        returnKeyType="go"
                        onSubmitEditing={procesarSiguientePaso}
                      />
                    )}
                  />

                  <View style={styles.contenedorRequisitos}>
                    <Text style={styles.tituloRequisitos}>Requisitos de tu contraseña:</Text>
                    {requisitosValidacion.map((req, indice) => {
                      const cumpleRequisito = req.test(valorPassword, valorConfirmPassword);
                      return (
                        <View key={indice} style={styles.filaRequisito}>
                          <View style={[styles.circuloCheck, cumpleRequisito && styles.circuloCheckCumplido]}>
                            {cumpleRequisito && <Text style={styles.simboloCheck}>✓</Text>}
                          </View>
                          <Text style={[styles.textoRequisito, cumpleRequisito && styles.textoRequisitoCumplido]}>
                            {req.label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <Button title="Continuar" onPress={procesarSiguientePaso} style={styles.submitButton} />
                </View>
              )}

              {paso === 2 && (
                <View style={styles.bloqueContenido}>
                  <TouchableOpacity style={styles.botonVolverPaso} onPress={() => setPaso(1)}>
                    <ArrowLeft size={16} color={colors.primary} />
                    <Text style={styles.textoVolverPaso}>Volver al paso anterior</Text>
                  </TouchableOpacity>

                  <Controller
                    control={control}
                    name="nombreCompleto"
                    render={({ field: { onChange, value } }) => (
                      <Input 
                        label="Nombre completo" 
                        placeholder="Tu nombre y apellido" 
                        value={value} 
                        onChangeText={onChange} 
                        autoCapitalize="words" 
                        leftIcon={<User size={20} color={colors.textTertiary} />} 
                        error={errors.nombreCompleto?.message} 
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit(alEnviarFormulario)}
                      />
                    )}
                  />

                  <Button title="Finalizar Alta" onPress={handleSubmit(alEnviarFormulario)} loading={isLoading} style={styles.submitButton} />
                </View>
              )}

              <View style={styles.footer}>
                <Text style={styles.footerText}>¿Ya tenés cuenta?</Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.footerLink}>Iniciá sesión</Text>
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
  scrollContent: { 
    flexGrow: 1, 
    paddingHorizontal: spacing.xl, 
    paddingBottom: spacing.xxl, 
    paddingTop: Platform.OS === 'ios' ? 120 : 80 // <--- Empuja el contenido hacia el centro estáticamente
  },
  header: { alignItems: 'center', marginBottom: spacing.md },
  tituloContenedor: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  tituloTextoBase: { fontSize: fontSize.xxl, fontFamily: 'Syne-ExtraBold', color: colors.textPrimary, letterSpacing: 0.5 },
  tituloTextoResaltado: { fontSize: fontSize.xxl, fontFamily: 'Syne-ExtraBold', color: colors.primary, letterSpacing: 0.5 },
  registerBox: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 20, padding: spacing.lg, width: '100%', maxWidth: 400, alignSelf: 'center' },
  bloqueContenido: { gap: spacing.xs },
  submitButton: { marginTop: spacing.md, marginBottom: spacing.xs },
  contenedorRequisitos: { backgroundColor: colors.inputBackground, padding: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.inputBorder, display: 'flex', flexDirection: 'column', gap: 4, marginTop: 2, marginBottom: 2 },
  tituloRequisitos: { fontSize: fontSize.xs, fontFamily: fontFamily.bold, color: colors.textSecondary, marginBottom: 2 },
  filaRequisito: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  circuloCheck: { width: 14, height: 14, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.inputBorder, alignItems: 'center', justifyContent: 'center' },
  circuloCheckCumplido: { backgroundColor: colors.success, borderColor: colors.success },
  simboloCheck: { color: colors.white, fontSize: 9, fontFamily: fontFamily.bold, marginTop: -1 },
  textoRequisito: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textTertiary },
  textoRequisitoCumplido: { color: colors.textPrimary, fontFamily: fontFamily.medium },
  botonVolverPaso: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xs, marginBottom: spacing.sm },
  textoVolverPaso: { color: colors.primary, fontSize: fontSize.sm, fontFamily: fontFamily.medium },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: spacing.md },
  footerText: { color: colors.textSecondary, fontSize: fontSize.sm, fontFamily: fontFamily.regular },
  footerLink: { color: colors.primary, fontSize: fontSize.sm, fontFamily: fontFamily.bold },
});