import { Car, Plus, Bell, Users, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import RealTimeClock from "@/components/real-time-clock";
import MobileNav from "@/components/mobile-nav";

interface HeaderProps {
  onAddEntry: () => void;
  onOpenProfile?: () => void;
}

export default function Header({ onAddEntry, onOpenProfile }: HeaderProps) {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {/* Mobile Navigation */}
            <MobileNav onAddEntry={onAddEntry} />
            
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Car className="text-white h-6 w-6 sm:h-7 sm:w-7" data-testid="logo-icon" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" data-testid="app-title">
                  CarTracker Pro
                </h1>
                <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  Automotive Excellence
                </div>
              </div>
            </div>
            <nav className="hidden lg:flex space-x-8">
              <Link 
                href="/dashboard"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 pb-4 transition-colors duration-200 relative group"
              >
                <a data-testid="nav-dashboard">
                  Dashboard
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-200 group-hover:w-full"></div>
                </a>
              </Link>
              <Link 
                href="/vehicles"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 pb-4 transition-colors duration-200 relative group"
              >
                <a data-testid="nav-vehicles">
                  Vehicles
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-200 group-hover:w-full"></div>
                </a>
              </Link>
              <Link 
                href="/maintenance"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 pb-4 transition-colors duration-200 relative group"
              >
                <a data-testid="nav-maintenance">
                  Maintenance
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-200 group-hover:w-full"></div>
                  <Badge variant="secondary" className="absolute -top-2 -right-3 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                    3
                  </Badge>
                </a>
              </Link>
              <Link 
                href="/modifications"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 pb-4 transition-colors duration-200 relative group"
              >
                <a data-testid="nav-modifications">
                  Modifications
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-200 group-hover:w-full"></div>
                </a>
              </Link>
              <Link 
                href="/community"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 pb-4 transition-colors duration-200 relative group"
              >
                <a data-testid="nav-community">
                  Community
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-200 group-hover:w-full"></div>
                  <Badge variant="default" className="absolute -top-2 -right-6 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    New
                  </Badge>
                </a>
              </Link>
              {isAuthenticated && (user as any)?.role === "admin" && (
                <Link 
                  href="/admin"
                  className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 pb-4 transition-colors duration-200 relative group"
                >
                  <a data-testid="nav-admin">
                    Admin
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all duration-200 group-hover:w-full"></div>
                    <Badge variant="destructive" className="absolute -top-2 -right-3 text-xs">
                      Admin
                    </Badge>
                  </a>
                </Link>
              )}
              <Link href="/profile">
                <a 
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 pb-4 transition-colors duration-200 relative group"
                  data-testid="nav-profile"
                >
                  Profile
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-200 group-hover:w-full"></div>
                </a>
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden xl:block">
              <RealTimeClock variant="header" />
            </div>
            
            <Button 
              onClick={onAddEntry}
              className="hidden sm:flex btn-primary shadow-lg hover:shadow-xl transition-all duration-300"
              data-testid="button-add-entry"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Add Entry</span>
              <span className="md:hidden">Add</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                3
              </Badge>
            </Button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button 
                  onClick={onOpenProfile}
                  className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                  data-testid="button-profile"
                >
                  <Avatar className="w-8 h-8 sm:w-9 sm:h-9 ring-2 ring-blue-200 dark:ring-blue-700 transition-all duration-200 hover:ring-4 cursor-pointer">
                    <AvatarImage src={(user as any)?.profileImageUrl || ''} alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                      {(user as any)?.firstName?.charAt(0) || (user as any)?.email?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                </button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.location.href = '/api/logout'}
                  className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Logout</span>
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                className="flex bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 shadow-lg"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-login-header"
              >
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
