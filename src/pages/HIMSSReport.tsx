import { useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';

import './HIMSSReport.css';

const FadeIn = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const HIMSSReport = () => {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const toggleNav = useCallback(() => {
    document.getElementById('sidebar')?.classList.toggle('open');
    document.getElementById('overlay')?.classList.toggle('open');
  }, []);

  const closeMobile = useCallback(() => {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('overlay')?.classList.remove('open');
  }, []);

  useEffect(() => {
    const sects = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            links.forEach((l) =>
              l.classList.toggle('active', l.getAttribute('href') === '#' + id)
            );
          }
        });
      },
      { rootMargin: '-15% 0px -75% 0px' }
    );
    sects.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <>
<div className="pink-bar"></div>
<div className="mobile-bar">
  <button className="hamburger" onClick={toggleNav} aria-label="Menu"><span></span></button>
  <img src="images/exhibit-happy-logo.svg" alt="Exhibit Happy" className="brand-mobile-logo" />
</div>
<div className="sidebar-overlay" id="overlay" onClick={toggleNav}></div>
<nav className="sidebar" id="sidebar">
  <div className="sidebar-brand">
    <img src="images/exhibit-happy-logo.svg" alt="Exhibit Happy" style={{width:'140px'}} />
    <div className="report-label">HIMSS 2026<br />Trend Analysis</div>
  </div>
  <div className="sidebar-nav">
    <div className="nav-group-label">Report</div>
    <a href="#overview" className="nav-link" onClick={closeMobile}><span className="nav-num">00</span> Event Overview</a>
    <a href="#summary" className="nav-link" onClick={closeMobile}><span className="nav-num">01</span> Trend Summary</a>
    <a href="#index" className="nav-link" onClick={closeMobile}><span className="nav-num">02</span> Trend Index</a>
    <div className="nav-group-label">Categories</div>
    <a href="#cat-1" className="nav-link" onClick={closeMobile}><span className="nav-num">01</span> Brand Presence</a>
    <a href="#cat-2" className="nav-link" onClick={closeMobile}><span className="nav-num">02</span> Messaging</a>
    <a href="#cat-3" className="nav-link" onClick={closeMobile}><span className="nav-num">03</span> Traffic Flow</a>
    <a href="#cat-4" className="nav-link" onClick={closeMobile}><span className="nav-num">04</span> Engagement</a>
    <a href="#cat-5" className="nav-link" onClick={closeMobile}><span className="nav-num">05</span> Technology</a>
    <a href="#cat-6" className="nav-link" onClick={closeMobile}><span className="nav-num">06</span> Social Media</a>
    <div className="nav-group-label">Close</div>
    <a href="#takeaways" className="nav-link" onClick={closeMobile}><span className="nav-num">--</span> Key Takeaways</a>
  </div>
  <div className="sidebar-footer"><span>&copy; 2026 Steelhead Productions</span></div>
</nav>
<div className="main">


<section className="hero" id="top">
  <div className="hero-img"><img src="images/hero-himss26-floor.jpg" alt="HIMSS 2026 exhibit floor aerial view" /></div>
  <div className="hero-ov"></div>
  <div className="hero-c">
    
    <h1>HIMSS 2026<br /><span className="thin">Trend Analysis</span></h1>
    <p className="hero-sub">18 exhibit design, engagement, and technology trends sourced from the show floor at the Venetian Expo, Las Vegas.</p>
  </div>
  <div className="hero-scroll">Scroll<br />&#9662;</div>
</section>


<section className="section section--w" id="overview">
  <div className="pr"></div>
  <div className="sl">Section 00</div>
  <h2 className="st">Event Overview</h2>
  <FadeIn><div className="ev-card">
    <h3>HIMSS Global Health Conference &amp; Exhibition 2026</h3>
    <p><span style={{color:'var(--pink)', fontWeight:600}}>March 9&ndash;12, 2026 &middot; Venetian Expo Center &middot; Las Vegas, Nevada</span><br />The premier health information and technology event, bringing together 28,000+ clinicians, executives, policy makers, and industry leaders.</p>
  </div></FadeIn>
  <FadeIn delay={0.1}><div className="sg">
    <div className="sc"><div className="sk">Attendance</div><div className="stx">28,000+ health IT professionals, clinicians, and industry leaders across four days at the Venetian Expo Center.</div></div>
    <div className="sc"><div className="sk">Audience Profile</div><div className="stx">C-suite executives, CIOs, CMIOs, clinical informaticists, health system operators, and technology vendors across payer, provider, and life sciences.</div></div>
    <div className="sc"><div className="sk">Exhibition</div><div className="stx">1,000+ exhibitors consolidated into a single Venetian hall, eliminating the Caesar's Forum overflow and dramatically increasing density.</div></div>
    <div className="sc"><div className="sk">Key Themes</div><div className="stx">AI agents, health data exchange, AI governance, cybersecurity, and navigating a rapidly changing healthcare technology landscape.</div></div>
    <div className="sc"><div className="sk">Venue Change</div><div className="stx">Single-hall consolidation created narrower aisles and significantly higher foot traffic density compared to prior multi-venue layouts.</div></div>
    <div className="sc"><div className="sk">Sources</div><div className="stx">On-site observation by Steelhead Productions, post-show reporting from Event Marketer and Swaay.Health.</div></div>
  </div></FadeIn>
</section>


<section className="section section--w" id="summary" style={{borderTop:"1px solid var(--light-card)"}}>
  <div className="pr"></div>
  <div className="sl">Section 01</div>
  <h2 className="st">Design Trend Summary</h2>
  <FadeIn><div className="ed">
    <p className="drop">The HIMSS 2026 show floor revealed a healthcare exhibit industry at a new level of sophistication. The single-hall consolidation created the busiest, most competitive floor in recent memory, and the exhibitors who thrived designed for density, not against it. We documented a convergence of warm organic materials with high-resolution LED, a shift from hospitality-as-amenity to hospitality-as-product-demo, and the earliest signs of measurement infrastructure built into exhibit architecture from day one. The dominant narrative: when every exhibitor has the same screen technology, the brands that feel human, tell legible stories, and instrument their environments for data win attention, dwell time, and pipeline.</p>
    <p style={{marginTop:"1.2em",opacity:0.85}}>This report is compiled from on-the-ground observations by our design team. We evaluate these trends not as things to replicate but as signals that inform how we approach spatial storytelling, material selection, and visitor experience design for our clients. Each trend includes a strategic question designed to connect what we observed to what it means for your next exhibit environment.</p>
  </div></FadeIn>
  <FadeIn><div className="pg pg4">
    <div className="pi" onClick={() => setLightboxSrc("images/summary-civie-interior.jpg")} style={{cursor:"pointer"}}><img src="images/summary-civie-interior.jpg" alt="CIVIE neon interior at HIMSS 2026" loading="lazy" /><div className="cap">CIVIE: Neon LED canopy</div></div>
    <div className="pi" onClick={() => setLightboxSrc("images/summary-aws-booth.jpg")} style={{cursor:"pointer"}}><img src="images/summary-aws-booth.jpg" alt="AWS booth at HIMSS 2026" loading="lazy" /><div className="cap">AWS: Cloud Brews</div></div>
    <div className="pi" onClick={() => setLightboxSrc("images/summary-kontaktio-robot.jpg")} style={{cursor:"pointer"}}><img src="images/summary-kontaktio-robot.jpg" alt="Kontakt.io humanoid robot at HIMSS 2026" loading="lazy" /><div className="cap">Kontakt.io: Humanoid robot</div></div>
    <div className="pi" onClick={() => setLightboxSrc("images/summary-chg-greenery.jpg")} style={{cursor:"pointer"}}><img src="images/summary-chg-greenery.jpg" alt="CHG Healthcare booth at HIMSS 2026" loading="lazy" /><div className="cap">CHG: Wood + greenery</div></div>
  </div></FadeIn>
