import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Option = { key: 'A' | 'B' | 'C' | 'D'; text: string };
type Question = {
  id: string;
  num: number;
  prompt: string;
  options: Option[];
  unpackPrompt: string;
};

export const ASSESSMENT_QUESTIONS: Question[] = [
  {
    id: 'q1',
    num: 1,
    prompt: 'Which of these most accurately describes where your exhibit program is today?',
    options: [
      { key: 'A', text: "We're still running a product showcase, features, specs, demos. The booth is a catalog in 3D." },
      { key: 'B', text: "We have a story, but it's competing with too many other messages for attention." },
      { key: 'C', text: "We're in transition, we know the old approach isn't working, but haven't fully committed to the new one." },
      { key: 'D', text: "We've moved past the product theater model. Our program is built around a single, clear idea." },
    ],
    unpackPrompt: "What's making it hard to move forward from where you are?",
  },
  {
    id: 'q2',
    num: 2,
    prompt: 'How would you describe the visitor experience from the moment someone sees your booth to the moment they leave?',
    options: [
      { key: 'A', text: "Organic, visitors explore however they want. There's no designed flow." },
      { key: 'B', text: 'We have a pitch and a demo, but what happens between them is inconsistent.' },
      { key: 'C', text: "We've designed a journey on paper, but it rarely survives contact with real show-floor conditions." },
      { key: 'D', text: 'We have a deliberately orchestrated path from first impression to qualified handoff, and it holds up in practice.' },
    ],
    unpackPrompt: 'Where does your visitor journey break down most often, and why?',
  },
  {
    id: 'q3',
    num: 3,
    prompt: 'How would you honestly describe the role technology plays in your exhibit right now?',
    options: [
      { key: 'A', text: "It's primarily visual, screens, motion, interactives that draw people in. Whether it proves our value is secondary." },
      { key: 'B', text: "We have functional technology, but it's not clearly connected to what makes us different." },
      { key: 'C', text: "We've invested in technology that our customers don't fully understand or engage with." },
      { key: 'D', text: "Our technology is purpose-built to demonstrate what words can't. It's a proof engine, not a decoration." },
    ],
    unpackPrompt: 'What would it look like if your technology actually closed the gap between what you claim and what visitors believe?',
  },
  {
    id: 'q4',
    num: 4,
    prompt: 'How does your exhibit program scale across the range of shows on your calendar?',
    options: [
      { key: 'A', text: 'We have a flagship booth. Everything else is a compromise, parts pulled out, things left behind.' },
      { key: 'B', text: "We design each show separately. There's no shared system connecting them." },
      { key: 'C', text: "We have modular components, but they don't always assemble cleanly. Each show still requires significant custom work." },
      { key: 'D', text: 'We have a true modular system. Our story, structure, and assets scale predictably from small regionals to flagship moments.' },
    ],
    unpackPrompt: "What's the biggest hidden cost of how you're handling this today, in time, budget, or brand consistency?",
  },
  {
    id: 'q5',
    num: 5,
    prompt: "If you had to write your booth's core idea in one sentence, what happens?",
    options: [
      { key: 'A', text: "I'd struggle. We're communicating multiple things and it would be hard to choose." },
      { key: 'B', text: "I have a sentence, but I'm not confident everyone on our team would write the same one." },
      { key: 'C', text: "We have a tagline, but our exhibit doesn't fully express what's behind it." },
      { key: 'D', text: 'One sentence, clearly. And every element of our exhibit, from the structure to the staff conversation, earns it.' },
    ],
    unpackPrompt: 'Write the sentence. Even a rough draft. What is the one thing you want every visitor to leave believing?',
  },
  {
    id: 'q6',
    num: 6,
    prompt: 'After reading this report, where does your most urgent opportunity actually sit?',
    options: [
      { key: 'A', text: 'In our story, we need a clearer, bolder singular idea that our whole program can organize around.' },
      { key: 'B', text: "In our visitor experience, there's a designed journey missing, and attendees are feeling it." },
      { key: 'C', text: "In our technology strategy, we're spending without a clear proof-of-value rationale." },
      { key: 'D', text: "In our operational model, the way we scale, build, and deploy exhibits isn't sustainable." },
    ],
    unpackPrompt: "What's the real blocker, budget, internal alignment, a vendor relationship, something else? Name it.",
  },
];

const STORAGE_KEY = 'trend2026-assessment-v2';

type AnswerState = Record<string, { choice?: 'A' | 'B' | 'C' | 'D'; unpack?: string }>;
type Identity = { name: string; email: string; company: string };
type Persisted = { answers: AnswerState; identity?: Identity; unlockedAt?: number; submittedAt?: number };

