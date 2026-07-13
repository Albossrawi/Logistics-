import { useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { LabelExtractor } from './pages/LabelExtractor';

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  }, []);

  return (
    <Layout>
      <LabelExtractor />
    </Layout>
  );
}

export default App;
