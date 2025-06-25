import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create purchase request
export const createPurchaseRequest = mutation({
  args: {
    requestedBy: v.id("users"),
    department: v.string(),
    projectId: v.optional(v.id("projects")),
    items: v.array(
      v.object({
        itemName: v.string(),
        quantity: v.number(),
        unit: v.string(),
        estimatedCost: v.number(),
        supplier: v.optional(v.string()),
      })
    ),
    justification: v.string(),
  },
  returns: v.id("purchaseRequests"),
  handler: async (ctx, args) => {
    // Calculate total estimated cost
    const totalEstimatedCost = args.items.reduce(
      (total, item) => total + (item.quantity * item.estimatedCost),
      0
    );
    
    const requestId = await ctx.db.insert("purchaseRequests", {
      ...args,
      status: "Pending",
      totalEstimatedCost,
      approvedBy: undefined,
    });
    
    return requestId;
  },
});

// Approve purchase request
export const approvePurchaseRequest = mutation({
  args: {
    requestId: v.id("purchaseRequests"),
    approvedBy: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Purchase request not found");
    }
    
    if (request.status !== "Pending") {
      throw new Error(`Request is already ${request.status}`);
    }
    
    await ctx.db.patch(args.requestId, {
      status: "Approved",
      approvedBy: args.approvedBy,
    });
    
    return null;
  },
});

// Reject purchase request
export const rejectPurchaseRequest = mutation({
  args: {
    requestId: v.id("purchaseRequests"),
    rejectedBy: v.id("users"),
    reason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Purchase request not found");
    }
    
    if (request.status !== "Pending") {
      throw new Error(`Request is already ${request.status}`);
    }
    
    await ctx.db.patch(args.requestId, {
      status: "Rejected",
      approvedBy: args.rejectedBy, // Using same field for rejection tracking
    });
    
    return null;
  },
});

// Mark purchase request as ordered
export const markAsOrdered = mutation({
  args: {
    requestId: v.id("purchaseRequests"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Purchase request not found");
    }
    
    if (request.status !== "Approved") {
      throw new Error("Only approved requests can be marked as ordered");
    }
    
    await ctx.db.patch(args.requestId, {
      status: "Ordered",
    });
    
    return null;
  },
});

// List purchase requests
export const listPurchaseRequests = query({
  args: {
    status: v.optional(v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Rejected"),
      v.literal("Ordered")
    )),
    requestedBy: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
    department: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("purchaseRequests"),
      requestedBy: v.id("users"),
      requestedByName: v.string(),
      department: v.string(),
      projectId: v.optional(v.id("projects")),
      projectName: v.optional(v.string()),
      itemCount: v.number(),
      totalEstimatedCost: v.number(),
      status: v.union(
        v.literal("Pending"),
        v.literal("Approved"),
        v.literal("Rejected"),
        v.literal("Ordered")
      ),
      approvedBy: v.optional(v.id("users")),
      approvedByName: v.optional(v.string()),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let requests;
    
    if (args.status) {
      requests = await ctx.db
        .query("purchaseRequests")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else if (args.requestedBy) {
      requests = await ctx.db
        .query("purchaseRequests")
        .withIndex("by_requester", (q) => q.eq("requestedBy", args.requestedBy!))
        .order("desc")
        .collect();
    } else if (args.department) {
      requests = await ctx.db
        .query("purchaseRequests")
        .withIndex("by_department", (q) => q.eq("department", args.department!))
        .order("desc")
        .collect();
    } else if (args.projectId) {
      requests = await ctx.db
        .query("purchaseRequests")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .order("desc")
        .collect();
    } else {
      requests = await ctx.db
        .query("purchaseRequests")
        .order("desc")
        .collect();
    }
    
    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const requester = await ctx.db.get(request.requestedBy);
        const project = request.projectId 
          ? await ctx.db.get(request.projectId)
          : null;
        const approver = request.approvedBy 
          ? await ctx.db.get(request.approvedBy)
          : null;
        
        return {
          _id: request._id,
          requestedBy: request.requestedBy,
          requestedByName: requester?.fullName || "Unknown User",
          department: request.department,
          projectId: request.projectId,
          projectName: project?.projectName,
          itemCount: request.items.length,
          totalEstimatedCost: request.totalEstimatedCost,
          status: request.status,
          approvedBy: request.approvedBy,
          approvedByName: approver?.fullName,
          _creationTime: request._creationTime,
        };
      })
    );
    
    return requestsWithDetails;
  },
});

// Get purchase request details
export const getPurchaseRequestById = query({
  args: {
    requestId: v.id("purchaseRequests"),
  },
  returns: v.union(
    v.object({
      _id: v.id("purchaseRequests"),
      requestedBy: v.id("users"),
      requestedByName: v.string(),
      department: v.string(),
      projectId: v.optional(v.id("projects")),
      projectName: v.optional(v.string()),
      items: v.array(
        v.object({
          itemName: v.string(),
          quantity: v.number(),
          unit: v.string(),
          estimatedCost: v.number(),
          supplier: v.optional(v.string()),
        })
      ),
      justification: v.string(),
      status: v.union(
        v.literal("Pending"),
        v.literal("Approved"),
        v.literal("Rejected"),
        v.literal("Ordered")
      ),
      totalEstimatedCost: v.number(),
      approvedBy: v.optional(v.id("users")),
      approvedByName: v.optional(v.string()),
      _creationTime: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) return null;
    
    const requester = await ctx.db.get(request.requestedBy);
    const project = request.projectId 
      ? await ctx.db.get(request.projectId)
      : null;
    const approver = request.approvedBy 
      ? await ctx.db.get(request.approvedBy)
      : null;
    
    return {
      ...request,
      requestedByName: requester?.fullName || "Unknown User",
      projectName: project?.projectName,
      approvedByName: approver?.fullName,
    };
  },
});