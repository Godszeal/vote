import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import NavigationHeader from "@/components/navigation-header";
import SecurityStatus from "@/components/security-status";
import ElectionCard from "@/components/election-card";
import VotingHistory from "@/components/voting-history";
import { ElectionWithCandidates } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: elections, isLoading: electionsLoading } = useQuery<ElectionWithCandidates[]>({
    queryKey: ["/api/elections"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
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
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-lg p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome to Student Elections 2024</h1>
              <p className="text-indigo-100">Your vote matters. Make it count in a secure, transparent environment.</p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Voter ID</div>
              <div className="text-lg font-semibold" data-testid="text-voter-id">{user?.voterId}</div>
            </div>
          </div>
        </div>

        {/* Security Status */}
        <SecurityStatus user={user} />

        {/* Available Elections */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <i className="fas fa-ballot-check text-primary mr-3"></i>
              Available Elections
            </h2>
            <p className="text-sm text-gray-600 mt-1">Click on any election to view details and cast your vote</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {electionsLoading ? (
              <div className="p-6 text-center">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : elections && elections.length > 0 ? (
              elections.map((election) => (
                <ElectionCard key={election.id} election={election} />
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>No elections available at this time.</p>
              </div>
            )}
          </div>
        </div>

        {/* Voting History */}
        <VotingHistory />
      </div>
    </div>
  );
}
