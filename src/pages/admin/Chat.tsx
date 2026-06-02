import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, Plus, Sparkles, Trash2, PanelLeftClose, PanelLeft, MessageSquare, Beaker, Paperclip, X, ImageIcon, Loader2, Star, MoreHorizontal, Pencil, Folder, FolderPlus, ChevronRight, FolderOpen, FolderInput } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';
import { toast } from 'sonner';

type Msg = { role: 'user' | 'assistant'; content: string; imageUrl?: string };
type Conversation = { id: string; title: string; updated_at: string; starred: boolean; folder_id: string | null };
type ChatFolder = { id: string; name: string; display_order: number };

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
  const [attached, setAttached] = useState<{ dataUrl: string; name: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [folders, setFolders] = useState<ChatFolder[]>([]);
  const [folderMenuFor, setFolderMenuFor] = useState<string | null>(null);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [folderRenameValue, setFolderRenameValue] = useState('');
  const [moveSubmenuFor, setMoveSubmenuFor] = useState<string | null>(null);
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem('rl-collapsed-folders') ?? '{}'); } catch { return {}; }
  });
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null | 'root'>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const starred = useMemo(() => conversations.filter((c) => c.starred), [conversations]);
  const ungroupedUnstarred = useMemo(
    () => conversations.filter((c) => !c.starred && !c.folder_id),
    [conversations],
  );
  const grouped = useMemo(() => groupByDate(ungroupedUnstarred), [ungroupedUnstarred]);
  const conversationsByFolder = useMemo(() => {
    const map = new Map<string, Conversation[]>();
    for (const c of conversations) {
      if (c.starred || !c.folder_id) continue;
      if (!map.has(c.folder_id)) map.set(c.folder_id, []);
      map.get(c.folder_id)!.push(c);
    }
    return map;
  }, [conversations]);

  useEffect(() => {
    try { localStorage.setItem('rl-collapsed-folders', JSON.stringify(collapsedFolders)); } catch {}
  }, [collapsedFolders]);

  // Load conversations
  async function loadConversations() {
    if (!user) return;
    const [convRes, folderRes] = await Promise.all([
      supabase
        .from('chat_conversations')
        .select('id, title, updated_at, starred, folder_id')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(200),
      supabase
        .from('chat_folders')
        .select('id, name, display_order')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true }),
    ]);
    if (convRes.data) setConversations(convRes.data as Conversation[]);
    if (folderRes.data) setFolders(folderRes.data as ChatFolder[]);
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
    setAttached(null);
    setTimeout(() => taRef.current?.focus(), 0);
  }

  async function deleteConversation(id: string) {
    if (!confirm('Delete this conversation?')) return;
    await supabase.from('chat_conversations').delete().eq('id', id);
    setConversations((cs) => cs.filter((c) => c.id !== id));
    if (activeId === id) newConversation();
  }

  async function toggleStar(id: string) {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;
    const next = !conv.starred;
    setConversations((cs) => cs.map((c) => (c.id === id ? { ...c, starred: next } : c)));
    const { error } = await supabase.from('chat_conversations').update({ starred: next }).eq('id', id);
    if (error) {
      setConversations((cs) => cs.map((c) => (c.id === id ? { ...c, starred: !next } : c)));
      toast.error('Could not update star');
    }
  }

  function startRename(c: Conversation) {
    setMenuFor(null);
    setRenamingId(c.id);
    setRenameValue(c.title);
  }

  async function commitRename(id: string) {
    const value = renameValue.trim();
    setRenamingId(null);
    if (!value) return;
    const prev = conversations.find((c) => c.id === id)?.title;
    if (value === prev) return;
    setConversations((cs) => cs.map((c) => (c.id === id ? { ...c, title: value } : c)));
    const { error } = await supabase.from('chat_conversations').update({ title: value }).eq('id', id);
    if (error) {
      if (prev) setConversations((cs) => cs.map((c) => (c.id === id ? { ...c, title: prev } : c)));
      toast.error('Rename failed');
    }
  }

  useEffect(() => {
    if (!menuFor) return;
    const onDown = () => setMenuFor(null);
    window.addEventListener('click', onDown);
    return () => window.removeEventListener('click', onDown);
  }, [menuFor]);

  async function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('Only image files are supported'); return; }
    if (file.size > 8 * 1024 * 1024) { toast.error('Image must be under 8 MB'); return; }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAttached({ dataUrl, name: file.name });
    } catch {
      toast.error('Could not read image');
    }
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = '';
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  async function send(text: string) {
    if ((!text.trim() && !attached) || sending) return;
    const trimmed = text.trim();
    const pendingImage = attached;
    setAttached(null);

    // Optimistic user message (with thumbnail if image attached)
    const userMsg: Msg = {
      role: 'user',
      content: trimmed || (pendingImage ? '(image attached)' : ''),
      imageUrl: pendingImage?.dataUrl,
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setSending(true);

    try {
      // If image attached, get vision description first
      let visionDescription: string | null = null;
      if (pendingImage) {
        setAnalyzingImage(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const vRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vision-describe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
            body: JSON.stringify({ image_data_url: pendingImage.dataUrl }),
          });
          if (!vRes.ok) {
            toast.error('Image analysis failed');
            setAnalyzingImage(false);
            setSending(false);
            return;
          }
          const vJson = await vRes.json();
          visionDescription = vJson.description as string;
        } finally {
          setAnalyzingImage(false);
        }
      }

      // Build outbound messages — replace last user content with description + question for Perplexity
      const outboundMessages = next.map((m, i) => {
        if (i !== next.length - 1) return { role: m.role, content: m.content };
        if (visionDescription) {
          const body = trimmed
            ? `${trimmed}\n\n[Attached image description]:\n${visionDescription}`
            : `Research this image and align it to a North American trade show trend or activation pattern.\n\n[Attached image description]:\n${visionDescription}`;
          return { role: 'user' as const, content: body };
        }
        return { role: m.role, content: m.content };
      });

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ messages: outboundMessages, conversation_id: activeId }),
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

  function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith('image/'));
    if (item) {
      const file = item.getAsFile();
      if (file) { e.preventDefault(); handleFile(file); }
    }
  }

  const renderThread = (c: Conversation) => {
    const isRenaming = renamingId === c.id;
    return (
      <div
        key={c.id}
        className={'rl-thread' + (activeId === c.id ? ' active' : '') + (c.starred ? ' is-starred' : '')}
        onClick={() => !isRenaming && setActiveId(c.id)}
        onContextMenu={(e) => { e.preventDefault(); startRename(c); }}
      >
        <MessageSquare size={13} className="rl-thread-icon" />
        {isRenaming ? (
          <input
            autoFocus
            className="rl-thread-rename"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={() => commitRename(c.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); commitRename(c.id); }
              if (e.key === 'Escape') { e.preventDefault(); setRenamingId(null); }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="rl-thread-title">{c.title}</span>
        )}
        <button
          className={'rl-thread-star' + (c.starred ? ' on' : '')}
          onClick={(e) => { e.stopPropagation(); toggleStar(c.id); }}
          title={c.starred ? 'Unstar' : 'Star'}
          aria-label={c.starred ? 'Unstar thread' : 'Star thread'}
        >
          <Star size={12} fill={c.starred ? 'currentColor' : 'none'} />
        </button>
        <button
          className="rl-thread-menu"
          onClick={(e) => { e.stopPropagation(); setMenuFor(menuFor === c.id ? null : c.id); }}
          title="More"
          aria-label="Thread actions"
        >
          <MoreHorizontal size={14} />
        </button>
        {menuFor === c.id && (
          <div className="rl-thread-popover" onClick={(e) => e.stopPropagation()}>
            <button className="rl-pop-item" onClick={() => startRename(c)}>
              <Pencil size={12} /> Rename
            </button>
            <button className="rl-pop-item" onClick={() => toggleStar(c.id)}>
              <Star size={12} /> {c.starred ? 'Unstar' : 'Star'}
            </button>
            <button className="rl-pop-item danger" onClick={() => { setMenuFor(null); deleteConversation(c.id); }}>
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  const groupBlock = (label: string, list: Conversation[]) =>
    list.length === 0 ? null : (
      <div className="rl-group" key={label}>
        <div className="rl-group-label">{label}</div>
        {list.map(renderThread)}
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
                    {starred.length > 0 && (
                      <div className="rl-group" key="starred">
                        <div className="rl-group-label">
                          <Star size={10} fill="currentColor" style={{ marginRight: 4, verticalAlign: -1 }} />
                          Starred
                        </div>
                        {starred.map(renderThread)}
                      </div>
                    )}
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
                  Explore North American trade show trends, pressure-test ideas, or drop an image to align it to a trend.
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
                        <>
                          {m.imageUrl && (
                            <img src={m.imageUrl} alt="attached" className="rl-msg-image" />
                          )}
                          {m.content && m.content !== '(image attached)' && (
                            <div className="rl-user-text">{m.content}</div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div style={{ height: 24 }} />
            </div>
          )}
        </div>

        <div
          className={'rl-composer-wrap' + (dragOver ? ' drag' : '')}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          {dragOver && <div className="rl-drop-overlay"><ImageIcon size={28} /><span>Drop image to analyze</span></div>}
          <div className="rl-composer">
            {attached && (
              <div className="rl-attached">
                <img src={attached.dataUrl} alt={attached.name} />
                <button className="rl-attached-x" onClick={() => setAttached(null)} aria-label="Remove image">
                  <X size={12} />
                </button>
              </div>
            )}
            <button
              type="button"
              className="rl-attach-btn"
              onClick={() => fileRef.current?.click()}
              disabled={sending}
              title="Attach image"
              aria-label="Attach image"
            >
              {analyzingImage ? <Loader2 size={16} className="rl-spin" /> : <Paperclip size={16} />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPickFile}
              style={{ display: 'none' }}
            />
            <textarea
              ref={taRef}
              className="rl-textarea"
              placeholder={attached ? 'Add context for this image, or just send…' : 'Ask about NA trade show trends, or drop an image…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              onPaste={onPaste}
              rows={1}
              disabled={sending}
            />
            <button
              className="rl-send"
              onClick={() => send(input)}
              disabled={sending || (!input.trim() && !attached)}
              aria-label="Send"
            >
              <ArrowUp size={16} />
            </button>
          </div>
          <div className="rl-hint">
            {analyzingImage ? 'Analyzing image…' : 'Enter to send · Shift + Enter for newline · Drop or paste images'}
          </div>
        </div>
      </div>
    </div>
  );
}