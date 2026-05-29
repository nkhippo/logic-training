import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation.js';
import { md2h } from '../../utils/markdown.js';

const GUIDE_TABS = [
  { key: 'overview', labelKey: 'gTabOverview' },
  { key: 'fill', labelKey: 'gTabFill' },
  { key: 'summary', labelKey: 'gTabSummary' },
  { key: 'critique', labelKey: 'gTabCritique' },
  { key: 'ame', labelKey: 'gTabAme' },
];

const guideModules = import.meta.glob('../../../guide/**/*.md', {
  query: '?raw',
  import: 'default',
});

/**
 * @param {string} text
 * @returns {boolean}
 */
function isHtmlFallback(text) {
  return /^\s*<!doctype html/i.test(text) || /^\s*<html[\s>]/i.test(text);
}

/**
 * @param {string} lang
 * @param {string} tabKey
 * @returns {string[]}
 */
function getGuideUrls(lang, tabKey) {
  if (lang === 'en') return [`/guide/en/${tabKey}.md`];
  return [`/guide/ja/${tabKey}.md`, `/guide/${tabKey}.md`];
}

/**
 * @param {string} lang
 * @param {string} tabKey
 * @returns {string[]}
 */
function getGuideImportPaths(lang, tabKey) {
  if (lang === 'en') return [`../../../guide/en/${tabKey}.md`];
  return [`../../../guide/ja/${tabKey}.md`, `../../../guide/${tabKey}.md`];
}

/**
 * @param {string} lang
 * @param {string} tabKey
 * @returns {Promise<string|null>}
 */
async function fetchGuide(lang, tabKey) {
  const urls = getGuideUrls(lang, tabKey);
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const text = await res.text();
      if (!isHtmlFallback(text)) return text;
    } catch {
      // Continue to bundled Markdown fallback below.
    }
  }

  const paths = getGuideImportPaths(lang, tabKey);
  for (const path of paths) {
    const load = guideModules[path];
    if (!load) continue;
    try {
      return await load();
    } catch {
      // Try the next candidate path.
    }
  }

  return null;
}

/**
 * @param {{ onClose: Function }} props
 * @returns {JSX.Element}
 */
export default function GuideModal({ onClose }) {
  const { t, lang } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [content, setContent] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const cacheRef = useRef({});
  const langKey = lang === 'en' ? 'en' : 'ja';

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    const cacheKey = `${langKey}:${activeTab}`;

    async function loadGuide() {
      setLoading(true);
      setError(false);

      if (cacheRef.current[cacheKey]) {
        setContent(cacheRef.current[cacheKey]);
        setLoading(false);
        return;
      }

      const markdown = await fetchGuide(langKey, activeTab);
      if (cancelled) return;

      if (!markdown) {
        setContent('');
        setError(true);
        setLoading(false);
        return;
      }

      cacheRef.current[cacheKey] = markdown;
      setContent(markdown);
      setLoading(false);
    }

    loadGuide();

    return () => {
      cancelled = true;
    };
  }, [activeTab, langKey]);

  return (
    <div className="guide-overlay no-print show" onClick={onClose} role="presentation">
      <div
        className="guide-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-modal-title"
      >
        <div className="guide-modal-header">
          <span className="guide-modal-title" id="guide-modal-title">
            {t('guideTitle')}
          </span>
          <button type="button" className="guide-close-btn" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>
        <div className="guide-tabs" role="tablist" aria-label={t('guideTitle')}>
          {GUIDE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`guide-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              role="tab"
              aria-selected={activeTab === tab.key}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
        <div className="guide-body" id="guide-body">
          {loading && <p className="guide-loading">{t('guideLoading')}</p>}
          {!loading && error && (
            <p className="guide-loading" style={{ color: '#c0453a' }}>
              {t('guideError')}
            </p>
          )}
          {!loading && !error && (
            <div dangerouslySetInnerHTML={{ __html: md2h(content, langKey) }} />
          )}
        </div>
      </div>
    </div>
  );
}
