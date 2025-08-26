import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { Breadcrumb, useBreadcrumbs } from "@/components/breadcrumb";
import UserProfileModal from "@/components/user-profile-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Car, 
  Settings, 
  Shield, 
  Bell,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { format } from "date-fns";
import { type Vehicle } from "@shared/schema";

export default function ProfilePage() {
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const breadcrumbs = useBreadcrumbs();

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/v1/vehicles"],
  });

  const handleAddEntry = () => {
    // Placeholder for add entry functionality
  };

  if (!isAuthenticated || !user) {
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

          <Card className="text-center py-12">
            <CardContent>
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Authentication Required
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please log in to view your profile
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <AppHeader 
        onAddEntry={handleAddEntry}
      />
      
      <div className="container-responsive py-6 lg:py-8">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbs} />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24 ring-4 ring-blue-200 dark:ring-blue-700">
                    <AvatarImage src={(user as any)?.profileImageUrl || ''} alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                      {(user as any)?.firstName?.charAt(0) || (user as any)?.email?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">
                  {(user as any)?.firstName || (user as any)?.lastName 
                    ? `${(user as any)?.firstName || ''} ${(user as any)?.lastName || ''}`.trim()
                    : 'Anonymous User'
                  }
                </CardTitle>
                <CardDescription>
                  {(user as any)?.email}
                </CardDescription>
                <div className="flex justify-center gap-2 mt-4">
                  <Badge variant={(user as any)?.role === 'admin' ? 'destructive' : 'default'}>
                    {(user as any)?.role || 'User'}
                  </Badge>
                  {(user as any)?.isPublic && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      Public
                    </Badge>
                  )}
                  {!(user as any)?.isPublic && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <EyeOff className="h-3 w-3" />
                      Private
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{(user as any)?.email}</span>
                  </div>
                  
                  {(user as any)?.location && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{(user as any)?.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      Joined {format(new Date((user as any)?.createdAt || Date.now()), 'MMM yyyy')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Car className="h-4 w-4 text-gray-500" />
                    <span>{vehicles.length} Vehicle{vehicles.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setIsUserProfileModalOpen(true)}
                  className="w-full mt-6"
                  variant="outline"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your personal information and account preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      First Name
                    </label>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {(user as any)?.firstName || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name
                    </label>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {(user as any)?.lastName || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location
                    </label>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {(user as any)?.location || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Profile Visibility
                    </label>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {(user as any)?.isPublic ? 'Public' : 'Private'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>
                  Control your privacy settings and account security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Profile Visibility</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Control who can see your profile and vehicles
                      </p>
                    </div>
                    <Badge variant={(user as any)?.isPublic ? 'default' : 'secondary'}>
                      {(user as any)?.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Data Sharing</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Allow others to see your vehicle modifications
                      </p>
                    </div>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Manage how you receive notifications and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Maintenance Reminders</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified about upcoming maintenance
                      </p>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Community Updates</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive updates from the community
                      </p>
                    </div>
                    <Badge variant="outline">Disabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Transfer Requests</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Notifications for vehicle transfer requests
                      </p>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <UserProfileModal
          isOpen={isUserProfileModalOpen}
          onClose={() => setIsUserProfileModalOpen(false)}
        />
      </div>
    </div>
  );
}