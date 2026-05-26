import { useTranslation } from '../../hooks/useTranslation.js';
import { md2h } from '../../utils/markdown.js';

/**
 * @param {{ feedback: string }} props
 * @returns {JSX.Element|null}
 */
export default function FeedbackView({ feedback }) {
  const { t } = useTranslation();
  if (!feedback) return null;

  return (
    <div className="ta-section-block" style={{ marginTop: '1rem' }}>
      <p className="slabel">{t('thinkingFinalFbLbl') || '最終フィードバック'}</p>
      <div className="feedback-box" dangerouslySetInnerHTML={{ __html: md2h(feedback) }} />
    </div>
  );
}
