// Clip registry: maps every Clip ID → { file path (relative to /public/audio/), TTS fallback text }
// When audioMode = 'clips', the engine plays /audio/<file>; when 'tts', it speaks the text.
// Sections A-H from chethana_voice_recording_script.md
// Sections J-N from physiology + patience + awareness addendums

export interface AudioClip {
  file: string;   // relative to /public/audio/
  text: string;   // TTS fallback
}

// ─── helpers ───────────────────────────────────────────────────────────────────

const ONES = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
  'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen',
  'Seventeen','Eighteen','Nineteen','Twenty'];
const TENS = ['','','Twenty','Thirty'];

function numWord(n: number): string {
  if (n <= 20) return ONES[n];
  const t = Math.floor(n / 10), u = n % 10;
  return u === 0 ? TENS[t] : `${TENS[t]} ${ONES[u]}`;
}

function s(dir: string, id: string, text: string): [string, AudioClip] {
  return [id, { file: `${dir}/${id}.mp3`, text }];
}

function genRange(
  prefix: string,
  dir: string,
  texts: string[],
): [string, AudioClip][] {
  return texts.map((text, i) => {
    const n = String(i + 1).padStart(2, '0');
    const id = `${prefix}_${n}`;
    return s(dir, id, text);
  });
}

// ─── Section A: Shared ─────────────────────────────────────────────────────────

const A1: [string, AudioClip][] = [
  s('shared','A1_01','Welcome to Chethana.'),
  s('shared','A1_02','Let\'s begin.'),
  s('shared','A1_03','Find a comfortable position. Sit upright. Relax your shoulders.'),
  s('shared','A1_04','Close your eyes if you\'d like.'),
  s('shared','A1_05','Take a moment to settle in.'),
  s('shared','A1_06','Let go of whatever you were carrying. This time is yours.'),
];

// A2: Normal counting 1-40
const A2 = genRange('A2','shared', Array.from({length:40}, (_,i) => numWord(i+1)));

// A3: Slow pranayama counting 1-8
const A3 = genRange('A3','shared', Array.from({length:8}, (_,i) => numWord(i+1)));

// A4: Round announcements 1-15
const A4 = genRange('A4','shared', Array.from({length:15}, (_,i) => `Round ${numWord(i+1).toLowerCase()}`));

// A5: Time callouts (30s, 1m, 1m30 ... 10m)
const A5_TEXTS = [
  'Thirty seconds','One minute','One minute thirty','Two minutes','Two minutes thirty',
  'Three minutes','Three minutes thirty','Four minutes','Four minutes thirty','Five minutes',
  'Five minutes thirty','Six minutes','Six minutes thirty','Seven minutes','Seven minutes thirty',
  'Eight minutes','Eight minutes thirty','Nine minutes','Nine minutes thirty','Ten minutes',
];
const A5 = genRange('A5','shared', A5_TEXTS);

const A6: [string, AudioClip][] = [
  s('shared','A6_01','You\'re doing well.'),
  s('shared','A6_02','Stay with it.'),
  s('shared','A6_03','Your body is thanking you.'),
  s('shared','A6_04','Relax your jaw. Relax your shoulders.'),
  s('shared','A6_05','Stay calm. You\'re in control.'),
  s('shared','A6_06','Good.'),
  s('shared','A6_07','Let the stillness do its work.'),
  s('shared','A6_08','Notice how you feel right now.'),
];

const A7: [string, AudioClip][] = [
  s('shared','A7_01','Well done.'),
  s('shared','A7_02','Take a moment before you open your eyes.'),
  s('shared','A7_03','Gently bring your awareness back to the room.'),
  s('shared','A7_04','When you\'re ready, open your eyes.'),
  s('shared','A7_05','Your session is complete.'),
  s('shared','A7_06','Carry this calm with you through the day.'),
];

// ─── Section B: Wim Hof ────────────────────────────────────────────────────────

