import { useState } from "react";
import Header from "@/components/header";
import VehicleSelector from "@/components/vehicle-selector";
import QuickStats from "@/components/quick-stats";
import RecentModifications from "@/components/recent-modifications";
import MaintenanceTimeline from "@/components/maintenance-timeline";
import QuickActions from "@/components/quick-actions";
import PhotoGallery from "@/components/photo-gallery";
import UpcomingMaintenance from "@/components/upcoming-maintenance";
import CostSummary from "@/components/cost-summary";
import AddEntryModal from "@/components/add-entry-modal";

export default function Dashboard() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<"modification" | "maintenance">("modification");

  const handleAddEntry = (type: "modification" | "maintenance") => {
    setEntryType(type);
    setIsAddEntryModalOpen(true);
  };

  if (!selectedVehicleId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onAddEntry={() => handleAddEntry("modification")} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <VehicleSelector 
            selectedVehicleId={selectedVehicleId}
            onVehicleSelect={setSelectedVehicleId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <Header onAddEntry={() => handleAddEntry("modification")} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VehicleSelector 
          selectedVehicleId={selectedVehicleId}
          onVehicleSelect={setSelectedVehicleId}
        />
        
        <QuickStats vehicleId={selectedVehicleId} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <RecentModifications vehicleId={selectedVehicleId} />
            <MaintenanceTimeline vehicleId={selectedVehicleId} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <QuickActions onAddEntry={handleAddEntry} />
            <PhotoGallery vehicleId={selectedVehicleId} />
            <UpcomingMaintenance vehicleId={selectedVehicleId} />
            <CostSummary vehicleId={selectedVehicleId} />
          </div>
        </div>
      </div>

      <AddEntryModal
        isOpen={isAddEntryModalOpen}
        onClose={() => setIsAddEntryModalOpen(false)}
        vehicleId={selectedVehicleId}
        entryType={entryType}
        onEntryTypeChange={setEntryType}
      />
    </div>
  );
}
