import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface VinDecodeResult {
  make: string;
  model: string;
  year: number;
  engine: string;
  transmission: string;
  fuelType: string;
  bodyStyle: string;
  drivetrain: string;
  confidence: number;
}

export interface MaintenanceRecommendation {
  task: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  estimatedCost: string;
  dueDate: string;
  reason: string;
}

export interface PhotoAnalysis {
  category: string;
  description: string;
  suggestedTags: string[];
  estimatedValue: string;
  confidence: number;
}

export interface EntryCategorization {
  category: string;
  subcategory: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  suggestedNextSteps: string[];
}

export interface DuplicateCheckResult {
  exists: boolean;
  existingRecord: any;
  suggestion: string | null;
}

export function useVinDecoder() {
  return useMutation({
    mutationFn: async (vin: string) => {
      const res = await api('/vin/decode', { method: 'POST', body: JSON.stringify({ vin }) });
      return res.data as { vehicle: any; aiInsights: any };
    }
  });
}

export function useMaintenanceRecommendations() {
  return useMutation({
    mutationFn: async (vehicleData: {
      make: string;
      model: string;
      year: number;
      mileage: number;
      modifications?: string[];
      lastMaintenance?: string[];
    }): Promise<MaintenanceRecommendation[]> => {
      const response = await fetch('/api/ai/maintenance-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate maintenance recommendations');
      }
      
      return response.json();
    }
  });
}

export function usePhotoAnalysis() {
  return useMutation({
    mutationFn: async (photo: File): Promise<PhotoAnalysis> => {
      const formData = new FormData();
      formData.append('photo', photo);
      
      const response = await fetch('/api/ai/analyze-photo', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze photo');
      }
      
      return response.json();
    }
  });
}

export function useEntryCategorizer() {
  return useMutation({
    mutationFn: async (entryData: {
      title: string;
      description: string;
      cost: number;
    }): Promise<EntryCategorization> => {
      const response = await fetch('/api/ai/categorize-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to categorize entry');
      }
      
      return response.json();
    }
  });
}

export function useDuplicateChecker() {
  return useMutation({
    mutationFn: async (checkData: {
      type: 'vin' | 'modification' | 'maintenance';
      identifier: string;
    }): Promise<DuplicateCheckResult> => {
      const response = await fetch('/api/registry/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to check for duplicates');
      }
      
      return response.json();
    }
  });
}

export function useCacheInvalidator() {
  return useMutation({
    mutationFn: async (): Promise<{ message: string }> => {
      const response = await fetch('/api/cache/invalidate', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to invalidate cache');
      }
      
      return response.json();
    }
  });
}