import { useState } from "react";
import Header from "@/components/header";
import { Breadcrumb, useBreadcrumbs } from "@/components/breadcrumb";
import VehicleSelector from "@/components/vehicle-selector";
import MaintenanceTimeline from "@/components/maintenance-timeline";
import UpcomingMaintenance from "@/components/upcoming-maintenance";
import AddEntryModal from "@/components/add-entry-modal";
import VehicleDetailsModal from "@/components/vehicle-details-modal";
import UserProfileModal from "@/components/user-profile-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Wrench, AlertTriangle, CheckCircle } from "lucide-react";

export default function MaintenancePage() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [isVehicleDetailsModalOpen, setIsVehicleDetailsModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const breadcrumbs = useBreadcrumbs();

  const handleAddEntry = () => {
    setIsAddEntryModalOpen(true);
  };

  if (!selectedVehicleId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Header 
          onAddEntry={handleAddEntry}
          onOpenProfile={() => setIsUserProfileModalOpen(true)}
        />
        
        <div className="container-responsive py-6 lg:py-8">
          <div className="mb-6">
            <Breadcrumb items={breadcrumbs} />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Maintenance Center</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track service records, schedule maintenance, and monitor vehicle health
            </p>
          </div>

          <div className="space-y-6">
            <VehicleSelector 
              selectedVehicleId={selectedVehicleId}
              onVehicleSelect={setSelectedVehicleId}
              onOpenVehicleDetails={() => setIsVehicleDetailsModalOpen(true)}
            />

            <Card className="text-center py-12">
              <CardContent>
                <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Select a vehicle to view maintenance
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a vehicle from the selector above to access maintenance records and scheduling
                </p>
              </CardContent>
            </Card>
          </div>

          <VehicleDetailsModal 
            isOpen={isVehicleDetailsModalOpen}
            onClose={() => setIsVehicleDetailsModalOpen(false)}
            vehicleId={selectedVehicleId}
          />

          <UserProfileModal
            isOpen={isUserProfileModalOpen}
            onClose={() => setIsUserProfileModalOpen(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <Header 
        onAddEntry={handleAddEntry}
        onOpenProfile={() => setIsUserProfileModalOpen(true)}
      />
      
      <div className="container-responsive py-6 lg:py-8">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbs} />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Maintenance Center</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track service records, schedule maintenance, and monitor vehicle health
          </p>
        </div>

        <div className="space-y-6">
          <VehicleSelector 
            selectedVehicleId={selectedVehicleId}
            onVehicleSelect={setSelectedVehicleId}
            onOpenVehicleDetails={() => setIsVehicleDetailsModalOpen(true)}
          />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">2</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Due Soon</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">3</p>
                  </div>
                  <CalendarDays className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">8</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Records</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">13</p>
                  </div>
                  <Wrench className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Maintenance Timeline</span>
                    <Badge variant="outline">Recent Activity</Badge>
                  </CardTitle>
                  <CardDescription>
                    Complete history of all maintenance and service records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MaintenanceTimeline vehicleId={selectedVehicleId} />
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Upcoming Maintenance</span>
                    <Badge variant="secondary">3 items</Badge>
                  </CardTitle>
                  <CardDescription>
                    Scheduled services and recommended maintenance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UpcomingMaintenance vehicleId={selectedVehicleId} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <AddEntryModal 
          isOpen={isAddEntryModalOpen}
          onClose={() => setIsAddEntryModalOpen(false)}
          vehicleId={selectedVehicleId}
          entryType="maintenance"
          onEntryTypeChange={() => {}}
        />

        <VehicleDetailsModal 
          isOpen={isVehicleDetailsModalOpen}
          onClose={() => setIsVehicleDetailsModalOpen(false)}
          vehicleId={selectedVehicleId}
        />

        <UserProfileModal
          isOpen={isUserProfileModalOpen}
          onClose={() => setIsUserProfileModalOpen(false)}
        />
      </div>
    </div>
  );
}