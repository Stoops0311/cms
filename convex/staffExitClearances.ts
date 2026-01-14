import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all staff exit clearances with optional filters
export const listStaffExitClearances = query({
  args: {
    overallStatus: v.optional(v.string()),
    exitType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let clearances;

    if (args.overallStatus) {
      clearances = await ctx.db
        .query("staffExitClearances")
        .withIndex("by_status", (q) => q.eq("overallStatus", args.overallStatus as "In Progress" | "Completed"))
        .collect();
    } else if (args.exitType) {
      clearances = await ctx.db
        .query("staffExitClearances")
        .withIndex("by_exit_type", (q) => q.eq("exitType", args.exitType!))
        .collect();
    } else {
      clearances = await ctx.db.query("staffExitClearances").collect();
    }

    // Enrich with user names
    const enrichedClearances = await Promise.all(
      clearances.map(async (clearance) => {
        const user = await ctx.db.get(clearance.userId);
        const processor = await ctx.db.get(clearance.processedBy);

        return {
          ...clearance,
          userEmail: user?.email || "Unknown",
          processorName: processor?.fullName || "Unknown",
        };
      })
    );

    return enrichedClearances;
  },
});

// Get a single staff exit clearance by ID
export const getStaffExitClearanceById = query({
  args: { id: v.id("staffExitClearances") },
  handler: async (ctx, args) => {
    const clearance = await ctx.db.get(args.id);
    if (!clearance) return null;

    const user = await ctx.db.get(clearance.userId);
    const processor = await ctx.db.get(clearance.processedBy);

    return {
      ...clearance,
      userEmail: user?.email || "Unknown",
      processorName: processor?.fullName || "Unknown",
    };
  },
});

// Create a new staff exit clearance
export const createStaffExitClearance = mutation({
  args: {
    userId: v.id("users"),
    employeeName: v.string(),
    department: v.string(),
    lastWorkingDate: v.string(),
    exitType: v.string(),
    processedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Default clearance items
    const defaultClearanceItems = [
      { item: "ID Card / Access Badge", status: "Pending" as const, clearedBy: undefined, date: undefined },
      { item: "Laptop / Computer", status: "Pending" as const, clearedBy: undefined, date: undefined },
      { item: "Mobile Phone / SIM", status: "Pending" as const, clearedBy: undefined, date: undefined },
      { item: "Office Keys", status: "Pending" as const, clearedBy: undefined, date: undefined },
      { item: "Company Documents", status: "Pending" as const, clearedBy: undefined, date: undefined },
      { item: "Uniform / PPE", status: "Pending" as const, clearedBy: undefined, date: undefined },
      { item: "Vehicle / Parking Pass", status: "Pending" as const, clearedBy: undefined, date: undefined },
      { item: "Tools / Equipment", status: "Pending" as const, clearedBy: undefined, date: undefined },
    ];

    const clearanceId = await ctx.db.insert("staffExitClearances", {
      ...args,
      clearanceItems: defaultClearanceItems,
      finalSettlementStatus: "Pending",
      exitInterviewCompleted: false,
      overallStatus: "In Progress",
    });
    return clearanceId;
  },
});

// Update clearance item status
export const updateClearanceItem = mutation({
  args: {
    id: v.id("staffExitClearances"),
    itemIndex: v.number(),
    status: v.union(v.literal("Pending"), v.literal("Cleared"), v.literal("N/A")),
    clearedBy: v.optional(v.string()),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Staff exit clearance not found");

    const updatedItems = [...existing.clearanceItems];
    if (args.itemIndex >= 0 && args.itemIndex < updatedItems.length) {
      updatedItems[args.itemIndex] = {
        ...updatedItems[args.itemIndex],
        status: args.status,
        clearedBy: args.clearedBy,
        date: args.date,
      };
    }

    await ctx.db.patch(args.id, { clearanceItems: updatedItems });
    return args.id;
  },
});

// Add a new clearance item
export const addClearanceItem = mutation({
  args: {
    id: v.id("staffExitClearances"),
    item: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Staff exit clearance not found");

    const updatedItems = [
      ...existing.clearanceItems,
      { item: args.item, status: "Pending" as const, clearedBy: undefined, date: undefined },
    ];

    await ctx.db.patch(args.id, { clearanceItems: updatedItems });
    return args.id;
  },
});

// Update exit interview status
export const updateExitInterview = mutation({
  args: {
    id: v.id("staffExitClearances"),
    exitInterviewCompleted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Staff exit clearance not found");

    await ctx.db.patch(args.id, { exitInterviewCompleted: args.exitInterviewCompleted });
    return args.id;
  },
});

// Update final settlement status
export const updateFinalSettlement = mutation({
  args: {
    id: v.id("staffExitClearances"),
    finalSettlementStatus: v.union(v.literal("Pending"), v.literal("Processed"), v.literal("Completed")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Staff exit clearance not found");

    await ctx.db.patch(args.id, { finalSettlementStatus: args.finalSettlementStatus });
    return args.id;
  },
});

// Complete the clearance process
export const completeClearance = mutation({
  args: {
    id: v.id("staffExitClearances"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Staff exit clearance not found");

    // Check if all items are cleared or N/A
    const allCleared = existing.clearanceItems.every(
      (item) => item.status === "Cleared" || item.status === "N/A"
    );

    if (!allCleared) {
      throw new Error("Not all clearance items have been processed");
    }

    if (existing.finalSettlementStatus !== "Completed") {
      throw new Error("Final settlement must be completed first");
    }

    await ctx.db.patch(args.id, { overallStatus: "Completed" });

    // Optionally deactivate the user
    await ctx.db.patch(existing.userId, { isActive: false });

    return args.id;
  },
});

// Delete a staff exit clearance
export const deleteStaffExitClearance = mutation({
  args: { id: v.id("staffExitClearances") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Get staff exit clearance stats
export const getExitClearanceStats = query({
  args: {},
  handler: async (ctx) => {
    const allClearances = await ctx.db.query("staffExitClearances").collect();

    const stats = {
      total: allClearances.length,
      inProgress: allClearances.filter((c) => c.overallStatus === "In Progress").length,
      completed: allClearances.filter((c) => c.overallStatus === "Completed").length,
      byExitType: {} as Record<string, number>,
      pendingSettlement: allClearances.filter((c) => c.finalSettlementStatus === "Pending").length,
    };

    allClearances.forEach((c) => {
      stats.byExitType[c.exitType] = (stats.byExitType[c.exitType] || 0) + 1;
    });

    return stats;
  },
});

// Get in-progress clearances for dashboard
export const getInProgressClearances = query({
  args: {},
  handler: async (ctx) => {
    const inProgress = await ctx.db
      .query("staffExitClearances")
      .withIndex("by_status", (q) => q.eq("overallStatus", "In Progress"))
      .collect();

    const enrichedClearances = await Promise.all(
      inProgress.map(async (clearance) => {
        const user = await ctx.db.get(clearance.userId);
        const clearedCount = clearance.clearanceItems.filter(
          (item) => item.status === "Cleared" || item.status === "N/A"
        ).length;

        return {
          ...clearance,
          userEmail: user?.email || "Unknown",
          progress: `${clearedCount}/${clearance.clearanceItems.length}`,
          progressPercent: Math.round((clearedCount / clearance.clearanceItems.length) * 100),
        };
      })
    );

    return enrichedClearances;
  },
});
