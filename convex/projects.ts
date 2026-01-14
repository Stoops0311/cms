import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Create a new project
export const createProject = mutation({
  args: {
    projectName: v.string(),
    projectIDString: v.string(),
    clientInfo: v.object({
      name: v.string(),
      contactPerson: v.string(),
      email: v.string(),
      phone: v.string(),
    }),
    location: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    budgetAllocation: v.string(),
    currency: v.string(),
    taxationInfo: v.string(),
    projectStatus: v.union(
      v.literal("Planning"),
      v.literal("Active"),
      v.literal("On Hold"),
      v.literal("Completed")
    ),
    createdBy: v.id("users"),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const projectId = await ctx.db.insert("projects", {
      ...args,
      drawings: [],
      boq: [],
      legalDocs: [],
      safetyCerts: [],
    });
    
    return projectId;
  },
});

// Update project
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    projectName: v.optional(v.string()),
    projectIDString: v.optional(v.string()),
    clientInfo: v.optional(v.object({
      name: v.string(),
      contactPerson: v.string(),
      email: v.string(),
      phone: v.string(),
    })),
    location: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    budgetAllocation: v.optional(v.string()),
    currency: v.optional(v.string()),
    taxationInfo: v.optional(v.string()),
    projectStatus: v.optional(v.union(
      v.literal("Planning"),
      v.literal("Active"),
      v.literal("On Hold"),
      v.literal("Completed")
    )),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { projectId, ...updates } = args;
    
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(projectId, cleanUpdates);
    return null;
  },
});

// Get project by ID with related data
export const getProjectById = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.union(
    v.object({
      _id: v.id("projects"),
      projectName: v.string(),
      projectIDString: v.string(),
      clientInfo: v.object({
        name: v.string(),
        contactPerson: v.string(),
        email: v.string(),
        phone: v.string(),
      }),
      location: v.string(),
      startDate: v.string(),
      endDate: v.string(),
      budgetAllocation: v.string(),
      currency: v.string(),
      taxationInfo: v.string(),
      projectStatus: v.union(
        v.literal("Planning"),
        v.literal("Active"),
        v.literal("On Hold"),
        v.literal("Completed")
      ),
      createdBy: v.id("users"),
      drawings: v.array(v.id("_storage")),
      boq: v.array(v.id("_storage")),
      legalDocs: v.array(v.id("_storage")),
      safetyCerts: v.array(v.id("_storage")),
      _creationTime: v.number(),
      assignments: v.array(v.object({
        _id: v.id("projectAssignments"),
        role: v.string(),
        userId: v.optional(v.id("users")),
        name: v.string(),
        contact: v.string(),
      })),
      milestones: v.array(v.object({
        _id: v.id("projectMilestones"),
        title: v.string(),
        dueDate: v.string(),
        description: v.string(),
        status: v.union(
          v.literal("Pending"),
          v.literal("In Progress"),
          v.literal("Completed"),
          v.literal("Delayed")
        ),
        completedDate: v.optional(v.string()),
      })),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return null;
    
    // Get assignments
    const assignments = await ctx.db
      .query("projectAssignments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    
    // Get milestones
    const milestones = await ctx.db
      .query("projectMilestones")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("asc")
      .collect();
    
    return {
      ...project,
      assignments: assignments.map(a => ({
        _id: a._id,
        role: a.role,
        userId: a.userId,
        name: a.name,
        contact: a.contact,
      })),
      milestones: milestones.map(m => ({
        _id: m._id,
        title: m.title,
        dueDate: m.dueDate,
        description: m.description,
        status: m.status,
        completedDate: m.completedDate,
      })),
    };
  },
});

// List projects with filters
export const listProjects = query({
  args: {
    status: v.optional(v.union(
      v.literal("Planning"),
      v.literal("Active"),
      v.literal("On Hold"),
      v.literal("Completed")
    )),
    clientName: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("projects"),
      projectName: v.string(),
      projectIDString: v.string(),
      clientInfo: v.object({
        name: v.string(),
        contactPerson: v.string(),
        email: v.string(),
        phone: v.string(),
      }),
      location: v.string(),
      startDate: v.string(),
      endDate: v.string(),
      budgetAllocation: v.string(),
      currency: v.string(),
      projectStatus: v.union(
        v.literal("Planning"),
        v.literal("Active"),
        v.literal("On Hold"),
        v.literal("Completed")
      ),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let projects;
    
    if (args.status) {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_status", (q) => q.eq("projectStatus", args.status!))
        .collect();
    } else {
      projects = await ctx.db.query("projects").collect();
    }
    
    // Apply client name filter if specified
    const filteredProjects = args.clientName 
      ? projects.filter(p => p.clientInfo.name.toLowerCase().includes(args.clientName!.toLowerCase()))
      : projects;
    
    return filteredProjects.map(p => ({
      _id: p._id,
      projectName: p.projectName,
      projectIDString: p.projectIDString,
      clientInfo: p.clientInfo,
      location: p.location,
      startDate: p.startDate,
      endDate: p.endDate,
      budgetAllocation: p.budgetAllocation,
      currency: p.currency,
      projectStatus: p.projectStatus,
      _creationTime: p._creationTime,
    }));
  },
});

// Add project assignment
export const createProjectAssignment = mutation({
  args: {
    projectId: v.id("projects"),
    role: v.string(),
    userId: v.optional(v.id("users")),
    name: v.string(),
    contact: v.string(),
    assignedBy: v.id("users"),
  },
  returns: v.id("projectAssignments"),
  handler: async (ctx, args) => {
    const assignmentId = await ctx.db.insert("projectAssignments", args);
    return assignmentId;
  },
});

// Update project assignment
export const updateProjectAssignment = mutation({
  args: {
    assignmentId: v.id("projectAssignments"),
    role: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    name: v.optional(v.string()),
    contact: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { assignmentId, ...updates } = args;
    
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(assignmentId, cleanUpdates);
    return null;
  },
});

// Remove project assignment
export const removeProjectAssignment = mutation({
  args: {
    assignmentId: v.id("projectAssignments"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.assignmentId);
    return null;
  },
});

// Create project milestone
export const createProjectMilestone = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    dueDate: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("Pending"),
      v.literal("In Progress"),
      v.literal("Completed"),
      v.literal("Delayed")
    ),
    createdBy: v.id("users"),
  },
  returns: v.id("projectMilestones"),
  handler: async (ctx, args) => {
    const milestoneId = await ctx.db.insert("projectMilestones", {
      ...args,
      completedDate: undefined,
    });
    return milestoneId;
  },
});

