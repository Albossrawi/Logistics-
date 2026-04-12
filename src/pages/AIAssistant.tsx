import { useState, useRef, useEffect } from 'react';
import { Send, BrainCircuit, User, Zap, RefreshCw, Package, TrendingUp, AlertTriangle, Route } from 'lucide-react';
import { clsx } from 'clsx';
import type { ChatMessage } from '../types';
import { shipments, inventoryItems, alerts } from '../data/mockData';

// Simulated AI responses based on query keywords
function generateAIResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('delay') || q.includes('delayed')) {
    const delayed = shipments.filter(s => s.status === 'delayed');
    return `I've analyzed your current shipment data. You have **${delayed.length} delayed shipment(s)**:\n\n${delayed.map(s =>
      `• **${s.trackingNumber}** — ${s.origin.city} → ${s.destination.city} via ${s.carrier}\n  Currently at: ${s.currentLocation.city}\n  Latest update: ${s.events[s.events.length-1]?.description}`
    ).join('\n\n')}\n\n**Recommendations:**\n1. Contact ${delayed[0]?.carrier} directly for expedited rescheduling\n2. Consider air freight alternatives for critical parts (${delayed[0]?.category})\n3. Notify ${delayed[0]?.customer} of expected delay and revised ETA\n\nShall I draft a customer communication or explore alternative routing options?`;
  }

  if (q.includes('inventory') || q.includes('stock') || q.includes('reorder')) {
    const critical = inventoryItems.filter(i => i.quantity <= i.minStock);
    const low = inventoryItems.filter(i => i.quantity <= i.reorderPoint && i.quantity > i.minStock);
    return `**Inventory Health Report:**\n\n🔴 **Critical (${critical.length} items):**\n${critical.map(i => `• ${i.name} (${i.sku}): ${i.daysOfStock} days remaining — reorder ASAP from ${i.supplier}`).join('\n')}\n\n🟡 **Low Stock (${low.length} items):**\n${low.map(i => `• ${i.name}: ${i.daysOfStock} days remaining`).join('\n')}\n\n**AI Recommendations:**\n• Place emergency order for GPU RTX 4090 — only 4 days of stock with lead time of ~7 days\n• Brake Assembly Kit at 7 days — below minimum threshold, initiate reorder immediately\n• Consider safety stock adjustments for Electronics category given current supply chain volatility\n\nWould you like me to generate purchase orders for the critical items?`;
  }

  if (q.includes('cost') || q.includes('saving') || q.includes('optimize') || q.includes('route')) {
    return `**Cost Optimization Analysis:**\n\nI've identified **$92,500 in monthly savings** across 3 key route optimizations:\n\n1. **Shanghai → LA (Sea)**: Switch to direct Panama Canal route\n   - Savings: $27,000 (14.6%) | 3 days faster\n   - Confidence: 91%\n\n2. **Frankfurt → NY (Air→Sea)**: Downgrade non-critical freight\n   - Savings: $13,500 (26%) | Accept +1 day transit\n   - Confidence: 87%\n\n3. **Rotterdam → Singapore**: Bundle with 3 other POs\n   - Savings: $52,000 (12.4%) via Cape of Good Hope\n   - Confidence: 78%\n\n**Immediate Actions:**\n• Pre-book Shanghai-LA direct vessel for Q3 (rates rising 22% this week)\n• Consolidate FRA-NYC shipments — next window is April 15\n\nShall I apply any of these optimizations or generate a detailed carrier comparison?`;
  }

  if (q.includes('carrier') || q.includes('performance') || q.includes('dhl') || q.includes('fedex') || q.includes('maersk')) {
    return `**Carrier Performance Summary (Last 30 Days):**\n\n| Carrier | On-Time | Avg Transit | Cost/kg |\n|---------|---------|-------------|----------|\n| DHL Express | **97.8%** ✅ | 2.3 days | $8.20 |\n| FedEx | 96.1% ✅ | 3.1 days | $7.80 |\n| UPS | 95.4% ✅ | 3.4 days | $7.20 |\n| Maersk | 94.2% ✅ | 18.5 days | $0.45 |\n| Korean Air | 92.3% ⚠️ | 4.2 days | $6.90 |\n| MSC | **88.6%** 🔴 | 22.1 days | $0.32 |\n\n**Key Insights:**\n• MSC performance declined 2.4% — consider diversifying sea freight to Maersk\n• Korean Air improving (+3.2%) — good for Asia-Pacific lanes\n• DHL remains premium performer but 14% more expensive than UPS for comparable routes\n\nWould you like a detailed lane-by-lane analysis or contract renegotiation recommendations?`;
  }

  if (q.includes('forecast') || q.includes('demand') || q.includes('predict')) {
    return `**Demand Forecast — Next 30 Days:**\n\nBased on historical patterns, seasonality, and current order pipeline:\n\n📈 **High Growth Categories:**\n• Electronics: +18% demand increase expected (Q2 peak season)\n• Medical Supplies: +12% (steady growth trend)\n\n📉 **Declining Categories:**\n• Textiles: -8% (post-spring season slowdown)\n\n**Inventory Recommendations:**\n• Increase Electronics safety stock by 25% — current 4-day GPU stock is critically low\n• Pre-position Motherboards at LA-WH01 before demand spike (forecast: 32 days → ~20 days)\n• Reduce food grain buffer — inventory turnover at 9.6x, carrying costs high\n\n**Supply Chain Risk:**\n• 🌊 Typhoon Mia forming near Philippines — potential 5-7 day disruption to Asia-Pacific routes\n• 📈 Shanghai-LA freight rates up 22% — lock in contracts within 2 weeks\n\nShall I run a scenario analysis for the typhoon impact?`;
  }

  if (q.includes('kpi') || q.includes('performance') || q.includes('metric') || q.includes('dashboard')) {
    return `**Operations KPI Summary:**\n\n✅ **On-Time Delivery: 94.8%** (+2.1% MoM) — Above industry average of 92%\n📦 **Active Shipments: 842** (+12.4% MoM) — Healthy growth\n💰 **Freight Cost: $2.4M** (-3.2% MoM) — Good trend, target $2.2M\n⚠️ **Delayed Shipments: 43** (-18.5% MoM) — Significant improvement!\n🔄 **Inventory Turnover: 7.4x** (+0.8x MoM) — Above target\n🏭 **Warehouse Utilization: 78.3%** — Approaching optimal range (70-85%)\n\n**Focus Areas This Week:**\n1. Resolve 1 critical delayed shipment (TRK-2024-88422)\n2. Replenish 2 critical inventory items\n3. Finalize customs docs for TRK-2024-88426\n\nOverall operations score: **87/100** — Strong performance. The main drag is the Frankfurt shipment delay.\n\nWhat area would you like to deep-dive into?`;
  }

  if (q.includes('alert') || q.includes('urgent') || q.includes('critical')) {
    const unread = alerts.filter(a => !a.read);
    return `**Active Alerts Requiring Attention (${unread.length}):**\n\n${unread.map((a, i) => `${i+1}. **${a.severity === 'error' ? '🔴' : '🟡'} ${a.title}**\n   ${a.message}`).join('\n\n')}\n\n**Priority Actions:**\n1. **Immediate**: Address GPU stock — 4 days remaining, 7-day lead time means you're already late\n2. **Today**: Resolve Frankfurt customs/rescheduling for TRK-2024-88422\n3. **This Week**: Pre-book freight capacity before rate spike solidifies\n\nShall I help prioritize and create action items for each alert?`;
  }

  // Default helpful response
  return `I'm your AI Logistics Assistant, trained on your supply chain data. I can help you with:\n\n📦 **Shipment Tracking** — Real-time status and delay analysis\n📊 **Inventory Management** — Stock levels, forecasts, and reorder recommendations\n🚛 **Carrier Performance** — Benchmarking and optimization\n🗺️ **Route Optimization** — Cost reduction and transit time improvements\n📈 **Demand Forecasting** — AI-powered predictions and scenario planning\n⚠️ **Risk Alerts** — Proactive issue detection and mitigation\n\n**Try asking me:**\n• "What shipments are delayed?"\n• "Which inventory items need restocking?"\n• "How can I reduce freight costs?"\n• "Show me carrier performance"\n• "What's my demand forecast for next month?"\n\nWhat would you like to explore?`;
}

