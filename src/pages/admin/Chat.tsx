import { useEffect, useRef, useState } from 'react';
import { Send, Trash2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';
import { toast } from 'sonner';

type Msg = { role: 'user' | 'assistant'; content: string };

const SUGGESTED = [
  'What changed in engagement over the past 7 days?',
  'Which trends are underperforming in Depth mode?',
  'Top 5 editions by recent page views',
  'Which AEO keywords slipped in rank?',
];

export default function Chat() {
  const { user } = useAdminAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('ai_chat_messages')
      .select('role, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(200)
      .then(({ data }) => {
        if (data) setMessages(data.filter((m: any) => m.role !== 'system') as Msg[]);
      });
  }, [user]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || sending) return;
    const userMsg: Msg = { role: 'user', content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ messages: next }),
      });

      if (res.status === 402) { toast.error('AI credits exhausted.'); setSending(false); return; }
      if (res.status === 429) { toast.error('Rate limit hit — try again shortly.'); setSending(false); return; }
      if (!res.ok || !res.body) { toast.error('AI request failed'); setSending(false); return; }

      // Add empty assistant placeholder
      setMessages((m) => [...m, { role: 'assistant', content: '' }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let acc = '';
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf('\n')) !== -1) {
          let line = buf.slice(0, i);
          buf = buf.slice(i + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') { done = true; break; }
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) {
              acc += c;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: 'assistant', content: acc };
                return copy;
              });
            }
          } catch { buf = line + '\n' + buf; break; }
        }
      }
    } catch (e) {
      toast.error('Network error');
    }
    setSending(false);
  }

  async function clearConversation() {
    if (!user) return;
    if (!confirm('Clear conversation history?')) return;
    await supabase.from('ai_chat_messages').delete().eq('user_id', user.id);
    setMessages([]);
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="ad-chat-shell">
      <header className="ad-page-header" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="ad-page-title">Ask the data</h1>
          <p className="ad-page-sub">Grounded in editions, engagement events, content library, and AEO metrics</p>
        </div>
        {messages.length > 0 && (
          <button className="ad-btn ad-btn-ghost" onClick={clearConversation}>
            <Trash2 size={13} /> Clear
          </button>
        )}
      </header>

      <div className="ad-chat-list" ref={listRef}>
        {messages.length === 0 ? (
          <div className="ad-chat-empty">
            <Sparkles size={20} style={{ color: '#AD9675' }} />
            <div className="ad-chat-empty-title">Ask anything about your data</div>
            <div className="ad-chat-empty-sub">Pick a starter or type your own question.</div>
            <div className="ad-suggest-row">
              {SUGGESTED.map((s) => (
                <button key={s} className="ad-suggest-chip" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div key={idx} className={`ad-chat-bubble ${m.role}`}>
              <div className="ad-chat-role">{m.role === 'user' ? 'You' : 'AI'}</div>
              <div className="ad-chat-content">
                {m.role === 'assistant' ? (
                  <ReactMarkdown>{m.content || '…'}</ReactMarkdown>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="ad-chat-composer">
        <textarea
          className="ad-input ad-chat-textarea"
          placeholder="Ask about engagement, editions, AEO health… (⌘/Ctrl+Enter to send)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          rows={2}
          disabled={sending}
        />
        <button className="ad-btn" onClick={() => send(input)} disabled={sending || !input.trim()}>
          <Send size={13} /> {sending ? 'Thinking…' : 'Send'}
        </button>
      </div>
    </div>
  );
}