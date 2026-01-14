import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all timesheets with optional filters
export const listTimesheets = query({
  args: {
    status: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    let timesheets;

    if (args.status) {
      timesheets = await ctx.db
        .query("timesheets")
        .withIndex("by_status", (q) => q.eq("status", args.status as "Draft" | "Submitted" | "Approved" | "Rejected"))
        .collect();
    } else if (args.userId) {
      timesheets = await ctx.db
        .query("timesheets")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!))
        .collect();
    } else if (args.projectId) {
      timesheets = await ctx.db
        .query("timesheets")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .collect();
    } else {
      timesheets = await ctx.db.query("timesheets").collect();
    }

    // Enrich with user and project names
    const enrichedTimesheets = await Promise.all(
      timesheets.map(async (timesheet) => {
        const user = await ctx.db.get(timesheet.userId);
        const project = timesheet.projectId ? await ctx.db.get(timesheet.projectId) : null;
        const approver = timesheet.approvedBy ? await ctx.db.get(timesheet.approvedBy) : null;

        return {
          ...timesheet,
          userName: user?.fullName || "Unknown",
          projectName: project?.projectName || null,
          approverName: approver?.fullName || null,
        };
      })
    );

    return enrichedTimesheets;
  },
});

// Get a single timesheet by ID
export const getTimesheetById = query({
  args: { id: v.id("timesheets") },
  handler: async (ctx, args) => {
    const timesheet = await ctx.db.get(args.id);
    if (!timesheet) return null;

    const user = await ctx.db.get(timesheet.userId);
    const project = timesheet.projectId ? await ctx.db.get(timesheet.projectId) : null;
    const approver = timesheet.approvedBy ? await ctx.db.get(timesheet.approvedBy) : null;

    return {
      ...timesheet,
      userName: user?.fullName || "Unknown",
      projectName: project?.projectName || null,
      approverName: approver?.fullName || null,
    };
  },
});

// Create a new timesheet
export const createTimesheet = mutation({
  args: {
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    weekStartDate: v.string(),
    weekEndDate: v.string(),
    entries: v.array(v.object({
      date: v.string(),
      hoursWorked: v.number(),
      taskDescription: v.string(),
      overtime: v.optional(v.number()),
    })),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Calculate totals
    const totalRegularHours = args.entries.reduce((sum, entry) => sum + entry.hoursWorked, 0);
    const totalOvertimeHours = args.entries.reduce((sum, entry) => sum + (entry.overtime || 0), 0);

    const timesheetId = await ctx.db.insert("timesheets", {
      ...args,
      totalRegularHours,
      totalOvertimeHours,
      status: "Draft",
      approvedBy: undefined,
    });
    return timesheetId;
  },
});

// Update a timesheet
export const updateTimesheet = mutation({
  args: {
    id: v.id("timesheets"),
    projectId: v.optional(v.id("projects")),
    weekStartDate: v.optional(v.string()),
    weekEndDate: v.optional(v.string()),
    entries: v.optional(v.array(v.object({
      date: v.string(),
      hoursWorked: v.number(),
      taskDescription: v.string(),
      overtime: v.optional(v.number()),
    }))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Timesheet not found");

    // Recalculate totals if entries are being updated
    let totalRegularHours = existing.totalRegularHours;
    let totalOvertimeHours = existing.totalOvertimeHours;

    if (updates.entries) {
      totalRegularHours = updates.entries.reduce((sum, entry) => sum + entry.hoursWorked, 0);
      totalOvertimeHours = updates.entries.reduce((sum, entry) => sum + (entry.overtime || 0), 0);
    }

    await ctx.db.patch(id, { ...updates, totalRegularHours, totalOvertimeHours });
    return id;
  },
});

// Submit a timesheet for approval
export const submitTimesheet = mutation({
  args: {
    id: v.id("timesheets"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Timesheet not found");
    if (existing.status !== "Draft") throw new Error("Only draft timesheets can be submitted");

    await ctx.db.patch(args.id, { status: "Submitted" });
    return args.id;
  },
});

// Approve a timesheet
export const approveTimesheet = mutation({
  args: {
    id: v.id("timesheets"),
    approvedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Timesheet not found");
    if (existing.status !== "Submitted") throw new Error("Only submitted timesheets can be approved");

    await ctx.db.patch(args.id, {
      status: "Approved",
      approvedBy: args.approvedBy,
    });
    return args.id;
  },
});

// Reject a timesheet
export const rejectTimesheet = mutation({
  args: {
    id: v.id("timesheets"),
    approvedBy: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Timesheet not found");
    if (existing.status !== "Submitted") throw new Error("Only submitted timesheets can be rejected");

    await ctx.db.patch(args.id, {
      status: "Rejected",
      approvedBy: args.approvedBy,
      notes: args.notes || existing.notes,
    });
    return args.id;
  },
});

// Delete a timesheet
export const deleteTimesheet = mutation({
  args: { id: v.id("timesheets") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Get timesheet stats
export const getTimesheetStats = query({
  args: {},
  handler: async (ctx) => {
    const allTimesheets = await ctx.db.query("timesheets").collect();

    const stats = {
      total: allTimesheets.length,
      draft: allTimesheets.filter((t) => t.status === "Draft").length,
      submitted: allTimesheets.filter((t) => t.status === "Submitted").length,
      approved: allTimesheets.filter((t) => t.status === "Approved").length,
      rejected: allTimesheets.filter((t) => t.status === "Rejected").length,
      totalRegularHours: allTimesheets.reduce((sum, t) => sum + t.totalRegularHours, 0),
      totalOvertimeHours: allTimesheets.reduce((sum, t) => sum + t.totalOvertimeHours, 0),
    };

    return stats;
  },
});

// Get pending timesheets for approval queue
export const getPendingTimesheets = query({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("timesheets")
      .withIndex("by_status", (q) => q.eq("status", "Submitted"))
      .collect();

    const enrichedPending = await Promise.all(
      pending.map(async (timesheet) => {
        const user = await ctx.db.get(timesheet.userId);
        const project = timesheet.projectId ? await ctx.db.get(timesheet.projectId) : null;

        return {
          ...timesheet,
          userName: user?.fullName || "Unknown",
          projectName: project?.projectName || null,
        };
      })
    );

    return enrichedPending;
  },
});

// Get timesheets for a specific user
export const getUserTimesheets = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const timesheets = await ctx.db
      .query("timesheets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const enrichedTimesheets = await Promise.all(
      timesheets.map(async (timesheet) => {
        const project = timesheet.projectId ? await ctx.db.get(timesheet.projectId) : null;
        const approver = timesheet.approvedBy ? await ctx.db.get(timesheet.approvedBy) : null;

        return {
          ...timesheet,
          projectName: project?.projectName || null,
          approverName: approver?.fullName || null,
        };
      })
    );

    return enrichedTimesheets;
  },
});
