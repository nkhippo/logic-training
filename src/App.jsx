import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext.jsx';
import LogicPage from './components/logic/LogicPage.jsx';
import ThinkingPage from './components/thinking/ThinkingPage.jsx';

/**
 * @returns {JSX.Element}
 */
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/logic" replace />} />
          <Route path="/logic" element={<LogicPage />} />
          <Route path="/thinking" element={<ThinkingPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
