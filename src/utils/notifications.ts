export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notifications');
    return false;
  }

  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return true;
};

const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869.wav');
notificationSound.loop = true;

export const startRepeatingSound = () => {
  notificationSound.play().catch(error => {
    console.error('Error playing notification sound:', error);
  });
};

export const stopRepeatingSound = () => {
  notificationSound.pause();
  notificationSound.currentTime = 0;
};

export const showSystemNotification = (taskTitle: string) => {
  if (Notification.permission === 'granted') {
    startRepeatingSound();
    
    return new Notification('Task Timer Completed', {
      body: `Timer completed for task: ${taskTitle}`,
      icon: '/vite.svg',
      requireInteraction: true,
    });
  }
};
