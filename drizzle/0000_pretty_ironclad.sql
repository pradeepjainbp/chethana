CREATE TABLE "blood_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"test_date" date,
	"lab_name" text,
	"fasting_insulin" numeric,
	"hba1c" numeric,
	"fasting_glucose" numeric,
	"total_cholesterol" numeric,
	"ldl" numeric,
	"hdl" numeric,
	"triglycerides" numeric,
	"vitamin_d" numeric,
	"vitamin_b12" numeric,
	"tsh" numeric,
	"free_t3" numeric,
	"free_t4" numeric,
	"sgot" numeric,
	"sgpt" numeric,
	"ggt" numeric,
	"crp" numeric,
	"uric_acid" numeric,
	"homocysteine" numeric,
	"hs_crp" numeric,
	"creatinine" numeric,
	"bun" numeric,
	"homa_ir" numeric,
	"tg_hdl_ratio" numeric,
	"pdf_url" text,
	"verified" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "breathing_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"technique" text,
	"rounds_completed" integer,
	"total_duration_seconds" integer,
	"hold_durations" integer[],
	"narration_mode" text,
	"feeling_after" text,
	"session_date" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"check_date" date,
	"sleep_hours" numeric,
	"stress_level" integer,
	"energy_level" integer,
	"digestion" text,
	"exercise_done" boolean DEFAULT false,
	"exercise_type" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fasting_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"duration_hours" numeric,
	"max_stage_reached" integer,
	"protocol" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "meal_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"description" text,
	"insulin_impact" text,
	"protein_estimate" text,
	"gut_impact" text,
	"plant_foods" text[],
	"ai_feedback" text,
	"ai_suggestion" text,
	"logged_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text,
	"age" integer,
	"sex" text,
	"height_cm" numeric,
	"weight_kg" numeric,
	"waist_cm" numeric,
	"dietary_preference" text,
	"dietary_exclusions" text[],
	"jain_diet" boolean DEFAULT false,
	"activity_level" text,
	"avg_sleep_hours" numeric,
	"known_conditions" text[],
	"goals" text[],
	"prakriti" text,
	"profile_completion" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "streaks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"streak_type" text,
	"current_streak" integer DEFAULT 0,
	"last_activity_date" date,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "water_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"amount_ml" integer,
	"logged_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "weekly_plant_diversity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"week_start" date,
	"unique_plants" text[],
	"count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
