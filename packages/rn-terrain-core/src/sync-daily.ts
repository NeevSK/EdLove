import { supabase } from '@/db.js';
import { calculateVitalityScore } from '@/scoring/index.js';

// Parse GitHub URL into owner and repo name
function parseGithubUrl(url?: string): { owner: string; repo: string } | null {
  if (!url) return null;
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  const owner = match[1];
  let repo = match[2];
  if (!owner || !repo) return null;
  if (repo.endsWith('.git')) repo = repo.slice(0, -4);
  return { owner, repo };
}

// Fetch GitHub repository metadata and commit logs
async function fetchGithubStats(owner: string, repo: string) {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'rn-terrain-sync',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      throw new Error(`Failed to fetch repo stats: ${repoRes.statusText}`);
    }
    const repoData = (await repoRes.json()) as Record<string, any>;

    // Fetch last 50 commits to estimate activity
    let commitCount30d = 0;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - 30);

    const commitsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?since=${sinceDate.toISOString()}&per_page=100`,
      { headers },
    );
    let commits: unknown[] = [];
    if (commitsRes.ok) {
      commits = (await commitsRes.json()) as unknown[];
      commitCount30d = Array.isArray(commits) ? commits.length : 0;
    }

    // Get the last release date
    let lastReleaseDate = repoData.updated_at;
    const releasesRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
      { headers },
    );
    if (releasesRes.ok) {
      const releaseData = (await releasesRes.json()) as Record<string, any>;
      if (releaseData.published_at) {
        lastReleaseDate = releaseData.published_at;
      }
    }

    const firstCommit = commits[0] as Record<string, any> | undefined;

    return {
      stars: repoData.stargazers_count ?? 0,
      forks: repoData.forks_count ?? 0,
      openIssues: repoData.open_issues_count ?? 0,
      commitCount30d,
      lastReleaseDate,
      lastCommitDate: firstCommit?.commit?.committer?.date ?? repoData.pushed_at,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error fetching GitHub stats for ${owner}/${repo}:`, errorMessage);
    return null;
  }
}

// Fetch npm registry and downloads count
async function fetchNpmStats(packageName: string) {
  try {
    // 1. Fetch package metadata
    const metadataRes = await fetch(`https://registry.npmjs.org/${packageName}`);
    if (!metadataRes.ok) {
      throw new Error(`Failed to fetch package metadata: ${metadataRes.statusText}`);
    }
    const metadata = await metadataRes.json();
    const latestVersion = metadata['dist-tags']?.latest;
    const latestObj = metadata.versions?.[latestVersion];

    // Check deprecation
    const npmDeprecated = !!latestObj?.deprecated;
    const npmDeprecatedMessage = latestObj?.deprecated || null;

    const latestReleaseDateStr = metadata.time?.[latestVersion] || null;

    // Calculate release date lag
    const daysSinceLastRelease = latestReleaseDateStr
      ? Math.floor(
          // eslint-disable-next-line no-restricted-syntax
          (Date.now() - new Date(latestReleaseDateStr).getTime()) / (1000 * 60 * 60 * 24),
        )
      : 30;

    // 2. Fetch weekly downloads
    let weeklyDownloads = 0;
    const downloadsRes = await fetch(
      `https://api.npmjs.org/downloads/point/last-week/${packageName}`,
    );
    if (downloadsRes.ok) {
      const downloadsData = (await downloadsRes.json()) as { downloads?: number };
      weeklyDownloads = downloadsData.downloads ?? 0;
    }

    return {
      latestVersion,
      npmDeprecated,
      npmDeprecatedMessage,
      daysSinceLastRelease,
      weeklyDownloads,
      lastReleaseDateStr: latestReleaseDateStr,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error fetching NPM stats for ${packageName}:`, errorMessage);
    return null;
  }
}

// Sync all packages in the registry
export async function syncAllPackages() {
  console.log('Starting daily sync for RN Terrain packages...');

  // Fetch all packages currently tracked
  const { data: packages, error } = await supabase
    .from('packages')
    .select('package_name, github_url');

  if (error || !packages) {
    console.error('Failed to retrieve packages from database:', error);
    return;
  }

  console.log(`Found ${packages.length} packages to sync.`);

  for (const pkg of packages) {
    const name = pkg.package_name;
    console.log(`Syncing "${name}"...`);

    const npmStats = await fetchNpmStats(name);
    if (!npmStats) {
      console.warn(`Skipping NPM sync for ${name} due to fetch error.`);
      continue;
    }

    let githubStats = null;
    const gitInfo = parseGithubUrl(pkg.github_url);
    if (gitInfo) {
      githubStats = await fetchGithubStats(gitInfo.owner, gitInfo.repo);
    }

    // Prepare update parameters
    const updateData: Record<string, any> = {
      latest_version: npmStats.latestVersion,
      npm_deprecated: npmStats.npmDeprecated,
      npm_deprecated_message: npmStats.npmDeprecatedMessage,
      days_since_last_release: npmStats.daysSinceLastRelease,
      downloads_weekly_npm: npmStats.weeklyDownloads,
      last_synced_npm: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (npmStats.lastReleaseDateStr) {
      updateData.last_release_date = npmStats.lastReleaseDateStr;
    }

    if (githubStats) {
      updateData.stars_total = githubStats.stars;
      updateData.forks_total = githubStats.forks;
      updateData.open_issues_count = githubStats.openIssues;
      updateData.commit_count_30d = githubStats.commitCount30d;
      updateData.last_commit_date = githubStats.lastCommitDate;
      updateData.last_synced_github = new Date().toISOString();
      if (githubStats.lastReleaseDate) {
        updateData.last_release_date = githubStats.lastReleaseDate;
      }
    }

    // Construct partial card to run formula on
    const mockCard: Record<string, any> = {
      version: {
        lag: { major: 0, minor: 0, patch: 0 },
        days_since_release: updateData.days_since_release,
      },
      architecture: {
        has_native_code: false,
        jsi_binding: 'unknown',
        nitro_powered: false,
        wasm_compiled: false,
        wasm_size_bytes: 0,
        bundle_increment_bytes: 0,
        dependency_fan_out: 0,
        thread_safety: 'unknown',
      },
      compatibility: {
        new_architecture: 'unknown',
        hermes_v1: null,
      },
      deprecation: {
        npm_explicit: updateData.npm_deprecated,
        silent: updateData.days_since_release > 180,
      },
    };

    const scoreBreakdown = calculateVitalityScore(mockCard as any);
    updateData.vitality_score = scoreBreakdown.total;

    // Save back to DB
    const { error: updateError } = await supabase
      .from('packages')
      .update(updateData)
      .eq('package_name', name);

    if (updateError) {
      console.error(`Failed to update ${name} in database:`, updateError);
    } else {
      console.log(`Successfully updated ${name}. Score: ${updateData.vitality_score}`);
    }
  }

  console.log('Daily sync complete.');
}

// Auto-run if executed directly
if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  syncAllPackages()
    .then(() => process.exit(0))
    .catch((err: unknown) => {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('Fatal sync failure:', errMsg);
      process.exit(1);
    });
}
