import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ==================== Ambulance Fleet Management ====================

// Create a new ambulance
export const createAmbulance = mutation({
  args: {
    vehicleId: v.string(),
    driver: v.optional(v.string()),
    status: v.union(
      v.literal("Available"),
      v.literal("Dispatched"),
      v.literal("Maintenance"),
      v.literal("Off Duty")
    ),
    currentLocation: v.optional(v.string()),
    lastMaintenanceDate: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check for duplicate vehicle ID
    const existing = await ctx.db
      .query("ambulances")
      .withIndex("by_vehicle", (q) => q.eq("vehicleId", args.vehicleId))
      .first();

    if (existing) {
      throw new Error(`Ambulance with ID ${args.vehicleId} already exists`);
    }

    const ambulanceId = await ctx.db.insert("ambulances", args);
    return ambulanceId;
  },
});

// Update ambulance details
export const updateAmbulance = mutation({
  args: {
    id: v.id("ambulances"),
    vehicleId: v.optional(v.string()),
    driver: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("Available"),
        v.literal("Dispatched"),
        v.literal("Maintenance"),
        v.literal("Off Duty")
      )
    ),
    currentLocation: v.optional(v.string()),
    lastMaintenanceDate: v.optional(v.string()),
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

// Delete an ambulance
export const deleteAmbulance = mutation({
  args: { id: v.id("ambulances") },
  handler: async (ctx, args) => {
    // Check for active dispatches
    const activeDispatches = await ctx.db
      .query("ambulanceDispatches")
      .withIndex("by_ambulance", (q) => q.eq("ambulanceId", args.id))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "Requested"),
          q.eq(q.field("status"), "Dispatched"),
          q.eq(q.field("status"), "In Transit")
        )
      )
      .first();

    if (activeDispatches) {
      throw new Error("Cannot delete ambulance with active dispatches");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// List all ambulances
export const listAmbulances = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let ambulances;

    if (args.status) {
      ambulances = await ctx.db
        .query("ambulances")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    } else {
      ambulances = await ctx.db.query("ambulances").collect();
    }

    return ambulances;
  },
});

// Get available ambulances
export const getAvailableAmbulances = query({
  args: {},
  handler: async (ctx) => {
    const ambulances = await ctx.db
      .query("ambulances")
      .withIndex("by_status", (q) => q.eq("status", "Available"))
      .collect();
    return ambulances;
  },
});

// ==================== Ambulance Dispatches ====================

// Create a dispatch request
export const createDispatch = mutation({
  args: {
    ambulanceId: v.id("ambulances"),
    patientId: v.optional(v.string()),
    patientName: v.optional(v.string()),
    pickupLocation: v.string(),
    destination: v.string(),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if ambulance is available
    const ambulance = await ctx.db.get(args.ambulanceId);
    if (!ambulance) {
      throw new Error("Ambulance not found");
    }
    if (ambulance.status !== "Available") {
      throw new Error(`Ambulance is currently ${ambulance.status}`);
    }

    // Create dispatch
    const dispatchId = await ctx.db.insert("ambulanceDispatches", {
      ...args,
      status: "Requested",
      requestedAt: Date.now(),
    });

    return dispatchId;
  },
});

// Dispatch ambulance (change from Requested to Dispatched)
export const dispatchAmbulance = mutation({
  args: {
    dispatchId: v.id("ambulanceDispatches"),
  },
  handler: async (ctx, args) => {
    const dispatch = await ctx.db.get(args.dispatchId);
    if (!dispatch) {
      throw new Error("Dispatch not found");
    }

    // Update ambulance status
    await ctx.db.patch(dispatch.ambulanceId, {
      status: "Dispatched",
    });

    // Update dispatch status
    await ctx.db.patch(args.dispatchId, {
      status: "Dispatched",
      dispatchedAt: Date.now(),
    });

    return args.dispatchId;
  },
});

// Mark ambulance as in transit
export const markInTransit = mutation({
  args: {
    dispatchId: v.id("ambulanceDispatches"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.dispatchId, {
      status: "In Transit",
    });
    return args.dispatchId;
  },
});

