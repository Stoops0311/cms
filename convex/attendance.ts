import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create attendance record (for punch in/out system)
export const createAttendanceRecord = mutation({
  args: {
    userId: v.string(),
    timestamp: v.string(),
    punchType: v.union(v.literal("in"), v.literal("out")),
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      accuracy: v.number(),
      mock: v.optional(v.boolean()),
    })),
    notes: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  returns: v.id("attendance"),
  handler: async (ctx, args) => {
    // Find the user by userId (assuming it's a string identifier)
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.userId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    const date = new Date(args.timestamp).toISOString().split('T')[0];
    
    // For punch in, create new attendance record
    if (args.punchType === "in") {
      // Check if already punched in today
      const existingAttendance = await ctx.db
        .query("attendance")
        .withIndex("by_user_date", (q) => 
          q.eq("userId", user._id).eq("date", date)
        )
        .first();
      
      if (existingAttendance && !existingAttendance.checkOut) {
        throw new Error("Already punched in for today");
      }
      
      const attendanceId = await ctx.db.insert("attendance", {
        userId: user._id,
        date,
        checkIn: args.timestamp,
        checkOut: undefined,
        status: "Present",
        projectId: args.projectId,
        location: args.location ? 
          `${args.location.latitude},${args.location.longitude}` : 
          "Unknown",
        notes: args.notes,
      });
      
      return attendanceId;
    } else {
      // For punch out, update existing record
      const existingAttendance = await ctx.db
        .query("attendance")
        .withIndex("by_user_date", (q) => 
          q.eq("userId", user._id).eq("date", date)
        )
        .first();
      
      if (!existingAttendance) {
        throw new Error("No punch in record found for today");
      }
      
      if (existingAttendance.checkOut) {
        throw new Error("Already punched out for today");
      }
      
      await ctx.db.patch(existingAttendance._id, {
        checkOut: args.timestamp,
      });
      
      return existingAttendance._id;
    }
  },
});

// Record attendance (clock in/out)
export const recordAttendance = mutation({
  args: {
    userId: v.id("users"),
    checkIn: v.string(),
    projectId: v.optional(v.id("projects")),
    location: v.string(),
    notes: v.optional(v.string()),
  },
  returns: v.id("attendance"),
  handler: async (ctx, args) => {
    const date = new Date(args.checkIn).toISOString().split('T')[0];
    
    // Check if attendance already exists for this user on this date
    const existingAttendance = await ctx.db
      .query("attendance")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", date)
      )
      .first();
    
    if (existingAttendance) {
      throw new Error("Attendance already recorded for this date");
    }
    
    const attendanceId = await ctx.db.insert("attendance", {
      userId: args.userId,
      date,
      checkIn: args.checkIn,
      checkOut: undefined,
      status: "Present",
      projectId: args.projectId,
      location: args.location,
      notes: args.notes,
    });
    
    return attendanceId;
  },
});

// Update attendance (clock out or modify)
export const updateAttendance = mutation({
  args: {
    attendanceId: v.id("attendance"),
    checkOut: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("Present"),
      v.literal("Absent"),
      v.literal("Late"),
      v.literal("Leave")
    )),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { attendanceId, ...updates } = args;
    
    const attendance = await ctx.db.get(attendanceId);
    if (!attendance) {
      throw new Error("Attendance record not found");
    }
    
    // Validate checkout time
    if (updates.checkOut && new Date(updates.checkOut) < new Date(attendance.checkIn)) {
      throw new Error("Check-out time cannot be before check-in time");
    }
    
    // Check if late
    if (updates.checkOut && !attendance.checkOut && attendance.status === "Present") {
      const checkInTime = new Date(attendance.checkIn);
      const workStartTime = new Date(checkInTime);
      workStartTime.setHours(8, 0, 0, 0); // Assuming 8 AM start time
      
      if (checkInTime > workStartTime) {
        updates.status = "Late";
      }
    }
    
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(attendanceId, cleanUpdates);
    return null;
  },
});

