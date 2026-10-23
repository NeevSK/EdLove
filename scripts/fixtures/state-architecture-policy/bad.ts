const state = useTemporalStore();

const store = persist(() => ({ value: state }), { name: 'legacy-example' });

void store;
