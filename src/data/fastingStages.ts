export interface FastingStage {
  index: number;
  name: string;
  startH: number;
  endH: number | null;
  emoji: string;
  tagline: string;
  metabolism: string;
  hormones: string;
  gut: string;
  psychology: string;
  feel: string;
}

export const FASTING_STAGES: FastingStage[] = [
  {
    index: 1,
    name: 'Fed State',
    startH: 0,
    endH: 2,
    emoji: '🍽️',
    tagline: 'Digestion in full swing',
    metabolism:
      'Blood glucose peaks after your last meal. Cells are taking up glucose driven by insulin — energy is abundant and being stored as glycogen in the liver and fat in adipose tissue.',
    hormones:
      // voice-lint-ignore: "dominate" used in scientific sense (anabolic vs catabolic balance)
      'Insulin is at its highest. Glucagon is suppressed. This is the storage phase — anabolic hormones dominate and fat breakdown is paused.',
    gut:
      'Peristalsis is active. Your small intestine is absorbing nutrients. Digestive enzymes are flowing. The migrating motor complex — the gut\'s natural cleaning wave — is paused while food is present.',
    psychology:
      'Satiety and comfort. The reward circuitry of your brain just fired from the meal. Decision-making is often clearest now. Mild drowsiness is normal — blood diverts to digestion.',
    feel:
      'Warm, satisfied, possibly mildly sluggish. This is postprandial somnolence — a natural state, not a problem. Light walking accelerates digestion.',
  },
  {
    index: 2,
    name: 'Post-Meal Calm',
    startH: 2,
    endH: 4,
    emoji: '🌊',
    tagline: 'Insulin beginning its descent',
    metabolism:
      'Digestion slows. Blood glucose is normalising. Your liver begins releasing stored glucose (glycogenolysis) as the absorbed supply drops. Fat cells remain in storage mode.',
    hormones:
      'Insulin is declining but still elevated. Your pancreas is throttling down. Growth hormone, suppressed by insulin, begins its first gentle rise.',
    gut:
      'The migrating motor complex — your gut\'s natural housekeeping wave — begins activating. This sweep moves debris, bacteria, and mucus from stomach to small intestine. Walking or resting both support it.',
    psychology:
      'Post-meal contentment settles. Mild hunger signals may emerge as a gentle reminder, but they are manageable and pass quickly. A good window for a short walk before settling.',
    feel:
      'Comfortable and steady. You are running on absorbed fuel, not yet tapping reserves. Energy is even.',
  },
  {
    index: 3,
    name: 'Glycogen Draw',
    startH: 4,
    endH: 8,
    emoji: '⚡',
    tagline: 'Liver releasing stored glucose',
    metabolism:
      'Your liver\'s glycogen stores (roughly 100g) are being drawn down steadily. Fat cells are beginning to release fatty acids into circulation — a process called lipolysis. The metabolic engine is shifting.',
    hormones:
      'Insulin is low. Glucagon is rising, signalling the liver to release glucose. Norepinephrine is beginning its gentle climb — the alertness signal that fasting uniquely activates.',
    gut:
      'The migrating motor complex is running full cycles. Your gut is actively self-cleaning. Feeding in this window would interrupt this process — fasting honours the gut\'s own intelligence.',
    psychology:
      'A clean alertness may arrive. Many people report mild cognitive clarity in this window. First true hunger waves may come — they last about 20 minutes, then pass. Ride them.',
    feel:
      'Energetic to slightly hollow. Your body is competently drawing on internal reserves. Hunger is real but not urgent.',
  },
  {
    index: 4,
    name: 'Transition Zone',
    startH: 8,
    endH: 12,
    emoji: '🔄',
    tagline: 'Approaching the metabolic crossover',
    metabolism:
      'Liver glycogen is significantly depleted. Your body is increasingly relying on fat oxidation. Free fatty acids in blood are rising. A small fraction are being converted to ketone bodies in the liver — the metabolic crossover has begun.',
    hormones:
      'Insulin is at a low baseline. Growth hormone is pulsing. Norepinephrine is gently elevated — this is the alertness hormone, and it is part of why fasting sharpens focus without caffeine.',
    gut:
      'Gut rest is deepening. Inflammatory cytokines in the gut wall are reducing. Intestinal tight junctions are beginning to strengthen with the absence of food and digestive secretions.',
    psychology:
      'Mental focus often sharpens here. Some report a mild mood lift. Food cravings may appear — these are often psychological, not physiological. Distinguish between true hunger and habit.',
    feel:
      'Focused, slightly lean. The familiar feeling of having room. Most people arrive here after a normal overnight sleep — 8 to 12 hours is the baseline the human body is built for.',
  },
  {
    index: 5,
    name: 'Ketosis Ignition',
    startH: 12,
    endH: 14,
    emoji: '🔥',
    tagline: 'Ketone production now detectable',
    metabolism:
      'Blood ketone levels are rising measurably — typically 0.1 to 0.5 mmol/L. Your liver is actively converting fatty acids into beta-hydroxybutyrate (BHB), the body\'s clean alternative fuel. The crossover is complete.',
    hormones:
      'Insulin is at its lowest of the day. Growth hormone is pulsing strongly — this protective signal preserves muscle during fasting. Adiponectin (the fat-burning and insulin-sensitising hormone) is rising.',
    gut:
      'The gut is resting deeply. Tight junctions in the intestinal wall are strengthening. Short-chain fatty acids from colonic bacteria are being produced — feeding your gut lining even as you do not eat.',
    psychology:
      'You are crossing the 12-hour threshold — the goal of 12:12 practitioners. There is often a quiet sense of accomplishment here. Hunger is present but negotiable. Ketones have a mild hunger-suppressing effect.',
    feel:
      'Potentially a wave of lightness. Some experience a mild headache — this is usually from low hydration or electrolytes, not from the fast itself. Drink water with a pinch of salt if this occurs.',
  },
  {
    index: 6,
    name: 'Insulin Valley',
    startH: 14,
    endH: 16,
    emoji: '📉',
    tagline: 'Deepest insulin suppression',
    metabolism:
      'Fat oxidation is the dominant fuel pathway. Your muscles are efficiently burning fatty acids. Ketones are rising (0.5 to 1.0 mmol/L range). Glucose is being spared for the brain and red blood cells.',
    hormones:
      'Insulin is at its 24-hour nadir. This suppression is the central mechanism behind fasting\'s metabolic benefits — it unlocks fat stores, initiates autophagy, and allows growth hormone to peak. HOMA-IR improves with repeated fasting.',
    gut:
      'Gut motility is quiet. Luminal contents are minimal. The gut-associated lymphoid tissue (GALT) is resetting — important for immune regulation and reducing food-driven inflammatory responses.',
    psychology:
      'Many people report peak mental clarity in the 14 to 16-hour window. The brain, running partly on ketones, may feel unusually sharp. Focus is clean, not jittery. Decisions come easier.',
    feel:
      'Light, clear, possibly mildly hungry. The hunger has no urgency. Some experience a subtle calm wellbeing — this is partly the anxiolytic effect of ketones and partly the reward of discipline.',
  },
  {
    index: 7,
    name: 'Autophagy Entry',
    startH: 16,
    endH: 18,
    emoji: '♻️',
    tagline: 'Cellular housekeeping underway',
    metabolism:
      'Autophagy — the self-digestion of damaged proteins and organelles — is now measurably active. mTOR (the growth and storage signal) is suppressed. Your cells are entering a deep repair and recycle mode. This is the threshold most 16:8 practitioners are chasing.',
    hormones:
      'Growth hormone is at its peak pulse of the fast. Studies show 16-hour fasting can increase HGH by 2000% in men and 1300% in women — this is the muscle-preserving, anti-ageing signal, not muscle-wasting. Ghrelin is beginning its counter-intuitive decline.',
    gut:
      'Gut autophagy is active. Intestinal epithelial cells are recycling damaged components. The gut microbiome is shifting — species that depend on a constant food supply are declining, and more resilient species are stabilising.',
    psychology:
      'You have reached the target that 16:8 practitioners aim for. A meaningful sense of discipline and clarity often accompanies this stage. The hard part of the fast is typically behind you.',
    feel:
      'Often surprisingly comfortable. The hunger wave from hours 12 to 14 has passed. Energy from ketones is clean and even. Many people feel more productive here than at any point in the fed day.',
  },
  {
    index: 8,
    name: 'Deep Cleanse',
    startH: 18,
    endH: 24,
    emoji: '🧹',
    tagline: 'Full autophagy, inflammation receding',
    metabolism:
      'Autophagy is in full operation across most tissues. Ketones are well-established (typically 1 to 3 mmol/L). Mitochondrial biogenesis is signalled — your body is building better energy factories at the cellular level.',
    hormones:
      'Leptin (the satiety hormone) is recalibrating. Ghrelin — despite expectation — is declining. Prolonged fasting reduces hunger rather than increasing it, which is why the fast gets easier after the early waves.',
    gut:
      'The gut has had its deepest rest. Inflammatory cytokines in the gut wall (IL-6, TNF-α) are measurably reduced after 18 to 24-hour fasts. Gut permeability is at its best since your last extended fast.',
    psychology:
      'This is the territory of 18:6 and 20:4 practitioners. Mood can be elevated by ketones, which have mild anxiolytic effects. Willpower has been exercised — and strengthened. The identity of someone who fasts is forming.',
    feel:
      'Physical lightness and mental groundedness together. Hunger is quiet. Some feel mildly cold — this is the body conserving heat as metabolism subtly adjusts. Keep warm and hydrated.',
  },
  {
    index: 9,
    name: 'Metabolic Overhaul',
    startH: 24,
    endH: 36,
    emoji: '🔬',
    tagline: 'Growth hormone surge, deep cellular repair',
    metabolism:
      'This is extended fast territory. Glycogen is completely depleted. The liver is in full gluconeogenesis mode for glucose-dependent tissues. Ketones may be 2 to 4 mmol/L. Deep autophagy is clearing aged and damaged proteins systematically across all tissues.',
    hormones:
      'Growth hormone peaks again. BDNF — brain-derived neurotrophic factor — is rising. This is the molecule behind the cognitive enhancement associated with extended fasting. Testosterone is maintained by the GH elevation.',
    gut:
      'Complete gut rest. The migrating motor complex runs uninterrupted cycles. Studies on extended fasting show measurable shifts in gut microbiome diversity after this window — favouring anti-inflammatory species.',
    psychology:
      'This requires intention and preparation. Most people do not reach 24 hours often. The psychological achievement is real. Monitor for dizziness on standing (orthostatic hypotension) — rise slowly.',
    feel:
      'Variable. Some feel remarkable clarity and lightness. Others feel fatigue and mild weakness — both are normal and manageable. Electrolytes are important here. A pinch of Himalayan salt dissolved in water helps significantly.',
  },
  {
    index: 10,
    name: 'Cellular Reset',
    startH: 36,
    endH: 48,
    emoji: '🌱',
    tagline: 'Stem cell activation window',
    metabolism:
      'Research by Valter Longo and colleagues shows 36 to 48-hour fasting induces measurable stem cell proliferation, particularly in the gut epithelium and immune system. Old immune cells are being recycled. Bone marrow is upregulating new cell output.',
    hormones:
      'Insulin remains deeply suppressed. The gut-brain axis is in a quiet reset state. Cortisol may be mildly elevated — this is adaptive signalling driving cellular renewal, not stress damage.',
    gut:
      'The gut lining is in active regeneration. Studies on extended fasting show near-complete renewal of intestinal epithelial cells. Gut microbiome composition is meaningfully different from baseline at this point.',
    psychology:
      'Extended fasting at this duration is done intentionally, with preparation. The mental clarity can be extraordinary. This practice has been used in religious, therapeutic, and contemplative traditions for thousands of years.',
    feel:
      'Requires care and attention. Physical weakness is common. Electrolytes are critical. Plan your refeeding now — break this fast gently with easy-to-digest foods: bone broth, cooked vegetables, small amounts. Never a large meal.',
  },
  {
    index: 11,
    name: 'Deep Renewal',
    startH: 48,
    endH: null,
    emoji: '✨',
    tagline: 'Prolonged therapeutic territory',
    metabolism:
      'Beyond 48 hours, you are in territory studied by fasting medicine clinicians. Ketones are high. Autophagy is deeply systemic. Some research suggests tumour suppressor and longevity pathways are activated. This is the domain of supervised therapeutic fasting.',
    hormones:
      'The body has fully adapted to a fasted metabolic state. Thyroid hormones make subtle adjustments. The entire endocrine system is running on a different economy — fat and ketones, not glucose. The adaptation is profound.',
    gut:
      'The gut is profoundly rested and regenerated. Refeeding must be gradual and careful. Digestive enzyme production has been reduced during the fast and needs time and gentle stimulation to restore.',
    psychology:
      'This is not casual practice. It requires intention, preparation, and ideally supervision for first-timers. Experiences reported by experienced practitioners include profound clarity, reduced emotional reactivity, and deep stillness.',
    feel:
      'If you are here without preparation or supervision, consider breaking your fast gently now. If you are here intentionally, you know what you are doing. Honour your body\'s signals above all else.',
  },
];

