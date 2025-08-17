import { useState } from "react";
import { ElectionWithCandidates, Candidate } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Info, Clock } from "lucide-react";

interface BallotInterfaceProps {
  election: ElectionWithCandidates;
  selectedCandidate: string;
  onCandidateSelect: (candidateId: string) => void;
  onVoteSubmit: () => void;
  onReturnToDashboard: () => void;
  isSubmitting: boolean;
}

export default function BallotInterface({
  election,
  selectedCandidate,
  onCandidateSelect,
  onVoteSubmit,
  onReturnToDashboard,
  isSubmitting,
}: BallotInterfaceProps) {
  const [step, setStep] = useState(1);
  const maxSteps = 3;

  const timeRemaining = () => {
    const now = new Date();
    const endDate = new Date(election.endDate);
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return "Election ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  const handleContinueToReview = () => {
    
