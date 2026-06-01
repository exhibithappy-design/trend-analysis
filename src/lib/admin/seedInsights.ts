export type SeedInsight = {
  id: string;
  kind: 'engagement' | 'anomaly' | 'recommendation' | 'trend';
  title: string;
  body: string;
  metadata?: { edition_id?: string; card_id?: string };
  sample: true;
};

export const SEED_INSIGHTS: SeedInsight[] = [
  {
    id: 'seed-1',
    kind: 'engagement',
    title: 'Engagement up 23% week-over-week',
    body: 'Page views jumped from 1,840 to 2,265 last week, driven primarily by the latest trend edition. Sessions averaged 4m12s, the highest in the last 90 days.',
    sample: true,
  },
  {
    id: 'seed-2',
    kind: 'anomaly',
    title: 'Depth-mode completion drop on "Hybrid retail spaces"',
    body: 'Compact-mode completion holds at 71%, but Depth-mode dropped to 28% (vs 54% avg). The long-form scaffolding likely needs tightening or a stronger lede.',
    sample: true,
  },
  {
    id: 'seed-3',
    kind: 'recommendation',
    title: 'Refresh copy on "Sensory branding" card',
    body: 'This card has been live for 42 days with declining CTR (3.1% → 1.4%). Suggest a new opening hook and updated case-study citation.',
    sample: true,
  },
  {
    id: 'seed-4',
    kind: 'trend',
    title: 'New trend candidate: "Modular pop-up systems"',
    body: 'Search volume for modular booth systems is up 38% over 60 days, and three editions reference the pattern without a dedicated card. Strong candidate for the next edition.',
    sample: true,
  },
  {
    id: 'seed-5',
    kind: 'recommendation',
    title: '"Live demo experiences" underperforms in Compact mode',
    body: 'Depth mode CTR is 5.2% but Compact mode sits at 0.8%. The current summary buries the value prop—consider leading with the engagement stat.',
    sample: true,
  },
  {
    id: 'seed-6',
    kind: 'engagement',
    title: 'Top performer: "AI-personalized booth flows"',
    body: '4.6% click-through, 78% scroll depth, 92 unique visitors in the last 7 days. Consider expanding into a standalone deep-dive.',
    sample: true,
  },
];