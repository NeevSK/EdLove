# Gurudevi — ETL Pipeline Specification
### For IDE Agent — Content Ingestion System

---

## What This Is

The library needs content to be a Trübe.
Empty screens betray the vision.

This pipeline is how knowledge
flows into the epistemic universe —
discovered, enriched, reviewed,
and published with intention.

**Human in the loop. Always.**
Nothing goes live without eyes on it.
The curator is the interior of the intervener.

---

## Pipeline Overview

```
SOURCES
  Ministry websites (official, trusted)
  YouTube (metadata only, embed)
  Internet Archive (free books, documents)
  Open educational resources
  AI deep search (daily discovery)
  Community intake (Telegram bot)
  Manual entry (FAB in app)
       ↓
DISCOVERY
  GitHub Actions cron (2am daily)
  Finds new content
  AI scores quality + relevance
       ↓
DEDUPLICATION
  file_hash check
  URL check
  Semantic similarity check
       ↓
STAGING TABLE
  Everything lands here first
  Never directly in production
       ↓
ENRICHMENT
  Supabase Edge Function
  Triggers on new staging row
  Generates embeddings
  Suggests tags, edges, map position
       ↓
HUMAN REVIEW
  Admin UI in app
  You approve / reject / edit
  One tap → live
       ↓
ACQUISITION
  GitHub Actions (triggers on approval)
  Downloads approved files
  Uploads to Cloudinary
  file_hash deduplication
       ↓
PUBLISH
  Approved + acquired → production tables
  nodes + resources + tags + edges
  Map coordinates computed
  Collections updated
```

---

## Repository Structure

```
.github/
  workflows/
    etl-discovery.yml       ← daily cron discovery
    etl-acquisition.yml     ← triggered on approval

scripts/
  etl/
    discovery/
      index.ts              ← main discovery runner
      sources/
        ministry.ts         ← Ministry of Education scraper
        youtube.ts          ← YouTube metadata fetcher
        archive.ts          ← Internet Archive querier
        ai-search.ts        ← Claude API librarian search
      scorer.ts             ← AI quality scoring
      dedup.ts              ← deduplication logic
      
    acquisition/
      index.ts              ← main acquisition runner
      downloader.ts         ← file download logic
      cloudinary.ts         ← Cloudinary upload
      hash.ts               ← SHA256 file hashing
      
    utils/
      supabase.ts           ← Supabase client for scripts
      logger.ts             ← structured logging
      
supabase/
  functions/
    enrich-staging/
      index.ts              ← Edge Function: enrichment
    publish-resource/
      index.ts              ← Edge Function: publish
    telegram-intake/
      index.ts              ← Edge Function: Telegram bot
```

---

## GitHub Actions — Daily Discovery

```yaml
# .github/workflows/etl-discovery.yml

name: ETL — Daily Discovery

on:
  schedule:
    - cron: '0 2 * * *'  # 2am UTC daily
                          # ~7:30am Sri Lanka time
  workflow_dispatch:       # manual trigger for testing

jobs:
  discover:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 10

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Discovery
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
        run: |
          cd scripts/etl
          pnpm tsx discovery/index.ts
          
      - name: Upload Discovery Log
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: discovery-log-${{ github.run_number }}
          path: scripts/etl/logs/discovery-*.json
          retention-days: 7
```

---

## GitHub Actions — Acquisition

```yaml
# .github/workflows/etl-acquisition.yml

name: ETL — Acquisition

on:
  workflow_dispatch:
    inputs:
      staging_ids:
        description: 'Comma-separated staging IDs to acquire'
        required: false
  schedule:
    - cron: '0 */6 * * *'  # every 6 hours
                             # picks up approved items

jobs:
  acquire:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 10

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Acquisition
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          CLOUDINARY_CLOUD_NAME: ${{ secrets.CLOUDINARY_CLOUD_NAME }}
          CLOUDINARY_API_KEY: ${{ secrets.CLOUDINARY_API_KEY }}
          CLOUDINARY_API_SECRET: ${{ secrets.CLOUDINARY_API_SECRET }}
          STAGING_IDS: ${{ github.event.inputs.staging_ids }}
        run: |
          cd scripts/etl
          pnpm tsx acquisition/index.ts
```

