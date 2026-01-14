import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all vendor payments with optional filters
export const listVendorPayments = query({
  args: {
    status: v.optional(v.string()),
    vendorId: v.optional(v.id("contractors")),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    let payments;

    if (args.status) {
      payments = await ctx.db
        .query("vendorPayments")
        .withIndex("by_status", (q) => q.eq("status", args.status as "Pending" | "Approved" | "Paid"))
        .collect();
    } else if (args.vendorId) {
      payments = await ctx.db
        .query("vendorPayments")
        .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId!))
        .collect();
    } else if (args.projectId) {
      payments = await ctx.db
        .query("vendorPayments")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .collect();
    } else {
      payments = await ctx.db.query("vendorPayments").collect();
    }

    // Enrich with vendor, project, and user names
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        const vendor = await ctx.db.get(payment.vendorId);
        const project = await ctx.db.get(payment.projectId);
        const creator = await ctx.db.get(payment.createdBy);
        const approver = payment.approvedBy ? await ctx.db.get(payment.approvedBy) : null;

        return {
          ...payment,
          vendorName: vendor?.companyName || "Unknown",
          projectName: project?.projectName || "Unknown",
          creatorName: creator?.fullName || "Unknown",
          approverName: approver?.fullName || null,
        };
      })
    );

    return enrichedPayments;
  },
});

// Get a single vendor payment by ID
export const getVendorPaymentById = query({
  args: { id: v.id("vendorPayments") },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.id);
    if (!payment) return null;

    const vendor = await ctx.db.get(payment.vendorId);
    const project = await ctx.db.get(payment.projectId);
    const creator = await ctx.db.get(payment.createdBy);
    const approver = payment.approvedBy ? await ctx.db.get(payment.approvedBy) : null;

    return {
      ...payment,
      vendorName: vendor?.companyName || "Unknown",
      projectName: project?.projectName || "Unknown",
      creatorName: creator?.fullName || "Unknown",
      approverName: approver?.fullName || null,
    };
  },
});

// Create a new vendor payment certificate
export const createVendorPayment = mutation({
  args: {
    vendorId: v.id("contractors"),
    projectId: v.id("projects"),
    certificateNumber: v.string(),
    paymentAmount: v.number(),
    paymentFor: v.string(),
    invoiceReference: v.optional(v.string()),
    workPeriodStart: v.string(),
    workPeriodEnd: v.string(),
    retentionAmount: v.optional(v.number()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const netPayable = args.paymentAmount - (args.retentionAmount || 0);

    const paymentId = await ctx.db.insert("vendorPayments", {
      ...args,
      netPayable,
      status: "Pending",
      approvedBy: undefined,
    });
    return paymentId;
  },
});

// Update a vendor payment
export const updateVendorPayment = mutation({
  args: {
    id: v.id("vendorPayments"),
    certificateNumber: v.optional(v.string()),
    paymentAmount: v.optional(v.number()),
    paymentFor: v.optional(v.string()),
    invoiceReference: v.optional(v.string()),
    workPeriodStart: v.optional(v.string()),
    workPeriodEnd: v.optional(v.string()),
    retentionAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Vendor payment not found");

    // Recalculate net payable if amounts are being updated
    let netPayable = existing.netPayable;
    if (updates.paymentAmount !== undefined || updates.retentionAmount !== undefined) {
      const paymentAmount = updates.paymentAmount ?? existing.paymentAmount;
      const retentionAmount = updates.retentionAmount ?? existing.retentionAmount ?? 0;
      netPayable = paymentAmount - retentionAmount;
    }

    await ctx.db.patch(id, { ...updates, netPayable });
    return id;
  },
});

// Approve a vendor payment
export const approveVendorPayment = mutation({
  args: {
    id: v.id("vendorPayments"),
    approvedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Vendor payment not found");

    await ctx.db.patch(args.id, {
      status: "Approved",
      approvedBy: args.approvedBy,
    });
    return args.id;
  },
});

// Mark payment as paid
export const markVendorPaymentPaid = mutation({
  args: {
    id: v.id("vendorPayments"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Vendor payment not found");
    if (existing.status !== "Approved") throw new Error("Payment must be approved before marking as paid");

    await ctx.db.patch(args.id, {
      status: "Paid",
    });
    return args.id;
  },
});

// Delete a vendor payment
export const deleteVendorPayment = mutation({
  args: { id: v.id("vendorPayments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Get vendor payment stats
export const getVendorPaymentStats = query({
  args: {},
  handler: async (ctx) => {
    const allPayments = await ctx.db.query("vendorPayments").collect();

    const stats = {
      total: allPayments.length,
      pending: allPayments.filter((p) => p.status === "Pending").length,
      approved: allPayments.filter((p) => p.status === "Approved").length,
      paid: allPayments.filter((p) => p.status === "Paid").length,
      totalPendingAmount: allPayments
        .filter((p) => p.status === "Pending")
        .reduce((sum, p) => sum + p.netPayable, 0),
      totalApprovedAmount: allPayments
        .filter((p) => p.status === "Approved")
        .reduce((sum, p) => sum + p.netPayable, 0),
      totalPaidAmount: allPayments
        .filter((p) => p.status === "Paid")
        .reduce((sum, p) => sum + p.netPayable, 0),
    };

    return stats;
  },
});

// Get pending vendor payments for approval queue
export const getPendingVendorPayments = query({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("vendorPayments")
      .withIndex("by_status", (q) => q.eq("status", "Pending"))
      .collect();

    const enrichedPending = await Promise.all(
      pending.map(async (payment) => {
        const vendor = await ctx.db.get(payment.vendorId);
        const project = await ctx.db.get(payment.projectId);

        return {
          ...payment,
          vendorName: vendor?.companyName || "Unknown",
          projectName: project?.projectName || "Unknown",
        };
      })
    );

    return enrichedPending;
  },
});
