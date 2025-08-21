import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Settings, Bell, Shield, Car, Calendar, DollarSign, Wrench, LogOut, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
    enabled: isOpen && isAuthenticated,
  });

  const { data: totalStats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: isOpen && isAuthenticated,
  });

  if (!isAuthenticated || !user) {
    return null;
  }

  const userData = user as any;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-user-profile">
        <DialogHeader>
          <DialogTitle className="mobile-heading flex items-center space-x-3">
            <Avatar className="w-12 h-12 ring-2 ring-blue-200 dark:ring-blue-700">
              <AvatarImage src={userData?.profileImageUrl || ''} alt="Profile" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                {userData?.firstName?.charAt(0) || userData?.email?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span>
                  {userData?.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : userData?.email}
                </span>
                <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  <Crown className="w-3 h-3 mr-1" />
                  Pro User
                </Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">{userData?.email}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="card-modern">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Total Vehicles</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{vehicles.length}</p>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span>Member Since</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">
                    {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-base">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Display Name</label>
                  <p className="mt-1">
                    {userData?.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</label>
                  <p className="mt-1 font-mono text-sm">{userData?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Type</label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      <Crown className="w-3 h-3 mr-1" />
                      CarTracker Pro
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Vehicles</h3>
              <Badge variant="secondary">{vehicles.length} vehicles</Badge>
            </div>
            {vehicles.length === 0 ? (
              <div className="text-center py-8">
                <Car className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No vehicles added yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={onClose}
                >
                  Add Your First Vehicle
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicles.map((vehicle: any) => (
                  <Card key={vehicle.id} className="card-modern card-hover">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            VIN: {vehicle.vin.slice(-6)} • {vehicle.currentMileage.toLocaleString()} miles
                          </p>
                          {(vehicle.trim || vehicle.color) && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {vehicle.trim && `${vehicle.trim}`}
                              {vehicle.trim && vehicle.color && ' • '}
                              {vehicle.color}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Active
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maintenance Reminders</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about upcoming maintenance</p>
                  </div>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Community Updates</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifications from the community</p>
                  </div>
                  <Badge variant="outline">Disabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Reports</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Summary of your vehicle activities</p>
                  </div>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Public Profile</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Show your vehicles in community</p>
                  </div>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Use dark theme</p>
                  </div>
                  <Badge variant="outline">Auto</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Account Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add extra security to your account</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Active Sessions</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your login sessions</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-base text-red-600 dark:text-red-400">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Export Data</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Download all your vehicle data</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your account</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/api/logout'}
                className="touch-friendly flex items-center space-x-2"
                data-testid="button-logout-modal"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}