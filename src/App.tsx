import { useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Shipments } from './pages/Shipments';
import { Inventory } from './pages/Inventory';
import { Carriers } from './pages/Carriers';
import { SupplyChain } from './pages/SupplyChain';
import { RouteOptimizer } from './pages/RouteOptimizer';
import { Analytics } from './pages/Analytics';
import { AIAssistant } from './pages/AIAssistant';
import { Settings } from './pages/Settings';
import { LabelExtractor } from './pages/LabelExtractor';
import { useAppStore } from './store/appStore';

function PageContent() {
  const { activePage } = useAppStore();

  switch (activePage) {
    case 'labels':      return <LabelExtractor />;
    case 'dashboard':   return <Dashboard />;
    case 'shipments':   return <Shipments />;
    case 'inventory':   return <Inventory />;
    case 'carriers':    return <Carriers />;
    case 'supplychain': return <SupplyChain />;
    case 'routes':      return <RouteOptimizer />;
    case 'analytics':   return <Analytics />;
    case 'ai':          return <AIAssistant />;
    case 'map':         return <SupplyChain />;
    case 'settings':    return <Settings />;
    default:            return <LabelExtractor />;
  }
}

function App() {
  const { theme } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return (
    <Layout>
      <PageContent />
    </Layout>
  );
}

export default App;