function formatRelative(ts: number | null): string {
  if (!ts) return 'Not saved yet';
  const diff = Math.max(0, Date.now() - ts);
  if (diff < 5_000) return 'Answers saved just now';
  if (diff < 60_000) return `Answers saved ${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `Answers saved ${Math.floor(diff / 60_000)}m ago`;
  return `Answers saved ${Math.floor(diff / 3_600_000)}h ago`;
}

const SelfAssessment: React.FC = () => {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [draft, setDraft] = useState<Identity>({ name: '', email: '', company: '' });
  const [gateErrors, setGateErrors] = useState<{ name?: string; email?: string; company?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [gateMode, setGateMode] = useState<'new' | 'returning'>('new');
  const [resumeEmail, setResumeEmail] = useState('');
  const [resumeError, setResumeError] = useState<string | undefined>();
  const [resumeSent, setResumeSent] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [savingPulse, setSavingPulse] = useState(false);
  const [, setNow] = useState(0);
  const [stickyToast, setStickyToast] = useState<string | null>(null);
  const hydrated = useRef(false);
  const debounceRef = useRef<number | undefined>(undefined);

  // Hydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Persisted;
        if (parsed?.answers) setAnswers(parsed.answers);
        if (parsed?.identity) {
          setIdentity(parsed.identity);
          setDraft(parsed.identity);
          setSubmitted(true);
          setShowResume(true);
        }
        if (parsed?.submittedAt) setLastSavedAt(parsed.submittedAt);
      }
    } catch {/* ignore */}
    hydrated.current = true;
  }, []);

  // Hide welcome-back after a few seconds
  useEffect(() => {
    if (!showResume) return;
    const t = window.setTimeout(() => setShowResume(false), 5000);
    return () => window.clearTimeout(t);
  }, [showResume]);

  // Toggle body class when sticky bar visible
  useEffect(() => {
    if (submitted) {
      document.body.classList.add('has-as-sticky');
      return () => document.body.classList.remove('has-as-sticky');
    }
  }, [submitted]);

  // Debounced auto-save
  useEffect(() => {
    if (!hydrated.current) return;
    setSavingPulse(true);
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      try {
        const payload: Persisted = {
          answers,
          identity: identity ?? undefined,
          submittedAt: identity ? Date.now() : undefined,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        setLastSavedAt(Date.now());
      } catch {/* ignore */}
      setSavingPulse(false);
    }, 400);
    return () => window.clearTimeout(debounceRef.current);
  }, [answers, identity]);

  // Re-render relative timestamp every 15s
  useEffect(() => {
    if (!submitted) return;
    const id = window.setInterval(() => setNow((n) => n + 1), 15_000);
    return () => window.clearInterval(id);
  }, [submitted]);

  // Auto-dismiss sticky toast
  useEffect(() => {
    if (!stickyToast) return;
    const t = window.setTimeout(() => setStickyToast(null), 3000);
    return () => window.clearTimeout(t);
  }, [stickyToast]);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((a) => a?.choice).length,
    [answers],
  );

  const selectOption = (qid: string, key: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => {
      const existing = prev[qid] ?? {};
      if (existing.choice === key) return { ...prev, [qid]: { ...existing, choice: undefined } };
      return { ...prev, [qid]: { ...existing, choice: key } };
    });
  };

  const setUnpack = (qid: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: { ...(prev[qid] ?? {}), unpack: text } }));
  };

  const onSubmitGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (gateMode === 'returning') { onSubmitResume(e); return; }
    const errs: typeof gateErrors = {};
    if (!draft.name.trim()) errs.name = 'Required';
    if (!draft.email.trim()) errs.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) errs.email = 'Enter a valid email';
    if (!draft.company.trim()) errs.company = 'Required';
    setGateErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    const nextIdentity: Identity = {
      name: draft.name.trim(),
      email: draft.email.trim(),
      company: draft.company.trim(),
    };
    void sendAssessment(nextIdentity, 'start').finally(() => {
      setSubmitting(false);
      setIdentity(nextIdentity);
      setSubmitted(true);
      setGateOpen(false);
    });
  };

  const onSubmitResume = (e: React.FormEvent) => {
    e.preventDefault();
    const email = resumeEmail.trim();
    if (!email) { setResumeError('Required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setResumeError('Enter a valid email'); return; }
    setResumeError(undefined);
    setResumeSent(true);
  };

  const switchGateMode = (mode: 'new' | 'returning') => {
    setGateErrors({});
    setResumeError(undefined);
    setResumeSent(false);
    setGateMode(mode);
  };

  const sendAssessment = async (who: Identity, action: 'start' | 'save' | 'submit') => {
    try {
      await supabase.functions.invoke('assessment-submit', {
        body: { ...who, action, answers },
      });
    } catch {/* email is best effort */}
  };

  const onSubmitAssessment = () => {
    if (!identity) return;
    setStickyToast('Assessment submitted. Check your inbox for your results link.');
    void sendAssessment(identity, 'submit');
  };

  const onSaveForLater = () => {
    if (!identity) return;
    setStickyToast(`Link sent to ${identity.email}`);
    void sendAssessment(identity, 'save');
  };

  const onSignOut = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {/* ignore */}
    setAnswers({});
    setIdentity(null);
    setDraft({ name: '', email: '', company: '' });
    setGateOpen(false);
    setSubmitted(false);
    setLastSavedAt(null);
    setStickyToast(null);
  };

  // LOCKED STATE
  if (!submitted) {
    return (
      <section className="section section--w assessment" id="assessment">
        <div className="pr"></div>
        <div className="sl">Self-Assessment</div>
        <h2 className="st">Now let's put these trends to work for you</h2>

        <div className="as-teaser">
          <div className="as-teaser-inner">
            <div className="as-teaser-left">
              <div className="as-teaser-eyebrow">6-Question Diagnostic</div>
              <p className="as-teaser-desc">
                A focused read on where your exhibit program actually stands against the 12 trends in this report. Six questions, your honest answers, and a personalized response from our team on where to focus next.
              </p>
              <ul className="as-teaser-meta">
                <li>Takes about 5 minutes</li>
                <li>Your answers auto-save</li>
                <li>Personalized response from our team</li>
              </ul>
            </div>

            <div className="as-teaser-right">
              {!gateOpen && (
                <>
                  <p className="as-teaser-invite">Six questions. Your honest answers. A clearer path forward.</p>
                  <button type="button" className="as-cta-hero" onClick={() => setGateOpen(true)}>
                    Start the Assessment
                  </button>
                  <p className="as-teaser-sub">About 5 minutes. Your progress saves automatically.</p>
                </>
              )}

              {gateOpen && (
                <form className="as-gate" onSubmit={onSubmitGate} noValidate>
              <div className="as-gate-head">
                <div className="as-gate-eyebrow">Quick intro</div>
                <h3 className="as-gate-title">{gateMode === 'new' ? 'Before we begin' : 'Welcome back'}</h3>
                <p className="as-gate-sub">
                  {gateMode === 'new'
                    ? 'Your answers are saved to your profile and personalized to your program. This takes about 5 minutes.'
                    : "Enter the email you used and we'll send your resume link."}
                </p>
              </div>
              <div className="as-mode-toggle" role="tablist" aria-label="Assessment mode">
                <button type="button" role="tab" aria-selected={gateMode === 'new'} className={`as-mode-btn${gateMode === 'new' ? ' is-active' : ''}`} onClick={() => switchGateMode('new')}>New to this assessment</button>
                <button type="button" role="tab" aria-selected={gateMode === 'returning'} className={`as-mode-btn${gateMode === 'returning' ? ' is-active' : ''}`} onClick={() => switchGateMode('returning')}>Already started</button>
              </div>
              <div className="as-mode-panel" key={gateMode}>
              {gateMode === 'new' ? (
                <>
              <div className="as-gate-grid">
                <div className="as-field">
                  <label htmlFor="as-name">Name</label>
                  <input id="as-name" type="text" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} aria-invalid={!!gateErrors.name} maxLength={120} />
                  {gateErrors.name && <div className="as-err">{gateErrors.name}</div>}
                </div>
                <div className="as-field">
                  <label htmlFor="as-email">Email</label>
                  <input id="as-email" type="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} aria-invalid={!!gateErrors.email} maxLength={200} />
                  {gateErrors.email && <div className="as-err">{gateErrors.email}</div>}
                </div>
                <div className="as-field">
                  <label htmlFor="as-company">Company Name</label>
                  <input id="as-company" type="text" value={draft.company} onChange={(e) => setDraft((d) => ({ ...d, company: e.target.value }))} aria-invalid={!!gateErrors.company} maxLength={120} />
                  {gateErrors.company && <div className="as-err">{gateErrors.company}</div>}
                </div>
              </div>
              <div className="as-gate-actions">
                <button type="submit" className="as-cta-hero" disabled={submitting}>
                  {submitting ? 'Loading...' : 'Begin Assessment'}
                </button>
                <button type="button" className="as-link" onClick={() => setGateOpen(false)} disabled={submitting}>
                  Cancel
                </button>
              </div>
              <button type="button" className="as-mode-switch" onClick={() => switchGateMode('returning')}>
                Already started? Resume your assessment
              </button>
                </>
              ) : (
                <>
                  <div className="as-gate-grid as-gate-grid--single">
                    <div className="as-field">
                      <label htmlFor="as-resume-email">Email</label>
                      <input id="as-resume-email" type="email" value={resumeEmail} onChange={(e) => { setResumeEmail(e.target.value); setResumeSent(false); }} aria-invalid={!!resumeError} maxLength={200} />
                      {resumeError && <div className="as-err">{resumeError}</div>}
                    </div>
                  </div>
                  <div className="as-gate-actions">
                    <button type="button" className="as-cta-hero" onClick={(e) => onSubmitResume(e as unknown as React.FormEvent)}>
                      Send My Link
                    </button>
                    <button type="button" className="as-link" onClick={() => setGateOpen(false)}>
                      Cancel
                    </button>
                  </div>
                  {resumeSent && (
                    <div className="as-resume-confirm" role="status">Check your inbox, your link is on the way.</div>
                  )}
                  <button type="button" className="as-mode-switch" onClick={() => switchGateMode('new')}>
                    New here? Start fresh
                  </button>
                </>
              )}
              </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // UNLOCKED STATE
  const firstName = identity?.name.split(' ')[0] || 'there';
  return (
    <>
      <section className="section section--w assessment" id="assessment">
        <div className="pr"></div>
        <div className="sl">Self-Assessment</div>
        <h2 className="st">Now let's put these trends to work for you</h2>

        {showResume && (
          <div className="as-resume" role="status">
            <span className="as-resume-dot" aria-hidden="true"></span>
            Welcome back, {firstName}.
          </div>
        )}

        <p className="as-intro">
          Six quick questions. Pick the option that best matches your reality, optionally unpack it in your own words, and we'll send you a personalized read on where to focus next.
        </p>

        <div className="as-questions">
          {ASSESSMENT_QUESTIONS.map((q) => {
            const state = answers[q.id] ?? {};
            return (
              <div className="as-q" key={q.id} id={`as-${q.id}`}>
                <div className="as-q-head">
                  <span className="as-q-num">Q{q.num}</span>
                  <h3 className="as-q-title">{q.prompt}</h3>
                </div>
                <div className="as-options" role="radiogroup" aria-label={q.prompt}>
                  {q.options.map((opt) => {
                    const selected = state.choice === opt.key;
                    return (
                      <button type="button" key={opt.key} className={`as-opt${selected ? ' is-selected' : ''}`} onClick={() => selectOption(q.id, opt.key)} role="radio" aria-checked={selected}>
                        <span className="as-opt-key">{opt.key}</span>
                        <span className="as-opt-text">{opt.text}</span>
                        <span className="as-opt-check" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 7" /></svg>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {state.choice && (
                  <div className="as-unpack">
                    <label className="as-unpack-label" htmlFor={`unpack-${q.id}`}>
                      {q.unpackPrompt} <span className="as-optional">(optional)</span>
                    </label>
                    <textarea id={`unpack-${q.id}`} className="as-unpack-input" value={state.unpack ?? ''} onChange={(e) => setUnpack(q.id, e.target.value)} rows={3} placeholder="Type your answer..." maxLength={1000} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="as-footer">
          <div className="as-progress">
            <span className="as-progress-count">{answeredCount}/6 answered</span>
          </div>
          <div className="as-footer-actions">
            <button type="button" className="as-cta" disabled={answeredCount < 1} onClick={onSubmitAssessment}>
              Submit My Assessment
            </button>
            <button type="button" className="as-cta as-cta--secondary" onClick={onSaveForLater}>
              Save for Later
            </button>
          </div>
        </div>
      </section>

      {identity && (
        <div className="as-sticky" role="region" aria-label="Assessment session">
          <div className="as-sticky-id">
            <span className="as-sticky-name">{identity.name}</span>
            <span className="as-sticky-co">{identity.company}</span>
          </div>
          <div className={`as-sticky-save${savingPulse ? ' is-saving' : ''}`} aria-live="polite">
            <span className="as-sticky-save-dot" aria-hidden="true"></span>
            <span>{savingPulse ? 'Saving...' : formatRelative(lastSavedAt)}</span>
          </div>
          <div className="as-sticky-actions">
            <button type="button" className="as-sticky-btn" onClick={onSaveForLater}>Save for Later</button>
            <button type="button" className="as-sticky-btn is-ghost" onClick={onSignOut}>Sign Out</button>
          </div>
          {stickyToast && <div className="as-sticky-toast" role="status">{stickyToast}</div>}
        </div>
      )}
    </>
  );
};

export default SelfAssessment;