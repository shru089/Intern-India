import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("internships").order("desc").collect();
  },
});

export const createInternship = mutation({
  args: {
    title: v.string(),
    domain: v.string(),
    skillsRequired: v.array(v.string()),
    duration: v.string(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    // Ensure user is an organization
    const userData = await ctx.db
      .query("userData")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (userData?.role !== "organization") {
      throw new Error("Only organizations can create internships");
    }

    await ctx.db.insert("internships", {
      organizationId: userId,
      ...args,
    });
  },
});
