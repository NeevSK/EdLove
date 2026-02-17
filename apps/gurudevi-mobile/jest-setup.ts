import '@testing-library/jest-dom';
import 'react-native-gesture-handler/jestSetup';

// Mock expo-constants with ALL required exports
jest.mock('expo-constants', () => {
    return {
        default: {
            executionEnvironment: 'storeClient',
            expoConfig: {
                extra: {
                    supabaseUrl: 'https://test.supabase.co',
                    supabaseAnonKey: 'test-key',
                },
            },
        },
        executionEnvironment: 'storeClient',
        ExecutionEnvironment: {
            StoreClient: 'storeClient',
            Standalone: 'standalone',
        },
    };
});

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => {
    return {
        MMKV: jest.fn().mockImplementation(() => ({
            set: jest.fn(),
            getString: jest.fn(),
            getNumber: jest.fn(),
            getBoolean: jest.fn(),
            delete: jest.fn(),
            clearAll: jest.fn(),
            contains: jest.fn(),
        })),
    };
});

// Mock expo-font
jest.mock('expo-font', () => ({
    loadAsync: jest.fn().mockResolvedValue(true),
    isLoaded: jest.fn().mockReturnValue(true),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(),
    notificationAsync: jest.fn(),
    selectionAsync: jest.fn(),
    ImpactFeedbackStyle: { Light: 'light' },
    NotificationFeedbackType: { Success: 'success', Error: 'error' },
}));

// Mock @gluestack-ui/themed to prevent Provider errors globally
jest.mock('@gluestack-ui/themed', () => {
    const React = require('react');
    const ReactNative = require('react-native');
    const mockComp = (name: string) => (props: any) => React.createElement(ReactNative.View, { ...props, testID: props.testID || name });
    const mockText = (name: string) => (props: any) => React.createElement(ReactNative.Text, props);

    return {
        GluestackUIProvider: ({ children }: any) => children,
        VStack: mockComp('VStack'),
        HStack: mockComp('HStack'),
        Box: mockComp('Box'),
        Center: mockComp('Center'),
        Text: mockText('Text'),
        Heading: mockText('Heading'),
        Button: mockComp('Button'),
        ButtonText: mockText('ButtonText'),
        Spinner: () => React.createElement(ReactNative.ActivityIndicator),
        Checkbox: mockComp('Checkbox'),
        CheckboxIndicator: mockComp('CheckboxIndicator'),
        CheckboxIcon: mockComp('CheckboxIcon'),
        CheckboxLabel: mockText('CheckboxLabel'),
        useToast: () => ({ show: jest.fn() }),
        Divider: mockComp('Divider'),
        Pressable: mockComp('Pressable'),
        Modal: mockComp('Modal'),
        Image: mockComp('Image'),
        FlatList: ReactNative.FlatList,
        SectionList: ReactNative.SectionList,
        Input: mockComp('Input'),
        InputField: mockComp('InputField'),
        CheckIcon: 'CheckIcon',
    };
});

// Mock @/ui to point to our mocked themed components
jest.mock('@/ui', () => jest.requireMock('@gluestack-ui/themed'));

// Mock expo-camera per Worker issue
jest.mock('expo-camera', () => ({
    CameraView: 'CameraView',
    CameraType: { back: 'back', front: 'front' },
    useCameraPermissions: () => [{ granted: true }, jest.fn()],
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
    initReactI18next: {
        type: '3rdParty',
        init: jest.fn(),
    },
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn().mockResolvedValue([]),
    multiGet: jest.fn().mockResolvedValue([]),
}));