---

## Discovery Script

```typescript
// scripts/etl/discovery/index.ts

import { runMinistryDiscovery } from './sources/ministry'
import { runYouTubeDiscovery } from './sources/youtube'
import { runArchiveDiscovery } from './sources/archive'
import { runAISearch } from './sources/ai-search'
import { scoreAndFilter } from './scorer'
import { checkDuplication } from './dedup'
import { supabase } from '../utils/supabase'
import { logger } from '../utils/logger'

async function runDiscovery() {
  logger.info('Discovery started', { date: new Date().toISOString() })
  
  const allFound = []
  
  // 1. Ministry of Education Sri Lanka
  // Official content — higher trust threshold
  try {
    const ministry = await runMinistryDiscovery()
    allFound.push(...ministry.map(item => ({
      ...item,
      source_type: 'ministry',
      auto_approve_eligible: true
    })))
    logger.info('Ministry discovery complete', { count: ministry.length })
  } catch (err) {
    logger.error('Ministry discovery failed', { err })
  }
  
  // 2. YouTube
  // Metadata only — never download
  try {
    const youtube = await runYouTubeDiscovery()
    allFound.push(...youtube.map(item => ({
      ...item,
      source_type: 'youtube',
      auto_approve_eligible: false
    })))
    logger.info('YouTube discovery complete', { count: youtube.length })
  } catch (err) {
    logger.error('YouTube discovery failed', { err })
  }
  
  // 3. Internet Archive
  try {
    const archive = await runArchiveDiscovery()
    allFound.push(...archive.map(item => ({
      ...item,
      source_type: 'archive',
      auto_approve_eligible: false
    })))
    logger.info('Archive discovery complete', { count: archive.length })
  } catch (err) {
    logger.error('Archive discovery failed', { err })
  }
  
  // 4. AI Deep Search
  // Claude as librarian — finds what others miss
  try {
    const aiFound = await runAISearch()
    allFound.push(...aiFound.map(item => ({
      ...item,
      source_type: 'ai_search',
      auto_approve_eligible: false
    })))
    logger.info('AI search complete', { count: aiFound.length })
  } catch (err) {
    logger.error('AI search failed', { err })
  }
  
  logger.info('Total found before dedup', { count: allFound.length })
  
  // 5. Deduplicate
  const deduplicated = await checkDuplication(allFound)
  logger.info('After deduplication', { count: deduplicated.length })
  
  // 6. Score and filter
  const scored = await scoreAndFilter(deduplicated)
  logger.info('After scoring', {
    approved: scored.filter(i => i.status === 'approved').length,
    pending: scored.filter(i => i.status === 'pending_review').length,
    rejected: scored.filter(i => i.status === 'rejected').length,
  })
  
  // 7. Insert non-rejected into staging
  const toInsert = scored.filter(i => i.status !== 'rejected')
  
  if (toInsert.length > 0) {
    const { error } = await supabase
      .from('staging')
      .insert(toInsert)
    
    if (error) {
      logger.error('Staging insert failed', { error })
    } else {
      logger.info('Inserted to staging', { count: toInsert.length })
    }
  }
  
  // 8. Save log
  logger.save(`logs/discovery-${Date.now()}.json`)
  
  logger.info('Discovery complete')
}

runDiscovery().catch(console.error)
```

---

## Source: Ministry of Education

```typescript
// scripts/etl/discovery/sources/ministry.ts

const MINISTRY_SOURCES = [
  {
    name: 'Ministry of Education Sri Lanka',
    url: 'https://www.moe.gov.lk',
    circulars_path: '/circulars',
    content_type: 'circular',
    language: ['si', 'en'],
    target_roles: ['teacher', 'principal'],
    is_ministry_official: true,
  },
  {
    name: 'NIE Sri Lanka',
    url: 'https://www.nie.lk',
    content_type: 'syllabus',
    language: ['si', 'ta', 'en'],
    target_roles: ['teacher', 'student'],
    is_ministry_official: true,
  },
  {
    name: 'Examinations Department',
    url: 'https://www.doenets.lk',
    content_type: 'guide',
    language: ['si', 'ta', 'en'],
    target_roles: ['student', 'teacher'],
    is_ministry_official: true,
  }
]

export async function runMinistryDiscovery() {
  const results = []
  
  for (const source of MINISTRY_SOURCES) {
    // Fetch page
    // Parse new documents since last_run
    // Extract: title, url, date, description
    // Returns structured items
  }
  
  return results
}
```

