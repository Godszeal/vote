import { ElectionWithCandidates } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Calendar, Users, BarChart3, Clock } from "lucide-react";
import { Link } from "wouter";

interface ElectionCardProps {
  election: ElectionWithCandidates;
}

export default function ElectionCard({ election }: ElectionCardProps) {
  const isActive = election.isActive && new Date() >= new Date(election.startDate) && new Date() <= new Date(election.endDate);
  const isUpcoming = new Date() < new Date(election.startDate);
  const hasEnded = new Date() > new Date(election.endDate);
  
  const getStatusBadge = () => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
          Active
        </span>
      );
    }
    if (isUpcoming) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-2 h-2 text-yellow-400 mr-1" />
          Upcoming
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        
