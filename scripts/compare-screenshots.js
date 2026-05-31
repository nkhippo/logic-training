import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import sharp from 'sharp';

const baselineDir = process.env.BASELINE_DIR || 'screenshots-baseline';
const currentDir = process.env.CURRENT_DIR || 'screenshots';
const diffDir = process.env.DIFF_DIR || 'screenshots-diff';
const baselineRef = process.env.BASELINE_REF || 'screenshots/develop';
const THRESHOLD = 0.1;
const OK_MAX_PERCENT = 1;
const WARN_MAX_PERCENT = 15;
const LOCALIZED_BBOX_MAX_RATIO = 0.2;
const LABEL_HEIGHT = 28;

/** @typedef {'ok' | 'env_diff' | 'ui_change' | 'critical'} Classification */

/**
 * @typedef {{
 *   name: string,
 *   fileName: string,
 *   diffPercent: number,
 *   diffPixels: number,
 *   totalPixels: number,
 *   classification: Classification,
 *   judgment: string,
 *   recommendation: string,
 *   localized?: boolean,
 *   bbox?: { minX: number, minY: number, maxX: number, maxY: number },
 *   missingBaseline?: boolean,
 *   dimensionMismatch?: boolean,
 * }} PageReport
 */

/**
 * PNG ファイルを読み込む。
 * @param {string} filePath
 * @returns {PNG}
 */
function readPng(filePath) {
  return PNG.sync.read(fs.readFileSync(filePath));
}

/**
 * ファイル名からルートパス表示名を返す。
 * @param {string} fileName
 * @returns {string}
 */
function toRouteName(fileName) {
  const base = fileName.replace(/\.png$/, '');
  return `/${base}`;
}

/**
 * 差分マスクから局所集中のバウンディングボックスを算出する。
 * @param {PNG} diff
 * @returns {{ localized: boolean, bbox: { minX: number, minY: number, maxX: number, maxY: number } | null }}
 */
function analyzeDiffDistribution(diff) {
  const { width, height } = diff;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let diffPixelCount = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (width * y + x) * 4;
      if (diff.data[idx + 3] > 0) {
        diffPixelCount += 1;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (diffPixelCount === 0) {
    return { localized: false, bbox: null };
  }

  const bboxWidth = maxX - minX + 1;
  const bboxHeight = maxY - minY + 1;
  const bboxArea = bboxWidth * bboxHeight;
  const screenArea = width * height;
  const localized = bboxArea / screenArea <= LOCALIZED_BBOX_MAX_RATIO;

  return {
    localized,
    bbox: { minX, minY, maxX, maxY },
  };
}

/**
 * 差分率と分布から分類・推奨アクションを返す。
 * @param {number} diffPercent
 * @param {boolean} localized
 * @param {{ dimensionMismatch?: boolean, missingBaseline?: boolean }} flags
 * @returns {{ classification: Classification, judgment: string, recommendation: string }}
 */
function classifyPage(diffPercent, localized, flags = {}) {
  if (flags.missingBaseline || flags.dimensionMismatch || diffPercent >= WARN_MAX_PERCENT) {
    return {
      classification: 'critical',
      judgment: '❌ 重大な差分',
      recommendation: 'Claude/Naoyaと方針確認',
    };
  }

  if (diffPercent < OK_MAX_PERCENT) {
    return {
      classification: 'ok',
      judgment: '✅ 正常',
      recommendation: '対応不要',
    };
  }

  if (localized) {
    return {
      classification: 'ui_change',
      judgment: '⚠️ UI変更の疑い',
      recommendation: '修正依頼または意図確認',
    };
  }

  return {
    classification: 'env_diff',
    judgment: '⚠️ 環境差の可能性',
    recommendation: 'Naoya/Claudeで判断',
  };
}

/**
 * 2 枚の PNG を pixelmatch で比較する。
 * @param {PNG} baseline
 * @param {PNG} current
 * @param {string} diffPath
 * @returns {{ diffPixels: number, totalPixels: number, diffPercent: number, localized: boolean, bbox: PageReport['bbox'] }}
 */
function compareImages(baseline, current, diffPath) {
  if (baseline.width !== current.width || baseline.height !== current.height) {
    const totalPixels = Math.max(baseline.width * baseline.height, current.width * current.height);
    return {
      diffPixels: totalPixels,
      totalPixels,
      diffPercent: 100,
      localized: false,
      bbox: null,
    };
  }

  const diff = new PNG({ width: baseline.width, height: baseline.height });
  const diffPixels = pixelmatch(
    baseline.data,
    current.data,
    diff.data,
    baseline.width,
    baseline.height,
    { threshold: THRESHOLD }
  );
  const totalPixels = baseline.width * baseline.height;
  const diffPercent = totalPixels === 0
    ? 0
    : Number(((diffPixels / totalPixels) * 100).toFixed(2));

  const { localized, bbox } = analyzeDiffDistribution(diff);

  if (diffPixels > 0) {
    fs.mkdirSync(path.dirname(diffPath), { recursive: true });
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
  }

  return { diffPixels, totalPixels, diffPercent, localized, bbox };
}

/**
 * ラベル付き1列画像を生成する。
 * @param {string} imagePath
 * @param {string} label
 * @param {number} width
 * @param {number} height
 * @returns {Promise<Buffer>}
 */
async function buildLabeledColumn(imagePath, label, width, height) {
  const resized = await sharp(imagePath)
    .resize(width, height, { fit: 'fill' })
    .png()
    .toBuffer();

  const labelSvg = Buffer.from(
    `<svg width="${width}" height="${LABEL_HEIGHT}">
      <rect width="100%" height="100%" fill="#1e293b"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        fill="#f8fafc" font-family="sans-serif" font-size="14">${label}</text>
    </svg>`
  );

  return sharp({
    create: {
      width,
      height: height + LABEL_HEIGHT,
      channels: 4,
      background: { r: 30, g: 41, b: 59, alpha: 1 },
    },
  })
    .composite([
      { input: labelSvg, top: 0, left: 0 },
      { input: resized, top: LABEL_HEIGHT, left: 0 },
    ])
    .png()
    .toBuffer();
}

/**
 * 基準・今回・差分の3列合成画像を生成する。
 * @param {string} baselinePath
 * @param {string} currentPath
 * @param {string} diffPath
 * @param {string} outputPath
 */
async function createCompareImage(baselinePath, currentPath, diffPath, outputPath) {
  const meta = await sharp(baselinePath).metadata();
  const width = meta.width ?? 1280;
  const height = meta.height ?? 720;
  const gap = 8;

  const diffSource = fs.existsSync(diffPath) ? diffPath : currentPath;

  const [left, center, right] = await Promise.all([
    buildLabeledColumn(baselinePath, '基準', width, height),
    buildLabeledColumn(currentPath, '今回', width, height),
    buildLabeledColumn(diffSource, '差分', width, height),
  ]);

  const totalWidth = width * 3 + gap * 4;
  const totalHeight = height + LABEL_HEIGHT;

  await sharp({
    create: {
      width: totalWidth,
      height: totalHeight,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 },
    },
  })
    .composite([
      { input: left, left: gap, top: 0 },
      { input: center, left: gap * 2 + width, top: 0 },
      { input: right, left: gap * 3 + width * 2, top: 0 },
    ])
    .png()
    .toFile(outputPath);
}

