import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Trash2 } from 'lucide-react';
import { chatbotApi } from '@/lib/api';
import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';

const QUICK_PROMPTS = [
  "Which gate is overcrowded right now?",
  "Summarize today's operations",
  "What's the parking situation?",
  "Any medical incidents today?",
  "How are the food court queues?",
  "What's the current weather alert?",
];

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex gap-3 animate-fade-in', isUser && 'flex-row-reverse')}>
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
        isUser ? 'bg-blue-600' : 'bg-slate-700')}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-blue-400" />}
      </div>
      <div className={cn('max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
        isUser ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/50'
      )}>
        {msg.content}
        <div className={cn('text-xs mt-1', isUser ? 'text-blue-200' : 'text-slate-500')}>
          {msg.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "👋 Hi! I'm **StadiumOps AI**, your intelligent stadium operations assistant.\n\nI have real-time access to:\n• Crowd density across all zones\n• Active incident reports\n• Parking availability\n• Food court queue times\n• Volunteer deployment\n• Weather conditions\n\nHow can I help you manage today's operations?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;
    setInput('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: msgText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await chatbotApi.chat(msgText);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date(res.data.timestamp),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      // Mock response
      const mockResponses: Record<string, string> = {
        'overcrowd': 'Based on current data, **East Wing** is the most overcrowded at 94% capacity (Red status). Recommend redirecting fans to West Gate immediately.',
        'parking': '🚗 Parking update:\n• Lot A (VIP): 87% — Near full\n• Lot B (Main): 62% — Available\n• Lot C (East): 45% — Available\n• Lot D (Remote): 23% — Open\n\nRecommend directing new arrivals to Lots C & D.',
        'summar': '📊 **Operations Summary**\n\nAttendance: 45,230 (70% capacity)\nActive Incidents: 3 (Medical, Security, Maintenance)\nParking: 58% occupied, 1,240 spaces free\nAvg Queue: 8.5 min\nWeather: 28°C, manageable\n\nOverall: Operations running normally with minor congestion in East Wing.',
        'medical': '🏥 Medical Update:\n\n1 active medical incident in North Stand (heat exhaustion - being treated)\n4 medical units on standby across the venue\n\nNo critical emergencies at this time.',
        'food': '🍔 Food Court Status:\n• Zone A Grill: 22 min wait ⚠️\n• North Concession: 12 min wait\n• VIP Restaurant: 4 min wait ✅\n• East Snack Bar: 18 min wait ⚠️\n\nRecommend opening backup counters at Zone A.',
        'weather': '🌤 Weather: 28°C, Partly Cloudy\nHumidity: 65% | Wind: 12 km/h\n\nConditions manageable. Monitor for temperature rise in next 2 hours.',
      };
      const key = Object.keys(mockResponses).find(k => msgText.toLowerCase().includes(k));
      const content = key ? mockResponses[key] : "I'm here to help with stadium operations! Ask me about crowd levels, parking, incidents, food courts, volunteers, or weather.";
      setMessages(prev => [...prev, { id: `mock-${Date.now()}`, role: 'assistant', content, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
      {/* Header */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              StadiumOps AI Assistant
              <span className="badge bg-green-500/20 text-green-400 border-green-500/30 text-xs">Online</span>
            </div>
            <div className="text-xs text-slate-400">Real-time stadium intelligence • Powered by Gemini AI</div>
          </div>
        </div>
        <button onClick={() => setMessages(messages.slice(0, 1))} className="p-2 hover:bg-slate-700/60 rounded-lg transition-colors text-slate-400 hover:text-white">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 glass-card p-5 overflow-y-auto space-y-4">
        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div className="bg-slate-800 rounded-2xl rounded-tl-sm border border-slate-700/50 px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-xs text-slate-400">Analyzing stadium data...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map(p => (
          <button key={p} onClick={() => sendMessage(p)}
            className="px-3 py-1.5 rounded-full text-xs bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/50 hover:border-slate-600 transition-all">
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="glass-card p-3 flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask about crowd levels, incidents, parking, food queues..."
          className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-500 text-sm focus:outline-none"
          disabled={loading}
        />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          className="btn-primary px-4 py-2 flex items-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
