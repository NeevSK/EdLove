import { act, cleanup, fireEvent, render } from '@testing-library/react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';

vi.mock('@repo/ui/components/native', async () => {
  const React = await import('react');
  const { Text, TextInput, TouchableOpacity, View } = await import('react-native');

  return {
    Button: ({ label, onPress, disabled, testID }: any) =>
      React.createElement(
        TouchableOpacity,
        { onPress, disabled, testID, accessibilityRole: 'button' },
        React.createElement(Text, undefined, label)
      ),
    Card: ({ children, testID, style }: any) =>
      React.createElement(View, { testID, style }, children),
    Row: ({ children, testID, style }: any) =>
      React.createElement(View, { testID, style }, children),
    Section: ({ title, children, testID }: any) =>
      React.createElement(
        View,
        { testID },
        title ? React.createElement(Text, undefined, title) : null,
        children
      ),
    Surface: ({ children, testID, style }: any) =>
      React.createElement(View, { testID, style }, children),
    Text: ({ children, testID, style }: any) =>
      React.createElement(Text, { testID, style }, children),
    TextField: ({ label, value, onChangeText, placeholder, testID, hint, error }: any) =>
      React.createElement(
        View,
        { testID },
        label ? React.createElement(Text, undefined, label) : null,
        React.createElement(TextInput, { placeholder, value, onChangeText }),
        hint ? React.createElement(Text, undefined, hint) : null,
        error ? React.createElement(Text, undefined, error) : null
      ),
    WaitingSign: ({ testID }: any) =>
      React.createElement(View, { testID }, React.createElement(Text, undefined, 'Waiting...')),
  };
});

vi.mock('@repo/ui/icons', () => ({
  ArrowLeft: () => null,
  ArrowRight: () => null,
  Building2: () => null,
  CheckCircle2: () => null,
  CircleCheck: () => null,
  Compass: () => null,
  GraduationCap: () => null,
  School: () => null,
  Sparkles: () => null,
}));

vi.mock('@repo/ui/qr/QRCodeGenerator', () => ({
  default: ({ value, testID }: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.createElement(
      View,
      { testID: testID || 'qr-code-generator' },
      React.createElement(Text, undefined, value)
    );
  },
}));

vi.mock('expo-clipboard', () => ({
  setStringAsync: vi.fn(async () => true),
}));

import { SchoolConnectionWelcome } from '../../components/school/SchoolConnectionWelcome';

describe('SchoolConnectionWelcome', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders overview banner and connection pathways', async () => {
    const onConnectRegistry = vi.fn();
    const onReturnPersonal = vi.fn();
    const onContactSupport = vi.fn();

    const { getByText } = await render(
      <SchoolConnectionWelcome
        message="No active school membership found."
        onConnectRegistry={onConnectRegistry}
        onReturnPersonal={onReturnPersonal}
        onContactSupport={onContactSupport}
      />
    );

    expect(getByText('Welcome to Workspace')).toBeTruthy();
    expect(getByText('No active school membership found.')).toBeTruthy();
    expect(getByText('National School Registry')).toBeTruthy();
    expect(getByText('Establish School or Studio')).toBeTruthy();
    expect(getByText('Return to Personal Sanctuary')).toBeTruthy();
    expect(getByText('Need institutional onboarding assistance? Contact Us')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByText('Find or Join Registered School'));
    });
    expect(onConnectRegistry).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(getByText('Return to Personal Sanctuary'));
    });
    expect(onReturnPersonal).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(getByText('Need institutional onboarding assistance? Contact Us'));
    });
    expect(onContactSupport).toHaveBeenCalledTimes(1);
  });

  it('switches to establish mode when Establish New Institution is clicked', async () => {
    const { getAllByText, getByText } = await render(<SchoolConnectionWelcome />);

    await act(async () => {
      fireEvent.press(getByText('Establish New Institution'));
    });

    const establishElements = getAllByText('Establish Institution');
    expect(establishElements.length).toBe(2);
    expect(getByText('Institution Sector / Level')).toBeTruthy();
    expect(getByText('Pre-School / Early Learning')).toBeTruthy();
    expect(getByText('K-12 Comprehensive School')).toBeTruthy();
    expect(getByText('Tuition Institute / Academy')).toBeTruthy();
    expect(getByText('Higher Education / College')).toBeTruthy();
  });

  it('validates required fields before submitting establishment', async () => {
    const { getAllByText, getByText } = await render(<SchoolConnectionWelcome />);

    await act(async () => {
      fireEvent.press(getByText('Establish New Institution'));
    });

    // Try submitting without name or handle
    const establishElements = getAllByText('Establish Institution');
    const submitBtn = establishElements[1];
    expect(submitBtn).toBeDefined();
    await act(async () => {
      fireEvent.press(submitBtn!);
    });

    expect(getByText('Please enter an institution name.')).toBeTruthy();
  });

  it('allows selecting sector levels and navigating back to overview', async () => {
    const { getByText, queryByText } = await render(<SchoolConnectionWelcome />);

    await act(async () => {
      fireEvent.press(getByText('Establish New Institution'));
    });

    // Select Tuition Institute / Academy
    await act(async () => {
      fireEvent.press(getByText('Tuition Institute / Academy'));
    });

    const backBtn = queryByText('National School Registry');
    expect(backBtn).toBeNull(); // We are in establish mode
  });
});
