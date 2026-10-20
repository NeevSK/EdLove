import { SITE_URL } from '../app/seo';

export const INDEXNOW_KEY = '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d';
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

export interface IndexNowResult {
  success: boolean;
  status: number;
  message: string;
}

/**
 * Submits an array of URLs to the IndexNow protocol (instant push to Bing, Yandex, Seznam, Naver).
 * Max 10,000 URLs per batch according to the IndexNow specification.
 */
export async function submitIndexNowUrls(
  urls: readonly string[],
  key: string = INDEXNOW_KEY,
  baseUrl: string = SITE_URL,
): Promise<IndexNowResult> {
  if (urls.length === 0) {
    return { success: true, status: 200, message: 'No URLs provided for submission.' };
  }

  const host = new URL(baseUrl).hostname;
  const keyLocation = `${baseUrl}/${key}.txt`;

  const payload: IndexNowPayload = {
    host,
    key,
    keyLocation,
    urlList: [...urls],
  };

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 202) {
      return {
        success: true,
        status: response.status,
        message: `Successfully submitted ${urls.length} URLs to IndexNow (Status: ${response.status}).`,
      };
    }

    const errorText = await response.text().catch(() => '');
    return {
      success: false,
      status: response.status,
      message: `IndexNow submission returned error status ${response.status}: ${errorText}`,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: error instanceof Error ? error.message : 'Unknown network failure during IndexNow submission.',
    };
  }
}
