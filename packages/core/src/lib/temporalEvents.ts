const endOfViewDate = (viewDate: string) => viewDate.includes('T') ? viewDate : `${viewDate}T23:59:59.999Z`;

export function selectLatestTemporalRecordsAsOf<T>(
    events: T[],
    viewDate: string,
    options: {
        getEntityKey: (event: T) => string;
        getEffectiveTo?: (event: T) => string | null | undefined;
    },
): T[] {
    const cutoff = endOfViewDate(viewDate);
    const latestByEntity = new Map<string, T>();

    events.forEach((event) => {
        const effectiveTo = options.getEffectiveTo?.(event);
        if (effectiveTo && effectiveTo <= cutoff) {
            return;
        }

        const key = options.getEntityKey(event);
        if (!latestByEntity.has(key)) {
            latestByEntity.set(key, event);
        }
    });

    return Array.from(latestByEntity.values());
}

export function toTemporalCutoff(viewDate: string): string {
    return endOfViewDate(viewDate);
}
