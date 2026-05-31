import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const baselineDir = process.env.BASELINE_DIR || 'screenshots-baseline/screenshots';
const currentDir = process.env.CURRENT_DIR || 'screenshots';
const diffDir = process.env.DIFF_DIR || 'screenshots-diff';
const THRESHOLD = 0.1;

/** @typedef {{ name: string, fileName: string, diffPercent: number, diffPixels: number, totalPixels: number, missingBaseline?: boolean, dimensionMismatch?: boolean }} PageReport */

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
 * 2 枚の PNG を pixelmatch で比較する。
 * @param {PNG} baseline
 * @param {PNG} current
 * @param {string} diffPath
 * @returns {{ diffPixels: number, totalPixels: number, diffPercent: number }}
 */
function compareImages(baseline, current, diffPath) {
  if (baseline.width !== current.width || baseline.height !== current.height) {
    const totalPixels = Math.max(baseline.width * baseline.height, current.width * current.height);
    return { diffPixels: totalPixels, totalPixels, diffPercent: 100 };
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

  if (diffPixels > 0) {
    fs.mkdirSync(path.dirname(diffPath), { recursive: true });
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
  }

  return { diffPixels, totalPixels, diffPercent };
}

/** @type {PageReport[]} */
const pages = [];

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
    pages.push({
      name: routeName,
      fileName,
      diffPercent: 100,
      diffPixels: -1,
      totalPixels: 0,
      missingBaseline: true,
    });
    continue;
  }

  const baseline = readPng(baselinePath);
  const current = readPng(currentPath);
  const diffPath = path.join(diffDir, fileName.replace('.png', '-diff.png'));
  const result = compareImages(baseline, current, diffPath);

  pages.push({
    name: routeName,
    fileName,
    ...result,
    ...(result.diffPercent === 100 && (baseline.width !== current.width || baseline.height !== current.height)
      ? { dimensionMismatch: true }
      : {}),
  });
}

fs.mkdirSync(diffDir, { recursive: true });
fs.writeFileSync(path.join(diffDir, 'report.json'), JSON.stringify({ pages }, null, 2));

for (const page of pages) {
  const icon = page.diffPercent === 0 ? '✅' : '⚠️';
  console.log(`${icon} ${page.name} — diff: ${page.diffPercent}%`);
}