/** @type {PageReport[]} */
const pages = [];

fs.mkdirSync(diffDir, { recursive: true });

if (!fs.existsSync(currentDir)) {
  console.error(`Current screenshots directory not found: ${currentDir}`);
  process.exit(1);
}

const files = fs.readdirSync(currentDir).filter((file) => file.endsWith('.png'));

for (const fileName of files) {
  const baselinePath = path.join(baselineDir, fileName);
  const currentPath = path.join(currentDir, fileName);
  const routeName = toRouteName(fileName);

  if (!fs.existsSync(baselinePath)) {
    const meta = classifyPage(100, false, { missingBaseline: true });
    pages.push({
      name: routeName,
      fileName,
      diffPercent: 100,
      diffPixels: -1,
      totalPixels: 0,
      missingBaseline: true,
      localized: false,
      ...meta,
    });
    continue;
  }

  const baseline = readPng(baselinePath);
  const current = readPng(currentPath);
  const diffPath = path.join(diffDir, fileName.replace('.png', '-diff.png'));
  const result = compareImages(baseline, current, diffPath);
  const dimensionMismatch = result.diffPercent === 100
    && (baseline.width !== current.width || baseline.height !== current.height);
  const meta = classifyPage(result.diffPercent, result.localized, { dimensionMismatch });

  pages.push({
    name: routeName,
    fileName,
    diffPixels: result.diffPixels,
    totalPixels: result.totalPixels,
    diffPercent: result.diffPercent,
    localized: result.localized,
    bbox: result.bbox ?? undefined,
    ...(dimensionMismatch ? { dimensionMismatch: true } : {}),
    ...meta,
  });

  const comparePath = path.join(diffDir, fileName.replace('.png', '-compare.png'));
  await createCompareImage(baselinePath, currentPath, diffPath, comparePath);
}

fs.writeFileSync(
  path.join(diffDir, 'report.json'),
  JSON.stringify({ baselineRef, pages }, null, 2)
);

for (const page of pages) {
  console.log(`${page.judgment} ${page.name} — diff: ${page.diffPercent}% (${page.recommendation})`);
}
