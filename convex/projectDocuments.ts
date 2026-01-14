import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all project documents with optional filters
export const listProjectDocuments = query({
  args: {
    projectId: v.optional(v.id("projects")),
    documentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let documents;

    if (args.projectId) {
      documents = await ctx.db
        .query("projectDocuments")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .collect();
    } else if (args.documentType) {
      documents = await ctx.db
        .query("projectDocuments")
        .withIndex("by_type", (q) => q.eq("documentType", args.documentType!))
        .collect();
    } else {
      documents = await ctx.db.query("projectDocuments").collect();
    }

    // Enrich with user and project names
    const enrichedDocuments = await Promise.all(
      documents.map(async (doc) => {
        const uploader = await ctx.db.get(doc.uploadedBy);
        const project = await ctx.db.get(doc.projectId);

        // Get file URL
        const fileUrl = await ctx.storage.getUrl(doc.fileId);

        return {
          ...doc,
          uploaderName: uploader?.fullName || "Unknown",
          projectName: project?.projectName || "Unknown",
          fileUrl,
        };
      })
    );

    return enrichedDocuments;
  },
});

// Get a single project document by ID
export const getProjectDocumentById = query({
  args: { id: v.id("projectDocuments") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return null;

    const uploader = await ctx.db.get(doc.uploadedBy);
    const project = await ctx.db.get(doc.projectId);
    const fileUrl = await ctx.storage.getUrl(doc.fileId);

    return {
      ...doc,
      uploaderName: uploader?.fullName || "Unknown",
      projectName: project?.projectName || "Unknown",
      fileUrl,
    };
  },
});

// Generate upload URL for file storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Create a new project document
export const createProjectDocument = mutation({
  args: {
    projectId: v.id("projects"),
    documentType: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    fileId: v.id("_storage"),
    fileName: v.string(),
    uploadedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("projectDocuments", args);
    return documentId;
  },
});

// Update a project document
export const updateProjectDocument = mutation({
  args: {
    id: v.id("projectDocuments"),
    documentType: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Project document not found");

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete a project document
export const deleteProjectDocument = mutation({
  args: { id: v.id("projectDocuments") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (doc) {
      // Delete the file from storage
      await ctx.storage.delete(doc.fileId);
    }
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Get documents for a specific project
export const getDocumentsByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("projectDocuments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const enrichedDocuments = await Promise.all(
      documents.map(async (doc) => {
        const uploader = await ctx.db.get(doc.uploadedBy);
        const fileUrl = await ctx.storage.getUrl(doc.fileId);

        return {
          ...doc,
          uploaderName: uploader?.fullName || "Unknown",
          fileUrl,
        };
      })
    );

    return enrichedDocuments;
  },
});

// Get document stats
export const getDocumentStats = query({
  args: {},
  handler: async (ctx) => {
    const allDocuments = await ctx.db.query("projectDocuments").collect();

    const stats = {
      total: allDocuments.length,
      byType: {} as Record<string, number>,
      byProject: {} as Record<string, number>,
    };

    for (const doc of allDocuments) {
      stats.byType[doc.documentType] = (stats.byType[doc.documentType] || 0) + 1;

      const project = await ctx.db.get(doc.projectId);
      const projectName = project?.projectName || "Unknown";
      stats.byProject[projectName] = (stats.byProject[projectName] || 0) + 1;
    }

    return stats;
  },
});
