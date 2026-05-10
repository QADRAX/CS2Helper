CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code_hash" text NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"max_uses" integer NOT NULL,
	"uses_count" integer DEFAULT 0 NOT NULL,
	"extra_role_name" text,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_code_hash_unique" UNIQUE("code_hash")
);

ALTER TABLE "invitations" ADD CONSTRAINT "invitations_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;

CREATE INDEX "invitations_created_by_user_id_idx" ON "invitations" ("created_by_user_id");

INSERT INTO "permissions" ("key", "description") VALUES
	('users.invitations.manage', 'Create and revoke user invitations')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r
INNER JOIN "permissions" p ON p.key = 'users.invitations.manage'
WHERE r.name = 'admin'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