</section>


<section className="section section--b" id="index">
  <div className="pr"></div>
  <div className="sl">Section 02</div>
  <h2 className="st">Trend Index</h2>
  <FadeIn><div className="ig">
    <a href="#cat-1" className="ic"><div className="ich"><span className="inum">01</span><span className="iname">Brand Presence</span></div><ul><li>Booth-as-Embassy Positioning</li><li>Warm Materials as Counterweight</li><li>Vertical Scale &amp; Multi-Story</li></ul></a>
    <a href="#cat-2" className="ic"><div className="ich"><span className="inum">02</span><span className="iname">Messaging</span></div><ul><li>Legibility as Competitive Advantage</li><li>Audience-Tuned Demo Zones</li></ul></a>
    <a href="#cat-3" className="ic"><div className="ich"><span className="inum">03</span><span className="iname">Traffic Flow</span></div><ul><li>Open Perimeter, Defined Zones</li><li>Heatmapping &amp; Analytics</li><li>Venue Density as Variable</li></ul></a>
    <a href="#cat-4" className="ic"><div className="ich"><span className="inum">04</span><span className="iname">Engagement</span></div><ul><li>Hospitality as Demo Platform</li><li>Sensory Activations</li><li>Humanoid Robotics</li><li>The Quiet Zone</li></ul></a>
    <a href="#cat-5" className="ic"><div className="ich"><span className="inum">05</span><span className="iname">Technology</span></div><ul><li>Full-Height LED at Every Tier</li><li>Sculptural &amp; Non-Planar LED</li><li>Data-Driven Intelligence</li></ul></a>
    <a href="#cat-6" className="ic"><div className="ich"><span className="inum">06</span><span className="iname">Social Media</span></div><ul><li>In-Booth Video Studios</li><li>Personalized Giveaways</li><li>Photo Moment Installations</li></ul></a>
  </div></FadeIn>
</section>


<section id="cat-1"><div className="ch"><div className="cn">01</div><div className="cname">Brand Presence</div></div>

<div className="tb"><div className="th"><span className="tbdg">Trend #1</span><span className="tname">Booth-as-Embassy Positioning</span></div><div className="trl"></div>
<FadeIn><div className="tbody"><p><strong>Leidos</strong> debuted &ldquo;The Lens,&rdquo; a diamond-shaped LED structure built on what appears as sub-2mm pixel-pitch direct-view LED panels mounted to a custom aluminum extrusion frame, wrapped in a white architectural surround with museum-quality visuals. <strong>Stryker</strong> invested in suspended clearLED to create a cascading digital DNA effect with gold accent lighting, and marbleized effect walls, likely printed SEG with the clearLED suspended and rigged overhead. These create an embassy effect. Leidos VP <strong>Shaun McDougall</strong> described the approach as &ldquo;immersive, story-driven, and tailored to the mission,&rdquo; with every element measured from meetings to pipeline impact.</p><p>The signal for exhibit designers: major healthcare brands now expect their trade show presence to carry the same architectural authority as a corporate headquarters lobby. The booth is no longer a container for demos. It&rsquo;s the first impression of the institution itself.</p></div></FadeIn>
<FadeIn><div className="pg pg2" style={{marginBottom:"36px"}}><div className="pi" onClick={() => setLightboxSrc("images/t01-leidos-lens.jpg")} style={{cursor:"pointer"}}><img src="images/t01-leidos-lens.jpg" alt="Leidos Lens booth at HIMSS 2026" loading="lazy" /><div className="cap">Leidos: The Lens LED structure</div></div><div className="pi" onClick={() => setLightboxSrc("images/t01-stryker-overhead.jpg")} style={{cursor:"pointer"}}><img src="images/t01-stryker-overhead.jpg" alt="Stryker booth at HIMSS 2026" loading="lazy" /><div className="cap">Stryker: Clear LED overhead rigging</div></div></div></FadeIn>
<FadeIn delay={0.15}><div className="co"><div className="col">Strategic Question</div><p>Is your exhibit designed like a temporary sales station, or a permanent brand embassy that uses architectural-grade materials and engineered sightline geometry to project institutional authority without the cost profile of a permanent installation?</p></div><a href="#index" className="bl">&larr; Back to Trend Index</a></FadeIn></div>

<div className="tb"><div className="th"><span className="tbdg">Trend #2</span><span className="tname">Warm Materials as Counterweight</span></div><div className="trl"></div>
<FadeIn><div className="tbody"><p><strong>CHG Healthcare&rsquo;s</strong> 20&times;20 featured a wood slat ceiling, living greenery wall, palm trees, and green velvet seating. The ceiling appears to be real veneer on MDF battens rather than printed laminate, a deliberate specification choice that reads differently under harsh show lighting. <strong>Oracle Health</strong> paired signature red with edge-banded, wood-clad panel counters and greenery planters. <strong>Salesforce</strong> and <strong>AGFA</strong> followed similar playbooks. In a show where every exhibitor has an LED wall and impressive high-tech features, the brands that feel human stand out.</p><p>Material selection now carries as much strategic weight as technology selection. The competitive insight isn&rsquo;t &ldquo;add a plant.&rdquo; It&rsquo;s understanding that organic textures earn trust in an environment where every surface is backlit.</p></div></FadeIn>
<FadeIn><div className="pg pg2" style={{marginBottom:"36px"}}><div className="pi" onClick={() => setLightboxSrc("images/t02-chg-wood-greenery.jpg")} style={{cursor:"pointer"}}><img src="images/t02-chg-wood-greenery.jpg" alt="CHG Healthcare booth at HIMSS 2026" loading="lazy" /><div className="cap">CHG Healthcare: Wood, greenery, velvet</div></div><div className="pi" onClick={() => setLightboxSrc("images/t02-oracle-wood-planters.jpg")} style={{cursor:"pointer"}}><img src="images/t02-oracle-wood-planters.jpg" alt="Oracle Health booth at HIMSS 2026" loading="lazy" /><div className="cap">Oracle Health: Wood trim, greenery planters</div></div></div></FadeIn>
<FadeIn delay={0.15}><div className="co"><div className="col">Strategic Question</div><p>What percentage of your booth&rsquo;s surface area is screen vs. tactile material, and have you specified materials at a grade that holds up under close inspection and harsh overhead lighting: real wood veneer vs. printed laminate, preserved moss vs. plastic foliage?</p></div><a href="#index" className="bl">&larr; Back to Trend Index</a></FadeIn></div>

