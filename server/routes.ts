import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertElectionSchema, insertCandidateSchema, insertVoteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Election routes
  app.get('/api/elections', isAuthenticated, async (req: any, res) => {
    try {
      const elections = await storage.getElections();
      
      // Add user voting status for each election
      const userId = req.user.claims.sub;
      const electionsWithStatus = await Promise.all(
        elections.map(async (election) => ({
          ...election,
          userHasVoted: await storage.hasUserVoted(election.id, userId),
        }))
      );
      
      res.json(electionsWithStatus);
    } catch (error) {
      console.error("Error fetching elections:", error);
      res.status(500).json({ message: "Failed to fetch elections" });
    }
  });

  app.get('/api/elections/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const election = await storage.getElection(id);
      
      if (!election) {
        return res.status(404).json({ message: "Election not found" });
      }

      const userId = req.user.claims.sub;
      const userHasVoted = await storage.hasUserVoted(id, userId);
      
      res.json({
        ...election,
        userHasVoted,
      });
    } catch (error) {
      console.error("Error fetching election:", error);
      res.status(500).json({ message: "Failed to fetch election" });
    }
  });

  app.post('/api/elections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const electionData = insertElectionSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const election = await storage.createElection(electionData);
      res.status(201).json(election);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid election data", errors: error.errors });
      }
      console.error("Error creating election:", error);
      res.status(500).json({ message: "Failed to create election" });
    }
  });

  // Candidate routes
  app.post('/api/elections/:electionId/candidates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { electionId } = req.params;
      const candidateData = insertCandidateSchema.parse({
        ...req.body,
        electionId,
      });
      
      const candidate = await storage.createCandidate(candidateData);
      res.status(201).json(candidate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid candidate data", errors: error.errors });
      }
      console.error("Error creating candidate:", error);
      res.status(500).json({ message: "Failed to create candidate" });
    }
  });

  app.get('/api/elections/:electionId/candidates', isAuthenticated, async (req, res) => {
    try {
      const { electionId } = req.params;
      const candidates = await storage.getCandidatesByElection(electionId);
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  // Vote routes
  app.post('/api/elections/:electionId/vote', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isEligible) {
        return res.status(403).json({ message: "You are not eligible to vote" });
      }

      const { electionId } = req.params;
      const { candidateId } = req.body;
      
      // Check if election exists and is active
      const election = await storage.getElection(electionId);
      if (!election) {
        return res.status(404).json({ message: "Election not found" });
      }
      
      if (!election.isActive) {
        return res.status(400).json({ message: "Election is not active" });
      }

      // Check if voting period is valid
      const now = new Date();
      if (now < election.startDate || now > election.endDate) {
        return res.status(400).json({ message: "Voting period has ended or not started" });
      }

      const voteData = insertVoteSchema.parse({
        electionId,
        voterId: userId,
        candidateId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      const vote = await storage.castVote(voteData);
      
      res.status(201).json({
        receiptId: vote.receiptId,
        timestamp: vote.createdAt,
        electionTitle: election.title,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vote data", errors: error.errors });
      }
      if (error instanceof Error && error.message === 'User has already voted in this election') {
        return res.status(409).json({ message: error.message });
      }
      console.error("Error casting vote:", error);
      res.status(500).json({ message: "Failed to cast vote" });
    }
  });

  app.get('/api/votes/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const votes = await storage.getUserVotes(userId);
      res.json(votes);
    } catch (error) {
      console.error("Error fetching vote history:", error);
      res.status(500).json({ message: "Failed to fetch vote history" });
    }
  });

  // Results routes
  app.get('/api/elections/:electionId/results', isAuthenticated, async (req, res) => {
    try {
      const { electionId } = req.params;
      const results = await storage.getElectionResults(electionId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getElectionStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.patch('/api/elections/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { isActive } = req.body;
      
      await storage.updateElectionStatus(id, isActive);
      
      await storage.logAction({
        userId,
        action: isActive ? 'START_ELECTION' : 'END_ELECTION',
        resource: 'election',
        resourceId: id,
      });
      
      res.json({ message: "Election status updated successfully" });
    } catch (error) {
      console.error("Error updating election status:", error);
      res.status(500).json({ message: "Failed to update election status" });
    }
  });

  app.patch('/api/users/:id/eligibility', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { isEligible } = req.body;
      
      await storage.updateVoterEligibility(id, isEligible);
      
      await storage.logAction({
        userId,
        action: 'UPDATE_VOTER_ELIGIBILITY',
        resource: 'user',
        resourceId: id,
        details: { isEligible },
      });
      
      res.json({ message: "Voter eligibility updated successfully" });
    } catch (error) {
      console.error("Error updating voter eligibility:", error);
      res.status(500).json({ message: "Failed to update voter eligibility" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
