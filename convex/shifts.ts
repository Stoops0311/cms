import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new shift
export const createShift = mutation({
  args: {
    userId: v.id("users"),
    siteId: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    shiftType: v.string(),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    status: v.union(
      v.literal("Scheduled"),
      v.literal("In Progress"),
      v.literal("Completed"),
      v.literal("Cancelled")
    ),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const shiftId = await ctx.db.insert("shifts", args);
    return shiftId;
  },
});

// Update an existing shift
export const updateShift = mutation({
  args: {
    id: v.id("shifts"),
    userId: v.optional(v.id("users")),
    siteId: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    shiftType: v.optional(v.string()),
    date: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("Scheduled"),
        v.literal("In Progress"),
        v.literal("Completed"),
        v.literal("Cancelled")
      )
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
    return id;
  },
});

// Delete a shift
export const deleteShift = mutation({
  args: { id: v.id("shifts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// List all shifts with optional filters
export const listShifts = query({
  args: {
    userId: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
    date: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let shifts;

    if (args.userId) {
      shifts = await ctx.db
        .query("shifts")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!))
        .collect();
    } else if (args.date) {
      shifts = await ctx.db
        .query("shifts")
        .withIndex("by_date", (q) => q.eq("date", args.date!))
        .collect();
    } else if (args.projectId) {
      shifts = await ctx.db
        .query("shifts")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .collect();
    } else {
      shifts = await ctx.db.query("shifts").collect();
    }

    // Apply additional filters
    if (args.status) {
      shifts = shifts.filter((s) => s.status === args.status);
    }

    // Enrich with user and project data
    const enrichedShifts = await Promise.all(
      shifts.map(async (shift) => {
        const user = await ctx.db.get(shift.userId);
        const project = shift.projectId ? await ctx.db.get(shift.projectId) : null;
        return {
          ...shift,
          userName: user?.fullName || "Unknown",
          userRole: user?.role || "Unknown",
          projectName: project?.projectName || null,
        };
      })
    );

    return enrichedShifts;
  },
});

// Get shifts for a specific date range
export const getShiftsByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    let shifts = await ctx.db.query("shifts").collect();

    // Filter by date range
    shifts = shifts.filter(
      (s) => s.date >= args.startDate && s.date <= args.endDate
    );

    // Filter by project if specified
    if (args.projectId) {
      shifts = shifts.filter((s) => s.projectId === args.projectId);
    }

    // Enrich with user data
    const enrichedShifts = await Promise.all(
      shifts.map(async (shift) => {
        const user = await ctx.db.get(shift.userId);
        return {
          ...shift,
          userName: user?.fullName || "Unknown",
          userRole: user?.role || "Unknown",
        };
      })
    );

    return enrichedShifts;
  },
});

// Get shift statistics
export const getShiftStats = query({
  args: {
    date: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    let shifts = await ctx.db.query("shifts").collect();

    if (args.date) {
      shifts = shifts.filter((s) => s.date === args.date);
    }

    if (args.projectId) {
      shifts = shifts.filter((s) => s.projectId === args.projectId);
    }

    const stats = {
      total: shifts.length,
      scheduled: shifts.filter((s) => s.status === "Scheduled").length,
      inProgress: shifts.filter((s) => s.status === "In Progress").length,
      completed: shifts.filter((s) => s.status === "Completed").length,
      cancelled: shifts.filter((s) => s.status === "Cancelled").length,
      byShiftType: {} as Record<string, number>,
    };

    // Count by shift type
    shifts.forEach((shift) => {
      stats.byShiftType[shift.shiftType] = (stats.byShiftType[shift.shiftType] || 0) + 1;
    });

    return stats;
  },
});