<div className="tb"><div className="th"><span className="tbdg">Trend #3</span><span className="tname">Vertical Scale and Multi-Story Architecture</span></div><div className="trl"></div>
<FadeIn><div className="tbody"><p><strong>athenahealth</strong> built a two-story structure with steel I-beam structural support and a cantilevered upper deck, featuring a glowing globe sculpture, caf&eacute;, and overhead signage framing the adjacent corners of the booth. <strong>InterSystems</strong> achieved comparable vertical presence with a cinema-size LED curtain wall, accented with fiber-optic fringe. <strong>Microsoft&rsquo;s</strong> 3D wireframe logo suspended overhead did the same.</p><p>Exhibitors competing for attention in a consolidated hall must own the vertical plane, whether through physical second stories, suspended sculpture, or cinema-scale LED that reads as architectural rather than decorative.</p></div></FadeIn>
<FadeIn><div className="pg pg2" style={{marginBottom:"36px"}}><div className="pi" onClick={() => setLightboxSrc("images/t03-athena-aerial.jpg")} style={{cursor:"pointer"}}><img src="images/t03-athena-aerial.jpg" alt="athenahealth booth at HIMSS 2026" loading="lazy" /><div className="cap">athenahealth: Two-story build, globe sculpture</div></div><div className="pi" onClick={() => setLightboxSrc("images/t03-intersystems-led.jpg")} style={{cursor:"pointer"}}><img src="images/t03-intersystems-led.jpg" alt="InterSystems LED curtain at HIMSS 2026" loading="lazy" /><div className="cap">InterSystems: Cinema-size LED curtain</div></div></div></FadeIn>
<FadeIn delay={0.15}><div className="co"><div className="col">Strategic Question</div><p>If you can&rsquo;t build a second story, what vertical elements can you deploy to own the sightline from 300+ feet, using rigging-compatible LED, tensioned fabric canopies, or suspended sculptural elements engineered within your venue&rsquo;s rigging load limits?</p></div><a href="#index" className="bl">&larr; Back to Trend Index</a></FadeIn></div>
</section>


<section id="cat-2"><div className="ch"><div className="cn">02</div><div className="cname">Messaging</div></div>

<div className="tb"><div className="th"><span className="tbdg">Trend #4</span><span className="tname">Legibility as a Competitive Design Advantage</span></div><div className="trl"></div>
<FadeIn><div className="tbody"><p><strong>athenahealth&rsquo;s</strong> &ldquo;Try the AI-native encounter&rdquo; messaging was readable from deep in the aisle: high-contrast sans-serif type at scale on direct-view LED, with content designed for distance legibility rather than repurposed slide decks. <strong>AWS</strong> deployed multiple LED pillars treating each column as an independent content zone with dedicated aspect ratios: &ldquo;Agentic AI for patient engagement,&rdquo; &ldquo;AI-ready data infrastructure,&rdquo; &ldquo;Zero Trust &amp; PHI Protection.&rdquo; This created scannable hierarchy for different buyer personas. When everyone has the same screen tech, typography becomes the differentiator.</p><p>The investment isn&rsquo;t in bigger screens. It&rsquo;s in tighter copy, larger type weights, and hierarchical layouts that let multiple buyer personas self-qualify at aisle speed without requiring a conversation.</p></div></FadeIn>
<FadeIn><div className="pg pg2" style={{marginBottom:"36px"}}><div className="pi" onClick={() => setLightboxSrc("images/t04-athena-globe-demo.jpg")} style={{cursor:"pointer"}}><img src="images/t04-athena-globe-demo.jpg" alt="athenahealth messaging at HIMSS 2026" loading="lazy" /><div className="cap">athenahealth: Readable signage, clear CTAs</div></div><div className="pi" onClick={() => setLightboxSrc("images/t04-aws-messaging.jpg")} style={{cursor:"pointer"}}><img src="images/t04-aws-messaging.jpg" alt="AWS messaging pillars at HIMSS 2026" loading="lazy" /><div className="cap">AWS: Hierarchical value proposition pillars</div></div></div></FadeIn>
<FadeIn delay={0.15}><div className="co"><div className="col">Strategic Question</div><p>Can your most important message be read and understood by someone walking past at aisle speed, using contrast-optimized typography at minimum 4-inch cap height on dedicated content zones with aspect ratios designed for aisle-speed scanning?</p></div><a href="#index" className="bl">&larr; Back to Trend Index</a></FadeIn></div>

<div className="tb"><div className="th"><span className="tbdg">Trend #5</span><span className="tname">Audience-Tuned Demo Zones</span></div><div className="trl"></div>
<FadeIn><div className="tbody"><p><strong>Hyland</strong> built purpose-designed demo environments: angular canopy, central LED tower with &ldquo;Healthcare runs on content,&rdquo; and multiple nook-style stations with cyan underglow from edge-lit LED strip in an aluminum channel recessed into the platform edge. Narrow-beam directional lighting and acoustic baffling isolate each demo experience. <strong>Kim Stavrinakis</strong> told Event Marketer the team asks each department about specific needs; radiology demos need minimized glare, suggesting matte-finish surrounds and controlled ambient light levels, creating &ldquo;intimate nooks that solve the problem without completely encapsulated spaces.&rdquo; Demo design driven by clinical reality, not convention.</p><p>The implication for exhibit designers: demo stations should be engineered for the specific content they display and the specific audience viewing it, not stamped from a generic template and replicated across product lines.</p></div></FadeIn>
<FadeIn><div className="pg pg2" style={{marginBottom:"36px"}}><div className="pi" onClick={() => setLightboxSrc("images/t05-hyland-wide.jpg")} style={{cursor:"pointer"}}><img src="images/t05-hyland-wide.jpg" alt="Hyland booth at HIMSS 2026" loading="lazy" /><div className="cap">Hyland: Angular canopy, LED tower, demo zones</div></div><div className="pi" onClick={() => setLightboxSrc("images/t05-hyland-interior.jpg")} style={{cursor:"pointer"}}><img src="images/t05-hyland-interior.jpg" alt="Hyland demo nooks at HIMSS 2026" loading="lazy" /><div className="cap">Hyland: Intimate nook-style demo stations</div></div></div></FadeIn>
<FadeIn delay={0.15}><div className="co"><div className="col">Strategic Question</div><p>Are your demo stations designed around what your product needs to look good, or engineered with task-specific lighting, acoustic separation, and glare-controlled surrounds calibrated to each product&rsquo;s viewing requirements?</p></div><a href="#index" className="bl">&larr; Back to Trend Index</a></FadeIn></div>
</section>


