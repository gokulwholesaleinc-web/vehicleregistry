import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Menu, 
  Car, 
  User, 
  Settings, 
  LogOut, 
  Plus, 
  Home, 
  Wrench, 
  Users, 
  Bell,
  Clock,
  Sparkles,
  Globe
} from "lucide-react";
import RealTimeClock from "@/components/real-time-clock";

interface MobileNavProps {
  onAddEntry: () => void;
}

export default function MobileNav({ onAddEntry }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleClose = () => setIsOpen(false);

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/", badge: null },
    { icon: Car, label: "Vehicles", href: "/vehicles", badge: null },
    { icon: Wrench, label: "Maintenance", href: "/maintenance", badge: "3" },
    { icon: Settings, label: "Modifications", href: "/modifications", badge: null },
    { icon: Users, label: "Community", href: "/community", badge: "New" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          data-testid="button-mobile-menu"
        >
          <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="left" 
        className="w-[300px] bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-blue-900 border-r border-blue-100 dark:border-blue-800 p-0"
      >
        <SheetHeader className="p-6 pb-4 border-b border-blue-100 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CarTracker Pro
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-600 dark:text-gray-400">
                Your automotive companion
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {/* User Profile Section */}
          {isAuthenticated ? (
            <div className="p-6 border-b border-blue-100 dark:border-blue-800">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-12 w-12 ring-2 ring-blue-200 dark:ring-blue-700">
                  <AvatarImage src={(user as any)?.profileImageUrl || ''} alt="Profile" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {(user as any)?.firstName?.charAt(0) || (user as any)?.email?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {(user as any)?.firstName || 'Welcome'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {(user as any)?.email || 'Car Enthusiast'}
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">2</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Vehicles</div>
                </div>
                <div className="text-center p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="text-lg font-bold text-green-600">15</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Mods</div>
                </div>
                <div className="text-center p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">8</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Records</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 border-b border-blue-100 dark:border-blue-800">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Welcome to CarTracker</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sign up to get started</p>
                </div>
                <Button 
                  className="w-full btn-primary"
                  onClick={() => {
                    window.location.href = '/api/login';
                    handleClose();
                  }}
                  data-testid="button-mobile-signup"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Quick Sign Up
                </Button>
              </div>
            </div>
          )}

          {/* Real-time Clock */}
          <div className="p-6 border-b border-blue-100 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Time</span>
            </div>
            <RealTimeClock variant="mobile" />
          </div>

          {/* Navigation Items */}
          <nav className="p-6 space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a 
                  onClick={handleClose}
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-200 group"
                  data-testid={`nav-mobile-${item.label.toLowerCase()}`}
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                    <item.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.label}
                  </span>
                  {item.badge && (
                    <Badge 
                      variant={item.badge === "New" ? "default" : "secondary"} 
                      className="ml-auto text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </a>
              </Link>
            ))}
          </nav>

          {/* Quick Actions */}
          {isAuthenticated && (
            <div className="p-6 border-t border-blue-100 dark:border-blue-800 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                Quick Actions
              </h3>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => {
                    onAddEntry();
                    handleClose();
                  }}
                  className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  data-testid="button-mobile-add-entry"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-mobile-notifications"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                  <Badge variant="destructive" className="ml-auto">3</Badge>
                </Button>
              </div>
            </div>
          )}

          {/* Account Actions */}
          {isAuthenticated && (
            <div className="p-6 border-t border-blue-100 dark:border-blue-800 space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-gray-50 dark:hover:bg-gray-800"
                data-testid="button-mobile-settings"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                onClick={() => {
                  window.location.href = '/api/logout';
                  handleClose();
                }}
                data-testid="button-mobile-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}