export interface EduCard {
  id:          string;
  series:      'hunger' | 'fasting' | 'gut' | 'breathing';
  seriesLabel: string;
  title:       string;
  body:        string;
  videoId?:    string;   // key into videoLibrary
}

export const EDU_CARDS: EduCard[] = [
  // ── Hunger ─────────────────────────────────────────────────────────────────
  {
    id: 'hunger-1', series: 'hunger', seriesLabel: 'Understanding Hunger',
    title: 'What Is Hunger, Really?',
    body:  'Your brain distinguishes two types of hunger: gastric hunger (driven by the stomach hormone ghrelin) and hedonic hunger (driven by the brain\'s reward system). Most cravings between meals are hedonic — a habit, not a physiological need. True hunger builds slowly and does not spike.',
    videoId: 'hunger-science',
  },
  {
    id: 'hunger-2', series: 'hunger', seriesLabel: 'Understanding Hunger',
    title: 'The Hunger Wave',
    body:  'Ghrelin pulses in waves, not a steady signal. Each wave peaks and subsides in 20 to 40 minutes whether you eat or not. What most people call hunger is the crest of the wave. Staying with it for 20 minutes is usually enough for it to pass completely.',
    videoId: 'hunger-science',
  },
  {
    id: 'hunger-3', series: 'hunger', seriesLabel: 'Understanding Hunger',
    title: 'Why Insulin Creates Hunger',
    body:  'When blood glucose spikes and then crashes after a high-carbohydrate meal, your body reads the drop as an emergency. Insulin drives glucose into cells rapidly, creating a reactive dip that triggers strong hunger within 90 minutes of eating. Lower-insulin meals — protein, fat, fibre — produce longer, flatter satiety curves.',
  },
  {
    id: 'hunger-4', series: 'hunger', seriesLabel: 'Understanding Hunger',
    title: 'Your Gut Talks to Your Brain',
    body:  '95% of serotonin — your key satiety and mood neurotransmitter — is made in the gut, not the brain. A well-fed microbiome sends clearer fullness signals through the vagus nerve. When gut diversity is low (fewer than 10 plant species per week), these signals can misfire — leading to overeating or ignoring real hunger.',
    videoId: 'gut-brain',
  },
  {
    id: 'hunger-5', series: 'hunger', seriesLabel: 'Understanding Hunger',
    title: 'Eating Without Hunger',
    body:  'Environmental cues — large plates, visible food, social eating — are stronger predictors of how much we eat than physiological hunger. One practice changes more than any diet plan: before each meal, pause and ask "Am I physically hungry, or is this a habit or emotion?" One pause, repeated daily.',
  },

  // ── Fasting Science ─────────────────────────────────────────────────────────
  {
    id: 'fasting-1', series: 'fasting', seriesLabel: 'Fasting Science',
    title: 'Why Fasting Works — The Core Mechanism',
    body:  'All fasting\'s benefits flow from one core change: insulin falls. When insulin drops, fat cells release stored fatty acids. The liver converts some to ketones. Autophagy — cellular cleanup — begins. Growth hormone rises to protect muscle. Every hour of fasting extends this metabolic repair window.',
    videoId: 'fasting-science',
  },
  {
    id: 'fasting-2', series: 'fasting', seriesLabel: 'Fasting Science',
    title: 'Autophagy: Your Cells Taking Out the Trash',
    body:  'Autophagy (from Greek: self-eating) is your cells\' recycling programme — damaged proteins, worn-out organelles, and cellular debris are broken down and rebuilt. It is the same process that won Yoshinori Ohsumi the 2016 Nobel Prize. It begins around 16 hours of fasting and is well established by 24 hours.',
    videoId: 'autophagy',
  },
  {
    id: 'fasting-3', series: 'fasting', seriesLabel: 'Fasting Science',
    title: 'The 11 Stages of a Fast',
    body:  'Your body transitions through 11 distinct metabolic states during a fast. The first 4 hours are digestion and glycogen drawdown. By 12 hours you are in early ketosis. By 16 hours autophagy is measurable. By 24 hours you are in deep repair territory. Each stage has its own hormone signature, gut state, and felt experience.',
  },
  {
    id: 'fasting-4', series: 'fasting', seriesLabel: 'Fasting Science',
    title: 'Growth Hormone: The Muscle Protector',
    body:  'The common fear that fasting burns muscle is reversed by the body\'s own response. Growth hormone rises 2000% in men and 1300% in women during a 16-hour fast (Hartman et al., 1992). Its primary job here is to mobilise fat while protecting lean tissue. Fasting does not eat muscle — it triggers the hormone that defends it.',
    videoId: 'fasting-science',
  },
  {
    id: 'fasting-5', series: 'fasting', seriesLabel: 'Fasting Science',
    title: 'How to Break a Fast',
    body:  'How you eat after a fast matters as much as the fast itself. Start with something small and easy to digest — a handful of nuts, a small bowl of curd, a banana. Wait 20 minutes before your main meal. A large meal immediately after a long fast causes a rapid insulin spike and reactive hypoglycaemia. The refeeding window is part of the protocol.',
  },
  {
    id: 'fasting-6', series: 'fasting', seriesLabel: 'Fasting Science',
    title: 'Fasting and Your Gut Microbiome',
    body:  'Each fast is a rest day for your gut. The migrating motor complex — your intestinal cleaning wave — runs only in the absence of food. It sweeps undigested debris, bacteria, and mucus from the small intestine. Three to four hours completes one cycle. An 18-hour fast runs roughly five complete cycles. Your gut cleans itself every time you fast.',
    videoId: 'gut-brain',
  },

  // ── Gut Health ──────────────────────────────────────────────────────────────
  {
    id: 'gut-1', series: 'gut', seriesLabel: 'Gut Health',
    title: 'The 30-Plant Rule',
    body:  'The American Gut Project — the largest microbiome study ever done — found that people who ate 30 or more different plant species per week had significantly more diverse gut microbiomes than those who ate fewer than 10. Each different plant feeds a different bacterial species. Spices, seeds, herbs, and legumes all count.',
    videoId: 'gut-diversity',
  },
  {
    id: 'gut-2', series: 'gut', seriesLabel: 'Gut Health',
    title: 'Why Fermented Foods Work',
    body:  'Fermented foods — curd, idli/dosa batter, buttermilk, kanji, kimchi — introduce live bacteria into the gut. A 2021 Stanford study found that a high-fermented-food diet increased microbiome diversity and reduced 19 inflammatory markers. The effect was larger than a high-fibre diet alone. South Indian cuisine, built around fermentation, is gut medicine without trying.',
    videoId: 'gut-diversity',
  },
  {
    id: 'gut-3', series: 'gut', seriesLabel: 'Gut Health',
    title: 'The Leaky Gut Problem',
    body:  'Your intestinal wall is one cell thick. When tight junctions between those cells weaken — from ultra-processed foods, alcohol, NSAIDs, or chronic stress — bacterial fragments enter the bloodstream and trigger immune reactions. Fasting, fermented foods, zinc, and butyrate (from resistant starch) all support tight junction integrity.',
  },
  {
    id: 'gut-4', series: 'gut', seriesLabel: 'Gut Health',
    title: 'The Vagus Nerve: Your Gut-Brain Highway',
    body:  'The vagus nerve carries 80% of its signals upward — from gut to brain, not the other way around. This means your gut directly influences your mood, stress response, and decision-making. Fermented foods, fibre, and fasting activate it from the gut. Slow breathing, humming (Bhramari), and Om chanting activate it from above. Every module in Chethana feeds the same nerve.',
    videoId: 'gut-brain',
  },

  // ── Breathing Science ───────────────────────────────────────────────────────
  {
    id: 'breathing-1', series: 'breathing', seriesLabel: 'Breathing Science',
    title: 'Wim Hof: The Science Behind the Breath',
    body:  'In 2014, a study in PNAS showed that Wim Hof Method practitioners could voluntarily suppress their innate immune response to a bacterial endotoxin. The mechanism: alkalosis from hyperventilation raises blood pH, suppresses inflammation, and activates the sympathetic nervous system. The breath is the switch.',
    videoId: 'wim-hof',
  },
  {
    id: 'breathing-2', series: 'breathing', seriesLabel: 'Breathing Science',
    title: 'Pranayama and the Vagus Nerve',
    body:  'Slow nasal breathing (4–6 breaths per minute) is the most reliable way to activate the parasympathetic nervous system — the rest and digest state. It works via the vagus nerve, which wraps around the lungs and heart. Longer exhales than inhales (as in Anulom Vilom) increase vagal tone, lower blood pressure, and reduce cortisol within minutes.',
    videoId: 'pranayama',
  },
  {
    id: 'breathing-3', series: 'breathing', seriesLabel: 'Breathing Science',
    title: 'CO₂ — The Misunderstood Gas',
    body:  'Most people think oxygen is the key variable in breathing. It is not — carbon dioxide is. CO₂ drives the urge to breathe, regulates blood pH, and controls how much oxygen your haemoglobin releases to your tissues (the Bohr effect). Wim Hof lowers CO₂ to extend breath holds. Box breathing normalises CO₂ sensitivity. Kapalbhati expels CO₂ for an energising effect.',
  },
];

export const SERIES_META: Record<EduCard['series'], { label: string; icon: string; color: string }> = {
  hunger:    { label: 'Understanding Hunger',  icon: '🍽️', color: '#F0C97A' },
  fasting:   { label: 'Fasting Science',        icon: '⏱',  color: '#A8C4E8' },
  gut:       { label: 'Gut Health',             icon: '🌿', color: '#8BAF7C' },
  breathing: { label: 'Breathing Science',      icon: '🌬', color: '#C4A8E8' },
};

export function getCardsBySeries(series: EduCard['series']): EduCard[] {
  return EDU_CARDS.filter(c => c.series === series);
}

export function getCardById(id: string): EduCard | undefined {
  return EDU_CARDS.find(c => c.id === id);
}
