import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all training requests with optional filters
export const listTrainingRequests = query({
  args: {
    status: v.optional(v.string()),
    trainingType: v.optional(v.string()),
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let requests;

    if (args.status) {
      requests = await ctx.db
        .query("trainingRequests")
        .withIndex("by_status", (q) => q.eq("status", args.status as "Pending" | "Approved" | "Rejected" | "Completed"))
        .collect();
    } else if (args.trainingType) {
      requests = await ctx.db
        .query("trainingRequests")
        .withIndex("by_type", (q) => q.eq("trainingType", args.trainingType!))
        .collect();
    } else if (args.department) {
      requests = await ctx.db
        .query("trainingRequests")
        .withIndex("by_department", (q) => q.eq("department", args.department!))
        .collect();
    } else {
      requests = await ctx.db.query("trainingRequests").collect();
    }

    // Enrich with user names
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const requester = await ctx.db.get(request.requestedBy);
        const approver = request.approvedBy ? await ctx.db.get(request.approvedBy) : null;
        return {
          ...request,
          requesterName: requester?.fullName || "Unknown",
          approverName: approver?.fullName || null,
        };
      })
    );

    return enrichedRequests;
  },
});

// Get a single training request by ID
export const getTrainingRequestById = query({
  args: { id: v.id("trainingRequests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.id);
    if (!request) return null;

    const requester = await ctx.db.get(request.requestedBy);
    const approver = request.approvedBy ? await ctx.db.get(request.approvedBy) : null;

    return {
      ...request,
      requesterName: requester?.fullName || "Unknown",
      approverName: approver?.fullName || null,
    };
  },
});

// Create a new training request
export const createTrainingRequest = mutation({
  args: {
    trainingType: v.string(),
    requestedBy: v.id("users"),
    employeeName: v.string(),
    department: v.string(),
    trainingTitle: v.string(),
    trainingProvider: v.optional(v.string()),
    justification: v.string(),
    preferredDates: v.optional(v.string()),
    estimatedCost: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const requestId = await ctx.db.insert("trainingRequests", {
      ...args,
      status: "Pending",
      approvedBy: undefined,
    });
    return requestId;
  },
});

// Update a training request
export const updateTrainingRequest = mutation({
  args: {
    id: v.id("trainingRequests"),
    trainingType: v.optional(v.string()),
    employeeName: v.optional(v.string()),
    department: v.optional(v.string()),
    trainingTitle: v.optional(v.string()),
    trainingProvider: v.optional(v.string()),
    justification: v.optional(v.string()),
    preferredDates: v.optional(v.string()),
    estimatedCost: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Training request not found");

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Approve a training request
export const approveTrainingRequest = mutation({
  args: {
    id: v.id("trainingRequests"),
    approvedBy: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Training request not found");

    await ctx.db.patch(args.id, {
      status: "Approved",
      approvedBy: args.approvedBy,
      notes: args.notes || existing.notes,
    });
    return args.id;
  },
});

// Reject a training request
export const rejectTrainingRequest = mutation({
  args: {
    id: v.id("trainingRequests"),
    approvedBy: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Training request not found");

    await ctx.db.patch(args.id, {
      status: "Rejected",
      approvedBy: args.approvedBy,
      notes: args.notes || existing.notes,
    });
    return args.id;
  },
});

// Mark training as completed
export const completeTrainingRequest = mutation({
  args: {
    id: v.id("trainingRequests"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Training request not found");

    await ctx.db.patch(args.id, {
      status: "Completed",
      notes: args.notes || existing.notes,
    });
    return args.id;
  },
});

// Delete a training request
export const deleteTrainingRequest = mutation({
  args: { id: v.id("trainingRequests") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Get training request stats
export const getTrainingStats = query({
  args: {},
  handler: async (ctx) => {
    const allRequests = await ctx.db.query("trainingRequests").collect();

    const stats = {
      total: allRequests.length,
      pending: allRequests.filter((r) => r.status === "Pending").length,
      approved: allRequests.filter((r) => r.status === "Approved").length,
      rejected: allRequests.filter((r) => r.status === "Rejected").length,
      completed: allRequests.filter((r) => r.status === "Completed").length,
      byType: {} as Record<string, number>,
    };

    allRequests.forEach((r) => {
      stats.byType[r.trainingType] = (stats.byType[r.trainingType] || 0) + 1;
    });

    return stats;
  },
});
