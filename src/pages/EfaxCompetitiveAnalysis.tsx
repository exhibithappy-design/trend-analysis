import { useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import './EfaxCompetitiveAnalysis.css';

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

const EfaxCompetitiveAnalysis = () => {
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
    const links = document.querySelectorAll('.efax-page .nav-link[href^="#"]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const id = en.target.getAttribute('id');
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
    <div className="efax-page">
      <div className="pink-bar"></div>
      <div className="mobile-bar">
        <button className="hamburger" onClick={toggleNav} aria-label="Menu"><span></span></button>
        <img src="/images/exhibit-happy-logo.svg" alt="Exhibit Happy" style={{height:'20px'}} />
      </div>
      <div className="sidebar-overlay" id="overlay" onClick={toggleNav}></div>
      <nav className="sidebar" id="sidebar">
        <div className="sidebar-brand">
          <img src="/images/exhibit-happy-logo.svg" alt="Exhibit Happy" style={{width:'140px'}} />
          <div className="report-label" style={{marginTop:'10px'}}>eFax Competitive<br />Analysis</div>
        </div>
        <div className="sidebar-nav">
          <div className="nav-group-label">Report</div>
          <a href="#landscape" className="nav-link" onClick={closeMobile}><span className="nav-circle"></span> Introduction</a>
          <div className="nav-group-label">Competitors</div>
          <a href="#etherfax" className="nav-link" onClick={closeMobile}><span className="nav-num">01</span> Etherfax</a>
          <a href="#opentext" className="nav-link" onClick={closeMobile}><span className="nav-num">02</span> OpenText</a>
          <a href="#concord" className="nav-link" onClick={closeMobile}><span className="nav-num">03</span> Concord Technologies</a>
          <a href="#westfax" className="nav-link" onClick={closeMobile}><span className="nav-num">04</span> WestFax</a>
          <div className="nav-group-label">Analysis</div>
          <a href="#comparison" className="nav-link" onClick={closeMobile}><span className="nav-circle"></span> Comparison</a>
          
          <div className="nav-group-label" style={{marginTop:'24px'}}>Related</div>
          <Link to="/" className="nav-link" onClick={closeMobile}><span className="nav-num">&larr;</span> Trend Analysis</Link>
        </div>
        <div className="sidebar-footer"><span>&copy; 2026 Steelhead Productions</span></div>
      </nav>

      <div className="main">

        {/* HERO */}
        <section className="hero" id="top">
          <div className="hero-img"><img src="/images/efax-hero.jpg" alt="eFax booth at HIMSS 2026" /></div>
          <div className="hero-ov"></div>
          <div className="hero-c">
            <FadeIn>
              <h1>eFax<br /><span className="thin">Competitive Analysis</span></h1>
              <p className="hero-sub">How four direct competitors presented themselves on the HIMSS 2026 show floor — and what the competitive landscape signals for Consensus going forward.</p>
            </FadeIn>
          </div>
        </section>

        {/* INTRODUCTION */}
        <section className="section section--w" id="landscape">
          <FadeIn>
            <div className="pr"></div>
            <div className="sl">Introduction</div>
            <h2 className="st">The Fax &amp; Document Exchange Landscape at HIMSS 2026</h2>
            <div className="ed">
              <p className="drop">Four direct eFax competitors exhibited at HIMSS 2026; Etherfax, OpenText, Concord Technologies, and WestFax, and the investment gap between them was wide. Etherfax built a two-story island, easily the largest fax-focused footprint on the floor. OpenText and Concord brought respectable 20x20 islands. WestFax held a 10x20 inline. The category is clearly splitting into two tiers, with Consensus and Etherfax operating at the enterprise level, purely from a booth design perspective.</p>
              <p>From a design standpoint, what's most notable is what was missing from every single one of these booths. No coffee bar. No theater. No activation of any kind. Every competitor in this niche is relying on scheduled meetings and staff pulling people from the aisle. Nobody has built a reason for a passerby to walk in unprompted — which is exactly what the eFax 30x40 does with the Spotlight Theater, the coffee bar, and the zoned layout that moves people through the space.</p>
              <p>Below, each competitor is assessed across five exhibit design categories: Brand Presence, Messaging, Traffic Flow, Engagement, and Technology. Scores are relative to this competitive set.</p>
            </div>
          </FadeIn>
        </section>

        {/* ═══ ETHERFAX ═══ */}
        <section id="etherfax">
          <div className="ch"><div className="cn">01</div><div className="cname">Etherfax</div></div>
          <div className="tb">
            <div className="trl"></div>
            <FadeIn>
              <div className="pg pg2" style={{marginBottom:'36px'}}>
                <div className="pi" style={{cursor:'pointer'}} onClick={() => setLightboxSrc('/images/etherfax-001.jpg')}><img src="/images/etherfax-001.jpg" alt="Etherfax booth at HIMSS 2026" loading="lazy" /><div className="cap">Etherfax — Oval header, LED screen, reception desk</div></div>
                <div className="pi" style={{cursor:'pointer'}} onClick={() => setLightboxSrc('/images/etherfax-002.jpg')}><img src="/images/etherfax-002.jpg" alt="Etherfax booth wide angle" loading="lazy" /><div className="cap">Etherfax — Two-story structure, meeting rooms above</div></div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="cat-row">
                <div className="cat-badge high"><div className="cat-label">Brand Presence</div><div className="cat-score">8</div><div className="cat-of">/10</div></div>
                <div className="cat-badge mid"><div className="cat-label">Messaging</div><div className="cat-score">6</div><div className="cat-of">/10</div></div>
                <div className="cat-badge mid"><div className="cat-label">Traffic Flow</div><div className="cat-score">7</div><div className="cat-of">/10</div></div>
                <div className="cat-badge low"><div className="cat-label">Engagement</div><div className="cat-score">5</div><div className="cat-of">/10</div></div>
                <div className="cat-badge high"><div className="cat-label">Technology</div><div className="cat-score">8</div><div className="cat-of">/10</div></div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="tbody">
                <p><strong>Brand Presence:</strong> Biggest booth in the competitive set and the only two-story build. The oval suspended header gives them multi-aisle sightlines, and the second floor communicates scale and permanence. Rounded reception counter is a nice detail. From across the hall, this reads as a serious infrastructure company.</p>
                <p><strong>Messaging:</strong> They're trying to say too many things at once. "AI Insights," compliance badges, government agency focus, and core fax infrastructure all compete for the same wall space. No single headline dominates. A visitor walking by at aisle speed wouldn't know what to focus on.</p>
                <p><strong>Traffic Flow:</strong> Open ground floor with the reception desk creating a natural entry point. The second story adds private meeting capacity but does nothing for floor traffic — you can't see it from the aisle, so it serves booked appointments only.</p>
                <p><strong>Engagement:</strong> Nothing. No hospitality, no activation, no draw. This is a meetings booth. If you don't have an appointment, there's no reason to walk in.</p>
                <p><strong>Technology:</strong> Large-format LED screen running product content, secondary monitors at demo stations, and a well-produced lit header. Strongest tech hardware in the set.</p>
              </div>
              <a href="#comparison" className="bl">&darr; Jump to Comparison</a>
            </FadeIn>
          </div>
        </section>

        {/* ═══ OPENTEXT ═══ */}
        <section id="opentext">
          <div className="ch"><div className="cn">02</div><div className="cname">OpenText</div></div>
          <div className="tb">
            <div className="trl"></div>
            <FadeIn>
              <div className="pg pg2" style={{marginBottom:'36px'}}>
                <div className="pi" style={{cursor:'pointer'}} onClick={() => setLightboxSrc('/images/opentext-001.jpg')}><img src="/images/opentext-001.jpg" alt="OpenText booth at HIMSS 2026" loading="lazy" /><div className="cap">OpenText — Blue underglow, demo stations</div></div>
                <div className="pi" style={{cursor:'pointer'}} onClick={() => setLightboxSrc('/images/opentext-002.jpg')}><img src="/images/opentext-002.jpg" alt="OpenText booth front angle" loading="lazy" /><div className="cap">OpenText — Overhead canopy, product messaging</div></div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="cat-row">
                <div className="cat-badge mid"><div className="cat-label">Brand Presence</div><div className="cat-score">7</div><div className="cat-of">/10</div></div>
                <div className="cat-badge mid"><div className="cat-label">Messaging</div><div className="cat-score">6</div><div className="cat-of">/10</div></div>
                <div className="cat-badge mid"><div className="cat-label">Traffic Flow</div><div className="cat-score">6</div><div className="cat-of">/10</div></div>
                <div className="cat-badge low"><div className="cat-label">Engagement</div><div className="cat-score">4</div><div className="cat-of">/10</div></div>
                <div className="cat-badge mid"><div className="cat-label">Technology</div><div className="cat-score">7</div><div className="cat-of">/10</div></div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="tbody">
                <p><strong>Brand Presence:</strong> Clean 20x20 island with a dark canopy and blue underglow. Cohesive palette, consistent branding. Reads as polished and professional. The lower canopy height limits sightline distance compared to Etherfax or eFax. It's a good booth that doesn't try to be more than it is.</p>
                <p><strong>Messaging:</strong> "Business AI" is the headline, with product-specific messaging on secondary panels. It's clear they're pivoting their identity toward AI, but the fax/document exchange story is buried. A healthcare buyer walking by might not realize OpenText handles fax at all.</p>
                <p><strong>Traffic Flow:</strong> Island layout with open corners. Demo stations along two faces create natural stopping points. Meeting area behind the back wall provides privacy. Functional, not inspired.</p>
                <p><strong>Engagement:</strong> Demo stations are the only draw. No hospitality, no activation, no content theater. This booth works if you already know you want to talk to OpenText.</p>
                <p><strong>Technology:</strong> Overhead-mounted screens, backlit panels, and blue LED underglow. The lighting design is the most considered in the competitive set — subtle but effective. No large-format LED wall.</p>
              </div>
              <a href="#comparison" className="bl">&darr; Jump to Comparison</a>
            </FadeIn>
          </div>
        </section>

        {/* ═══ CONCORD ═══ */}
        <section id="concord">
          <div className="ch"><div className="cn">03</div><div className="cname">Concord Technologies</div></div>
          <div className="tb">
            <div className="trl"></div>
            <FadeIn>
              <div className="pg pg2" style={{marginBottom:'36px'}}>
                <div className="pi" style={{cursor:'pointer'}} onClick={() => setLightboxSrc('/images/concord-001.jpg')}><img src="/images/concord-001.jpg" alt="Concord Technologies booth at HIMSS 2026" loading="lazy" /><div className="cap">Concord — Wave-form header, teal brand wall</div></div>
                <div className="pi" style={{cursor:'pointer'}} onClick={() => setLightboxSrc('/images/concord-002.jpg')}><img src="/images/concord-002.jpg" alt="Concord Technologies booth activation" loading="lazy" /><div className="cap">Concord — Racing activation, sponsored driver</div></div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="cat-row">
                <div className="cat-badge mid"><div className="cat-label">Brand Presence</div><div className="cat-score">6</div><div className="cat-of">/10</div></div>
                <div className="cat-badge low"><div className="cat-label">Messaging</div><div className="cat-score">5</div><div className="cat-of">/10</div></div>
                <div className="cat-badge low"><div className="cat-label">Traffic Flow</div><div className="cat-score">5</div><div className="cat-of">/10</div></div>
                <div className="cat-badge mid"><div className="cat-label">Engagement</div><div className="cat-score">6</div><div className="cat-of">/10</div></div>
                <div className="cat-badge low"><div className="cat-label">Technology</div><div className="cat-score">5</div><div className="cat-of">/10</div></div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="tbody">
                <p><strong>Brand Presence:</strong> 20x20 island with a curved wave-form header showing the logo on all four sides. Teal brand color is consistent across the back wall. The header shape is distinctive and provides decent overhead read. Overall impression is mid-tier — clean and functional but nothing about the materials or finish says premium.</p>
                <p><strong>Messaging:</strong> Two taglines competing on adjacent panels: "Drive smarter, faster, more connected intelligent data exchange" on one, "Powering Healthcare Through Intelligent Data Exchange" on the other. Both are feature language, not outcome language. "THE BIG PROBLEM" on the demo screen hints at a narrative approach, but the execution feels unpolished compared to the content quality on competitor screens.</p>
                <p><strong>Traffic Flow:</strong> One dominant entry face with a closed back wall. High-top tables for casual conversations, but no defined zones. The racing activation in the second image creates visual energy but also creates spatial confusion — visitors aren't sure what this booth is about when a driver in a Wonder Bread racing suit is standing in front of the healthcare messaging.</p>
                <p><strong>Engagement:</strong> The only competitor attempting an activation. A racing theme with a sponsored driver, checkered flag props, and racing sim content generates curiosity and foot traffic. The problem is the disconnect — there's no visible thread connecting racing to fax or document exchange. People stop, but they don't connect the moment to the product.</p>
                <p><strong>Technology:</strong> One large screen, one secondary monitor, internally lit header. Proportional to the booth size but not differentiated.</p>
              </div>
              <a href="#comparison" className="bl">&darr; Jump to Comparison</a>
            </FadeIn>
          </div>
        </section>

        {/* ═══ WESTFAX ═══ */}
        <section id="westfax">
          <div className="ch"><div className="cn">04</div><div className="cname">WestFax</div></div>
          <div className="tb">
            <div className="trl"></div>
            <FadeIn>
              <div className="pg pg2" style={{marginBottom:'36px'}}>
                <div className="pi" style={{cursor:'pointer'}} onClick={() => setLightboxSrc('/images/westfax-001.jpg')}><img src="/images/westfax-001.jpg" alt="WestFax booth at HIMSS 2026" loading="lazy" /><div className="cap">WestFax — Inline 10x20, black panels, backlit counter</div></div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="cat-row">
                <div className="cat-badge low"><div className="cat-label">Brand Presence</div><div className="cat-score">4</div><div className="cat-of">/10</div></div>
                <div className="cat-badge mid"><div className="cat-label">Messaging</div><div className="cat-score">6</div><div className="cat-of">/10</div></div>
                <div className="cat-badge low"><div className="cat-label">Traffic Flow</div><div className="cat-score">3</div><div className="cat-of">/10</div></div>
                <div className="cat-badge low"><div className="cat-label">Engagement</div><div className="cat-score">3</div><div className="cat-of">/10</div></div>
                <div className="cat-badge low"><div className="cat-label">Technology</div><div className="cat-score">4</div><div className="cat-of">/10</div></div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="tbody">
                <p><strong>Brand Presence:</strong> Inline 10x20 with black fabric panels, red accent stripe, and no overhead signage. One aisle face, no sightline from distance. This reads as a startup or early-stage presence. The "Human Flourishing Through Connection" tagline is a curious choice for a fax company at a trade show — aspirational on a website, confusing on a show floor where people need to know what you sell in three seconds.</p>
                <p><strong>Messaging:</strong> Here's the surprise: WestFax has the clearest product messaging in the entire competitive set. "Smarter Fax Workflows" — three words, instantly understood. "WestFax Comprehend — DIRECTLY INTO EHR SYSTEM" on the backlit counter communicates a specific capability. "HITRUST CSF Certified" adds compliance credibility. Every larger competitor in this set could learn from this level of specificity.</p>
                <p><strong>Traffic Flow:</strong> Inline booths can only work with one open face. The counter creates a physical barrier. No pull mechanism. Visitors have to deliberately choose to approach, which means WestFax lives or dies on pre-show outreach and aisle conversations.</p>
                <p><strong>Engagement:</strong> A screen and a conversation. That's it. Appropriate for the investment level, but it means the booth can only serve people who already know they want to talk to WestFax.</p>
                <p><strong>Technology:</strong> One wall-mounted demo screen, one backlit counter graphic. Clean for the scale. No dynamic content.</p>
              </div>
              <a href="#comparison" className="bl">&darr; Jump to Comparison</a>
            </FadeIn>
          </div>
        </section>

        {/* ═══ SIDE-BY-SIDE ═══ */}
        <section className="section section--b" id="comparison">
          <FadeIn>
            <div className="pr"></div>
            <div className="sl">Comparative View</div>
            <h2 className="st">Side-by-Side Scoring</h2>

            <div className="table-wrap">
            <table className="comp-table">
              <thead>
                <tr><th>Category</th><th>Etherfax</th><th>OpenText</th><th>Concord</th><th>WestFax</th></tr>
              </thead>
              <tbody>
                <tr><td className="highlight">Brand Presence</td><td className="winner">8</td><td>7</td><td>6</td><td>4</td></tr>
                <tr><td className="highlight">Messaging</td><td>6</td><td>6</td><td>5</td><td className="winner">6</td></tr>
                <tr><td className="highlight">Traffic Flow</td><td className="winner">7</td><td>6</td><td>5</td><td>3</td></tr>
                <tr><td className="highlight">Engagement</td><td>5</td><td>4</td><td className="winner">6</td><td>3</td></tr>
                <tr><td className="highlight">Technology</td><td className="winner">8</td><td>7</td><td>5</td><td>4</td></tr>
                <tr style={{borderTop:'2px solid var(--pink)'}}><td className="highlight" style={{color:'var(--pink)'}}>Total</td><td className="winner">34</td><td>30</td><td>27</td><td>20</td></tr>
              </tbody>
            </table>
            </div>

            <div className="tbody" style={{marginTop:'36px'}}>
              <p style={{color:'var(--gray-subtle)'}}><strong style={{color:'var(--white)'}}>For reference:</strong> The eFax 30x40 scored 42/50 in our internal assessment across the same categories — leading the competitive set by 8 points over Etherfax and 12+ over every other competitor.</p>
            </div>
          </FadeIn>
        </section>



        <button className="back-to-top" onClick={() => window.scrollTo({top:0,behavior:'smooth'})} aria-label="Back to top">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>

      </div>

      {lightboxSrc && (
        <div className="lightbox-overlay" onClick={() => setLightboxSrc(null)}>
          <button className="lightbox-close" onClick={() => setLightboxSrc(null)}>&times;</button>
          <img src={lightboxSrc} alt="Enlarged view" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default EfaxCompetitiveAnalysis;