---

## Source: YouTube

```typescript
// scripts/etl/discovery/sources/youtube.ts

// IMPORTANT: Never download YouTube videos
// Store metadata + embed URL only
// Actual playback via YouTube embed in app

const YOUTUBE_QUERIES = [
  'Sri Lanka education teacher training',
  'classroom management techniques',
  'pedagogy documentary',
  'Sri Lanka school reform',
  'teaching methodology Sinhala',
  'documentary education developing world',
  'Montessori Waldorf teaching methods',
  'student learning psychology',
  'principal leadership education',
]

const TRUSTED_CHANNELS = [
  // Add channel IDs of trusted education channels
  // TED-Ed, Khan Academy, etc.
]

export async function runYouTubeDiscovery() {
  // Use YouTube Data API v3
  // Free tier: 10,000 units/day
  // Search = 100 units per query
  // 10 queries = 1000 units (10% of daily quota)
  
  const results = []
  
  for (const query of YOUTUBE_QUERIES) {
    // GET https://www.googleapis.com/youtube/v3/search
    // params: q, type=video, relevanceLanguage=si
    // Extract: videoId, title, description,
    //          thumbnailUrl, channelTitle, publishedAt
    
    // Store as:
    // source_url: https://youtube.com/watch?v=VIDEO_ID
    // cloudinary_url: null (never upload)
    // embed_url: https://youtube.com/embed/VIDEO_ID
    // content_type: 'video' | 'documentary'
  }
  
  return results
}
```

---

## Source: Internet Archive

```typescript
// scripts/etl/discovery/sources/archive.ts

// Internet Archive has an open API
// Millions of free, legal, downloadable books
// No API key required for basic search

const ARCHIVE_QUERIES = [
  'sri lanka education',
  'sinhala literature school',
  'tamil education sri lanka',
  'pedagogy teaching methodology',
  'classroom management',
  'child psychology education',
  'montessori waldorf education',
]

export async function runArchiveDiscovery() {
  const results = []
  
  for (const query of ARCHIVE_QUERIES) {
    // GET https://archive.org/advancedsearch.php
    // params: q, mediatype=texts, output=json
    // Filter: subject includes education
    //         language includes sinhala/tamil/english
    //         date > 1950
    
    // Returns: identifier, title, description,
    //          subject, language, downloads
    
    // Download URL: 
    // https://archive.org/download/{identifier}/{filename}
    
    results.push(/* structured items */)
  }
  
  return results
}
```

---

## Source: AI Deep Search (Claude as Librarian)

```typescript
// scripts/etl/discovery/sources/ai-search.ts

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const LIBRARIAN_SYSTEM_PROMPT = `
You are the librarian of Gurudevi — a sacred epistemic 
universe for Sri Lankan teachers, students, and principals.

Your mission: find resources so meaningful that a teacher 
would walk into class differently the next morning.

The library is a life cosmology — not just school content.
It includes: pedagogy, philosophy, documentaries, novels,
psychology, social change, Sri Lankan history and culture,
global education movements, mindmaps, infographics.

For each resource you find, ask:
"Would this change how someone thinks, teaches, or learns?"
If yes — include it.
If no — leave it.

Quality over quantity. Ten transformative resources
are worth more than a hundred mediocre ones.

You MUST return valid JSON only. No preamble. No markdown.
`

const WEEKLY_QUERIES = [
  'Find 5 recent documentaries about education transformation globally',
  'Find 5 research papers on pedagogy published this month',
  'Find 5 resources about Sri Lankan education reform',
  'Find 5 books on child psychology available free online',
  'Find 5 YouTube channels producing high quality education content',
  'Find 5 resources about teacher wellbeing and burnout',
  'Find 5 resources connecting philosophy to classroom practice',
]

export async function runAISearch() {
  const results = []
  
  // Run 2-3 queries per day to stay within budget
  // Rotate through weekly queries
  const dayOfWeek = new Date().getDay()
  const todaysQueries = WEEKLY_QUERIES.slice(
    dayOfWeek % WEEKLY_QUERIES.length,
    (dayOfWeek % WEEKLY_QUERIES.length) + 2
  )
  
  for (const query of todaysQueries) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: LIBRARIAN_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `${query}
        
