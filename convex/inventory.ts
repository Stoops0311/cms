import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create inventory item
export const createInventoryItem = mutation({
  args: {
    name: v.string(),
    quantity: v.number(),
    batchNo: v.string(),
    expiryDate: v.optional(v.string()),
    lowStockThreshold: v.number(),
    location: v.string(),
    unit: v.string(),
    category: v.string(),
    createdBy: v.id("users"),
  },
  returns: v.id("inventory"),
  handler: async (ctx, args) => {
    const itemId = await ctx.db.insert("inventory", args);
    return itemId;
  },
});

// Update inventory item
export const updateInventoryItem = mutation({
  args: {
    itemId: v.id("inventory"),
    name: v.optional(v.string()),
    lowStockThreshold: v.optional(v.number()),
    location: v.optional(v.string()),
    unit: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { itemId, ...updates } = args;
    
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(itemId, cleanUpdates);
    return null;
  },
});

// Adjust inventory quantity (add/remove stock)
export const adjustInventoryQuantity = mutation({
  args: {
    itemId: v.id("inventory"),
    quantityChange: v.number(),
    reason: v.string(),
    type: v.union(v.literal("addition"), v.literal("deduction")),
    staffId: v.id("users"),
    patientId: v.optional(v.string()),
  },
  returns: v.object({
    newQuantity: v.number(),
    logId: v.id("inventoryLogs"),
  }),
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Inventory item not found");
    }
    
    // Calculate new quantity
    const actualChange = args.type === "deduction" ? -Math.abs(args.quantityChange) : Math.abs(args.quantityChange);
    const newQuantity = item.quantity + actualChange;
    
    if (newQuantity < 0) {
      throw new Error(`Insufficient stock. Available: ${item.quantity}, Requested: ${Math.abs(args.quantityChange)}`);
    }
    
    // Update inventory quantity
    await ctx.db.patch(args.itemId, { quantity: newQuantity });
    
    // Create log entry
    const logId = await ctx.db.insert("inventoryLogs", {
      itemId: args.itemId,
      quantityChanged: actualChange,
      reason: args.reason,
      type: args.type,
      staffId: args.staffId,
      patientId: args.patientId,
      createdBy: args.staffId,
    });
    
    return { newQuantity, logId };
  },
});

// Transfer inventory between locations
export const transferInventory = mutation({
  args: {
    itemId: v.id("inventory"),
    quantity: v.number(),
    fromLocation: v.string(),
    toLocation: v.string(),
    staffId: v.id("users"),
  },
  returns: v.object({
    fromItemNewQuantity: v.number(),
    toItemId: v.id("inventory"),
    logId: v.id("inventoryLogs"),
  }),
  handler: async (ctx, args) => {
    const fromItem = await ctx.db.get(args.itemId);
    if (!fromItem) {
      throw new Error("Source inventory item not found");
    }
    
    if (fromItem.location !== args.fromLocation) {
      throw new Error(`Item is not at location ${args.fromLocation}`);
    }
    
    if (fromItem.quantity < args.quantity) {
      throw new Error(`Insufficient stock at ${args.fromLocation}. Available: ${fromItem.quantity}`);
    }
    
    // Update source item quantity
    const newFromQuantity = fromItem.quantity - args.quantity;
    await ctx.db.patch(args.itemId, { quantity: newFromQuantity });
    
    // Find or create destination item
    const toItem = await ctx.db
      .query("inventory")
      .withIndex("by_name", (q) => q.eq("name", fromItem.name))
      .filter((q) => 
        q.and(
          q.eq(q.field("location"), args.toLocation),
          q.eq(q.field("batchNo"), fromItem.batchNo)
        )
      )
      .first();
    
    let toItemId: any;
    if (toItem) {
      // Update existing item
      await ctx.db.patch(toItem._id, { quantity: toItem.quantity + args.quantity });
      toItemId = toItem._id;
    } else {
      // Create new item at destination
      toItemId = await ctx.db.insert("inventory", {
        name: fromItem.name,
        quantity: args.quantity,
        batchNo: fromItem.batchNo,
        expiryDate: fromItem.expiryDate,
        lowStockThreshold: fromItem.lowStockThreshold,
        location: args.toLocation,
        unit: fromItem.unit,
        category: fromItem.category,
        createdBy: fromItem.createdBy,
      });
    }
    
    // Create log entry
    const logId = await ctx.db.insert("inventoryLogs", {
      itemId: args.itemId,
      quantityChanged: args.quantity,
      reason: `Transferred from ${args.fromLocation} to ${args.toLocation}`,
      type: "transfer",
      staffId: args.staffId,
      fromLocation: args.fromLocation,
      toLocation: args.toLocation,
      createdBy: args.staffId,
    });
    
    return { fromItemNewQuantity: newFromQuantity, toItemId, logId };
  },
});

