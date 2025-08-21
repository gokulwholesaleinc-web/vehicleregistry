import { 
  type User, 
  type InsertUser, 
  type Vehicle, 
  type InsertVehicle,
  type Modification,
  type InsertModification,
  type MaintenanceRecord,
  type InsertMaintenanceRecord,
  type UpcomingMaintenance,
  type InsertUpcomingMaintenance
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Vehicles
  getVehicles(userId: string): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;

  // Modifications
  getModifications(vehicleId: string): Promise<Modification[]>;
  getModification(id: string): Promise<Modification | undefined>;
  createModification(modification: InsertModification): Promise<Modification>;
  updateModification(id: string, modification: Partial<InsertModification>): Promise<Modification | undefined>;

  // Maintenance Records
  getMaintenanceRecords(vehicleId: string): Promise<MaintenanceRecord[]>;
  getMaintenanceRecord(id: string): Promise<MaintenanceRecord | undefined>;
  createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord>;
  updateMaintenanceRecord(id: string, record: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord | undefined>;

  // Upcoming Maintenance
  getUpcomingMaintenance(vehicleId: string): Promise<UpcomingMaintenance[]>;
  createUpcomingMaintenance(maintenance: InsertUpcomingMaintenance): Promise<UpcomingMaintenance>;
  deleteUpcomingMaintenance(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private vehicles: Map<string, Vehicle>;
  private modifications: Map<string, Modification>;
  private maintenanceRecords: Map<string, MaintenanceRecord>;
  private upcomingMaintenance: Map<string, UpcomingMaintenance>;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.modifications = new Map();
    this.maintenanceRecords = new Map();
    this.upcomingMaintenance = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Vehicles
  async getVehicles(userId: string): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(
      (vehicle) => vehicle.userId === userId
    );
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = randomUUID();
    const vehicle: Vehicle = { 
      ...insertVehicle, 
      id, 
      createdAt: new Date(),
      lastServiceDate: insertVehicle.lastServiceDate || null
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: string, updateData: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    
    const updated = { ...vehicle, ...updateData };
    this.vehicles.set(id, updated);
    return updated;
  }

  // Modifications
  async getModifications(vehicleId: string): Promise<Modification[]> {
    return Array.from(this.modifications.values())
      .filter((mod) => mod.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getModification(id: string): Promise<Modification | undefined> {
    return this.modifications.get(id);
  }

  async createModification(insertModification: InsertModification): Promise<Modification> {
    const id = randomUUID();
    const modification: Modification = { 
      ...insertModification, 
      id, 
      createdAt: new Date(),
      description: insertModification.description || null,
      photos: insertModification.photos || [],
      documents: insertModification.documents || []
    };
    this.modifications.set(id, modification);
    return modification;
  }

  async updateModification(id: string, updateData: Partial<InsertModification>): Promise<Modification | undefined> {
    const modification = this.modifications.get(id);
    if (!modification) return undefined;
    
    const updated = { ...modification, ...updateData };
    this.modifications.set(id, {
      ...updated,
      photos: updated.photos || [],
      documents: updated.documents || []
    });
    return updated;
  }

  // Maintenance Records
  async getMaintenanceRecords(vehicleId: string): Promise<MaintenanceRecord[]> {
    return Array.from(this.maintenanceRecords.values())
      .filter((record) => record.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getMaintenanceRecord(id: string): Promise<MaintenanceRecord | undefined> {
    return this.maintenanceRecords.get(id);
  }

  async createMaintenanceRecord(insertRecord: InsertMaintenanceRecord): Promise<MaintenanceRecord> {
    const id = randomUUID();
    const record: MaintenanceRecord = { 
      ...insertRecord, 
      id, 
      createdAt: new Date(),
      description: insertRecord.description || null,
      shop: insertRecord.shop || null,
      photos: insertRecord.photos || [],
      documents: insertRecord.documents || []
    };
    this.maintenanceRecords.set(id, record);
    return record;
  }

  async updateMaintenanceRecord(id: string, updateData: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord | undefined> {
    const record = this.maintenanceRecords.get(id);
    if (!record) return undefined;
    
    const updated = { ...record, ...updateData };
    this.maintenanceRecords.set(id, {
      ...updated,
      photos: updated.photos || [],
      documents: updated.documents || []
    });
    return updated;
  }

  // Upcoming Maintenance
  async getUpcomingMaintenance(vehicleId: string): Promise<UpcomingMaintenance[]> {
    return Array.from(this.upcomingMaintenance.values())
      .filter((maintenance) => maintenance.vehicleId === vehicleId)
      .sort((a, b) => a.dueMileage - b.dueMileage);
  }

  async createUpcomingMaintenance(insertMaintenance: InsertUpcomingMaintenance): Promise<UpcomingMaintenance> {
    const id = randomUUID();
    const maintenance: UpcomingMaintenance = { 
      ...insertMaintenance, 
      id, 
      createdAt: new Date(),
      description: insertMaintenance.description || null
    };
    this.upcomingMaintenance.set(id, maintenance);
    return maintenance;
  }

  async deleteUpcomingMaintenance(id: string): Promise<boolean> {
    return this.upcomingMaintenance.delete(id);
  }
}

export const storage = new MemStorage();