<section id="cat-3"><div className="ch"><div className="cn">03</div><div className="cname">Traffic Flow</div></div>

<div className="tb"><div className="th"><span className="tbdg">Trend #6</span><span className="tname">Open Perimeter Design with Defined Internal Zones</span></div><div className="trl"></div>
<FadeIn><div className="tbody"><p><strong>CIVIE</strong> solved a back-of-hall location with a dramatic arched neon entry portal. CRO <strong>Raymond McConnell</strong> told Event Marketer the exhibit house created a &ldquo;post-modern look that&rsquo;s impossible to miss&rdquo; with demo stations around a dynamic-content column inside. <strong>Greenway Health</strong> took the open route: teal LED columns and a Meeting Concierge desk. Both share the same principle: remove walls for foot traffic, use interior architecture to define zones. Structurally, open perimeters shift the load path from wall-supported panels to overhead rigging and freestanding columns, requiring rigging points rated for canopy, signage, and lighting loads that perimeter walls would otherwise carry. This trade-off demands early coordination with the venue&rsquo;s rigging grid and weight maps during schematic design.</p><p>The psychology matters: attendees moving at aisle speed make split-second entry decisions. A booth with visible exit paths and clear sightlines to interior activity feels lower-risk to enter than one with enclosed walls and gatekeeping reception counters.</p></div></FadeIn>
<FadeIn><div className="pg pg2" style={{marginBottom:"36px"}}><div className="pi" onClick={() => setLightboxSrc("images/t06-civie-entrance.jpg")} style={{cursor:"pointer"}}><img src="images/t06-civie-entrance.jpg" alt="CIVIE arched entry at HIMSS 2026" loading="lazy" /><div className="cap">CIVIE: Neon arched entry portal</div></div><div className="pi" onClick={() => setLightboxSrc("images/t06-greenway-open.jpg")} style={{cursor:"pointer"}}><img src="images/t06-greenway-open.jpg" alt="Greenway Health booth at HIMSS 2026" loading="lazy" /><div className="cap">Greenway Health: Open layout, teal columns</div></div></div></FadeIn>
<FadeIn delay={0.15}><div className="co"><div className="col">Strategic Question</div><p>If you removed your booth&rsquo;s walls entirely, what architectural elements would remain, and have you verified that overhead rigging capacity and freestanding column engineering can carry the canopy, signage, and lighting loads those walls currently support?</p></div><a href="#index" className="bl">&larr; Back to Trend Index</a></FadeIn></div>

<div className="tb"><div className="th"><span className="tbdg">Trend #7</span><span className="tname">Heatmapping and Behavioral Analytics</span></div><div className="trl"></div>
<FadeIn><div className="tbody"><p><strong>Leidos</strong> VP McDougall confirmed active heatmapping use, tracking where visitors stop, how long they stay, and where refinement is needed. This is the same technology <strong>Kontakt.io</strong> sells as its core product (AI-Powered RTLS), now deployed by exhibitors to optimize their own performance. The convergence is significant: the tracking tech on display is simultaneously being used as an exhibit tool behind the scenes. Implementation typically relies on BLE beacons embedded in badge lanyards or overhead LiDAR sensors mounted to truss, each with different accuracy profiles. BLE gives zone-level resolution (3&ndash;5 meter accuracy); overhead LiDAR can track individual paths at sub-meter precision but requires clear sightlines from mounting height and dedicated network backhaul.</p><p>Expect this to become standard practice for any exhibitor investing six or seven figures in floor space. The data these tools produce, including dwell time by zone, traffic patterns by hour, and drop-off points, directly informs next year&rsquo;s layout decisions.</p></div></FadeIn>
<FadeIn><div className="pg pg2" style={{marginBottom:"36px"}}><div className="pi" onClick={() => setLightboxSrc("images/t07-leidos-lens.jpg")} style={{cursor:"pointer"}}><img src="images/t07-leidos-lens.jpg" alt="Leidos booth at HIMSS 2026" loading="lazy" /><div className="cap">Leidos: Active heatmapping deployment</div></div><div className="pi" onClick={() => setLightboxSrc("images/t07-kontaktio-booth-wide.jpg")} style={{cursor:"pointer"}}><img src="images/t07-kontaktio-booth-wide.jpg" alt="Kontakt.io RTLS booth at HIMSS 2026" loading="lazy" /><div className="cap">Kontakt.io: AI-Powered RTLS, the enabling tech</div></div></div></FadeIn>
<FadeIn delay={0.15}><div className="co"><div className="col">Strategic Question</div><p>Do you know which 20% of your booth generates 80% of qualified conversations, and have you specified the right sensor modality (BLE for zone-level tracking vs. overhead LiDAR for individual path mapping) with mounting positions and network infrastructure designed into your exhibit plan?</p></div><a href="#index" className="bl">&larr; Back to Trend Index</a></FadeIn></div>