// Create inventory request
export const createInventoryRequest = mutation({
  args: {
    requestingUnit: v.string(),
    requestedBy: v.id("users"),
    items: v.array(
      v.object({
        itemId: v.id("inventory"),
        quantityRequested: v.number(),
        unitOfMeasure: v.string(),
      })
    ),
    notes: v.string(),
  },
  returns: v.id("inventoryRequests"),
  handler: async (ctx, args) => {
    const requestId = await ctx.db.insert("inventoryRequests", {
      ...args,
      status: "Pending",
      approvedBy: undefined,
      fulfilledBy: undefined,
    });
    
    return requestId;
  },
});

// Approve inventory request
export const approveInventoryRequest = mutation({
  args: {
    requestId: v.id("inventoryRequests"),
    approvedBy: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
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

// Fulfill inventory request
export const fulfillInventoryRequest = mutation({
  args: {
    requestId: v.id("inventoryRequests"),
    fulfilledBy: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }
    
    if (request.status !== "Approved") {
      throw new Error(`Request must be approved before fulfillment. Current status: ${request.status}`);
    }
    
    // Process each item in the request
    for (const requestedItem of request.items) {
      const item = await ctx.db.get(requestedItem.itemId);
      if (!item) {
        throw new Error(`Item ${requestedItem.itemId} not found`);
      }
      
      if (item.quantity < requestedItem.quantityRequested) {
        throw new Error(`Insufficient stock for ${item.name}. Available: ${item.quantity}, Requested: ${requestedItem.quantityRequested}`);
      }
      
      // Deduct from inventory
      await ctx.db.patch(requestedItem.itemId, {
        quantity: item.quantity - requestedItem.quantityRequested,
      });
      
      // Create log entry
      await ctx.db.insert("inventoryLogs", {
        itemId: requestedItem.itemId,
        quantityChanged: -requestedItem.quantityRequested,
        reason: `Fulfilled for request ${args.requestId} - ${request.requestingUnit}`,
        type: "deduction",
        staffId: args.fulfilledBy,
        createdBy: args.fulfilledBy,
      });
    }
    
    await ctx.db.patch(args.requestId, {
      status: "Fulfilled",
      fulfilledBy: args.fulfilledBy,
    });
    
    return null;
  },
});

// Get inventory logs
export const getInventoryLogs = query({
  args: {
    itemId: v.optional(v.id("inventory")),
    type: v.optional(v.union(v.literal("addition"), v.literal("deduction"), v.literal("transfer"))),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("inventoryLogs"),
      itemId: v.id("inventory"),
      itemName: v.string(),
      quantityChanged: v.number(),
      reason: v.string(),
      type: v.union(v.literal("addition"), v.literal("deduction"), v.literal("transfer")),
      staffName: v.string(),
      patientId: v.optional(v.string()),
      fromLocation: v.optional(v.string()),
      toLocation: v.optional(v.string()),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let logs;
    
    if (args.itemId) {
      logs = await ctx.db
        .query("inventoryLogs")
        .withIndex("by_item", (q) => q.eq("itemId", args.itemId!))
        .order("desc")
        .take(args.limit || 100);
    } else if (args.type) {
      logs = await ctx.db
        .query("inventoryLogs")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .order("desc")
        .take(args.limit || 100);
    } else {
      logs = await ctx.db
        .query("inventoryLogs")
        .order("desc")
        .take(args.limit || 100);
    }
    
    const logsWithDetails = await Promise.all(
      logs.map(async (log) => {
        const item = await ctx.db.get(log.itemId);
        const staff = await ctx.db.get(log.staffId);
        
        return {
          _id: log._id,
          itemId: log.itemId,
          itemName: item?.name || "Unknown Item",
          quantityChanged: log.quantityChanged,
          reason: log.reason,
          type: log.type,
          staffName: staff?.fullName || "Unknown Staff",
          patientId: log.patientId,
          fromLocation: log.fromLocation,
          toLocation: log.toLocation,
          _creationTime: log._creationTime,
        };
      })
    );
    
    return logsWithDetails;
  },
});

// Get low stock items
export const getLowStockItems = query({
  args: {
    location: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("inventory"),
      name: v.string(),
      quantity: v.number(),
      lowStockThreshold: v.number(),
      location: v.string(),
      unit: v.string(),
      category: v.string(),
      percentageRemaining: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let items = await ctx.db.query("inventory").collect();
    
    if (args.location) {
      items = items.filter(item => item.location === args.location);
    }
    
    const lowStockItems = items
      .filter(item => item.quantity <= item.lowStockThreshold)
      .map(item => ({
        _id: item._id,
        name: item.name,
        quantity: item.quantity,
        lowStockThreshold: item.lowStockThreshold,
        location: item.location,
        unit: item.unit,
        category: item.category,
        percentageRemaining: item.lowStockThreshold > 0 
          ? Math.round((item.quantity / item.lowStockThreshold) * 100)
          : 0,
      }))
      .sort((a, b) => a.percentageRemaining - b.percentageRemaining);
    
    return lowStockItems;
  },
});

// List inventory requests
export const listInventoryRequests = query({
  args: {
    status: v.optional(v.string()),
    requestingUnit: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("inventoryRequests"),
      requestingUnit: v.string(),
      requestedBy: v.id("users"),
      requestedByName: v.string(),
      items: v.array(
        v.object({
          itemId: v.id("inventory"),
          itemName: v.string(),
          quantityRequested: v.number(),
          unitOfMeasure: v.string(),
        })
      ),
      status: v.string(),
      notes: v.string(),
      approvedBy: v.optional(v.id("users")),
      approvedByName: v.optional(v.string()),
      fulfilledBy: v.optional(v.id("users")),
      fulfilledByName: v.optional(v.string()),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let requests;

    if (args.status) {
      requests = await ctx.db
        .query("inventoryRequests")
        .filter((q) => q.eq(q.field("status"), args.status))
        .order("desc")
        .collect();
    } else {
      requests = await ctx.db
        .query("inventoryRequests")
        .order("desc")
        .collect();
    }

    if (args.requestingUnit) {
      requests = requests.filter(r => r.requestingUnit === args.requestingUnit);
    }

    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const requestedByUser = await ctx.db.get(request.requestedBy);
        const approvedByUser = request.approvedBy ? await ctx.db.get(request.approvedBy) : null;
        const fulfilledByUser = request.fulfilledBy ? await ctx.db.get(request.fulfilledBy) : null;

        const itemsWithNames = await Promise.all(
          request.items.map(async (item) => {
            const inventoryItem = await ctx.db.get(item.itemId);
            return {
              ...item,
              itemName: inventoryItem?.name || "Unknown Item",
            };
          })
        );

        return {
          _id: request._id,
          requestingUnit: request.requestingUnit,
          requestedBy: request.requestedBy,
          requestedByName: requestedByUser?.fullName || "Unknown User",
          items: itemsWithNames,
          status: request.status,
          notes: request.notes,
          approvedBy: request.approvedBy,
          approvedByName: approvedByUser?.fullName,
          fulfilledBy: request.fulfilledBy,
          fulfilledByName: fulfilledByUser?.fullName,
          _creationTime: request._creationTime,
        };
      })
    );

    return requestsWithDetails;
  },
});