const B: [string, AudioClip][] = [
  s('wimhof','B1_01','We\'ll be doing Wim Hof breathing today.'),
  s('wimhof','B1_02','This involves deep, powerful breaths followed by a breath hold.'),
  s('wimhof','B1_03','Breathe in fully through your nose or mouth, filling your belly and chest.'),
  s('wimhof','B1_04','Then let go — don\'t force the exhale, just release.'),
  s('wimhof','B1_05','After thirty breaths, exhale and hold your breath for as long as you comfortably can.'),
  s('wimhof','B1_06','Let\'s begin. Follow my rhythm.'),

  s('wimhof','B2_01','Breathe in... let go.'),
  s('wimhof','B2_02','In... and out.'),
  s('wimhof','B2_03','Deeper.'),
  s('wimhof','B2_04','Fully in... and release.'),
  s('wimhof','B2_05','Keep going. Find your rhythm.'),
  s('wimhof','B2_06','Last few breaths.'),

  s('wimhof','B3_01','Now... exhale fully... and hold.'),
  s('wimhof','B3_02','Let all the air out. Don\'t breathe in.'),
  s('wimhof','B3_03','Relax your body completely. There is no rush.'),
  s('wimhof','B3_04','Your body knows what to do. Trust it.'),
  s('wimhof','B3_05','When you feel the urge to breathe, stay a little longer if you can.'),
  s('wimhof','B3_06','Whenever you need to breathe, take a deep recovery breath in.'),

  s('wimhof','B4_01','Breathe in deeply... and hold for fifteen seconds.'),
  s('wimhof','B4_02','Hold it... feel the oxygen filling every cell.'),
  s('wimhof','B4_03','And release.'),
  s('wimhof','B4_04','Take a few normal breaths before the next round.'),
];

// ─── Section C: Anulom Vilom ───────────────────────────────────────────────────

const C: [string, AudioClip][] = [
  s('anulom','C1_01','We\'ll practice Anulom Vilom — alternate nostril breathing.'),
  s('anulom','C1_02','This balances your nervous system — calming one side, energizing the other.'),
  s('anulom','C1_03','Raise your right hand. Use your thumb to close your right nostril. Use your ring finger to close your left.'),
  s('anulom','C1_04','We\'ll breathe in through one nostril, and out through the other. Let\'s begin.'),

  s('anulom','C2_01','Close your right nostril.'),
  s('anulom','C2_02','Breathe in through your left nostril.'),
  s('anulom','C2_03','Close your left nostril.'),
  s('anulom','C2_04','Breathe out through your right nostril.'),
  s('anulom','C2_05','Breathe in through your right nostril.'),
  s('anulom','C2_06','Close your right nostril.'),
  s('anulom','C2_07','Breathe out through your left nostril.'),
  s('anulom','C2_08','That\'s one cycle.'),
  s('anulom','C2_09','Continue. Same pattern.'),
  s('anulom','C2_10','Hold your breath gently.'),
  s('anulom','C2_11','Switch.'),
  s('anulom','C2_12','Gently release your hand. Breathe normally.'),
];

// ─── Section D: Box Breathing ──────────────────────────────────────────────────

const D: [string, AudioClip][] = [
  s('box','D1_01','We\'ll practice Box Breathing — also known as Sama Vritti.'),
  s('box','D1_02','Four equal parts — breathe in, hold, breathe out, hold. Each for the same count.'),
  s('box','D1_03','This activates your parasympathetic nervous system — your body\'s natural calm response.'),

  s('box','D2_01','Breathe in.'),
  s('box','D2_02','Hold.'),
  s('box','D2_03','Breathe out.'),
  s('box','D2_04','Hold empty.'),
  s('box','D2_05','That\'s one box. Let\'s continue.'),
  s('box','D2_06','We\'ll extend to a count of six now.'),
  s('box','D2_07','We\'ll extend to a count of eight now.'),
];

// ─── Section E: Kapalbhati ─────────────────────────────────────────────────────

const E: [string, AudioClip][] = [
  s('kapalbhati','E1_01','We\'ll practice Kapalbhati — the skull shining breath.'),
  s('kapalbhati','E1_02','This involves short, powerful exhales through your nose, with passive inhales.'),
  s('kapalbhati','E1_03','Your belly pumps inward with each exhale. The inhale happens naturally.'),
  s('kapalbhati','E1_04','This energizes your system, stimulates digestion, and clears your mind.'),

  s('kapalbhati','E2_01','Begin. Follow the rhythm.'),
  s('kapalbhati','E2_02','Huh, huh, huh, huh.'),
  s('kapalbhati','E2_03','Faster now.'),
  s('kapalbhati','E2_04','Slow down gently.'),
  s('kapalbhati','E2_05','Stop. Take a deep breath in and hold.'),
  s('kapalbhati','E2_06','Exhale slowly. Rest for a moment.'),
];

