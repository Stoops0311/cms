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

  // Shifts table for shift management
  shifts: defineTable({
    userId: v.id("users"),
    siteId: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    shiftType: v.string(), // "Morning", "Afternoon", "Night", "Rotational"
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    status: v.union(
      v.literal("Scheduled"),
      v.literal("In Progress"),
      v.literal("Completed"),
      v.literal("Cancelled")
    ),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["date"])
    .index("by_project", ["projectId"])
    .index("by_status", ["status"]),

  // HR Documents table for compliance tracking
  hrDocuments: defineTable({
    userId: v.id("users"),
    documentType: v.string(), // "Passport", "Visa", "Work Permit", "Medical Certificate", etc.
    documentNumber: v.string(),
    expiryDate: v.optional(v.string()),
    insuranceProvider: v.optional(v.string()),
    fileId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["documentType"])
    .index("by_expiry", ["expiryDate"]),

  // PPE Reports table for safety compliance
  ppeReports: defineTable({
    projectId: v.optional(v.id("projects")),
    siteLocation: v.string(),
    ppeType: v.string(), // "Hard Hat", "Safety Vest", "Gloves", etc.
    isCompliant: v.boolean(),
    reportedBy: v.id("users"),
    notes: v.optional(v.string()),
    photos: v.optional(v.array(v.id("_storage"))),
  })
    .index("by_project", ["projectId"])
    .index("by_type", ["ppeType"])
    .index("by_reporter", ["reportedBy"]),

  // Hazard Reports table for safety tracking
  hazardReports: defineTable({
    projectId: v.optional(v.id("projects")),
    siteLocation: v.string(),
    hazardType: v.string(), // "Fall Hazard", "Electrical Hazard", etc.
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
  })
    .index("by_project", ["projectId"])
    .index("by_severity", ["severity"])
    .index("by_status", ["status"])
    .index("by_reporter", ["reportedBy"]),

  // Ambulances table for fleet management
  ambulances: defineTable({
    vehicleId: v.string(),
    driver: v.optional(v.string()),
    status: v.union(
      v.literal("Available"),
      v.literal("Dispatched"),
      v.literal("Maintenance"),
      v.literal("Off Duty")
    ),
    currentLocation: v.optional(v.string()),
    lastMaintenanceDate: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_status", ["status"])
    .index("by_vehicle", ["vehicleId"]),

  // Ambulance Dispatches table for emergency dispatch tracking
  ambulanceDispatches: defineTable({
    ambulanceId: v.id("ambulances"),
    patientId: v.optional(v.string()),
    patientName: v.optional(v.string()),
    pickupLocation: v.string(),
    destination: v.string(),
    status: v.union(
      v.literal("Requested"),
      v.literal("Dispatched"),
      v.literal("In Transit"),
      v.literal("Completed"),
      v.literal("Cancelled")
    ),
    requestedAt: v.number(),
    dispatchedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_ambulance", ["ambulanceId"])
    .index("by_status", ["status"])
    .index("by_requested", ["requestedAt"]),

  // Access Logs table for audit trail
  accessLogs: defineTable({
    userId: v.id("users"),
    action: v.string(), // "login", "logout", "view", "create", "update", "delete"
    resource: v.string(), // Table/page accessed
    resourceId: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_timestamp", ["timestamp"])
    .index("by_resource", ["resource"]),

  // System Configuration table for app settings
  systemConfig: defineTable({
    key: v.string(),
    value: v.string(),
    description: v.optional(v.string()),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_key", ["key"]),

  // Procurement Logs table for tracking POs, invoices, delivery notes
  procurementLogs: defineTable({
    logType: v.string(), // "Purchase Order (PO)", "Invoice", "Delivery Note", "Material Request"
    documentId: v.string(), // PO Number, Invoice #, etc.
    supplier: v.string(),
    date: v.string(),
    amount: v.optional(v.number()),
    status: v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Ordered"),
      v.literal("Delivered"),
      v.literal("Paid"),
      v.literal("Cancelled")
    ),
    relatedProjectId: v.optional(v.id("projects")),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_status", ["status"])
    .index("by_type", ["logType"])
    .index("by_supplier", ["supplier"])
    .index("by_project", ["relatedProjectId"])
    .index("by_date", ["date"]),

  // Fiber Teams table for fiber optic team management
  fiberTeams: defineTable({
    teamName: v.string(),
    teamLead: v.string(),
    members: v.array(v.string()),
    status: v.union(
      v.literal("Available"),
      v.literal("Assigned"),
      v.literal("On Leave"),
      v.literal("Inactive")
    ),
    currentAssignment: v.optional(v.object({
      projectId: v.optional(v.id("projects")),
      location: v.optional(v.string()),
      taskDescription: v.optional(v.string()),
      assignmentDate: v.optional(v.string()),
      expectedCompletionDate: v.optional(v.string()),
    })),
    createdBy: v.id("users"),
  })
    .index("by_status", ["status"])
    .index("by_lead", ["teamLead"]),

  // Training Requests table
  trainingRequests: defineTable({
    trainingType: v.string(), // "General", "Fiber", "Engineering", "Telecom", "Civil Engineering"
    requestedBy: v.id("users"),
    employeeName: v.string(),
    department: v.string(),
    trainingTitle: v.string(),
    trainingProvider: v.optional(v.string()),
    justification: v.string(),
    preferredDates: v.optional(v.string()),
    estimatedCost: v.optional(v.number()),
    status: v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Rejected"),
      v.literal("Completed")
    ),
    approvedBy: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_type", ["trainingType"])
    .index("by_requester", ["requestedBy"])
    .index("by_department", ["department"]),

  // Leave Requests table
  leaveRequests: defineTable({
    requestedBy: v.id("users"),
    employeeName: v.string(),
    requestType: v.string(), // "Annual Leave", "Sick Leave", "Shift Change", "Emergency Leave"
    startDate: v.string(),
    endDate: v.string(),
    reason: v.string(),
    shiftSwapWith: v.optional(v.id("users")), // For shift change requests
    status: v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Rejected")
    ),
    approvedBy: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
  })
    .index("by_status", ["status"])
    .index("by_requester", ["requestedBy"])
    .index("by_type", ["requestType"])
    .index("by_project", ["projectId"]),

  // Incident Reports table
  incidentReports: defineTable({
    projectId: v.optional(v.id("projects")),
    location: v.string(),
    incidentDate: v.string(),
    incidentTime: v.string(),
    incidentType: v.string(), // "Injury", "Near Miss", "Property Damage", "Environmental", "Security"
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
    status: v.union(
      v.literal("Open"),
      v.literal("Under Investigation"),
      v.literal("Resolved"),
      v.literal("Closed")
    ),
    photos: v.optional(v.array(v.id("_storage"))),
  })
    .index("by_project", ["projectId"])
    .index("by_severity", ["severity"])
    .index("by_status", ["status"])
    .index("by_type", ["incidentType"])
    .index("by_reporter", ["reportedBy"]),

  // Project Documents table (for engineer sketches, reports)
  projectDocuments: defineTable({
    projectId: v.id("projects"),
    documentType: v.string(), // "Engineer Sketch", "Report", "Drawing", "Specification"
    title: v.string(),
    description: v.optional(v.string()),
    fileId: v.id("_storage"),
    fileName: v.string(),
    uploadedBy: v.id("users"),
  })
    .index("by_project", ["projectId"])
    .index("by_type", ["documentType"])
    .index("by_uploader", ["uploadedBy"]),

  // Budget Revisions table
  budgetRevisions: defineTable({
    projectId: v.id("projects"),
    requestedBy: v.id("users"),
    currentBudget: v.number(),
    proposedBudget: v.number(),
    revisionAmount: v.number(), // difference
    reason: v.string(),
    impactAnalysis: v.optional(v.string()),
    status: v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Rejected")
    ),
    approvedBy: v.optional(v.id("users")),
    approvalNotes: v.optional(v.string()),
  })
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_requester", ["requestedBy"]),

  // Vendor Payments table
  vendorPayments: defineTable({
    vendorId: v.id("contractors"),
    projectId: v.id("projects"),
    certificateNumber: v.string(),
    paymentAmount: v.number(),
    paymentFor: v.string(), // Description of work/milestone
    invoiceReference: v.optional(v.string()),
    workPeriodStart: v.string(),
    workPeriodEnd: v.string(),
    retentionAmount: v.optional(v.number()),
    netPayable: v.number(),
    status: v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Paid")
    ),
    approvedBy: v.optional(v.id("users")),
    createdBy: v.id("users"),
  })
    .index("by_vendor", ["vendorId"])
    .index("by_project", ["projectId"])
    .index("by_status", ["status"]),

  // Vendor Completions table
  vendorCompletions: defineTable({
    vendorId: v.id("contractors"),
    projectId: v.id("projects"),
    certificateNumber: v.string(),
    workDescription: v.string(),
    completionDate: v.string(),
    qualityRating: v.optional(v.string()), // "Excellent", "Good", "Satisfactory", "Needs Improvement"
    defectsNoted: v.optional(v.string()),
    warrantyPeriod: v.optional(v.string()),
    clientRepresentative: v.string(),
    contractorRepresentative: v.string(),
    status: v.union(
      v.literal("Pending Review"),
      v.literal("Approved"),
      v.literal("Rejected")
    ),
    approvedBy: v.optional(v.id("users")),
    createdBy: v.id("users"),
  })
    .index("by_vendor", ["vendorId"])
    .index("by_project", ["projectId"])
    .index("by_status", ["status"]),

  // Staff Exit Clearances table
  staffExitClearances: defineTable({
    userId: v.id("users"),
    employeeName: v.string(),
    department: v.string(),
    lastWorkingDate: v.string(),
    exitType: v.string(), // "Resignation", "Termination", "Contract End", "Retirement"
    clearanceItems: v.array(v.object({
      item: v.string(), // "ID Card", "Laptop", "Keys", "Documents", etc.
      status: v.union(
        v.literal("Pending"),
        v.literal("Cleared"),
        v.literal("N/A")
      ),
      clearedBy: v.optional(v.string()),
      date: v.optional(v.string()),
    })),
    finalSettlementStatus: v.union(
      v.literal("Pending"),
      v.literal("Processed"),
      v.literal("Completed")
    ),
    exitInterviewCompleted: v.boolean(),
    overallStatus: v.union(
      v.literal("In Progress"),
      v.literal("Completed")
    ),
    processedBy: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["overallStatus"])
    .index("by_exit_type", ["exitType"]),

  // Timesheets table
  timesheets: defineTable({
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    weekStartDate: v.string(),
    weekEndDate: v.string(),
    entries: v.array(v.object({
      date: v.string(),
      hoursWorked: v.number(),
      taskDescription: v.string(),
      overtime: v.optional(v.number()),
    })),
    totalRegularHours: v.number(),
    totalOvertimeHours: v.number(),
    status: v.union(
      v.literal("Draft"),
      v.literal("Submitted"),
      v.literal("Approved"),
      v.literal("Rejected")
    ),
    approvedBy: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_week", ["weekStartDate"]),

  // Quality Control - Non-Conformance Reports (NCRs)
  qualityNCRs: defineTable({
    projectId: v.optional(v.id("projects")),
    ncrNumber: v.string(),
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
    rootCause: v.optional(v.string()),
    correctiveAction: v.optional(v.string()),
    preventiveAction: v.optional(v.string()),
    status: v.union(
      v.literal("Open"),
      v.literal("Under Investigation"),
      v.literal("Corrective Action"),
      v.literal("Verification"),
      v.literal("Closed")
    ),
    closedBy: v.optional(v.id("users")),
    closedDate: v.optional(v.string()),
    photos: v.optional(v.array(v.id("_storage"))),
  })
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_severity", ["severity"]),

  // Quality Control - Material Inspections
  materialInspections: defineTable({
    projectId: v.optional(v.id("projects")),
    inspectionNumber: v.string(),
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
    approvedBy: v.optional(v.id("users")),
    photos: v.optional(v.array(v.id("_storage"))),
  })
    .index("by_project", ["projectId"])
    .index("by_result", ["result"])
    .index("by_date", ["inspectionDate"]),

  // Quality Control - Test Results (Concrete, OTDR, etc.)
  qualityTestResults: defineTable({
    projectId: v.optional(v.id("projects")),
    testNumber: v.string(),
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
    result: v.union(
      v.literal("Pass"),
      v.literal("Fail")
    ),
    remarks: v.optional(v.string()),
    attachments: v.optional(v.array(v.id("_storage"))),
  })
    .index("by_project", ["projectId"])
    .index("by_test_type", ["testType"])
    .index("by_result", ["result"])
    .index("by_date", ["testDate"]),
});