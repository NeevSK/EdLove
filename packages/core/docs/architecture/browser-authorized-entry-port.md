# Browser authorized-entry port

`@repo/core/web-authorized-entry` is a dependency-free contract for the browser's post-authentication entry decision. It does not implement HTTP, Supabase access, storage, routing, or UI.

An adapter must authenticate through `@repo/core/web-auth`, then make one authenticated server call that resolves the signed-in subject, account lifecycle, display name, onboarding completion, and active capacity. The server owns those facts; the browser must not query guessed tables, supply a subject ID, or infer a role from metadata.

The adapter implements `BrowserAuthorizedEntryPort`:

- `resolveAuthorizedEntry()` returns the current authoritative result.
- `completeOnboarding()` performs the server-authorized completion command, then returns a newly resolved authoritative result.

The required public package export, intentionally not changed by this contract-only slice, is:

```json
"./web-authorized-entry": {
  "types": "./src/webAuthorizedEntry.ts",
  "import": "./src/webAuthorizedEntry.ts",
  "default": "./src/webAuthorizedEntry.ts"
}
```

The browser route may enter an authorized workspace only after `kind: "ready"`. `onboarding-required`, `inactive`, and `unavailable` are distinct, user-visible states.
