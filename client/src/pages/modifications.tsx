import { useState } from "react";
import Header from "@/components/header";
import { Breadcrumb, useBreadcrumbs } from "@/components/breadcrumb";
import VehicleSelector from "@/components/vehicle-selector";
import RecentModifications from "@/components/recent-modifications";
import PhotoGallery from "@/components/photo-gallery";
import AddEntryModal from "@/components/add-entry-modal";
import VehicleDetailsModal from "@/components/vehicle-details-modal";
import UserProfileModal from "@/components/user-profile-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, DollarSign, Calendar, TrendingUp, Plus } from "lucide-react";

export default function ModificationsPage() {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Modifications & Upgrades</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track performance upgrades, aesthetic modifications, and custom work
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
                <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Select a vehicle to view modifications
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a vehicle from the selector above to track modifications and upgrades
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Modifications & Upgrades</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track performance upgrades, aesthetic modifications, and custom work
              </p>
            </div>
            <Button onClick={handleAddEntry} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Modification
            </Button>
          </div>
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Mods</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</p>
                  </div>
                  <Settings className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Investment</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">$8,450</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Performance</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">+15%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Modifications</span>
                    <Badge variant="outline">Latest Updates</Badge>
                  </CardTitle>
                  <CardDescription>
                    Track all performance and aesthetic modifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentModifications vehicleId={selectedVehicleId} />
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Photo Gallery</span>
                    <Badge variant="secondary">24 photos</Badge>
                  </CardTitle>
                  <CardDescription>
                    Before and after shots of your modifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PhotoGallery vehicleId={selectedVehicleId} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Modification Categories</CardTitle>
              <CardDescription>
                Browse modifications by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { name: "Engine", count: 4, color: "bg-red-100 text-red-700" },
                  { name: "Exhaust", count: 2, color: "bg-orange-100 text-orange-700" },
                  { name: "Suspension", count: 3, color: "bg-blue-100 text-blue-700" },
                  { name: "Wheels", count: 1, color: "bg-green-100 text-green-700" },
                  { name: "Interior", count: 2, color: "bg-purple-100 text-purple-700" },
                  { name: "Exterior", count: 0, color: "bg-gray-100 text-gray-700" }
                ].map((category) => (
                  <Card key={category.name} className="text-center cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center mx-auto mb-2`}>
                        <span className="font-bold">{category.count}</span>
                      </div>
                      <p className="font-medium">{category.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <AddEntryModal 
          isOpen={isAddEntryModalOpen}
          onClose={() => setIsAddEntryModalOpen(false)}
          vehicleId={selectedVehicleId}
          entryType="modification"
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