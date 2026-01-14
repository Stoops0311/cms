import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ============ NCR (Non-Conformance Report) Functions ============

export const createNCR = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    category: v.union(
      v.literal("Civil"),
      v.literal("Telecom"),
      v.literal("Material"),
      v.literal("Process"),
      v.literal("Safety"),
      v.literal("Other")
    ),
    severity: v.union(
      v.literal("Minor"),
      v.literal("Major"),
      v.literal("Critical")
    ),
    description: v.string(),
    location: v.optional(v.string()),
    detectedBy: v.id("users"),
    detectedDate: v.string(),
  },
  returns: v.id("qualityNCRs"),
  handler: async (ctx, args) => {
    // Generate NCR number
    const existingNCRs = await ctx.db.query("qualityNCRs").collect();
    const ncrNumber = `NCR-${String(existingNCRs.length + 1).padStart(4, "0")}`;

    const ncrId = await ctx.db.insert("qualityNCRs", {
      ...args,
      ncrNumber,
      status: "Open",
    });

    return ncrId;
  },
});

export const updateNCR = mutation({
  args: {
    ncrId: v.id("qualityNCRs"),
    rootCause: v.optional(v.string()),
    correctiveAction: v.optional(v.string()),
    preventiveAction: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("Open"),
        v.literal("Under Investigation"),
        v.literal("Corrective Action"),
        v.literal("Verification"),
        v.literal("Closed")
      )
    ),
    closedBy: v.optional(v.id("users")),
    closedDate: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { ncrId, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    await ctx.db.patch(ncrId, cleanUpdates);
    return null;
  },
});

export const listNCRs = query({
  args: {
    projectId: v.optional(v.id("projects")),
    status: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("qualityNCRs"),
      ncrNumber: v.string(),
      title: v.string(),
      category: v.string(),
      severity: v.string(),
      description: v.string(),
      location: v.optional(v.string()),
      detectedByName: v.string(),
      detectedDate: v.string(),
      rootCause: v.optional(v.string()),
      correctiveAction: v.optional(v.string()),
      status: v.string(),
      projectName: v.optional(v.string()),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let ncrs = await ctx.db.query("qualityNCRs").order("desc").collect();

    if (args.projectId) {
      ncrs = ncrs.filter((n) => n.projectId === args.projectId);
    }
    if (args.status) {
      ncrs = ncrs.filter((n) => n.status === args.status);
    }
    if (args.category) {
      ncrs = ncrs.filter((n) => n.category === args.category);
    }

    const ncrsWithDetails = await Promise.all(
      ncrs.map(async (ncr) => {
        const detectedBy = await ctx.db.get(ncr.detectedBy);
        const project = ncr.projectId ? await ctx.db.get(ncr.projectId) : null;

        return {
          _id: ncr._id,
          ncrNumber: ncr.ncrNumber,
          title: ncr.title,
          category: ncr.category,
          severity: ncr.severity,
          description: ncr.description,
          location: ncr.location,
          detectedByName: detectedBy?.fullName || "Unknown",
          detectedDate: ncr.detectedDate,
          rootCause: ncr.rootCause,
          correctiveAction: ncr.correctiveAction,
          status: ncr.status,
          projectName: project?.projectName,
          _creationTime: ncr._creationTime,
        };
      })
    );

    return ncrsWithDetails;
  },
});

// ============ Material Inspection Functions ============

export const createMaterialInspection = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    materialType: v.string(),
    supplier: v.optional(v.string()),
    batchNumber: v.optional(v.string()),
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    inspectionDate: v.string(),
    inspectedBy: v.id("users"),
    inspectionCriteria: v.string(),
    result: v.union(
      v.literal("Pass"),
      v.literal("Fail"),
      v.literal("Conditional Pass")
    ),
    defectsFound: v.optional(v.string()),
    remarks: v.optional(v.string()),
  },
  returns: v.id("materialInspections"),
  handler: async (ctx, args) => {
    // Generate inspection number
    const existing = await ctx.db.query("materialInspections").collect();
    const inspectionNumber = `MI-${String(existing.length + 1).padStart(4, "0")}`;

    const inspectionId = await ctx.db.insert("materialInspections", {
      ...args,
      inspectionNumber,
    });

    return inspectionId;
  },
});

