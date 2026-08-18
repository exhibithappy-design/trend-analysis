import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, Mail, LayoutGrid, DollarSign, Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';


import './HIMSSReport.css';
import './TrendReport2026.css';
import ehLogo from '@/assets/exhibithappy-logo.svg.asset.json';
import teamPhoto from '@/assets/exhibit-happy-team.png.asset.json';
import SelfAssessment from './SelfAssessment';

const BUCKET_NAME = 'trend-images';
const SIGNED_URL_TTL_SECONDS = 31536000; // 1 year
const SIGNED_URL_CACHE_KEY = 'trend-images-signed-urls-v1';
const SIGNED_URL_CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30 * 11; // ~11 months

const BUCKET_FILES = [
  'hero-1.jpg', 'hero-2.jpg', 'hero-3.jpg', 'hero-4.jpg',
  'trend-01-header.jpg', 'trend-01-detail-a.jpg', 'trend-01-detail-b.jpg',
  'trend-02-header.jpg', 'trend-02-detail-a.jpg', 'trend-02-detail-b.jpg',
  'trend-03-header.jpg', 'trend-03-detail-a.jpg', 'trend-03-detail-b.jpg',
  'trend-04-header.jpg', 'trend-04-detail-a.jpg', 'trend-04-detail-b.jpg',
  'trend-05-header.jpg', 'trend-05-detail-a.jpg', 'trend-05-detail-b.jpg',
  'trend-06-header.jpg', 'trend-06-detail-a.jpg', 'trend-06-detail-b.jpg',
  'trend-07-header.jpg', 'trend-07-detail-a.jpg', 'trend-07-detail-b.jpg',
  'trend-08-header.jpg', 'trend-08-detail-a.jpg', 'trend-08-detail-b.jpg',
  'trend-09-header.jpg', 'trend-09-detail-a.jpg', 'trend-09-detail-b.jpg',
  'trend-10-header.jpg', 'trend-10-detail-a.jpg', 'trend-10-detail-b.jpg',
  'trend-11-header.jpg', 'trend-11-detail-a.jpg', 'trend-11-detail-b.jpg',
  'trend-12-header.jpg', 'trend-12-detail-a.jpg', 'trend-12-detail-b.jpg',
] as const;

// Mutable map populated at runtime with signed URLs from Supabase storage.
// Until populated, bucketUrl() returns the provided Unsplash fallback.
const signedUrlMap: Record<string, string> = {};
const inflightSigned = new Set<string>();
let onSignedUrlsLoaded: (() => void) | null = null;

// Hydrate from localStorage cache so return visits skip the round trip.
(function hydrateSignedUrlCache() {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(SIGNED_URL_CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { ts: number; urls: Record<string, string> };
    if (!parsed?.ts || !parsed.urls) return;
    if (Date.now() - parsed.ts > SIGNED_URL_CACHE_MAX_AGE_MS) return;
    for (const [k, v] of Object.entries(parsed.urls)) {
      if (typeof v === 'string' && v) signedUrlMap[k] = v;
    }
  } catch {
    // ignore
  }
})();

function persistSignedUrlCache() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      SIGNED_URL_CACHE_KEY,
      JSON.stringify({ ts: Date.now(), urls: signedUrlMap }),
    );
  } catch {
    // ignore quota errors
  }
}

async function loadSignedUrls(files: readonly string[]) {
  const toFetch = files.filter((f) => f && !signedUrlMap[f] && !inflightSigned.has(f));
  if (!toFetch.length) return;
  toFetch.forEach((f) => inflightSigned.add(f));
  let added = 0;
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrls(toFetch as string[], SIGNED_URL_TTL_SECONDS);
    if (!error && Array.isArray(data)) {
      for (const row of data) {
        if (row?.path && row.signedUrl) {
          signedUrlMap[row.path] = row.signedUrl;
          added++;
        }
      }
    }
  } catch {
    // swallow — fallbacks remain in place
  }
  toFetch.forEach((f) => inflightSigned.delete(f));
  if (added > 0) {
    persistSignedUrlCache();
    onSignedUrlsLoaded?.();
  }
}

function bucketUrl(filename: string, fallback: string): string {
  return signedUrlMap[filename] ?? fallback;
}

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
  shortTitle: string;
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

