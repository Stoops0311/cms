import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate upload URL for file storage
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Store file reference after upload
export const storeFile = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    uploadedBy: v.id("users"),
    category: v.optional(v.string()),
    relatedId: v.optional(v.string()),
    relatedType: v.optional(v.string()),
  },
  returns: v.object({
    storageId: v.id("_storage"),
    url: v.string(),
  }),
  handler: async (ctx, args) => {
    // Get URL for the stored file
    const url = await ctx.storage.getUrl(args.storageId);
    
    if (!url) {
      throw new Error("File not found in storage");
    }
    
    // You could store additional metadata in a separate table if needed
    // For now, returning the storage ID and URL
    
    return {
      storageId: args.storageId,
      url,
    };
  },
});

// Get file URL by storage ID
export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Get multiple file URLs
export const getFileUrls = query({
  args: {
    storageIds: v.array(v.id("_storage")),
  },
  returns: v.array(
    v.object({
      storageId: v.id("_storage"),
      url: v.union(v.string(), v.null()),
    })
  ),
  handler: async (ctx, args) => {
    const urls = await Promise.all(
      args.storageIds.map(async (storageId) => ({
        storageId,
        url: await ctx.storage.getUrl(storageId),
      }))
    );
    
    return urls;
  },
});

// Delete file from storage
export const deleteFile = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
    return null;
  },
});

// Upload file metadata helper for project documents
export const addProjectDocument = mutation({
  args: {
    projectId: v.id("projects"),
    storageId: v.id("_storage"),
    documentType: v.union(v.literal("drawings"), v.literal("boq"), v.literal("legalDocs"), v.literal("safetyCerts")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    const currentDocs = project[args.documentType] || [];
    await ctx.db.patch(args.projectId, {
      [args.documentType]: [...currentDocs, args.storageId],
    });
    
    return null;
  },
});

// Remove project document
export const removeProjectDocument = mutation({
  args: {
    projectId: v.id("projects"),
    storageId: v.id("_storage"),
    documentType: v.union(v.literal("drawings"), v.literal("boq"), v.literal("legalDocs"), v.literal("safetyCerts")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    const currentDocs = project[args.documentType] || [];
    await ctx.db.patch(args.projectId, {
      [args.documentType]: currentDocs.filter(id => id !== args.storageId),
    });
    
    // Delete the file from storage
    await ctx.storage.delete(args.storageId);
    
    return null;
  },
});

// Add attachment to communication
export const addCommunicationAttachment = mutation({
  args: {
    communicationId: v.id("communications"),
    storageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const communication = await ctx.db.get(args.communicationId);
    if (!communication) {
      throw new Error("Communication not found");
    }
    
    await ctx.db.patch(args.communicationId, {
      attachments: [...communication.attachments, args.storageId],
    });
    
    return null;
  },
});