import React, { useEffect, useMemo, useRef, useState } from 'react';

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

const STORAGE_KEY = 'trend2026-assessment-v1';

type AnswerState = Record<string, { choice?: 'A' | 'B' | 'C' | 'D'; unpack?: string }>;
type Persisted = { answers: AnswerState; gate?: { name: string; email: string; company: string }; submittedAt?: number };

const SelfAssessment: React.FC = () => {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [gateOpen, setGateOpen] = useState(false);
  const [gate, setGate] = useState({ name: '', email: '', company: '' });
  const [gateErrors, setGateErrors] = useState<{ name?: string; email?: string; company?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveEmail, setSaveEmail] = useState('');
  const [saveSent, setSaveSent] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const hydrated = useRef(false);
  const debounceRef = useRef<number | undefined>(undefined);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Persisted;
        if (parsed?.answers) {
          setAnswers(parsed.answers);
          if (Object.values(parsed.answers).some((a) => a?.choice)) setShowResume(true);
        }
        if (parsed?.gate) setGate(parsed.gate);
      }
    } catch {
      // ignore
    }
    hydrated.current = true;
    if (showResume) {
      const t = window.setTimeout(() => setShowResume(false), 4000);
      return () => window.clearTimeout(t);
    }
  }, []);

  // Debounced auto-save
  useEffect(() => {
    if (!hydrated.current) return;
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      try {
        const payload: Persisted = { answers, gate: submitted ? gate : undefined, submittedAt: submitted ? Date.now() : undefined };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // ignore
      }
    }, 350);
    return () => window.clearTimeout(debounceRef.current);
  }, [answers, gate, submitted]);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((a) => a?.choice).length,
    [answers],
  );
  const canSubmit = answeredCount >= 1;

  const selectOption = (qid: string, key: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => {
      const existing = prev[qid] ?? {};
      // If clicking the same option, collapse it
      if (existing.choice === key) {
        const next = { ...prev };
        next[qid] = { ...existing, choice: undefined };
        return next;
      }
      return { ...prev, [qid]: { ...existing, choice: key } };
    });
  };

  const setUnpack = (qid: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: { ...(prev[qid] ?? {}), unpack: text } }));
  };

  const onSubmitGate = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof gateErrors = {};
    if (!gate.name.trim()) errs.name = 'Required';
    if (!gate.email.trim()) errs.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gate.email.trim())) errs.email = 'Enter a valid email';
    if (!gate.company.trim()) errs.company = 'Required';
    setGateErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    // No backend in this phase
    window.setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  const onSubmitSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(saveEmail.trim())) {
      setSaveError('Enter a valid email');
      return;
    }
    setSaveSent(true);
  };

  return (
    <section className="section section--w assessment" id="assessment">
      <div className="pr"></div>
      <div className="sl">Self-Assessment</div>
      <h2 className="st">Now let's put these trends to work for you</h2>

      {showResume && (
        <div className="as-resume" role="status">
          <span className="as-resume-dot" aria-hidden="true"></span>
          Welcome back, your previous answers were restored.
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
                    <button
                      type="button"
                      key={opt.key}
                      className={`as-opt${selected ? ' is-selected' : ''}`}
                      onClick={() => selectOption(q.id, opt.key)}
                      role="radio"
                      aria-checked={selected}
                    >
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
                  <textarea
                    id={`unpack-${q.id}`}
                    className="as-unpack-input"
                    value={state.unpack ?? ''}
                    onChange={(e) => setUnpack(q.id, e.target.value)}
                    rows={3}
                    placeholder="Type your answer..."
                    maxLength={1000}
                  />
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
        {!gateOpen && !submitted && (
          <button
            type="button"
            className="as-cta"
            disabled={!canSubmit}
            onClick={() => setGateOpen(true)}
          >
            Get My Results
          </button>
        )}
      </div>

      {gateOpen && !submitted && (
        <form className="as-gate" onSubmit={onSubmitGate} noValidate>
          <div className="as-gate-head">
            <div className="as-gate-eyebrow">Final step</div>
            <h3 className="as-gate-title">Where should we send your results?</h3>
            <p className="as-gate-sub">A short, tailored read based on what you selected above.</p>
          </div>
          <div className="as-gate-grid">
            <div className="as-field">
              <label htmlFor="as-name">Name</label>
              <input
                id="as-name"
                type="text"
                value={gate.name}
                onChange={(e) => setGate((g) => ({ ...g, name: e.target.value }))}
                aria-invalid={!!gateErrors.name}
                maxLength={120}
              />
              {gateErrors.name && <div className="as-err">{gateErrors.name}</div>}
            </div>
            <div className="as-field">
              <label htmlFor="as-email">Email</label>
              <input
                id="as-email"
                type="email"
                value={gate.email}
                onChange={(e) => setGate((g) => ({ ...g, email: e.target.value }))}
                aria-invalid={!!gateErrors.email}
                maxLength={200}
              />
              {gateErrors.email && <div className="as-err">{gateErrors.email}</div>}
            </div>
            <div className="as-field">
              <label htmlFor="as-company">Company</label>
              <input
                id="as-company"
                type="text"
                value={gate.company}
                onChange={(e) => setGate((g) => ({ ...g, company: e.target.value }))}
                aria-invalid={!!gateErrors.company}
                maxLength={120}
              />
              {gateErrors.company && <div className="as-err">{gateErrors.company}</div>}
            </div>
          </div>
          <div className="as-gate-actions">
            <button type="submit" className="as-cta" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send my results'}
            </button>
            <button type="button" className="as-link" onClick={() => setGateOpen(false)} disabled={submitting}>
              Back to questions
            </button>
          </div>
        </form>
      )}

      {submitted && (
        <div className="as-success" role="status" aria-live="polite">
          <div className="as-success-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7" /></svg>
          </div>
          <div className="as-success-title">Thanks, {gate.name.split(' ')[0] || 'we got it'}.</div>
          <p className="as-success-text">
            Your personalized read is on the way to <strong>{gate.email}</strong>. In the meantime, feel free to keep exploring the report.
          </p>
        </div>
      )}

      {answeredCount >= 1 && !submitted && (
        <div className="as-save">
          {!saveOpen && !saveSent && (
            <button type="button" className="as-link as-save-link" onClick={() => setSaveOpen(true)}>
              Save my progress and finish later
            </button>
          )}
          {saveOpen && !saveSent && (
            <form className="as-save-form" onSubmit={onSubmitSave} noValidate>
              <label htmlFor="as-save-email">Email me a link to resume</label>
              <div className="as-save-row">
                <input
                  id="as-save-email"
                  type="email"
                  value={saveEmail}
                  onChange={(e) => setSaveEmail(e.target.value)}
                  placeholder="you@company.com"
                  maxLength={200}
                />
                <button type="submit" className="as-cta as-cta-sm">Send me a link</button>
                <button type="button" className="as-link" onClick={() => setSaveOpen(false)}>Cancel</button>
              </div>
              {saveError && <div className="as-err">{saveError}</div>}
            </form>
          )}
          {saveSent && (
            <div className="as-save-confirm" role="status">
              Check your inbox, your link is on the way.
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default SelfAssessment;