Return as JSON array:
[{
  "title": "string",
  "url": "string", 
  "description": "string",
  "content_type": "book|video|documentary|article|research|guide",
  "language": ["en"|"si"|"ta"],
  "target_roles": ["teacher"|"student"|"principal"],
  "why_meaningful": "string",
  "source_name": "string"
}]`
      }]
    })
    
    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')
    
    try {
      const parsed = JSON.parse(
        text.replace(/```json|```/g, '').trim()
      )
      results.push(...parsed.map(item => ({
        ...item,
        ai_reasoning: item.why_meaningful,
      })))
    } catch (err) {
      // Parse failed — log and continue
    }
  }
  
  return results
}
```

---

## Scoring

```typescript
// scripts/etl/discovery/scorer.ts

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const SCORING_SYSTEM = `
You score resources for Gurudevi's library.
Score each resource 0.0 to 1.0.

High score (>0.8): 
  Directly relevant to Sri Lankan education
  OR universally transformative for teachers/students
  High quality source
  Would change how someone thinks or teaches

Medium score (0.5-0.8):
  Relevant but not essential
  Good source, average depth
  Pending human review

Low score (<0.5):
  Marginally relevant
  Low quality or unverifiable source
  Discard

Return JSON only. Array of {id, score, reason}.
`

export async function scoreAndFilter(items: any[]) {
  // Batch items to avoid token limits
  // 10 items per scoring request
  const batches = chunk(items, 10)
  const scored = []
  
  for (const batch of batches) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: SCORING_SYSTEM,
      messages: [{
        role: 'user',
        content: JSON.stringify(batch.map((item, i) => ({
          id: i,
          title: item.title,
          description: item.description,
          source_type: item.source_type,
          content_type: item.content_type,
          target_roles: item.target_roles,
        })))
      }]
    })
    
    // Parse scores
    // Apply to items
    // Set status based on score + auto_approve_eligible:
    //   score > 0.85 AND auto_approve_eligible → 'approved'
    //   score > 0.55 → 'pending_review'
    //   score <= 0.55 → 'rejected'
    
    scored.push(...scoredBatch)
  }
  
  return scored
}
```

---

## Deduplication

```typescript
// scripts/etl/discovery/dedup.ts

export async function checkDuplication(items: any[]) {
  const unique = []
  
  for (const item of items) {
    
    // CHECK 1: URL already in staging or resources
    const { data: urlExists } = await supabase
      .from('staging')
      .select('id')
      .eq('url', item.url)
      .single()
    
    if (urlExists) continue
    
    const { data: urlInResources } = await supabase
      .from('resources')
      .select('id')
      .eq('source_url', item.url)
      .single()
    
    if (urlInResources) continue
    
    // CHECK 2: Semantic similarity
    // (only if item has been embedded already — skip for now)
    // Future: generate quick embedding, check cosine similarity > 0.97
    
    unique.push(item)
  }
  
  return unique
}
```

---

## Supabase Edge Function — Enrichment

```typescript
// supabase/functions/enrich-staging/index.ts
// Triggers automatically on new staging row insert
// (Set up via Supabase webhook or pg_net)

import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

serve(async (req) => {
  const { record } = await req.json() // staging row
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // 1. Generate multilingual text for embedding
  const textToEmbed = [
    record.title,
    record.description,
  ].filter(Boolean).join(' ')
  
  // 2. Generate embedding
  // Use Supabase's built-in embedding (free):
  // https://supabase.com/docs/guides/ai/quickstarts/generate-text-embeddings
  const embedding = await generateEmbedding(textToEmbed)
  
  // 3. Find similar existing nodes
  const { data: similar } = await supabase.rpc(
    'match_nodes',
    {
      query_embedding: embedding,
      match_threshold: 0.75,
      match_count: 5
    }
  )
  
  // 4. Suggest map position
  // Average of similar nodes' positions + small offset
  const map_x = average(similar.map(n => n.map_x)) + randomOffset()
  const map_y = average(similar.map(n => n.map_y)) + randomOffset()
  
  // 5. Suggest edges to similar nodes
  const suggested_edges = similar.map(node => ({
    to_node: node.id,
    relationship: 'related',
    weight: node.similarity,
    is_ai_generated: true,
  }))
  
  // 6. Suggest tags via Claude
  const suggested_tags = await suggestTags(record)
  
  // 7. Update staging row
  await supabase
    .from('staging')
    .update({
      embedding,
      map_x,
      map_y,
      suggested_edges,
      suggested_tags,
      enrichment_complete: true,
    })
    .eq('id', record.id)
  
  return new Response('ok')
})
```

