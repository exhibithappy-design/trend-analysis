import { useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';

import './HIMSSReport.css';
import './TrendReport2026.css';

// NOTE: Images flagged "confirm license" pull from Unsplash via source.unsplash.com
// using descriptive queries. These should be replaced with licensed assets before
// going live on a public domain. Direct Unsplash photo IDs (BKpOVik79lA,
// PwlsQn-RyRU, tI-Gx5FanJI) are free-to-use per the user-supplied references and
// are referenced here via the same source.unsplash.com pattern for portability.

type Trend = {
  id: string;
  num: number;
  category: 'Functional Component' | 'Design Feature';
  title: string;
  bullets: string[];
  yoy: string;
  question: string;
  image: string;
  imageAlt: string;
  licenseNote?: boolean;
  cluster: 'Flexibility' | 'Budget' | 'Design';
};

const TRENDS: Trend[] = [
  {
    id: 't1',
    num: 1,
    category: 'Functional Component',
    title: 'The Death of the Product Theater',
    bullets: [
      'Passive scripted presentations are being replaced by attendee-led, hands-on experience zones',
      'Freeman 2025 Commerce Report: 71% of attendees want self-directed demos, not stage presentations',
      'By 2026, leading exhibitors at HIMSS, InfoComm, and NAB have largely eliminated fixed presentation stages',
    ],
    yoy: "TSE 2024 flagged the shift beginning; by 2026 it's the dominant model at enterprise booths across all major categories.",
    question: 'Is your booth built around what your team wants to say, or what your attendee wants to discover?',
    // Unsplash photo BKpOVik79lA — free to use
    image: 'https://source.unsplash.com/BKpOVik79lA/1600x900',
    imageAlt: 'People at a business exhibition interacting with a booth',
    cluster: 'Design',
  },
  {
    id: 't2',
    num: 2,
    category: 'Functional Component',
    title: 'Gamification as Lead-Gen Infrastructure',
    bullets: [
      'Interactive games (leaderboards, timed challenges, spin-to-win) are now primary lead capture mechanisms, not novelty add-ons',
      'AI photo booth at CONEXPO 2026 drove 400+ interactions in 5 hours with zero manual badge scanning',
      'Gamified booths report 3–5x longer dwell times than static exhibitors in the same footprint',
    ],
    yoy: 'In 2024, gamification was a differentiator; by 2026 mid-market and enterprise exhibitors expect it. Booths without a play mechanic feel transactional.',
    question: 'When a qualified lead walks into your booth, is the first interaction memorable or administrative?',
    image: 'https://source.unsplash.com/featured/1600x900/?tradeshow,gamification,interactive',
    imageAlt: 'Interactive gaming activation at a trade show',
    licenseNote: true,
    cluster: 'Design',
  },
  {
    id: 't3',
    num: 3,
    category: 'Functional Component',
    title: 'The Invite-Only Booth Architecture',
    bullets: [
      'Open floor plans are being replaced with tiered access environments: public front, private back',
      'Jack Morton (CES 2026): invite-only areas generate 4x more qualified meeting time than open-access spaces',
      '"Public front, private back" layouts create distinct experiences for casual traffic vs. priority accounts',
    ],
    yoy: 'In 2024 this was a luxury-brand tactic (automotive at CES). By 2026, B2B healthcare and tech exhibitors at HIMSS and Money20/20 are adopting it at scale.',
    question: 'Does your booth treat a Fortune 500 prospect the same way as a first-time visitor?',
    // Unsplash photo PwlsQn-RyRU — free to use
    image: 'https://source.unsplash.com/PwlsQn-RyRU/1600x900',
    imageAlt: 'Elegant lounge area with plush seating and ambient lighting',
    cluster: 'Flexibility',
  },
  {
    id: 't4',
    num: 4,
    category: 'Functional Component',
    title: 'AI as a Booth Staff Member',
    bullets: [
      'AI avatar kiosks handle front-of-house qualification, product storytelling, and scheduling without human fatigue',
      'Samsung and ESTsoft debuted the "AI Promoter" at CES 2026, engaging thousands in natural conversation',
      'Real-time behavioral analytics now score leads by dwell time, question patterns, and engagement signals',
    ],
    yoy: 'In 2024, AI in booths meant chatbots on tablets. By 2026, lifelike interactive avatars are commercially deployed by top exhibitors across CES, GITEX, and CONEXPO.',
    question: 'If your best sales rep could clone themselves for show floor duty, what would change about your ROI?',
    image: 'https://source.unsplash.com/featured/1600x900/?digital-human,kiosk,touchscreen',
    imageAlt: 'Interactive technology kiosk with digital human screen',
    licenseNote: true,
    cluster: 'Budget',
  },
  {
    id: 't5',
    num: 5,
    category: 'Functional Component',
    title: 'The Modular-First Mandate',
    bullets: [
      'Single-use custom timber builds are being phased out for reconfigurable modular systems',
      'Global modular exhibition stand market: $1.54B in 2025, growing 9.2% CAGR through 2034',
      'Modular systems reduce per-show cost 30–50% while allowing configuration for different footprints',
    ],
    yoy: 'In 2024, modular was budget-driven by mid-size exhibitors. By 2026, enterprise brands (Somfy\'s "Most Sustainable Stand" winner at YED 2026) use it as a brand statement.',
    question: 'What percentage of your exhibit budget is being rebuilt from scratch each cycle?',
    image: 'https://source.unsplash.com/featured/1600x900/?modular,architecture,exhibition',
    imageAlt: 'Modular architectural exhibition structure',
    licenseNote: true,
    cluster: 'Budget',
  },
  {
    id: 't6',
    num: 6,
    category: 'Functional Component',
    title: 'Dumping Vanity Metrics for Pipeline Signals',
    bullets: [
      'Badge scan count as primary KPI is in decline; pipeline quality metrics are replacing it',
      'Exhibitor Group 2026: companies tracking scan volume saw no correlation with post-show revenue',
      'AI tools now track dwell time, repeat visits, conversation depth, and real-time sentiment scoring',
    ],
    yoy: 'Shift began in 2024 as AI analytics tools hit accessible price points. By 2026, "how many leads?" is being replaced by "how many went to pipeline?" in exec show reports.',
    question: 'If you removed badge scan count from your show report, what would you actually have left to show?',
    image: 'https://source.unsplash.com/featured/1600x900/?analytics,dashboard,data',
    imageAlt: 'Data analytics dashboard with business metrics',
    licenseNote: true,
    cluster: 'Budget',
  },
  {
    id: 't7',
    num: 7,
    category: 'Design Feature',
    title: 'Dark Architectural Finishes Are Taking Over',
    bullets: [
      'Matte black, charcoal, deep navy, and rich wood tones are replacing the traditional white-and-bright exhibit palette',
      'Dark finishes create contrast zones that draw attention to products and screens rather than the structure itself',
      'High-contrast lighting against dark surfaces performs significantly better in social content, extending booth ROI beyond the event',
    ],
    yoy: 'In 2024 this was a luxury/premium brand signal. By 2026, dark finishes appear in healthcare, tech, and financial services categories where white was once the unchallenged default.',
    question: 'If every competitor in your category shows up in white, what does dark say about your brand confidence?',
    // Unsplash photo tI-Gx5FanJI — free to use
    image: 'https://source.unsplash.com/tI-Gx5FanJI/1600x900',
    imageAlt: 'Luxurious booth seating with mural in dimly lit lounge',
    cluster: 'Design',
  },
  {
    id: 't8',
    num: 8,
    category: 'Design Feature',
    title: 'Double Deckers as the Enterprise Minimum',
    bullets: [
      'Two-story structures are becoming the baseline for large-show enterprise presence, not the exception',
      'Upper decks serve dual purpose: private meeting suites above, brand immersion and traffic flow below',
      'Double deck builds average $140–200K but deliver significantly higher qualified meeting volume per sq ft',
    ],
    yoy: "In 2024, double deckers were confined to automotive, pharma, and top-tier tech. By 2026 they're appearing across mid-sized healthcare and financial services exhibitors at HIMSS, Money20/20, and NAB.",
    question: 'If your best accounts could have a private, distraction-free conversation above the show floor, would your close rate improve?',
    image: 'https://source.unsplash.com/featured/1600x900/?mezzanine,two-story,architecture',
    imageAlt: 'Two-level architectural space with mezzanine',
    licenseNote: true,
    cluster: 'Flexibility',
  },
  {
    id: 't9',
    num: 9,
    category: 'Design Feature',
    title: '"Workspitality" — The Hospitality-Productivity Hybrid',
    bullets: [
      'Exhibitors are blending upscale hospitality (lounge seating, premium F&B) with productive workspace function (charging, Wi-Fi, meeting nooks)',
      'Goal: give attendees a reason to stay 14+ minutes rather than pass through in 90 seconds',
      'Zenus.ai case study: data-driven booth redesign engineered average 14-minute booth visits',
    ],
    yoy: '"Workspitality" as a coined category emerged in 2026, but component behaviors grew across Dubai, European, and North American shows since 2024.',
    question: 'Does your booth give a tired attendee a reason to sit down and stay, or does it expect them to stand and listen?',
    // Unsplash photo PwlsQn-RyRU — free to use
    image: 'https://source.unsplash.com/PwlsQn-RyRU/1600x900',
    imageAlt: 'Elegant lounge area with plush seating and ambient lighting',
    cluster: 'Flexibility',
  },
  {
    id: 't10',
    num: 10,
    category: 'Design Feature',
    title: 'F&B Integration as a Retention Strategy',
    bullets: [
      'Coffee bars, branded beverage stations, and curated food activations are replacing swag bags as the primary traffic driver',
      'RIMS RiskWorld 2026: branded coffee activation served 850+ drinks, driving sustained traffic all three show days',
      'M2 Academy at DentalExpo 2026 used a barista bar as its primary engagement mechanism, with visitors queuing to enter the booth',
    ],
    yoy: 'In 2024, promotional items still dominated. By 2026, branded F&B is the category default for enterprise exhibitors: more experiential, more social-media-worthy, and more likely to generate repeat visits.',
    question: 'What is your booth offering that makes an attendee want to come back a second time?',
    image: 'https://source.unsplash.com/featured/1600x900/?coffee-bar,barista,event',
    imageAlt: 'Coffee bar and premium beverage service at an event',
    licenseNote: true,
    cluster: 'Flexibility',
  },
  {
    id: 't11',
    num: 11,
    category: 'Design Feature',
    title: 'Curved & Organic Architecture Replacing the Grid',
    bullets: [
      'Rectangular right-angled structures are giving way to curved walls, circular layouts, and fluid organic forms',
      'Bioscience IMCAS Paris 2026: semi-circle wall elements created a sculptural entrance arch and seamless visitor journey',
      'Curved structures improve traffic flow, create natural aisle sight lines, and photograph dramatically better',
    ],
    yoy: "In 2024, curved architecture was primarily a European trade fair aesthetic. By 2026 it's appearing at North American shows (NAB, InfoComm, CONEXPO) as exhibitors break from the booth-as-box default.",
    question: 'If you removed all right angles from your exhibit, would your brand story be clearer or more confusing?',
    image: 'https://source.unsplash.com/featured/1600x900/?curved,organic,architecture,interior',
    imageAlt: 'Curved organic architectural interior',
    licenseNote: true,
    cluster: 'Design',
  },
  {
    id: 't12',
    num: 12,
    category: 'Design Feature',
    title: 'Industry Color Conformity = Zig-Zag Opportunity',
    bullets: [
      'Every major show has an invisible color rulebook: healthcare → blue/white, tech → dark/neutral, finance → navy/gold, construction → yellow/orange',
      'Exhibitors who deliberately break category color conventions report higher unsolicited traffic and stronger brand recall',
      'The most memorable booths at CES 2026 and HIMSS 2026 were those that chose palette deliberately against category norms',
    ],
    yoy: 'Color conformity has intensified in 2024–2026 as AI tools generate increasingly "safe" brand guidelines. The gap between conformist and breakout has widened, making palette deviation more powerful.',
    question: "If you removed your logo from your booth, which competitor's design would yours be mistaken for?",
    image: 'https://source.unsplash.com/featured/1600x900/?colorful,brand,activation,bold',
    imageAlt: 'Bold, colorful brand activation space',
    licenseNote: true,
    cluster: 'Design',
  },
];

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
  >
    {children}
  </motion.div>
);

