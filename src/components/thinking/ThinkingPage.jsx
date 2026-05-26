import { useState } from 'react';
import Header from '../layout/Header.jsx';
import SubTabs from '../layout/SubTabs.jsx';
import BusyOverlay from '../layout/BusyOverlay.jsx';
import Toast from '../layout/Toast.jsx';
import GenerateForm from './GenerateForm.jsx';
import ProblemView from './ProblemView.jsx';
import ThinkingPastList from './ThinkingPastList.jsx';
import { useAppContext } from '../../contexts/AppContext.jsx';

/**
 * @returns {JSX.Element}
 */
export default function ThinkingPage() {
  const [subMode, setSubMode] = useState('new');
  const { state } = useAppContext();
  const busy = !!(state.genBusy || state.gradeBusy);

  return (
    <div className={`app${busy ? ' is-busy' : ''}`}>
      <BusyOverlay />
      <Header page="thinking" />
      <SubTabs activeMode={subMode} onChange={setSubMode} />
      {subMode === 'new' ? (
        <div id="thinking-new-area">
          <GenerateForm />
          {state.thinking && <ProblemView />}
        </div>
      ) : (
        <ThinkingPastList />
      )}
      <Toast />
    </div>
  );
}
