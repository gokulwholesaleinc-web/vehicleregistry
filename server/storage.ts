import {
  users,
  vehicles,
  modifications,
  maintenanceRecords,
  upcomingMaintenance,
  vehicleOwnership,
  vehicleTransfers,
  notifications,
  adminActionLogs,
  type User,
  type UpsertUser,
  type Vehicle,
  type InsertVehicle,
  type Modification,
  type InsertModification,
  type MaintenanceRecord,
  type InsertMaintenanceRecord,
  type UpcomingMaintenance,
  type InsertUpcomingMaintenance,
  type VehicleOwnership,
  type InsertVehicleOwnership,
  type VehicleTransfer,
  type InsertVehicleTransfer,
  type Notification,
  type InsertNotification,
  type AdminActionLog,
  type InsertAdminActionLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // Users (for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updateData: Partial<UpsertUser>): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;

  // Vehicles (VIN-based with ownership)
  getVehiclesByOwner(userId: string): Promise<Vehicle[]>;
  getVehicleByVin(vin: string): Promise<Vehicle | undefined>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle, userId: string): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  transferVehicle(vehicleId: string, fromUserId: string, toUserId: string, notes?: string): Promise<boolean>;

  // Community features
  getPublicVehicles(limit?: number, offset?: number): Promise<Vehicle[]>;
  getVehicleHistory(vehicleId: string): Promise<VehicleOwnership[]>;

  // Modifications (with user tracking)
  getModifications(vehicleId: string): Promise<Modification[]>;
  createModification(modification: InsertModification): Promise<Modification>;

  // Maintenance Records (with user tracking)
  getMaintenanceRecords(vehicleId: string): Promise<MaintenanceRecord[]>;
  createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord>;

  // Upcoming Maintenance
  getUpcomingMaintenance(vehicleId: string): Promise<UpcomingMaintenance[]>;
  createUpcomingMaintenance(maintenance: InsertUpcomingMaintenance): Promise<UpcomingMaintenance>;
  deleteUpcomingMaintenance(id: string): Promise<boolean>;

  // Vehicle Transfers
  createTransferRequest(transfer: InsertVehicleTransfer): Promise<VehicleTransfer>;
  getTransfersByUser(userId: string): Promise<VehicleTransfer[]>;
  processTransfer(transferId: string, accept: boolean): Promise<boolean>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationRead(notificationId: string): Promise<boolean>;
  markAllNotificationsRead(userId: string): Promise<boolean>;

  // Admin Functions
  getAllUsers(limit?: number, offset?: number): Promise<User[]>;
  suspendUser(userId: string, adminId: string, reason: string): Promise<boolean>;
  reactivateUser(userId: string, adminId: string, reason: string): Promise<boolean>;
  promoteUserToAdmin(userId: string, adminId: string): Promise<boolean>;
  getAllVehicles(limit?: number, offset?: number): Promise<Vehicle[]>;
  deleteVehicle(vehicleId: string, adminId: string, reason: string): Promise<boolean>;
  getPlatformStats(): Promise<any>;
  getAdminActionLogs(limit?: number, offset?: number): Promise<AdminActionLog[]>;
  logAdminAction(action: InsertAdminActionLog): Promise<AdminActionLog>;
}

