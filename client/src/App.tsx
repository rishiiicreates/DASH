import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import ApiSetup from "@/pages/ApiSetup";
import Subscription from "@/pages/Subscription";
import Settings from "@/pages/Settings";
import Auth from "@/pages/Auth";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "./lib/context";

function Router() {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/" component={Auth} />
        <Route path="*" component={() => <Auth />} />
      </Switch>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 z-50 p-4 lg:hidden">
        <button 
          type="button" 
          id="mobileMenuButton" 
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={() => {
            const sidebar = document.getElementById('sidebar');
            const isOpen = sidebar?.classList.contains('translate-x-0');
            
            if (isOpen) {
              sidebar?.classList.remove('translate-x-0');
              sidebar?.classList.add('-translate-x-full');
            } else {
              sidebar?.classList.remove('-translate-x-full');
              sidebar?.classList.add('translate-x-0');
            }
          }}
        >
          <span className="material-icons">menu</span>
        </button>
      </div>

      <Sidebar />

      <main className="flex-1 ml-0 lg:ml-64 transition-all duration-300 ease-in-out">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/api-setup" component={ApiSetup} />
          <Route path="/subscription" component={Subscription} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
