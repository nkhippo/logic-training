import { useState } from 'react';
import Header from '../layout/Header.jsx';
import SubTabs from '../layout/SubTabs.jsx';
import BusyOverlay from '../layout/BusyOverlay.jsx';
import Toast from '../layout/Toast.jsx';
import FillTab from './tabs/FillTab.jsx';
import SummaryTab from './tabs/SummaryTab.jsx';
import CritiqueTab from './tabs/CritiqueTab.jsx';
import AmeTab from './tabs/AmeTab.jsx';
import PastList from './past/PastList.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useAppContext } from '../../contexts/AppContext.jsx';

const TABS = [
  { id: 'fill', icon: 'ti-puzzle', labelKey: 'tabFill' },
  { id: 'summary', icon: 'ti-align-left', labelKey: 'tabSum' },
  { id: 'critique', icon: 'ti-message-search', labelKey: 'tabCritique' },
  { id: 'ame', icon: 'ti-umbrella', labelKey: 'tabAme' },
];

/**
 * @returns {JSX.Element}
 */
export default function LogicPage() {
  const [activeTab, setActiveTab] = useState('fill');
  const [subMode, setSubMode] = useState('new');
  const { t } = useTranslation();
  const { state } = useAppContext();
  const busy = !!(state.genBusy || state.gradeBusy);

  return (
    <div className={`app${busy ? ' is-busy' : ''}`}>
      <BusyOverlay />
      <Header page="logic" />
      <div className="tabs no-print">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`ti ${tab.icon}`} /> {t(tab.labelKey)}
          </button>
        ))}
      </div>
      <SubTabs activeMode={subMode} onChange={setSubMode} />
      <div className="tab-content">
        {subMode === 'new' && activeTab === 'fill' && <FillTab />}
        {subMode === 'past' && activeTab === 'fill' && <PastList tab="fill" />}
        {subMode === 'new' && activeTab === 'summary' && <SummaryTab />}
        {subMode === 'past' && activeTab === 'summary' && <PastList tab="summary" />}
        {subMode === 'new' && activeTab === 'critique' && <CritiqueTab />}
        {subMode === 'past' && activeTab === 'critique' && <PastList tab="critique" />}
        {subMode === 'new' && activeTab === 'ame' && <AmeTab />}
        {subMode === 'past' && activeTab === 'ame' && <PastList tab="ame" />}
      </div>
      <Toast />
    </div>
  );
}
