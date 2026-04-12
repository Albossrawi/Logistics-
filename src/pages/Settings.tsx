import { useState } from 'react';
import { Bell, Palette, Key, Database, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '../store/appStore';

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={clsx(
        'relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0',
        enabled ? 'bg-primary-600' : 'bg-surface-700'
      )}
      style={{ height: 22 }}
    >
      <span
        className={clsx(
          'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
          enabled ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

export function Settings() {
  const { theme, setTheme } = useAppStore();
  const [settings, setSettings] = useState({
    emailAlerts: true,
    slackAlerts: false,
    smsAlerts: false,
    delayAlerts: true,
    stockAlerts: true,
    costAlerts: true,
    weatherAlerts: true,
    aiInsights: true,
    autoOptimize: false,
    darkMode: theme === 'dark',
    compactView: false,
    animationsEnabled: true,
  });

  const toggle = (key: keyof typeof settings) => {
    const newVal = !settings[key];
    setSettings((prev) => ({ ...prev, [key]: newVal }));
    if (key === 'darkMode') setTheme(newVal ? 'dark' : 'light');
  };

  const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{size?: number; className?: string}>; children: React.ReactNode }) => (
    <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-800">
        <Icon size={16} className="text-primary-400" />
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <div className="divide-y divide-surface-800/50">{children}</div>
    </div>
  );

  const Row = ({ label, desc, settingKey }: { label: string; desc: string; settingKey: keyof typeof settings }) => (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-surface-500 mt-0.5">{desc}</div>
      </div>
      <Toggle enabled={settings[settingKey] as boolean} onChange={() => toggle(settingKey)} />
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-sm text-surface-400 mt-1">Configure your LogisticAI command center</p>
      </div>

      <Section title="Notifications" icon={Bell}>
        <Row label="Email Alerts" desc="Receive alerts via email" settingKey="emailAlerts" />
        <Row label="Slack Integration" desc="Push alerts to Slack workspace" settingKey="slackAlerts" />
        <Row label="SMS Alerts" desc="Critical alerts via SMS" settingKey="smsAlerts" />
      </Section>

      <Section title="Alert Types" icon={Bell}>
        <Row label="Shipment Delays" desc="Alert when shipments exceed ETA" settingKey="delayAlerts" />
        <Row label="Low Stock Warnings" desc="Alert when inventory hits reorder point" settingKey="stockAlerts" />
        <Row label="Cost Spikes" desc="Alert when freight costs increase unexpectedly" settingKey="costAlerts" />
        <Row label="Weather Advisories" desc="Proactive weather impact notifications" settingKey="weatherAlerts" />
      </Section>

      <Section title="AI Features" icon={Zap}>
        <Row label="AI Insights" desc="Proactive AI recommendations on dashboard" settingKey="aiInsights" />
        <Row label="Auto-Optimize Routes" desc="Allow AI to apply low-risk optimizations automatically" settingKey="autoOptimize" />
      </Section>

      <Section title="Appearance" icon={Palette}>
        <Row label="Dark Mode" desc="Use dark theme across the app" settingKey="darkMode" />
        <Row label="Compact View" desc="Reduce spacing for denser data display" settingKey="compactView" />
        <Row label="Animations" desc="Enable UI transitions and animations" settingKey="animationsEnabled" />
      </Section>

      {/* API Key */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-800">
          <Key size={16} className="text-primary-400" />
          <h3 className="font-semibold text-white">API Configuration</h3>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider block mb-2">Anthropic API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="sk-ant-..."
                className="flex-1 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-surface-500 outline-none focus:border-primary-500 transition-colors"
              />
              <button className="px-4 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-lg transition-colors">
                Save
              </button>
            </div>
            <p className="text-xs text-surface-500 mt-1.5">Used for AI-powered insights and logistics assistant</p>
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-800">
          <Database size={16} className="text-primary-400" />
          <h3 className="font-semibold text-white">Data & Integrations</h3>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3">
          {['SAP ERP', 'Salesforce', 'QuickBooks', 'Shopify', 'NetSuite', 'Oracle WMS'].map((integration) => (
            <div key={integration} className="flex items-center justify-between p-3 bg-surface-800 rounded-lg border border-surface-700">
              <span className="text-sm text-surface-300">{integration}</span>
              <span className="text-xs text-surface-500 bg-surface-700 px-2 py-0.5 rounded-full">Connect</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
