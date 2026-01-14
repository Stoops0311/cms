import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all procurement logs
export const listProcurementLogs = query({
  args: {
    status: v.optional(v.string()),
    logType: v.optional(v.string()),
    supplier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let logs;

    if (args.status) {
      logs = await ctx.db
        .query("procurementLogs")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    } else if (args.logType) {
      logs = await ctx.db
        .query("procurementLogs")
        .withIndex("by_type", (q) => q.eq("logType", args.logType!))
        .collect();
    } else if (args.supplier) {
      logs = await ctx.db
        .query("procurementLogs")
        .withIndex("by_supplier", (q) => q.eq("supplier", args.supplier!))
        .collect();
    } else {
      logs = await ctx.db.query("procurementLogs").collect();
    }

    // Enrich with project names and creator names
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        let projectName = null;
        if (log.relatedProjectId) {
          const project = await ctx.db.get(log.relatedProjectId);
          projectName = project?.projectName || null;
        }

        const creator = await ctx.db.get(log.createdBy);

        return {
          ...log,
          projectName,
          creatorName: creator?.fullName || "Unknown",
        };
      })
    );

    // Sort by date descending
    return enrichedLogs.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
});

// Get procurement log by ID
export const getProcurementLogById = query({
  args: { logId: v.id("procurementLogs") },
  handler: async (ctx, args) => {
    const log = await ctx.db.get(args.logId);
    if (!log) return null;

    let projectName = null;
    if (log.relatedProjectId) {
      const project = await ctx.db.get(log.relatedProjectId);
      projectName = project?.projectName || null;
    }

    const creator = await ctx.db.get(log.createdBy);

    return {
      ...log,
      projectName,
      creatorName: creator?.fullName || "Unknown",
    };
  },
});

// Create procurement log
export const createProcurementLog = mutation({
  args: {
    logType: v.string(),
    documentId: v.string(),
    supplier: v.string(),
    date: v.string(),
    amount: v.optional(v.number()),
    status: v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Ordered"),
      v.literal("Delivered"),
      v.literal("Paid"),
      v.literal("Cancelled")
    ),
    relatedProjectId: v.optional(v.id("projects")),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("procurementLogs", {
      logType: args.logType,
      documentId: args.documentId,
      supplier: args.supplier,
      date: args.date,
      amount: args.amount,
      status: args.status,
      relatedProjectId: args.relatedProjectId,
      notes: args.notes,
      createdBy: args.createdBy,
    });
    return logId;
  },
});

// Update procurement log
export const updateProcurementLog = mutation({
  args: {
    logId: v.id("procurementLogs"),
    logType: v.optional(v.string()),
    documentId: v.optional(v.string()),
    supplier: v.optional(v.string()),
    date: v.optional(v.string()),
    amount: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Ordered"),
      v.literal("Delivered"),
      v.literal("Paid"),
      v.literal("Cancelled")
    )),
    relatedProjectId: v.optional(v.id("projects")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { logId, ...updates } = args;
    const existing = await ctx.db.get(logId);
    if (!existing) throw new Error("Procurement log not found");

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(logId, filteredUpdates);
    return logId;
  },
});

// Delete procurement log
export const deleteProcurementLog = mutation({
  args: { logId: v.id("procurementLogs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.logId);
  },
});

// Get procurement stats
export const getProcurementStats = query({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db.query("procurementLogs").collect();

    const byStatus = logs.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = logs.reduce((acc, log) => {
      acc[log.logType] = (acc[log.logType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalAmount = logs.reduce((sum, log) => sum + (log.amount || 0), 0);
    const pendingAmount = logs
      .filter(log => log.status === "Pending" || log.status === "Approved" || log.status === "Ordered")
      .reduce((sum, log) => sum + (log.amount || 0), 0);

    return {
      totalLogs: logs.length,
      byStatus,
      byType,
      totalAmount,
      pendingAmount,
    };
  },
});

// List unique suppliers from procurement logs
export const listSuppliers = query({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db.query("procurementLogs").collect();
    const suppliers = [...new Set(logs.map(log => log.supplier))];
    return suppliers.sort();
  },
});