<div className="tb"><div className="th"><span className="tbdg">Trend #8</span><span className="tname">Venue Density as a Design Variable</span></div><div className="trl"></div>
<FadeIn><div className="tbody"><p><strong>Microsoft</strong> anchored one end with its 3D logo and Copilot Theater; <strong>Hyland</strong> and <strong>Philips</strong> canopies were visible everywhere. Exhibitors who anticipated tighter corridors, like <strong>Heidi&rsquo;s</strong> open-frame structure with deep sightlines, outperformed those using last year&rsquo;s assumptions. In a dense hall like the Venetian Expo Center, sightline modeling at 8-foot and 12-foot levels becomes a critical design exercise; signage below 8 feet disappears behind crowds, while overhead elements at 12+ feet catch long-distance attention but lose legibility without appropriately scaled type and high-contrast color.</p><p>Density amplifies every design decision: good signage becomes great, bad sightlines become invisible. The 2026 layout should be the baseline for all future HIMSS planning; this level of consolidation is likely the new normal.</p></div></FadeIn>
<FadeIn><div className="pg pg2" style={{marginBottom:"36px"}}><div className="pi" onClick={() => setLightboxSrc("images/t08-microsoft-density.jpg")} style={{cursor:"pointer"}}><img src="images/t08-microsoft-density.jpg" alt="Microsoft booth density at HIMSS 2026" loading="lazy" /><div className="cap">Microsoft: Hall density, canopies visible</div></div><div className="pi" onClick={() => setLightboxSrc("images/t08-heidi-aisle.jpg")} style={{cursor:"pointer"}}><img src="images/t08-heidi-aisle.jpg" alt="Heidi booth aisle at HIMSS 2026" loading="lazy" /><div className="cap">Heidi: Open frame, narrow-aisle sightlines</div></div></div></FadeIn>
<FadeIn delay={0.15}><div className="co"><div className="col">Strategic Question</div><p>Did your booth design account for narrower aisles and a consolidated hall, with sightline studies modeled at both 8-foot (crowd-level) and 12-foot (overhead) heights to ensure messaging lands at the distances this density demands?</p></div><a href="#index" className="bl">&larr; Back to Trend Index</a></FadeIn></div>
</section>


<section id="cat-4"><div className="ch"><div className="cn">04</div><div className="cname">Engagement</div></div>

<div className="tb"><div className="th"><span className="tbdg">Trend #9</span><span className="tname">Hospitality as a Demonstration Platform</span></div><div className="trl"></div>
<FadeIn><div className="tbody"><p><strong>Twilio&rsquo;s</strong> Cafe had attendees ordering iced coffee via WhatsApp/SMS, the exact messaging tech Twilio sells. Events Manager <strong>Amy Richardson</strong>: &ldquo;Medical practices need to communicate with their patients by texting.&rdquo; The coffee order was the demo. <strong>Salesforce</strong> went comfort-forward with electrolytes and trail mix in apothecary jars. The distinction: Twilio used hospitality as product trial; Salesforce used it for dwell time. Both work, but the key is knowing which you&rsquo;re executing. From an infrastructure standpoint, cafe activations add MEP complexity that standard exhibits don&rsquo;t carry: potable water supply, gray-water drainage, dedicated 20A circuits for commercial brewing equipment, and health department permitting that varies by venue and jurisdiction.</p><p>Richardson noted the cafe partnership with local business Brew Tea Bar added authenticity to the activation. The lesson: hospitality that tells your product story earns more pipeline value than hospitality that just keeps people comfortable.</p></div></FadeIn>
<FadeIn><div className="pg pg2" style={{marginBottom:"36px"}}><div className="pi" onClick={() => setLightboxSrc("images/t09-twilio-cafe.jpg")} style={{cursor:"pointer"}}><img src="images/t09-twilio-cafe.jpg" alt="Twilio Cafe at HIMSS 2026" loading="lazy" /><div className="cap">Twilio: Cafe as product demo</div></div><div className="pi" onClick={() => setLightboxSrc("images/t09-salesforce-selfcare.jpg")} style={{cursor:"pointer"}}><img src="images/t09-salesforce-selfcare.jpg" alt="Salesforce Self-Care Station at HIMSS 2026" loading="lazy" /><div className="cap">Salesforce: Self-Care Station</div></div></div></FadeIn>
<FadeIn delay={0.15}><div className="co"><div className="col">Strategic Question</div><p>Is your booth hospitality a brand-aligned product demonstration, and have you scoped the MEP requirements (water supply, drainage, dedicated circuits, health permits) that food and beverage activations add to your exhibit infrastructure brief?</p></div><a href="#index" className="bl">&larr; Back to Trend Index</a></FadeIn></div>

<div className="tb"><div className="th"><span className="tbdg">Trend #10</span><span className="tname">Non-Technology Sensory Activations</span></div><div className="trl"></div>
<FadeIn><div className="tbody"><p><strong>AMD</strong> installed a racing simulator, consumer gaming as pure stopping power. <strong>Centrak</strong> went fully analog with fashion sketch portraits on branded cards. <strong>Neurealm</strong> offered back massages. In a hall defined by AI messaging and LED spectacle, non-tech or low-tech activations create sensory contrast that makes the surrounding technology more memorable.</p><p>The strategic takeaway isn&rsquo;t to abandon tech. It&rsquo;s to use analog experiences as a sensory counterpoint that earns the attention to make your digital messaging land. The best booths alternated between the two.</p></div></FadeIn>
<FadeIn><div className="pg pg2" style={{marginBottom:"36px"}}><div className="pi" onClick={() => setLightboxSrc("images/t10-amd-racing-sim.jpg")} style={{cursor:"pointer"}}><img src="images/t10-amd-racing-sim.jpg" alt="AMD racing simulator at HIMSS 2026" loading="lazy" /><div className="cap">AMD: Full racing simulator rig</div></div><div className="pi" onClick={() => setLightboxSrc("images/t10-centrak-sketches.jpg")} style={{cursor:"pointer"}}><img src="images/t10-centrak-sketches.jpg" alt="Centrak fashion sketches at HIMSS 2026" loading="lazy" /><div className="cap">Centrak: Fashion sketch portraits</div></div></div></FadeIn>
<FadeIn delay={0.15}><div className="co"><div className="col">Strategic Question</div><p>What non-digital activation could make visitors physically stop, and have you specified the structural and electrical requirements (reinforced decking for dynamic loads, vibration isolation, dedicated power) so the activation performs reliably without compromising adjacent demo experiences?</p></div><a href="#index" className="bl">&larr; Back to Trend Index</a></FadeIn></div>

<div className="tb"><div className="th"><span className="tbdg">Trend #11</span><span className="tname">Humanoid Robotics as Booth Engagement</span></div><div className="trl"></div>
<FadeIn><div className="tbody"><p><strong>Kontakt.io</strong> deployed a humanoid robot on a red carpet with blue LED face and brand messaging. The robot served dual roles: traffic-stopping spectacle and physical embodiment of the AI/automation narrative. Deploying robotics in a live exhibit environment introduces logistical considerations beyond the spectacle, including charging infrastructure (dedicated 20A outlet within the robot&rsquo;s operating zone), ADA-compliant clearance paths around the unit, crowd-density safety protocols, and I&amp;D logistics for units that can exceed 200 lbs and require freight elevator access. Expect robotics to become standard activation by 2027, much like VR commoditized after its novelty window.</p><p>The first-mover advantage is real but brief. Exhibitors considering robotics for 2027 should plan for a floor where multiple competitors deploy them, and design activations that integrate robots into a brand story rather than treating them as standalone spectacle.</p></div></FadeIn>
<FadeIn><div className="pg pg2" style={{marginBottom:"36px"}}><div className="pi" onClick={() => setLightboxSrc("images/t11-kontaktio-robot.jpg")} style={{cursor:"pointer"}}><img src="images/t11-kontaktio-robot.jpg" alt="Kontakt.io robot at HIMSS 2026" loading="lazy" /><div className="cap">Kontakt.io: #1 attraction, humanoid robot</div></div><div className="pi" onClick={() => setLightboxSrc("images/t11-kontaktio-robot-2.jpg")} style={{cursor:"pointer"}}><img src="images/t11-kontaktio-robot-2.jpg" alt="Kontakt.io robot wide angle at HIMSS 2026" loading="lazy" /><div className="cap">Kontakt.io: Robot draws crowd on red carpet</div></div></div></FadeIn>
<FadeIn delay={0.15}><div className="co"><div className="col">Strategic Question</div><p>If robotics commoditize by 2027, what&rsquo;s the next frontier of physical activation, and have you planned for the charging infrastructure, ADA clearance, crowd-density safety, and freight logistics that autonomous units require in a live exhibit environment?</p></div><a href="#index" className="bl">&larr; Back to Trend Index</a></FadeIn></div>

