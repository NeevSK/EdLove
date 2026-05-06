import { supabase } from "@repo/core/api";

export interface PresenceFallbackCountOptions {
	targetRoles: string[];
	isCumulative: boolean;
	userId?: string;
	windowMs?: number;
}

export interface PresenceSessionOptions {
	userId: string;
	userRole: string;
	userVibe?: string;
	channelName: string;
	onCountChange: (count: number) => void;
	onOfflineChange: (offline: boolean) => void;
}

export async function fetchPresenceFallbackCount(
	options: PresenceFallbackCountOptions,
): Promise<number> {
	const fiveMinutesAgo = new Date(
		Date.now() - (options.windowMs ?? 5 * 60 * 1000),
	).toISOString();
	let query = supabase
		.from("users")
		.select("id", { count: "exact", head: true })
		.gte("last_seen_at", fiveMinutesAgo);

	if (!options.isCumulative) {
		query = query.in("role", options.targetRoles);
	} else if (options.userId && options.userId !== "guest") {
		query = query.neq("id", options.userId);
	}

	const { count, error } = await query;

	if (error) throw error;
	return count ?? 0;
}

export async function markUserPresenceSeen(userId: string): Promise<void> {
	const { error } = await supabase
		.from("users")
		.update({ last_seen_at: new Date().toISOString() })
		.eq("id", userId);

	if (error) throw error;
}

export function startPresenceSession(
	options: PresenceSessionOptions,
): () => void {
	const selfChannel = supabase.channel(`presence:self:${options.userRole}`);
	const watcherChannel = supabase.channel(options.channelName);

	selfChannel.subscribe(async (status) => {
		if (status !== "SUBSCRIBED") return;

		try {
			await markUserPresenceSeen(options.userId);
			await selfChannel.track({
				user_id: options.userId,
				vibe: options.userVibe ?? "active",
				online_at: new Date().toISOString(),
			});
		} catch {
			options.onOfflineChange(true);
		}
	});

	watcherChannel
		.on("presence", { event: "sync" }, () => {
			const state = watcherChannel.presenceState();
			const presences = Object.values(state).flat();
			options.onCountChange(presences.length);
			options.onOfflineChange(false);
		})
		.on("presence", { event: "join" }, () => {
			options.onOfflineChange(false);
		})
		.subscribe((status) => {
			if (status === "CLOSED" || status === "CHANNEL_ERROR") {
				options.onOfflineChange(true);
			}
		});

	return () => {
		supabase.removeChannel(selfChannel);
		supabase.removeChannel(watcherChannel);
	};
}

export const presenceAPI = {
	fetchPresenceFallbackCount,
	markUserPresenceSeen,
	startPresenceSession,
};