const SUGGESTED_PROMPTS = [
  { icon: AlertTriangle, text: 'What shipments are currently delayed?', color: 'text-rose-400' },
  { icon: Package, text: 'Which inventory items need reordering?', color: 'text-amber-400' },
  { icon: Route, text: 'How can I optimize freight costs?', color: 'text-emerald-400' },
  { icon: TrendingUp, text: 'Give me a full KPI summary', color: 'text-blue-400' },
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center flex-shrink-0">
        <BrainCircuit size={14} className="text-white" />
      </div>
      <div className="bg-surface-800 border border-surface-700 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-primary-400 rounded-full typing-dot"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Message({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';

  // Simple markdown-ish renderer
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part
          )}
          {i < content.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className={clsx('flex items-end gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={clsx(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        isUser
          ? 'bg-gradient-to-br from-primary-500 to-accent-violet'
          : 'bg-gradient-to-br from-primary-500 to-accent-cyan'
      )}>
        {isUser ? <User size={14} className="text-white" /> : <BrainCircuit size={14} className="text-white" />}
      </div>

      {/* Bubble */}
      <div className={clsx(
        'max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
        isUser
          ? 'bg-primary-600 text-white rounded-br-sm'
          : 'bg-surface-800 border border-surface-700 text-surface-200 rounded-bl-sm'
      )}>
        <div className="whitespace-pre-wrap">{renderContent(msg.content)}</div>
        <div className={clsx('text-xs mt-1.5', isUser ? 'text-primary-300' : 'text-surface-500')}>
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Hello! I'm **LogisticAI**, your intelligent supply chain assistant. I have real-time access to your shipment data, inventory levels, carrier performance, and cost analytics.\n\nI can help you track shipments, identify risks, optimize routes, forecast demand, and much more. What would you like to know?`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking time
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

    const response = generateAIResponse(text);
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '0',
      role: 'assistant',
      content: `Chat cleared. Ready to help! Ask me about shipments, inventory, costs, or any logistics challenge.`,
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in" style={{ height: 'calc(100vh - 160px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shadow-glow-blue">
            <BrainCircuit size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white">LogisticAI Assistant</h2>
            <div className="flex items-center gap-1.5 text-xs text-surface-400">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Powered by Claude • Real-time data access
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="flex items-center gap-2 px-3 py-1.5 bg-surface-800 hover:bg-surface-700 border border-surface-700 rounded-lg text-xs text-surface-400 hover:text-white transition-all">
          <RefreshCw size={12} />
          Clear Chat
        </button>
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {SUGGESTED_PROMPTS.map(({ icon: Icon, text, color }) => (
            <button
              key={text}
              onClick={() => sendMessage(text)}
              className="flex items-center gap-2 p-3 bg-surface-900 border border-surface-800 hover:border-primary-500/40 rounded-xl text-left text-xs text-surface-300 hover:text-white transition-all group"
            >
              <Icon size={14} className={clsx(color, 'flex-shrink-0')} />
              <span>{text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4 min-h-0">
        {messages.map((msg) => (
          <Message key={msg.id} msg={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-surface-800">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1 bg-surface-800 border border-surface-700 focus-within:border-primary-500 rounded-xl transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about shipments, inventory, costs, forecasts..."
              rows={1}
              className="w-full bg-transparent text-sm text-white placeholder-surface-500 outline-none px-4 py-3 resize-none leading-relaxed"
              style={{ maxHeight: 120 }}
            />
            <div className="flex items-center justify-between px-3 pb-2">
              <span className="text-xs text-surface-500">Press Enter to send, Shift+Enter for new line</span>
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-primary-500" />
                <span className="text-xs text-primary-500">Claude-powered</span>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className={clsx(
              'w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0',
              input.trim() && !isTyping
                ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-glow-blue'
                : 'bg-surface-800 text-surface-600 cursor-not-allowed'
            )}
          >
            <Send size={16} />
          </button>
        </form>

        {/* Context chips */}
        <div className="flex flex-wrap gap-2 mt-2">
          {['Delayed shipments', 'Low stock items', 'Cost optimization', 'Carrier performance', 'Demand forecast'].map((chip) => (
            <button
              key={chip}
              onClick={() => sendMessage(chip)}
              className="text-xs text-surface-400 hover:text-white bg-surface-800/50 hover:bg-surface-800 px-2.5 py-1 rounded-full border border-surface-700/50 hover:border-surface-600 transition-all"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