// Get attendance by user and date range
export const getAttendanceByUser = query({
  args: {
    userId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("attendance"),
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
      projectName: v.optional(v.string()),
      location: v.string(),
      notes: v.optional(v.string()),
      totalHours: v.optional(v.number()),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const attendance = await ctx.db
      .query("attendance")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .order("desc")
      .collect();
    
    const attendanceWithDetails = await Promise.all(
      attendance.map(async (record) => {
        const project = record.projectId 
          ? await ctx.db.get(record.projectId)
          : null;
        
        let totalHours: number | undefined;
        if (record.checkOut) {
          const checkIn = new Date(record.checkIn);
          const checkOut = new Date(record.checkOut);
          totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        }
        
        return {
          _id: record._id,
          date: record.date,
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          status: record.status,
          projectId: record.projectId,
          projectName: project?.projectName,
          location: record.location,
          notes: record.notes,
          totalHours,
          _creationTime: record._creationTime,
        };
      })
    );
    
    return attendanceWithDetails;
  },
});

// Get attendance report for multiple users
export const getAttendanceReport = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    projectId: v.optional(v.id("projects")),
    department: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      userId: v.id("users"),
      userName: v.string(),
      department: v.optional(v.string()),
      totalDays: v.number(),
      presentDays: v.number(),
      absentDays: v.number(),
      lateDays: v.number(),
      leaveDays: v.number(),
      totalHoursWorked: v.number(),
      averageHoursPerDay: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    // Get users based on department filter
    let users = await ctx.db.query("users").collect();
    if (args.department) {
      users = users.filter(u => u.department === args.department);
    }
    
    const report = await Promise.all(
      users.map(async (user) => {
        const attendance = await ctx.db
          .query("attendance")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .filter((q) => {
            let filter = q.and(
              q.gte(q.field("date"), args.startDate),
              q.lte(q.field("date"), args.endDate)
            );
            if (args.projectId) {
              filter = q.and(filter, q.eq(q.field("projectId"), args.projectId));
            }
            return filter;
          })
          .collect();
        
        const totalDays = attendance.length;
        const presentDays = attendance.filter(a => a.status === "Present").length;
        const absentDays = attendance.filter(a => a.status === "Absent").length;
        const lateDays = attendance.filter(a => a.status === "Late").length;
        const leaveDays = attendance.filter(a => a.status === "Leave").length;
        
        let totalHoursWorked = 0;
        for (const record of attendance) {
          if (record.checkOut) {
            const checkIn = new Date(record.checkIn);
            const checkOut = new Date(record.checkOut);
            totalHoursWorked += (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
          }
        }
        
        const averageHoursPerDay = totalDays > 0 ? totalHoursWorked / totalDays : 0;
        
        return {
          userId: user._id,
          userName: user.fullName,
          department: user.department,
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          leaveDays,
          totalHoursWorked: Math.round(totalHoursWorked * 10) / 10,
          averageHoursPerDay: Math.round(averageHoursPerDay * 10) / 10,
        };
      })
    );
    
    // Filter out users with no attendance
    return report.filter(r => r.totalDays > 0);
  },
});

// Get today's attendance for a project or location
export const getTodayAttendance = query({
  args: {
    projectId: v.optional(v.id("projects")),
    location: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("attendance"),
      userId: v.id("users"),
      userName: v.string(),
      department: v.optional(v.string()),
      checkIn: v.string(),
      checkOut: v.optional(v.string()),
      status: v.union(
        v.literal("Present"),
        v.literal("Absent"),
        v.literal("Late"),
        v.literal("Leave")
      ),
      location: v.string(),
      projectName: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];
    
    let query = ctx.db
      .query("attendance")
      .withIndex("by_date", (q) => q.eq("date", today));
    
    if (args.projectId) {
      query = query.filter((q) => q.eq(q.field("projectId"), args.projectId));
    }
    
    const attendance = await query.collect();
    
    // Apply location filter if specified
    const filteredAttendance = args.location 
      ? attendance.filter(a => a.location === args.location)
      : attendance;
    
    const attendanceWithDetails = await Promise.all(
      filteredAttendance.map(async (record) => {
        const user = await ctx.db.get(record.userId);
        const project = record.projectId 
          ? await ctx.db.get(record.projectId)
          : null;
        
        return {
          _id: record._id,
          userId: record.userId,
          userName: user?.fullName || "Unknown User",
          department: user?.department,
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          status: record.status,
          location: record.location,
          projectName: project?.projectName,
        };
      })
    );
    
    return attendanceWithDetails;
  },
});

