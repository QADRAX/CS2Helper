CREATE TABLE "community_instance_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"display_name" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "community_instance_settings_singleton_chk" CHECK ("id" = 1)
);

--> statement-breakpoint

INSERT INTO "community_instance_settings" ("id", "display_name") VALUES (1, 'CS2 Community')
ON CONFLICT ("id") DO NOTHING;
