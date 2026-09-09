import { Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import { WorkflowProvider } from './context/WorkflowContext';
import Overview from './pages/Overview';
import Workflow from './pages/Workflow';
import Simulation from './pages/Simulation';
import Documentation from './pages/Documentation';
import About from './pages/About';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <WorkflowProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Overview />} />
          <Route path="/workflow" element={<Workflow />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </WorkflowProvider>
  );
}
