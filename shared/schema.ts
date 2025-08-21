import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, jsonb, boolean, index, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enhanced users table for community features
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  password: varchar("password"), // For traditional auth
  bio: text("bio"),
  location: varchar("location"),
  isPublic: boolean("is_public").default(true).notNull(),
  role: varchar("role").default("user").notNull(), // user, admin, moderator
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Password reset tokens for local authentication
export const passwordResets = pgTable("password_resets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  token: varchar("token", { length: 120 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// VIN-based vehicles with community features and draft support
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vin: varchar("vin"), // Optional for draft vehicles
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  trim: text("trim"),
  color: text("color"),
  currentMileage: integer("current_mileage"),
  lastServiceDate: text("last_service_date"),
  currentOwnerId: varchar("current_owner_id").notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  allowPreviousOwners: boolean("allow_previous_owners").default(true).notNull(),
  isDraft: boolean("is_draft").default(false).notNull(), // Track draft status
  autoFilled: boolean("auto_filled").default(false).notNull(), // Track if filled via AI
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_vehicles_vin").on(table.vin),
  index("idx_vehicles_current_owner").on(table.currentOwnerId),
  index("idx_vehicles_draft").on(table.isDraft),
]);

// Vehicle ownership history for transfers
export const vehicleOwnership = pgTable("vehicle_ownership", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull(),
  userId: varchar("user_id").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  transferredBy: varchar("transferred_by"),
  transferNotes: text("transfer_notes"),
  isCurrent: boolean("is_current").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_ownership_vehicle").on(table.vehicleId),
  index("idx_ownership_user").on(table.userId),
  index("idx_ownership_current").on(table.isCurrent),
]);

export const modifications = pgTable("modifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull(),
  userId: varchar("user_id").notNull(), // Track who added the modification
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  installDate: text("install_date").notNull(),
  mileage: integer("mileage").notNull(),
  status: text("status").notNull().default("installed"),
  photos: jsonb("photos").$type<string[]>().default([]),
  documents: jsonb("documents").$type<string[]>().default([]),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_modifications_vehicle").on(table.vehicleId),
  index("idx_modifications_user").on(table.userId),
]);

export const maintenanceRecords = pgTable("maintenance_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull(),
  userId: varchar("user_id").notNull(), // Track who added the record
  serviceType: text("service_type").notNull(),
  description: text("description"),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  serviceDate: text("service_date").notNull(),
  mileage: integer("mileage").notNull(),
  shop: text("shop"),
  photos: jsonb("photos").$type<string[]>().default([]),
  documents: jsonb("documents").$type<string[]>().default([]),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_maintenance_vehicle").on(table.vehicleId),
  index("idx_maintenance_user").on(table.userId),
]);

export const upcomingMaintenance = pgTable("upcoming_maintenance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull(),
  serviceType: text("service_type").notNull(),
  dueMileage: integer("due_mileage").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Vehicle transfer requests for secure ownership transfers
export const vehicleTransfers = pgTable("vehicle_transfers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull(),
  fromUserId: varchar("from_user_id").notNull(),
  toUserId: varchar("to_user_id").notNull(),
  transferCode: varchar("transfer_code").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, expired
  message: text("message"),
  expiresAt: timestamp("expires_at").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_transfers_from_user").on(table.fromUserId),
  index("idx_transfers_to_user").on(table.toUserId),
  index("idx_transfers_code").on(table.transferCode),
]);

// Insert schemas
export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  vin: z.string().optional(), // Make VIN optional for draft vehicles
  currentMileage: z.number().optional() // Make mileage optional for draft vehicles
});

export const insertModificationSchema = createInsertSchema(modifications).omit({
  id: true,
  createdAt: true,
});

export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({
  id: true,
  createdAt: true,
});

export const insertUpcomingMaintenanceSchema = createInsertSchema(upcomingMaintenance).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertVehicleTransferSchema = createInsertSchema(vehicleTransfers).omit({
  id: true,
  transferCode: true,
  createdAt: true,
});

// Types
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type Modification = typeof modifications.$inferSelect;
export type InsertModification = z.infer<typeof insertModificationSchema>;

export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;

export type UpcomingMaintenance = typeof upcomingMaintenance.$inferSelect;
export type InsertUpcomingMaintenance = z.infer<typeof insertUpcomingMaintenanceSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull().default("info"), // info, success, warning, error
  isRead: boolean("is_read").default(false),
  relatedEntityId: varchar("related_entity_id"), // vehicle ID, transfer ID, etc.
  relatedEntityType: varchar("related_entity_type"), // vehicle, transfer, maintenance, etc.
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Admin action logs for audit trail
export const adminActionLogs = pgTable("admin_action_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminUserId: varchar("admin_user_id").notNull().references(() => users.id),
  action: varchar("action").notNull(), // suspend_user, delete_vehicle, etc.
  targetType: varchar("target_type").notNull(), // user, vehicle, modification, etc.
  targetId: varchar("target_id").notNull(),
  details: jsonb("details"),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AdminActionLog = typeof adminActionLogs.$inferSelect;
export type InsertAdminActionLog = typeof adminActionLogs.$inferInsert;

export type VehicleOwnership = typeof vehicleOwnership.$inferSelect;
export type InsertVehicleOwnership = typeof vehicleOwnership.$inferInsert;

export type VehicleTransfer = typeof vehicleTransfers.$inferSelect;
export type InsertVehicleTransfer = z.infer<typeof insertVehicleTransferSchema>;

// Relations for better querying
export const usersRelations = relations(users, ({ many }) => ({
  vehicles: many(vehicles),
  modifications: many(modifications),
  maintenanceRecords: many(maintenanceRecords),
  ownerships: many(vehicleOwnership),
  transfersFrom: many(vehicleTransfers, { relationName: "transferFrom" }),
  transfersTo: many(vehicleTransfers, { relationName: "transferTo" }),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  currentOwner: one(users, {
    fields: [vehicles.currentOwnerId],
    references: [users.id],
  }),
  modifications: many(modifications),
  maintenanceRecords: many(maintenanceRecords),
  upcomingMaintenance: many(upcomingMaintenance),
  ownerships: many(vehicleOwnership),
  transfers: many(vehicleTransfers),
}));

export const vehicleOwnershipRelations = relations(vehicleOwnership, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehicleOwnership.vehicleId],
    references: [vehicles.id],
  }),
  user: one(users, {
    fields: [vehicleOwnership.userId],
    references: [users.id],
  }),
}));