export function getActiveStage(elapsedHours: number): FastingStage {
  for (let i = FASTING_STAGES.length - 1; i >= 0; i--) {
    if (elapsedHours >= FASTING_STAGES[i].startH) {
      return FASTING_STAGES[i];
    }
  }
  return FASTING_STAGES[0];
}

export function getNextStage(elapsedHours: number): FastingStage | null {
  const current = getActiveStage(elapsedHours);
  return FASTING_STAGES.find(s => s.index === current.index + 1) ?? null;
}

export const PROTOCOLS: Record<string, { label: string; targetH: number; description: string }> = {
  '12:12': { label: '12:12', targetH: 12, description: '12h fast · beginner-friendly' },
  '16:8':  { label: '16:8',  targetH: 16, description: '16h fast · most popular' },
  '18:6':  { label: '18:6',  targetH: 18, description: '18h fast · deeper autophagy' },
  '20:4':  { label: '20:4',  targetH: 20, description: '20h fast · warrior protocol' },
  'OMAD':  { label: 'OMAD',  targetH: 23, description: 'One meal a day · advanced' },
  '24h':   { label: '24h',   targetH: 24, description: 'Full-day fast · experienced only' },
  'Custom':{ label: 'Custom',targetH: 0,  description: 'Set your own target' },
};