const makeTrends = (): Trend[] => [
  {
    id: 't1',
    num: 1,
    category: 'Functional Component',
    title: 'Death of the Product Theater',
    shortTitle: 'Product Theater',
    bullets: [
      'The scripted, rep-led feature walkthrough is dying, buyers want proof, not presentations',
      'Booths built around outcomes and live problem-solving are replacing product demos as theater',
      'The new mandate: stop performing the product, start solving the visitor\'s actual problem in front of them',
    ],
    yoy: 'From "here\'s what it does" to "watch it solve your problem."',
    question: 'Is your booth designed to present, or to prove?',
    // Unsplash photo BKpOVik79lA, free to use
    image: bucketUrl('trend-01-header.jpg', ''),
    imageAlt: 'People at a business exhibition interacting with a booth',
    cluster: 'Design',
    depth: [
      'The scripted, rep-led feature walkthrough is dying. Buyers have sat through enough polished decks to know the difference between a rehearsed pitch and a real result, and they\'ve stopped giving credit for the former.',
      'Booths built around outcomes and live problem-solving are replacing product demos as theater. The hero moment is no longer the reveal of a feature; it\'s the visible solving of a problem the visitor walked in carrying.',
      'The shift reframes the booth as a working environment instead of a stage. Square footage moves out of seating banks and into solution stations where staff can actually demonstrate value against a buyer\'s real scenario.',
    ],
    gallery: [
      { src: bucketUrl('trend-01-detail-a.jpg', ''), alt: 'Attendees engaging hands-on with a product demo station' },
      { src: bucketUrl('trend-01-detail-b.jpg', ''), alt: 'Modern interactive product experience zone' },
    ],
  },
  {
    id: 't2',
    num: 2,
    category: 'Functional Component',
    title: 'Gamification as Lead-Gen Infrastructure',
    shortTitle: 'Lead-Gen Gamification',
    bullets: [
      'Game mechanics aren\'t a crowd trick anymore, they\'re the lead capture engine',
      'Challenges, leaderboards, and QR-gated registration are replacing badge scans as the primary data layer',
      'Participation qualifies the visitor: who they are, what they care about, and how engaged they actually were',
    ],
    yoy: 'From passive scanning to active participation that qualifies itself.',
    question: 'Is your booth game generating pipeline data or just foot traffic?',
    image: bucketUrl('trend-02-header.jpg', ''),
    imageAlt: 'Interactive gaming activation at a trade show',
    licenseNote: true,
    cluster: 'Design',
    depth: [
      'Game mechanics aren\'t a crowd trick anymore, they\'re the lead capture engine. Challenges, leaderboards, and QR-gated registration sit where the badge scanner used to live, turning curiosity into structured first-party data.',
      'The participation itself does the qualifying work. Who opted in, which scenario they picked, how far they got, what role they self-identified as, every interaction emits signal that a passive scan never could.',
      'The exhibitors winning with this are treating the game as infrastructure, not entertainment. It\'s designed alongside the CRM hand-off, the staff scripting, and the post-show sequence, not bolted on after the booth is built.',
    ],
    gallery: [
      { src: bucketUrl('trend-02-detail-a.jpg', ''), alt: 'Bright interactive game activation at a conference' },
      { src: bucketUrl('trend-02-detail-b.jpg', ''), alt: 'Attendees competing in a branded leaderboard challenge' },
    ],
  },
  {
    id: 't3',
    num: 3,
    category: 'Functional Component',
    title: 'Immersive Storyworld Booths',
    shortTitle: 'Storyworld Booths',
    bullets: [
      'Award-winning brands are building entire themed environments, one strong premise, committed all the way',
      'Verkada\'s Louvre heist at ISC West 2026 is the benchmark: the theme IS the demo',
      'Visitors don\'t tour the booth, they enter a narrative world that frames every product moment',
    ],
    yoy: 'From branded walls to narrative worlds visitors move through.',
    question: 'Can you describe your booth concept in one sentence?',
    // Unsplash photo PwlsQn-RyRU, free to use
    image: bucketUrl('trend-03-header.jpg', ''),
    imageAlt: 'Immersive themed brand environment at a trade show',
    cluster: 'Flexibility',
    depth: [
      'Award-winning brands are building entire themed environments around one strong premise, committed all the way. No mixed metaphors, no competing messages, every surface, prop, and staff cue serves the same narrative.',
      'Verkada\'s Louvre heist activation at ISC West 2026 is the benchmark: a single creative idea executed at full conviction, where the theme itself functioned as the product demonstration. The story made the technology unforgettable.',
      'The discipline this requires is editorial more than architectural. The brands that win have a one-sentence concept they\'ll defend against every "could we also add…", and the design holds together because of what was left out.',
    ],
    gallery: [
      { src: bucketUrl('trend-03-detail-a.jpg', ''), alt: 'Private meeting suite within a larger exhibit space' },
      { src: bucketUrl('trend-03-detail-b.jpg', ''), alt: 'Tiered exhibit layout with public and private zones' },
    ],
  },
  {
    id: 't4',
    num: 4,
    category: 'Functional Component',
    title: 'AI in the Arena: Engagement That Demonstrates AND Delights',
    shortTitle: 'AI in the Arena',
    bullets: [
      'The smartest exhibitors aren\'t showing AI in a keynote, they\'re putting it inside the booth game',
      'Challenges adapt to your skill level, quizzes branch by role, scenarios make the AI\'s capability the thing being experienced',
      'The engagement IS the proof of concept, visitors leave knowing the product works because they just used it',
    ],
    yoy: '2024 = game as crowd magnet. 2026 = game as live AI product demo.',
    question: 'Is your booth engagement just entertaining, or is it proof that your AI actually works?',
    image: bucketUrl('trend-04-header.jpg', ''),
    imageAlt: 'Interactive technology kiosk with digital human screen',
    licenseNote: true,
    cluster: 'Budget',
    depth: [
      'The smartest exhibitors aren\'t showing AI in a keynote, they\'re putting it inside the booth game. Challenges that adapt to skill level, quizzes that branch by role, and scenarios where the AI\'s capability is the thing being experienced rather than narrated.',
      'The engagement IS the proof of concept. When a visitor finishes a 90-second interactive challenge that adapted to their answers in real time, they don\'t need a follow-up slide explaining "what our AI can do", they just felt it.',
      'The arc from 2024 to 2026 is clean: the game used to be the crowd magnet that pulled people toward the real demo. Now the game is the demo. The mechanic and the message have collapsed into the same moment.',
    ],
    gallery: [
      { src: bucketUrl('trend-04-detail-a.jpg', ''), alt: 'Interactive AI display engaging visitors' },
      { src: bucketUrl('trend-04-detail-b.jpg', ''), alt: 'Touchscreen kiosk with AI-driven interface' },
    ],
  },
  {
    id: 't5',
    num: 5,
    category: 'Functional Component',
    title: 'The Modular-First Mandate',
    shortTitle: 'Modular-First Mandate',
    bullets: [
      'Single-use custom builds are being phased out as the default approach to exhibit design',
      'The new standard is a modular system designed across 3–5 shows, scalable from 10x10 to island, reconfigurable by market',
      'Sustainability pressure from finance, procurement, and brand teams is accelerating the shift',
    ],
    yoy: 'From "build for the show" to "build for the circuit."',
    question: 'How many shows is your current booth designed to serve?',
    image: bucketUrl('trend-05-header.jpg', ''),
    imageAlt: 'Modular architectural exhibition structure',
    licenseNote: true,
    cluster: 'Budget',
    depth: [
      'Single-use custom builds are being phased out as the default. The new baseline is a modular system designed across three to five shows, scalable from a 10x10 inline to an island footprint, and reconfigurable to match each market.',
      'Sustainability pressure is accelerating the shift from every direction at once, finance wants lower per-show cost, procurement wants reusable inventory, and brand teams want to stop defending landfill optics in their annual reports.',
      'The strategic reframe is "build for the circuit," not "build for the show." Booth assets become a managed inventory with a multi-year ROI, not a one-time spend that ends in a dumpster after teardown.',
    ],
    gallery: [
      { src: bucketUrl('trend-05-detail-a.jpg', ''), alt: 'Modular exhibition structure being assembled' },
      { src: bucketUrl('trend-05-detail-b.jpg', ''), alt: 'Reconfigurable trade show stand components' },
    ],
  },
  {
    id: 't6',
    num: 6,
    category: 'Functional Component',
    cluster: 'Design',
    title: 'Orchestrated Journey Over Spectacle',
    shortTitle: 'Orchestrated Journey',
    bullets: [
      "Award-winning booths aren't louder, they're sequenced. Entry, discovery, proof, exit",
      'Visitors are moved through defined modes, not left to roam a sea of stimuli',
      "The booth is a screenplay now: every zone has a role in the story",
    ],
    yoy: 'From "how do we wow them?" to "how do we move them through our world?"',
    question: 'Does your booth have a journey, or just a footprint?',
    image: bucketUrl('trend-06-header.jpg', ''),
    imageAlt: 'Visitors moving through a curated branded exhibition environment with designed experiential zones',
    depth: [
      'The "immersive" bar has moved. Judges and attendees have stopped rewarding sensory density, more screens, more activations, more noise, and started rewarding booths that guide you somewhere. The best floors in 2025–26 read like attractions: you know exactly where you are in the narrative at every step.',
      "Award-winning examples from EXHIBITOR and PosterGarden's 2025 picks share one structural trait, a deliberate sequence. Problem, solution, proof, impact. Entry threshold, discovery zone, demonstration moment, exit beat. The spatial plan isn't decorative. It's directional.",
      "The implication for exhibitors: stop designing square footage and start designing a visitor arc. A booth without a journey is just a room. The orchestration is the differentiator, not the LED wall, not the hanging sign, not the headcount.",
    ],
    gallery: [
      { src: bucketUrl('trend-06-detail-a.jpg', ''), alt: 'Architectural exhibition space with dramatic lighting guiding visitor flow' },
      { src: bucketUrl('trend-06-detail-b.jpg', ''), alt: 'People moving through a designed experiential environment' },
    ],
  },
  {
    id: 't7',
    num: 7,
    category: 'Functional Component',
    title: 'Comfort as the Conversion Strategy',
    shortTitle: 'Hospitality-Led Booths',
    bullets: [
      'Leading exhibitors are building lounge-first environments where the product conversation finds the visitor, not the other way around',
      'Intentionally zoned comfort areas, F&B, soft seating, ambient lighting, concierge staffing, increase dwell time up to 2.5x compared to demo-first layouts',
      'The shift reframes the booth as a place to stay, not a place to stop, fewer leads, significantly higher quality',
    ],
    yoy: 'From "here\'s a chair while we pitch you" to "here\'s an environment built for the conversation you actually want to have."',
    question: 'Is your booth designed to attract traffic, or to hold the right conversation long enough to matter?',
    image: bucketUrl('trend-07-header.jpg', ''),
    imageAlt: 'Hospitality-led trade show booth lounge with soft seating and ambient lighting',
    cluster: 'Design',
    depth: [
      'The demo-first booth assumes the product is the draw. Hospitality-led design flips that assumption, the environment is the draw, and the product conversation happens inside it. AWS, Google Cloud, and Salesforce have been building this way for years at their flagship events: barista stations, semi-private lounge pods, warm materials, ambient sound, not as perks bolted on, but as the primary engagement architecture.',
      'The business case is in the dwell time. Intentionally zoned comfort areas increase how long a visitor stays by up to 2.5x. Longer stays mean deeper conversations, more qualified intent signals, and staff who can move past the pitch into actual problem-solving. The tradeoff, lower raw lead volume, is increasingly seen as the right trade.',
      'In 2026, this extends beyond F&B. Scent branding, sound design, concierge-style staffing models, and domestic-grade finishes (wood, stone, soft lighting) are all part of the same strategy: make the visitor feel something before they hear anything. The booths winning on quality-of-conversation metrics aren\'t the loudest ones on the floor, they\'re the ones that feel like somewhere you\'d actually want to spend 20 minutes.',
    ],
    gallery: [
      { src: bucketUrl('trend-07-detail-a.jpg', ''), alt: 'Warm, dimly lit hospitality lounge with comfortable seating' },
      { src: bucketUrl('trend-07-detail-b.jpg', ''), alt: 'Soft materials and ambient accent lighting in a lounge-style booth environment' },
    ],
  },
  {
    id: 't8',
    num: 8,
    category: 'Functional Component',
    title: 'The Booth as Campaign Asset',
    shortTitle: 'Campaign Asset',
    bullets: [
      'The booth is no longer the event, it\'s the content hub for a 6-week campaign',
      'Pre-show teasers, live social capture, post-show video clips, and email sequences are planned before the build begins',
      'Booth design decisions now have to serve the camera and the campaign, not just the floor visitor',
    ],
    yoy: 'From one-week activation to always-on content engine.',
    question: 'What content does your booth produce before, during, and after the show?',
    image: bucketUrl('trend-08-header.jpg', ''),
    imageAlt: 'Branded content production setup at a live event',
    licenseNote: true,
    cluster: 'Flexibility',
    depth: [
      'The booth is no longer the event, it\'s the content hub for a six-week campaign that surrounds the event. The week on the floor is the production shoot; the value lives in what gets cut, posted, and sequenced before and after.',
      'Pre-show teasers, live social capture, post-show video clips, and follow-up email sequences are now planned before the build begins. Camera angles, lighting, and "hero shot" zones get designed alongside the floor plan, not after.',
      'This reframes every design decision. The booth has to serve two audiences simultaneously, the visitor walking through it, and the much larger remote audience watching the campaign that the booth feeds.',
    ],
    gallery: [
      { src: bucketUrl('trend-08-detail-a.jpg', ''), alt: 'Mezzanine level above an active exhibit floor' },
      { src: bucketUrl('trend-08-detail-b.jpg', ''), alt: 'Two-story architectural structure with upper deck meeting area' },
    ],
  },
  {
    id: 't9',
    num: 9,
    category: 'Design Feature',
    title: 'LED as the Booth\'s Operating System',
    shortTitle: 'LED Architecture',
    bullets: [
      'LED is no longer a display, it\'s the architecture itself',
      'Floor-to-ceiling walls, ceiling canopies, and dynamic content zones change by session, audience, or time of day',
      'The booth becomes a programmable environment that re-skins itself for each audience segment',
    ],
    yoy: 'From screens on a wall to walls as screens.',
    question: 'Is your visual technology flexible enough to serve every audience segment on the floor?',
    // Unsplash photo PwlsQn-RyRU, free to use
    image: bucketUrl('trend-09-header.jpg', ''),
    imageAlt: 'Floor-to-ceiling LED wall as exhibit architecture',
    cluster: 'Flexibility',
    depth: [
      'LED is no longer a display bolted onto a wall, it has become the wall, the ceiling, and increasingly the floor. The exhibit architecture itself is luminous, dynamic, and addressable rather than printed and fixed.',
      'Floor-to-ceiling walls, ceiling canopies, and dynamic content zones now change by session, audience, or time of day. The same physical booth presents a completely different environment for the 9am clinical demo and the 4pm executive reception.',
      'The shift turns the booth into a programmable operating system. Content schedules replace graphic packages, and the cost of pivoting messaging mid-show drops to a file swap instead of a reprint.',
    ],
    gallery: [
      { src: bucketUrl('trend-09-detail-a.jpg', ''), alt: 'Floor-to-ceiling LED wall serving as exhibit architecture' },
      { src: bucketUrl('trend-09-detail-b.jpg', ''), alt: 'Programmable LED canopy and dynamic content zones' },
    ],
  },
  {
    id: 't10',
    num: 10,
    category: 'Design Feature',
    title: 'Transparent LED / ClearLED as Architecture',
    shortTitle: 'ClearLED',
    bullets: [
      'ClearLED is moving from novelty to structural material',
      'Brands are using it as entry portals, hanging planes, and semi-open facades',
      'Visual impact without closing off the booth or adding the visual bulk of a solid wall',
    ],
    yoy: 'From "giant screen" to "breathable media architecture."',
    question: 'Does your display technology open your booth or wall it off?',
    image: bucketUrl('trend-10-header.jpg', ''),
    imageAlt: 'Transparent LED panel forming an entry portal',
    licenseNote: true,
    cluster: 'Flexibility',
    depth: [
      'Transparent LED, ClearLED, is moving from novelty effect into structural material. Brands are deploying it as entry portals, hanging planes, and semi-open facades that carry video content without behaving like an opaque wall.',
      'The strategic appeal is that you get the visual impact of a massive screen without sacrificing the sightlines and openness that make a booth approachable. Visitors can see through the architecture, which means they keep walking toward it.',
      'The reframe is from "giant screen" to "breathable media architecture." The display becomes part of the booth\'s skeleton rather than a slab parked in front of it, closer to stage scenery than to a TV.',
    ],
    gallery: [
      { src: bucketUrl('trend-10-detail-a.jpg', ''), alt: 'Branded coffee bar at an event activation' },
      { src: bucketUrl('trend-10-detail-b.jpg', ''), alt: 'Specialty coffee preparation in a booth setting' },
    ],
  },
  {
    id: 't11',
    num: 11,
    category: 'Design Feature',
    title: 'The Unexpected Environment',
    shortTitle: 'Unexpected Environment',
    bullets: [
      "The booth that shouldn't exist here is the one everyone remembers",
      "Snowflake's ski lodge, a jazz bar in a convention center, a greenhouse in a tech hall, displacement is the brand impression",
      "These aren't storytelling environments; they're displacement environments where the world has no logical connection to the product",
    ],
    yoy: 'From "how do we express our brand?" to "what world would make people stop walking and want to stay?"',
    question: 'Does your booth make people forget they\'re on a show floor?',
    image: bucketUrl('trend-11-header.jpg', ''),
    imageAlt: 'Warm atmospheric interior of a bar or lodge with dramatic ambient lighting',
    cluster: 'Design',
    depth: [
      "The shift: Traditional booth design asks 'how do we express our brand?' The unexpected environment asks something different: 'what world would make people stop walking and want to stay?' The answer is usually somewhere they'd never expect to find themselves, and that surprise is the brand impression.",
      "Why it works in 2026: Attention on the show floor is the scarcest resource in B2B marketing. An unexpected environment creates an involuntary stop, you don't decide to notice it, you just do. The rise of 'selfie architecture' has changed the ROI math. A booth that gets shared 500 times on LinkedIn has media value that dwarfs the cost of a themed build. Younger, digitally-native attendees don't respond to static brand messaging. They respond to moments.",
      "Where AI comes in: AI hasn't just made this trend possible, it's removed the primary barrier. Conceptualizing and rendering a fully realized unexpected environment used to require weeks of design iteration. Now a creative team can generate, refine, and pressure-test 10 scenic concepts before a single dollar is committed to fabrication. The creative ceiling has gone up because ideation is no longer the bottleneck.",
      "Who's doing it: Still a premium play in 2026, most visible at flagship shows (CES, Dreamforce, HIMSS, AWS re:Invent). But the tactic is moving down-market as AI-assisted design and modular fabrication reduce the cost of building 'a world.'",
      "The 2026 signal: This isn't about theme for theme's sake. The brands winning with this approach understand that memorability is the metric, and an environment that displaces you spatially is the most reliable way to earn it.",
    ],
    gallery: [
      { src: bucketUrl('trend-11-detail-a.jpg', ''), alt: 'Cozy warm lodge interior with dramatic lighting' },
      { src: bucketUrl('trend-11-detail-b.jpg', ''), alt: 'Atmospheric bar interior with ambient lighting' },
    ],
  },
  {
    id: 't12',
    num: 12,
    category: 'Design Feature',
    title: 'The One-Idea Booth: Sharp Concept Over Scenic Complexity',
    shortTitle: 'The One-Idea Booth',
    bullets: [
      'EXHIBITOR\'s 2025 award analysis found one universal trait across winners: a single organizing idea executed completely',
      'Not a collage of product messages, one sentence, committed all the way through layout, graphics, and staff scripting',
      'In 2026, judges reward conceptual clarity as much as visual ambition',
    ],
    yoy: 'From "impressive build" to "unforgettable premise."',
    question: 'What\'s the one idea your booth communicates, and does every element serve it?',
    image: bucketUrl('trend-12-header.jpg', ''),
    imageAlt: 'Booth design unified by a single bold creative concept',
    licenseNote: true,
    cluster: 'Design',
    depth: [
      'EXHIBITOR\'s 2025 award analysis surfaced one trait shared by every winner: a single organizing idea executed completely. Not a clever feature, not a great photo, a unifying premise that every element of the booth was clearly built to serve.',
      'The losing pattern is a collage of product messages stacked into one footprint. The winning pattern is one sentence, committed all the way through layout, graphics, lighting, staff scripting, and giveaway. Everything off-thesis gets cut.',
      'In 2026, judges and buyers alike reward conceptual clarity as much as visual ambition. An "impressive build" without a premise loses to a simpler booth with an unforgettable one, because the premise is what gets remembered after teardown.',
    ],
    gallery: [
      { src: bucketUrl('trend-12-detail-a.jpg', ''), alt: 'Bold, saturated color exhibit activation' },
      { src: bucketUrl('trend-12-detail-b.jpg', ''), alt: 'Vivid color palette installation breaking category norms' },
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

const TrendCard = ({ trend, onImage, headerPosition, eager }: { trend: Trend; onImage: (images: string[], index: number) => void; headerPosition: number; eager?: boolean }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trendImages = useMemo(
    () => [trend.image, ...trend.gallery.map((g) => g.src)],
    [trend.image, trend.gallery],
  );
  return (
    <div className="trend-card" id={trend.id} ref={ref}>
      <div className="tc-media" onClick={() => onImage(trendImages, 0)} style={{ cursor: 'pointer' }}>
        <motion.img
          src={trend.image}
          alt={trend.imageAlt}
          loading={eager ? 'eager' : 'lazy'}
          decoding={eager ? 'sync' : 'async'}
          fetchPriority={eager ? 'high' : 'auto'}
          className="tc-media-img"
          style={{ objectPosition: `center ${headerPosition}%` }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="tc-body">
        <div className="tc-meta">
          <span className="tc-num">Trend #{trend.num}</span>
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
                <figure key={i} className="tc-gallery-item" onClick={() => onImage(trendImages, i + 1)}>
                  <motion.img
                    src={g.src}
                    alt={g.alt}
                    loading="lazy"
                    decoding="async"
                    className="tc-gallery-img"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  />
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

const makeHeroSlides = (): string[] => [
  bucketUrl('hero-1.jpg', ''),
  bucketUrl('hero-2.jpg', ''),
  bucketUrl('hero-3.jpg', ''),
  bucketUrl('hero-4.jpg', ''),
];

const TrendReport2026 = () => {
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const openLightbox = useCallback((images: string[], index: number) => {
    setLightbox({ images, index });
  }, []);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const nextLightbox = useCallback(() => {
    setLightbox((lb) => (lb ? { ...lb, index: (lb.index + 1) % lb.images.length } : lb));
  }, []);
  const prevLightbox = useCallback(() => {
    setLightbox((lb) => (lb ? { ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length } : lb));
  }, []);
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') nextLightbox();
      else if (e.key === 'ArrowLeft') prevLightbox();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, closeLightbox, nextLightbox, prevLightbox]);
  const [heroIdx, setHeroIdx] = useState(0);
  const [signedVersion, setSignedVersion] = useState(0);
  const [trendPositions, setTrendPositions] = useState<Record<number, number>>({});

  // Load trend header positions from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('trend_image_positions')
        .select('trend_num, position');
      if (cancelled || !data) return;
      const map: Record<number, number> = {};
      for (const row of data as { trend_num: number; position: number }[]) {
        map[row.trend_num] = Number(row.position);
      }
      setTrendPositions(map);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Register a subscriber so on-demand signed-URL loads (triggered by trend
  // cards entering the viewport) re-render the tree with the new URLs.
  useEffect(() => {
    onSignedUrlsLoaded = () => setSignedVersion((v) => v + 1);
    return () => {
      onSignedUrlsLoaded = null;
    };
  }, []);

  // Eagerly batch-fetch every signed URL for the report in a single request.
  useEffect(() => {
    loadSignedUrls(BUCKET_FILES);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const TRENDS = useMemo(() => makeTrends(), [signedVersion]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const HERO_SLIDES = useMemo(() => makeHeroSlides(), [signedVersion]);

  useEffect(() => {
    const id = setInterval(() => {
      setHeroIdx((i) => (i + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(id);
  }, [HERO_SLIDES.length]);

  const toggleNav = useCallback(() => {
    document.getElementById('sidebar2')?.classList.toggle('open');
    document.getElementById('overlay2')?.classList.toggle('open');
  }, []);

  const closeMobile = useCallback(() => {
    document.getElementById('sidebar2')?.classList.remove('open');
    document.getElementById('overlay2')?.classList.remove('open');
  }, []);

  useEffect(() => {
    const sects = document.querySelectorAll('section[id], .trend-card[id]');
    let lockedId: string | null = null;

    const setActive = (id: string) => {
      document.querySelectorAll('.sidebar .nav-link, .pp-link').forEach((l) =>
        l.classList.toggle('active', l.getAttribute('href') === '#' + id),
      );
    };

    // Delegated, capture-phase handler so it overrides default anchor jump,
    // React onClick handlers, and any future-rendered hash links.
    const onDocClick = (e: MouseEvent) => {
      const path = e.composedPath() as HTMLElement[];
      const a = path.find(
        (el) => el && el.tagName === 'A' && (el as HTMLAnchorElement).getAttribute?.('href')?.startsWith('#'),
      ) as HTMLAnchorElement | undefined;
      if (!a) return;
      const href = a.getAttribute('href') || '';
      const id = href.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      e.stopPropagation();
      lockedId = id;
      setActive(id);
      // Centered scroll: place the element's vertical midpoint at the
      // viewport's vertical midpoint. Clamp for tall sections so the top
      // of the element doesn't disappear above the fold.
      const elTop = target.getBoundingClientRect().top + window.scrollY;
      const elH = target.offsetHeight;
      const winH = window.innerHeight;
      let top = elTop + elH / 2 - winH / 2;
      // For sections taller than the viewport, align near top with breathing room
      if (elH > winH) top = elTop - winH * 0.12;
      const max = document.documentElement.scrollHeight - winH;
      top = Math.max(0, Math.min(top, max));
      window.scrollTo({ top, behavior: 'smooth' });
      if (history.replaceState) history.replaceState(null, '', '#' + id);
    };
    document.addEventListener('click', onDocClick, true);

    let scrollTimer: number | undefined;
    const onUserScroll = () => {
      if (!lockedId) return;
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        lockedId = null;
      }, 800);
    };
    window.addEventListener('wheel', onUserScroll, { passive: true });
    window.addEventListener('touchmove', onUserScroll, { passive: true });
    window.addEventListener('keydown', onUserScroll);

    const obs = new IntersectionObserver(
      (entries) => {
        if (lockedId) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (id) setActive(id);
          }
        });
      },
      { rootMargin: '-15% 0px -75% 0px' },
    );
    sects.forEach((s) => obs.observe(s));
    return () => {
      obs.disconnect();
      document.removeEventListener('click', onDocClick, true);
      window.removeEventListener('wheel', onUserScroll);
      window.removeEventListener('touchmove', onUserScroll);
      window.removeEventListener('keydown', onUserScroll);
    };
  }, []);


  const functional = TRENDS.filter((t) => t.category === 'Functional Component');
  const design = TRENDS.filter((t) => t.category === 'Design Feature');


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
              <span className="nav-num">{String(t.num).padStart(2, '0')}</span> {t.shortTitle}
            </a>
          ))}
          <div className="nav-group-label">Design</div>
          {design.map((t) => (
            <a key={t.id} href={`#${t.id}`} className="nav-link" onClick={closeMobile}>
              <span className="nav-num">{String(t.num).padStart(2, '0')}</span> {t.shortTitle}
            </a>
          ))}
          <div className="nav-group-label">Next</div>
          <a href="#assessment" className="nav-link" onClick={closeMobile}>
            <FileText size={13} className="nav-icon" /> Self-Assessment
          </a>
          <a href="#contact" className="nav-link" onClick={closeMobile}>
            <Mail size={13} className="nav-icon" /> Get in Touch
          </a>
        </div>
        <div className="sidebar-footer">
          <span>&copy; 2026 Exhibit Happy by Steelhead</span>
        </div>
      </nav>

      <div className="main trend-report-2026">
        <section className="hero" id="top">
          <div className="hero-img hero-slider" aria-hidden="true">
            {HERO_SLIDES.map((src, i) => (
              <div key={src} className={`hero-slide ${i === heroIdx ? 'is-active' : ''}`}>
                <img
                  src={src}
                  alt=""
                  draggable={false}
                  loading="eager"
                  decoding={i === 0 ? 'sync' : 'async'}
                  // @ts-expect-error fetchpriority is valid HTML, supported in React 18.3+
                  fetchpriority={i === 0 ? 'high' : 'auto'}
                />
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
              From January through June 2026, our team was on the ground at HIMSS, CES, CONEXPO, InfoComm, NAB, Money20/20, and more, distilling 12 actionable trends that give busy B2B exhibit marketers a strategic edge. No flights. No badge lines. Just the intelligence that matters.
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
          <h2 className="st">TL;DR, Your Strategic Edge in 60 Seconds</h2>
          <FadeIn>
            <div className="tldr">
              <h3>What changed in 2026</h3>
              <p>
                We spent 2026 embedded at the industry's most important trade shows so you don't have to. The exhibit floor has moved decisively from <strong>broadcast</strong> to <strong>experience</strong>. Static booths and scripted theaters are being replaced by outcome-driven engagement, AI-powered interactions, modular architecture, and design built around a single sharp idea. On the design side, comfort-first environments, unexpected spatial concepts, and deliberately orchestrated visitor journeys are the new defaults across categories that have run on the same proven playbook for years.
              </p>
              <ul>
                <li><strong>Functional shift:</strong> attendee-led problem-solving, AI engagement that demonstrates and delights, modular systems built for multi-show ROI, gamified lead capture, and booths repurposed as year-round campaign assets.</li>
                <li><strong>Design shift:</strong> comfort as a conversion strategy, unexpected environments that stop traffic, orchestrated journeys over spectacle, LED as structural architecture, and single-concept clarity over scenic complexity.</li>
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
              We heard the same three challenges from marketers at every show we covered, the friction points that keep showing up in booth briefs, RFPs, and post-show debriefs. Every trend in this report maps back to at least one of them, so you can focus on strategy instead of scouting.
            </p>
            <div className="pp-grid">
              <div className="pp">
                <div className="pp-icon"><LayoutGrid size={22} /></div>
                <div className="pp-label">Cluster 01</div>
                <div className="pp-title">Flexibility</div>
                <p className="pp-desc">
                  Booths that adapt to multiple shows, footprints, and audience tiers, without rebuilding from scratch. Immersive storyworlds, booth-as-campaign-asset thinking, LED as a flexible operating system, and transparent LED as structural design.
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
                  Where exhibit dollars are flowing in 2026: AI engagement that scales without headcount, and modular systems that cut cost-per-show by 30–50%.
                </p>
                <a className="pp-link" href="#t4">Trend 4</a>
                <a className="pp-link" href="#t5">Trend 5</a>
              </div>
              <div className="pp">
                <div className="pp-icon"><Palette size={22} /></div>
                <div className="pp-label">Cluster 03</div>
                <div className="pp-title">Design</div>
                <p className="pp-desc">
                  How the floor looks and feels different: comfort zones that convert, unexpected environments that stop traffic, orchestrated visitor journeys, single-concept clarity, gamified engagement, and the death of the scripted product theater.
                </p>
                <a className="pp-link" href="#t1">Trend 1</a>
                <a className="pp-link" href="#t2">Trend 2</a>
                <a className="pp-link" href="#t6">Trend 6</a>
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
            {functional.map((t, i) => (
              <FadeIn key={t.id}>
                <TrendCard trend={t} onImage={openLightbox} headerPosition={trendPositions[t.num] ?? 50} eager={i < 2} />
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
                <TrendCard trend={t} onImage={openLightbox} headerPosition={trendPositions[t.num] ?? 50} />
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Self-Assessment */}
        <FadeIn>
          <SelfAssessment />
        </FadeIn>

        {/* Contact CTA */}
        <section className="section section--b" id="contact">
          <div className="pr"></div>
          <div className="sl">Get in Touch</div>
          <h2 className="st">Ready to make your next show unforgettable?</h2>
          <FadeIn>
            <div className="contact-cta">
              <div className="contact-cta-inner">
                <div className="contact-cta-photo">
                  <img
                    src={teamPhoto.url}
                    alt="Exhibit Happy team: Andrew, Omar and Sarah"
                    loading="lazy"
                  />
                </div>
                <div className="contact-cta-body">
                <div className="contact-cta-text">
                  <p>
                    Let's turn these trends into your competitive advantage on the show floor. In one focused conversation, we'll map your 2026 calendar against the shifts in this report, where buyers actually engage, where budgets are getting wasted, and where a sharper booth strategy compounds into pipeline.
                  </p>
                  <p>
                    You'll walk away with a clear point of view on which trends matter for your category, two or three concrete moves you can make on your next build, and a partner who's already executing this playbook for brands like yours.
                  </p>
                </div>
                <div className="contact-cta-action">
                  <a href="#" className="contact-btn">
                    Book a Time with Us
                  </a>
                </div>
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

      {lightbox && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">
            &times;
          </button>
          {lightbox.images.length > 1 && (
            <>
              <button
                className="lightbox-nav lightbox-prev"
                onClick={(e) => { e.stopPropagation(); prevLightbox(); }}
                aria-label="Previous image"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button
                className="lightbox-nav lightbox-next"
                onClick={(e) => { e.stopPropagation(); nextLightbox(); }}
                aria-label="Next image"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 6l6 6-6 6"/></svg>
              </button>
              <div className="lightbox-counter" onClick={(e) => e.stopPropagation()}>
                {lightbox.index + 1} / {lightbox.images.length}
              </div>
            </>
          )}
          <img
            src={lightbox.images[lightbox.index]}
            alt=""
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default TrendReport2026;