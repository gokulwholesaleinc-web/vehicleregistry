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
import CommunitySlideshow from "@/components/community-slideshow";
import { VinLookupModal } from "@/components/vin-lookup-modal";
import { Breadcrumb, useBreadcrumbs } from "@/components/breadcrumb";
import SmartMaintenancePredictions from "@/components/smart-maintenance-predictions";
import CostAnalyticsDashboard from "@/components/cost-analytics-dashboard";
import EnhancedPhotoManagement from "@/components/enhanced-photo-management";
import LocalEnthusiastNetwork from "@/components/local-enthusiast-network";

export default function Dashboard() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<"modification" | "maintenance">("modification");
  const [isVehicleDetailsModalOpen, setIsVehicleDetailsModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const breadcrumbs = useBreadcrumbs();

  const handleAddEntry = (type: "modification" | "maintenance") => {
    setEntryType(type);
    setIsAddEntryModalOpen(true);
  };

  if (!selectedVehicleId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Header 
          onAddEntry={() => handleAddEntry("modification")} 
          onOpenProfile={() => setIsUserProfileModalOpen(true)}
        />
        
        {/* Community Showcase - Hero Section */}
        <div className="py-6 lg:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Featured Community Builds
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Discover incredible builds from automotive enthusiasts worldwide
              </p>
            </div>
            
            <CommunitySlideshow />
          </div>
        </div>

        {/* Secondary Content */}
        <div className="bg-white/50 dark:bg-gray-900/50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Start Your Registry</h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">Add your first vehicle to begin tracking</p>
                </div>
                <VinLookupModal />
              </div>
              
              <VehicleSelector 
                selectedVehicleId={selectedVehicleId}
                onVehicleSelect={setSelectedVehicleId}
                onOpenVehicleDetails={() => setIsVehicleDetailsModalOpen(true)}
              />

              <div className="mt-4">
                <Breadcrumb items={breadcrumbs} />
              </div>
            </div>
          </div>
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
      
      {/* Community Showcase - Hero Section */}
      <div className="py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Community Showcase
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Explore amazing builds and get inspired for your next project
            </p>
          </div>
          
          <CommunitySlideshow />
        </div>
      </div>

      {/* Vehicle Dashboard Content */}
      <div className="bg-white/30 dark:bg-gray-900/30 py-8">
        <div className="container-responsive">
          <div className="mb-6">
            <Breadcrumb items={breadcrumbs} />
          </div>
          
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

        {/* Smart Features Section */}
        <div className="mt-8 space-y-6 lg:space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Smart Maintenance Predictions */}
            <SmartMaintenancePredictions vehicleId={selectedVehicleId} />
            
            {/* Cost Analytics Dashboard */}
            <CostAnalyticsDashboard vehicleId={selectedVehicleId} />
          </div>
          
          {/* Enhanced Photo Management */}
          <div className="mt-8">
            <EnhancedPhotoManagement vehicleId={selectedVehicleId} />
          </div>
          
          {/* Local Enthusiast Network */}
          <div className="mt-8">
            <LocalEnthusiastNetwork vehicleId={selectedVehicleId} />
          </div>
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
