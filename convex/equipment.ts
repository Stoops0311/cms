import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create new equipment
export const createEquipment = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    identifier: v.string(),
    status: v.union(
      v.literal("Available"),
      v.literal("In Use"),
      v.literal("Maintenance"),
      v.literal("Unavailable")
    ),
    lastMaintenance: v.optional(v.string()),
    nextMaintenance: v.optional(v.string()),
    location: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  returns: v.id("equipment"),
  handler: async (ctx, args) => {
    // Check if equipment with identifier already exists
    const existingEquipment = await ctx.db
      .query("equipment")
      .withIndex("by_identifier", (q) => q.eq("identifier", args.identifier))
      .first();
    
    if (existingEquipment) {
      throw new Error("Equipment with this identifier already exists");
    }
    
    const equipmentId = await ctx.db.insert("equipment", args);
    return equipmentId;
  },
});

// Update equipment
export const updateEquipment = mutation({
  args: {
    equipmentId: v.id("equipment"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("Available"),
      v.literal("In Use"),
      v.literal("Maintenance"),
      v.literal("Unavailable")
    )),
    lastMaintenance: v.optional(v.string()),
    nextMaintenance: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { equipmentId, ...updates } = args;
    
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(equipmentId, cleanUpdates);
    return null;
  },
});

// List equipment with filters
export const listEquipment = query({
  args: {
    status: v.optional(v.union(
      v.literal("Available"),
      v.literal("In Use"),
      v.literal("Maintenance"),
      v.literal("Unavailable")
    )),
    type: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("equipment"),
      name: v.string(),
      type: v.string(),
      identifier: v.string(),
      status: v.union(
        v.literal("Available"),
        v.literal("In Use"),
        v.literal("Maintenance"),
        v.literal("Unavailable")
      ),
      lastMaintenance: v.optional(v.string()),
      nextMaintenance: v.optional(v.string()),
      location: v.optional(v.string()),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let equipment;
    
    if (args.status) {
      equipment = await ctx.db
        .query("equipment")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else if (args.type) {
      equipment = await ctx.db
        .query("equipment")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .collect();
    } else {
      equipment = await ctx.db.query("equipment").collect();
    }
    
    // Apply location filter if specified
    const filteredEquipment = args.location 
      ? equipment.filter(e => e.location === args.location)
      : equipment;
    
    return filteredEquipment.map(e => ({
      _id: e._id,
      name: e.name,
      type: e.type,
      identifier: e.identifier,
      status: e.status,
      lastMaintenance: e.lastMaintenance,
      nextMaintenance: e.nextMaintenance,
      location: e.location,
      _creationTime: e._creationTime,
    }));
  },
});

// Create equipment dispatch
export const createEquipmentDispatch = mutation({
  args: {
    equipmentId: v.id("equipment"),
    projectId: v.id("projects"),
    dispatchDate: v.string(),
    expectedReturnDate: v.optional(v.string()),
    notes: v.string(),
    dispatchStatus: v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Dispatched"),
      v.literal("Returned"),
      v.literal("Cancelled")
    ),
    createdBy: v.id("users"),
  },
  returns: v.id("equipmentDispatches"),
  handler: async (ctx, args) => {
    // Check if equipment is available
    const equipment = await ctx.db.get(args.equipmentId);
    if (!equipment) {
      throw new Error("Equipment not found");
    }
    
    if (equipment.status !== "Available" && args.dispatchStatus !== "Pending") {
      throw new Error(`Equipment is not available. Current status: ${equipment.status}`);
    }
    
    const dispatchId = await ctx.db.insert("equipmentDispatches", {
      ...args,
      actualReturnDate: undefined,
      approvedBy: undefined,
    });
    
    // Update equipment status if dispatch is approved
    if (args.dispatchStatus === "Approved" || args.dispatchStatus === "Dispatched") {
      await ctx.db.patch(args.equipmentId, { status: "In Use" });
    }
    
    return dispatchId;
  },
});

