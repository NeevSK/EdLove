import type { FullProfileParams } from '@repo/core';

export function toFullProfileParams(profile: Record<string, any>): FullProfileParams {
    return {
        id: profile.id,
        userId: profile.userId ?? profile.id,
        full_name: profile.full_name,
        role: profile.role ?? profile.authority,
        school_name: profile.school_name,
        avatar_url: profile.avatar_url ?? null,
        bio: profile.bio ?? null,
        is_thuthimal: Boolean(profile.is_thuthimal),
    };
}
