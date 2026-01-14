import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ==================== PPE Reports ====================

// Create a PPE compliance report
export const createPPEReport = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    siteLocation: v.string(),
    ppeType: v.string(),
    isCompliant: v.boolean(),
    reportedBy: v.id("users"),
    notes: v.optional(v.string()),
    photos: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const reportId = await ctx.db.insert("ppeReports", args);
    return reportId;
  },
});

// Update a PPE report
export const updatePPEReport = mutation({
  args: {
    id: v.id("ppeReports"),
    siteLocation: v.optional(v.string()),
    ppeType: v.optional(v.string()),
    isCompliant: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    photos: v.optional(v.array(v.id("_storage"))),
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

// Delete a PPE report
export const deletePPEReport = mutation({
  args: { id: v.id("ppeReports") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// List PPE reports with optional filters
export const listPPEReports = query({
  args: {
    projectId: v.optional(v.id("projects")),
    ppeType: v.optional(v.string()),
    isCompliant: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let reports;

    if (args.projectId) {
      reports = await ctx.db
        .query("ppeReports")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .collect();
    } else if (args.ppeType) {
      reports = await ctx.db
        .query("ppeReports")
        .withIndex("by_type", (q) => q.eq("ppeType", args.ppeType!))
        .collect();
    } else {
      reports = await ctx.db.query("ppeReports").collect();
    }

    // Apply compliance filter
    if (args.isCompliant !== undefined) {
      reports = reports.filter((r) => r.isCompliant === args.isCompliant);
    }

    // Enrich with user and project data
    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        const reporter = await ctx.db.get(report.reportedBy);
        const project = report.projectId ? await ctx.db.get(report.projectId) : null;
        const photoUrls = report.photos
          ? await Promise.all(report.photos.map((p) => ctx.storage.getUrl(p)))
          : [];
        return {
          ...report,
          reporterName: reporter?.fullName || "Unknown",
          projectName: project?.projectName || null,
          photoUrls,
        };
      })
    );

    return enrichedReports;
  },
});

// ==================== Hazard Reports ====================

// Create a hazard report
export const createHazardReport = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    siteLocation: v.string(),
    hazardType: v.string(),
    severity: v.union(
      v.literal("Low"),
      v.literal("Medium"),
      v.literal("High"),
      v.literal("Critical")
    ),
    description: v.string(),
    reportedBy: v.id("users"),
    status: v.union(
      v.literal("Open"),
      v.literal("In Progress"),
      v.literal("Resolved")
    ),
    resolutionNotes: v.optional(v.string()),
    photos: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const reportId = await ctx.db.insert("hazardReports", args);
    return reportId;
  },
});

// Update a hazard report
export const updateHazardReport = mutation({
  args: {
    id: v.id("hazardReports"),
    siteLocation: v.optional(v.string()),
    hazardType: v.optional(v.string()),
    severity: v.optional(
      v.union(
        v.literal("Low"),
        v.literal("Medium"),
        v.literal("High"),
        v.literal("Critical")
      )
    ),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("Open"),
        v.literal("In Progress"),
        v.literal("Resolved")
      )
    ),
    resolutionNotes: v.optional(v.string()),
    photos: v.optional(v.array(v.id("_storage"))),
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

// Delete a hazard report
export const deleteHazardReport = mutation({
  args: { id: v.id("hazardReports") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// List hazard reports with optional filters
export const listHazardReports = query({
  args: {
    projectId: v.optional(v.id("projects")),
    severity: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let reports;

    if (args.projectId) {
      reports = await ctx.db
        .query("hazardReports")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .collect();
    } else if (args.status) {
      reports = await ctx.db
        .query("hazardReports")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    } else if (args.severity) {
      reports = await ctx.db
        .query("hazardReports")
        .withIndex("by_severity", (q) => q.eq("severity", args.severity as any))
        .collect();
    } else {
      reports = await ctx.db.query("hazardReports").collect();
    }

    // Apply additional filters
    if (args.severity && args.projectId) {
      reports = reports.filter((r) => r.severity === args.severity);
    }
    if (args.status && args.projectId) {
      reports = reports.filter((r) => r.status === args.status);
    }

    // Enrich with user and project data
    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        const reporter = await ctx.db.get(report.reportedBy);
        const project = report.projectId ? await ctx.db.get(report.projectId) : null;
        const photoUrls = report.photos
          ? await Promise.all(report.photos.map((p) => ctx.storage.getUrl(p)))
          : [];
        return {
          ...report,
          reporterName: reporter?.fullName || "Unknown",
          projectName: project?.projectName || null,
          photoUrls,
        };
      })
    );

    return enrichedReports;
  },
});

// Resolve a hazard
export const resolveHazard = mutation({
  args: {
    id: v.id("hazardReports"),
    resolutionNotes: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "Resolved",
      resolutionNotes: args.resolutionNotes,
    });
    return args.id;
  },
});

// ==================== Safety Statistics ====================

// Get safety dashboard statistics
export const getSafetyStats = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    let ppeReports = await ctx.db.query("ppeReports").collect();
    let hazardReports = await ctx.db.query("hazardReports").collect();

    if (args.projectId) {
      ppeReports = ppeReports.filter((r) => r.projectId === args.projectId);
      hazardReports = hazardReports.filter((r) => r.projectId === args.projectId);
    }

    const ppeStats = {
      total: ppeReports.length,
      compliant: ppeReports.filter((r) => r.isCompliant).length,
      nonCompliant: ppeReports.filter((r) => !r.isCompliant).length,
      complianceRate: ppeReports.length > 0
        ? Math.round((ppeReports.filter((r) => r.isCompliant).length / ppeReports.length) * 100)
        : 100,
      byType: {} as Record<string, { compliant: number; nonCompliant: number }>,
    };

    // PPE stats by type
    ppeReports.forEach((report) => {
      if (!ppeStats.byType[report.ppeType]) {
        ppeStats.byType[report.ppeType] = { compliant: 0, nonCompliant: 0 };
      }
      if (report.isCompliant) {
        ppeStats.byType[report.ppeType].compliant++;
      } else {
        ppeStats.byType[report.ppeType].nonCompliant++;
      }
    });

    const hazardStats = {
      total: hazardReports.length,
      open: hazardReports.filter((r) => r.status === "Open").length,
      inProgress: hazardReports.filter((r) => r.status === "In Progress").length,
      resolved: hazardReports.filter((r) => r.status === "Resolved").length,
      bySeverity: {
        low: hazardReports.filter((r) => r.severity === "Low").length,
        medium: hazardReports.filter((r) => r.severity === "Medium").length,
        high: hazardReports.filter((r) => r.severity === "High").length,
        critical: hazardReports.filter((r) => r.severity === "Critical").length,
      },
      byType: {} as Record<string, number>,
    };

    // Hazard stats by type
    hazardReports.forEach((report) => {
      hazardStats.byType[report.hazardType] = (hazardStats.byType[report.hazardType] || 0) + 1;
    });

    return {
      ppe: ppeStats,
      hazards: hazardStats,
      overallRiskLevel: hazardStats.open > 0 && (hazardReports.some((r) => r.status !== "Resolved" && (r.severity === "High" || r.severity === "Critical")))
        ? "High"
        : hazardStats.open > 0
        ? "Medium"
        : "Low",
    };
  },
});
