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
    title: 'The Death of the Product Theater',
    bullets: [
      'Passive scripted presentations are being replaced by attendee-led, hands-on experience zones',
      'Freeman 2025 Commerce Report: 71% of attendees want self-directed demos, not stage presentations',
      'By 2026, leading exhibitors at HIMSS, InfoComm, and NAB have largely eliminated fixed presentation stages',
    ],
    yoy: "TSE 2024 flagged the shift beginning; by 2026 it's the dominant model at enterprise booths across all major categories.",
    question: 'Is your booth built around what your team wants to say, or what your attendee wants to discover?',
    // Unsplash photo BKpOVik79lA — free to use
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'People at a business exhibition interacting with a booth',
    cluster: 'Design',
    depth: [
      'The era of the scripted product theater is closing. Passive stage presentations, with their fixed seating and pre-timed pitches, are giving way to attendee-led, hands-on experience zones where visitors steer the demo themselves. The shift moves the booth from broadcast to laboratory.',
      "Freeman's 2025 Commerce Report quantifies what floor managers already feel: 71% of attendees now want self-directed product exploration rather than being talked at from a stage. The behavior is consistent across age, role, and industry — buyers expect agency, not a captive audience experience.",
      'By 2026, leading exhibitors at HIMSS, InfoComm, and NAB have largely eliminated fixed presentation stages from premium footprints. The square footage previously dedicated to seating banks has been re-deployed into interactive stations, AI kiosks, and small-group consultation pods.',
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
      'Interactive games (leaderboards, timed challenges, spin-to-win) are now primary lead capture mechanisms, not novelty add-ons',
      'AI photo booth at CONEXPO 2026 drove 400+ interactions in 5 hours with zero manual badge scanning',
      'Gamified booths report 3–5x longer dwell times than static exhibitors in the same footprint',
    ],
    yoy: 'In 2024, gamification was a differentiator; by 2026 mid-market and enterprise exhibitors expect it. Booths without a play mechanic feel transactional.',
    question: 'When a qualified lead walks into your booth, is the first interaction memorable or administrative?',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Interactive gaming activation at a trade show',
    licenseNote: true,
    cluster: 'Design',
    depth: [
      'Gamification has graduated from novelty add-on to primary lead-capture infrastructure. Leaderboards, timed challenges, and spin-to-win mechanics now sit at the front of the booth where the badge scanner used to live, converting curiosity into structured engagement data automatically.',
      'The CONEXPO 2026 AI photo booth made the case clearly: 400+ interactions in five hours, zero manual badge scanning, and a queue that became its own traffic driver. Play, not pitch, was the entry point — and qualification happened in the background as attendees opted in.',
      'Booths with a real play mechanic now report three to five times the dwell time of static exhibitors in the same square footage. Longer dwell maps directly to deeper conversations, higher recall, and richer downstream sales sequences after the show ends.',
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
    title: 'The Invite-Only Booth Architecture',
    bullets: [
      'Open floor plans are being replaced with tiered access environments: public front, private back',
      'Jack Morton (CES 2026): invite-only areas generate 4x more qualified meeting time than open-access spaces',
      '"Public front, private back" layouts create distinct experiences for casual traffic vs. priority accounts',
    ],
    yoy: 'In 2024 this was a luxury-brand tactic (automotive at CES). By 2026, B2B healthcare and tech exhibitors at HIMSS and Money20/20 are adopting it at scale.',
    question: 'Does your booth treat a Fortune 500 prospect the same way as a first-time visitor?',
    // Unsplash photo PwlsQn-RyRU — free to use
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Elegant lounge area with plush seating and ambient lighting',
    cluster: 'Flexibility',
    depth: [
      'Open, egalitarian floor plans are being replaced with tiered access environments — a public, exploratory front and a private, invitation-only back. The architecture itself signals who the booth is built for and which conversations belong in which zone.',
      "Jack Morton's CES 2026 deployment delivered the proof point: invite-only areas generated four times the qualified meeting time of equivalent open-access space. The privacy did not deter traffic; it concentrated attention from the right traffic.",
      'The "public front, private back" pattern lets the same footprint serve casual visitors and priority accounts without either group degrading the other\'s experience. It is the booth equivalent of an airport with a lounge — same building, calibrated experiences.',
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
    title: 'AI as a Booth Staff Member',
    bullets: [
      'AI avatar kiosks handle front-of-house qualification, product storytelling, and scheduling without human fatigue',
      'Samsung and ESTsoft debuted the "AI Promoter" at CES 2026, engaging thousands in natural conversation',
      'Real-time behavioral analytics now score leads by dwell time, question patterns, and engagement signals',
    ],
    yoy: 'In 2024, AI in booths meant chatbots on tablets. By 2026, lifelike interactive avatars are commercially deployed by top exhibitors across CES, GITEX, and CONEXPO.',
    question: 'If your best sales rep could clone themselves for show floor duty, what would change about your ROI?',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Interactive technology kiosk with digital human screen',
    licenseNote: true,
    cluster: 'Budget',
    depth: [
      'AI avatar kiosks have moved from concept demos into commercial deployment. They handle front-of-house qualification, product storytelling, and meeting scheduling on the floor without the fatigue, inconsistency, or coverage gaps of human staff during peak hours.',
      'Samsung and ESTsoft\'s "AI Promoter" debut at CES 2026 engaged thousands of attendees in natural, multi-turn conversation. The interactions weren\'t shallow demos — they triaged, answered objections, and handed warm leads to human reps with full context attached.',
      'Behavioral analytics layered on top of the kiosks now score leads in real time using dwell, question patterns, and engagement depth. The result is a qualification pipeline that runs continuously across show hours, not just when your strongest closers happen to be standing nearby.',
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
      'Single-use custom timber builds are being phased out for reconfigurable modular systems',
      'Global modular exhibition stand market: $1.54B in 2025, growing 9.2% CAGR through 2034',
      'Modular systems reduce per-show cost 30–50% while allowing configuration for different footprints',
    ],
    yoy: 'In 2024, modular was budget-driven by mid-size exhibitors. By 2026, enterprise brands (Somfy\'s "Most Sustainable Stand" winner at YED 2026) use it as a brand statement.',
    question: 'What percentage of your exhibit budget is being rebuilt from scratch each cycle?',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Modular architectural exhibition structure',
    licenseNote: true,
    cluster: 'Budget',
    depth: [
      'The single-use custom timber build is being phased out in favor of reconfigurable modular systems. Components travel, reassemble, and adapt to the next footprint — the booth becomes an inventory you own rather than a structure you commission and discard.',
      'The global modular exhibition stand market reached $1.54B in 2025 and is on a 9.2% CAGR through 2034. That growth is not just budget-driven mid-market exhibitors — it includes enterprise brands recasting modular as a sustainability and brand-discipline story.',
      "Modular systems consistently deliver 30–50% per-show cost reduction while supporting multiple booth sizes and shapes from the same kit. Somfy's \"Most Sustainable Stand\" award at YED 2026 marked the moment modular became a brand statement, not a compromise.",
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
      'Badge scan count as primary KPI is in decline; pipeline quality metrics are replacing it',
      'Exhibitor Group 2026: companies tracking scan volume saw no correlation with post-show revenue',
      'AI tools now track dwell time, repeat visits, conversation depth, and real-time sentiment scoring',
    ],
    yoy: 'Shift began in 2024 as AI analytics tools hit accessible price points. By 2026, "how many leads?" is being replaced by "how many went to pipeline?" in exec show reports.',
    question: 'If you removed badge scan count from your show report, what would you actually have left to show?',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Data analytics dashboard with business metrics',
    licenseNote: true,
    cluster: 'Budget',
    depth: [
      'Badge scan count as the headline KPI is in decline. Executives have stopped accepting raw lead volume as proof of value and are demanding pipeline-quality signals: who advanced, who booked a follow-up, who became an opportunity inside the CRM.',
      'The Exhibitor Group 2026 study delivered the uncomfortable finding bluntly — companies that tracked scan volume as their primary KPI saw no correlation with post-show revenue. The measurement was rewarding theater, not outcomes.',
      'AI-driven floor analytics now track dwell time, repeat visits, conversation depth, and real-time sentiment scoring. The same booth that produced 1,200 scans last year is reporting 180 high-intent conversations this year — and finance prefers the second number.',
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=80', alt: 'Pipeline analytics dashboard on a laptop screen' },
      { src: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=900&auto=format&fit=crop&q=80', alt: 'Sales pipeline data visualization' },
    ],
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
    image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Luxurious booth seating with mural in dimly lit lounge',
    cluster: 'Design',
    depth: [
      'Matte black, charcoal, deep navy, and rich wood tones are replacing the long-default white-and-bright exhibit palette. The change is not aesthetic preference; dark finishes reframe the booth as a backdrop for products and content rather than a structure that competes with them.',
      'High-contrast lighting against dark surfaces creates dramatic focal zones that pull eyes toward screens, hero products, and demo stages. The visual hierarchy becomes instantly readable from across the aisle, where most attention is captured or lost.',
      'Dark-finish booths also outperform white ones in social and editorial content. Photos taken inside them require less correction, look more premium, and extend booth ROI well past the show — every attendee with a phone becomes a downstream distribution channel.',
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&auto=format&fit=crop&q=80', alt: 'Dark, dramatic interior with focused lighting' },
      { src: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=900&auto=format&fit=crop&q=80', alt: 'Matte black architectural finish with warm accent lighting' },
    ],
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
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Two-level architectural space with mezzanine',
    licenseNote: true,
    cluster: 'Flexibility',
    depth: [
      'Two-story builds are becoming the baseline expectation for enterprise presence at major shows, not the prestige exception. The footprint reads as commitment before a single attendee enters, and the vertical real estate doubles available square footage without doubling floor cost.',
      'Upper decks serve a dual purpose pattern that has hardened into a standard: private meeting suites above, immersive brand experience and traffic flow below. The two layers operate as different products serving different audiences in the same address.',
      'Double-deck builds typically run $140–200K but consistently produce higher qualified meeting volume per square foot than single-level footprints of comparable area. The math works once you stop comparing build cost to build cost and start comparing build cost to meetings booked.',
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
    title: '"Workspitality" — The Hospitality-Productivity Hybrid',
    bullets: [
      'Exhibitors are blending upscale hospitality (lounge seating, premium F&B) with productive workspace function (charging, Wi-Fi, meeting nooks)',
      'Goal: give attendees a reason to stay 14+ minutes rather than pass through in 90 seconds',
      'Zenus.ai case study: data-driven booth redesign engineered average 14-minute booth visits',
    ],
    yoy: '"Workspitality" as a coined category emerged in 2026, but component behaviors grew across Dubai, European, and North American shows since 2024.',
    question: 'Does your booth give a tired attendee a reason to sit down and stay, or does it expect them to stand and listen?',
    // Unsplash photo PwlsQn-RyRU — free to use
    image: 'https://images.unsplash.com/photo-1564540583246-934409427776?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Elegant lounge area with plush seating and ambient lighting',
    cluster: 'Flexibility',
    depth: [
      '"Workspitality" describes the deliberate blend of upscale hospitality cues — lounge seating, premium food and beverage, ambient design — with productive workspace function such as charging stations, fast Wi-Fi, and quiet meeting nooks. The booth becomes somewhere worth staying, not somewhere worth passing through.',
      'The strategic target is a 14-minute average visit, not a 90-second flyby. Every additional minute deepens recall, increases the probability of conversation with staff, and creates the social proof of a populated, lived-in space that pulls in more traffic.',
      "Zenus.ai's case study formalized the playbook: data-driven layout revisions, comfort-first furniture, and intentional pacing engineered an average 14-minute booth visit. The booth started feeling like a destination rather than a checkpoint.",
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
    title: 'F&B Integration as a Retention Strategy',
    bullets: [
      'Coffee bars, branded beverage stations, and curated food activations are replacing swag bags as the primary traffic driver',
      'RIMS RiskWorld 2026: branded coffee activation served 850+ drinks, driving sustained traffic all three show days',
      'M2 Academy at DentalExpo 2026 used a barista bar as its primary engagement mechanism, with visitors queuing to enter the booth',
    ],
    yoy: 'In 2024, promotional items still dominated. By 2026, branded F&B is the category default for enterprise exhibitors: more experiential, more social-media-worthy, and more likely to generate repeat visits.',
    question: 'What is your booth offering that makes an attendee want to come back a second time?',
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Coffee bar and premium beverage service at an event',
    licenseNote: true,
    cluster: 'Flexibility',
    depth: [
      'Branded F&B has overtaken swag as the primary traffic driver. Coffee bars, beverage stations, and curated food activations create a sustained reason to visit and revisit — and unlike a tote bag, the experience is consumed on the floor, in conversation, in front of staff.',
      'RIMS RiskWorld 2026 quantified the play: a branded coffee activation served 850+ drinks across three days, sustaining traffic during the post-keynote dead zones that normally empty the floor. The coffee was the floor plan.',
      'M2 Academy at DentalExpo 2026 took the pattern further, using a barista bar as the primary engagement mechanism. Visitors queued to enter the booth, and the line itself became a qualification opportunity for staff working the perimeter.',
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
    title: 'Curved & Organic Architecture Replacing the Grid',
    bullets: [
      'Rectangular right-angled structures are giving way to curved walls, circular layouts, and fluid organic forms',
      'Bioscience IMCAS Paris 2026: semi-circle wall elements created a sculptural entrance arch and seamless visitor journey',
      'Curved structures improve traffic flow, create natural aisle sight lines, and photograph dramatically better',
    ],
    yoy: "In 2024, curved architecture was primarily a European trade fair aesthetic. By 2026 it's appearing at North American shows (NAB, InfoComm, CONEXPO) as exhibitors break from the booth-as-box default.",
    question: 'If you removed all right angles from your exhibit, would your brand story be clearer or more confusing?',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Curved organic architectural interior',
    licenseNote: true,
    cluster: 'Design',
    depth: [
      'Rectangular, right-angled exhibit structures are giving way to curved walls, circular layouts, and fluid organic forms. The booth-as-box default is being challenged by geometries that feel sculptural rather than industrial — a visual departure that reads instantly from the aisle.',
      "Bioscience IMCAS Paris 2026 deployed semi-circle wall elements to create a sculptural entrance arch and a seamless visitor journey through the space. The architecture itself, not a printed graphic, did the work of brand differentiation.",
      'Curved structures also outperform on the practical metrics — they improve traffic flow, create natural sight lines down the aisle, and photograph dramatically better than orthogonal builds. Less corner, more invitation.',
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
    title: 'Industry Color Conformity = Zig-Zag Opportunity',
    bullets: [
      'Every major show has an invisible color rulebook: healthcare → blue/white, tech → dark/neutral, finance → navy/gold, construction → yellow/orange',
      'Exhibitors who deliberately break category color conventions report higher unsolicited traffic and stronger brand recall',
      'The most memorable booths at CES 2026 and HIMSS 2026 were those that chose palette deliberately against category norms',
    ],
    yoy: 'Color conformity has intensified in 2024–2026 as AI tools generate increasingly "safe" brand guidelines. The gap between conformist and breakout has widened, making palette deviation more powerful.',
    question: "If you removed your logo from your booth, which competitor's design would yours be mistaken for?",
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Bold, colorful brand activation space',
    licenseNote: true,
    cluster: 'Design',
    depth: [
      'Every major show has an invisible color rulebook. Healthcare defaults to blue and white, tech to dark neutrals, finance to navy and gold, construction to safety yellow and orange. Walk the floor and you can identify category before you read a single logo.',
      'Exhibitors who deliberately break their category\'s color convention consistently report higher unsolicited traffic and stronger post-show brand recall. The palette deviation does the work of a billboard — it interrupts the visual pattern attendees have been walking past all day.',
      'The most memorable booths at CES 2026 and HIMSS 2026 were the ones that picked palette against type. As AI-generated brand guidelines push more exhibitors toward statistically "safe" colors, the gap between conformist and breakout widens — making deliberate deviation more valuable, not less.',
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
          <div className="hero-c">
            <div className="hero-ey">2026 Trend Report</div>
            <h1>
              We Attended the Biggest<br />
              Trade Shows of 2026<br />
              <span className="thin">So You Don't Have To</span>
            </h1>
            <p className="hero-sub">
              Our team spent the year on the ground at HIMSS, CES, CONEXPO, InfoComm, NAB, Money20/20, and more — distilling 12 actionable trends that give busy B2B exhibit marketers a strategic edge. No flights. No badge lines. Just the intelligence that matters.
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
          <h2 className="st">TL;DR — Your Strategic Edge in 60 Seconds</h2>
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
            <p className="pp-intro">
              Pain-point clusters are the three recurring challenges exhibit marketers told us they're heading into 2026 with — the friction points showing up across booth briefs, RFPs, and post-show debriefs. Every one of the 12 trends in this report maps back to at least one of them.
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