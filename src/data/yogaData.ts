export interface Asana {
  id:              string;
  sanskrit:        string;
  english:         string;
  kannada:         string;
  emoji:           string;
  difficulty:      'beginner' | 'intermediate' | 'advanced';
  duration:        string;         // e.g. "30–60 seconds"
  instructions:    string[];       // step-by-step
  whyItHelps:      string;
  contraindications: string[];
  conditions:      string[];       // condition tags this asana helps
  postMealSafe:    boolean;        // only Vajrasana is true
}

export const ASANAS: Asana[] = [
  {
    id: 'tadasana',
    sanskrit: 'Tadasana',
    english: 'Mountain Pose',
    kannada: 'ತಾಡಾಸನ',
    emoji: '🧍',
    difficulty: 'beginner',
    duration: '30–60 seconds',
    instructions: [
      'Stand with feet together, arms at your sides.',
      'Distribute your weight evenly across both feet.',
      'Lengthen your spine upward, lift the crown of your head.',
      'Relax your shoulders down and back. Soften your face.',
      'Breathe slowly and steadily. Hold for 5–10 breaths.',
    ],
    whyItHelps: 'Tadasana activates the postural muscles along the spine and resets proprioception — the body\'s sense of where it is in space. It improves posture-related back pain, grounds the nervous system, and is the foundation from which all standing asanas begin.',
    contraindications: ['Severe vertigo or balance disorders'],
    conditions: ['stress', 'thyroid', 'general'],
    postMealSafe: false,
  },
  {
    id: 'trikonasana',
    sanskrit: 'Trikonasana',
    english: 'Triangle Pose',
    kannada: 'ತ್ರಿಕೋಣಾಸನ',
    emoji: '📐',
    difficulty: 'beginner',
    duration: '30–45 seconds each side',
    instructions: [
      'Stand with feet 3–4 feet apart. Turn your right foot out 90°.',
      'Extend both arms parallel to the floor, palms facing down.',
      'Exhale and reach your right hand toward your right shin or ankle.',
      'Extend your left arm straight up. Look up at your left hand.',
      'Keep both legs straight. Hold for 5 breaths, then switch sides.',
    ],
    whyItHelps: 'Trikonasana stimulates the pancreas and liver, improving insulin secretion and glucose metabolism. It stretches the hamstrings and hip flexors (commonly tight from sitting) and activates the lateral chain of muscles. Studies show yoga including Trikonasana significantly reduces fasting blood glucose in type 2 diabetics.',
    contraindications: ['Cervical spondylosis (look forward, not up)', 'Low blood pressure (rise slowly)'],
    conditions: ['insulin-resistance', 'pre-diabetes', 'general'],
    postMealSafe: false,
  },
  {
    id: 'virabhadrasana-2',
    sanskrit: 'Virabhadrasana II',
    english: 'Warrior II',
    kannada: 'ವೀರಭದ್ರಾಸನ II',
    emoji: '⚔️',
    difficulty: 'beginner',
    duration: '30–60 seconds each side',
    instructions: [
      'Stand with feet 4 feet apart. Turn your right foot out 90°.',
      'Bend your right knee to 90° — knee directly above ankle.',
      'Extend both arms parallel to the floor, gaze over right fingertips.',
      'Keep your torso upright, shoulders relaxed, core engaged.',
      'Hold for 5–8 breaths. Switch sides.',
    ],
    whyItHelps: 'Warrior II builds lower body strength and improves circulation to the legs and pelvis. The sustained hold trains muscular endurance and activates glucose uptake in muscle tissue without insulin — useful for insulin resistance. It also builds mental resilience through sustained discomfort.',
    contraindications: ['Knee injuries (reduce bend depth)', 'High blood pressure (arms at hip height, not extended)'],
    conditions: ['insulin-resistance', 'pre-diabetes', 'stress', 'general'],
    postMealSafe: false,
  },
  {
    id: 'paschimottanasana',
    sanskrit: 'Paschimottanasana',
    english: 'Seated Forward Bend',
    kannada: 'ಪಶ್ಚಿಮೋತ್ತಾನಾಸನ',
    emoji: '🙇',
    difficulty: 'beginner',
    duration: '1–3 minutes',
    instructions: [
      'Sit on the floor with legs extended straight ahead.',
      'Inhale and lengthen your spine upward.',
      'Exhale and hinge forward from the hips (not the waist).',
      'Hold your feet, ankles, or shins — wherever you reach without rounding severely.',
      'Let your belly approach your thighs. Breathe slowly and deeply.',
    ],
    whyItHelps: 'Paschimottanasana massages the abdominal organs — liver, kidneys, and intestines — improving digestive function. It activates the parasympathetic nervous system through the sustained fold, reducing cortisol. Regular practice is associated with reduced anxiety and improved insulin sensitivity.',
    contraindications: ['Herniated disc (fold minimally)', 'Hamstring injury (bend knees slightly)'],
    conditions: ['insulin-resistance', 'digestion', 'stress', 'general'],
    postMealSafe: false,
  },
  {
    id: 'bhujangasana',
    sanskrit: 'Bhujangasana',
    english: 'Cobra Pose',
    kannada: 'ಭುಜಂಗಾಸನ',
    emoji: '🐍',
    difficulty: 'beginner',
    duration: '20–30 seconds, 3 rounds',
    instructions: [
      'Lie face down. Place palms under your shoulders, elbows close to your body.',
      'Inhale and slowly lift your chest off the floor, using back muscles.',
      'Keep your elbows slightly bent. Pubic bone stays on the floor.',
      'Open your chest, lengthen through the crown of your head.',
      'Hold for 5 breaths, then lower slowly on an exhale.',
    ],
    whyItHelps: 'Bhujangasana stimulates the thyroid and adrenal glands through the extension of the front body. It strengthens the paraspinal muscles and improves spinal mobility. Research shows it reduces TSH (thyroid-stimulating hormone) and supports thyroid function in subclinical hypothyroidism.',
    contraindications: ['Pregnancy', 'Peptic ulcer', 'Hernia', 'Recent abdominal surgery'],
    conditions: ['thyroid', 'PCOS', 'stress', 'general'],
    postMealSafe: false,
  },
  {
    id: 'balasana',
    sanskrit: 'Balasana',
    english: "Child's Pose",
    kannada: 'ಬಾಲಾಸನ',
    emoji: '🧎',
    difficulty: 'beginner',
    duration: '1–5 minutes',
    instructions: [
      'Kneel on the floor. Bring your big toes together, knees hip-width apart.',
      'Exhale and lower your torso between your thighs.',
      'Extend arms forward or rest them alongside your body.',
      'Let your forehead rest on the floor. Close your eyes.',
      'Breathe deeply into the back of the ribcage. Stay as long as you need.',
    ],
    whyItHelps: 'Balasana is a restorative fold that activates the parasympathetic nervous system through the compression of the abdomen and the grounding of the forehead. It directly stimulates the vagus nerve, lowers blood pressure and cortisol, and is among the most effective postures for acute stress and anxiety.',
    contraindications: ['Knee injury (place blanket under knees)', 'Pregnancy (widen knees significantly)'],
    conditions: ['stress', 'PCOS', 'digestion', 'general'],
    postMealSafe: false,
  },
  {
    id: 'vajrasana',
    sanskrit: 'Vajrasana',
    english: 'Thunderbolt Pose',
    kannada: 'ವಜ್ರಾಸನ',
    emoji: '⚡',
    difficulty: 'beginner',
    duration: '5–15 minutes (ideally after meals)',
    instructions: [
      'Kneel on the floor. Lower your hips to sit on your heels.',
      'Keep your spine upright and your hands resting on your thighs.',
      'Close your eyes. Breathe naturally through the nose.',
      'If knees ache, place a folded blanket between thighs and calves.',
      'Stay for at least 5 minutes. This is the one asana done after eating.',
    ],
    whyItHelps: 'Vajrasana is the only asana traditionally practised after meals. It increases blood flow to the digestive organs by reducing circulation to the legs. Research published in the Journal of Bodywork and Movement Therapies shows it improves gastric motility and reduces postprandial blood glucose more than lying or sitting in a chair.',
    contraindications: ['Knee replacement', 'Severe varicose veins'],
    conditions: ['digestion', 'insulin-resistance', 'general'],
    postMealSafe: true,
  },
  {
    id: 'pavanamuktasana',
    sanskrit: 'Pavanamuktasana',
    english: 'Wind-Relieving Pose',
    kannada: 'ಪವನಮುಕ್ತಾಸನ',
    emoji: '💨',
    difficulty: 'beginner',
    duration: '30–60 seconds each side',
    instructions: [
      'Lie on your back. Draw your right knee to your chest.',
      'Clasp your hands around your shin, just below the knee.',
      'On an exhale, lift your head toward your knee.',
      'Hold for 5 breaths. Release, then repeat on the left side.',
      'Finally, bring both knees to chest and rock gently side to side.',
    ],
    whyItHelps: 'Pavanamuktasana compresses the ascending and descending colon, stimulating peristalsis and releasing trapped gas. It massages the intestinal walls, improving gut motility and reducing bloating. Gentle and safe for most people, it is a foundational gut health practice in Yoga therapy.',
    contraindications: ['Hernia', 'Recent abdominal surgery', 'Pregnancy (after first trimester)'],
    conditions: ['digestion', 'gut', 'insulin-resistance', 'general'],
    postMealSafe: false,
  },
  {
    id: 'setu-bandhasana',
    sanskrit: 'Setu Bandhasana',
    english: 'Bridge Pose',
    kannada: 'ಸೇತು ಬಂಧಾಸನ',
    emoji: '🌉',
    difficulty: 'beginner',
    duration: '30–60 seconds, 3 rounds',
    instructions: [
      'Lie on your back with knees bent, feet flat on the floor, hip-width apart.',
      'Arms rest alongside your body, palms facing down.',
      'Inhale and press your feet into the floor, lifting your hips.',
      'Clasp your hands under your back and press your arms into the floor.',
      'Hold for 5–8 breaths, then lower slowly on an exhale.',
    ],
    whyItHelps: 'Setu Bandhasana stimulates the thyroid gland through the chin lock it creates at the throat, and activates the pelvic organs — making it specifically therapeutic for PCOS, menstrual irregularity, and thyroid dysfunction. It also strengthens the posterior chain (glutes, hamstrings, lower back) and improves spinal mobility.',
    contraindications: ['Neck injury (do not turn head in the pose)', 'Shoulder injury'],
    conditions: ['PCOS', 'thyroid', 'general'],
    postMealSafe: false,
  },
  {
    id: 'viparita-karani',
    sanskrit: 'Viparita Karani',
    english: 'Legs Up the Wall',
    kannada: 'ವಿಪರೀತ ಕರಣಿ',
    emoji: '🦵',
    difficulty: 'beginner',
    duration: '5–15 minutes',
    instructions: [
      'Sit sideways next to a wall. Swing your legs up as you lie back.',
      'Your hips rest against or close to the wall. Back flat on the floor.',
      'Rest your arms at your sides or on your belly, palms up.',
      'Close your eyes. Breathe slowly. Stay for 5–15 minutes.',
      'To come out, slide your feet down the wall and roll to your side.',
    ],
    whyItHelps: 'Viparita Karani reverses venous return — draining blood from the legs back to the heart. This reduces oedema, varicose veins, and leg fatigue. The inversion calms the adrenal glands, lowers cortisol, and activates the parasympathetic nervous system. It is among the most restorative postures for PCOS, stress, and hormonal regulation.',
    contraindications: ['Glaucoma', 'Serious eye conditions', 'Menstruation (traditional teaching — optional)'],
    conditions: ['PCOS', 'stress', 'thyroid', 'general'],
    postMealSafe: false,
  },
  {
    id: 'ardha-matsyendrasana',
    sanskrit: 'Ardha Matsyendrasana',
    english: 'Seated Spinal Twist',
    kannada: 'ಅರ್ಧ ಮತ್ಸ್ಯೇಂದ್ರಾಸನ',
    emoji: '🌀',
    difficulty: 'intermediate',
    duration: '30–60 seconds each side',
    instructions: [
      'Sit with legs extended. Bend your right knee and cross it over the left leg.',
      'Plant your right foot flat outside your left knee.',
      'Inhale and lengthen your spine. Exhale and twist to the right.',
      'Hook your left elbow outside the right knee. Right hand behind you.',
      'Hold for 5 breaths, keeping the spine long with each inhale. Switch sides.',
    ],
    whyItHelps: 'Ardha Matsyendrasana massages the liver, pancreas, and kidneys with each twist. It stimulates bile production, improves liver detoxification, and directly compresses the pancreatic tissue — improving insulin secretion patterns. It is one of the most evidence-backed postures for blood sugar management and digestive health.',
    contraindications: ['Spinal disc herniation', 'Recent abdominal surgery', 'Pregnancy'],
    conditions: ['insulin-resistance', 'pre-diabetes', 'digestion', 'gut', 'general'],
    postMealSafe: false,
  },
  {
    id: 'shavasana',
    sanskrit: 'Shavasana',
    english: 'Corpse Pose',
    kannada: 'ಶವಾಸನ',
    emoji: '💤',
    difficulty: 'beginner',
    duration: '5–15 minutes',
    instructions: [
      'Lie flat on your back. Let your feet fall open naturally.',
      'Rest your arms alongside your body, palms facing up.',
      'Close your eyes. Let your whole body become heavy.',
      'Scan from the top of your head to the tips of your toes, releasing each part.',
      'Breathe naturally. Do nothing. Stay for at least 5 minutes.',
    ],
    whyItHelps: 'Shavasana is not rest — it is integration. During this pose, the nervous system processes and consolidates the physiological changes from the practice. Research shows it reduces systolic blood pressure by 10–15 mmHg when held for 5 minutes post-practice. Skipping Shavasana loses a significant portion of the session\'s benefit.',
    contraindications: ['Back pain (place a rolled blanket under the knees)'],
    conditions: ['stress', 'insulin-resistance', 'PCOS', 'thyroid', 'digestion', 'general'],
    postMealSafe: true,
  },
];

