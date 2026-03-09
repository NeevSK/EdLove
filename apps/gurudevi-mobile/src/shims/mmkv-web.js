/**
 * Web shim for react-native-mmkv
 */
export class MMKV {
    constructor(config) {
        this.id = config?.id || 'default';
    }
    set(key, value) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(`${this.id}:${key}`, String(value));
        }
    }
    getString(key) {
        return typeof localStorage !== 'undefined' ? (localStorage.getItem(`${this.id}:${key}`) || undefined) : undefined;
    }
    getNumber(key) {
        const val = this.getString(key);
        return val ? Number(val) : undefined;
    }
    getBoolean(key) {
        const val = this.getString(key);
        return val === 'true' ? true : val === 'false' ? false : undefined;
    }
    delete(key) {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(`${this.id}:${key}`);
        }
    }
    clearAll() {
        if (typeof localStorage !== 'undefined') {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(`${this.id}:`)) {
                    localStorage.removeItem(key);
                }
            });
        }
    }
    contains(key) {
        return typeof localStorage !== 'undefined' && localStorage.getItem(`${this.id}:${key}`) !== null;
    }
}

export default { MMKV };