// ─── Section F: Bhramari ───────────────────────────────────────────────────────

const F: [string, AudioClip][] = [
  s('bhramari','F1_01','We\'ll practice Bhramari — the bee breath.'),
  s('bhramari','F1_02','You\'ll breathe in deeply, then exhale with a humming sound — like a bee.'),
  s('bhramari','F1_03','The vibration calms your vagus nerve, reduces anxiety, and lowers blood pressure.'),

  s('bhramari','F2_01','Close your eyes. Place your index fingers gently on your ear cartilage.'),
  s('bhramari','F2_02','Breathe in deeply through your nose.'),
  s('bhramari','F2_03','Now exhale slowly with a humming sound... Mmmmm.'),
  s('bhramari','F2_04','Feel the vibration in your head and chest.'),
  s('bhramari','F2_05','Let the hum last as long as your breath allows.'),
];

// ─── Section G: Om Chanting ────────────────────────────────────────────────────

const G: [string, AudioClip][] = [
  s('om','G1_01','We\'ll practice Om chanting.'),
  s('om','G1_02','Om has three sounds — Aaa, Ooo, Mmm — rising from your belly to your chest to your head.'),
  s('om','G1_03','The vibration of Mmm activates your vagus nerve — the nerve that controls your body\'s calm response.'),
  s('om','G1_04','Take a deep breath in.'),
  s('om','G1_05','Aaaa... Oooo... Mmmm...'),
  s('om','G1_06','Again. Deep breath in.'),
  s('om','G1_07','Let the sound fill the room.'),
  s('om','G1_08','Sit in the silence after the last Om. Notice the vibration that remains.'),
];

// ─── Section H: Safety ─────────────────────────────────────────────────────────

const H: [string, AudioClip][] = [
  s('safety','H1_01','A quick safety note. Never practice this breathing in water, while driving, or standing near edges.'),
  s('safety','H1_02','If you feel dizzy or uncomfortable at any point, stop and breathe normally.'),
  s('safety','H1_03','If you have high blood pressure, heart conditions, or are pregnant, please consult your doctor before intense breathing practices.'),
  s('safety','H1_04','Tingling in your hands and feet is normal during Wim Hof breathing. It will pass.'),
  s('safety','H1_05','Listen to your body. There is no competition here.'),
];

// ─── Section J: Wim Hof Physiology ────────────────────────────────────────────

