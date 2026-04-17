import {
  pgTable, uuid, text, integer, decimal, boolean,
  timestamp, date,
} from 'drizzle-orm/pg-core';

// Health profile — separate from Neon Auth's `user` table.
// userId is the string ID from Neon Auth.
export const profiles = pgTable('profiles', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  userId:              text('user_id').notNull().unique(),
  name:                text('name'),
  age:                 integer('age'),
  sex:                 text('sex'),
  heightCm:            decimal('height_cm'),
  weightKg:            decimal('weight_kg'),
  waistCm:             decimal('waist_cm'),
  dietaryPreference:   text('dietary_preference'),
  dietaryExclusions:   text('dietary_exclusions').array(),
  jainDiet:            boolean('jain_diet').default(false),
  activityLevel:       text('activity_level'),
  avgSleepHours:       decimal('avg_sleep_hours'),
  knownConditions:     text('known_conditions').array(),
  goals:               text('goals').array(),
  prakriti:            text('prakriti'),
  profileCompletion:   integer('profile_completion').default(0),
  createdAt:           timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:           timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const bloodTests = pgTable('blood_tests', {
  id:              uuid('id').primaryKey().defaultRandom(),
  userId:          text('user_id').notNull(),
  testDate:        date('test_date'),
  labName:         text('lab_name'),
  fastingInsulin:  decimal('fasting_insulin'),
  hba1c:           decimal('hba1c'),
  fastingGlucose:  decimal('fasting_glucose'),
  totalCholesterol:decimal('total_cholesterol'),
  ldl:             decimal('ldl'),
  hdl:             decimal('hdl'),
  triglycerides:   decimal('triglycerides'),
  vitaminD:        decimal('vitamin_d'),
  vitaminB12:      decimal('vitamin_b12'),
  tsh:             decimal('tsh'),
  freeT3:          decimal('free_t3'),
  freeT4:          decimal('free_t4'),
  sgot:            decimal('sgot'),
  sgpt:            decimal('sgpt'),
  ggt:             decimal('ggt'),
  crp:             decimal('crp'),
  uricAcid:        decimal('uric_acid'),
  homocysteine:    decimal('homocysteine'),
  hsCrp:           decimal('hs_crp'),
  creatinine:      decimal('creatinine'),
  bun:             decimal('bun'),
  homaIr:          decimal('homa_ir'),
  tgHdlRatio:      decimal('tg_hdl_ratio'),
  pdfUrl:          text('pdf_url'),
  verified:        boolean('verified').default(false),
  createdAt:       timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const breathingSessions = pgTable('breathing_sessions', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  userId:               text('user_id').notNull(),
  technique:            text('technique'),
  roundsCompleted:      integer('rounds_completed'),
  totalDurationSeconds: integer('total_duration_seconds'),
  holdDurations:        integer('hold_durations').array(),
  narrationMode:        text('narration_mode'),
  feelingAfter:         text('feeling_after'),
  sessionDate:          timestamp('session_date', { withTimezone: true }).defaultNow(),
});

export const fastingSessions = pgTable('fasting_sessions', {
  id:              uuid('id').primaryKey().defaultRandom(),
  userId:          text('user_id').notNull(),
  startedAt:       timestamp('started_at', { withTimezone: true }),
  endedAt:         timestamp('ended_at', { withTimezone: true }),
  durationHours:   decimal('duration_hours'),
  maxStageReached: integer('max_stage_reached'),
  protocol:        text('protocol'),
  notes:           text('notes'),
  createdAt:       timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const mealLogs = pgTable('meal_logs', {
  id:             uuid('id').primaryKey().defaultRandom(),
  userId:         text('user_id').notNull(),
  description:    text('description'),
  insulinImpact:  text('insulin_impact'),
  proteinEstimate:text('protein_estimate'),
  gutImpact:      text('gut_impact'),
  plantFoods:     text('plant_foods').array(),
  aiFeedback:     text('ai_feedback'),
  aiSuggestion:   text('ai_suggestion'),
  loggedAt:       timestamp('logged_at', { withTimezone: true }).defaultNow(),
});

export const waterLogs = pgTable('water_logs', {
  id:       uuid('id').primaryKey().defaultRandom(),
  userId:   text('user_id').notNull(),
  amountMl: integer('amount_ml'),
  loggedAt: timestamp('logged_at', { withTimezone: true }).defaultNow(),
});

export const dailyCheckins = pgTable('daily_checkins', {
  id:           uuid('id').primaryKey().defaultRandom(),
  userId:       text('user_id').notNull(),
  checkDate:    date('check_date'),
  sleepHours:   decimal('sleep_hours'),
  stressLevel:  integer('stress_level'),
  energyLevel:  integer('energy_level'),
  digestion:    text('digestion'),
  exerciseDone: boolean('exercise_done').default(false),
  exerciseType: text('exercise_type'),
  notes:        text('notes'),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const streaks = pgTable('streaks', {
  id:               uuid('id').primaryKey().defaultRandom(),
  userId:           text('user_id').notNull(),
  streakType:       text('streak_type'),
  currentStreak:    integer('current_streak').default(0),
  lastActivityDate: date('last_activity_date'),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const weeklyPlantDiversity = pgTable('weekly_plant_diversity', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      text('user_id').notNull(),
  weekStart:   date('week_start'),
  uniquePlants:text('unique_plants').array(),
  count:       integer('count').default(0),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
});
