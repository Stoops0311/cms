import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new contractor
export const createContractor = mutation({
  args: {
    companyName: v.string(),
    businessLicense: v.string(),
    nationality: v.string(),
    categories: v.array(v.string()),
    contactPerson: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    previousProjects: v.string(),
    rating: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  returns: v.id("contractors"),
  handler: async (ctx, args) => {
    // Check if contractor already exists
    const existingContractor = await ctx.db
      .query("contractors")
      .withIndex("by_company", (q) => q.eq("companyName", args.companyName))
      .first();
    
    if (existingContractor) {
      throw new Error("Contractor with this company name already exists");
    }
    
    const contractorId = await ctx.db.insert("contractors", {
      ...args,
      documents: [],
      isActive: true,
    });
    
    return contractorId;
  },
});

// Update contractor
export const updateContractor = mutation({
  args: {
    contractorId: v.id("contractors"),
    companyName: v.optional(v.string()),
    businessLicense: v.optional(v.string()),
    nationality: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    contactPerson: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    previousProjects: v.optional(v.string()),
    rating: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { contractorId, ...updates } = args;
    
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(contractorId, cleanUpdates);
    return null;
  },
});

// Get contractor by ID
export const getContractorById = query({
  args: {
    contractorId: v.id("contractors"),
  },
  returns: v.union(
    v.object({
      _id: v.id("contractors"),
      companyName: v.string(),
      businessLicense: v.string(),
      nationality: v.string(),
      categories: v.array(v.string()),
      contactPerson: v.string(),
      email: v.string(),
      phone: v.string(),
      address: v.string(),
      previousProjects: v.string(),
      rating: v.optional(v.string()),
      documents: v.array(v.id("_storage")),
      createdBy: v.id("users"),
      isActive: v.boolean(),
      _creationTime: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const contractor = await ctx.db.get(args.contractorId);
    return contractor;
  },
});

// List contractors with filters
export const listContractors = query({
  args: {
    category: v.optional(v.string()),
    rating: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("contractors"),
      companyName: v.string(),
      businessLicense: v.string(),
      nationality: v.string(),
      categories: v.array(v.string()),
      contactPerson: v.string(),
      email: v.string(),
      phone: v.string(),
      address: v.string(),
      rating: v.optional(v.string()),
      isActive: v.boolean(),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let contractors = await ctx.db.query("contractors").collect();
    
    // Apply filters
    if (args.category) {
      contractors = contractors.filter(c => c.categories.includes(args.category!));
    }
    
    if (args.rating) {
      contractors = contractors.filter(c => c.rating === args.rating);
    }
    
    if (args.isActive !== undefined) {
      contractors = contractors.filter(c => c.isActive === args.isActive);
    }
    
    return contractors.map(c => ({
      _id: c._id,
      companyName: c.companyName,
      businessLicense: c.businessLicense,
      nationality: c.nationality,
      categories: c.categories,
      contactPerson: c.contactPerson,
      email: c.email,
      phone: c.phone,
      address: c.address,
      rating: c.rating,
      isActive: c.isActive,
      _creationTime: c._creationTime,
    }));
  },
});

// Update contractor rating
export const rateContractor = mutation({
  args: {
    contractorId: v.id("contractors"),
    rating: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.contractorId, { rating: args.rating });
    return null;
  },
});

// Deactivate contractor
export const deactivateContractor = mutation({
  args: {
    contractorId: v.id("contractors"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.contractorId, { isActive: false });
    return null;
  },
});

// Reactivate contractor
export const reactivateContractor = mutation({
  args: {
    contractorId: v.id("contractors"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.contractorId, { isActive: true });
    return null;
  },
});