import { useQuery } from "@tanstack/react-query";
import { VoteReceipt } from "@shared/schema";
import { History, CheckCircle, FileText } from "lucide-react";

export default function VotingHistory() {
  const { data: votes, isLoading } = useQuery<VoteReceipt[]>({
    queryKey: ["/api/votes/history"],
    retry: false,
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <History className="text-secondary mr-3 h-5 w-5" />
          Your Voting History
        </h2>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse p-4 bg-gray-50 rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : votes && votes.length > 0 ? (
          <div className="space-y-4">
            {votes.map((vote) => (
              <div 
                key={vote.receiptId} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                data-testid={`vote-history-${vote.receiptId}`}
              >
                <div>
                  <div className="font-medium text-gray-900" data-testid={`text-election-title-${vote.receiptId}`}>
                    {vote.electionTitle}
                  </div>
                  <div className="text-sm text-gray-600" data-testid={`text-vote-timestamp-${vote.receiptId}`}>
                    Voted on {new Date(vote.timestamp).toLocaleDateString()} at {new Date(vote.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Vote Confirmed
                  </span>
                  <button 
                    className="text-primary hover:text-indigo-600 text-sm font-medium flex items-center"
                    data-testid={`button-receipt-${vote.receiptId}`}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Receipt: {vote.receiptId}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500" data-testid="text-no-votes">
            <p>No voting history found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
