export declare function useAnalytics(): {
  track: (event: string, properties?: Record<string, any>) => void;
  identify: (userId: string, properties?: Record<string, any>) => void;
  screen: (name: string, properties?: Record<string, any>) => void;
  reset: () => void;
};
//# sourceMappingURL=useAnalytics.d.ts.map
