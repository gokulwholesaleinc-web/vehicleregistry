import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  vin: text("vin").notNull().unique(),
  currentMileage: integer("current_mileage").notNull(),
  lastServiceDate: text("last_service_date"),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const modifications = pgTable("modifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  installDate: text("install_date").notNull(),
  mileage: integer("mileage").notNull(),
  status: text("status").notNull().default("installed"),
  photos: jsonb("photos").$type<string[]>().default([]),
  documents: jsonb("documents").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const maintenanceRecords = pgTable("maintenance_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull(),
  serviceType: text("service_type").notNull(),
  description: text("description"),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  serviceDate: text("service_date").notNull(),
  mileage: integer("mileage").notNull(),
  shop: text("shop"),
  photos: jsonb("photos").$type<string[]>().default([]),
  documents: jsonb("documents").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const upcomingMaintenance = pgTable("upcoming_maintenance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull(),
  serviceType: text("service_type").notNull(),
  dueMileage: integer("due_mileage").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
});

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