// Reject inventory request
export const rejectInventoryRequest = mutation({
  args: {
    requestId: v.id("inventoryRequests"),
    rejectedBy: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    if (request.status !== "Pending") {
      throw new Error(`Request is already ${request.status}`);
    }

    await ctx.db.patch(args.requestId, {
      status: "Rejected",
    });

    return null;
  },
});

// Delete inventory item
export const deleteInventoryItem = mutation({
  args: {
    itemId: v.id("inventory"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.itemId);
    return null;
  },
});

// Get inventory stats
export const getInventoryStats = query({
  args: {},
  returns: v.object({
    totalItems: v.number(),
    lowStockCount: v.number(),
    expiringSoonCount: v.number(),
    totalValue: v.number(),
    locationCounts: v.array(v.object({
      location: v.string(),
      count: v.number(),
    })),
  }),
  handler: async (ctx) => {
    const items = await ctx.db.query("inventory").collect();

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const lowStockCount = items.filter(item => item.quantity <= item.lowStockThreshold).length;
    const expiringSoonCount = items.filter(item =>
      item.expiryDate && new Date(item.expiryDate) <= thirtyDaysFromNow
    ).length;

    const locationMap = new Map<string, number>();
    items.forEach(item => {
      locationMap.set(item.location, (locationMap.get(item.location) || 0) + 1);
    });

    return {
      totalItems: items.length,
      lowStockCount,
      expiringSoonCount,
      totalValue: 0, // Would need price field to calculate
      locationCounts: Array.from(locationMap.entries()).map(([location, count]) => ({
        location,
        count,
      })),
    };
  },
});

