import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import NavigationHeader from "@/components/navigation-header";
import AdminDashboard from "@/components/admin-dashboard";

export default function Admin() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to home if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "Admin access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = isAuthenticated ? "/" : "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user?.isAdmin, toast]);

  if (isLoading || !isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="bg-red-600 rounded-lg p-6 text-white mb-8">
          <h1 className="text-2xl font-bold mb-2">Election Administration</h1>
          <p className="text-red-100">Manage elections, monitor voting, and ensure system integrity</p>
        </div>

        <AdminDashboard />
      </div>
    </div>
  );
}