---

## Supabase Edge Function — Publish

```typescript
// supabase/functions/publish-resource/index.ts
// Called when human approves in admin UI

serve(async (req) => {
  const { staging_id } = await req.json()
  
  // 1. Fetch enriched staging row
  const { data: staging } = await supabase
    .from('staging')
    .select('*')
    .eq('id', staging_id)
    .single()
  
  if (!staging || staging.status !== 'approved') {
    return new Response('Not approved', { status: 400 })
  }
  
  // 2. Begin transaction equivalent
  // (Supabase doesn't have true transactions in Edge Functions
  //  use sequential inserts with rollback logic)
  
  // Insert node
  const { data: node } = await supabase
    .from('nodes')
    .insert({
      type: 'resource',
      title_si: staging.title_si || staging.title,
      title_en: staging.title,
      description_en: staging.description,
      embedding: staging.embedding,
      map_x: staging.map_x,
      map_y: staging.map_y,
      is_published: true,
    })
    .select()
    .single()
  
  // Insert resource
  await supabase
    .from('resources')
    .insert({
      id: node.id,
      content_type: staging.suggested_content_type,
      cloudinary_url: staging.cloudinary_url,
      file_hash: staging.file_hash,
      language: staging.suggested_language,
      target_roles: staging.suggested_roles,
      source_url: staging.url,
      source_name: staging.source_name,
      is_ministry_official: staging.source_type === 'ministry',
    })
  
  // Insert tags
  for (const tag of staging.suggested_tags || []) {
    const { data: tagRecord } = await supabase
      .from('tags')
      .upsert({ name_en: tag.name, category: tag.category })
      .select()
      .single()
    
    await supabase
      .from('resource_tags')
      .insert({
        resource_id: node.id,
        tag_id: tagRecord.id,
        is_ai_suggested: true,
      })
  }
  
  // Insert edges
  for (const edge of staging.suggested_edges || []) {
    await supabase
      .from('edges')
      .insert({
        from_node: node.id,
        to_node: edge.to_node,
        relationship: edge.relationship,
        weight: edge.weight,
        is_ai_generated: true,
        is_verified: false,
      })
  }
  
  // Update staging as published
  await supabase
    .from('staging')
    .update({
      status: 'published',
      published_node_id: node.id,
      published_at: new Date().toISOString(),
    })
    .eq('id', staging_id)
  
  return new Response(JSON.stringify({ node_id: node.id }))
})
```

---

## Telegram Bot — Community Intake

