import React, { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react';
import { HHAlert, type HHAlertProps } from '../components/core/HHAlertComponent';
import { HHButton } from '../components/core/HHButtonComponent';

interface NotificationState {
  isOpen: boolean;
  variant: HHAlertProps['variant'];
  title: string;
  message: string;
  messages?: string[];
}

interface NotificationContextData {
  showNotification: (title: string, message: string, variant?: HHAlertProps['variant'], messages?: string[]) => void;
}

const DURATION_MS: Record<HHAlertProps['variant'], number> = {
  error: 7000,
  warning: 6000,
  success: 4000,
  info: 5000,
};

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    variant: 'info',
    title: '',
    message: '',
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showNotification = useCallback(
    (title: string, message: string, variant: HHAlertProps['variant'] = 'info', messages?: string[]) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      setNotification({ isOpen: true, title, message, messages, variant });

      timerRef.current = setTimeout(dismiss, DURATION_MS[variant]);
    },
    [dismiss],
  );

  React.useEffect(() => {
    type AppNotificationDetail = { title: string; message: string; variant: HHAlertProps['variant']; messages?: string[] };
    const handleAppNotification = (event: CustomEvent<AppNotificationDetail>) => {
      const { title, message, variant, messages } = event.detail;
      showNotification(title, message, variant, messages);
    };

    window.addEventListener('app:notification', handleAppNotification as EventListener);
    return () => window.removeEventListener('app:notification', handleAppNotification as EventListener);
  }, [showNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification.isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] min-w-[320px] max-w-md shadow-2xl rounded-xl animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="relative">
            <HHAlert
              variant={notification.variant}
              title={notification.title}
              message={notification.messages ? undefined : notification.message}
              messages={notification.messages}
            />
            <div className="absolute top-3 right-3">
              <HHButton variant="icon" color="default" isRounded={true} onClick={dismiss} aria-label="Fechar">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </HHButton>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
