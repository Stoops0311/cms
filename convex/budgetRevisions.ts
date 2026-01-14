import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all budget revisions with optional filters
export const listBudgetRevisions = query({
  args: {
    status: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    let revisions;

    if (args.status) {
      revisions = await ctx.db
        .query("budgetRevisions")
        .withIndex("by_status", (q) => q.eq("status", args.status as "Pending" | "Approved" | "Rejected"))
        .collect();
    } else if (args.projectId) {
      revisions = await ctx.db
        .query("budgetRevisions")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .collect();
    } else {
      revisions = await ctx.db.query("budgetRevisions").collect();
    }

    // Enrich with user and project names
    const enrichedRevisions = await Promise.all(
      revisions.map(async (revision) => {
        const requester = await ctx.db.get(revision.requestedBy);
        const approver = revision.approvedBy ? await ctx.db.get(revision.approvedBy) : null;
        const project = await ctx.db.get(revision.projectId);

        return {
          ...revision,
          requesterName: requester?.fullName || "Unknown",
          approverName: approver?.fullName || null,
          projectName: project?.projectName || "Unknown",
        };
      })
    );

    return enrichedRevisions;
  },
});

// Get a single budget revision by ID
export const getBudgetRevisionById = query({
  args: { id: v.id("budgetRevisions") },
  handler: async (ctx, args) => {
    const revision = await ctx.db.get(args.id);
    if (!revision) return null;

    const requester = await ctx.db.get(revision.requestedBy);
    const approver = revision.approvedBy ? await ctx.db.get(revision.approvedBy) : null;
    const project = await ctx.db.get(revision.projectId);

    return {
      ...revision,
      requesterName: requester?.fullName || "Unknown",
      approverName: approver?.fullName || null,
      projectName: project?.projectName || "Unknown",
    };
  },
});

// Create a new budget revision request
export const createBudgetRevision = mutation({
  args: {
    projectId: v.id("projects"),
    requestedBy: v.id("users"),
    currentBudget: v.number(),
    proposedBudget: v.number(),
    reason: v.string(),
    impactAnalysis: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const revisionAmount = args.proposedBudget - args.currentBudget;

    const revisionId = await ctx.db.insert("budgetRevisions", {
      ...args,
      revisionAmount,
      status: "Pending",
      approvedBy: undefined,
      approvalNotes: undefined,
    });
    return revisionId;
  },
});

// Update a budget revision
export const updateBudgetRevision = mutation({
  args: {
    id: v.id("budgetRevisions"),
    currentBudget: v.optional(v.number()),
    proposedBudget: v.optional(v.number()),
    reason: v.optional(v.string()),
    impactAnalysis: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Budget revision not found");

    // Recalculate revision amount if budgets are being updated
    let revisionAmount = existing.revisionAmount;
    if (updates.currentBudget !== undefined || updates.proposedBudget !== undefined) {
      const currentBudget = updates.currentBudget ?? existing.currentBudget;
      const proposedBudget = updates.proposedBudget ?? existing.proposedBudget;
      revisionAmount = proposedBudget - currentBudget;
    }

    await ctx.db.patch(id, { ...updates, revisionAmount });
    return id;
  },
});

// Approve a budget revision
export const approveBudgetRevision = mutation({
  args: {
    id: v.id("budgetRevisions"),
    approvedBy: v.id("users"),
    approvalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Budget revision not found");

    await ctx.db.patch(args.id, {
      status: "Approved",
      approvedBy: args.approvedBy,
      approvalNotes: args.approvalNotes,
    });

    // Optionally update the project's budget
    const project = await ctx.db.get(existing.projectId);
    if (project) {
      await ctx.db.patch(existing.projectId, {
        budgetAllocation: existing.proposedBudget.toString(),
      });
    }

    return args.id;
  },
});

// Reject a budget revision
export const rejectBudgetRevision = mutation({
  args: {
    id: v.id("budgetRevisions"),
    approvedBy: v.id("users"),
    approvalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Budget revision not found");

    await ctx.db.patch(args.id, {
      status: "Rejected",
      approvedBy: args.approvedBy,
      approvalNotes: args.approvalNotes,
    });
    return args.id;
  },
});

// Delete a budget revision
export const deleteBudgetRevision = mutation({
  args: { id: v.id("budgetRevisions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Get budget revision stats
export const getBudgetRevisionStats = query({
  args: {},
  handler: async (ctx) => {
    const allRevisions = await ctx.db.query("budgetRevisions").collect();

    const stats = {
      total: allRevisions.length,
      pending: allRevisions.filter((r) => r.status === "Pending").length,
      approved: allRevisions.filter((r) => r.status === "Approved").length,
      rejected: allRevisions.filter((r) => r.status === "Rejected").length,
      totalPendingAmount: allRevisions
        .filter((r) => r.status === "Pending")
        .reduce((sum, r) => sum + r.revisionAmount, 0),
      totalApprovedAmount: allRevisions
        .filter((r) => r.status === "Approved")
        .reduce((sum, r) => sum + r.revisionAmount, 0),
    };

    return stats;
  },
});

// Get pending budget revisions for approval queue
export const getPendingBudgetRevisions = query({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("budgetRevisions")
      .withIndex("by_status", (q) => q.eq("status", "Pending"))
      .collect();

    const enrichedPending = await Promise.all(
      pending.map(async (revision) => {
        const requester = await ctx.db.get(revision.requestedBy);
        const project = await ctx.db.get(revision.projectId);

        return {
          ...revision,
          requesterName: requester?.fullName || "Unknown",
          projectName: project?.projectName || "Unknown",
        };
      })
    );

    return enrichedPending;
  },
});
