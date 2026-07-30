/* eslint-disable */
/**
 * Lucide React Native Shim for Web
 *
 * Provides a self-healing, intelligent proxy for lucide-react-native icons.
 * This approach is highly resilient as it automatically maps ANY icon name
 * to its web-equivalent in 'lucide-react' without manual mapping.
 */
const _React = require('react');

// Try to load the real lucide-react package
let LucideWeb = null;
try {
  LucideWeb = require('lucide-react');
} catch (_e) {
  // Silent fallback to maintain a clean console as requested
}

/**
 * Lotus Fallback Icon
 * Instead of a warning '!', we use the brand-aligned Lotus emoji.
 */
const LotusFallback = (props) => {
  const { size = 24, ...rest } = props;
  return (
    <span
      style={{
        fontSize: `${size}px`,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
      }}
      {...rest}
    >
      🪷
    </span>
  );
};

/**
 * The Intelligent Proxy
 * This is the "Brain" of the shim. It intercepts ALL property access on the module.
 * If you import { Heart } or { UserIcon } from '@repo/ui/icons',
 * this proxy automatically resolves them.
 */
const IconProxy = new Proxy(LotusFallback, {
  get: (target, prop) => {
    if (typeof prop === 'symbol') return target[prop];

    // 1. Standard Module/React Exports
    if (prop === 'default') return LucideWeb ? LucideWeb.default || LucideWeb : LotusFallback;
    if (prop === '__esModule') return true;
    if (prop === '$$typeof') return target[prop];
    if (prop === 'displayName') return 'IconProxy';

    // 2. Prevent React 19 Crashes
    const reactInternals = new Set([
      'childContextTypes',
      'contextTypes',
      'contextType',
      'propTypes',
      'getDerivedStateFromProps',
      'getSnapshotBeforeUpdate',
    ]);
    if (reactInternals.has(prop)) return undefined;

    // 3. Icon Resolution Logic
    try {
      if (LucideWeb) {
        if (LucideWeb[prop]) return LucideWeb[prop];
        const normalized = prop.replace(/Icon$/, '');
        if (LucideWeb[normalized]) return LucideWeb[normalized];
      }
    } catch (_e) {
      // Silent fallback
    }

    // 4. Self-Healing Fallback for potential icons
    if (typeof prop === 'string' && /^[A-Z]/.test(prop)) {
      return LotusFallback;
    }

    return target[prop];
  },
});

// Export the proxy as the module itself
module.exports = IconProxy;
module.exports.default = IconProxy;
module.exports.__esModule = true;