export class DatabaseStorage implements IStorage {
  // Users (for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  // Vehicles (VIN-based with ownership)
  async getVehiclesByOwner(userId: string): Promise<Vehicle[]> {
    return await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.currentOwnerId, userId))
      .orderBy(desc(vehicles.createdAt));
  }

  async getVehicleByVin(vin: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.vin, vin));
    return vehicle || undefined;
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async createVehicle(vehicleData: InsertVehicle, userId: string): Promise<Vehicle> {
    // Create vehicle with current owner
    const [vehicle] = await db
      .insert(vehicles)
      .values({
        ...vehicleData,
        currentOwnerId: userId,
      })
      .returning();

    // Create initial ownership record
    await db.insert(vehicleOwnership).values({
      vehicleId: vehicle.id,
      userId: userId,
      isCurrent: true,
    });

    return vehicle;
  }

  async updateVehicle(id: string, vehicleData: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [vehicle] = await db
      .update(vehicles)
      .set({ ...vehicleData, updatedAt: new Date() })
      .where(eq(vehicles.id, id))
      .returning();
    return vehicle || undefined;
  }

  async transferVehicle(vehicleId: string, fromUserId: string, toUserId: string, notes?: string): Promise<boolean> {
    try {
      // End current ownership
      await db
        .update(vehicleOwnership)
        .set({ endDate: new Date(), isCurrent: false })
        .where(and(eq(vehicleOwnership.vehicleId, vehicleId), eq(vehicleOwnership.isCurrent, true)));

      // Create new ownership
      await db.insert(vehicleOwnership).values({
        vehicleId,
        userId: toUserId,
        transferredBy: fromUserId,
        transferNotes: notes,
        isCurrent: true,
      });

      // Update vehicle owner
      await db
        .update(vehicles)
        .set({ currentOwnerId: toUserId, updatedAt: new Date() })
        .where(eq(vehicles.id, vehicleId));

      return true;
    } catch (error) {
      console.error("Vehicle transfer failed:", error);
      return false;
    }
  }

  // Community features
  async getPublicVehicles(limit = 20, offset = 0): Promise<Vehicle[]> {
    return await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.isPublic, true))
      .orderBy(desc(vehicles.updatedAt))
      .limit(limit)
      .offset(offset);
  }

  async getVehicleHistory(vehicleId: string): Promise<VehicleOwnership[]> {
    return await db
      .select()
      .from(vehicleOwnership)
      .where(eq(vehicleOwnership.vehicleId, vehicleId))
      .orderBy(desc(vehicleOwnership.startDate));
  }

  // Modifications (with user tracking)
  async getModifications(vehicleId: string): Promise<Modification[]> {
    return await db
      .select()
      .from(modifications)
      .where(eq(modifications.vehicleId, vehicleId))
      .orderBy(desc(modifications.createdAt));
  }

  async createModification(modificationData: InsertModification): Promise<Modification> {
    const [modification] = await db
      .insert(modifications)
      .values(modificationData)
      .returning();
    return modification;
  }

  // Maintenance Records (with user tracking)
  async getMaintenanceRecords(vehicleId: string): Promise<MaintenanceRecord[]> {
    return await db
      .select()
      .from(maintenanceRecords)
      .where(eq(maintenanceRecords.vehicleId, vehicleId))
      .orderBy(desc(maintenanceRecords.createdAt));
  }

  async createMaintenanceRecord(recordData: InsertMaintenanceRecord): Promise<MaintenanceRecord> {
    const [record] = await db
      .insert(maintenanceRecords)
      .values(recordData)
      .returning();
    return record;
  }

  // Upcoming Maintenance
  async getUpcomingMaintenance(vehicleId: string): Promise<UpcomingMaintenance[]> {
    return await db
      .select()
      .from(upcomingMaintenance)
      .where(eq(upcomingMaintenance.vehicleId, vehicleId))
      .orderBy(asc(upcomingMaintenance.dueMileage));
  }

  async createUpcomingMaintenance(maintenanceData: InsertUpcomingMaintenance): Promise<UpcomingMaintenance> {
    const [maintenance] = await db
      .insert(upcomingMaintenance)
      .values(maintenanceData)
      .returning();
    return maintenance;
  }

  async deleteUpcomingMaintenance(id: string): Promise<boolean> {
    const result = await db
      .delete(upcomingMaintenance)
      .where(eq(upcomingMaintenance.id, id));
    return result.rowCount > 0;
  }

  // Vehicle Transfers
  async createTransferRequest(transferData: InsertVehicleTransfer): Promise<VehicleTransfer> {
    const [transfer] = await db
      .insert(vehicleTransfers)
      .values(transferData)
      .returning();
    return transfer;
  }

  async getTransfersByUser(userId: string): Promise<VehicleTransfer[]> {
    return await db
      .select()
      .from(vehicleTransfers)
      .where(or(eq(vehicleTransfers.fromUserId, userId), eq(vehicleTransfers.toUserId, userId)))
      .orderBy(desc(vehicleTransfers.createdAt));
  }

  async processTransfer(transferId: string, accept: boolean): Promise<boolean> {
    try {
      const [transfer] = await db
        .select()
        .from(vehicleTransfers)
        .where(eq(vehicleTransfers.id, transferId));

      if (!transfer || transfer.status !== "pending") {
        return false;
      }

      if (accept) {
        // Complete the transfer
        await this.transferVehicle(transfer.vehicleId, transfer.fromUserId, transfer.toUserId);
        
        await db
          .update(vehicleTransfers)
          .set({ status: "accepted", completedAt: new Date() })
          .where(eq(vehicleTransfers.id, transferId));
      } else {
        await db
          .update(vehicleTransfers)
          .set({ status: "rejected" })
          .where(eq(vehicleTransfers.id, transferId));
      }

      return true;
    } catch (error) {
      console.error("Transfer processing failed:", error);
      return false;
    }
  }

  // Notifications
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    return notification;
  }

  async getNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
    const query = db
      .select()
      .from(notifications)
      .where(unreadOnly ? 
        and(eq(notifications.userId, userId), eq(notifications.isRead, false)) :
        eq(notifications.userId, userId)
      )
      .orderBy(desc(notifications.createdAt));
    
    return await query;
  }

  async markNotificationRead(notificationId: string): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.id, notificationId));
    return result.rowCount > 0;
  }

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.rowCount > 0;
  }

  // Admin Functions
  async getAllUsers(limit = 50, offset = 0): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async suspendUser(userId: string, adminId: string, reason: string): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(users.id, userId));

      await this.logAdminAction({
        adminUserId: adminId,
        action: "suspend_user",
        targetType: "user",
        targetId: userId,
        reason,
        details: { suspended: true }
      });

      return true;
    } catch (error) {
      console.error("Failed to suspend user:", error);
      return false;
    }
  }

  async reactivateUser(userId: string, adminId: string, reason: string): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(users.id, userId));

      await this.logAdminAction({
        adminUserId: adminId,
        action: "reactivate_user",
        targetType: "user",
        targetId: userId,
        reason,
        details: { reactivated: true }
      });

      return true;
    } catch (error) {
      console.error("Failed to reactivate user:", error);
      return false;
    }
  }

  async promoteUserToAdmin(userId: string, adminId: string): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({ role: "admin", updatedAt: new Date() })
        .where(eq(users.id, userId));

      await this.logAdminAction({
        adminUserId: adminId,
        action: "promote_to_admin",
        targetType: "user",
        targetId: userId,
        reason: "Promoted to admin role",
        details: { newRole: "admin" }
      });

      return true;
    } catch (error) {
      console.error("Failed to promote user:", error);
      return false;
    }
  }

  async getAllVehicles(limit = 50, offset = 0): Promise<Vehicle[]> {
    return await db
      .select()
      .from(vehicles)
      .orderBy(desc(vehicles.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async deleteVehicle(vehicleId: string, adminId: string, reason: string): Promise<boolean> {
    try {
      // Delete related records first
      await db.delete(modifications).where(eq(modifications.vehicleId, vehicleId));
      await db.delete(maintenanceRecords).where(eq(maintenanceRecords.vehicleId, vehicleId));
      await db.delete(upcomingMaintenance).where(eq(upcomingMaintenance.vehicleId, vehicleId));
      await db.delete(vehicleOwnership).where(eq(vehicleOwnership.vehicleId, vehicleId));
      await db.delete(vehicleTransfers).where(eq(vehicleTransfers.vehicleId, vehicleId));
      
      // Delete the vehicle
      await db.delete(vehicles).where(eq(vehicles.id, vehicleId));

      await this.logAdminAction({
        adminUserId: adminId,
        action: "delete_vehicle",
        targetType: "vehicle",
        targetId: vehicleId,
        reason,
        details: { deleted: true }
      });

      return true;
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
      return false;
    }
  }

  async getPlatformStats(): Promise<any> {
    try {
      const [userCount] = await db.select({ count: sql`COUNT(*)` }).from(users);
      const [vehicleCount] = await db.select({ count: sql`COUNT(*)` }).from(vehicles);
      const [modificationCount] = await db.select({ count: sql`COUNT(*)` }).from(modifications);
      const [maintenanceCount] = await db.select({ count: sql`COUNT(*)` }).from(maintenanceRecords);
      const [transferCount] = await db.select({ count: sql`COUNT(*)` }).from(vehicleTransfers);
      const [activeUsers] = await db.select({ count: sql`COUNT(*)` }).from(users).where(eq(users.isActive, true));
      const [publicVehicles] = await db.select({ count: sql`COUNT(*)` }).from(vehicles).where(eq(vehicles.isPublic, true));
      
      return {
        totalUsers: Number(userCount.count),
        activeUsers: Number(activeUsers.count),
        totalVehicles: Number(vehicleCount.count),
        publicVehicles: Number(publicVehicles.count),
        totalModifications: Number(modificationCount.count),
        totalMaintenanceRecords: Number(maintenanceCount.count),
        totalTransfers: Number(transferCount.count),
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error("Failed to get platform stats:", error);
      return {};
    }
  }

  async getAdminActionLogs(limit = 100, offset = 0): Promise<AdminActionLog[]> {
    return await db
      .select()
      .from(adminActionLogs)
      .orderBy(desc(adminActionLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async logAdminAction(actionData: InsertAdminActionLog): Promise<AdminActionLog> {
    const [action] = await db
      .insert(adminActionLogs)
      .values(actionData)
      .returning();
    return action;
  }
}

export const storage = new DatabaseStorage();
