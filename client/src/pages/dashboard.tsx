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
import AIAssistantPanel from "@/components/ai-assistant-panel";
import RealTimeClock from "@/components/real-time-clock";
import VehicleDetailsModal from "@/components/vehicle-details-modal";
import UserProfileModal from "@/components/user-profile-modal";

export default function Dashboard() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<"modification" | "maintenance">("modification");
  const [isVehicleDetailsModalOpen, setIsVehicleDetailsModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);

  const handleAddEntry = (type: "modification" | "maintenance") => {
    setEntryType(type);
    setIsAddEntryModalOpen(true);
  };

  if (!selectedVehicleId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          onAddEntry={() => handleAddEntry("modification")} 
          onOpenProfile={() => setIsUserProfileModalOpen(true)}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <VehicleSelector 
            selectedVehicleId={selectedVehicleId}
            onVehicleSelect={setSelectedVehicleId}
            onOpenVehicleDetails={() => setIsVehicleDetailsModalOpen(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 font-inter">
      <Header 
        onAddEntry={() => handleAddEntry("modification")} 
        onOpenProfile={() => setIsUserProfileModalOpen(true)}
      />
      
      <div className="container-responsive py-6 lg:py-8">
        <VehicleSelector 
          selectedVehicleId={selectedVehicleId}
          onVehicleSelect={setSelectedVehicleId}
          onOpenVehicleDetails={() => setIsVehicleDetailsModalOpen(true)}
        />
        
        <QuickStats vehicleId={selectedVehicleId} />
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content Area */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            <RecentModifications vehicleId={selectedVehicleId} />
            <MaintenanceTimeline vehicleId={selectedVehicleId} />
          </div>

          {/* AI Assistant Panel - Full width on mobile, dedicated column on desktop */}
          <div className="xl:col-span-1 space-y-6 lg:space-y-8">
            <AIAssistantPanel />
            {/* Mobile-only clock widget */}
            <div className="block lg:hidden">
              <RealTimeClock variant="full" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6 lg:space-y-8">
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

      {selectedVehicleId && (
        <VehicleDetailsModal
          isOpen={isVehicleDetailsModalOpen}
          onClose={() => setIsVehicleDetailsModalOpen(false)}
          vehicleId={selectedVehicleId}
        />
      )}

      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
      />
    </div>
  );
}
