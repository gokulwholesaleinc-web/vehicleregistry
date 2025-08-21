import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, jsonb, boolean, index } from "drizzle-orm/pg-core";
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
  bio: text("bio"),
  location: varchar("location"),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// VIN-based vehicles with community features
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vin: varchar("vin").notNull().unique(), // Primary identifier
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  trim: text("trim"),
  color: text("color"),
  currentMileage: integer("current_mileage").notNull(),
  lastServiceDate: text("last_service_date"),
  currentOwnerId: varchar("current_owner_id").notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  allowPreviousOwners: boolean("allow_previous_owners").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_vehicles_vin").on(table.vin),
  index("idx_vehicles_current_owner").on(table.currentOwnerId),
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
