---
title: "ETL Topology: Free-Tier API Strategy"
status: "active"
created: 2026-03-04
updated: 2026-03-04
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# ETL Topology: Free-Tier API Strategy

To keep the "epistemic universe" running with zero or low TCO (Total Cost of Ownership), we can leverage the following free tiers. 

## 1. Discovery & Search (The Inputs)

| Provider | Purpose | Free Tier Limit | Why use it? |
| :--- | :--- | :--- | :--- |
| [**YouTube Data API v3**](https://developers.google.com/youtube/v3) | Video metadata | 10,000 units/day | Essential for educational video discovery. |
| [**Internet Archive API**](https://archive.org/help/about.php) | Books & Documents | Unlimited | No keys needed for search; millions of free PDFs/EPUBs. |
| [**Tavily AI**](https://tavily.com/) | Search for AI agents | 1,000 searches/month | Specifically optimized for LLMs to find high-quality URLs. |
| [**Unsplash API**](https://unsplash.com/developers) | Imagery | 5k requests/hour | For beautiful, high-quality thumbnails for "Topic" nodes. |
| [**NewsAPI.org**](https://newsapi.org/) | Educational News | 100 requests/day | Tracking global educational policy shifts and trends. |
| [**Wikipedia API**](https://www.mediawiki.org/wiki/API:Main_page) | Encyclopedic Data | Unlimited | Quick summaries for grounding "Concept" nodes. |

## 2. Enrichment & Intelligence (The Brains)

| Provider | Purpose | Free Tier Limit | Why use it? |
| :--- | :--- | :--- | :--- |
| [**Groq Cloud**](https://console.groq.com/) | Llama 3 / Mixtral | Very high / 14k tokens/min | **Insanely fast** and free for now. Perfect for scoring & tagging. |
| [**Google Gemini API**](https://ai.google.dev/) | Multimodal AI | 15 RPM / 1M TPM | Strong reasoning; useful for analyzing document PDFs via OCR. |
| [**AssemblyAI**](https://www.assemblyai.com/) | Speech-to-Text | 100 hours/month | Transcribing educational videos to create searchable text. |
| [**DeepL API**](https://www.deepl.com/pro-api) | Translation | 500k characters/month | For translating high-quality research into local languages. |
| [**Hugging Face Inference**](https://huggingface.co/inference-api) | Specialized Models | Free for many models | Good for specific NLP tasks like translation (Sinhala/Tamil). |
| [**MonkeyLearn**](https://monkeylearn.com/) | Sentiment & NLP | 1k queries/month | Analyzing community sentiment on pedagogical shifts. |

## 3. Acquisition & Storage (The Memory)

| Provider | Purpose | Free Tier Limit | Why use it? |
| :--- | :--- | :--- | :--- |
| [**Cloudinary**](https://cloudinary.com/pricing) | Image/Video Hosting | 25 Credits/month (~25GB) | Auto-optimization of thumbnails and document previews. |
| [**Supabase Storage**](https://supabase.com/pricing) | File Hosting | 1 GB | Good for hosting official Ministry PDFs directly. |
| [**Backblaze B2**](https://www.backblaze.com/cloud-storage/pricing) | S3 Storage | 10 GB Free | Extremely cheap reliable bulk storage (if 1GB Supabase limit is hit). |
| [**Pinata (IPFS)**](https://www.pinata.cloud/) | Permanent Storage | 1 GB | For content that should never disappear from the universe. |
| [**Pipedream**](https://pipedream.com/pricing) | Execution/Cron | 10k events/month | Visual workflow alternative to GitHub Actions. |
| [**Render.com**](https://render.com/pricing) | Static/Web Services | Free Tier (Cap) | Reliable hosting for internal ingestion dashboards. |

## 4. Execution Alternatives (Saving GitHub Minutes)

If GitHub Action minutes are a concern, consider these:

1. **[Pipedream](https://pipedream.com/)**: Generous free tier for event-driven workflows. Can run Node.js/Python scripts directly.
2. **[Supabase Edge Functions](https://supabase.com/docs/guides/functions)**: Can be triggered via external [Cron-job.org](https://cron-job.org/) (HTTP calls).
3. **[Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)**: Free for 1 run per day on the hobby plan.
4. **Local Runner**: If you have an old PC or Raspberry Pi, use **GitHub Self-Hosted Runners**. It uses your hardware but GitHub's UI.
5. **[Railway.app](https://railway.app/)**: Small monthly free credit—great for simple background workers.
