# 🏛️ Sovereign MCP Implementation: The Control Plane

We have verified that the **Supabase MCP** is active and connected to the `Gurudevi` project. We are now establishing the **Durable Observation** layer using Inngest and the **Orchestration** layer for your 4 Vercel apps.

## 1. 🌉 The Inngest-MCP Bridge (Local Dev)
Since you are using `dlx`, use this command to start the Inngest Dev Server with the built-in MCP bridge. This will allow your AI agent to see all active functions across your Marketing Web and Mobile apps.

> [!TIP]
> Run this in a separate terminal to maintain a persistence layer for your events.

```powershell
pnpm dlx inngest-cli@latest dev -u http://localhost:4321/api/inngest
```

## 2. ⚡ Vercel Control Plane
Since `vercel` is not in your global path, we will use `pnpm dlx` to manage your 4 apps (Gurudevi, Edlove, IntuitUI, NeevSK).

**To link your apps and enable the MCP "Control" loop:**
```powershell
# For each app in /apps
pnpm dlx vercel link
```

## 3. 🧪 Supabase Verification
Your `Gurudevi` project (`qzoawolfkuwiuyaoiybz`) is healthy. I have verified that I can manage your schema and Edge Functions directly.

## 4. 🎨 UI Primitives Hardening
I have finalized the `SkeletonLoader` and `View` exports in `@repo/ui/primitives` to ensure "Zero-Legacy" consistency across your Web and Mobile platforms.

## 5. 🌐 Web Ingest (Free Alternative)
We have implemented a **Jina AI Reader** service in `platform-mcp`. This provides free web-to-markdown ingestion.

**Usage:**
```typescript
sovereign_discovery(action: 'jina', params: { url: 'https://docs.inngest.com' })
```

### Next Steps:
- [ ] **Run the Inngest dlx command** in your terminal.
- [ ] **Verify the Vercel links** for the 4 apps.
