import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all vendor completions with optional filters
export const listVendorCompletions = query({
  args: {
    status: v.optional(v.string()),
    vendorId: v.optional(v.id("contractors")),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    let completions;

    if (args.status) {
      completions = await ctx.db
        .query("vendorCompletions")
        .withIndex("by_status", (q) => q.eq("status", args.status as "Pending Review" | "Approved" | "Rejected"))
        .collect();
    } else if (args.vendorId) {
      completions = await ctx.db
        .query("vendorCompletions")
        .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId!))
        .collect();
    } else if (args.projectId) {
      completions = await ctx.db
        .query("vendorCompletions")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .collect();
    } else {
      completions = await ctx.db.query("vendorCompletions").collect();
    }

    // Enrich with vendor, project, and user names
    const enrichedCompletions = await Promise.all(
      completions.map(async (completion) => {
        const vendor = await ctx.db.get(completion.vendorId);
        const project = await ctx.db.get(completion.projectId);
        const creator = await ctx.db.get(completion.createdBy);
        const approver = completion.approvedBy ? await ctx.db.get(completion.approvedBy) : null;

        return {
          ...completion,
          vendorName: vendor?.companyName || "Unknown",
          projectName: project?.projectName || "Unknown",
          creatorName: creator?.fullName || "Unknown",
          approverName: approver?.fullName || null,
        };
      })
    );

    return enrichedCompletions;
  },
});

// Get a single vendor completion by ID
export const getVendorCompletionById = query({
  args: { id: v.id("vendorCompletions") },
  handler: async (ctx, args) => {
    const completion = await ctx.db.get(args.id);
    if (!completion) return null;

    const vendor = await ctx.db.get(completion.vendorId);
    const project = await ctx.db.get(completion.projectId);
    const creator = await ctx.db.get(completion.createdBy);
    const approver = completion.approvedBy ? await ctx.db.get(completion.approvedBy) : null;

    return {
      ...completion,
      vendorName: vendor?.companyName || "Unknown",
      projectName: project?.projectName || "Unknown",
      creatorName: creator?.fullName || "Unknown",
      approverName: approver?.fullName || null,
    };
  },
});

// Create a new vendor completion certificate
export const createVendorCompletion = mutation({
  args: {
    vendorId: v.id("contractors"),
    projectId: v.id("projects"),
    certificateNumber: v.string(),
    workDescription: v.string(),
    completionDate: v.string(),
    qualityRating: v.optional(v.string()),
    defectsNoted: v.optional(v.string()),
    warrantyPeriod: v.optional(v.string()),
    clientRepresentative: v.string(),
    contractorRepresentative: v.string(),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const completionId = await ctx.db.insert("vendorCompletions", {
      ...args,
      status: "Pending Review",
      approvedBy: undefined,
    });
    return completionId;
  },
});

// Update a vendor completion
export const updateVendorCompletion = mutation({
  args: {
    id: v.id("vendorCompletions"),
    certificateNumber: v.optional(v.string()),
    workDescription: v.optional(v.string()),
    completionDate: v.optional(v.string()),
    qualityRating: v.optional(v.string()),
    defectsNoted: v.optional(v.string()),
    warrantyPeriod: v.optional(v.string()),
    clientRepresentative: v.optional(v.string()),
    contractorRepresentative: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Vendor completion not found");

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Approve a vendor completion
export const approveVendorCompletion = mutation({
  args: {
    id: v.id("vendorCompletions"),
    approvedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Vendor completion not found");

    await ctx.db.patch(args.id, {
      status: "Approved",
      approvedBy: args.approvedBy,
    });
    return args.id;
  },
});

// Reject a vendor completion
export const rejectVendorCompletion = mutation({
  args: {
    id: v.id("vendorCompletions"),
    approvedBy: v.id("users"),
    defectsNoted: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Vendor completion not found");

    await ctx.db.patch(args.id, {
      status: "Rejected",
      approvedBy: args.approvedBy,
      defectsNoted: args.defectsNoted || existing.defectsNoted,
    });
    return args.id;
  },
});

// Delete a vendor completion
export const deleteVendorCompletion = mutation({
  args: { id: v.id("vendorCompletions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Get vendor completion stats
export const getVendorCompletionStats = query({
  args: {},
  handler: async (ctx) => {
    const allCompletions = await ctx.db.query("vendorCompletions").collect();

    const stats = {
      total: allCompletions.length,
      pendingReview: allCompletions.filter((c) => c.status === "Pending Review").length,
      approved: allCompletions.filter((c) => c.status === "Approved").length,
      rejected: allCompletions.filter((c) => c.status === "Rejected").length,
      byQualityRating: {} as Record<string, number>,
    };

    allCompletions.forEach((c) => {
      if (c.qualityRating) {
        stats.byQualityRating[c.qualityRating] = (stats.byQualityRating[c.qualityRating] || 0) + 1;
      }
    });

    return stats;
  },
});

// Get pending vendor completions for approval queue
export const getPendingVendorCompletions = query({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("vendorCompletions")
      .withIndex("by_status", (q) => q.eq("status", "Pending Review"))
      .collect();

    const enrichedPending = await Promise.all(
      pending.map(async (completion) => {
        const vendor = await ctx.db.get(completion.vendorId);
        const project = await ctx.db.get(completion.projectId);

        return {
          ...completion,
          vendorName: vendor?.companyName || "Unknown",
          projectName: project?.projectName || "Unknown",
        };
      })
    );

    return enrichedPending;
  },
});