export const listMaterialInspections = query({
  args: {
    projectId: v.optional(v.id("projects")),
    result: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("materialInspections"),
      inspectionNumber: v.string(),
      materialType: v.string(),
      supplier: v.optional(v.string()),
      batchNumber: v.optional(v.string()),
      quantity: v.optional(v.number()),
      unit: v.optional(v.string()),
      inspectionDate: v.string(),
      inspectedByName: v.string(),
      inspectionCriteria: v.string(),
      result: v.string(),
      defectsFound: v.optional(v.string()),
      remarks: v.optional(v.string()),
      projectName: v.optional(v.string()),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let inspections = await ctx.db
      .query("materialInspections")
      .order("desc")
      .collect();

    if (args.projectId) {
      inspections = inspections.filter((i) => i.projectId === args.projectId);
    }
    if (args.result) {
      inspections = inspections.filter((i) => i.result === args.result);
    }

    const inspectionsWithDetails = await Promise.all(
      inspections.map(async (inspection) => {
        const inspectedBy = await ctx.db.get(inspection.inspectedBy);
        const project = inspection.projectId
          ? await ctx.db.get(inspection.projectId)
          : null;

        return {
          _id: inspection._id,
          inspectionNumber: inspection.inspectionNumber,
          materialType: inspection.materialType,
          supplier: inspection.supplier,
          batchNumber: inspection.batchNumber,
          quantity: inspection.quantity,
          unit: inspection.unit,
          inspectionDate: inspection.inspectionDate,
          inspectedByName: inspectedBy?.fullName || "Unknown",
          inspectionCriteria: inspection.inspectionCriteria,
          result: inspection.result,
          defectsFound: inspection.defectsFound,
          remarks: inspection.remarks,
          projectName: project?.projectName,
          _creationTime: inspection._creationTime,
        };
      })
    );

    return inspectionsWithDetails;
  },
});

// ============ Test Result Functions ============

export const createTestResult = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    testType: v.union(
      v.literal("Concrete Cube"),
      v.literal("Soil Compaction"),
      v.literal("OTDR Fiber"),
      v.literal("Power Level"),
      v.literal("Splice Loss"),
      v.literal("Other")
    ),
    location: v.optional(v.string()),
    sampleId: v.optional(v.string()),
    testDate: v.string(),
    testedBy: v.id("users"),
    testParameters: v.string(),
    resultValue: v.optional(v.string()),
    requiredValue: v.optional(v.string()),
    result: v.union(v.literal("Pass"), v.literal("Fail")),
    remarks: v.optional(v.string()),
  },
  returns: v.id("qualityTestResults"),
  handler: async (ctx, args) => {
    // Generate test number
    const existing = await ctx.db.query("qualityTestResults").collect();
    const testNumber = `QT-${String(existing.length + 1).padStart(4, "0")}`;

    const testId = await ctx.db.insert("qualityTestResults", {
      ...args,
      testNumber,
    });

    return testId;
  },
});

export const listTestResults = query({
  args: {
    projectId: v.optional(v.id("projects")),
    testType: v.optional(v.string()),
    result: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("qualityTestResults"),
      testNumber: v.string(),
      testType: v.string(),
      location: v.optional(v.string()),
      sampleId: v.optional(v.string()),
      testDate: v.string(),
      testedByName: v.string(),
      testParameters: v.string(),
      resultValue: v.optional(v.string()),
      requiredValue: v.optional(v.string()),
      result: v.string(),
      remarks: v.optional(v.string()),
      projectName: v.optional(v.string()),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let tests = await ctx.db.query("qualityTestResults").order("desc").collect();

    if (args.projectId) {
      tests = tests.filter((t) => t.projectId === args.projectId);
    }
    if (args.testType) {
      tests = tests.filter((t) => t.testType === args.testType);
    }
    if (args.result) {
      tests = tests.filter((t) => t.result === args.result);
    }

    const testsWithDetails = await Promise.all(
      tests.map(async (test) => {
        const testedBy = await ctx.db.get(test.testedBy);
        const project = test.projectId ? await ctx.db.get(test.projectId) : null;

        return {
          _id: test._id,
          testNumber: test.testNumber,
          testType: test.testType,
          location: test.location,
          sampleId: test.sampleId,
          testDate: test.testDate,
          testedByName: testedBy?.fullName || "Unknown",
          testParameters: test.testParameters,
          resultValue: test.resultValue,
          requiredValue: test.requiredValue,
          result: test.result,
          remarks: test.remarks,
          projectName: project?.projectName,
          _creationTime: test._creationTime,
        };
      })
    );

    return testsWithDetails;
  },
});

// ============ Dashboard Stats ============

export const getQCStats = query({
  args: {},
  returns: v.object({
    totalNCRs: v.number(),
    openNCRs: v.number(),
    criticalNCRs: v.number(),
    totalInspections: v.number(),
    passedInspections: v.number(),
    failedInspections: v.number(),
    totalTests: v.number(),
    passedTests: v.number(),
    failedTests: v.number(),
  }),
  handler: async (ctx) => {
    const ncrs = await ctx.db.query("qualityNCRs").collect();
    const inspections = await ctx.db.query("materialInspections").collect();
    const tests = await ctx.db.query("qualityTestResults").collect();

    return {
      totalNCRs: ncrs.length,
      openNCRs: ncrs.filter((n) => n.status !== "Closed").length,
      criticalNCRs: ncrs.filter(
        (n) => n.severity === "Critical" && n.status !== "Closed"
      ).length,
      totalInspections: inspections.length,
      passedInspections: inspections.filter((i) => i.result === "Pass").length,
      failedInspections: inspections.filter((i) => i.result === "Fail").length,
      totalTests: tests.length,
      passedTests: tests.filter((t) => t.result === "Pass").length,
      failedTests: tests.filter((t) => t.result === "Fail").length,
    };
  },
});