<div className="tb"><div className="th"><span className="tbdg">Trend #12</span><span className="tname">The Quiet Zone as Engagement Differentiator</span></div><div className="trl"></div>
<FadeIn><div className="tbody"><p><strong>Solventum</strong> built a theater with dedicated presentation screen, a programmed quiet zone for focused engagement beyond 30-second aisle interactions. <strong>Snowflake&rsquo;s</strong> A-frame Ski Lodge booth used wood panels and branded meeting pods for private conversation. When the floor is overwhelmingly loud and dense, the exhibitor offering relief earns disproportionate dwell time. Effective acoustic isolation in an open exhibit environment relies on material and geometry: 2&ndash;3 inch acoustic panel absorbers (fabric-wrapped fiberglass or recycled PET felt) on interior surfaces, angled walls that deflect show-floor noise rather than reflecting it back, and optional white-noise masking systems tuned to the 40&ndash;50 dB range to raise the background floor and make conversation intelligible without raising voices.</p><p>Quiet space is no longer wasted square footage; it&rsquo;s a conversion tool. The conversations that happen in a private nook after 30 minutes of floor fatigue are qualitatively different from the ones that happen at an open demo counter.</p></div></FadeIn>
<FadeIn><div className="pg pg2" style={{marginBottom:"36px"}}><div className="pi" onClick={() => setLightboxSrc("images/t12-solventum-theater.jpg")} style={{cursor:"pointer"}}><img src="images/t12-solventum-theater.jpg" alt="Solventum theater at HIMSS 2026" loading="lazy" /><div className="cap">Solventum: Theater seating zone</div></div><div className="pi" onClick={() => setLightboxSrc("images/t12-snowflake-nooks.jpg")} style={{cursor:"pointer"}}><img src="images/t12-snowflake-nooks.jpg" alt="Snowflake meeting nooks at HIMSS 2026" loading="lazy" /><div className="cap">Snowflake: A-frame meeting pods</div></div></div></FadeIn>
<FadeIn delay={0.15}><div className="co"><div className="col">Strategic Question</div><p>What percentage of your floor plan is decompression space, and have you specified acoustic panel materials, wall geometry, and masking systems that achieve measurable noise reduction rather than relying on proximity and hope?</p></div><a href="#index" className="bl">&larr; Back to Trend Index</a></FadeIn></div>
</section>


<section id="cat-5"><div className="ch"><div className="cn">05</div><div className="cname">Technology</div></div>

<div className="tb"><div className="th"><span className="tbdg">Trend #13</span><span className="tname">Full-Height LED Becoming Standard at Every Tier</span></div><div className="trl"></div>
<FadeIn><div className="tbody"><p><strong>HeadsUp Health</strong>, even in a 10&apos;x20&apos;, had a clean display with full LED wall, despite it being a small booth. <strong>Juno Health</strong> used numbered full-height LED panels at the medium tier. The cost barrier has dropped enough that LED is able to be table stakes across all sizes.</p><p>LED strategy has shifted from &ldquo;should we have it?&rdquo; to &ldquo;what are we doing with it that no one else is?&rdquo; The content running on the wall matters more than the wall itself, and most exhibitors are still running logo loops.</p></div></FadeIn>
<FadeIn><div className="pg pg2" style={{marginBottom:"36px"}}><div className="pi" onClick={() => setLightboxSrc("images/t13-headsup-led-wall.jpg")} style={{cursor:"pointer"}}><img src="images/t13-headsup-led-wall.jpg" alt="HeadsUp Health LED at HIMSS 2026" loading="lazy" /><div className="cap">HeadsUp Health: Full LED wall, small booth</div></div><div className="pi" onClick={() => setLightboxSrc("images/t13-juno-led-panels.jpg")} style={{cursor:"pointer"}}><img src="images/t13-juno-led-panels.jpg" alt="Juno Health LED panels at HIMSS 2026" loading="lazy" /><div className="cap">Juno Health: Numbered LED zone panels</div></div></div></FadeIn>
<FadeIn delay={0.15}><div className="co"><div className="col">Strategic Question</div><p>Now that full-height LED is accessible at every tier, what&rsquo;s your content strategy for the screen, whether product UI, brand narrative, or just a logo loop, with pixel pitch specified for your actual viewing distance and content authored at native panel resolution rather than repurposed from larger-format assets?</p></div><a href="#index" className="bl">&larr; Back to Trend Index</a></FadeIn></div>