const J: [string, AudioClip][] = [
  // J1: During breathing phase
  s('physiology','J1_01','With each breath, you\'re flooding your blood with oxygen.'),
  s('physiology','J1_02','Your body is flushing out carbon dioxide. This is shifting your blood chemistry.'),
  s('physiology','J1_03','If you feel tingling in your hands or feet, that\'s normal. It means your blood pH is shifting — your body is responding.'),
  s('physiology','J1_04','That lightheadedness you might feel? Your blood vessels are widening. More oxygen is reaching your brain.'),
  s('physiology','J1_05','Your heart rate is rising. Your sympathetic nervous system is waking up. This is controlled stress — your body grows stronger from it.'),
  s('physiology','J1_06','Adrenaline is being released from your adrenal glands right now. This is the same hormone that gives athletes their edge.'),
  s('physiology','J1_07','Your lungs are expanding to their full capacity. The surface area inside them has nearly doubled.'),
  s('physiology','J1_08','If your hands feel stiff or claw-like, don\'t worry. That\'s tetany from the pH shift. It will pass completely.'),
  s('physiology','J1_09','Some people see lights or colors behind closed eyes. This is your brain responding to the oxygen and chemistry changes. Let it happen.'),
  s('physiology','J1_10','Each cell in your body is producing more energy right now. You are charging your system.'),

  // J2: During breath hold
  s('physiology','J2_01','Your heart rate is slowing down now. Your body is switching from alert mode to deep rest.'),
  s('physiology','J2_02','Your body doesn\'t need to breathe right now. You have more oxygen stored than you realize.'),
  s('physiology','J2_03','The urge to breathe isn\'t because you\'re out of oxygen. It\'s because carbon dioxide is building up. Your body is safe.'),
  s('physiology','J2_04','Your spleen is releasing extra red blood cells into your bloodstream right now. Your body is adapting.'),
  s('physiology','J2_05','Stress hormones are dropping. Your cortisol levels are falling with every second of stillness.'),
  s('physiology','J2_06','Your blood pressure is coming down. Your blood vessels are relaxing.'),
  s('physiology','J2_07','Your brain is shifting into alpha wave patterns right now — the same state as deep meditation.'),
  s('physiology','J2_08','Your immune system is being activated. Inflammation markers in your blood are decreasing.'),
  s('physiology','J2_09','This stillness is where the healing happens. Every second here is repairing your system.'),
  s('physiology','J2_10','If you feel a wave of warmth or cold moving through your body, that\'s your circulation adjusting. Let it flow.'),
  s('physiology','J2_11','You may feel emotions rising — joy, peace, or even the urge to cry. This is stored tension releasing. Let it go.'),
  s('physiology','J2_12','Your diaphragm may start to flutter or contract. That\'s your body\'s reflex asking for air. You can observe it without reacting.'),

  // J3: Recovery breath
  s('physiology','J3_01','Feel that rush? Oxygen is flooding back into every cell. Your body is reoxygenating from head to toe.'),
  s('physiology','J3_02','That wave of warmth you feel — that\'s fresh oxygenated blood reaching your extremities.'),
  s('physiology','J3_03','Your body has just produced a massive dose of its own natural feel-good chemicals. This is endogenous medicine.'),

  // J4: Between rounds
  s('physiology','J4_01','Notice how you feel compared to when we started. Your body is already different.'),
  s('physiology','J4_02','Each round goes deeper. Your retention time may naturally increase — don\'t force it, let it happen.'),
  s('physiology','J4_03','Your body is now primed. This round will feel the most natural.'),
];

// ─── Section K: Pranayama Physiology ──────────────────────────────────────────

const K: [string, AudioClip][] = [
  // K1: Anulom Vilom
  s('physiology','K1_01','Your left nostril is connected to the right hemisphere of your brain — the creative, calming side. Breathing through it activates your parasympathetic nervous system.'),
  s('physiology','K1_02','Your right nostril connects to the left hemisphere — the analytical, activating side. This side energizes.'),
  s('physiology','K1_03','By alternating, you are literally balancing your nervous system — calming one side, energizing the other.'),
  s('physiology','K1_04','Your blood pressure is gently coming down with each cycle. The vagus nerve is being activated.'),
  s('physiology','K1_05','Your brain waves are synchronizing. Both hemispheres are coming into coherence.'),
  s('physiology','K1_06','With each round, your autonomic nervous system is resetting to its natural balance.'),

  // K2: Box Breathing
  s('physiology','K2_01','This pattern — equal inhale, hold, exhale, hold — trains your nervous system to find balance under pressure.'),
  s('physiology','K2_02','The hold after exhale is the most powerful part. It builds your CO2 tolerance — which directly reduces anxiety.'),
  s('physiology','K2_03','Your heart rate is finding a rhythm. This is called heart rate coherence — your heart and brain are synchronizing.'),
  s('physiology','K2_04','Each box you complete is strengthening the connection between your conscious mind and your autonomic nervous system.'),

  // K3: Kapalbhati
  s('physiology','K3_01','Each exhale is massaging your abdominal organs — your liver, stomach, and pancreas are being stimulated.'),
  s('physiology','K3_02','Your digestive fire — what Ayurveda calls Agni — is being stoked. This is why Kapalbhati is best done on an empty stomach.'),
  s('physiology','K3_03','Heat is building in your system. This is toxins being processed and your metabolism accelerating.'),

  // K4: Bhramari — to be filled from addendum (2 clips)
  s('physiology','K4_01','The humming sound you\'re making is stimulating your vagus nerve directly. This is one of the fastest ways to calm your nervous system.'),
  s('physiology','K4_02','The vibration is also stimulating your sinuses and releasing nitric oxide — a molecule that dilates your blood vessels and improves oxygen delivery.'),
];

