const state = useTemporalStore((current) => current.activeDate);

const store = persist(() => ({ value: state }), {
  name: 'versioned-example',
  version: 1,
  migrate: (persisted) => persisted,
  partialize: (current) => current,
});

void store;
