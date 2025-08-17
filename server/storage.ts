import {
  users,
  elections,
  candidates,
  votes,
  auditLogs,
  type User,
  type UpsertUser,
  type Election,
  type InsertElection,
  type Candidate,
  type InsertCandidate,
  type Vote,
  type InsertVote,
  type InsertAuditLog,
  type ElectionWithCandidates,
  type CandidateWithVotes,
  type ElectionResults,
  type VoteReceipt,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql, asc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Election operations
  createElection(election: InsertElection): Promise<Election>;
  getElections(): Promise<ElectionWithCandidates[]>;
  getElection(id: string): Promise<ElectionWithCandidates | undefined>;
  updateElectionStatus(id: string, isActive: boolean): Promise<void>;
  
  // Candidate operations
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  getCandidatesByElection(electionId: string): Promise<Candidate[]>;
  
  // Vote operations
  castVote(vote: InsertVote): Promise<Vote>;
  hasUserVoted(electionId: string, voterId: string): Promise<boolean>;
  getVotesByElection(electionId: string): Promise<Vote[]>;
  getUserVotes(voterId: string): Promise<VoteReceipt[]>;
  
  // Results operations
  getElectionResults(electionId: string): Promise<ElectionResults>;
  
  // Admin operations
  getElectionStats(): Promise<{
    totalVoters: number;
    totalElections: number;
    activeElections: number;
    totalVotes: number;
  }>;
  
  // Audit operations
  logAction(log: InsertAuditLog): Promise<void>;
  
  // Voter management
  updateVoterEligibility(userId: string, isEligible: boolean): Promise<void>;
  generateVoterId(userId: string): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        voterId: userData.voterId || await this.generateVoterId(userData.id!),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Election operations
  async createElection(electionData: InsertElection): Promise<Election> {
    const [election] = await db
      .insert(elections)
      .values(electionData)
      .returning();
    
    await this.logAction({
      userId: electionData.createdBy,
      action: 'CREATE_ELECTION',
      resource: 'election',
      resourceId: election.id,
      details: { title: election.title },
    });
    
    return election;
  }

  async getElections(): Promise<ElectionWithCandidates[]> {
    const electionResults = await db
      .select({
        election: elections,
        candidate: candidates,
        voteCount: count(votes.id),
      })
      .from(elections)
      .leftJoin(candidates, eq(elections.id, candidates.electionId))
      .leftJoin(votes, eq(candidates.id, votes.candidateId))
      .groupBy(elections.id, candidates.id)
      .orderBy(desc(elections.createdAt), asc(candidates.orderIndex));

    const groupedElections = new Map<string, ElectionWithCandidates>();
    
    for (const row of electionResults) {
      const electionId = row.election.id;
      
      if (!groupedElections.has(electionId)) {
        groupedElections.set(electionId, {
          ...row.election,
          candidates: [],
          totalVotes: 0,
        });
      }
      
      const election = groupedElections.get(electionId)!;
      
      if (row.candidate) {
        election.candidates.push(row.candidate);
        election.totalVotes = (election.totalVotes || 0) + Number(row.voteCount);
      }
    }
    
    return Array.from(groupedElections.values());
  }

  async getElection(id: string): Promise<ElectionWithCandidates | undefined> {
    const [election] = await db
      .select()
      .from(elections)
      .where(eq(elections.id, id));
    
    if (!election) return undefined;
    
    const electionCandidates = await this.getCandidatesByElection(id);
    const totalVotes = await this.getTotalVotesForElection(id);
    
    return {
      ...election,
      candidates: electionCandidates,
      totalVotes,
    };
  }

  async updateElectionStatus(id: string, isActive: boolean): Promise<void> {
    await db
      .update(elections)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(elections.id, id));
  }

  // Candidate operations
  async createCandidate(candidateData: InsertCandidate): Promise<Candidate> {
    const [candidate] = await db
      .insert(candidates)
      .values(candidateData)
      .returning();
    return candidate;
  }

  async getCandidatesByElection(electionId: string): Promise<Candidate[]> {
    return await db
      .select()
      .from(candidates)
      .where(eq(candidates.electionId, electionId))
      .orderBy(asc(candidates.orderIndex));
  }

  // Vote operations
  async castVote(voteData: InsertVote): Promise<Vote> {
    // Check if user has already voted
    const hasVoted = await this.hasUserVoted(voteData.electionId, voteData.voterId);
    if (hasVoted) {
      throw new Error('User has already voted in this election');
    }

    // Generate receipt ID
    const receiptId = `VR-${new Date().getFullYear()}-${randomUUID().substring(0, 8).toUpperCase()}`;
    
    const [vote] = await db
      .insert(votes)
      .values({
        ...voteData,
        receiptId,
      })
      .returning();

    await this.logAction({
      userId: voteData.voterId,
      action: 'CAST_VOTE',
      resource: 'vote',
      resourceId: vote.id,
      details: { 
        electionId: voteData.electionId,
        receiptId: vote.receiptId,
      },
      ipAddress: voteData.ipAddress,
      userAgent: voteData.userAgent,
    });

    return vote;
  }

  async hasUserVoted(electionId: string, voterId: string): Promise<boolean> {
    const [vote] = await db
      .select()
      .from(votes)
      .where(and(
        eq(votes.electionId, electionId),
        eq(votes.voterId, voterId)
      ));
    
    return !!vote;
  }

  async getVotesByElection(electionId: string): Promise<Vote[]> {
    return await db
      .select()
      .from(votes)
      .where(eq(votes.electionId, electionId));
  }

  async getUserVotes(voterId: string): Promise<VoteReceipt[]> {
    const userVotes = await db
      .select({
        receiptId: votes.receiptId,
        electionTitle: elections.title,
        timestamp: votes.createdAt,
      })
      .from(votes)
      .innerJoin(elections, eq(votes.electionId, elections.id))
      .where(eq(votes.voterId, voterId))
      .orderBy(desc(votes.createdAt));

    return userVotes.map(vote => ({
      ...vote,
      timestamp: vote.timestamp!,
      confirmed: true,
    }));
  }

  // Results operations
  async getElectionResults(electionId: string): Promise<ElectionResults> {
    const election = await this.getElection(electionId);
    if (!election) {
      throw new Error('Election not found');
    }

    const candidateVotes = await db
      .select({
        candidate: candidates,
        voteCount: count(votes.id),
      })
      .from(candidates)
      .leftJoin(votes, eq(candidates.id, votes.candidateId))
      .where(eq(candidates.electionId, electionId))
      .groupBy(candidates.id)
      .orderBy(desc(count(votes.id)));

    const totalVotes = candidateVotes.reduce((sum, cv) => sum + Number(cv.voteCount), 0);
    const eligibleVoters = await this.getEligibleVoterCount();

    const candidatesWithVotes: CandidateWithVotes[] = candidateVotes.map(cv => ({
      ...cv.candidate,
      voteCount: Number(cv.voteCount),
      percentage: totalVotes > 0 ? (Number(cv.voteCount) / totalVotes) * 100 : 0,
    }));

    return {
      election,
      candidates: candidatesWithVotes,
      totalVotes,
      eligibleVoters,
      turnoutPercentage: eligibleVoters > 0 ? (totalVotes / eligibleVoters) * 100 : 0,
    };
  }

  // Admin operations
  async getElectionStats() {
    const [voterCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isEligible, true));

    const [electionCount] = await db
      .select({ count: count() })
      .from(elections);

    const [activeElectionCount] = await db
      .select({ count: count() })
      .from(elections)
      .where(eq(elections.isActive, true));

    const [voteCount] = await db
      .select({ count: count() })
      .from(votes);

    return {
      totalVoters: voterCount.count,
      totalElections: electionCount.count,
      activeElections: activeElectionCount.count,
      totalVotes: voteCount.count,
    };
  }

  // Audit operations
  async logAction(logData: InsertAuditLog): Promise<void> {
    await db.insert(auditLogs).values(logData);
  }

  // Voter management
  async updateVoterEligibility(userId: string, isEligible: boolean): Promise<void> {
    await db
      .update(users)
      .set({ isEligible, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async generateVoterId(userId: string): Promise<string> {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `STU-${year}-${random}`;
  }

  // Helper methods
  private async getTotalVotesForElection(electionId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(votes)
      .where(eq(votes.electionId, electionId));
    
    return result.count;
  }

  private async getEligibleVoterCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isEligible, true));
    
    return result.count;
  }
}

export const storage = new DatabaseStorage();
