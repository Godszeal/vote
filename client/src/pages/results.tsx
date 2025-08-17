import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/navigation-header";
import ResultsChart from "@/components/results-chart";
import { ElectionResults } from "@shared/schema";

export default function Results() {
  const { electionId } = useParams<{ electionId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: results, isLoading: resultsLoading, error } = useQuery<ElectionResults>({
    queryKey: ["/api/elections", electionId, "results"],
    retry: false,
    enabled: !!electionId && isAuthenticated,
  });

  const handleReturnToDashboard = () => {
    setLocation("/");
  };

  if (isLoading || resultsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Results Not Available</h1>
            <p className="text-gray-600 mb-6">Election results could not be loaded.</p>
            <button
              onClick={handleReturnToDashboard}
              className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-600 transition-colors"
              data-testid="button-return-dashboard"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ResultsChart results={results} onReturnToDashboard={handleReturnToDashboard} />
      </div>
    </div>
  );
}
