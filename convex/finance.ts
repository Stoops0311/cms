import { v } from "convex/values";
import { query } from "./_generated/server";

// Get financial dashboard data aggregated from multiple sources
export const getFinancialDashboard = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    // Get all relevant data
    const projects = await ctx.db.query("projects").collect();
    const purchaseRequests = await ctx.db.query("purchaseRequests").collect();
    const expenseClaims = await ctx.db.query("expenseClaims").collect();

    // Filter by project if specified
    let filteredProjects = projects;
    let filteredPR = purchaseRequests;
    let filteredClaims = expenseClaims;

    if (args.projectId) {
      filteredProjects = projects.filter((p) => p._id === args.projectId);
      filteredPR = purchaseRequests.filter((pr) => pr.projectId === args.projectId);
      filteredClaims = expenseClaims.filter((c) => c.projectId === args.projectId);
    }

    // Calculate totals
    const totalBudget = filteredProjects.reduce((sum, p) => {
      const budget = parseFloat(p.budgetAllocation) || 0;
      return sum + budget;
    }, 0);

    const purchaseRequestsTotal = filteredPR.reduce((sum, pr) => sum + pr.totalEstimatedCost, 0);
    const approvedPRTotal = filteredPR
      .filter((pr) => pr.status === "Approved" || pr.status === "Ordered")
      .reduce((sum, pr) => sum + pr.totalEstimatedCost, 0);
    const pendingPRTotal = filteredPR
      .filter((pr) => pr.status === "Pending")
      .reduce((sum, pr) => sum + pr.totalEstimatedCost, 0);

    const expenseClaimsTotal = filteredClaims.reduce((sum, c) => sum + c.totalAmount, 0);
    const approvedExpenses = filteredClaims
      .filter((c) => c.status === "Approved" || c.status === "Paid")
      .reduce((sum, c) => sum + c.totalAmount, 0);
    const pendingExpenses = filteredClaims
      .filter((c) => c.status === "Pending")
      .reduce((sum, c) => sum + c.totalAmount, 0);

    // Calculate committed costs (approved PR + approved expenses)
    const committedCosts = approvedPRTotal + approvedExpenses;

    // Calculate remaining budget
    const remainingBudget = totalBudget - committedCosts;

    // Budget utilization percentage
    const budgetUtilization = totalBudget > 0
      ? Math.round((committedCosts / totalBudget) * 100)
      : 0;

    return {
      summary: {
        totalBudget,
        committedCosts,
        remainingBudget,
        budgetUtilization,
        pendingApprovals: pendingPRTotal + pendingExpenses,
      },
      purchaseRequests: {
        total: filteredPR.length,
        totalValue: purchaseRequestsTotal,
        pending: filteredPR.filter((pr) => pr.status === "Pending").length,
        pendingValue: pendingPRTotal,
        approved: filteredPR.filter((pr) => pr.status === "Approved").length,
        approvedValue: approvedPRTotal,
        ordered: filteredPR.filter((pr) => pr.status === "Ordered").length,
        rejected: filteredPR.filter((pr) => pr.status === "Rejected").length,
      },
      expenseClaims: {
        total: filteredClaims.length,
        totalValue: expenseClaimsTotal,
        pending: filteredClaims.filter((c) => c.status === "Pending").length,
        pendingValue: pendingExpenses,
        approved: filteredClaims.filter((c) => c.status === "Approved").length,
        approvedValue: approvedExpenses,
        paid: filteredClaims.filter((c) => c.status === "Paid").length,
        rejected: filteredClaims.filter((c) => c.status === "Rejected").length,
      },
      projects: {
        total: filteredProjects.length,
        active: filteredProjects.filter((p) => p.projectStatus === "Active").length,
        totalBudgetAllocated: totalBudget,
      },
    };
  },
});

// Get project-by-project financial breakdown
export const getProjectFinancials = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    const purchaseRequests = await ctx.db.query("purchaseRequests").collect();
    const expenseClaims = await ctx.db.query("expenseClaims").collect();

    const projectFinancials = projects.map((project) => {
      const projectPRs = purchaseRequests.filter((pr) => pr.projectId === project._id);
      const projectClaims = expenseClaims.filter((c) => c.projectId === project._id);

      const budget = parseFloat(project.budgetAllocation) || 0;
      const prCommitted = projectPRs
        .filter((pr) => pr.status === "Approved" || pr.status === "Ordered")
        .reduce((sum, pr) => sum + pr.totalEstimatedCost, 0);
      const expensesCommitted = projectClaims
        .filter((c) => c.status === "Approved" || c.status === "Paid")
        .reduce((sum, c) => sum + c.totalAmount, 0);
      const totalCommitted = prCommitted + expensesCommitted;

      return {
        projectId: project._id,
        projectName: project.projectName,
        projectStatus: project.projectStatus,
        currency: project.currency,
        budget,
        committed: totalCommitted,
        remaining: budget - totalCommitted,
        utilizationPercent: budget > 0 ? Math.round((totalCommitted / budget) * 100) : 0,
        purchaseRequests: projectPRs.length,
        expenseClaims: projectClaims.length,
      };
    });

    // Sort by utilization (highest first)
    return projectFinancials.sort((a, b) => b.utilizationPercent - a.utilizationPercent);
  },
});

