import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";

export const getUserData = query({
  handler: async (ctx): Promise<Doc<"userData"> | null> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const userData = await ctx.db
      .query("userData")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    return userData;
  },
});

export const createUserRole = mutation({
  args: {
    role: v.union(
      v.literal("student"),
      v.literal("organization"),
      v.literal("admin")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const existingUserData = await ctx.db
      .query("userData")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existingUserData) {
      return existingUserData._id;
    }

    const userDataId = await ctx.db.insert("userData", {
      userId,
      role: args.role,
      profileComplete: false,
    });

    if (args.role === "admin") {
      await ctx.db.patch(userDataId, { profileComplete: true });
    }

    return userDataId;
  },
});

export const createStudentProfile = mutation({
  args: {
    name: v.string(),
    department: v.string(),
    skills: v.array(v.string()),
    gpa: v.number(),
    location: v.string(),
    preferences: v.object({
      domains: v.array(v.string()),
      locations: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.insert("studentProfiles", { userId, ...args });

    const userData = await ctx.db
      .query("userData")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (userData) {
      await ctx.db.patch(userData._id, { profileComplete: true });
    }
  },
});

export const createOrganizationProfile = mutation({
  args: {
    name: v.string(),
    website: v.string(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.insert("organizationProfiles", { userId, ...args });

    const userData = await ctx.db
      .query("userData")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (userData) {
      await ctx.db.patch(userData._id, { profileComplete: true });
    }
  },
});

export const getStudentProfile = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("studentProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const getOrganizationProfile = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("organizationProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});
