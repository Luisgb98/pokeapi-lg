ALTER TABLE "team_members" ADD COLUMN "ability_name" text;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "nature_name" text;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "level" smallint;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "ivs" jsonb;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "evs" jsonb;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "move_names" text[];