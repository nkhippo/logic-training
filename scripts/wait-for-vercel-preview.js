/**
 * GitHub Actions 用: Vercel Preview デプロイ完了を待ち、URL を GITHUB_OUTPUT に書き出す。
 * Deployment Protection 有効時は VERCEL_AUTOMATION_BYPASS_SECRET ヘッダーで 401 を回避する。
 */
import fs from 'fs';

const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
const sha = process.env.GITHUB_DEPLOYMENT_SHA || process.env.GITHUB_SHA;
const token = process.env.GITHUB_TOKEN;
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '';
const maxTimeoutSec = Number.parseInt(process.env.MAX_TIMEOUT || '120', 10);
const checkIntervalMs = Number.parseInt(process.env.CHECK_INTERVAL_MS || '2000', 10);

if (!token) {
  console.error('GITHUB_TOKEN is required');
  process.exit(1);
}

if (!sha) {
  console.error('GITHUB_DEPLOYMENT_SHA or GITHUB_SHA is required');
  process.exit(1);
}

/**
 * @param {string} path
 * @returns {Promise<unknown>}
 */
async function githubApi(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API ${path} failed: ${response.status}`);
  }

  return response.json();
}

/**
 * PR  head SHA に紐づく Vercel Preview URL を取得する。
 * @returns {Promise<string | null>}
 */
async function findPreviewUrl() {
  const deployments = await githubApi(
    `/repos/${owner}/${repo}/deployments?sha=${sha}&per_page=20`
  );

  for (const deployment of deployments) {
    const statuses = await githubApi(
      `/repos/${owner}/${repo}/deployments/${deployment.id}/statuses?per_page=10`
    );

    const successStatus = statuses.find(
      (status) => status.state === 'success' && status.environment_url
    );

    if (successStatus?.environment_url) {
      return successStatus.environment_url.replace(/\/$/, '');
    }
  }

  return null;
}

/**
 * Bypass 用クエリパラメータ付き URL を返す（Node fetch の redirect loop 回避）。
 * @param {string} url
 * @returns {string}
 */
function withBypassQuery(url) {
  if (!bypassSecret) return url;
  const parsed = new URL(url);
  parsed.searchParams.set('x-vercel-protection-bypass', bypassSecret);
  parsed.searchParams.set('x-vercel-set-bypass-cookie', 'true');
  return parsed.toString();
}

/**
 * Preview URL が 200 を返すまで待機する。
 * @param {string} url
 * @returns {Promise<void>}
 */
async function waitUntilReady(url) {
  const pollUrl = withBypassQuery(url);
  const headers = {};
  if (bypassSecret) {
    headers['x-vercel-protection-bypass'] = bypassSecret;
    headers['x-vercel-set-bypass-cookie'] = 'true';
  }

  const deadline = Date.now() + maxTimeoutSec * 1000;
  let attempt = 0;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(pollUrl, { headers, redirect: 'follow' });
      if (response.status === 200) {
        console.log(`Preview ready: ${url} (attempt ${attempt})`);
        return;
      }
      console.log(`GET status: ${response.status}. Attempt ${attempt}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`GET failed: ${message}. Attempt ${attempt}`);
    }

    attempt += 1;
    await new Promise((resolve) => setTimeout(resolve, checkIntervalMs));
  }

  throw new Error(`Timeout waiting for ${url}`);
}

const previewDeadline = Date.now() + maxTimeoutSec * 1000;
let previewUrl = null;

while (!previewUrl && Date.now() < previewDeadline) {
  previewUrl = await findPreviewUrl();
  if (!previewUrl) {
    console.log('Preview deployment not found yet, retrying...');
    await new Promise((resolve) => setTimeout(resolve, checkIntervalMs));
  }
}

if (!previewUrl) {
  throw new Error(`No Vercel Preview deployment found for sha ${sha}`);
}

console.log(`Found preview URL: ${previewUrl}`);
await waitUntilReady(previewUrl);

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `url=${previewUrl}\n`);
}

console.log(`url=${previewUrl}`);