```typescript
// supabase/functions/telegram-intake/index.ts
// Webhook registered with Telegram Bot API

serve(async (req) => {
  const update = await req.json()
  const message = update.message
  
  if (!message) return new Response('ok')
  
  const chatId = message.chat.id
  const bot = new TelegramBot(Deno.env.get('TELEGRAM_BOT_TOKEN')!)
  
  // Document/file shared
  if (message.document) {
    const file = message.document
    
    // Download from Telegram
    const fileUrl = await bot.getFileUrl(file.file_id)
    const buffer = await fetch(fileUrl).then(r => r.arrayBuffer())
    
    // Hash check
    const hash = await sha256(buffer)
    const exists = await checkHashExists(hash)
    
    if (exists) {
      await bot.sendMessage(chatId,
        '🙏 Thank you! This resource is already in our library.'
      )
      return new Response('ok')
    }
    
    // AI classify
    const classification = await classifyResource({
      filename: file.file_name,
      mimeType: file.mime_type,
      caption: message.caption,
    })
    
    // Insert to staging
    await supabase.from('staging').insert({
      title: classification.title || file.file_name,
      description: classification.description,
      content_type: classification.content_type,
      source_type: 'community',
      suggested_roles: classification.target_roles,
      suggested_language: classification.language,
      ai_score: classification.score,
      status: 'pending_review',
      file_hash: hash,
      // Store telegram file_id for later download
      url: `telegram://${file.file_id}`,
    })
    
    await bot.sendMessage(chatId,
      '🙏 Thank you! Your resource is being reviewed by our team. ' +
      'If approved it will appear in the Gurudevi library.'
    )
  }
  
  // YouTube URL shared
  if (message.text?.includes('youtube.com') || 
      message.text?.includes('youtu.be')) {
    
    const url = extractYouTubeUrl(message.text)
    const metadata = await fetchYouTubeMetadata(url)
    
    await supabase.from('staging').insert({
      title: metadata.title,
      description: metadata.description,
      url: url,
      content_type: 'video',
      source_type: 'community',
      status: 'pending_review',
    })
    
    await bot.sendMessage(chatId,
      '🙏 Thank you for sharing! ' +
      'This video has been added for review.'
    )
  }
  
  return new Response('ok')
})
```

---

## Acquisition Script

```typescript
// scripts/etl/acquisition/index.ts

async function runAcquisition() {
  // Fetch approved but not yet acquired
  const { data: toAcquire } = await supabase
    .from('staging')
    .select('*')
    .eq('status', 'approved')
    .eq('file_acquired', false)
    .neq('source_type', 'youtube') // never download YouTube
  
  for (const item of toAcquire) {
    try {
      await acquireItem(item)
    } catch (err) {
      logger.error('Acquisition failed', { id: item.id, err })
    }
  }
}

async function acquireItem(item: any) {
  
  // YouTube — metadata only
  if (item.source_type === 'youtube') {
    await supabase.from('staging').update({
      cloudinary_url: null,
      file_acquired: true,
    }).eq('id', item.id)
    return
  }
  
  // Download file
  const buffer = await downloadFile(item.url)
  
  // Hash check — telegram style dedup
  const hash = await sha256(buffer)
  
  const { data: existing } = await supabase
    .from('resources')
    .select('cloudinary_url')
    .eq('file_hash', hash)
    .single()
  
  if (existing) {
    // File exists — reuse Cloudinary URL
    await supabase.from('staging').update({
      cloudinary_url: existing.cloudinary_url,
      file_hash: hash,
      file_acquired: true,
    }).eq('id', item.id)
    return
  }
  
  // Upload to Cloudinary
  const upload = await uploadToCloudinary(buffer, {
    folder: `gurudevi/${item.content_type}`,
    resource_type: 'auto',
    public_id: `${Date.now()}-${sanitize(item.title)}`,
  })
  
  await supabase.from('staging').update({
    cloudinary_url: upload.secure_url,
    cloudinary_public_id: upload.public_id,
    file_hash: hash,
    file_size_bytes: buffer.byteLength,
    file_acquired: true,
  }).eq('id', item.id)
}
```

---

## Admin Review UI (In-App)

```
ROUTE: /admin/staging
ACCESS: Only for admin role users

SCREEN:
  Tab bar: [Pending (24)] [Approved] [Published]
  
  Pending list (FlashList):
    Each item shows:
      Title
      Source type badge
      AI score (0.0 - 1.0) with color
      AI reasoning (expandable)
      Suggested content type
      Suggested roles
      Suggested tags
      Source URL (tappable)
      
    Actions per item:
      [✓ Approve]  [✗ Reject]  [✎ Edit]
      
  Edit sheet:
    Edit title, description
    Change content type
    Add/remove tags
    Change target roles
    Edit suggested edges
    Then approve
    
  Batch actions:
    Select multiple → bulk approve/reject
    Especially useful for ministry content batches
```

---

## Seed Data Script

```typescript
// scripts/etl/seed/index.ts
// Run once to populate initial content
// So the library isn't empty on first launch

