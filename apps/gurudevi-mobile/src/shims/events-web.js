/**
 * Universal Shim for Node.js 'events' module.
 * Provides a minimal EventEmitter implementation for mobile and web.
 */

class EventEmitter {
	constructor() {
		this._events = {};
	}

	on(event, listener) {
		if (!this._events[event]) this._events[event] = [];
		this._events[event].push(listener);
		return this;
	}

	once(event, listener) {
		const onceWrapper = (...args) => {
			this.off(event, onceWrapper);
			listener.apply(this, args);
		};
		return this.on(event, onceWrapper);
	}

	off(event, listener) {
		if (!this._events[event]) return this;
		this._events[event] = this._events[event].filter((l) => l !== listener);
		return this;
	}

	emit(event, ...args) {
		if (!this._events[event]) return false;
		this._events[event].forEach((l) => l.apply(this, args));
		return true;
	}

	addListener(event, listener) {
		return this.on(event, listener);
	}
	removeListener(event, listener) {
		return this.off(event, listener);
	}
	removeAllListeners(event) {
		if (event) delete this._events[event];
		else this._events = {};
		return this;
	}
}

const eventsShim = {
	EventEmitter,
	default: EventEmitter,
};

// \uD83D\uDED1 EXTREMELY IMPORTANT: Satisfy both ESM (Babel interop) and CJS
eventsShim.default = eventsShim;
eventsShim.__esModule = true;

if (typeof module !== "undefined") {
	module.exports = eventsShim;
}