export const modificationsRelations = relations(modifications, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [modifications.vehicleId],
    references: [vehicles.id],
  }),
  user: one(users, {
    fields: [modifications.userId],
    references: [users.id],
  }),
}));

export const maintenanceRecordsRelations = relations(maintenanceRecords, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [maintenanceRecords.vehicleId],
    references: [vehicles.id],
  }),
  user: one(users, {
    fields: [maintenanceRecords.userId],
    references: [users.id],
  }),
}));

// Build specifications and comparisons
export const specs = pgTable("specs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vin: varchar("vin", { length: 17 }).notNull(),
  title: varchar("title", { length: 80 }).default("Current Build").notNull(),
  wheels: varchar("wheels", { length: 160 }),
  tires: varchar("tires", { length: 160 }),
  suspension: varchar("suspension", { length: 160 }),
  power: varchar("power", { length: 160 }),
  brakes: varchar("brakes", { length: 160 }),
  aero: varchar("aero", { length: 160 }),
  weight: varchar("weight", { length: 60 }),
  notes: text("notes"),
  isStockBaseline: boolean("is_stock_baseline").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_specs_vin").on(table.vin),
  index("idx_specs_stock").on(table.isStockBaseline),
]);

// Social features - likes
export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vin: varchar("vin", { length: 17 }).notNull(),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_likes_vin").on(table.vin),
  index("idx_likes_user").on(table.userId),
]);

// Social features - follows
export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vin: varchar("vin", { length: 17 }).notNull(),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_follows_vin").on(table.vin),
  index("idx_follows_user").on(table.userId),
]);

// Community comments
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vin: varchar("vin", { length: 17 }).notNull(),
  recordId: varchar("record_id"),
  userId: varchar("user_id").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_comments_vin").on(table.vin),
  index("idx_comments_user").on(table.userId),
  index("idx_comments_record").on(table.recordId),
]);

// Events and meetups
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vin: varchar("vin", { length: 17 }).notNull(),
  title: varchar("title", { length: 120 }).notNull(),
  kind: varchar("kind", { length: 40 }).default("meet").notNull(), // meet | show | trackday | dyno
  occurredAt: timestamp("occurred_at").notNull(),
  location: varchar("location", { length: 160 }),
  description: text("description"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_events_vin").on(table.vin),
  index("idx_events_date").on(table.occurredAt),
  index("idx_events_creator").on(table.createdBy),
]);

// Event photos and documents
export const eventAssets = pgTable("event_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  storageKey: varchar("storage_key", { length: 255 }).notNull(),
  caption: varchar("caption", { length: 160 }),
  photographer: varchar("photographer", { length: 120 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_event_assets_event").on(table.eventId),
]);

// Mileage verification with EXIF
export const mileageProofs = pgTable("mileage_proofs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vin: varchar("vin", { length: 17 }).notNull(),
  userId: varchar("user_id").notNull(),
  storageKey: varchar("storage_key", { length: 255 }).notNull(),
  mileage: integer("mileage").notNull(),
  exifDatetime: timestamp("exif_datetime"),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_mileage_proofs_vin").on(table.vin),
  index("idx_mileage_proofs_user").on(table.userId),
  index("idx_mileage_proofs_verified").on(table.verified),
]);

// Relations for new tables
export const specsRelations = relations(specs, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [specs.vin],
    references: [vehicles.vin],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [likes.vin],
    references: [vehicles.vin],
  }),
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [follows.vin],
    references: [vehicles.vin],
  }),
  user: one(users, {
    fields: [follows.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [comments.vin],
    references: [vehicles.vin],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [events.vin],
    references: [vehicles.vin],
  }),
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
}));

export const eventAssetsRelations = relations(eventAssets, ({ one }) => ({
  event: one(events, {
    fields: [eventAssets.eventId],
    references: [events.id],
  }),
}));

export const mileageProofsRelations = relations(mileageProofs, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [mileageProofs.vin],
    references: [vehicles.vin],
  }),
  user: one(users, {
    fields: [mileageProofs.userId],
    references: [users.id],
  }),
}));

export const vehicleTransfersRelations = relations(vehicleTransfers, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehicleTransfers.vehicleId],
    references: [vehicles.id],
  }),
  fromUser: one(users, {
    fields: [vehicleTransfers.fromUserId],
    references: [users.id],
    relationName: "transferFrom",
  }),
  toUser: one(users, {
    fields: [vehicleTransfers.toUserId],
    references: [users.id],
    relationName: "transferTo",
  }),
}));