const SEED_SOURCES = [
  // Ministry circulars (public, official)
  {
    title: 'School Year Calendar 2024',
    url: 'https://www.moe.gov.lk/...',
    content_type: 'circular',
    language: ['si', 'en'],
    target_roles: ['teacher', 'principal'],
    is_ministry_official: true,
    is_curated: true,
  },
  
  // NIE curriculum documents
  {
    title: 'Grade 6 Science Syllabus',
    url: 'https://www.nie.lk/...',
    content_type: 'syllabus',
    language: ['si', 'ta', 'en'],
    target_roles: ['teacher', 'student'],
    is_ministry_official: true,
  },
  
  // UNESCO open resources
  // Internet Archive books
  // Add minimum 20 real resources
  // Across different content types
  // Across different roles
  // Across all three languages
]

// Run this before first launch
// Bypasses staging — goes directly to production
// Because these are manually verified
```

---

## pgvector SQL Functions

```sql
-- Similarity search function
-- Used by enrichment and recommendation
create or replace function match_nodes(
  query_embedding vector(1024),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  title_en text,
  similarity float,
  map_x float,
  map_y float
)
language sql stable
as $$
  select
    id,
    title_en,
    1 - (embedding <=> query_embedding) as similarity,
    map_x,
    map_y
  from nodes
  where is_published = true
    and 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- Semantic search for library screen
create or replace function search_resources(
  query_embedding vector(1024),
  target_roles text[],
  languages text[],
  match_count int default 20
)
returns table (
  id uuid,
  title_en text,
  content_type text,
  cloudinary_url text,
  similarity float
)
language sql stable
as $$
  select
    n.id,
    n.title_en,
    r.content_type,
    r.cloudinary_url,
    1 - (n.embedding <=> query_embedding) as similarity
  from nodes n
  join resources r on r.id = n.id
  where n.is_published = true
    and r.target_roles && target_roles
    and r.language && languages
  order by n.embedding <=> query_embedding
  limit match_count;
$$;
```

---

## Environment Variables Required

```bash
# GitHub Secrets (for Actions)
SUPABASE_URL
SUPABASE_SERVICE_KEY       # service role, not anon
ANTHROPIC_API_KEY          # for AI search + scoring
YOUTUBE_API_KEY            # YouTube Data API v3
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
TELEGRAM_BOT_TOKEN         # from @BotFather

# Supabase Edge Function secrets
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
TELEGRAM_BOT_TOKEN
```

---

## Cost Estimate

```
GitHub Actions (discovery + acquisition):
  ~30 min/day × 30 days = 900 min/month
  Free tier: 2000 min/month ✓
  Cost: $0

Anthropic API (AI search + scoring):
  ~10 API calls/day × 30 days = 300 calls
  ~$0.003/call average = ~$0.90/month
  Cost: ~$1/month

YouTube Data API:
  ~1000 units/day, free tier 10,000/day ✓
  Cost: $0

Internet Archive API:
  Free, no key required ✓
  Cost: $0

Supabase Edge Functions:
  Free tier: 500,000 invocations/month ✓
  Cost: $0

Cloudinary:
  Free tier: 25GB storage, 25GB bandwidth ✓
  Cost: $0 until meaningful scale

Supabase pgvector:
  Included in existing Supabase plan ✓
  Cost: $0

TOTAL: ~$1/month
```

---

## Definition of Done — ETL

```
✓ Discovery workflow runs on schedule
✓ Ministry scraper finds new circulars
✓ YouTube discovery fetches metadata
✓ Archive discovery returns books
✓ AI search returns structured results
✓ Scoring correctly filters low quality
✓ Deduplication prevents repeat entries
✓ New items appear in staging table
✓ Edge Function enriches on insert
✓ Embeddings generated for all items
✓ Similar nodes suggested correctly
✓ Admin UI shows pending items
✓ Approve → triggers acquisition
✓ Acquisition uploads to Cloudinary
✓ file_hash prevents duplicate uploads
✓ Publish creates node + resource + tags + edges
✓ Published resource appears in library
✓ Telegram bot receives documents
✓ Telegram bot responds correctly
✓ Seed data: minimum 20 real resources
✓ At least 3 content types represented
✓ At least 2 languages represented
✓ pgvector search functions working
✓ Total daily cost under $0.10
```

---

*The library is only as alive*
*as the knowledge flowing into it.*

*This pipeline is the bloodstream.*
*Build it accordingly.*
