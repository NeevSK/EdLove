# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 9/4/2026, 8:06:00 AM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD && pnpm run lint && pnpm run audit:react-doctor && node scripts/surgical-push-check.mjs
> **Duration:** 21.6s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 6 |

## Detailed Findings

### Category: General
- @repo/editorial:lint:biome:      50     │ - ······lastError:·'rate·limited',␍
- @repo/editorial:lint:biome: Found 3 errors.
- @repo/editorial:lint:biome:   × Some errors were emitted while running checks.
- @repo/editorial#lint:biome:  ERROR  command (C:\x\packages\editorial) C:\Users\Naween\AppData\Local\mise\installs\pnpm\12.1.0\pnpm.exe run lint:biome exited (1)
- ERROR  run failed: command  exited (1)
- Findings: 1 (Errors: 1, Warnings: 0)

## Raw Output

```text
$ node ./scripts/run-and-report.mjs --cmd "pnpm turbo run lint" --name "package_json-lint"

>>> Starting Process: 9/4/2026, 8:05:55 AM (IST)

>>> Command: pnpm turbo run lint

>>> Working Dir: C:\x
>>> Log output: C:\x\reports\run-package_json-lint.log
--------------------------------------------------------------------------------

• turbo 2.10.12



   • Packages in scope: @intuitui-labs/form-builder-engine, @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/editorial, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/policies, @repo/profile, @repo/sanctuary-api, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, gurudevi-mobile
   • Running lint in 31 packages
   • Remote caching disabled


@repo/ui:lint:biome: cache miss, executing ff123148d8012085

@repo/admin:lint:biome: cache miss, executing 5a8bbaa45b7e3ba3
@repo/core:lint:biome: cache miss, executing 1d22d00a1ba1f682
@repo/platform-mcp:lint:biome: cache miss, executing db700b8bbdcde80e
@repo/ai:lint:biome: cache miss, executing e31b80b028a46955
@repo/classroom:lint:biome: cache miss, executing 977a9f28ce247199
apps-gurudevi-marketing-web:lint:biome: cache miss, executing 02b03c147478984a
@repo/editorial:lint:biome: cache miss, executing 7fcfde98ce58e672

@repo/payments:lint:biome: cache miss, executing 217418db7905ae0e

@repo/types-shim:lint:biome: cache miss, executing e1d7d053888c96d9

@repo/ui:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_ui-lint_biome"
@repo/classroom:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_classroom-lint_biome"

@repo/ai:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_ai-lint_biome"

@repo/ui:lint:biome: >>> Starting Process: 9/4/2026, 8:05:56 AM (IST)

@repo/ui:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/ui:lint:biome: >>> Working Dir: C:\x\packages\ui
@repo/ui:lint:biome: >>> Log output: C:\x\reports\run-packages_ui-lint_biome.log
@repo/ui:lint:biome: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_platform-mcp-lint_biome"

@repo/classroom:lint:biome: >>> Starting Process: 9/4/2026, 8:05:56 AM (IST)

@repo/classroom:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/classroom:lint:biome: >>> Working Dir: C:\x\packages\classroom
@repo/classroom:lint:biome: >>> Log output: C:\x\reports\run-packages_classroom-lint_biome.log
@repo/classroom:lint:biome: --------------------------------------------------------------------------------

@repo/admin:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_admin-lint_biome"

@repo/core:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_core-lint_biome"

apps-gurudevi-marketing-web:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "apps_gurudevi-marketingWeb-lint_biome"

@repo/payments:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_payments-lint_biome"

@repo/platform-mcp:lint:biome: >>> Starting Process: 9/4/2026, 8:05:57 AM (IST)

@repo/platform-mcp:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/platform-mcp:lint:biome: >>> Working Dir: C:\x\packages\platform-mcp
@repo/platform-mcp:lint:biome: >>> Log output: C:\x\reports\run-packages_platform-mcp-lint_biome.log
@repo/platform-mcp:lint:biome: --------------------------------------------------------------------------------

@repo/ai:lint:biome: >>> Starting Process: 9/4/2026, 8:05:57 AM (IST)

@repo/ai:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/ai:lint:biome: >>> Working Dir: C:\x\packages\ai
@repo/ai:lint:biome: >>> Log output: C:\x\reports\run-packages_ai-lint_biome.log
@repo/ai:lint:biome: --------------------------------------------------------------------------------

@repo/editorial:lint:biome: $ biome check src

@repo/types-shim:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_types-shim-lint_biome"

@repo/core:lint:biome: >>> Starting Process: 9/4/2026, 8:05:57 AM (IST)

@repo/admin:lint:biome: >>> Starting Process: 9/4/2026, 8:05:57 AM (IST)

@repo/admin:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/admin:lint:biome: >>> Working Dir: C:\x\packages\admin

@repo/admin:lint:biome: >>> Log output: C:\x\reports\run-packages_admin-lint_biome.log

@repo/admin:lint:biome: --------------------------------------------------------------------------------

@repo/core:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/core:lint:biome: >>> Working Dir: C:\x\packages\core
@repo/core:lint:biome: >>> Log output: C:\x\reports\run-packages_core-lint_biome.log

@repo/core:lint:biome: --------------------------------------------------------------------------------

apps-gurudevi-marketing-web:lint:biome: >>> Starting Process: 9/4/2026, 8:05:57 AM (IST)

apps-gurudevi-marketing-web:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

apps-gurudevi-marketing-web:lint:biome: >>> Working Dir: C:\x\apps\gurudevi-marketingWeb

apps-gurudevi-marketing-web:lint:biome: >>> Log output: C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome.log

apps-gurudevi-marketing-web:lint:biome: --------------------------------------------------------------------------------

@repo/payments:lint:biome: >>> Starting Process: 9/4/2026, 8:05:58 AM (IST)

@repo/payments:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/payments:lint:biome: >>> Working Dir: C:\x\packages\payments
@repo/payments:lint:biome: >>> Log output: C:\x\reports\run-packages_payments-lint_biome.log
@repo/payments:lint:biome: --------------------------------------------------------------------------------

@repo/types-shim:lint:biome: >>> Starting Process: 9/4/2026, 8:05:58 AM (IST)

@repo/types-shim:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/types-shim:lint:biome: >>> Working Dir: C:\x\packages\types-shim
@repo/types-shim:lint:biome: >>> Log output: C:\x\reports\run-packages_types-shim-lint_biome.log
@repo/types-shim:lint:biome: --------------------------------------------------------------------------------

@repo/editorial:lint:biome: src\domain.test.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/editorial:lint:biome: 
@repo/editorial:lint:biome:   × Formatter would have printed the following content:
@repo/editorial:lint:biome:   
@repo/editorial:lint:biome:       1     │ - import·{·describe,·expect,·expectTypeOf,·it,·test·}·from·'vitest';␍
@repo/editorial:lint:biome:       2     │ - import·{␍
@repo/editorial:lint:biome:       3     │ - ··createLinkedInAdapter,␍

@repo/editorial:lint:biome:       4     │ - ··createMemoryDispatchLedger,␍
@repo/editorial:lint:biome:       5     │ - ··createPostizAdapter,␍
@repo/editorial:lint:biome:       6     │ - ··dispatchArticlePublished,␍
@repo/editorial:lint:biome:       7     │ - ··linkedinAdapter,␍
@repo/editorial:lint:biome:       8     │ - }·from·'./distribution';␍
@repo/editorial:lint:biome:       9     │ - import·{␍
@repo/editorial:lint:biome:      10     │ - ··type·AuthorProfile,␍
@repo/editorial:lint:biome:      11     │ - ··canTransitionSubmission,␍
@repo/editorial:lint:biome:      12     │ - ··createArticlePublishedEvent,␍
@repo/editorial:lint:biome:      13     │ - ··createDelivery,␍
@repo/editorial:lint:biome:      14     │ - ··MemoryDistributionLedger,␍
@repo/editorial:lint:biome:      15     │ - ··type·SubmissionStatus,␍
@repo/editorial:lint:biome:      16     │ - ··transitionDelivery,␍
@repo/editorial:lint:biome:      17     │ - }·from·'./domain';␍
@repo/editorial:lint:biome:      18     │ - ␍
@repo/editorial:lint:biome:      19     │ - const·event·=·createArticlePublishedEvent({␍
@repo/editorial:lint:biome:      20     │ - ··eventId:·'evt-1',␍
@repo/editorial:lint:biome:      21     │ - ··occurredAt:·'2026-08-31T00:00:00.000Z',␍
@repo/editorial:lint:biome:      22     │ - ··workId:·'work-1',␍
@repo/editorial:lint:biome:      23     │ - ··versionId:·'version-1',␍
@repo/editorial:lint:biome:      24     │ - ··publication:·'edlove',␍
@repo/editorial:lint:biome:      25     │ - ··language:·'en',␍
@repo/editorial:lint:biome:      26     │ - ··canonicalUrl:·'https://edlove.org/journal/example',␍
@repo/editorial:lint:biome:      27     │ - ··policy:·{·channels:·['linkedin'],·excerptOnly:·['linkedin'],·utmCampaign:·'journal-launch'·},␍
@repo/editorial:lint:biome:      28     │ - });␍
@repo/editorial:lint:biome:      29     │ - ␍
@repo/editorial:lint:biome:      30     │ - describe('editorial·distribution·contracts',·{·tags:·['editorial',·'pure',·'fast']·},·()·=>·{␍
@repo/editorial:lint:biome:      31     │ - ··it('enforces·static·type·boundaries·on·core·editorial·models·(T16·expectTypeOf)',·()·=>·{␍
@repo/editorial:lint:biome:      32     │ - ····expectTypeOf<AuthorProfile['displayName']>().toBeString();␍
@repo/editorial:lint:biome:      33     │ - ····expectTypeOf<SubmissionStatus>().toEqualTypeOf<␍
@repo/editorial:lint:biome:      34     │ - ······'submitted'·|·'in_review'·|·'rights_review'·|·'approved'·|·'rejected'·|·'withdrawn'␍
@repo/editorial:lint:biome:      35     │ - ····>();␍
@repo/editorial:lint:biome:      36     │ - ····expectTypeOf(canTransitionSubmission).toBeFunction();␍
@repo/editorial:lint:biome:      37     │ - ····expectTypeOf(canTransitionSubmission).parameter(0).toBeString();␍
@repo/editorial:lint:biome:      38     │ - ··});␍
@repo/editorial:lint:biome:      39     │ - ␍
@repo/editorial:lint:biome:      40     │ - ··it('creates·stable·idempotent·delivery·keys',·()·=>·{␍
@repo/editorial:lint:biome:      41     │ - ····expect(createDelivery(event,·'linkedin',·'edlove-main',·event.occurredAt).idempotencyKey).toBe(␍
@repo/editorial:lint:biome:      42     │ - ······'evt-1:linkedin:edlove-main',␍
@repo/editorial:lint:biome:      43     │ - ····);␍
@repo/editorial:lint:biome:      44     │ - ··});␍
@repo/editorial:lint:biome:      45     │ - ␍

@repo/editorial:lint:biome:      46     │ - ··it('allows·retry·after·failure·and·increments·attempts',·()·=>·{␍

@repo/editorial:lint:biome:      47     │ - ····const·delivery·=·createDelivery(event,·'linkedin',·'edlove-main',·event.occurredAt);␍

@repo/editorial:lint:biome:      48     │ - ····const·processing·=·transitionDelivery(delivery,·'processing',·event.occurredAt);␍

@repo/editorial:lint:biome:      49     │ - ····const·failed·=·transitionDelivery(processing,·'failed',·event.occurredAt,·{␍

@repo/editorial:lint:biome:      50     │ - ······lastError:·'rate·limited',␍
@repo/editorial:lint:biome:      51     │ - ····});␍
@repo/editorial:lint:biome:      52     │ - ····const·retry·=·transitionDelivery(failed,·'processing',·event.occurredAt);␍
@repo/editorial:lint:biome:      53     │ - ····expect(retry.attempts).toBe(2);␍
@repo/editorial:lint:biome:      54     │ - ····expect(retry.status).toBe('processing');␍
@repo/editorial:lint:biome:      55     │ - ··});␍
@repo/editorial:lint:biome:      56     │ - ␍
@repo/editorial:lint:biome:      57     │ - ··it('prepares·channel-specific·links·and·excerpts',·()·=>·{␍
@repo/editorial:lint:biome:      58     │ - ····const·payload·=·linkedinAdapter.prepare(event,·{·title:·'Title',·text:·'x'.repeat(400)·});␍
@repo/editorial:lint:biome:      59     │ - ····expect(payload.text).toHaveLength(280);␍
@repo/editorial:lint:biome:      60     │ - ····expect(payload.url).toMatch(/utm_source=linkedin/);␍
@repo/editorial:lint:biome:      61     │ - ····expect(payload.url).toContain('utm_source=linkedin');␍
@repo/editorial:lint:biome:      62     │ - ····expect(payload.text.trim()).toBe('x'.repeat(280));␍
@repo/editorial:lint:biome:      63     │ - ··});␍
@repo/editorial:lint:biome:      64     │ - ␍
@repo/editorial:lint:biome:      65     │ - ··it('deduplicates·deliveries·through·the·ledger',·()·=>·{␍
@repo/editorial:lint:biome:      66     │ - ····const·ledger·=·new·MemoryDistributionLedger();␍
@repo/editorial:lint:biome:      67     │ - ····const·delivery·=·createDelivery(event,·'linkedin',·'edlove-main',·event.occurredAt);␍
@repo/editorial:lint:biome:      68     │ - ····ledger.save(delivery);␍
@repo/editorial:lint:biome:      69     │ - ····ledger.save(delivery);␍
@repo/editorial:lint:biome:      70     │ - ····expect(ledger.list(event.eventId)).toHaveLength(1);␍
@repo/editorial:lint:biome:      71     │ - ··});␍
@repo/editorial:lint:biome:      72     │ - ␍
@repo/editorial:lint:biome:      73     │ - ··it('does·not·claim·a·dry-run·adapter·published·externally',·async·()·=>·{␍
@repo/editorial:lint:biome:      74     │ - ····const·deliveries·=·await·dispatchArticlePublished({␍
@repo/editorial:lint:biome:      75     │ - ······event,␍
@repo/editorial:lint:biome:      76     │ - ······article:·{·title:·'Title',·text:·'Body'·},␍
@repo/editorial:lint:biome:      77     │ - ······accountIds:·{·linkedin:·'edlove-main'·},␍
@repo/editorial:lint:biome:      78     │ - ······ledger:·createMemoryDispatchLedger(),␍
@repo/editorial:lint:biome:      79     │ - ······now:·event.occurredAt,␍
@repo/editorial:lint:biome:      80     │ - ····});␍
@repo/editorial:lint:biome:      81     │ - ····expect(deliveries[0]?.status).toBe('skipped');␍
@repo/editorial:lint:biome:      82     │ - ··});␍
@repo/editorial:lint:biome:      83     │ - ␍
@repo/editorial:lint:biome:      84     │ - ··it('records·a·skipped·delivery·when·rights·exclude·a·channel',·async·()·=>·{␍
@repo/editorial:lint:biome:      85     │ - ····const·restrictedEvent·=·createArticlePublishedEvent({␍
@repo/editorial:lint:biome:      86     │ - ······...event,␍
@repo/editorial:lint:biome:      87     │ - ······eventId:·'evt-restricted',␍
@repo/editorial:lint:biome:      88     │ - ······policy:·{␍
@repo/editorial:lint:biome:      89     │ - ········...event.policy,␍
@repo/editorial:lint:biome:      90     │ - ········permittedChannels:·[],␍
@repo/editorial:lint:biome:      91     │ - ······},␍
@repo/editorial:lint:biome:      92     │ - ····});␍
@repo/editorial:lint:biome:      93     │ - ····const·deliveries·=·await·dispatchArticlePublished({␍
@repo/editorial:lint:biome:      94     │ - ······event:·restrictedEvent,␍
@repo/editorial:lint:biome:      95     │ - ······article:·{·title:·'Title',·text:·'Body'·},␍
@repo/editorial:lint:biome:      96     │ - ······accountIds:·{·linkedin:·'edlove-main'·},␍
@repo/editorial:lint:biome:      97     │ - ······ledger:·createMemoryDispatchLedger(),␍
@repo/editorial:lint:biome:      98     │ - ······now:·restrictedEvent.occurredAt,␍
@repo/editorial:lint:biome:      99     │ - ····});␍
@repo/editorial:lint:biome:     100     │ - ····expect(deliveries[0]?.status).toBe('skipped');␍
@repo/editorial:lint:biome:     101     │ - ··});␍
@repo/editorial:lint:biome:     102     │ - ␍
@repo/editorial:lint:biome:     103     │ - ··test.for([␍
@repo/editorial:lint:biome:     104     │ - ····{·from:·'submitted',·to:·'approved',·allowed:·false·},␍
@repo/editorial:lint:biome:     105     │ - ····{·from:·'in_review',·to:·'rights_review',·allowed:·true·},␍
@repo/editorial:lint:biome:     106     │ - ····{·from:·'rights_review',·to:·'approved',·allowed:·true·},␍
@repo/editorial:lint:biome:     107     │ - ····{·from:·'approved',·to:·'in_review',·allowed:·false·},␍
@repo/editorial:lint:biome:     108     │ - ··])('submission·lifecycle:·from·$from·->·to·$to·is·allowed=$allowed·(T17·test.for·capability)',·({·from,·to,·allowed·})·=>·{␍
@repo/editorial:lint:biome:     109     │ - ····expect(canTransitionSubmission(from·as·any,·to·as·any)).toBe(allowed);␍
@repo/editorial:lint:biome:     110     │ - ··});␍
@repo/editorial:lint:biome:     111     │ - ␍
@repo/editorial:lint:biome:     112     │ - ··it('publishes·a·LinkedIn·post·through·the·supported·Posts·API·shape',·async·()·=>·{␍
@repo/editorial:lint:biome:     113     │ - ····let·request:·Request·|·undefined;␍
@repo/editorial:lint:biome:     114     │ - ····const·adapter·=·createLinkedInAdapter({␍
@repo/editorial:lint:biome:     115     │ - ······accessToken:·'token',␍
@repo/editorial:lint:biome:     116     │ - ······authorUrn:·'urn:li:organization:1',␍
@repo/editorial:lint:biome:     117     │ - ······apiVersion:·'202601',␍
@repo/editorial:lint:biome:     118     │ - ······fetcher:·async·(input,·init)·=>·{␍
@repo/editorial:lint:biome:     119     │ - ········request·=·new·Request(input,·init);␍
@repo/editorial:lint:biome:     120     │ - ········return·new·Response(null,·{·status:·201,·headers:·{·'x-restli-id':·'urn:li:share:2'·}·});␍
@repo/editorial:lint:biome:     121     │ - ······},␍
@repo/editorial:lint:biome:     122     │ - ····});␍
@repo/editorial:lint:biome:     123     │ - ····const·result·=·await·adapter.publish(␍
@repo/editorial:lint:biome:     124     │ - ······createDelivery(event,·'linkedin',·'edlove-main',·event.occurredAt),␍
@repo/editorial:lint:biome:     125     │ - ······adapter.prepare(event,·{·title:·'Title',·text:·'Body'·}),␍
@repo/editorial:lint:biome:     126     │ - ····);␍
@repo/editorial:lint:biome:     127     │ - ····expect(result).toEqual({␍
@repo/editorial:lint:biome:     128     │ - ······status:·'published',␍
@repo/editorial:lint:biome:     129     │ - ······externalUrl:·'https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A2',␍
@repo/editorial:lint:biome:     130     │ - ····});␍
@repo/editorial:lint:biome:     131     │ - ····expect(request?.headers.get('Linkedin-Version')).toBe('202601');␍
@repo/editorial:lint:biome:     132     │ - ····expect(await·request?.json()).toMatchObject({␍
@repo/editorial:lint:biome:     133     │ - ······author:·'urn:li:organization:1',␍

@repo/editorial:lint:biome:     134     │ - ······lifecycleState:·'PUBLISHED',␍
@repo/editorial:lint:biome:     135     │ - ····});␍
@repo/editorial:lint:biome:     136     │ - ··});␍
@repo/editorial:lint:biome:     137     │ - ␍

@repo/editorial:lint:biome:     138     │ - ··it('publishes·a·post·via·Postiz·REST·API·contract',·async·()·=>·{␍

@repo/editorial:lint:biome:     139     │ - ····let·request:·Request·|·undefined;␍

@repo/editorial:lint:biome:     140     │ - ····const·adapter·=·createPostizAdapter({␍

@repo/editorial:lint:biome:     141     │ - ······baseUrl:·'https://postiz.example.com',␍

@repo/editorial:lint:biome:     142     │ - ······apiKey:·'test-api-key',␍

@repo/editorial:lint:biome:     143     │ - ······integrationIds:·['li-1',·'x-1'],␍

@repo/editorial:lint:biome:     144     │ - ······fetcher:·async·(input,·init)·=>·{␍

@repo/editorial:lint:biome:     145     │ - ········request·=·new·Request(input,·init);␍

@repo/editorial:lint:biome:     146     │ - ········return·new·Response(JSON.stringify({·id:·'post-123',·url:·'https://postiz.example.com/posts/post-123'·}),·{␍

@repo/editorial:lint:biome:     147     │ - ··········status:·200,␍

@repo/editorial:lint:biome:     148     │ - ··········headers:·{·'Content-Type':·'application/json'·},␍

@repo/editorial:lint:biome:     149     │ - ········});␍

@repo/editorial:lint:biome:     150     │ - ······},␍

@repo/editorial:lint:biome:   193 more lines truncated

@repo/editorial:lint:biome:   

@repo/editorial:lint:biome: 

@repo/editorial:lint:biome: src\index.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/editorial:lint:biome: 
@repo/editorial:lint:biome:   × Formatter would have printed the following content:

@repo/editorial:lint:biome:   
@repo/editorial:lint:biome:     1   │ - export·*·from·'@intuitui-labs/editorial';␍

@repo/editorial:lint:biome:       1 │ + export·*·from·'@intuitui-labs/editorial';

@repo/editorial:lint:biome:     2 2 │   
@repo/editorial:lint:biome:   
@repo/editorial:lint:biome: 
@repo/editorial:lint:biome: src\syndication.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/editorial:lint:biome: 

@repo/editorial:lint:biome:   × Formatter would have printed the following content:
@repo/editorial:lint:biome:   

@repo/editorial:lint:biome:      45  45 │   }

@repo/editorial:lint:biome:      46  46 │   

@repo/editorial:lint:biome:      47     │ - const·allowedSyndicationTransitions:·Record<SyndicationReviewStatus,·ReadonlyArray<SyndicationReviewStatus>>·=·{

@repo/editorial:lint:biome:          47 │ + const·allowedSyndicationTransitions:·Record<

@repo/editorial:lint:biome:          48 │ + ··SyndicationReviewStatus,

@repo/editorial:lint:biome:          49 │ + ··ReadonlyArray<SyndicationReviewStatus>

@repo/editorial:lint:biome:          50 │ + >·=·{

@repo/editorial:lint:biome:      48  51 │     draft: ['draft', 'pending_editorial_review', 'withdrawn'],

@repo/editorial:lint:biome:      49     │ - ··pending_editorial_review:·['pending_editorial_review',·'rights_approved',·'approved',·'rejected',·'withdrawn'],

@repo/editorial:lint:biome:          52 │ + ··pending_editorial_review:·[

@repo/editorial:lint:biome:          53 │ + ····'pending_editorial_review',

@repo/editorial:lint:biome:          54 │ + ····'rights_approved',

@repo/editorial:lint:biome:          55 │ + ····'approved',

@repo/editorial:lint:biome:          56 │ + ····'rejected',

@repo/editorial:lint:biome:          57 │ + ····'withdrawn',

@repo/editorial:lint:biome:          58 │ + ··],
@repo/editorial:lint:biome:      50  59 │     rights_approved: ['rights_approved', 'approved', 'rejected', 'withdrawn'],
@repo/editorial:lint:biome:      51  60 │     approved: ['approved', 'withdrawn'],
@repo/editorial:lint:biome:   
@repo/editorial:lint:biome: 

@repo/editorial:lint:biome: Checked 5 files in 186ms. No fixes applied.

@repo/editorial:lint:biome: Found 3 errors.

@repo/editorial:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/editorial:lint:biome: 
@repo/editorial:lint:biome:   × Some errors were emitted while running checks.
@repo/editorial:lint:biome:   
@repo/editorial:lint:biome: 

@repo/editorial:lint:biome: [ELIFECYCLE] Command failed with exit code 1.

@repo/accounting:lint:biome: cache miss, executing 3bb58ef0a7ae721d

apps-edlove-web:lint:biome: cache miss, executing f8521e78004a1331

@repo/profile:lint:biome: cache miss, executing 51466e549aabe7a0

@repo/people:lint:biome: cache miss, executing a49c9c710c4072a7

@repo/self:lint:biome: cache miss, executing b0ac8a01181df10e

@intuitui-labs/lk-edu-geo:lint:biome: cache miss, executing 85bb9cc9ea790221

gurudevi-mobile:lint:biome: cache miss, executing 1eaca876bd990cd0

@repo/analytics:lint:biome: cache miss, executing e36e50043f389f5c

@repo/workforce:lint:biome: cache miss, executing d385bc1ef7cff66d

@repo/community:lint:biome: cache miss, executing 2895f09c006be77e

@repo/scanner-kit:lint:biome: cache miss, executing b54b2f7dd776260d

@repo/library:lint:biome: cache miss, executing 3fbb3a5ea03a0b24

@repo/form-builder:lint:biome: cache miss, executing f6d5feddfd830221

@repo/database:lint:biome: cache miss, executing 69d1cd606512cb55

@repo/graphics:lint:biome: cache miss, executing 766b9dd130a998e3

@repo/editorial#lint:biome:  ERROR  command (C:\x\packages\editorial) C:\Users\Naween\AppData\Local\mise\installs\pnpm\12.1.0\pnpm.exe run lint:biome exited (1)



 Tasks:    0 successful, 25 total
Cached:    0 cached, 25 total
  Time:    3.947s 

Failed:    @repo/editorial#lint:biome


 ERROR  run failed: command  exited (1)


--------------------------------------------------------------------------------

REPORT SUMMARY
Duration: 4.7 seconds
Findings: 1 (Errors: 1, Warnings: 0)

Raw Log:  C:\x\reports\run-package_json-lint.log
Report:   C:\x\reports\run-package_json-lint-report.txt

--------------------------------------------------------------------------------

[ELIFECYCLE] Command failed with exit code 1.

```
