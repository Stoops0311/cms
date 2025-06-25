import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a notice/communication (for alerts, notices, etc.)
export const createNotice = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    noticeType: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("Critical"), v.literal("High"), v.literal("Medium"), v.literal("Low")),
    targetAudience: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    createdBy: v.string(),
    projectId: v.optional(v.id("projects")),
  },
  returns: v.id("communications"),
  handler: async (ctx, args) => {
    // Map priority to standard format
    let normalizedPriority: "low" | "medium" | "high" = "medium";
    if (args.priority === "Critical" || args.priority === "high") {
      normalizedPriority = "high";
    } else if (args.priority === "High" || args.priority === "Medium" || args.priority === "medium") {
      normalizedPriority = "medium";
    } else if (args.priority === "Low" || args.priority === "low") {
      normalizedPriority = "low";
    }

    // For broadcasts, get all active users as recipients
    const allUsers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    const allUserIds = allUsers.map(user => user._id);
    
    // Find the user who created this by looking up by a field (assuming email or some identifier)
    const createdByUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.createdBy))
      .first();
    
    if (!createdByUser) {
      throw new Error("Creator user not found");
    }

    const communicationId = await ctx.db.insert("communications", {
      type: "notice",
      title: args.title,
      content: args.content,
      priority: normalizedPriority,
      fromUserId: createdByUser._id,
      toUserIds: allUserIds,
      projectId: args.projectId,
      readBy: [],
      attachments: [],
    });
    
    return communicationId;
  },
});

// Send a notice/message
export const sendNotice = mutation({
  args: {
    type: v.union(v.literal("notice"), v.literal("message"), v.literal("announcement")),
    title: v.optional(v.string()),
    content: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    fromUserId: v.id("users"),
    toUserIds: v.array(v.id("users")),
    projectId: v.optional(v.id("projects")),
  },
  returns: v.id("communications"),
  handler: async (ctx, args) => {
    const communicationId = await ctx.db.insert("communications", {
      ...args,
      readBy: [],
      attachments: [],
    });
    
    return communicationId;
  },
});

// Mark message as read
export const markAsRead = mutation({
  args: {
    communicationId: v.id("communications"),
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const communication = await ctx.db.get(args.communicationId);
    if (!communication) {
      throw new Error("Communication not found");
    }
    
    // Check if user is a recipient
    if (!communication.toUserIds.includes(args.userId)) {
      throw new Error("User is not a recipient of this communication");
    }
    
    // Add user to readBy if not already present
    if (!communication.readBy.includes(args.userId)) {
      await ctx.db.patch(args.communicationId, {
        readBy: [...communication.readBy, args.userId],
      });
    }
    
    return null;
  },
});

// Get unread messages for a user
export const getUnreadMessages = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.array(
    v.object({
      _id: v.id("communications"),
      type: v.union(v.literal("notice"), v.literal("message"), v.literal("announcement")),
      title: v.optional(v.string()),
      content: v.string(),
      priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      fromUserId: v.id("users"),
      fromUserName: v.string(),
      projectId: v.optional(v.id("projects")),
      projectName: v.optional(v.string()),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const allCommunications = await ctx.db
      .query("communications")
      .collect();
    
    // Filter for unread messages where user is a recipient
    const unreadCommunications = allCommunications.filter(
      comm => comm.toUserIds.includes(args.userId) && !comm.readBy.includes(args.userId)
    );
    
    const communicationsWithDetails = await Promise.all(
      unreadCommunications.map(async (comm) => {
        const fromUser = await ctx.db.get(comm.fromUserId);
        const project = comm.projectId 
          ? await ctx.db.get(comm.projectId)
          : null;
        
        return {
          _id: comm._id,
          type: comm.type,
          title: comm.title,
          content: comm.content,
          priority: comm.priority,
          fromUserId: comm.fromUserId,
          fromUserName: fromUser?.fullName || "Unknown User",
          projectId: comm.projectId,
          projectName: project?.projectName,
          _creationTime: comm._creationTime,
        };
      })
    );
    
    return communicationsWithDetails.sort((a, b) => b._creationTime - a._creationTime);
  },
});

