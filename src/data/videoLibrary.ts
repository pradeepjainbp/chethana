export interface VideoEntry {
  id:          string;
  title:       string;
  channel:     string;
  youtubeId:   string;    // YouTube video ID (placeholder — swap for real IDs)
  durationMin: number;
  tags:        string[];
}

export const VIDEO_LIBRARY: VideoEntry[] = [
  {
    id: 'fasting-science',
    title: 'The Science of Fasting',
    channel: 'Kurzgesagt',
    youtubeId: 'placeholder-fasting',
    durationMin: 12,
    tags: ['fasting', 'insulin', 'autophagy'],
  },
  {
    id: 'autophagy',
    title: 'Autophagy Explained — Cellular Self-Cleaning',
    channel: 'FoundMyFitness',
    youtubeId: 'placeholder-autophagy',
    durationMin: 20,
    tags: ['fasting', 'autophagy', 'longevity'],
  },
  {
    id: 'gut-diversity',
    title: '30 Plants a Week — The Gut Diversity Study',
    channel: 'ZOE Science & Nutrition',
    youtubeId: 'placeholder-gut',
    durationMin: 18,
    tags: ['gut', 'microbiome', 'plants'],
  },
  {
    id: 'gut-brain',
    title: 'The Gut-Brain Connection',
    channel: 'Andrew Huberman',
    youtubeId: 'placeholder-gut-brain',
    durationMin: 25,
    tags: ['gut', 'vagus', 'brain', 'fasting'],
  },
  {
    id: 'hunger-science',
    title: 'Hunger, Ghrelin and Why You Overeat',
    channel: 'ZOE Science & Nutrition',
    youtubeId: 'placeholder-hunger',
    durationMin: 14,
    tags: ['hunger', 'insulin', 'diet'],
  },
  {
    id: 'wim-hof',
    title: 'The Wim Hof Method — Science and Practice',
    channel: 'Andrew Huberman',
    youtubeId: 'placeholder-wimhof',
    durationMin: 30,
    tags: ['breathing', 'wim-hof', 'immune'],
  },
  {
    id: 'pranayama',
    title: 'How Breathing Controls Your Brain',
    channel: 'Andrew Huberman',
    youtubeId: 'placeholder-pranayama',
    durationMin: 22,
    tags: ['breathing', 'vagus', 'stress'],
  },
];

export function getVideoById(id: string): VideoEntry | undefined {
  return VIDEO_LIBRARY.find(v => v.id === id);
}