// Get expense breakdown by category
export const getExpensesByCategory = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    let expenseClaims = await ctx.db.query("expenseClaims").collect();

    if (args.projectId) {
      expenseClaims = expenseClaims.filter((c) => c.projectId === args.projectId);
    }

    // Only include approved/paid claims
    const validClaims = expenseClaims.filter(
      (c) => c.status === "Approved" || c.status === "Paid"
    );

    // Aggregate by category
    const categoryTotals: Record<string, number> = {};
    validClaims.forEach((claim) => {
      claim.items.forEach((item) => {
        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
      });
    });

    // Convert to array and sort by amount
    const categories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    const total = categories.reduce((sum, c) => sum + c.amount, 0);

    return {
      categories,
      total,
      withPercentages: categories.map((c) => ({
        ...c,
        percentage: total > 0 ? Math.round((c.amount / total) * 100) : 0,
      })),
    };
  },
});

// Get pending approvals for finance team
export const getPendingApprovals = query({
  args: {},
  handler: async (ctx) => {
    const purchaseRequests = await ctx.db.query("purchaseRequests").collect();
    const expenseClaims = await ctx.db.query("expenseClaims").collect();

    const pendingPRs = purchaseRequests.filter((pr) => pr.status === "Pending");
    const pendingClaims = expenseClaims.filter((c) => c.status === "Pending");

    // Enrich with user and project data
    const enrichedPRs = await Promise.all(
      pendingPRs.map(async (pr) => {
        const requester = await ctx.db.get(pr.requestedBy);
        const project = pr.projectId ? await ctx.db.get(pr.projectId) : null;
        return {
          type: "purchase_request" as const,
          id: pr._id,
          requestedBy: requester?.fullName || "Unknown",
          department: pr.department,
          projectName: project?.projectName || "No Project",
          amount: pr.totalEstimatedCost,
          itemCount: pr.items.length,
          justification: pr.justification,
          createdAt: pr._creationTime,
        };
      })
    );

    const enrichedClaims = await Promise.all(
      pendingClaims.map(async (claim) => {
        const claimant = await ctx.db.get(claim.claimantId);
        const project = claim.projectId ? await ctx.db.get(claim.projectId) : null;
        return {
          type: "expense_claim" as const,
          id: claim._id,
          requestedBy: claimant?.fullName || "Unknown",
          projectName: project?.projectName || "No Project",
          amount: claim.totalAmount,
          itemCount: claim.items.length,
          claimDate: claim.claimDate,
          createdAt: claim._creationTime,
        };
      })
    );

    // Combine and sort by creation time
    const allPending = [...enrichedPRs, ...enrichedClaims].sort(
      (a, b) => b.createdAt - a.createdAt
    );

    return {
      items: allPending,
      totalPendingAmount: allPending.reduce((sum, item) => sum + item.amount, 0),
      purchaseRequestsCount: pendingPRs.length,
      expenseClaimsCount: pendingClaims.length,
    };
  },
});

// Get monthly financial trend
export const getMonthlyTrend = query({
  args: {
    months: v.optional(v.number()), // Default 6 months
  },
  handler: async (ctx, args) => {
    const monthsToShow = args.months || 6;
    const purchaseRequests = await ctx.db.query("purchaseRequests").collect();
    const expenseClaims = await ctx.db.query("expenseClaims").collect();

    // Generate month labels
    const months: string[] = [];
    const now = new Date();
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toISOString().slice(0, 7)); // YYYY-MM format
    }

    // Aggregate by month
    const trend = months.map((month) => {
      const monthPRs = purchaseRequests.filter((pr) => {
        const prMonth = new Date(pr._creationTime).toISOString().slice(0, 7);
        return prMonth === month && (pr.status === "Approved" || pr.status === "Ordered");
      });

      const monthClaims = expenseClaims.filter((c) => {
        const claimMonth = c.claimDate.slice(0, 7);
        return claimMonth === month && (c.status === "Approved" || c.status === "Paid");
      });

      return {
        month,
        purchaseRequests: monthPRs.reduce((sum, pr) => sum + pr.totalEstimatedCost, 0),
        expenses: monthClaims.reduce((sum, c) => sum + c.totalAmount, 0),
        total: monthPRs.reduce((sum, pr) => sum + pr.totalEstimatedCost, 0) +
               monthClaims.reduce((sum, c) => sum + c.totalAmount, 0),
      };
    });

    return trend;
  },
});
