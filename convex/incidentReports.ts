import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all incident reports with optional filters
export const listIncidentReports = query({
  args: {
    status: v.optional(v.string()),
    severity: v.optional(v.string()),
    incidentType: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    let reports;

    if (args.status) {
      reports = await ctx.db
        .query("incidentReports")
        .withIndex("by_status", (q) => q.eq("status", args.status as "Open" | "Under Investigation" | "Resolved" | "Closed"))
        .collect();
    } else if (args.severity) {
      reports = await ctx.db
        .query("incidentReports")
        .withIndex("by_severity", (q) => q.eq("severity", args.severity as "Minor" | "Moderate" | "Serious" | "Critical"))
        .collect();
    } else if (args.incidentType) {
      reports = await ctx.db
        .query("incidentReports")
        .withIndex("by_type", (q) => q.eq("incidentType", args.incidentType!))
        .collect();
    } else if (args.projectId) {
      reports = await ctx.db
        .query("incidentReports")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .collect();
    } else {
      reports = await ctx.db.query("incidentReports").collect();
    }

    // Enrich with user and project names
    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        const reporter = await ctx.db.get(report.reportedBy);
        const project = report.projectId ? await ctx.db.get(report.projectId) : null;

        return {
          ...report,
          reporterName: reporter?.fullName || "Unknown",
          projectName: project?.projectName || null,
        };
      })
    );

    return enrichedReports;
  },
});

// Get a single incident report by ID
export const getIncidentReportById = query({
  args: { id: v.id("incidentReports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.id);
    if (!report) return null;

    const reporter = await ctx.db.get(report.reportedBy);
    const project = report.projectId ? await ctx.db.get(report.projectId) : null;

    return {
      ...report,
      reporterName: reporter?.fullName || "Unknown",
      projectName: project?.projectName || null,
    };
  },
});

// Create a new incident report
export const createIncidentReport = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    location: v.string(),
    incidentDate: v.string(),
    incidentTime: v.string(),
    incidentType: v.string(),
    severity: v.union(
      v.literal("Minor"),
      v.literal("Moderate"),
      v.literal("Serious"),
      v.literal("Critical")
    ),
    description: v.string(),
    personsInvolved: v.array(v.string()),
    witnesses: v.optional(v.array(v.string())),
    immediateActions: v.string(),
    rootCause: v.optional(v.string()),
    preventiveMeasures: v.optional(v.string()),
    reportedBy: v.id("users"),
    photos: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const reportId = await ctx.db.insert("incidentReports", {
      ...args,
      status: "Open",
    });
    return reportId;
  },
});

// Update an incident report
export const updateIncidentReport = mutation({
  args: {
    id: v.id("incidentReports"),
    location: v.optional(v.string()),
    incidentDate: v.optional(v.string()),
    incidentTime: v.optional(v.string()),
    incidentType: v.optional(v.string()),
    severity: v.optional(v.union(
      v.literal("Minor"),
      v.literal("Moderate"),
      v.literal("Serious"),
      v.literal("Critical")
    )),
    description: v.optional(v.string()),
    personsInvolved: v.optional(v.array(v.string())),
    witnesses: v.optional(v.array(v.string())),
    immediateActions: v.optional(v.string()),
    rootCause: v.optional(v.string()),
    preventiveMeasures: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("Open"),
      v.literal("Under Investigation"),
      v.literal("Resolved"),
      v.literal("Closed")
    )),
    photos: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Incident report not found");

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Update incident status
export const updateIncidentStatus = mutation({
  args: {
    id: v.id("incidentReports"),
    status: v.union(
      v.literal("Open"),
      v.literal("Under Investigation"),
      v.literal("Resolved"),
      v.literal("Closed")
    ),
    rootCause: v.optional(v.string()),
    preventiveMeasures: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Incident report not found");

    await ctx.db.patch(args.id, {
      status: args.status,
      rootCause: args.rootCause || existing.rootCause,
      preventiveMeasures: args.preventiveMeasures || existing.preventiveMeasures,
    });
    return args.id;
  },
});

// Delete an incident report
export const deleteIncidentReport = mutation({
  args: { id: v.id("incidentReports") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Get incident report stats
export const getIncidentStats = query({
  args: {},
  handler: async (ctx) => {
    const allReports = await ctx.db.query("incidentReports").collect();

    const stats = {
      total: allReports.length,
      open: allReports.filter((r) => r.status === "Open").length,
      underInvestigation: allReports.filter((r) => r.status === "Under Investigation").length,
      resolved: allReports.filter((r) => r.status === "Resolved").length,
      closed: allReports.filter((r) => r.status === "Closed").length,
      bySeverity: {
        Minor: allReports.filter((r) => r.severity === "Minor").length,
        Moderate: allReports.filter((r) => r.severity === "Moderate").length,
        Serious: allReports.filter((r) => r.severity === "Serious").length,
        Critical: allReports.filter((r) => r.severity === "Critical").length,
      },
      byType: {} as Record<string, number>,
    };

    allReports.forEach((r) => {
      stats.byType[r.incidentType] = (stats.byType[r.incidentType] || 0) + 1;
    });

    return stats;
  },
});
