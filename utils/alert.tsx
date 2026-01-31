import React, {createContext, useContext, useState, useCallback} from 'react';
import ThemedAlert from '../components/ThemedAlert';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertContextType {
  showAlert: (title: string, message: string, buttons?: AlertButton[]) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [buttons, setButtons] = useState<AlertButton[]>([
    {text: 'OK', onPress: () => setVisible(false)},
  ]);

  const showAlert = useCallback(
    (alertTitle: string, alertMessage: string, alertButtons?: AlertButton[]) => {
      setTitle(alertTitle);
      setMessage(alertMessage);
      if (alertButtons && alertButtons.length > 0) {
        setButtons(alertButtons);
      } else {
        setButtons([{text: 'OK', onPress: () => setVisible(false)}]);
      }
      setVisible(true);
    },
    [],
  );

  return (
    <AlertContext.Provider value={{showAlert}}>
      {children}
      <ThemedAlert
        visible={visible}
        title={title}
        message={message}
        buttons={buttons.map(btn => ({
          ...btn,
          onPress: () => {
            if (btn.onPress) {
              btn.onPress();
            }
            setVisible(false);
          },
        }))}
        onDismiss={() => setVisible(false)}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};