// Update dispatch status
export const updateDispatchStatus = mutation({
  args: {
    dispatchId: v.id("equipmentDispatches"),
    dispatchStatus: v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Dispatched"),
      v.literal("Returned"),
      v.literal("Cancelled")
    ),
    approvedBy: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const dispatch = await ctx.db.get(args.dispatchId);
    if (!dispatch) {
      throw new Error("Dispatch not found");
    }
    
    const updates: any = {
      dispatchStatus: args.dispatchStatus,
    };
    
    if (args.approvedBy) {
      updates.approvedBy = args.approvedBy;
    }
    
    if (args.notes) {
      updates.notes = args.notes;
    }
    
    // Update equipment status based on dispatch status
    if (args.dispatchStatus === "Approved" || args.dispatchStatus === "Dispatched") {
      await ctx.db.patch(dispatch.equipmentId, { status: "In Use" });
    } else if (args.dispatchStatus === "Returned" || args.dispatchStatus === "Cancelled") {
      await ctx.db.patch(dispatch.equipmentId, { status: "Available" });
    }
    
    await ctx.db.patch(args.dispatchId, updates);
    return null;
  },
});

// Return equipment
export const returnEquipment = mutation({
  args: {
    dispatchId: v.id("equipmentDispatches"),
    actualReturnDate: v.string(),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const dispatch = await ctx.db.get(args.dispatchId);
    if (!dispatch) {
      throw new Error("Dispatch not found");
    }
    
    await ctx.db.patch(args.dispatchId, {
      dispatchStatus: "Returned",
      actualReturnDate: args.actualReturnDate,
      notes: args.notes || dispatch.notes,
    });
    
    // Mark equipment as available
    await ctx.db.patch(dispatch.equipmentId, { status: "Available" });
    
    return null;
  },
});

// Get equipment history
export const getEquipmentHistory = query({
  args: {
    equipmentId: v.id("equipment"),
  },
  returns: v.array(
    v.object({
      _id: v.id("equipmentDispatches"),
      projectId: v.id("projects"),
      projectName: v.string(),
      dispatchDate: v.string(),
      expectedReturnDate: v.optional(v.string()),
      actualReturnDate: v.optional(v.string()),
      dispatchStatus: v.union(
        v.literal("Pending"),
        v.literal("Approved"),
        v.literal("Dispatched"),
        v.literal("Returned"),
        v.literal("Cancelled")
      ),
      notes: v.string(),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const dispatches = await ctx.db
      .query("equipmentDispatches")
      .withIndex("by_equipment", (q) => q.eq("equipmentId", args.equipmentId))
      .order("desc")
      .collect();
    
    const dispatchesWithProjects = await Promise.all(
      dispatches.map(async (dispatch) => {
        const project = await ctx.db.get(dispatch.projectId);
        return {
          _id: dispatch._id,
          projectId: dispatch.projectId,
          projectName: project?.projectName || "Unknown Project",
          dispatchDate: dispatch.dispatchDate,
          expectedReturnDate: dispatch.expectedReturnDate,
          actualReturnDate: dispatch.actualReturnDate,
          dispatchStatus: dispatch.dispatchStatus,
          notes: dispatch.notes,
          _creationTime: dispatch._creationTime,
        };
      })
    );
    
    return dispatchesWithProjects;
  },
});

// Get available equipment count by type
export const getAvailableEquipmentByType = query({
  args: {},
  returns: v.array(
    v.object({
      type: v.string(),
      available: v.number(),
      total: v.number(),
    })
  ),
  handler: async (ctx) => {
    const allEquipment = await ctx.db.query("equipment").collect();
    
    const typeMap = new Map<string, { available: number; total: number }>();
    
    for (const equipment of allEquipment) {
      const current = typeMap.get(equipment.type) || { available: 0, total: 0 };
      current.total++;
      if (equipment.status === "Available") {
        current.available++;
      }
      typeMap.set(equipment.type, current);
    }
    
    return Array.from(typeMap.entries()).map(([type, counts]) => ({
      type,
      available: counts.available,
      total: counts.total,
    }));
  },
});