// Update project milestone
export const updateProjectMilestone = mutation({
  args: {
    milestoneId: v.id("projectMilestones"),
    title: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("Pending"),
      v.literal("In Progress"),
      v.literal("Completed"),
      v.literal("Delayed")
    )),
    completedDate: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { milestoneId, ...updates } = args;
    
    // If status is being set to Completed, set completedDate
    if (updates.status === "Completed" && !updates.completedDate) {
      updates.completedDate = new Date().toISOString();
    }
    
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(milestoneId, cleanUpdates);
    return null;
  },
});

// Get project dashboard stats
export const getProjectDashboardStats = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.object({
    totalBudget: v.string(),
    assignmentCount: v.number(),
    completedMilestones: v.number(),
    totalMilestones: v.number(),
    daysSinceStart: v.number(),
    daysRemaining: v.number(),
    documentCount: v.number(),
  }),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    
    // Get assignment count
    const assignments = await ctx.db
      .query("projectAssignments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    
    // Get milestone stats
    const milestones = await ctx.db
      .query("projectMilestones")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    
    const completedMilestones = milestones.filter(m => m.status === "Completed").length;
    
    // Calculate days
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const today = new Date();
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Count documents
    const documentCount = project.drawings.length + project.boq.length + 
                         project.legalDocs.length + project.safetyCerts.length;
    
    return {
      totalBudget: project.budgetAllocation,
      assignmentCount: assignments.length,
      completedMilestones,
      totalMilestones: milestones.length,
      daysSinceStart: Math.max(0, daysSinceStart),
      daysRemaining: Math.max(0, daysRemaining),
      documentCount,
    };
  },
});

// Get next milestone for a project (first non-completed milestone by due date)
export const getNextMilestone = query({
  args: { projectId: v.id("projects") },
  returns: v.union(
    v.object({
      _id: v.id("projectMilestones"),
      title: v.string(),
      dueDate: v.string(),
      status: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // Get all non-completed milestones for this project, ordered by due date
    const milestones = await ctx.db
      .query("projectMilestones")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Filter to non-completed and sort by due date
    const pendingMilestones = milestones
      .filter(m => m.status !== "Completed")
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    if (pendingMilestones.length === 0) {
      return null;
    }

    const next = pendingMilestones[0];
    return {
      _id: next._id,
      title: next.title,
      dueDate: next.dueDate,
      status: next.status,
    };
  },
});

// Get next milestones for multiple projects (batch query for dashboard)
export const getProjectsNextMilestones = query({
  args: { projectIds: v.array(v.id("projects")) },
  returns: v.array(v.object({
    projectId: v.id("projects"),
    nextMilestone: v.union(v.string(), v.null()),
  })),
  handler: async (ctx, args) => {
    const results = await Promise.all(
      args.projectIds.map(async (projectId) => {
        const milestones = await ctx.db
          .query("projectMilestones")
          .withIndex("by_project", (q) => q.eq("projectId", projectId))
          .collect();

        const pendingMilestones = milestones
          .filter(m => m.status !== "Completed")
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        return {
          projectId,
          nextMilestone: pendingMilestones.length > 0 ? pendingMilestones[0].title : null,
        };
      })
    );

    return results;
  },
});