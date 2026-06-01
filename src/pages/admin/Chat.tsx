import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, Plus, Sparkles, Trash2, PanelLeftClose, PanelLeft, MessageSquare, Beaker } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';
import { toast } from 'sonner';

type Msg = { role: 'user' | 'assistant'; content: string };
type Conversation = { id: string; title: string; updated_at: string };

const SUGGESTIONS = [
  { title: 'Surface emerging booth formats', sub: 'What experiential formats are gaining traction at major B2B trade shows in 2026?' },
  { title: 'Pressure-test a hypothesis', sub: 'Is "biophilic exhibit design" a real trend or a one-show anomaly? Find evidence either way.' },
  { title: 'Trend candidate shortlist', sub: 'Give me 5 candidate trends worth tracking for the next Trend Report, with a one-line definition each.' },
  { title: 'Brand activation teardown', sub: 'Break down what made the most talked-about activation at CES 2026 work — structurally and editorially.' },
];

function groupByDate(convs: Conversation[]) {
  const today: Conversation[] = [];
  const week: Conversation[] = [];
  const month: Conversation[] = [];
  const older: Conversation[] = [];
  const now = Date.now();
  for (const c of convs) {
    const age = (now - new Date(c.updated_at).getTime()) / 86400000;
    if (age < 1) today.push(c);
    else if (age < 7) week.push(c);
    else if (age < 30) month.push(c);
    else older.push(c);
  }
  return { today, week, month, older };
}

export default function Chat() {
  const { user } = useAdminAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const grouped = useMemo(() => groupByDate(conversations), [conversations]);

  // Load conversations
  async function loadConversations() {
    if (!user) return;
    const { data } = await supabase
      .from('chat_conversations')
      .select('id, title, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(200);
    if (data) setConversations(data as Conversation[]);
  }

  useEffect(() => { loadConversations(); /* eslint-disable-next-line */ }, [user]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    supabase
      .from('ai_chat_messages')
      .select('role, content, created_at')
      .eq('conversation_id', activeId)
      .order('created_at', { ascending: true })
      .limit(500)
      .then(({ data }) => {
        if (data) setMessages(data.filter((m: any) => m.role !== 'system') as Msg[]);
      });
  }, [activeId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (!taRef.current) return;
    taRef.current.style.height = 'auto';
    taRef.current.style.height = Math.min(taRef.current.scrollHeight, 220) + 'px';
  }, [input]);

  function newConversation() {
    setActiveId(null);
    setMessages([]);
    setInput('');
    setTimeout(() => taRef.current?.focus(), 0);
  }

  async function deleteConversation(id: string) {
    if (!confirm('Delete this conversation?')) return;
    await supabase.from('chat_conversations').delete().eq('id', id);
    setConversations((cs) => cs.filter((c) => c.id !== id));
    if (activeId === id) newConversation();
  }

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
        body: JSON.stringify({ messages: next, conversation_id: activeId }),
      });

      if (res.status === 402) { toast.error('AI credits exhausted.'); setSending(false); return; }
      if (res.status === 429) { toast.error('Rate limit hit — try again shortly.'); setSending(false); return; }
      if (!res.ok || !res.body) { toast.error('Research Lab request failed'); setSending(false); return; }

      const newConvId = res.headers.get('x-conversation-id');
      if (newConvId && newConvId !== activeId) setActiveId(newConvId);

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
      await loadConversations();
    } catch (e) {
      toast.error('Network error');
    }
    setSending(false);
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const groupBlock = (label: string, list: Conversation[]) =>
    list.length === 0 ? null : (
      <div className="rl-group" key={label}>
        <div className="rl-group-label">{label}</div>
        {list.map((c) => (
          <button
            key={c.id}
            className={'rl-thread' + (activeId === c.id ? ' active' : '')}
            onClick={() => setActiveId(c.id)}
          >
            <MessageSquare size={13} className="rl-thread-icon" />
            <span className="rl-thread-title">{c.title}</span>
            <span className="rl-thread-del" onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}>
              <Trash2 size={12} />
            </span>
          </button>
        ))}
      </div>
    );

  return (
    <div className="rl-shell">
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="rl-sidebar"
          >
            <div className="rl-sidebar-inner">
              <div className="rl-sidebar-head">
                <button className="rl-new" onClick={newConversation}>
                  <Plus size={14} /> New thread
                </button>
                <button className="rl-icon-btn" onClick={() => setSidebarOpen(false)} title="Collapse">
                  <PanelLeftClose size={15} />
                </button>
              </div>
              <div className="rl-threads">
                {conversations.length === 0 ? (
                  <div className="rl-threads-empty">No saved threads yet.</div>
                ) : (
                  <>
                    {groupBlock('Today', grouped.today)}
                    {groupBlock('Previous 7 days', grouped.week)}
                    {groupBlock('Previous 30 days', grouped.month)}
                    {groupBlock('Older', grouped.older)}
                  </>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="rl-main">
        <header className="rl-topbar">
          {!sidebarOpen && (
            <button className="rl-icon-btn" onClick={() => setSidebarOpen(true)} title="Open history">
              <PanelLeft size={15} />
            </button>
          )}
          <div className="rl-topbar-title">
            <Beaker size={14} /> Trend Research Lab
          </div>
        </header>

        <div className="rl-scroll" ref={listRef}>
          {messages.length === 0 ? (
            <div className="rl-empty">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="rl-empty-inner"
              >
                <div className="rl-empty-logo"><Sparkles size={22} /></div>
                <h1 className="rl-empty-title">What are we researching today?</h1>
                <p className="rl-empty-sub">
                  Explore trade show trends, pressure-test ideas, and save promising candidates for future reports.
                </p>
                <div className="rl-suggests">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s.title}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                      className="rl-suggest"
                      onClick={() => send(s.sub)}
                    >
                      <div className="rl-suggest-title">{s.title}</div>
                      <div className="rl-suggest-sub">{s.sub}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="rl-thread-view">
              <AnimatePresence initial={false}>
                {messages.map((m, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className={'rl-msg ' + m.role}
                  >
                    {m.role === 'assistant' && (
                      <div className="rl-avatar"><Sparkles size={13} /></div>
                    )}
                    <div className="rl-bubble">
                      {m.role === 'assistant' ? (
                        <div className="rl-md"><ReactMarkdown>{m.content || '…'}</ReactMarkdown></div>
                      ) : (
                        <div className="rl-user-text">{m.content}</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div style={{ height: 24 }} />
            </div>
          )}
        </div>

        <div className="rl-composer-wrap">
          <div className="rl-composer">
            <textarea
              ref={taRef}
              className="rl-textarea"
              placeholder="Ask the Research Lab anything about trade show trends…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              disabled={sending}
            />
            <button
              className="rl-send"
              onClick={() => send(input)}
              disabled={sending || !input.trim()}
              aria-label="Send"
            >
              <ArrowUp size={16} />
            </button>
          </div>
          <div className="rl-hint">Enter to send · Shift + Enter for newline</div>
        </div>
      </div>
    </div>
  );
}