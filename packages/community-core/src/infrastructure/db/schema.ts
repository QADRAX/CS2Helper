import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const communityInstanceSettings = pgTable("community_instance_settings", {
  id: integer("id").primaryKey().default(1).notNull(),
  displayName: text("display_name").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const communitySchema = {
  communityInstanceSettings,
};