// Mark user as absent
export const markAbsent = mutation({
  args: {
    userId: v.id("users"),
    date: v.string(),
    reason: v.optional(v.string()),
  },
  returns: v.id("attendance"),
  handler: async (ctx, args) => {
    // Check if attendance already exists
    const existingAttendance = await ctx.db
      .query("attendance")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .first();
    
    if (existingAttendance) {
      throw new Error("Attendance already recorded for this date");
    }
    
    const attendanceId = await ctx.db.insert("attendance", {
      userId: args.userId,
      date: args.date,
      checkIn: `${args.date}T00:00:00Z`,
      checkOut: undefined,
      status: "Absent",
      location: "N/A",
      notes: args.reason,
    });
    
    return attendanceId;
  },
});

// List all attendance records with optional filtering
export const listAttendanceRecords = query({
  args: {
    userId: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("Present"),
      v.literal("Absent"), 
      v.literal("Late"),
      v.literal("Leave")
    )),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("attendance"),
      userId: v.id("users"),
      userName: v.string(),
      department: v.optional(v.string()),
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
      projectName: v.optional(v.string()),
      location: v.string(),
      notes: v.optional(v.string()),
      totalHours: v.optional(v.number()),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let attendance;
    
    // Apply filters based on provided arguments
    if (args.userId) {
      attendance = await ctx.db
        .query("attendance")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!))
        .order("desc")
        .collect();
    } else if (args.projectId) {
      attendance = await ctx.db
        .query("attendance")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .order("desc")
        .collect();
    } else {
      attendance = await ctx.db
        .query("attendance")
        .order("desc")
        .collect();
    }
    
    // Apply additional filters
    if (args.startDate || args.endDate) {
      attendance = attendance.filter((record) => {
        if (args.startDate && record.date < args.startDate) return false;
        if (args.endDate && record.date > args.endDate) return false;
        return true;
      });
    }
    
    if (args.status) {
      attendance = attendance.filter((record) => record.status === args.status);
    }
    
    // Apply limit if specified
    if (args.limit) {
      attendance = attendance.slice(0, args.limit);
    }
    
    // Enrich with user and project details
    const attendanceWithDetails = await Promise.all(
      attendance.map(async (record) => {
        const user = await ctx.db.get(record.userId);
        const project = record.projectId 
          ? await ctx.db.get(record.projectId)
          : null;
        
        let totalHours: number | undefined;
        if (record.checkOut) {
          const checkIn = new Date(record.checkIn);
          const checkOut = new Date(record.checkOut);
          totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        }
        
        return {
          _id: record._id,
          userId: record.userId,
          userName: user?.fullName || "Unknown User",
          department: user?.department,
          date: record.date,
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          status: record.status,
          projectId: record.projectId,
          projectName: project?.projectName,
          location: record.location,
          notes: record.notes,
          totalHours,
          _creationTime: record._creationTime,
        };
      })
    );
    
    return attendanceWithDetails;
  },
});

// Apply for leave
export const applyLeave = mutation({
  args: {
    userId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
    reason: v.string(),
  },
  returns: v.array(v.id("attendance")),
  handler: async (ctx, args) => {
    const start = new Date(args.startDate);
    const end = new Date(args.endDate);
    const attendanceIds: any[] = [];
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if attendance already exists
      const existingAttendance = await ctx.db
        .query("attendance")
        .withIndex("by_user_date", (q) => 
          q.eq("userId", args.userId).eq("date", dateStr)
        )
        .first();
      
      if (!existingAttendance) {
        const attendanceId = await ctx.db.insert("attendance", {
          userId: args.userId,
          date: dateStr,
          checkIn: `${dateStr}T00:00:00Z`,
          checkOut: undefined,
          status: "Leave",
          location: "On Leave",
          notes: args.reason,
        });
        attendanceIds.push(attendanceId);
      }
    }
    
    return attendanceIds;
  },
});