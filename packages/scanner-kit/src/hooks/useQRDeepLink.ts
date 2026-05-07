/**
 * useQRDeepLink — Global listener for incoming gurudevi://qr deep links
 *
 * Call this hook once at the root level (App.tsx) when the user is authenticated.
 * Handles two entry points:
 *   1. Cold start: app opened via a QR deep link (getInitialURL)
 *   2. Warm resume: app already open, incoming link event (addEventListener)
 *
 * When no handler is registered yet (pre-auth), stores payload in AsyncStorage
 * under 'pending_qr_action' — redeemed after login via redeemPendingQRAction().
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { resolveQR } from "@repo/core/logic";
import type { QRPayload } from "@repo/core/types";

import { useCallback, useEffect, useRef } from "react";
import { Linking } from "react-native";

export const PENDING_QR_KEY = "pending_qr_action";

export type QRDeepLinkHandler = (payload: QRPayload) => void;

/**
 * Listen for QR deep links and dispatch them to the provided handler.
 * Safe to call before handler is ready — pending payloads are stored in AsyncStorage.
 */
export function useQRDeepLink(onQRAction?: QRDeepLinkHandler) {
	const handlerRef = useRef<QRDeepLinkHandler | undefined>(onQRAction);
	handlerRef.current = onQRAction;

	const dispatchOrStore = useCallback(async (url: string) => {
		if (!url || typeof url !== "string") return;
		if (!url.startsWith("gurudevi://qr")) return;

		const result = resolveQR(url);
		if (!result.ok) return;

		const handler = handlerRef.current;
		if (handler) {
			handler(result.payload);
		} else {
			// No handler yet (user not authenticated) — store for later
			await AsyncStorage.setItem(
				PENDING_QR_KEY,
				JSON.stringify(result.payload),
			);
		}
	}, []);

	useEffect(() => {
		// Handle cold-start URL (app opened from outside via QR link).
		// On web: Linking.getInitialURL() returns the current https:// URL.
		// dispatchOrStore() will check `url.startsWith('gurudevi://qr')` which
		// never matches an https URL — so this is a safe no-op on web.
		// Web QR routes (/qr path) are handled by NavigationContainer linking instead.
		Linking.getInitialURL()
			.then((url) => {
				if (url) dispatchOrStore(url);
			})
			.catch(() => {
				// Safe to ignore — linking can reject in some environments
			});

		// Handle warm-resume URL (app already running, incoming deep link).
		const subscription = Linking.addEventListener("url", ({ url }) => {
			dispatchOrStore(url);
		});

		return () => subscription.remove();
	}, [dispatchOrStore]);
}

/**
 * Redeem any pending QR action stored in AsyncStorage.
 * Call this immediately after successful authentication / onboarding.
 * Returns the payload and clears it from storage, or null if none.
 */
export async function redeemPendingQRAction(): Promise<QRPayload | null> {
	try {
		const raw = await AsyncStorage.getItem(PENDING_QR_KEY);
		if (!raw) return null;
		await AsyncStorage.removeItem(PENDING_QR_KEY);
		return JSON.parse(raw) as QRPayload;
	} catch {
		return null;
	}
}
