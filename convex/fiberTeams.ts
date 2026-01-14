import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all fiber teams
export const listFiberTeams = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let teams;

    if (args.status) {
      teams = await ctx.db
        .query("fiberTeams")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    } else {
      teams = await ctx.db.query("fiberTeams").collect();
    }

    // Enrich with project names
    const enrichedTeams = await Promise.all(
      teams.map(async (team) => {
        let projectName = null;
        if (team.currentAssignment?.projectId) {
          const project = await ctx.db.get(team.currentAssignment.projectId);
          projectName = project?.projectName || null;
        }

        const creator = await ctx.db.get(team.createdBy);

        return {
          ...team,
          projectName,
          creatorName: creator?.fullName || "Unknown",
        };
      })
    );

    return enrichedTeams;
  },
});

// Get fiber team by ID
export const getFiberTeamById = query({
  args: { teamId: v.id("fiberTeams") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) return null;

    let projectName = null;
    if (team.currentAssignment?.projectId) {
      const project = await ctx.db.get(team.currentAssignment.projectId);
      projectName = project?.projectName || null;
    }

    const creator = await ctx.db.get(team.createdBy);

    return {
      ...team,
      projectName,
      creatorName: creator?.fullName || "Unknown",
    };
  },
});

// Create fiber team
export const createFiberTeam = mutation({
  args: {
    teamName: v.string(),
    teamLead: v.string(),
    members: v.array(v.string()),
    status: v.union(
      v.literal("Available"),
      v.literal("Assigned"),
      v.literal("On Leave"),
      v.literal("Inactive")
    ),
    currentAssignment: v.optional(v.object({
      projectId: v.optional(v.id("projects")),
      location: v.optional(v.string()),
      taskDescription: v.optional(v.string()),
      assignmentDate: v.optional(v.string()),
      expectedCompletionDate: v.optional(v.string()),
    })),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const teamId = await ctx.db.insert("fiberTeams", {
      teamName: args.teamName,
      teamLead: args.teamLead,
      members: args.members,
      status: args.status,
      currentAssignment: args.currentAssignment,
      createdBy: args.createdBy,
    });
    return teamId;
  },
});

// Update fiber team
export const updateFiberTeam = mutation({
  args: {
    teamId: v.id("fiberTeams"),
    teamName: v.optional(v.string()),
    teamLead: v.optional(v.string()),
    members: v.optional(v.array(v.string())),
    status: v.optional(v.union(
      v.literal("Available"),
      v.literal("Assigned"),
      v.literal("On Leave"),
      v.literal("Inactive")
    )),
    currentAssignment: v.optional(v.object({
      projectId: v.optional(v.id("projects")),
      location: v.optional(v.string()),
      taskDescription: v.optional(v.string()),
      assignmentDate: v.optional(v.string()),
      expectedCompletionDate: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const { teamId, ...updates } = args;
    const existing = await ctx.db.get(teamId);
    if (!existing) throw new Error("Fiber team not found");

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(teamId, filteredUpdates);
    return teamId;
  },
});

// Delete fiber team
export const deleteFiberTeam = mutation({
  args: { teamId: v.id("fiberTeams") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.teamId);
  },
});

// Assign team to project/location
export const assignTeam = mutation({
  args: {
    teamId: v.id("fiberTeams"),
    projectId: v.optional(v.id("projects")),
    location: v.optional(v.string()),
    taskDescription: v.optional(v.string()),
    assignmentDate: v.optional(v.string()),
    expectedCompletionDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { teamId, ...assignmentData } = args;
    const existing = await ctx.db.get(teamId);
    if (!existing) throw new Error("Fiber team not found");

    await ctx.db.patch(teamId, {
      status: "Assigned",
      currentAssignment: {
        projectId: assignmentData.projectId,
        location: assignmentData.location,
        taskDescription: assignmentData.taskDescription,
        assignmentDate: assignmentData.assignmentDate,
        expectedCompletionDate: assignmentData.expectedCompletionDate,
      },
    });
    return teamId;
  },
});

// Clear team assignment (make available)
export const clearAssignment = mutation({
  args: { teamId: v.id("fiberTeams") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.teamId);
    if (!existing) throw new Error("Fiber team not found");

    await ctx.db.patch(args.teamId, {
      status: "Available",
      currentAssignment: undefined,
    });
    return args.teamId;
  },
});

// Get fiber team stats
export const getFiberTeamStats = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("fiberTeams").collect();

    const byStatus = teams.reduce((acc, team) => {
      acc[team.status] = (acc[team.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalMembers = teams.reduce((sum, team) => sum + team.members.length, 0);

    return {
      totalTeams: teams.length,
      byStatus,
      totalMembers,
      availableTeams: byStatus["Available"] || 0,
      assignedTeams: byStatus["Assigned"] || 0,
    };
  },
});