<div className="tb"><div className="th"><span className="tbdg">Trend #14</span><span className="tname">Sculptural and Non-Planar LED Configurations</span></div><div className="trl"></div>
<FadeIn><div className="tbody"><p><strong>CIVIE</strong> built a neon fever dream, an organic LED canopy with starfield ceiling and pink content column. <strong>Microsoft</strong> suspended an illuminated 3D wireframe logo overhead. <strong>IMO Health</strong> used LED arches with green edge lighting; <strong>CloudWave</strong> deployed illuminated cloud sculptures. Non-planar LED introduces structural engineering complexity that flat walls don&rsquo;t: curved and bent configurations require custom sub-frames, precise panel alignment tolerances, and content mapped to irregular surfaces using projection-style mapping software. CIVIE&rsquo;s organic canopy is not a standard LED rental; it&rsquo;s a fabricated structure with panels mounted on CNC-milled or formed aluminum carriers, requiring significantly more engineering hours and on-site calibration time. When flat LED is commoditized, the move is three-dimensional.</p><p>Bent, curved, suspended, and sculptural configurations create spatial experiences that flat walls cannot. The cost premium is meaningful but the differentiation is immediate; these are the booths that get photographed, shared, and remembered.</p></div></FadeIn>
<FadeIn><div className="pg pg2" style={{marginBottom:"36px"}}><div className="pi" onClick={() => setLightboxSrc("images/t14-civie-interior.jpg")} style={{cursor:"pointer"}}><img src="images/t14-civie-interior.jpg" alt="CIVIE sculptural LED at HIMSS 2026" loading="lazy" /><div className="cap">CIVIE: Neon canopy, starfield ceiling</div></div><div className="pi" onClick={() => setLightboxSrc("images/t14-microsoft-3d-logo.jpg")} style={{cursor:"pointer"}}><img src="images/t14-microsoft-3d-logo.jpg" alt="Microsoft 3D logo at HIMSS 2026" loading="lazy" /><div className="cap">Microsoft: 3D wireframe logo, Copilot Theater</div></div></div></FadeIn>
<FadeIn delay={0.15}><div className="co"><div className="col">Strategic Question</div><p>If your LED moves from flat to sculptural, what shape best embodies your brand, and have you budgeted for the structural engineering, custom sub-frames, content mapping, and extended on-site calibration that non-planar configurations require versus a flat wall install?</p></div><a href="#index" className="bl">&larr; Back to Trend Index</a></FadeIn></div>

<div className="tb"><div className="th"><span className="tbdg">Trend #15</span><span className="tname">Data-Driven Exhibit Intelligence Tools</span></div><div className="trl"></div>
<FadeIn><div className="tbody"><p><strong>Samsung</strong> partnered with <strong>Scienza</strong> to instrument the demo environment itself; attendees used tablet demos with AI voice assessment while the system captured behavioral data. Screen messaging featured Digital Human Gia alongside outcome metrics: 73% less documentation time, 27B clinical records. Sensor infrastructure, whether embedded tablets, overhead cameras, or BLE beacons, needs to be designed into the booth&rsquo;s electrical plan and network architecture during schematic design, not added after fabrication. Retrofitting sensors means exposed cable runs, compromised aesthetics, and unreliable data from poorly placed hardware. The product demo and the exhibit intelligence tool are converging into one system.</p><p>The exhibit becomes both the storefront and the feedback loop. Every demo interaction generates data that informs the next booth iteration, a closed loop that most exhibitors haven&rsquo;t built yet but will need to by 2027.</p></div></FadeIn>
<FadeIn><div className="pg pg2" style={{marginBottom:"36px"}}><div className="pi" onClick={() => setLightboxSrc("images/t15-samsung-demo.jpg")} style={{cursor:"pointer"}}><img src="images/t15-samsung-demo.jpg" alt="Samsung demo at HIMSS 2026" loading="lazy" /><div className="cap">Samsung: Instrumented demo environment</div></div><div className="pi" onClick={() => setLightboxSrc("images/t15-samsung-scienza.jpg")} style={{cursor:"pointer"}}><img src="images/t15-samsung-scienza.jpg" alt="Samsung x Scienza at HIMSS 2026" loading="lazy" /><div className="cap">Samsung × Scienza: Digital Human Gia</div></div></div></FadeIn>
<FadeIn delay={0.15}><div className="co"><div className="col">Strategic Question</div><p>Is your demo environment generating behavioral data, with sensor placement, data cabling, and network infrastructure designed into your electrical plan from schematic design, or is it a black box where you only know someone stopped if a rep noticed?</p></div><a href="#index" className="bl">&larr; Back to Trend Index</a></FadeIn></div>
</section>


<section id="cat-6"><div className="ch"><div className="cn">06</div><div className="cname">Social Media</div></div>

<div className="tb"><div className="th"><span className="tbdg">Trend #16</span><span className="tname">In-Booth Video Studios and Content Production</span></div><div className="trl"></div>
<FadeIn><div className="tbody"><p><strong>GE Healthcare</strong> installed mirrors that doubled as a content production set; attendees took selfies while video crews captured footage in the reflection. GE&rsquo;s mirror set requires lighting containment (tunable-white LED panels at 5000K for camera-ready color temperature), sound isolation (acoustic blankets or baffle walls to reduce show-floor bleed), and cable management for camera power, audio feeds, and live monitoring, all design-phase decisions that can&rsquo;t be solved with gaffer tape on-site. The booth as production environment: every visitor interaction generates owned media. The exhibitor becomes a publisher. The trade show becomes a content studio with 28,000 extras.</p><p>The ROI question has shifted from &ldquo;how many leads did we scan?&rdquo; to &ldquo;how many publishable assets did we produce?&rdquo; Exhibitors without a content production plan are leaving their biggest amplification multiplier on the table.</p></div></FadeIn>
<FadeIn><div className="pg pg2" style={{marginBottom:"36px"}}><div className="pi" onClick={() => setLightboxSrc("images/t16-ge-mirrors.jpg")} style={{cursor:"pointer"}}><img src="images/t16-ge-mirrors.jpg" alt="GE Healthcare mirrors at HIMSS 2026" loading="lazy" /><div className="cap">GE Healthcare: Mirror installation, video capture</div></div><div className="pi" onClick={() => setLightboxSrc("images/t16-ge-agentic-kiosk.jpg")} style={{cursor:"pointer"}}><img src="images/t16-ge-agentic-kiosk.jpg" alt="GE Healthcare kiosk at HIMSS 2026" loading="lazy" /><div className="cap">GE Healthcare: Agentic AI kiosk</div></div></div></FadeIn>
<FadeIn delay={0.15}><div className="co"><div className="col">Strategic Question</div><p>How many publishable assets did your booth produce during HIMSS, with lighting color temperature, sound isolation materials, and production cable management designed into your floor plan rather than improvised during I&amp;D?</p></div><a href="#index" className="bl">&larr; Back to Trend Index</a></FadeIn></div>

