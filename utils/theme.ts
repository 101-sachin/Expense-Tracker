import {Appearance, ColorSchemeName} from 'react-native';

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryDark: string;
  success: string;
  danger: string;
  border: string;
  headerBackground: string;
  headerText: string;
  inputBackground: string;
  inputBorder: string;
  shadowColor: string;
}

export const lightTheme: ThemeColors = {
  background: '#F3F4F6',
  surface: '#FFFFFF',
  text: '#1E3A8A',
  textSecondary: '#4B5563',
  primary: '#1E3A8A',
  primaryDark: '#1E40AF',
  success: '#10B981',
  danger: '#EF4444',
  border: '#E5E7EB',
  headerBackground: '#1E3A8A',
  headerText: '#FFFFFF',
  inputBackground: '#F9FAFB',
  inputBorder: '#E5E7EB',
  shadowColor: '#000000',
};

export const darkTheme: ThemeColors = {
  background: '#111827',
  surface: '#1F2937',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  success: '#10B981',
  danger: '#EF4444',
  border: '#374151',
  headerBackground: '#1F2937',
  headerText: '#F9FAFB',
  inputBackground: '#374151',
  inputBorder: '#4B5563',
  shadowColor: '#000000',
};

export const getSystemTheme = (): ColorSchemeName => {
  return Appearance.getColorScheme();
};
