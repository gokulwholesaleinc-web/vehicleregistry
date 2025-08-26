import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";
import SignIn from "@/pages/signin";
import Register from "@/pages/register";
import PrivacyPolicy from "@/pages/privacy-policy";
import Community from "@/pages/community";
import AdminDashboard from "@/pages/admin";
import VehiclesPage from "@/pages/vehicles";
import VehicleDetailPage from "@/pages/vehicle-detail";
import MaintenancePage from "@/pages/maintenance";
import ModificationsPage from "@/pages/modifications";
import ProfilePage from "@/pages/profile";
import ShowcasePage from "@/pages/showcase";
import Notifications from "@/pages/notifications";
import ShowcaseManager from "@/pages/admin/ShowcaseManager";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/signin" component={SignIn} />
          <Route path="/register" component={Register} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/vehicles" component={VehiclesPage} />
          <Route path="/vehicles/:id" component={VehicleDetailPage} />
          <Route path="/maintenance" component={MaintenancePage} />
          <Route path="/modifications" component={ModificationsPage} />
          <Route path="/community" component={Community} />
          <Route path="/showcase" component={ShowcasePage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/showcase" component={ShowcaseManager} />
          <Route path="/signin" component={SignIn} />
          <Route path="/register" component={Register} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