// Get unique locations from inventory
export const getUniqueLocations = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const items = await ctx.db.query("inventory").collect();
    const locations = [...new Set(items.map(item => item.location).filter(Boolean))];
    return locations.sort();
  },
});

// List inventory items
export const listInventoryItems = query({
  args: {
    location: v.optional(v.string()),
    category: v.optional(v.string()),
    searchTerm: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("inventory"),
      name: v.string(),
      quantity: v.number(),
      batchNo: v.string(),
      expiryDate: v.optional(v.string()),
      lowStockThreshold: v.number(),
      location: v.string(),
      unit: v.string(),
      category: v.string(),
      isLowStock: v.boolean(),
      isExpiringSoon: v.boolean(),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let items;
    
    if (args.location) {
      items = await ctx.db
        .query("inventory")
        .withIndex("by_location", (q) => q.eq("location", args.location!))
        .collect();
    } else if (args.category) {
      items = await ctx.db
        .query("inventory")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      items = await ctx.db.query("inventory").collect();
    }
    
    // Apply search filter
    const filteredItems = args.searchTerm
      ? items.filter(item => 
          item.name.toLowerCase().includes(args.searchTerm!.toLowerCase()) ||
          item.batchNo.toLowerCase().includes(args.searchTerm!.toLowerCase())
        )
      : items;
    
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return filteredItems.map(item => ({
      _id: item._id,
      name: item.name,
      quantity: item.quantity,
      batchNo: item.batchNo,
      expiryDate: item.expiryDate,
      lowStockThreshold: item.lowStockThreshold,
      location: item.location,
      unit: item.unit,
      category: item.category,
      isLowStock: item.quantity <= item.lowStockThreshold,
      isExpiringSoon: item.expiryDate 
        ? new Date(item.expiryDate) <= thirtyDaysFromNow
        : false,
      _creationTime: item._creationTime,
    }));
  },
});