// ─── Section M: Patience & Safety (22 clips) ──────────────────────────────────
// from chethana_voice_patience_safety_addendum.md — text filled next session
// Placeholders so engine can reference IDs now; text will be filled in P4.05 pass

const M: [string, AudioClip][] = [
  s('patience','M1_01','There is nothing to achieve here. Just breathe.'),
  s('patience','M1_02','Your body knows this practice. You just need to show up.'),
  s('patience','M1_03','Don\'t compare this session to your last. Each breath is new.'),
  s('patience','M1_04','If your mind wanders, that\'s fine. Bring it back to the breath. Gently.'),
  s('patience','M1_05','The Vaidya is not in a hurry. Neither are you.'),

  s('patience','M2_01','You don\'t need to breathe harder. Breathe deeper.'),
  s('patience','M2_02','If it feels like too much, slow down. This is your practice, your pace.'),
  s('patience','M2_03','There\'s no competition here. Not even with yourself.'),
  s('patience','M2_04','Ease into it. The breath does the work when you stop forcing.'),

  s('patience','M3_01','When you feel ready to breathe, breathe. There is no target.'),
  s('patience','M3_02','A thirty-second hold is a full hold if that\'s where your body is today.'),
  s('patience','M3_03','Every hold is perfect. The length doesn\'t matter.'),
  s('patience','M3_04','Breathe in whenever you need to. No judgment.'),
  s('patience','M3_05','Your body will go longer next time. Or it won\'t. Either is fine.'),
  s('patience','M3_06','You stopped because your body asked you to. That\'s wisdom, not weakness.'),
  s('patience','M3_07','The breath is always there when you need it.'),
  s('patience','M3_08','Rest. Recover. The next round will take care of itself.'),

  s('patience','M4_01','Short holds are still holds. You practiced today. That\'s what matters.'),
  s('patience','M4_02','Your nervous system is learning. Give it time.'),

  s('patience','M5_01','The results of this practice come in weeks and months, not minutes.'),
  s('patience','M5_02','Every session adds to something you can\'t yet see. Keep going.'),
  s('patience','M5_03','The Vaidya has seen this before. The ones who stay gentle, go far.'),
];

// ─── Section N: Body Awareness (12 clips) ─────────────────────────────────────
// from chethana_voice_patience_safety_addendum.md — placeholders for now

const N: [string, AudioClip][] = [
  s('awareness','N1_01','Tingling in your hands and feet is normal. Your blood chemistry is changing. Let it happen.'),
  s('awareness','N1_02','You may feel lightheaded. That\'s your brain getting more oxygen than usual. Stay seated.'),
  s('awareness','N1_03','If your hands feel stiff, that\'s tetany — a pH response. It will pass in seconds.'),
  s('awareness','N1_04','Emotions may surface during a hold. Joy, peace, or even tears. This is release, not a problem.'),
  s('awareness','N1_05','You may see colors or light behind your eyes. Your brain is responding to the chemistry. Let it be.'),
  s('awareness','N1_06','A warm flush moving through your body is circulation returning. Let it spread.'),
  s('awareness','N1_07','Your diaphragm fluttering is your body\'s reflex — not a signal to stop, unless you choose to.'),
  s('awareness','N1_08','Yawning during breathing is normal. Your body is releasing tension.'),

  s('awareness','N2_01','If you feel chest pain or pressure — stop immediately and breathe normally.'),
  s('awareness','N2_02','If you feel faint while standing — sit or lie down before continuing.'),
  s('awareness','N2_03','If tingling becomes numbness, stop the session and rest.'),
  s('awareness','N2_04','If anything feels wrong, trust that feeling. Stop, breathe normally, and rest.'),
];

// ─── Assemble registry ─────────────────────────────────────────────────────────

export const CLIPS: Record<string, AudioClip> = Object.fromEntries([
  ...A1, ...A2, ...A3, ...A4, ...A5, ...A6, ...A7,
  ...B, ...C, ...D, ...E, ...F, ...G, ...H,
  ...J, ...K, ...M, ...N,
]);