const TrendCard = ({ trend, onImage }: { trend: Trend; onImage: (s: string) => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="trend-card" id={trend.id}>
      <div className="tc-media" onClick={() => onImage(trend.image)} style={{ cursor: 'pointer' }}>
        <img src={trend.image} alt={trend.imageAlt} loading="lazy" />
      </div>
      <div className="tc-body">
        <div className="tc-meta">
          <span className="tc-num">Trend #{trend.num}</span>
          <span className="tc-cat">{trend.category} Trend</span>
        </div>
        <h3 className="tc-title">{trend.title}</h3>
        <ul className="tc-bullets">
          {trend.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
        {open && (
          <div className="tc-depth">
            <div className="tc-yoy">
              <div className="yoy-label">Year-over-Year Insight</div>
              <p>{trend.yoy}</p>
            </div>
            <div className="tc-q">
              <div className="q-label">Strategic Question</div>
              <p>{trend.question}</p>
            </div>
          </div>
        )}
        <button
          className={`tc-toggle ${open ? 'open' : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {open ? 'Scan Mode' : 'Enter Depth Mode'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const TrendReport2026 = () => {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const toggleNav = useCallback(() => {
    document.getElementById('sidebar2')?.classList.toggle('open');
    document.getElementById('overlay2')?.classList.toggle('open');
  }, []);

  const closeMobile = useCallback(() => {
    document.getElementById('sidebar2')?.classList.remove('open');
    document.getElementById('overlay2')?.classList.remove('open');
  }, []);

  useEffect(() => {
    const sects = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.sidebar .nav-link');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            links.forEach((l) =>
              l.classList.toggle('active', l.getAttribute('href') === '#' + id),
            );
          }
        });
      },
      { rootMargin: '-15% 0px -75% 0px' },
    );
    sects.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  const handleGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  const functional = TRENDS.filter((t) => t.category === 'Functional Component');
  const design = TRENDS.filter((t) => t.category === 'Design Feature');

  return (
    <>
      <div className="pink-bar"></div>
      <div className="mobile-bar">
        <button className="hamburger" onClick={toggleNav} aria-label="Menu">
          <span></span>
        </button>
        <img src="/images/exhibit-happy-logo.svg" alt="Exhibit Happy" className="brand-mobile-logo" />
      </div>
      <div className="sidebar-overlay" id="overlay2" onClick={toggleNav}></div>
      <nav className="sidebar" id="sidebar2">
        <div className="sidebar-brand">
          <img src="/images/exhibit-happy-logo.svg" alt="Exhibit Happy" style={{ width: '140px' }} />
          <div className="report-label">2026 Exhibit<br />Trend Report</div>
        </div>
        <div className="sidebar-nav">
          <div className="nav-group-label">Report</div>
          <a href="#tldr" className="nav-link" onClick={closeMobile}>
            <span className="nav-num">00</span> TL;DR
          </a>
          <a href="#painpoints" className="nav-link" onClick={closeMobile}>
            <span className="nav-num">01</span> Pain Points
          </a>
          <div className="nav-group-label">Functional</div>
          {functional.map((t) => (
            <a key={t.id} href={`#${t.id}`} className="nav-link" onClick={closeMobile}>
              <span className="nav-num">{String(t.num).padStart(2, '0')}</span> {t.title.split(' ').slice(0, 4).join(' ')}
            </a>
          ))}
          <div className="nav-group-label">Design</div>
          {design.map((t) => (
            <a key={t.id} href={`#${t.id}`} className="nav-link" onClick={closeMobile}>
              <span className="nav-num">{String(t.num).padStart(2, '0')}</span> {t.title.split(' ').slice(0, 4).join(' ')}
            </a>
          ))}
          <div className="nav-group-label">Next</div>
          <a href="#gate" className="nav-link" onClick={closeMobile}>
            <span className="nav-num">--</span> Get the Full Report
          </a>
        </div>
        <div className="sidebar-footer">
          <span>&copy; 2026 Exhibit Happy</span>
        </div>
      </nav>

      <div className="main">
        <section className="hero" id="top">
          <div className="hero-img">
            <img
              src="https://source.unsplash.com/featured/1920x1080/?tradeshow,exhibition,floor"
              alt="2026 trade show exhibit floor"
            />
          </div>
          <div className="hero-ov"></div>
          <div className="hero-c">
            <div className="hero-ey">2026 Trend Report</div>
            <h1>
              12 Trends<br />
              <span className="thin">Reshaping the Show Floor</span>
            </h1>
            <p className="hero-sub">
              A field-built analysis across HIMSS, CES, CONEXPO, InfoComm, NAB, Money20/20, and more — organized into Functional Component Trends and Design Feature Trends. Each card opens from Scan Mode to Depth Mode.
            </p>
            <div className="hero-meta">
              <div className="hero-meta-item">
                <div className="label">Trends</div>
                <div className="value">12</div>
              </div>
              <div className="hero-meta-item">
                <div className="label">Categories</div>
                <div className="value">Functional · Design</div>
              </div>
              <div className="hero-meta-item">
                <div className="label">Published</div>
                <div className="value">June 2026</div>
              </div>
            </div>
          </div>
          <div className="hero-scroll">
            Scroll<br />&#9662;
          </div>
        </section>

        {/* TL;DR */}
        <section className="section section--w" id="tldr">
          <div className="pr"></div>
          <div className="sl">Section 00</div>
          <h2 className="st">TL;DR — The 2026 Exhibit Floor in 60 Seconds</h2>
          <FadeIn>
            <div className="tldr">
              <h3>What changed in 2026</h3>
              <p>
                The 2026 trade show floor has moved decisively from <strong>broadcast</strong> to <strong>experience</strong>. Static booths, scripted theaters, and badge-scan KPIs are being replaced by self-directed demos, AI staff, modular architecture, and pipeline-quality measurement. On the design side, dark architectural finishes, double-decker builds, curved organic forms, and integrated F&B are the new defaults across categories that used to be uniformly white.
              </p>
              <ul>
                <li><strong>Functional shift:</strong> attendee-led discovery, AI avatars, invite-only zones, modular systems, gamified lead capture, and pipeline metrics over scan counts.</li>
                <li><strong>Design shift:</strong> dark finishes, double-decker minimums, "workspitality" lounges, F&B retention plays, curved architecture, and deliberate color non-conformity.</li>
                <li><strong>Three pain-point clusters drive every trend below:</strong> Flexibility, Budget, and Design.</li>
              </ul>
            </div>
          </FadeIn>
        </section>

        {/* Pain point clusters */}
        <section className="section section--b" id="painpoints">
          <div className="pr"></div>
          <div className="sl">Section 01</div>
          <h2 className="st">The Three Pain-Point Clusters</h2>
          <FadeIn>
            <div className="pp-grid">
              <div className="pp">
                <div className="pp-label">Cluster 01</div>
                <div className="pp-title">Flexibility</div>
                <p className="pp-desc">
                  Booths that adapt to multiple shows, footprints, and audience tiers — without rebuilding from scratch. Tiered access, multi-story layouts, hospitality hybrids, and F&B retention plays.
                </p>
                <a className="pp-link" href="#t3">Trend 3</a>
                <a className="pp-link" href="#t8">Trend 8</a>
                <a className="pp-link" href="#t9">Trend 9</a>
                <a className="pp-link" href="#t10">Trend 10</a>
              </div>
              <div className="pp">
                <div className="pp-label">Cluster 02</div>
                <div className="pp-title">Budget</div>
                <p className="pp-desc">
                  Where exhibit dollars are flowing in 2026: AI staffing that doesn't fatigue, modular systems that cut 30–50% per show, and pipeline measurement that justifies six- and seven-figure spends.
                </p>
                <a className="pp-link" href="#t4">Trend 4</a>
                <a className="pp-link" href="#t5">Trend 5</a>
                <a className="pp-link" href="#t6">Trend 6</a>
              </div>
              <div className="pp">
                <div className="pp-label">Cluster 03</div>
                <div className="pp-title">Design</div>
                <p className="pp-desc">
                  How the floor looks and feels different: dark finishes, organic curves, deliberate color deviation, gamified play mechanics, and the death of the scripted product theater.
                </p>
                <a className="pp-link" href="#t1">Trend 1</a>
                <a className="pp-link" href="#t2">Trend 2</a>
                <a className="pp-link" href="#t7">Trend 7</a>
                <a className="pp-link" href="#t11">Trend 11</a>
                <a className="pp-link" href="#t12">Trend 12</a>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* Functional Component Trends */}
        <section id="cat-functional">
          <div className="ch">
            <div className="cn">01</div>
            <div className="cname">Functional Component Trends</div>
          </div>
          <div className="section section--w" style={{ paddingTop: 40 }}>
            {functional.map((t) => (
              <FadeIn key={t.id}>
                <TrendCard trend={t} onImage={setLightboxSrc} />
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Design Feature Trends */}
        <section id="cat-design">
          <div className="ch">
            <div className="cn">02</div>
            <div className="cname">Design Feature Trends</div>
          </div>
          <div className="section section--w" style={{ paddingTop: 40 }}>
            {design.map((t) => (
              <FadeIn key={t.id}>
                <TrendCard trend={t} onImage={setLightboxSrc} />
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Soft gate CTA */}
        <section className="section section--b" id="gate">
          <div className="pr"></div>
          <div className="sl">Get the full report</div>
          <h2 className="st">Want the full PDF with case studies, source citations, and the 2027 outlook?</h2>
          <FadeIn>
            <div className="gate">
              <div className="gate-inner">
                <div>
                  <h3>The 2026 Exhibit Trend Report — Full Edition</h3>
                  <p>
                    Everything on this page, plus the supporting case studies, vendor citations, photo references, and our 2027 outlook on where the floor is headed next.
                  </p>
                  <ul>
                    <li>Full case studies from Samsung, Jack Morton, Freeman, Zenus.ai, and more</li>
                    <li>2027 outlook: what to plan for next year</li>
                    <li>Source citations and licensed photography</li>
                    <li>Printable PDF, formatted for client distribution</li>
                  </ul>
                </div>
                <div className="gate-form">
                  {submitted ? (
                    <div className="gate-success">
                      <strong>Check your inbox.</strong>
                      The full report is on its way to {email}.
                    </div>
                  ) : (
                    <form onSubmit={handleGate}>
                      <label htmlFor="gate-email">Work email</label>
                      <input
                        id="gate-email"
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <button type="submit">Send me the report</button>
                      <div className="gate-fine">
                        No spam. We'll send the PDF once and add you to the trend report list for next year.
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      </div>

      {lightboxSrc && (
        <div className="lightbox-overlay" onClick={() => setLightboxSrc(null)}>
          <button className="lightbox-close" onClick={() => setLightboxSrc(null)}>
            &times;
          </button>
          <img src={lightboxSrc} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
};

export default TrendReport2026;