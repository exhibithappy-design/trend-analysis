import { useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, Download, LayoutGrid, DollarSign, Palette } from 'lucide-react';


import './HIMSSReport.css';
import './TrendReport2026.css';
import ehLogo from '@/assets/exhibithappy-logo.svg.asset.json';

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
  depth: string[];
  gallery: { src: string; alt: string }[];
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
    title: 'Death of the Product Theater',
    bullets: [
      'The scripted, rep-led feature walkthrough is dying — buyers want proof, not presentations',
      'Booths built around outcomes and live problem-solving are replacing product demos as theater',
      'The new mandate: stop performing the product, start solving the visitor\'s actual problem in front of them',
    ],
    yoy: 'From "here\'s what it does" to "watch it solve your problem."',
    question: 'Is your booth designed to present, or to prove?',
    // Unsplash photo BKpOVik79lA — free to use
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'People at a business exhibition interacting with a booth',
    cluster: 'Design',
    depth: [
      'The scripted, rep-led feature walkthrough is dying. Buyers have sat through enough polished decks to know the difference between a rehearsed pitch and a real result — and they\'ve stopped giving credit for the former.',
      'Booths built around outcomes and live problem-solving are replacing product demos as theater. The hero moment is no longer the reveal of a feature; it\'s the visible solving of a problem the visitor walked in carrying.',
      'The shift reframes the booth as a working environment instead of a stage. Square footage moves out of seating banks and into solution stations where staff can actually demonstrate value against a buyer\'s real scenario.',
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=900&auto=format&fit=crop&q=80', alt: 'Attendees engaging hands-on with a product demo station' },
      { src: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=900&auto=format&fit=crop&q=80', alt: 'Modern interactive product experience zone' },
    ],
  },
  {
    id: 't2',
    num: 2,
    category: 'Functional Component',
    title: 'Gamification as Lead-Gen Infrastructure',
    bullets: [
      'Game mechanics aren\'t a crowd trick anymore — they\'re the lead capture engine',
      'Challenges, leaderboards, and QR-gated registration are replacing badge scans as the primary data layer',
      'Participation qualifies the visitor: who they are, what they care about, and how engaged they actually were',
    ],
    yoy: 'From passive scanning to active participation that qualifies itself.',
    question: 'Is your booth game generating pipeline data or just foot traffic?',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Interactive gaming activation at a trade show',
    licenseNote: true,
    cluster: 'Design',
    depth: [
      'Game mechanics aren\'t a crowd trick anymore — they\'re the lead capture engine. Challenges, leaderboards, and QR-gated registration sit where the badge scanner used to live, turning curiosity into structured first-party data.',
      'The participation itself does the qualifying work. Who opted in, which scenario they picked, how far they got, what role they self-identified as — every interaction emits signal that a passive scan never could.',
      'The exhibitors winning with this are treating the game as infrastructure, not entertainment. It\'s designed alongside the CRM hand-off, the staff scripting, and the post-show sequence, not bolted on after the booth is built.',
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=900&auto=format&fit=crop&q=80', alt: 'Bright interactive game activation at a conference' },
      { src: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&auto=format&fit=crop&q=80', alt: 'Attendees competing in a branded leaderboard challenge' },
    ],
  },
  {
    id: 't3',
    num: 3,
    category: 'Functional Component',
    title: 'Immersive Storyworld Booths',
    bullets: [
      'Award-winning brands are building entire themed environments — one strong premise, committed all the way',
      'Verkada\'s Louvre heist at ISC West 2026 is the benchmark: the theme IS the demo',
      'Visitors don\'t tour the booth, they enter a narrative world that frames every product moment',
    ],
    yoy: 'From branded walls to narrative worlds visitors move through.',
    question: 'Can you describe your booth concept in one sentence?',
    // Unsplash photo PwlsQn-RyRU — free to use
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Immersive themed brand environment at a trade show',
    cluster: 'Flexibility',
    depth: [
      'Award-winning brands are building entire themed environments around one strong premise, committed all the way. No mixed metaphors, no competing messages — every surface, prop, and staff cue serves the same narrative.',
      'Verkada\'s Louvre heist activation at ISC West 2026 is the benchmark: a single creative idea executed at full conviction, where the theme itself functioned as the product demonstration. The story made the technology unforgettable.',
      'The discipline this requires is editorial more than architectural. The brands that win have a one-sentence concept they\'ll defend against every "could we also add…" — and the design holds together because of what was left out.',
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80', alt: 'Private meeting suite within a larger exhibit space' },
      { src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&auto=format&fit=crop&q=80', alt: 'Tiered exhibit layout with public and private zones' },
    ],
  },
  {
    id: 't4',
    num: 4,
    category: 'Functional Component',
    title: 'AI in the Arena: Engagement That Demonstrates AND Delights',
    bullets: [
      'The smartest exhibitors aren\'t showing AI in a keynote — they\'re putting it inside the booth game',
      'Challenges adapt to your skill level, quizzes branch by role, scenarios make the AI\'s capability the thing being experienced',
      'The engagement IS the proof of concept — visitors leave knowing the product works because they just used it',
    ],
    yoy: '2024 = game as crowd magnet. 2026 = game as live AI product demo.',
    question: 'Is your booth engagement just entertaining, or is it proof that your AI actually works?',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Interactive technology kiosk with digital human screen',
    licenseNote: true,
    cluster: 'Budget',
    depth: [
      'The smartest exhibitors aren\'t showing AI in a keynote — they\'re putting it inside the booth game. Challenges that adapt to skill level, quizzes that branch by role, and scenarios where the AI\'s capability is the thing being experienced rather than narrated.',
      'The engagement IS the proof of concept. When a visitor finishes a 90-second interactive challenge that adapted to their answers in real time, they don\'t need a follow-up slide explaining "what our AI can do" — they just felt it.',
      'The arc from 2024 to 2026 is clean: the game used to be the crowd magnet that pulled people toward the real demo. Now the game is the demo. The mechanic and the message have collapsed into the same moment.',
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&auto=format&fit=crop&q=80', alt: 'Interactive AI display engaging visitors' },
      { src: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=900&auto=format&fit=crop&q=80', alt: 'Touchscreen kiosk with AI-driven interface' },
    ],
  },
  {
    id: 't5',
    num: 5,
    category: 'Functional Component',
    title: 'The Modular-First Mandate',
    bullets: [
      'Single-use custom builds are being phased out as the default approach to exhibit design',
      'The new standard is a modular system designed across 3–5 shows, scalable from 10x10 to island, reconfigurable by market',
      'Sustainability pressure from finance, procurement, and brand teams is accelerating the shift',
    ],
    yoy: 'From "build for the show" to "build for the circuit."',
    question: 'How many shows is your current booth designed to serve?',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Modular architectural exhibition structure',
    licenseNote: true,
    cluster: 'Budget',
    depth: [
      'Single-use custom builds are being phased out as the default. The new baseline is a modular system designed across three to five shows, scalable from a 10x10 inline to an island footprint, and reconfigurable to match each market.',
      'Sustainability pressure is accelerating the shift from every direction at once — finance wants lower per-show cost, procurement wants reusable inventory, and brand teams want to stop defending landfill optics in their annual reports.',
      'The strategic reframe is "build for the circuit," not "build for the show." Booth assets become a managed inventory with a multi-year ROI, not a one-time spend that ends in a dumpster after teardown.',
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=900&auto=format&fit=crop&q=80', alt: 'Modular exhibition structure being assembled' },
      { src: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&auto=format&fit=crop&q=80', alt: 'Reconfigurable trade show stand components' },
    ],
  },
  {
    id: 't6',
    num: 6,
    category: 'Functional Component',
    title: 'Dumping Vanity Metrics for Pipeline Signals',
    bullets: [
      'Badge scans and booth traffic numbers are losing credibility with CFOs',
      'Exhibitors advancing are tracking demo completions, meeting conversions, content downloads, and post-show pipeline attribution',
      'The post-show report is becoming a revenue document, not an activity summary',
    ],
    yoy: 'From "we had 2,000 visitors" to "we generated 34 qualified opportunities."',
    question: 'What does your post-show report actually prove?',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Data analytics dashboard with business metrics',
    licenseNote: true,
    cluster: 'Budget',
    depth: [
      'Badge scans and booth traffic numbers are losing credibility with CFOs. Executives have stopped accepting raw lead volume as evidence of return and are pushing exhibit teams to report on pipeline outcomes the CRM can actually verify.',
      'The exhibitors advancing internally are tracking demo completions, meeting conversions, content downloads, and post-show pipeline attribution. Each of those measurements maps to a downstream stage finance can audit against revenue.',
      'The post-show report has become a revenue document, not an activity summary. "We had 2,000 visitors" is being replaced by "we generated 34 qualified opportunities" — and the second sentence wins the next year\'s budget defense.',
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=80', alt: 'Pipeline analytics dashboard on a laptop screen' },
      { src: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=900&auto=format&fit=crop&q=80', alt: 'Sales pipeline data visualization' },
    ],
  },
  {
    id: 't7',
    num: 7,
    category: 'Functional Component',
    title: 'The Self-Serve Demo Revolution',
    bullets: [
      'Buyers want to explore on their own terms, not wait for a scheduled walkthrough',
      'Interactive, role-adaptive demo stations give attendees control of pace, path, and relevance',
      'The data trails they leave behind are pure pipeline intelligence — what was viewed, in what order, for how long',
    ],
    yoy: 'From rep-led walkthroughs to buyer-directed self-discovery.',
    question: 'Can a prospect fully understand your value proposition without talking to a single staff member?',
    // Unsplash photo tI-Gx5FanJI — free to use
    image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Self-serve interactive demo station at a trade show',
    cluster: 'Design',
    depth: [
      'Buyers want to explore on their own terms, not wait for a scheduled walkthrough. The waiting itself — for a rep to free up, for a presentation to begin — is now a leading reason qualified visitors walk past a booth they would otherwise enter.',
      'Interactive, role-adaptive demo stations are giving attendees control of pace, path, and relevance. A clinical buyer and a CIO entering the same kiosk see different default journeys without anyone having to ask which one they are.',
      'The data trails are the bonus. Every click is signal: what was viewed, in what order, for how long, where the visitor stopped. That stream becomes pipeline intelligence that no rep-led conversation could have captured and logged.',
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&auto=format&fit=crop&q=80', alt: 'Dark, dramatic interior with focused lighting' },
      { src: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=900&auto=format&fit=crop&q=80', alt: 'Matte black architectural finish with warm accent lighting' },
    ],
  },
  {
    id: 't8',
    num: 8,
    category: 'Functional Component',
    title: 'The Booth as Campaign Asset',
    bullets: [
      'The booth is no longer the event — it\'s the content hub for a 6-week campaign',
      'Pre-show teasers, live social capture, post-show video clips, and email sequences are planned before the build begins',
      'Booth design decisions now have to serve the camera and the campaign, not just the floor visitor',
    ],
    yoy: 'From one-week activation to always-on content engine.',
    question: 'What content does your booth produce before, during, and after the show?',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Branded content production setup at a live event',
    licenseNote: true,
    cluster: 'Flexibility',
    depth: [
      'The booth is no longer the event — it\'s the content hub for a six-week campaign that surrounds the event. The week on the floor is the production shoot; the value lives in what gets cut, posted, and sequenced before and after.',
      'Pre-show teasers, live social capture, post-show video clips, and follow-up email sequences are now planned before the build begins. Camera angles, lighting, and "hero shot" zones get designed alongside the floor plan, not after.',
      'This reframes every design decision. The booth has to serve two audiences simultaneously — the visitor walking through it, and the much larger remote audience watching the campaign that the booth feeds.',
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&auto=format&fit=crop&q=80', alt: 'Mezzanine level above an active exhibit floor' },
      { src: 'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=900&auto=format&fit=crop&q=80', alt: 'Two-story architectural structure with upper deck meeting area' },
    ],
  },
  {
    id: 't9',
    num: 9,
    category: 'Design Feature',
    title: 'LED as the Booth\'s Operating System',
    bullets: [
      'LED is no longer a display — it\'s the architecture itself',
      'Floor-to-ceiling walls, ceiling canopies, and dynamic content zones change by session, audience, or time of day',
      'The booth becomes a programmable environment that re-skins itself for each audience segment',
    ],
    yoy: 'From screens on a wall to walls as screens.',
    question: 'Is your visual technology flexible enough to serve every audience segment on the floor?',
    // Unsplash photo PwlsQn-RyRU — free to use
    image: 'https://images.unsplash.com/photo-1564540583246-934409427776?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Floor-to-ceiling LED wall as exhibit architecture',
    cluster: 'Flexibility',
    depth: [
      'LED is no longer a display bolted onto a wall — it has become the wall, the ceiling, and increasingly the floor. The exhibit architecture itself is luminous, dynamic, and addressable rather than printed and fixed.',
      'Floor-to-ceiling walls, ceiling canopies, and dynamic content zones now change by session, audience, or time of day. The same physical booth presents a completely different environment for the 9am clinical demo and the 4pm executive reception.',
      'The shift turns the booth into a programmable operating system. Content schedules replace graphic packages, and the cost of pivoting messaging mid-show drops to a file swap instead of a reprint.',
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&auto=format&fit=crop&q=80', alt: 'Upscale hospitality lounge with workspace amenities' },
      { src: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&auto=format&fit=crop&q=80', alt: 'Collaborative lounge with seating and laptops' },
    ],
  },
  {
    id: 't10',
    num: 10,
    category: 'Design Feature',
    title: 'Transparent LED / ClearLED as Architecture',
    bullets: [
      'ClearLED is moving from novelty to structural material',
      'Brands are using it as entry portals, hanging planes, and semi-open facades',
      'Visual impact without closing off the booth or adding the visual bulk of a solid wall',
    ],
    yoy: 'From "giant screen" to "breathable media architecture."',
    question: 'Does your display technology open your booth or wall it off?',
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Transparent LED panel forming an entry portal',
    licenseNote: true,
    cluster: 'Flexibility',
    depth: [
      'Transparent LED — ClearLED — is moving from novelty effect into structural material. Brands are deploying it as entry portals, hanging planes, and semi-open facades that carry video content without behaving like an opaque wall.',
      'The strategic appeal is that you get the visual impact of a massive screen without sacrificing the sightlines and openness that make a booth approachable. Visitors can see through the architecture, which means they keep walking toward it.',
      'The reframe is from "giant screen" to "breathable media architecture." The display becomes part of the booth\'s skeleton rather than a slab parked in front of it — closer to stage scenery than to a TV.',
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&auto=format&fit=crop&q=80', alt: 'Branded coffee bar at an event activation' },
      { src: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=900&auto=format&fit=crop&q=80', alt: 'Specialty coffee preparation in a booth setting' },
    ],
  },
  {
    id: 't11',
    num: 11,
    category: 'Design Feature',
    title: 'Biophilic Design as Core Strategy',
    bullets: [
      'Living green walls, light woods, natural textures, and soft lounge zones are replacing hard, tech-heavy builds',
      'Multiple 2026 exhibit trend sources name biophilic design one of the most significant aesthetic shifts of the year',
      'The booth becomes a brand sanctuary on a chaotic floor — a deliberate stress-reduction signal',
    ],
    yoy: 'From "tech showcase" to "brand sanctuary."',
    question: 'Does your booth reduce attendee stress or add to it?',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Biophilic exhibit design with living green wall and natural textures',
    licenseNote: true,
    cluster: 'Design',
    depth: [
      'Living green walls, light woods, natural textures, and soft lounge zones are replacing the hard, tech-heavy build as the dominant booth aesthetic. The visual change is unmistakable from across the aisle, and the felt change is even bigger inside.',
      'Multiple independent 2026 exhibit-trend sources flagged biophilic design as one of the most significant aesthetic shifts of the year. The convergence isn\'t accidental — it reflects how exhausted attendees are after three days of LED and noise.',
      'The reframe is "tech showcase" to "brand sanctuary." On a chaotic floor, the booth that feels physically calming becomes a destination people choose deliberately — and stay in longer.',
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=900&auto=format&fit=crop&q=80', alt: 'Curved organic architectural facade' },
      { src: 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=900&auto=format&fit=crop&q=80', alt: 'Sculptural curved interior space' },
    ],
  },
  {
    id: 't12',
    num: 12,
    category: 'Design Feature',
    title: 'The One-Idea Booth: Sharp Concept Over Scenic Complexity',
    bullets: [
      'EXHIBITOR\'s 2025 award analysis found one universal trait across winners: a single organizing idea executed completely',
      'Not a collage of product messages — one sentence, committed all the way through layout, graphics, and staff scripting',
      'In 2026, judges reward conceptual clarity as much as visual ambition',
    ],
    yoy: 'From "impressive build" to "unforgettable premise."',
    question: 'What\'s the one idea your booth communicates, and does every element serve it?',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Booth design unified by a single bold creative concept',
    licenseNote: true,
    cluster: 'Design',
    depth: [
      'EXHIBITOR\'s 2025 award analysis surfaced one trait shared by every winner: a single organizing idea executed completely. Not a clever feature, not a great photo — a unifying premise that every element of the booth was clearly built to serve.',
      'The losing pattern is a collage of product messages stacked into one footprint. The winning pattern is one sentence, committed all the way through layout, graphics, lighting, staff scripting, and giveaway. Everything off-thesis gets cut.',
      'In 2026, judges and buyers alike reward conceptual clarity as much as visual ambition. An "impressive build" without a premise loses to a simpler booth with an unforgettable one — because the premise is what gets remembered after teardown.',
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&auto=format&fit=crop&q=80', alt: 'Bold, saturated color exhibit activation' },
      { src: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900&auto=format&fit=crop&q=80', alt: 'Vivid color palette installation breaking category norms' },
    ],
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
        {!open && (
          <ul className="tc-bullets">
            {trend.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}
        {open && (
          <div className="tc-depth">
            <div className="tc-prose">
              {trend.depth.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="tc-gallery">
              {trend.gallery.map((g, i) => (
                <figure key={i} className="tc-gallery-item" onClick={() => onImage(g.src)}>
                  <img src={g.src} alt={g.alt} loading="lazy" />
                </figure>
              ))}
            </div>
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
          {open ? 'Compact Mode' : 'Enter Depth Mode'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// NOTE: Hero slider uses placeholder Unsplash trade show / exhibition floor
// images. Confirm license / replace with owned imagery before public launch.
const HERO_SLIDES = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1920&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=1920&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1920&auto=format&fit=crop&q=80',
];

const TrendReport2026 = () => {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setHeroIdx((i) => (i + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

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

  const trendShortLabel = (t: Trend) => {
    const map: Record<string, string> = {
      t1: 'Product Theater',
      t2: 'Gamification',
      t3: 'Invite-Only',
      t4: 'AI Booth Staff',
      t5: 'Modular Builds',
      t6: 'Pipeline Metrics',
      t7: 'Dark Finishes',
      t8: 'Double Deckers',
      t9: 'Workspitality',
      t10: 'F&B Retention',
      t11: 'Curved Forms',
      t12: 'Color Zig-Zag',
    };
    return map[t.id] ?? t.title;
  };

  return (
    <>
      <div className="pink-bar"></div>
      <div className="mobile-bar">
        <button className="hamburger" onClick={toggleNav} aria-label="Menu">
          <span></span>
        </button>
        <img src={ehLogo.url} alt="Exhibit Happy" className="brand-mobile-logo" />
      </div>
      <div className="sidebar-overlay" id="overlay2" onClick={toggleNav}></div>
      <nav className="sidebar" id="sidebar2">
        <div className="sidebar-brand">
          <img src={ehLogo.url} alt="Exhibit Happy" />
          <div className="report-label" style={{ whiteSpace: 'nowrap' }}>2026 Exhibit Trend Report</div>
        </div>
        <div className="sidebar-nav">
          <div className="nav-group-label">Report</div>
          <a href="#tldr" className="nav-link" onClick={closeMobile}>
            <FileText size={13} className="nav-icon" /> TL;DR
          </a>
          <a href="#painpoints" className="nav-link" onClick={closeMobile}>
            <AlertTriangle size={13} className="nav-icon" /> Pain Points
          </a>
          <div className="nav-group-label">Functional</div>
          {functional.map((t) => (
            <a key={t.id} href={`#${t.id}`} className="nav-link" onClick={closeMobile}>
              <span className="nav-num">{String(t.num).padStart(2, '0')}</span> {trendShortLabel(t)}
            </a>
          ))}
          <div className="nav-group-label">Design</div>
          {design.map((t) => (
            <a key={t.id} href={`#${t.id}`} className="nav-link" onClick={closeMobile}>
              <span className="nav-num">{String(t.num).padStart(2, '0')}</span> {trendShortLabel(t)}
            </a>
          ))}
          <div className="nav-group-label">Next</div>
          <a href="#gate" className="nav-link" onClick={closeMobile}>
            <Download size={13} className="nav-icon" /> Get Full Report
          </a>
        </div>
        <div className="sidebar-footer">
          <span>&copy; 2026 Exhibit Happy</span>
        </div>
      </nav>

      <div className="main">
        <section className="hero" id="top">
          <div className="hero-img hero-slider" aria-hidden="true">
            {HERO_SLIDES.map((src, i) => (
              <div
                key={src}
                className={`hero-slide ${i === heroIdx ? 'is-active' : ''}`}
              >
                <img src={src} alt="" />
              </div>
            ))}
          </div>
          <div className="hero-ov"></div>
          <div className="hero-grad-bl" aria-hidden="true"></div>
          <div className="hero-c">
            <div className="hero-ey">2026 Trend Report</div>
            <h1>
              We Attended the Biggest<br />
              Trade Shows of 2026<br />
              <span className="thin">So You Don't Have To</span>
            </h1>
            <p className="hero-sub">
              From January through June 2026, our team was on the ground at HIMSS, CES, CONEXPO, InfoComm, NAB, Money20/20, and more — distilling 12 actionable trends that give busy B2B exhibit marketers a strategic edge. No flights. No badge lines. Just the intelligence that matters.
            </p>
          </div>
          <div className="hero-scroll">
            Scroll<br />&#9662;
          </div>
        </section>

        {/* TL;DR */}
        <section className="section section--w" id="tldr">
          <div className="pr"></div>
          <div className="sl">Section 00</div>
          <h2 className="st">TL;DR — Your Strategic Edge in 60 Seconds</h2>
          <FadeIn>
            <div className="tldr">
              <h3>What changed in 2026</h3>
              <p>
                We spent 2026 embedded at the industry's most important trade shows so you don't have to. The exhibit floor has moved decisively from <strong>broadcast</strong> to <strong>experience</strong>. Static booths, scripted theaters, and badge-scan KPIs are being replaced by self-directed demos, AI staff, modular architecture, and pipeline-quality measurement. On the design side, dark architectural finishes, double-decker builds, curved organic forms, and integrated F&B are the new defaults across categories that used to be uniformly white.
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
            <p className="pp-intro">
              We heard the same three challenges from marketers at every show we covered — the friction points that keep showing up in booth briefs, RFPs, and post-show debriefs. Every trend in this report maps back to at least one of them, so you can focus on strategy instead of scouting.
            </p>
            <div className="pp-grid">
              <div className="pp">
                <div className="pp-icon"><LayoutGrid size={22} /></div>
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
                <div className="pp-icon"><DollarSign size={22} /></div>
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
                <div className="pp-icon"><Palette size={22} /></div>
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