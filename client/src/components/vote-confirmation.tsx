import { VoteReceipt } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { CheckCircle, Receipt, Download, Shield, AlertTriangle } from "lucide-react";

interface VoteConfirmationProps {
  receipt: VoteReceipt;
  onReturnToDashboard: () => void;
}

export default function VoteConfirmation({ receipt, onReturnToDashboard }: VoteConfirmationProps) {
  const handleDownloadReceipt = () => {
    const receiptData = {
      receiptId: receipt.receiptId,
      election: receipt.electionTitle,
      timestamp: receipt.timestamp,
      status: "Encrypted & Verified"
    };
    
    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vote-receipt-${receipt.receiptId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Confirmation Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-2xl text-success h-8 w-8" />
            
