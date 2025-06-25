import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new user
export const createUser = mutation({
  args: {
    email: v.string(),
    fullName: v.string(),
    role: v.union(v.literal("admin"), v.literal("manager"), v.literal("staff"), v.literal("contractor")),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    mobileNumber: v.optional(v.string()),
    iqamaNumber: v.optional(v.string()),
    nationality: v.optional(v.string()),
    passportNumber: v.optional(v.string()),
    joiningDate: v.optional(v.string()),
    insuranceProvider: v.optional(v.string()),
    insurancePolicyNumber: v.optional(v.string()),
    insuranceExpiryDate: v.optional(v.string()),
    qrCodeData: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    // Check if user with email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const userId = await ctx.db.insert("users", {
      ...args,
      isActive: true,
    });
    
    return userId;
  },
});

// Authenticate user (simple email-based lookup for now)
export const authenticateUser = query({
  args: {
    email: v.string(),
  },
  returns: v.union(
    v.object({
      userId: v.id("users"),
      user: v.object({
        email: v.string(),
        fullName: v.string(),
        role: v.union(v.literal("admin"), v.literal("manager"), v.literal("staff"), v.literal("contractor")),
        department: v.optional(v.string()),
        position: v.optional(v.string()),
      }),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    
    if (!user) {
      return null;
    }

    return {
      userId: user._id,
      user: {
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        position: user.position,
      },
    };
  },
});

// Get user by ID
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      email: v.string(),
      fullName: v.string(),
      role: v.union(v.literal("admin"), v.literal("manager"), v.literal("staff"), v.literal("contractor")),
      department: v.optional(v.string()),
      position: v.optional(v.string()),
      mobileNumber: v.optional(v.string()),
      iqamaNumber: v.optional(v.string()),
      nationality: v.optional(v.string()),
      passportNumber: v.optional(v.string()),
      joiningDate: v.optional(v.string()),
      insuranceProvider: v.optional(v.string()),
      insurancePolicyNumber: v.optional(v.string()),
      insuranceExpiryDate: v.optional(v.string()),
      photoId: v.optional(v.id("_storage")),
      medicalInsuranceCard: v.optional(v.id("_storage")),
      qrCodeData: v.optional(v.string()),
      isActive: v.boolean(),
      _creationTime: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

// Update user
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.optional(v.string()),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    mobileNumber: v.optional(v.string()),
    iqamaNumber: v.optional(v.string()),
    nationality: v.optional(v.string()),
    passportNumber: v.optional(v.string()),
    joiningDate: v.optional(v.string()),
    insuranceProvider: v.optional(v.string()),
    insurancePolicyNumber: v.optional(v.string()),
    insuranceExpiryDate: v.optional(v.string()),
    qrCodeData: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(userId, cleanUpdates);
    return null;
  },
});

// List users with filters
export const listUsers = query({
  args: {
    role: v.optional(v.union(v.literal("admin"), v.literal("manager"), v.literal("staff"), v.literal("contractor"))),
    department: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("users"),
      email: v.string(),
      fullName: v.string(),
      role: v.union(v.literal("admin"), v.literal("manager"), v.literal("staff"), v.literal("contractor")),
      department: v.optional(v.string()),
      position: v.optional(v.string()),
      mobileNumber: v.optional(v.string()),
      nationality: v.optional(v.string()),
      joiningDate: v.optional(v.string()),
      isActive: v.boolean(),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let users;
    
    if (args.role) {
      users = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.role!))
        .collect();
    } else if (args.department) {
      users = await ctx.db
        .query("users")
        .withIndex("by_department", (q) => q.eq("department", args.department!))
        .collect();
    } else {
      users = await ctx.db.query("users").collect();
    }
    
    // Apply isActive filter if specified
    const filteredUsers = args.isActive !== undefined 
      ? users.filter(user => user.isActive === args.isActive)
      : users;
    
    return filteredUsers.map(user => ({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      position: user.position,
      mobileNumber: user.mobileNumber,
      nationality: user.nationality,
      joiningDate: user.joiningDate,
      isActive: user.isActive,
      _creationTime: user._creationTime,
    }));
  },
});

// Deactivate user (soft delete)
export const deactivateUser = mutation({
  args: {
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { isActive: false });
    return null;
  },
});

// Reactivate user
export const reactivateUser = mutation({
  args: {
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { isActive: true });
    return null;
  },
});