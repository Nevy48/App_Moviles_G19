import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Comportamiento de la notificación cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const agendarRecordatorioEvento = async (tituloEvento: string, fechaEventoString: string) => {
  try {
    // Calculamos la fecha 7 días antes
    const fechaEvento = new Date(fechaEventoString);
    const fechaAviso = new Date(fechaEvento);
    fechaAviso.setDate(fechaAviso.getDate() - 7);

    // Si faltan menos de 7 días, no agendamos nada para no mandar notificaciones en el pasado
    if (fechaAviso <= new Date()) {
      return null;
    }

    // Agendamos la notificación local
    const idNotificacion = await Notifications.scheduleNotificationAsync({
      content: {
        title: '¡Examen a la vista! 📚',
        body: `Falta exactamente una semana para: ${tituloEvento}. ¡Es momento de repasar!`,
        sound: true,
      },
      trigger: {
        date: fechaAviso,
      },
    });

    return idNotificacion;
  } catch (error) {
    console.error('Error agendando notificación:', error);
    return null;
  }
};