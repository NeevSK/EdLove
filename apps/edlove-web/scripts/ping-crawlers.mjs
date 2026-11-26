#!/usr/bin/env node
/**
 * IndexNow Instant Crawler Notification Script for EdLove Constellation.
 * 
 * Directly alerts Bing, Naver, Seznam, and Cloudflare Crawler Hints
 * whenever pages, monographs, or journal essays are published or updated.
 */

const HOST = 'edlove.org';
const KEY = process.env.INDEXNOW_KEY || 'edlove-indexnow-key-2026';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const CANONICAL_URLS = [
  `https://${HOST}/`,
  `https://${HOST}/foundation`,
  `https://${HOST}/about`,
  `https://${HOST}/team`,
  `https://${HOST}/contact`,
  `https://${HOST}/research`,
  `https://${HOST}/research/cosmos`,
  `https://${HOST}/research/library`,
  `https://${HOST}/research/sri-lanka`,
  `https://${HOST}/care`,
  `https://${HOST}/care/sangha`,
  `https://${HOST}/tech`,
  `https://${HOST}/tech/innovations`,
  `https://${HOST}/tech/gurudevi`,
  `https://${HOST}/tech/instruments`,
  `https://${HOST}/journal`,
  `https://${HOST}/llms.txt`,
  `https://${HOST}/knowledge.json`,
];

async function pingIndexNow() {
  console.log(`[IndexNow] Broadcasting instant indexing ping for ${CANONICAL_URLS.length} canonical URLs on ${HOST}...`);

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: CANONICAL_URLS,
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'EdLove-Indexer/1.0 (+https://edlove.org)',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok || res.status === 202) {
      console.log(`[IndexNow] Success (${res.status}): IndexNow accepted the URL batch. Distributed to Bing, Naver, Seznam & Cloudflare.`);
    } else {
      const text = await res.text();
      console.warn(`[IndexNow] Warning (${res.status}): ${text || res.statusText}`);
    }
  } catch (err) {
    console.error(`[IndexNow] Error dispatching IndexNow ping:`, err.message);
  }
}

pingIndexNow();
