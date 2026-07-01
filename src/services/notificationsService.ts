import * as Notifications from 'expo-notifications';

// Configurar cómo se comportan las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const scheduleEventNotification = async (titulo: string, fechaEvento: string) => {
  // Calculamos una semana antes
  const trigger = new Date(fechaEvento);
  trigger.setDate(trigger.getDate() - 7);
  trigger.setHours(12, 0, 0, 0); // 12:00 hs fija

  if (trigger <= new Date()) return; // No agendar si la fecha ya pasó o es en menos de una semana

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📅 ¡Recordatorio de Evento!",
      body: `En una semana tienes: ${titulo}`,
      sound: true,
    },
    trigger,
  });
};