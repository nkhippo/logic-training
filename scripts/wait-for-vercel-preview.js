/**
 * GitHub Actions 用: Vercel Preview デプロイ完了を待ち、URL を GITHUB_OUTPUT に書き出す。
 * GitHub Deployments API で success を確認した時点で URL を返す。
 * Node fetch による HTTP ヘルスチェックは行わない（Deployment Protection 下で redirect loop になるため）。
 * 実際のアクセス確認は Playwright（extraHTTPHeaders で bypass）に任せる。
 */
import fs from 'fs';

const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
const sha = process.env.GITHUB_DEPLOYMENT_SHA || process.env.GITHUB_SHA;
const token = process.env.GITHUB_TOKEN;
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
 * PR head SHA に紐づく Vercel Preview URL を取得する。
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

console.log(`Preview deployment ready: ${previewUrl}`);

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `url=${previewUrl}\n`);
}

console.log(`url=${previewUrl}`);
