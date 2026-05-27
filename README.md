# Mi Estado Académico 🎓📱

¡Bienvenido a **Mi Estado Académico**! Esta es una aplicación móvil moderna desarrollada con **React Native** y **Expo** (v55), diseñada específicamente para que los estudiantes universitarios puedan realizar un seguimiento inteligente, visual y en tiempo real de su progreso académico y sus planes de estudio.

La aplicación cuenta con un motor de correlativas automatizado que calcula de forma dinámica qué materias están habilitadas para cursar o rendir en base al estado de las materias previas, evitando confusiones y ayudando a planificar la carrera de forma óptima.

---

## 🚀 Características Principales

- 📊 **Dashboard Dinámico y Estadísticas**: Visualiza de un vistazo tu porcentaje de progreso, cantidad de materias aprobadas, cursadas, en curso y pendientes.
- 🗺️ **Plan de Estudios Interactivo**: Explora tu plan de estudios organizado por año lectivo de manera clara y estética.
- 🔗 **Evaluación Automática de Correlativas**: Sistema inteligente que bloquea (`disabled`) o habilita (`available`) materias de forma automática según apruebes o curses sus prerrequisitos.
- 📋 **Control de Estados Completo**: Cambia el estado de tus materias con un toque:
  - ✅ **Aprobada** (Aprobada/Finalizada)
  - 📝 **Cursada** (Regularizada/Firma de Cursada)
  - 📖 **Cursando** (En proceso de cursada)
  - ⏰ **Pendiente** (Disponible para cursar pero sin iniciar)
  - 🔒 **Bloqueada** (Falta cumplir materias correlativas previas)
- 🔐 **Sistema de Autenticación**: Flujos de registro e inicio de sesión integrados (soporte para autenticación local/mock y Firebase).
- 🎨 **Diseño Ultra Moderno**: Interfaz con modo oscuro premium, degradados elegantes, iconos estilizados y micro-animaciones fluidas.

---

## 🛠️ Stack Tecnológico

- **Framework**: [React Native](https://reactnative.dev/) con [Expo (v55)](https://expo.dev/)
- **Enrutamiento**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing con tipado estricto)
- **Estilos**: [NativeWind (v4)](https://www.nativewind.dev/) (Tailwind CSS optimizado para React Native)
- **Gestión de Estado**: [Zustand](https://github.com/pmndrs/zustand) (con persistencia local en dispositivo usando `AsyncStorage`)
- **Consultas Asíncronas**: [TanStack React Query](https://tanstack.com/query/latest)
- **Formularios**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) para validación estricta de esquemas
- **Iconografía**: [Lucide React Native](https://lucide.dev/)
- **Backend / Auth**: [Firebase](https://firebase.google.com/) (Listo para configuración y escalado)

---

## 📁 Estructura del Proyecto

El código fuente principal se encuentra organizado dentro de la carpeta `src/`:

```text
src/
├── app/                  # Enrutador basado en archivos (Expo Router)
│   ├── (auth)/           # Pantallas de Login y Registro
│   ├── (tabs)/           # Pantallas principales (Home, Plan, Profile) con navegación de pestañas
│   ├── _layout.tsx       # Layout de navegación raíz
│   └── index.tsx         # Punto de entrada y redirección inicial
├── components/           # Componentes de UI reutilizables
├── constants/            # Colores, temas y configuraciones estéticas de la app
├── data/                 # Datos simulados (mock de universidades, carreras y materias)
├── hooks/                # React Hooks personalizados de la aplicación
├── store/                # Estado global y lógica de negocio (Zustand: userStore)
├── types/                # Definiciones de TypeScript
└── global.css            # Archivo CSS global para configuración de NativeWind
```

---

## ⚡ Guía de Instalación y Configuración

Sigue estos pasos precisos para configurar el entorno e iniciar el proyecto en tu máquina local.

### Prerrequisitos

Asegúrate de tener instalado en tu sistema:
- **Node.js** (Versión 18 o superior recomendada, Lts)
- **npm** o **yarn**
- **Dispositivo móvil físico** con la app **Expo Go** instalada ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id984023095)) **O** un emulador configurado ([Android Studio Emulator](https://docs.expo.dev/workflow/android-studio-emulator/) / [Xcode Simulator](https://docs.expo.dev/workflow/ios-simulator/)).

### 1. Clonar e Instalar Dependencias

Abre la terminal en la raíz del proyecto y ejecuta:

```bash
# Instalar los paquetes y dependencias del proyecto
npm install
```

---

## 🏃‍♂️ Cómo Iniciar el Proyecto

Una vez instaladas las dependencias, dispones de varios comandos para ejecutar la aplicación en el entorno de desarrollo.

### 1. Iniciar el Servidor de Desarrollo (Metro Bundler)

Ejecuta el servidor de desarrollo Metro:

```bash
npm run start
# o también:
npx expo start
```

Cuando Metro Bundler se inicie con éxito, verás un **código QR** en la terminal y varias opciones interactivas.

### 2. Ejecutar en Dispositivo Físico (Recomendado)

1. Abre la cámara de tu teléfono (en iOS) o la aplicación **Expo Go** (en Android).
2. Escanea el código QR que se muestra en tu terminal.
3. ¡Listo! La aplicación se cargará directamente en tu dispositivo físico y se actualizará automáticamente en tiempo real (Fast Refresh) a medida que guardes tus cambios.

### 3. Ejecutar en Emuladores

Si prefieres usar un emulador de desarrollo en tu computadora, presiona la tecla correspondiente en la terminal donde corre el Metro Bundler, o bien usa los siguientes scripts directos:

* **Android Emulator**: Asegúrate de tener el emulador abierto en Android Studio y ejecuta:
  ```bash
  npm run android
  ```
  *(O presiona `a` en la consola de Metro)*

* **iOS Simulator**: *(Solo macOS)* Asegúrate de tener Xcode instalado y ejecuta:
  ```bash
  npm run ios
  ```
  *(O presiona `i` en la consola de Metro)*

* **Web Browser**: Si deseas previsualizar la versión web responsiva en tu navegador:
  ```bash
  npm run web
  ```
  *(O presiona `w` en la consola de Metro)*

---

## 🛠️ Comandos Adicionales Útiles

- **Análisis de Código (Linting)**: Para validar las reglas de estilo y errores potenciales de TypeScript/React en el proyecto:
  ```bash
  npm run lint
  ```

- **Reestablecer Plantilla de Inicio**: Si deseas limpiar los ejemplos y comenzar una estructura desde cero:
  ```bash
  npm run reset-project
  ```

---

## 💡 Consejos de Desarrollo y Troubleshooting

* **Limpieza de Caché**: Si experimentas problemas extraños de carga o caché en Expo, puedes forzar el reinicio limpiando la caché de Metro Bundler:
  ```bash
  npx expo start -c
  ```
* **Conexión de Red**: Para probar en un celular físico usando Expo Go, asegúrate de que tanto tu computadora como tu teléfono estén conectados a la **misma red Wi-Fi**. Si tienes problemas de conexión o cortafuegos, puedes iniciar Expo en modo túnel instalando `@expo/ngrok` y corriendo:
  ```bash
  npx expo start --tunnel
  ```
