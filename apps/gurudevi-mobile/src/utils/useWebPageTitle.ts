/**
 * useWebPageTitle — Web-only hook
 *
 * Keeps `document.title` in sync with the current navigation screen so that:
 *   - Browser tab titles are human-readable ("Gurudevi · Profile")
 *   - Back/forward navigation shows meaningful titles in browser history
 *   - Screen readers and assistive tech announce the correct page name
 *
 * Usage: call once in App.tsx (inside <NavigationContainer>).
 */

import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useNavigationState } from '@react-navigation/native';

const APP_NAME = 'Gurudevi';

/** Maps internal route names to human-friendly tab titles. */
const ROUTE_LABELS: Record<string, string> = {
    Home:               'Sanctuary',
    Self:               'Your Inner Compass',
    Community:          'The Circle',
    Classroom:          'Classroom',
    Profile:            'Profile',
    Auth:               'Sign In',
    Welcome:            'Welcome',
    Onboarding:         'Getting Started',
    FullProfile:        'Profile',
    AIAssistant:        'Gurudevi AI',
    QRHandler:          'QR Scan',
    ThuthimalClaim:     'Thuthimal Badge',
    InvitationWelcome:  'Invitation',
    AppSettings:        'Settings',
    Gradebook:          'Gradebook',
    PulseDashboard:     'Pulse',
    Scanner:            'Scanner',
    ContentLibrary:     'Content Library',
    VideoPlayer:        'Video Player',
};

type NavState = { routes: Array<{ name: string; state?: NavState }>; index?: number } | undefined;

/** Drills into nested navigators to find the innermost active route name. */
function getLeafRouteName(state: NavState): string | undefined {
    if (!state?.routes?.length) return undefined;
    const route = state.routes[state.index ?? state.routes.length - 1];
    if (!route) return undefined;
    if (route.state) {
        const nested = getLeafRouteName(route.state);
        if (nested) return nested;
    }
    return route.name;
}

export function useWebPageTitle() {
    // useNavigationState is called unconditionally — hooks must not be conditional.
    // The Platform check happens inside useEffect so the hook is always called.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const routeName = useNavigationState((state: any) => getLeafRouteName(state));

    useEffect(() => {
        if (Platform.OS !== 'web') return;
        if (typeof document === 'undefined') return;

        const label = routeName ? (ROUTE_LABELS[routeName] ?? routeName) : null;
        document.title = label ? `${APP_NAME} · ${label}` : APP_NAME;
    }, [routeName]);
}