// Get all messages for a user
export const getUserMessages = query({
  args: {
    userId: v.id("users"),
    type: v.optional(v.union(v.literal("notice"), v.literal("message"), v.literal("announcement"))),
    onlyUnread: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("communications"),
      type: v.union(v.literal("notice"), v.literal("message"), v.literal("announcement")),
      title: v.optional(v.string()),
      content: v.string(),
      priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      fromUserId: v.id("users"),
      fromUserName: v.string(),
      projectId: v.optional(v.id("projects")),
      projectName: v.optional(v.string()),
      isRead: v.boolean(),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let allCommunications;
    
    if (args.type) {
      allCommunications = await ctx.db
        .query("communications")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .collect();
    } else {
      allCommunications = await ctx.db
        .query("communications")
        .collect();
    }
    
    // Filter for messages where user is a recipient
    let userCommunications = allCommunications.filter(
      comm => comm.toUserIds.includes(args.userId)
    );
    
    // Filter by read status if specified
    if (args.onlyUnread === true) {
      userCommunications = userCommunications.filter(
        comm => !comm.readBy.includes(args.userId)
      );
    }
    
    const communicationsWithDetails = await Promise.all(
      userCommunications.map(async (comm) => {
        const fromUser = await ctx.db.get(comm.fromUserId);
        const project = comm.projectId 
          ? await ctx.db.get(comm.projectId)
          : null;
        
        return {
          _id: comm._id,
          type: comm.type,
          title: comm.title,
          content: comm.content,
          priority: comm.priority,
          fromUserId: comm.fromUserId,
          fromUserName: fromUser?.fullName || "Unknown User",
          projectId: comm.projectId,
          projectName: project?.projectName,
          isRead: comm.readBy.includes(args.userId),
          _creationTime: comm._creationTime,
        };
      })
    );
    
    return communicationsWithDetails.sort((a, b) => b._creationTime - a._creationTime);
  },
});

// Broadcast announcement to all users
export const broadcastAnnouncement = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    fromUserId: v.id("users"),
  },
  returns: v.id("communications"),
  handler: async (ctx, args) => {
    // Get all active users
    const allUsers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    const allUserIds = allUsers.map(user => user._id);
    
    const communicationId = await ctx.db.insert("communications", {
      type: "announcement",
      title: args.title,
      content: args.content,
      priority: args.priority,
      fromUserId: args.fromUserId,
      toUserIds: allUserIds,
      readBy: [],
      attachments: [],
    });
    
    return communicationId;
  },
});

// List all notices/communications 
export const listNotices = query({
  args: {
    type: v.optional(v.union(v.literal("notice"), v.literal("message"), v.literal("announcement"))),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("communications"),
      type: v.union(v.literal("notice"), v.literal("message"), v.literal("announcement")),
      title: v.optional(v.string()),
      content: v.string(),
      priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      fromUserId: v.id("users"),
      fromUserName: v.string(),
      projectId: v.optional(v.id("projects")),
      projectName: v.optional(v.string()),
      readCount: v.number(),
      totalRecipients: v.number(),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let communications;
    
    // Filter by type if specified, otherwise get all
    if (args.type) {
      communications = await ctx.db
        .query("communications")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .order("desc")
        .collect();
    } else {
      communications = await ctx.db
        .query("communications")
        .order("desc")
        .collect();
    }
    
    // Apply limit if specified
    const limitedCommunications = args.limit 
      ? communications.slice(0, args.limit)
      : communications;
    
    const communicationsWithDetails = await Promise.all(
      limitedCommunications.map(async (comm) => {
        const fromUser = await ctx.db.get(comm.fromUserId);
        const project = comm.projectId 
          ? await ctx.db.get(comm.projectId)
          : null;
        
        return {
          _id: comm._id,
          type: comm.type,
          title: comm.title,
          content: comm.content,
          priority: comm.priority,
          fromUserId: comm.fromUserId,
          fromUserName: fromUser?.fullName || "Unknown User",
          projectId: comm.projectId,
          projectName: project?.projectName,
          readCount: comm.readBy.length,
          totalRecipients: comm.toUserIds.length,
          _creationTime: comm._creationTime,
        };
      })
    );
    
    return communicationsWithDetails;
  },
});

// Get project notices
export const getProjectNotices = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.array(
    v.object({
      _id: v.id("communications"),
      type: v.union(v.literal("notice"), v.literal("message"), v.literal("announcement")),
      title: v.optional(v.string()),
      content: v.string(),
      priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      fromUserId: v.id("users"),
      fromUserName: v.string(),
      readCount: v.number(),
      totalRecipients: v.number(),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const communications = await ctx.db
      .query("communications")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
    
    const communicationsWithDetails = await Promise.all(
      communications.map(async (comm) => {
        const fromUser = await ctx.db.get(comm.fromUserId);
        
        return {
          _id: comm._id,
          type: comm.type,
          title: comm.title,
          content: comm.content,
          priority: comm.priority,
          fromUserId: comm.fromUserId,
          fromUserName: fromUser?.fullName || "Unknown User",
          readCount: comm.readBy.length,
          totalRecipients: comm.toUserIds.length,
          _creationTime: comm._creationTime,
        };
      })
    );
    
    return communicationsWithDetails;
  },
});