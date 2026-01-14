import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ==================== Access Logs ====================

// Create an access log entry
export const logAccess = mutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("accessLogs", {
      ...args,
      timestamp: Date.now(),
    });
    return logId;
  },
});

// List access logs with optional filters
export const listAccessLogs = query({
  args: {
    userId: v.optional(v.id("users")),
    action: v.optional(v.string()),
    resource: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let logs;

    if (args.userId) {
      logs = await ctx.db
        .query("accessLogs")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!))
        .collect();
    } else if (args.action) {
      logs = await ctx.db
        .query("accessLogs")
        .withIndex("by_action", (q) => q.eq("action", args.action!))
        .collect();
    } else if (args.resource) {
      logs = await ctx.db
        .query("accessLogs")
        .withIndex("by_resource", (q) => q.eq("resource", args.resource!))
        .collect();
    } else {
      logs = await ctx.db.query("accessLogs").collect();
    }

    // Sort by most recent first
    logs = logs.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit
    if (args.limit) {
      logs = logs.slice(0, args.limit);
    }

    // Enrich with user data
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.userId);
        return {
          ...log,
          userName: user?.fullName || "Unknown",
          userEmail: user?.email || "Unknown",
        };
      })
    );

    return enrichedLogs;
  },
});

// Get recent activity for a user
export const getUserActivity = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("accessLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const sortedLogs = logs.sort((a, b) => b.timestamp - a.timestamp);
    return sortedLogs.slice(0, args.limit || 50);
  },
});

// Clear old logs (older than specified days)
export const clearOldLogs = mutation({
  args: {
    daysOld: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoffTime = Date.now() - (args.daysOld * 24 * 60 * 60 * 1000);

    const oldLogs = await ctx.db
      .query("accessLogs")
      .filter((q) => q.lt(q.field("timestamp"), cutoffTime))
      .collect();

    for (const log of oldLogs) {
      await ctx.db.delete(log._id);
    }

    return { deleted: oldLogs.length };
  },
});

// ==================== System Configuration ====================

// Set a configuration value
export const setConfig = mutation({
  args: {
    key: v.string(),
    value: v.string(),
    description: v.optional(v.string()),
    updatedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Check if key exists
    const existing = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        description: args.description || existing.description,
        updatedBy: args.updatedBy,
      });
      return existing._id;
    } else {
      const configId = await ctx.db.insert("systemConfig", args);
      return configId;
    }
  },
});

// Get a configuration value
export const getConfig = query({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return config;
  },
});

// List all configuration values
export const listConfig = query({
  args: {},
  handler: async (ctx) => {
    const configs = await ctx.db.query("systemConfig").collect();
    return configs;
  },
});

// Delete a configuration value
export const deleteConfig = mutation({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (config) {
      await ctx.db.delete(config._id);
      return config._id;
    }
    return null;
  },
});

// ==================== Admin Statistics ====================

// Get system-wide statistics for admin dashboard
export const getSystemStats = query({
  args: {},
  handler: async (ctx) => {
    // Get counts from all major tables
    const users = await ctx.db.query("users").collect();
    const projects = await ctx.db.query("projects").collect();
    const equipment = await ctx.db.query("equipment").collect();
    const contractors = await ctx.db.query("contractors").collect();
    const inventory = await ctx.db.query("inventory").collect();
    const purchaseRequests = await ctx.db.query("purchaseRequests").collect();

    // Today's activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const accessLogs = await ctx.db.query("accessLogs").collect();
    const todayLogs = accessLogs.filter((l) => l.timestamp >= todayTimestamp);

    return {
      users: {
        total: users.length,
        active: users.filter((u) => u.isActive).length,
        byRole: {
          admin: users.filter((u) => u.role === "admin").length,
          manager: users.filter((u) => u.role === "manager").length,
          staff: users.filter((u) => u.role === "staff").length,
          contractor: users.filter((u) => u.role === "contractor").length,
        },
      },
      projects: {
        total: projects.length,
        active: projects.filter((p) => p.projectStatus === "Active").length,
        planning: projects.filter((p) => p.projectStatus === "Planning").length,
        onHold: projects.filter((p) => p.projectStatus === "On Hold").length,
        completed: projects.filter((p) => p.projectStatus === "Completed").length,
      },
      equipment: {
        total: equipment.length,
        available: equipment.filter((e) => e.status === "Available").length,
        inUse: equipment.filter((e) => e.status === "In Use").length,
        maintenance: equipment.filter((e) => e.status === "Maintenance").length,
      },
      contractors: {
        total: contractors.length,
        active: contractors.filter((c) => c.isActive).length,
      },
      inventory: {
        totalItems: inventory.length,
        lowStock: inventory.filter((i) => i.quantity <= i.lowStockThreshold).length,
      },
      purchaseRequests: {
        total: purchaseRequests.length,
        pending: purchaseRequests.filter((p) => p.status === "Pending").length,
        approved: purchaseRequests.filter((p) => p.status === "Approved").length,
      },
      activity: {
        todayActions: todayLogs.length,
        uniqueUsersToday: new Set(todayLogs.map((l) => l.userId)).size,
      },
    };
  },
});

// ==================== User Management ====================

// List all users with filters
export const listUsers = query({
  args: {
    role: v.optional(v.string()),
    department: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let users;

    if (args.role) {
      users = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.role as any))
        .collect();
    } else if (args.department) {
      users = await ctx.db
        .query("users")
        .withIndex("by_department", (q) => q.eq("department", args.department!))
        .collect();
    } else {
      users = await ctx.db.query("users").collect();
    }

    // Apply active filter
    if (args.isActive !== undefined) {
      users = users.filter((u) => u.isActive === args.isActive);
    }

    return users;
  },
});

// Update user role
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("staff"),
      v.literal("contractor")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: args.role });
    return args.userId;
  },
});

// Deactivate user
export const deactivateUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { isActive: false });
    return args.userId;
  },
});

// Activate user
export const activateUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { isActive: true });
    return args.userId;
  },
});