<div className="tb"><div className="th"><span className="tbdg">Trend #17</span><span className="tname">Personalization as Giveaway and Social Strategy</span></div><div className="trl"></div>
<FadeIn><div className="tbody"><p><strong>Juno Health</strong> generated &ldquo;serious buzz&rdquo; with personalized Owala bottles branded with &ldquo;Health IT is broken. AND I&rsquo;M FIXING IT.&rdquo; Named the #1 giveaway at HIMSS 2026. <strong>Continuant</strong> deployed a laser engraver personalizing items live. Live personalization equipment, including laser engravers, UV printers, and heat presses, adds a logistics footprint: dedicated 20A circuits, ventilation for fume extraction, operator workspace, and queue management design. Continuant&rsquo;s laser station needs a defined queue path that doesn&rsquo;t block aisle traffic, plus a staging area for finished items, spatial requirements that compete with demo zones for floor space. When the giveaway has someone&rsquo;s name on it, it gets photographed, shared, and kept.</p><p>The exhibitor&rsquo;s brand travels home in a carry-on instead of a convention center trash can. Live personalization also creates a dwell-time moment; people wait, watch, and engage while their item is being made.</p></div></FadeIn>
<FadeIn><div className="pg pg2" style={{marginBottom:"36px"}}><div className="pi" onClick={() => setLightboxSrc("images/t17-juno-owala-bottles.jpg")} style={{cursor:"pointer"}}><img src="images/t17-juno-owala-bottles.jpg" alt="Juno Health Owala bottles at HIMSS 2026" loading="lazy" /><div className="cap">Juno Health: #1 giveaway, personalized Owala</div></div><div className="pi" onClick={() => setLightboxSrc("images/t17-laser-engraver.jpg")} style={{cursor:"pointer"}}><img src="images/t17-laser-engraver.jpg" alt="Laser engraver at HIMSS 2026" loading="lazy" /><div className="cap">Live laser engraving: Personalization as event</div></div></div></FadeIn>
<FadeIn delay={0.15}><div className="co"><div className="col">Strategic Question</div><p>Is your giveaway designed to be photographed and posted, with the equipment&rsquo;s power, ventilation, operator space, and queue flow designed into your floor plan so the activation enhances traffic patterns rather than creating bottlenecks?</p></div><a href="#index" className="bl">&larr; Back to Trend Index</a></FadeIn></div>

<div className="tb"><div className="th"><span className="tbdg">Trend #18</span><span className="tname">Novelty Installations Designed as Photo Moments</span></div><div className="trl"></div>
<FadeIn><div className="tbody"><p><strong>daisyBill</strong> went 100% analog: bright yellow backdrop, inflatable daisy frame, flower swag, daisy cushions, standing out precisely because everything around it was screens. Lighting for photography differs fundamentally from general booth lighting; daisyBill&rsquo;s bright yellow backdrop works because it provides high-contrast, even illumination at roughly 5600K daylight balance, which smartphone cameras auto-expose well against. Purpose-built photo moments spec front-fill LED at controlled color temperature, minimal overhead spill, and a background surface with enough saturation and contrast to pop on a phone screen without flash. <strong>Jardogs Health</strong> deployed a giant Lego Golden Retriever with badge-scan sweepstakes. These cost a fraction of LED walls but generate outsized social impressions. If it&rsquo;s worth photographing, it&rsquo;s worth building.</p><p>HIMSS itself installed 3D letter installations as selfie stations, validating the strategy at the organizer level. The cost-to-impression ratio on these analog installations dramatically outperforms LED, and they give attendees a reason to tag your brand unprompted.</p></div></FadeIn>
<FadeIn><div className="pg pg2" style={{marginBottom:"36px"}}><div className="pi" onClick={() => setLightboxSrc("images/t18-daisybill-booth.jpg")} style={{cursor:"pointer"}}><img src="images/t18-daisybill-booth.jpg" alt="daisyBill booth at HIMSS 2026" loading="lazy" /><div className="cap">daisyBill: Analog yellow, inflatable daisy</div></div><div className="pi" onClick={() => setLightboxSrc("images/t18-jardogs-lego.jpg")} style={{cursor:"pointer"}}><img src="images/t18-jardogs-lego.jpg" alt="Jardogs Health Lego puppy at HIMSS 2026" loading="lazy" /><div className="cap">Jardogs Health: Giant Lego Golden Retriever</div></div></div></FadeIn>
<FadeIn delay={0.15}><div className="co"><div className="col">Strategic Question</div><p>What could you build for under $5,000 that generates more social impressions than your $50,000 LED wall, with lighting designed for smartphone photography (front-fill at daylight color temperature, controlled spill, and background contrast calibrated to auto-exposure) rather than relying on your general booth lighting to do double duty?</p></div><a href="#index" className="bl">&larr; Back to Trend Index</a></FadeIn></div>
</section>


<section className="section section--b" id="takeaways">
  <div className="pr"></div>
  <div className="sl">Conclusive Summary</div>
  <h2 className="st">Key Takeaways from HIMSS 2026</h2>
  <div className="tk"><h3>The Booth Is Now a Media Property</h3><p>The most effective exhibitors treated their booth as a content production environment. From GE&rsquo;s mirror installations to Juno&rsquo;s personalized Owala bottles, every element generated publishable, shareable content. The exhibit is measured on owned media produced and brand narrative amplified, not just leads scanned.</p></div>
  <div className="tk"><h3>Technology Is Table Stakes; Humanity Differentiates</h3><p>When every exhibitor has full-height LED and AI messaging, the brands that stood out invested in human-scale experiences: warm wood, living greenery, fashion sketches, iced coffee, quiet seating. The more screens on the floor, the more valuable non-screen experiences become.</p></div>
  <div className="tk"><h3>Density Rewards the Prepared</h3><p>The consolidated Venetian hall created the busiest HIMSS floor in recent memory. Exhibitors who anticipated narrower aisles, designed for crowded sightlines, and built open perimeters with defined internal zones outperformed those using last year&rsquo;s assumptions. This consolidation is likely the new normal.</p></div>
  <div className="tk"><h3>Measurement Is Becoming Infrastructure</h3><p>Leidos using heatmapping, Samsung deploying instrumented demos, Kontakt.io selling the RTLS tech that enables booth analytics: the line between exhibit design and data infrastructure is dissolving. The winners in 2027 build measurement in from day one.</p></div>
  <div className="tk"><h3>What This Means for Your Program</h3><p>The trends documented in this report represent an evolving competitive landscape. As exhibit designers, our role is to translate these observations into actionable design strategies tailored to each client&rsquo;s brand, audience, and budget. The patterns we identified at HIMSS26 will directly inform our design recommendations for the 2026&ndash;2027 show cycle.</p></div>

  <FadeIn>
  <div className="gallery-grid">
    {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => {
      const src = `images/gallery-${String(n).padStart(3,'0')}.jpg`;
      return (
        <div key={n} className="gallery-item" onClick={() => setLightboxSrc(src)} style={{cursor:"pointer"}}>
          <img src={src} alt={`HIMSS 2026 gallery ${n}`} loading="lazy" />
        </div>
      );
    })}
  </div>
  </FadeIn>
</section>




<button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 15l-6-6-6 6" />
  </svg>
</button>

</div>

{lightboxSrc && (
  <div className="lightbox-overlay" onClick={() => setLightboxSrc(null)}>
    <button className="lightbox-close" onClick={() => setLightboxSrc(null)}>&times;</button>
    <img src={lightboxSrc} alt="" onClick={(e) => e.stopPropagation()} />
  </div>
)}
    </>
  );
};

export default HIMSSReport;
