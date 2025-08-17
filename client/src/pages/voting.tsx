import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import NavigationHeader from "@/components/navigation-header";
import BallotInterface from "@/components/ballot-interface";
import VoteConfirmation from "@/components/vote-confirmation";
import { ElectionWithCandidates, VoteReceipt } from "@shared/schema";

export default function Voting() {
  const { electionId } = useParams<{ electionId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [voteReceipt, setVoteReceipt] = useState<VoteReceipt | null>(null);

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

  const { data: election, isLoading: electionLoading, error } = useQuery<ElectionWithCandidates>({
    queryKey: ["/api/elections", electionId],
    retry: false,
    enabled: !!electionId && isAuthenticated,
  });

  const voteMutation = useMutation({
    mutationFn: async (candidateId: string) => {
      const response = await apiRequest(
        "POST",
        `/api/elections/${electionId}/vote`,
        { candidateId }
      );
      return response.json();
    },
    onSuccess: (receipt) => {
      setVoteReceipt(receipt);
      setVoteSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/elections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/votes/history"] });
      toast({
        title: "Vote Submitted",
        description: "Your vote has been successfully recorded.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Vote Failed",
        description: error.message || "Failed to submit vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVoteSubmit = () => {
    if (!selectedCandidate) {
      toast({
        title: "No Selection",
        description: "Please select a candidate before submitting your vote.",
        variant: "destructive",
      });
      return;
    }

    voteMutation.mutate(selectedCandidate);
  };

  const handleReturnToDashboard = () => {
    setLocation("/");
  };

  if (isLoading || electionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading election...</p>
        </div>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Election Not Found</h1>
            <p className="text-gray-600 mb-6">The requested election could not be found.</p>
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

  if (election.userHasVoted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-check text-2xl text-success"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Already Voted</h1>
            <p className="text-gray-600 mb-6">You have already cast your vote in this election.</p>
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
        {voteSubmitted && voteReceipt ? (
          <VoteConfirmation 
            receipt={voteReceipt} 
            onReturnToDashboard={handleReturnToDashboard}
          />
        ) : (
          <BallotInterface
            election={election}
            selectedCandidate={selectedCandidate}
            onCandidateSelect={setSelectedCandidate}
            onVoteSubmit={handleVoteSubmit}
            onReturnToDashboard={handleReturnToDashboard}
            isSubmitting={voteMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}
