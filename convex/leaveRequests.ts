import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all leave requests with optional filters
export const listLeaveRequests = query({
  args: {
    status: v.optional(v.string()),
    requestType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let requests;

    if (args.status) {
      requests = await ctx.db
        .query("leaveRequests")
        .withIndex("by_status", (q) => q.eq("status", args.status as "Pending" | "Approved" | "Rejected"))
        .collect();
    } else if (args.requestType) {
      requests = await ctx.db
        .query("leaveRequests")
        .withIndex("by_type", (q) => q.eq("requestType", args.requestType!))
        .collect();
    } else {
      requests = await ctx.db.query("leaveRequests").collect();
    }

    // Enrich with user and project names
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const requester = await ctx.db.get(request.requestedBy);
        const approver = request.approvedBy ? await ctx.db.get(request.approvedBy) : null;
        const swapUser = request.shiftSwapWith ? await ctx.db.get(request.shiftSwapWith) : null;
        const project = request.projectId ? await ctx.db.get(request.projectId) : null;

        return {
          ...request,
          requesterName: requester?.fullName || "Unknown",
          approverName: approver?.fullName || null,
          swapWithName: swapUser?.fullName || null,
          projectName: project?.projectName || null,
        };
      })
    );

    return enrichedRequests;
  },
});

// Get a single leave request by ID
export const getLeaveRequestById = query({
  args: { id: v.id("leaveRequests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.id);
    if (!request) return null;

    const requester = await ctx.db.get(request.requestedBy);
    const approver = request.approvedBy ? await ctx.db.get(request.approvedBy) : null;
    const swapUser = request.shiftSwapWith ? await ctx.db.get(request.shiftSwapWith) : null;
    const project = request.projectId ? await ctx.db.get(request.projectId) : null;

    return {
      ...request,
      requesterName: requester?.fullName || "Unknown",
      approverName: approver?.fullName || null,
      swapWithName: swapUser?.fullName || null,
      projectName: project?.projectName || null,
    };
  },
});

// Create a new leave request
export const createLeaveRequest = mutation({
  args: {
    requestedBy: v.id("users"),
    employeeName: v.string(),
    requestType: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    reason: v.string(),
    shiftSwapWith: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const requestId = await ctx.db.insert("leaveRequests", {
      ...args,
      status: "Pending",
      approvedBy: undefined,
    });
    return requestId;
  },
});

// Update a leave request
export const updateLeaveRequest = mutation({
  args: {
    id: v.id("leaveRequests"),
    employeeName: v.optional(v.string()),
    requestType: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    reason: v.optional(v.string()),
    shiftSwapWith: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Leave request not found");

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Approve a leave request
export const approveLeaveRequest = mutation({
  args: {
    id: v.id("leaveRequests"),
    approvedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Leave request not found");

    await ctx.db.patch(args.id, {
      status: "Approved",
      approvedBy: args.approvedBy,
    });
    return args.id;
  },
});

// Reject a leave request
export const rejectLeaveRequest = mutation({
  args: {
    id: v.id("leaveRequests"),
    approvedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Leave request not found");

    await ctx.db.patch(args.id, {
      status: "Rejected",
      approvedBy: args.approvedBy,
    });
    return args.id;
  },
});

// Delete a leave request
export const deleteLeaveRequest = mutation({
  args: { id: v.id("leaveRequests") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Get leave request stats
export const getLeaveStats = query({
  args: {},
  handler: async (ctx) => {
    const allRequests = await ctx.db.query("leaveRequests").collect();

    const stats = {
      total: allRequests.length,
      pending: allRequests.filter((r) => r.status === "Pending").length,
      approved: allRequests.filter((r) => r.status === "Approved").length,
      rejected: allRequests.filter((r) => r.status === "Rejected").length,
      byType: {} as Record<string, number>,
    };

    allRequests.forEach((r) => {
      stats.byType[r.requestType] = (stats.byType[r.requestType] || 0) + 1;
    });

    return stats;
  },
});
