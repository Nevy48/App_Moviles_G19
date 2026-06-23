<p align="center">
  <img src="./assets/images/banner.png" alt="Mi Estado Académico" width="100%" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Estado-En%20Desarrollo-2563EB?style=for-the-badge" />
</p>

---

## 📖 ¿Qué es Mi Estado Académico?

**Mi Estado Académico** es una aplicación móvil desarrollada con **Expo / React Native** pensada para el ecosistema universitario. La app tiene dos perfiles de uso bien diferenciados:

| Perfil | Destinado a | Funciones principales |
|--------|-------------|----------------------|
| 👤 **Alumno** | Estudiantes universitarios | Registrarse, suscribirse a un plan de estudios y visualizar su progreso académico |
| 🛠️ **Administrador** | Personal administrativo de la universidad | Crear y gestionar planes de estudios, materias y correlatividades |

La idea central es digitalizar y simplificar la gestión del trayecto académico: desde que un alumno elige su carrera hasta que puede ver qué materias puede cursar según las correlatividades ya aprobadas.

---

## ✨ Funcionalidades

### Para administradores
- 📚 Crear y editar **planes de estudio**
- 📝 Crear **materias** y asignarlas a un plan de estudios
- 🔗 Definir el **régimen de correlatividades** entre materias (qué materias deben estar aprobadas para cursar otra)

### Para alumnos
- 🎓 **Registro e inicio de sesión**
- 📋 **Suscripción a un plan de estudios** (elegir su carrera)
- 📊 Visualización de materias disponibles según correlatividades cumplidas *(próximamente)*

---

## 🚀 Primeros pasos

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/mi-estado-academico.git
cd mi-estado-academico
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar la app

```bash
npx expo start
```

En la consola verás opciones para abrir la app en:

- 📱 [Expo Go](https://expo.dev/go) — para pruebas rápidas en tu dispositivo físico
- 🤖 [Emulador Android](https://docs.expo.dev/workflow/android-studio-emulator/)
- 🍎 [Simulador iOS](https://docs.expo.dev/workflow/ios-simulator/)
- 🏗️ [Development Build](https://docs.expo.dev/develop/development-builds/introduction/) — para funcionalidades nativas avanzadas

---

## 🗂️ Estructura del proyecto

```
mi-estado-academico/
├── app/                    # Rutas y pantallas (file-based routing)
│   ├── (admin)/            # Pantallas del perfil administrador
│   ├── (alumno)/           # Pantallas del perfil alumno
│   └── index.tsx           # Punto de entrada / selección de perfil
├── components/             # Componentes reutilizables
├── constants/              # Colores, tipografías, configuración
├── hooks/                  # Custom hooks
└── assets/                 # Imágenes, fuentes, íconos
```

> El proyecto usa **file-based routing** de Expo Router. Cada archivo dentro de `app/` es una ruta navegable.

---

## 🛠️ Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npx expo start` | Inicia el servidor de desarrollo |
| `npx expo start --android` | Abre directamente en Android |
| `npx expo start --ios` | Abre directamente en iOS |
| `npm run reset-project` | Limpia el proyecto y deja `app/` en blanco |
| `npx expo lint` | Corre el linter con ESLint |

---

## 🔧 Configuración adicional

- **Linting:** `npx expo lint` — o seguí la guía [Using ESLint and Prettier](https://docs.expo.dev/guides/using-eslint/)
- **Testing:** Guía de [Unit Testing con Jest](https://docs.expo.dev/develop/unit-testing/)
- **TypeScript:** Configuración lista desde el template — [Using TypeScript](https://docs.expo.dev/guides/typescript/)

---

## 📚 Recursos

- [Documentación de Expo](https://docs.expo.dev/)
- [Tutorial paso a paso de Expo](https://docs.expo.dev/tutorial/introduction/)
- [Expo Router — File-based Routing](https://docs.expo.dev/router/introduction)
- [Expo en GitHub](https://github.com/expo/expo)
- [Comunidad en Discord](https://chat.expo.dev)

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si querés proponer cambios, abrí un issue o un pull request describiendo qué mejora o funcionalidad querés agregar.

---

<p align="center">
  Hecho con 💙 para la comunidad universitaria
</p>