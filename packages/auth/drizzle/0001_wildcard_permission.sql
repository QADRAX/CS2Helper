-- Wildcard permission: interpreted by @cs2helper/auth (effectiveKeysGrantPermission / use cases).
INSERT INTO "permissions" ("key", "description") VALUES
	('*', 'All permissions (wildcard; grants every check in this package)')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r
INNER JOIN "permissions" p ON p.key = '*'
WHERE r.name = 'admin'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