// Complete dispatch
export const completeDispatch = mutation({
  args: {
    dispatchId: v.id("ambulanceDispatches"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const dispatch = await ctx.db.get(args.dispatchId);
    if (!dispatch) {
      throw new Error("Dispatch not found");
    }

    // Update ambulance status back to available
    await ctx.db.patch(dispatch.ambulanceId, {
      status: "Available",
    });

    // Update dispatch
    await ctx.db.patch(args.dispatchId, {
      status: "Completed",
      completedAt: Date.now(),
      notes: args.notes || dispatch.notes,
    });

    return args.dispatchId;
  },
});

// Cancel dispatch
export const cancelDispatch = mutation({
  args: {
    dispatchId: v.id("ambulanceDispatches"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const dispatch = await ctx.db.get(args.dispatchId);
    if (!dispatch) {
      throw new Error("Dispatch not found");
    }

    // If ambulance was dispatched, mark it available again
    const ambulance = await ctx.db.get(dispatch.ambulanceId);
    if (ambulance && ambulance.status === "Dispatched") {
      await ctx.db.patch(dispatch.ambulanceId, {
        status: "Available",
      });
    }

    // Update dispatch
    await ctx.db.patch(args.dispatchId, {
      status: "Cancelled",
      notes: args.notes || dispatch.notes,
    });

    return args.dispatchId;
  },
});

// List dispatches with optional filters
export const listDispatches = query({
  args: {
    ambulanceId: v.optional(v.id("ambulances")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let dispatches;

    if (args.ambulanceId) {
      dispatches = await ctx.db
        .query("ambulanceDispatches")
        .withIndex("by_ambulance", (q) => q.eq("ambulanceId", args.ambulanceId!))
        .collect();
    } else if (args.status) {
      dispatches = await ctx.db
        .query("ambulanceDispatches")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    } else {
      dispatches = await ctx.db.query("ambulanceDispatches").collect();
    }

    // Enrich with ambulance data
    const enrichedDispatches = await Promise.all(
      dispatches.map(async (dispatch) => {
        const ambulance = await ctx.db.get(dispatch.ambulanceId);
        return {
          ...dispatch,
          vehicleId: ambulance?.vehicleId || "Unknown",
          driver: ambulance?.driver || "Unassigned",
        };
      })
    );

    // Sort by most recent first
    return enrichedDispatches.sort((a, b) => b.requestedAt - a.requestedAt);
  },
});

// Get active dispatches
export const getActiveDispatches = query({
  args: {},
  handler: async (ctx) => {
    const dispatches = await ctx.db.query("ambulanceDispatches").collect();

    const activeDispatches = dispatches.filter(
      (d) => d.status === "Requested" || d.status === "Dispatched" || d.status === "In Transit"
    );

    // Enrich with ambulance data
    const enrichedDispatches = await Promise.all(
      activeDispatches.map(async (dispatch) => {
        const ambulance = await ctx.db.get(dispatch.ambulanceId);
        return {
          ...dispatch,
          vehicleId: ambulance?.vehicleId || "Unknown",
          driver: ambulance?.driver || "Unassigned",
        };
      })
    );

    return enrichedDispatches.sort((a, b) => b.requestedAt - a.requestedAt);
  },
});

// ==================== Statistics ====================

// Get ambulance fleet statistics
export const getAmbulanceStats = query({
  args: {},
  handler: async (ctx) => {
    const ambulances = await ctx.db.query("ambulances").collect();
    const dispatches = await ctx.db.query("ambulanceDispatches").collect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const todayDispatches = dispatches.filter((d) => d.requestedAt >= todayTimestamp);
    const completedToday = todayDispatches.filter((d) => d.status === "Completed").length;

    return {
      fleet: {
        total: ambulances.length,
        available: ambulances.filter((a) => a.status === "Available").length,
        dispatched: ambulances.filter((a) => a.status === "Dispatched").length,
        maintenance: ambulances.filter((a) => a.status === "Maintenance").length,
        offDuty: ambulances.filter((a) => a.status === "Off Duty").length,
      },
      dispatches: {
        total: dispatches.length,
        today: todayDispatches.length,
        completedToday,
        active: dispatches.filter(
          (d) => d.status === "Requested" || d.status === "Dispatched" || d.status === "In Transit"
        ).length,
        byStatus: {
          requested: dispatches.filter((d) => d.status === "Requested").length,
          dispatched: dispatches.filter((d) => d.status === "Dispatched").length,
          inTransit: dispatches.filter((d) => d.status === "In Transit").length,
          completed: dispatches.filter((d) => d.status === "Completed").length,
          cancelled: dispatches.filter((d) => d.status === "Cancelled").length,
        },
      },
    };
  },
});
