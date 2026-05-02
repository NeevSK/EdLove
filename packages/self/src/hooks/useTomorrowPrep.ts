import { useStore } from "@repo/core/logic";
import { SafeZustandStorage } from "@repo/core/storage-wrapper";
import { useCallback, useEffect, useState } from "react";
import {
	createTomorrowPrepItem,
	deleteTomorrowPrepItem,
	fetchTomorrowPrepItems,
	updateTomorrowPrepItem,
} from "../api/selfFeatureRepository";
import type { DailyPrepItem } from "../types";

const PREP_CACHE_KEY = "gurudevi-prep-cache";
export function useTomorrowPrep(userId?: string) {
	const isOnline = useStore((state) => state.isOnline);
	const [prepItems, setPrepItems] = useState<DailyPrepItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		if (!userId) return;
		const loadCache = async () => {
			try {
				const cached = await SafeZustandStorage.getItem(
					`${PREP_CACHE_KEY}-${userId}`,
				);
				if (cached) {
					setPrepItems(JSON.parse(cached));
				}
			} catch (error) {
				console.warn("Failed to load prep cache", error);
			} finally {
				setIsLoading(false);
			}
		};
		loadCache();
	}, [userId]);
	const refreshData = useCallback(async () => {
		if (!userId || !isOnline) return;
		try {
			const data = await fetchTomorrowPrepItems(userId);
			setPrepItems(data);
			await SafeZustandStorage.setItem(
				`${PREP_CACHE_KEY}-${userId}`,
				JSON.stringify(data),
			);
		} catch (error) {
			console.error("Failed to refresh prep items", error);
		}
	}, [isOnline, userId]);
	useEffect(() => {
		refreshData();
	}, [refreshData]);
	const addPrepItem = useCallback(
		async (itemText: string, prepDate: string) => {
			if (!userId) throw new Error("Missing user id for tomorrow prep");
			const item = await createTomorrowPrepItem(userId, itemText, prepDate);
			const nextItems = [...prepItems, item];
			setPrepItems(nextItems);
			await SafeZustandStorage.setItem(
				`${PREP_CACHE_KEY}-${userId}`,
				JSON.stringify(nextItems),
			);
			return item;
		},
		[prepItems, userId],
	);
	const updatePrepItem = useCallback(
		async (
			itemId: string,
			updates: Partial<Pick<DailyPrepItem, "is_completed" | "item_text">>,
		) => {
			await updateTomorrowPrepItem(itemId, updates);
			const nextItems = prepItems.map((item) =>
				item.id === itemId ? { ...item, ...updates } : item,
			);
			setPrepItems(nextItems);
			if (userId) {
				await SafeZustandStorage.setItem(
					`${PREP_CACHE_KEY}-${userId}`,
					JSON.stringify(nextItems),
				);
			}
		},
		[prepItems, userId],
	);
	const removePrepItem = useCallback(
		async (itemId: string) => {
			await deleteTomorrowPrepItem(itemId);
			const nextItems = prepItems.filter((item) => item.id !== itemId);
			setPrepItems(nextItems);
			if (userId) {
				await SafeZustandStorage.setItem(
					`${PREP_CACHE_KEY}-${userId}`,
					JSON.stringify(nextItems),
				);
			}
		},
		[prepItems, userId],
	);
	return {
		prepItems,
		isLoading,
		refreshData,
		addPrepItem,
		updatePrepItem,
		removePrepItem,
		setPrepItems,
	};
}
