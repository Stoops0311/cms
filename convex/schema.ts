import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table for authentication and staff management
  users: defineTable({
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
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_department", ["department"]),

  // Projects table
  projects: defineTable({
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
  })
    .index("by_status", ["projectStatus"])
    .index("by_client", ["clientInfo.name"])
    .index("by_created", ["createdBy"]),

  // Contractors table
  contractors: defineTable({
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
  })
    .index("by_company", ["companyName"])
    .index("by_categories", ["categories"])
    .index("by_rating", ["rating"]),

  // Equipment table
  equipment: defineTable({
    name: v.string(),
    type: v.string(),
    identifier: v.string(),
    status: v.union(
      v.literal("Available"),
      v.literal("In Use"),
      v.literal("Maintenance"),
      v.literal("Unavailable")
    ),
    lastMaintenance: v.optional(v.string()),
    nextMaintenance: v.optional(v.string()),
    location: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_identifier", ["identifier"]),

  // Equipment Dispatches table
  equipmentDispatches: defineTable({
    equipmentId: v.id("equipment"),
    projectId: v.id("projects"),
    dispatchDate: v.string(),
    expectedReturnDate: v.optional(v.string()),
    actualReturnDate: v.optional(v.string()),
    notes: v.string(),
    dispatchStatus: v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Dispatched"),
      v.literal("Returned"),
      v.literal("Cancelled")
    ),
    createdBy: v.id("users"),
    approvedBy: v.optional(v.id("users")),
  })
    .index("by_equipment", ["equipmentId"])
    .index("by_project", ["projectId"])
    .index("by_status", ["dispatchStatus"])
    .index("by_dispatch_date", ["dispatchDate"]),

  // Inventory table
  inventory: defineTable({
    name: v.string(),
    quantity: v.number(),
    batchNo: v.string(),
    expiryDate: v.optional(v.string()),
    lowStockThreshold: v.number(),
    location: v.string(),
    unit: v.string(),
    category: v.string(),
    createdBy: v.id("users"),
  })
    .index("by_name", ["name"])
    .index("by_location", ["location"])
    .index("by_category", ["category"])
    .index("by_batch", ["batchNo"]),

  // Inventory Logs table
  inventoryLogs: defineTable({
    itemId: v.id("inventory"),
    quantityChanged: v.number(),
    reason: v.string(),
    type: v.union(v.literal("addition"), v.literal("deduction"), v.literal("transfer")),
    staffId: v.id("users"),
    patientId: v.optional(v.string()),
    fromLocation: v.optional(v.string()),
    toLocation: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_item", ["itemId"])
    .index("by_type", ["type"])
    .index("by_staff", ["staffId"]),

  // Inventory Requests table
  inventoryRequests: defineTable({
    requestingUnit: v.string(),
    requestedBy: v.id("users"),
    items: v.array(
      v.object({
        itemId: v.id("inventory"),
        quantityRequested: v.number(),
        unitOfMeasure: v.string(),
      })
    ),
    status: v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Rejected"),
      v.literal("Fulfilled")
    ),
    notes: v.string(),
    approvedBy: v.optional(v.id("users")),
    fulfilledBy: v.optional(v.id("users")),
  })
    .index("by_status", ["status"])
    .index("by_requester", ["requestedBy"])
    .index("by_unit", ["requestingUnit"]),

  // Project Assignments table
  projectAssignments: defineTable({
    projectId: v.id("projects"),
    role: v.string(),
    userId: v.optional(v.id("users")),
    name: v.string(),
    contact: v.string(),
    assignedBy: v.id("users"),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_role", ["role"]),

  // Project Milestones table
  projectMilestones: defineTable({
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
    completedDate: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_due_date", ["dueDate"]),

  // Purchase Requests table
  purchaseRequests: defineTable({
    requestedBy: v.id("users"),
    department: v.string(),
    projectId: v.optional(v.id("projects")),
    items: v.array(
      v.object({
        itemName: v.string(),
        quantity: v.number(),
        unit: v.string(),
        estimatedCost: v.number(),
        supplier: v.optional(v.string()),
      })
    ),
    justification: v.string(),
    status: v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Rejected"),
      v.literal("Ordered")
    ),
    totalEstimatedCost: v.number(),
    approvedBy: v.optional(v.id("users")),
  })
    .index("by_status", ["status"])
    .index("by_requester", ["requestedBy"])
    .index("by_department", ["department"])
    .index("by_project", ["projectId"]),

  // Attendance table
  attendance: defineTable({
    userId: v.id("users"),
    date: v.string(),
    checkIn: v.string(),
    checkOut: v.optional(v.string()),
    status: v.union(
      v.literal("Present"),
      v.literal("Absent"),
      v.literal("Late"),
      v.literal("Leave")
    ),
    projectId: v.optional(v.id("projects")),
    location: v.string(),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["date"])
    .index("by_project", ["projectId"])
    .index("by_user_date", ["userId", "date"]),

  // Daily Logs table
  dailyLogs: defineTable({
    projectId: v.id("projects"),
    date: v.string(),
    weather: v.string(),
    workCompleted: v.string(),
    issues: v.string(),
    safetyIncidents: v.string(),
    manpowerCount: v.number(),
    equipmentUsed: v.array(v.string()),
    materialsUsed: v.array(
      v.object({
        materialId: v.id("inventory"),
        quantity: v.number(),
      })
    ),
    createdBy: v.id("users"),
    photos: v.array(v.id("_storage")),
  })
    .index("by_project", ["projectId"])
    .index("by_date", ["date"])
    .index("by_project_date", ["projectId", "date"]),

  // Legal Agreements table
  legalAgreements: defineTable({
    agreementType: v.string(),
    title: v.string(),
    parties: v.array(
      v.object({
        name: v.string(),
        role: v.string(),
        representative: v.string(),
        contact: v.string(),
      })
    ),
    effectiveDate: v.string(),
    expiryDate: v.optional(v.string()),
    value: v.optional(v.number()),
    currency: v.string(),
    status: v.union(
      v.literal("Draft"),
      v.literal("Active"),
      v.literal("Expired"),
      v.literal("Terminated")
    ),
    obligations: v.array(v.string()),
    standardClauses: v.array(v.string()),
    documents: v.array(v.id("_storage")),
    createdBy: v.id("users"),
    projectId: v.optional(v.id("projects")),
  })
    .index("by_type", ["agreementType"])
    .index("by_status", ["status"])
    .index("by_project", ["projectId"])
    .index("by_expiry", ["expiryDate"]),

  // Communications table
  communications: defineTable({
    type: v.union(v.literal("notice"), v.literal("message"), v.literal("announcement")),
    title: v.optional(v.string()),
    content: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    fromUserId: v.id("users"),
    toUserIds: v.array(v.id("users")),
    projectId: v.optional(v.id("projects")),
    readBy: v.array(v.id("users")),
    attachments: v.array(v.id("_storage")),
  })
    .index("by_type", ["type"])
    .index("by_from", ["fromUserId"])
    .index("by_priority", ["priority"])
    .index("by_project", ["projectId"]),

  // Expense Claims table
  expenseClaims: defineTable({
    claimantId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    claimDate: v.string(),
    items: v.array(
      v.object({
        description: v.string(),
        amount: v.number(),
        category: v.string(),
        receipt: v.optional(v.id("_storage")),
      })
    ),
    totalAmount: v.number(),
    status: v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Rejected"),
      v.literal("Paid")
    ),
    approvedBy: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  })
    .index("by_claimant", ["claimantId"])
    .index("by_status", ["status"])
    .index("by_project", ["projectId"]),

  // Site Inspections table
  siteInspections: defineTable({
    projectId: v.id("projects"),
    inspectorId: v.id("users"),
    inspectionDate: v.string(),
    type: v.string(),
    findings: v.string(),
    recommendations: v.string(),
    safetyScore: v.optional(v.number()),
    qualityScore: v.optional(v.number()),
    photos: v.array(v.id("_storage")),
    status: v.union(
      v.literal("Scheduled"),
      v.literal("Completed"),
      v.literal("Follow-up Required")
    ),
    followUpDate: v.optional(v.string()),
  })
    .index("by_project", ["projectId"])
    .index("by_inspector", ["inspectorId"])
    .index("by_date", ["inspectionDate"])
    .index("by_status", ["status"]),
});