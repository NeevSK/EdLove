# Cost-Aware Tooling 2026: The "Sovereign & Free" Stack

## 1. Philosophy: Zero-Payment Infrastructure
For Gurudevi, we prioritize **Open Source (OSS)** and **Self-Hosted** tools to maintain data sovereignty and keep the operating burn at zero. Payments for SaaS tools are deferred until the platform enters the revenue phase.

---

## 2. The Integrated "Free" Stack

| Tool | Category | Status | Cost | Gurudevi Integration |
| :--- | :--- | :--- | :--- | :--- |
| **Dagger** | CI/CD | OSS | $0 | Universal pipelines that run locally and on free GitHub Actions runners. Replaces paid CI credits. |
| **Promptfoo** | LLM Evals | OSS | $0 | Run evaluations against local models (Ollama) or free-tier APIs to ensure AI quality. |
| **Biome** | DX (Lint/Format) | OSS | $0 | 10x faster than ESLint/Prettier. Saves local machine resources and CI time. |
| **Coolify** | DevOps | OSS | $0 (Self-hosted) | Replaces Vercel/Heroku. Self-host on a cheap school server or a spare VPS. |
| **Trigger.dev** | Jobs/Agents | OSS | $0 (Self-hosted) | Handlers for long-running workflows without expensive Lambda/Serverless overhead. |
| **Ollama** | AI Inference | OSS | $0 | Runs LLMs (Phi-4, Llama 3) locally on developer machines and school servers. |

---

## 3. Implementation Status

### [x] Tool 1: Biome (Active)
- **Repo**: Root `biome.json`
- **Usage**: `pnpm run lint` / `pnpm run format`

### [x] Tool 2: Promptfoo (Initialized)
- **Repo**: Root `promptfooconfig.yaml`
- **Purpose**: Unit tests for AI responses.
- **Action**: Run `pnpm dlx promptfoo eval` (uses cheap/free tier APIs).

### [x] Tool 3: Dagger (Initialized)
- **Repo**: Root `dagger.ts`
- **Purpose**: Portable pipelines.
- **Why**: Zero vendor lock-in. Move from GitHub to local server in seconds.

---

## 4. Deferred Checklist (Paid Tools)
The following tools are evaluated but **NOT** implemented yet to avoid costs:
- **LangSmith**: Replaced by local Promptfoo logging.
- **Sentry Team Plan**: Stick to Free Tier for now.
- **Vercel Pro**: Use Coolify + GitHub Actions instead.
- **OpenAI Pro**: Prefer Gemini Flash Free Tier or local Llama 3.

---
*Last Updated: 2026-04-28 | Focus: Sovereignty & Cost-Control*
