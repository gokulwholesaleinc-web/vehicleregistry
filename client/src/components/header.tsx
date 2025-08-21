import { Car, Plus, Bell, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import RealTimeClock from "@/components/real-time-clock";

interface HeaderProps {
  onAddEntry: () => void;
}

export default function Header({ onAddEntry }: HeaderProps) {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Car className="text-automotive-blue-600 h-8 w-8" data-testid="logo-icon" />
              <h1 className="text-xl font-bold text-gray-900" data-testid="app-title">
                CarTracker Pro
              </h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a 
                href="#" 
                className="text-automotive-blue-600 font-medium border-b-2 border-automotive-blue-600 pb-4"
                data-testid="nav-dashboard"
              >
                Dashboard
              </a>
              <a 
                href="#" 
                className="text-steel-gray-600 hover:text-automotive-blue-600 pb-4"
                data-testid="nav-vehicles"
              >
                Vehicles
              </a>
              <a 
                href="#" 
                className="text-steel-gray-600 hover:text-automotive-blue-600 pb-4"
                data-testid="nav-maintenance"
              >
                Maintenance
              </a>
              <a 
                href="#" 
                className="text-steel-gray-600 hover:text-automotive-blue-600 pb-4"
                data-testid="nav-modifications"
              >
                Modifications
              </a>
              <Link 
                href="/community"
                className="text-steel-gray-600 hover:text-automotive-blue-600 pb-4"
              >
                <a data-testid="nav-community">Community</a>
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden lg:block">
              <RealTimeClock variant="header" />
            </div>
            <Button 
              onClick={onAddEntry}
              className="bg-automotive-blue-600 text-white hover:bg-automotive-blue-700"
              data-testid="button-add-entry"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="h-5 w-5 text-steel-gray-600" />
            </Button>
            {isAuthenticated && (
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profileImageUrl || ''} alt="Profile" />
                  <AvatarFallback>
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.location.href = '/api/logout'}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
