import AsyncStorage from "@react-native-async-storage/async-storage";
import type { QueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { z } from "zod";
import type { StateStorage } from "zustand/middleware";
import { identityAPI } from "../api/identity";
import { getActiveAccountId, setActiveAccountId } from "../lib/accountScope";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/useAuthStore";
import { useTenantStore } from "../store/useTenantStore";
import { useUIStore } from "../store/useUIStore";

/**
 * ---------------------------------------------------------------------------
 * HYBRID ZERO-TRUST: ADVANCED KEK/DEK ARCHITECTURE
 * ---------------------------------------------------------------------------
 * Introduces a genuine Enterprise Vault architecture.
 * The underlying local data is encrypted by a randomly generated Data Encryption Key (Master DEK).
 * The Master DEK is then "wrapped" (encrypted) by multiple Key Encryption Keys (KEKs):
 *   1. KEK derived from App PIN.
 *   2. KEK derived from Security Question Answers (No Mom/No Internet offline recovery).
 *   3. Enclave storage (Mom's Biometric Master Override).
 */

// ==========================================
// LAYER 1: DATA MODEL & IDENTITY MAPPING
// ==========================================

export const DeviceAccountSchema = z.object({
	device_id: z.string().uuid(),
	account_id: z.string().uuid(),
	// Used to derive KEKs securely locally
	crypto_salt: z.string(),

	// The Master DEK, encrypted multiple ways for different recovery vectors
	encrypted_dek_by_pin: z
		.string()
		.describe("Master DEK encrypted by the PIN KEK"),
	encrypted_dek_by_security_question: z
		.string()
		.nullable()
		.describe("Master DEK encrypted by Security Answer KEK"),

	// Offline Security Question Meta (What is the question itself?)
	security_question_id: z.string().nullable(),

	has_unsynced_mutations: z.boolean().default(false),
	last_accessed_at: z.string().datetime(),
	is_active: z.boolean().default(true),
	created_at: z.string().datetime(),
});

export type DeviceAccount = z.infer<typeof DeviceAccountSchema>;

// ==========================================
// LAYER 2: KEY ENVELOPE ENGINE (KEK / DEK)
// ==========================================

export const AppCryptoEngine = {
	/**
	 * Derives a KEK from a secret (like a PIN or Security Answer) + Local Salt
	 */
	async deriveKEK(secret: string, salt: string): Promise<string> {
		// Normalizes secrets so "Blue " and "blue" generate the same KEK
		const normalized = secret.trim().toLowerCase();
		// e.g., using `expo-crypto` pbkdf2
		// const derivedKey = await crypto.pbkdf2(normalized, salt, 100000, 32, 'sha256');
		return `mock_kek_derived_from_${normalized}_and_${salt}`;
	},

	/**
	 * Symetric Encryption mock (Wraps the Master DEK using a KEK)
	 */
	wrapMasterDEK(masterDEK: string, kek: string): string {
		return `wrapped(${masterDEK}, using=${kek})`;
	},

	/**
	 * Symetric Decryption mock (Unwraps the Master DEK using a KEK)
	 */
	unwrapMasterDEK(wrappedPayload: string, kek: string): string {
		if (!wrappedPayload.includes(`using=${kek}`))
			throw new Error("Decryption Failed");
		return wrappedPayload.split(",")[0].replace("wrapped(", "");
	},

	/**
	 * Biometric Parent Override (No KEK needed, OS Enclave protects the raw Master DEK)
	 */
	async enrollParentMasterKey(accountId: string, masterDEK: string) {
		await SecureStore.setItemAsync(`master_dek_${accountId}`, masterDEK, {
			requireAuthentication: true, // FaceID/TouchID prompt
			keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
		});
	},
};

// ==========================================
// LAYER 3: FALLBACK STORAGE MATRIX
// ==========================================

const allocatedStores: Record<string, any> = {};

function allocateStorageEngine(accountId: string, masterDEK: string) {
	const storeId = `gurudevi-tenant-${accountId}`;

	try {
		const { MMKV } = require("react-native-mmkv");
		if (!allocatedStores[storeId]) {
			allocatedStores[storeId] = new MMKV({
				id: storeId,
				encryptionKey: masterDEK,
			});
		}
		return { engine: "mmkv", store: allocatedStores[storeId] };
	} catch {
		return { engine: "async_storage", store: null, asyncKey: masterDEK };
	}
}

// Pseudo-crypto helpers for Tier 3 mock
const encryptPayload = (payload: string, _key: string) =>
	`encrypted(${payload})`;
const decryptPayload = (payload: string, _key: string) =>
	payload.replace("encrypted(", "").slice(0, -1);

export const TenantZustandStorage: StateStorage = {
	getItem: (name: string): string | null | Promise<string | null> => {
		const activeId = getActiveAccountId();
		if (!activeId) return AsyncStorage.getItem(`global:${name}`);

		const masterDEKInRam = "in_memory_master_dek";
		const { engine, store } = allocateStorageEngine(activeId, masterDEKInRam);

		if (engine === "mmkv") return store.getString(name);

		return AsyncStorage.getItem(`tenant_${activeId}:${name}`).then((res) =>
			res ? decryptPayload(res, masterDEKInRam) : null,
		);
	},
	setItem: (name: string, value: string): void | Promise<void> => {
		const activeId = getActiveAccountId();
		if (!activeId) return AsyncStorage.setItem(`global:${name}`, value);

		const masterDEKInRam = "in_memory_master_dek";
		const { engine, store } = allocateStorageEngine(activeId, masterDEKInRam);

		if (engine === "mmkv") return store.set(name, value);

		return AsyncStorage.setItem(
			`tenant_${activeId}:${name}`,
			encryptPayload(value, masterDEKInRam),
		);
	},
	removeItem: (name: string): void | Promise<void> => {
		const activeId = getActiveAccountId();
		if (!activeId) return AsyncStorage.removeItem(`global:${name}`);

		const masterDEKInRam = "in_memory_master_dek";
		const { engine, store } = allocateStorageEngine(activeId, masterDEKInRam);

		if (engine === "mmkv") return store.delete(name);
		return AsyncStorage.removeItem(`tenant_${activeId}:${name}`);
	},
};

// ==========================================
// LAYER 4: ACCOUNT SWITCHING & OFFLINE RECOVERY
// ==========================================

export async function unlockUserAccount(
	targetAccountId: string,
	inputPin: string,
) {
	const salt = "fetched_salt_from_local_registry"; // mock
	const wrappedDEKByPin = "fetched_wrapped_dek_by_pin"; // mock

	// 1. Derive KEK via PIN
	const kek = await AppCryptoEngine.deriveKEK(inputPin, salt);

	try {
		// 2. Unwrap Master DEK
		const masterDEK = AppCryptoEngine.unwrapMasterDEK(wrappedDEKByPin, kek);

		// 3. Mount Database
		allocateStorageEngine(targetAccountId, masterDEK);
		setActiveAccountId(targetAccountId);
	} catch (_err) {
		throw new Error("Invalid PIN. Master DEK block decryption failed.");
	}
}

/**
 * Supercharged "Forgot PIN" Recovery Matrix
 */
export async function recoverAccountData(
	targetAccountId: string,
	securityAnswer?: string,
) {
	// Attempt 1: Offline Security Question Override (No Mom, No Internet)
	if (securityAnswer) {
		const salt = "fetched_salt";
		const wrappedDEKBySQ = "fetched_wrapped_dek_by_security_question";

		try {
			const kek = await AppCryptoEngine.deriveKEK(securityAnswer, salt);
			const masterDEK = AppCryptoEngine.unwrapMasterDEK(wrappedDEKBySQ, kek);

			allocateStorageEngine(targetAccountId, masterDEK);
			setActiveAccountId(targetAccountId);
			return { status: "recovered_via_security_question", success: true };
		} catch {
			return {
				status: "failed",
				success: false,
				warning: "Incorrect security answer.",
			};
		}
	}

	// Attempt 2: Local Master Override (Biometric Mom)
	try {
		const masterDEK = await SecureStore.getItemAsync(
			`master_dek_${targetAccountId}`,
			{
				requireAuthentication: true,
			},
		);

		if (masterDEK) {
			allocateStorageEngine(targetAccountId, masterDEK);
			setActiveAccountId(targetAccountId);
			return { status: "recovered_via_biometric", success: true };
		}
	} catch {
		// Biometric canceled/failed
	}

	// Attempt 3: Cloud Re-Auth (Desctructive Wash)
	return {
		status: "requires_cloud_reauth_and_wipe",
		success: false,
		warning:
			"All offline recovery exhausted. Internet required. Unsynced data will be wiped.",
	};
}

// ==========================================
// LAYER 5: THE SACRED WASH
// ==========================================

export async function globalLogoutAndPurge(queryClient: QueryClient) {
	const currentAccountId = getActiveAccountId();

	if (currentAccountId) {
		const { engine, store } = allocateStorageEngine(
			currentAccountId,
			"bypass_for_deletion",
		);
		if (engine === "mmkv") store.clearAll();
	}

	if (queryClient) queryClient.clear();
	await supabase.auth.signOut({ scope: "local" });
	setActiveAccountId(null);
	identityAPI.clearCache();

	useAuthStore.setState({ userRole: null });
	useTenantStore.setState({ schoolId: null });
	useUIStore.setState({ isSidebarCollapsed: false });
}
