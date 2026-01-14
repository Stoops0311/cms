import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new HR document
export const createHRDocument = mutation({
  args: {
    userId: v.id("users"),
    documentType: v.string(),
    documentNumber: v.string(),
    expiryDate: v.optional(v.string()),
    insuranceProvider: v.optional(v.string()),
    fileId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("hrDocuments", args);
    return documentId;
  },
});

// Update an HR document
export const updateHRDocument = mutation({
  args: {
    id: v.id("hrDocuments"),
    documentType: v.optional(v.string()),
    documentNumber: v.optional(v.string()),
    expiryDate: v.optional(v.string()),
    insuranceProvider: v.optional(v.string()),
    fileId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
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

// Delete an HR document
export const deleteHRDocument = mutation({
  args: { id: v.id("hrDocuments") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    // Delete associated file if exists
    if (doc?.fileId) {
      await ctx.storage.delete(doc.fileId);
    }
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// List HR documents with optional filters
export const listHRDocuments = query({
  args: {
    userId: v.optional(v.id("users")),
    documentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let documents;

    if (args.userId) {
      documents = await ctx.db
        .query("hrDocuments")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!))
        .collect();
    } else if (args.documentType) {
      documents = await ctx.db
        .query("hrDocuments")
        .withIndex("by_type", (q) => q.eq("documentType", args.documentType!))
        .collect();
    } else {
      documents = await ctx.db.query("hrDocuments").collect();
    }

    // Enrich with user data and file URLs
    const enrichedDocuments = await Promise.all(
      documents.map(async (doc) => {
        const user = await ctx.db.get(doc.userId);
        const fileUrl = doc.fileId ? await ctx.storage.getUrl(doc.fileId) : null;
        return {
          ...doc,
          staffName: user?.fullName || "Unknown",
          staffId: user?._id,
          fileUrl,
        };
      })
    );

    return enrichedDocuments;
  },
});

// Get expiring documents (within specified days)
export const getExpiringDocuments = query({
  args: {
    daysUntilExpiry: v.number(),
  },
  handler: async (ctx, args) => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + args.daysUntilExpiry);

    const todayStr = today.toISOString().split("T")[0];
    const futureDateStr = futureDate.toISOString().split("T")[0];

    const documents = await ctx.db.query("hrDocuments").collect();

    const expiringDocs = documents.filter(
      (doc) => doc.expiryDate && doc.expiryDate >= todayStr && doc.expiryDate <= futureDateStr
    );

    // Enrich with user data
    const enrichedDocuments = await Promise.all(
      expiringDocs.map(async (doc) => {
        const user = await ctx.db.get(doc.userId);
        return {
          ...doc,
          staffName: user?.fullName || "Unknown",
          staffEmail: user?.email || "Unknown",
        };
      })
    );

    return enrichedDocuments;
  },
});

// Get expired documents
export const getExpiredDocuments = query({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];
    const documents = await ctx.db.query("hrDocuments").collect();

    const expiredDocs = documents.filter(
      (doc) => doc.expiryDate && doc.expiryDate < today
    );

    // Enrich with user data
    const enrichedDocuments = await Promise.all(
      expiredDocs.map(async (doc) => {
        const user = await ctx.db.get(doc.userId);
        return {
          ...doc,
          staffName: user?.fullName || "Unknown",
          staffEmail: user?.email || "Unknown",
        };
      })
    );

    return enrichedDocuments;
  },
});

// Get document statistics
export const getDocumentStats = query({
  args: {},
  handler: async (ctx) => {
    const documents = await ctx.db.query("hrDocuments").collect();
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const thirtyDaysStr = thirtyDaysFromNow.toISOString().split("T")[0];

    const stats = {
      total: documents.length,
      expired: documents.filter((d) => d.expiryDate && d.expiryDate < today).length,
      expiringSoon: documents.filter(
        (d) => d.expiryDate && d.expiryDate >= today && d.expiryDate <= thirtyDaysStr
      ).length,
      valid: documents.filter((d) => !d.expiryDate || d.expiryDate > thirtyDaysStr).length,
      byType: {} as Record<string, number>,
    };

    // Count by document type
    documents.forEach((doc) => {
      stats.byType[doc.documentType] = (stats.byType[doc.documentType] || 0) + 1;
    });

    return stats;
  },
});