export type HealthCondition = {
  id:          string;
  label:       string;
  emoji:       string;
  asanaIds:    string[];
  guidance:    string;
};

export const CONDITION_PRESCRIPTIONS: HealthCondition[] = [
  {
    id: 'insulin-resistance',
    label: 'Insulin Resistance / Pre-diabetes',
    emoji: '🩸',
    asanaIds: ['trikonasana', 'virabhadrasana-2', 'ardha-matsyendrasana', 'paschimottanasana', 'vajrasana'],
    guidance: 'These asanas directly stimulate the pancreas and liver, activate glucose uptake in muscle tissue, and reduce visceral fat. Practise for 20–30 minutes after a meal (Vajrasana) and before meals (all others). Consistency 5× per week is more valuable than intensity.',
  },
  {
    id: 'pcos',
    label: 'PCOS',
    emoji: '🌸',
    asanaIds: ['setu-bandhasana', 'balasana', 'viparita-karani', 'bhujangasana', 'ardha-matsyendrasana'],
    guidance: 'This sequence targets pelvic circulation, adrenal regulation, and hormonal balance. Setu Bandhasana and Viparita Karani specifically reduce androgen levels and improve menstrual regularity when practised consistently. Avoid inversions during menstruation if you prefer — this is a personal choice, not a medical requirement.',
  },
  {
    id: 'thyroid',
    label: 'Thyroid (Hypo / Hyper)',
    emoji: '🦋',
    asanaIds: ['bhujangasana', 'setu-bandhasana', 'viparita-karani', 'tadasana', 'shavasana'],
    guidance: 'These asanas stimulate or regulate thyroid function through throat compression (Setu Bandhasana), extension of the front body (Bhujangasana), and inversion (Viparita Karani). For hyperthyroidism, favour gentler holds and avoid overheating. For hypothyroidism, slightly more vigorous practice is appropriate.',
  },
  {
    id: 'digestion',
    label: 'Digestive Issues / Bloating',
    emoji: '🌱',
    asanaIds: ['vajrasana', 'pavanamuktasana', 'ardha-matsyendrasana', 'paschimottanasana', 'balasana'],
    guidance: 'Vajrasana is the only asana suited for immediately after meals — practise it for 10–15 minutes post-eating. The twists (Ardha Matsyendrasana) and forward folds stimulate peristalsis. Pavanamuktasana relieves bloating and trapped gas. Practise this sequence in the morning on an empty stomach for best results.',
  },
  {
    id: 'stress',
    label: 'Stress / Anxiety',
    emoji: '🧘',
    asanaIds: ['balasana', 'viparita-karani', 'shavasana', 'paschimottanasana', 'tadasana'],
    guidance: 'These asanas activate the parasympathetic nervous system through sustained holds, forward folds, and inversions. Each reduces cortisol and activates the vagus nerve. Practise slowly, holding each pose longer than feels comfortable. Pair with Bhramari or Anulom Vilom breathing for maximum effect.',
  },
  {
    id: 'general',
    label: 'General Wellbeing',
    emoji: '✨',
    asanaIds: ['tadasana', 'trikonasana', 'virabhadrasana-2', 'bhujangasana', 'ardha-matsyendrasana', 'shavasana'],
    guidance: 'A balanced full-body sequence covering strength, flexibility, organ stimulation, and nervous system reset. Practise this sequence 3–5 times per week, ideally in the morning on an empty stomach. End every session with Shavasana for at least 5 minutes.',
  },
];

export function getAsanaById(id: string): Asana | undefined {
  return ASANAS.find(a => a.id === id);
}

export function getAsanasForCondition(conditionId: string): Asana[] {
  const condition = CONDITION_PRESCRIPTIONS.find(c => c.id === conditionId);
  if (!condition) return [];
  return condition.asanaIds.map(id => getAsanaById(id)).filter(Boolean) as Asana[];
}
