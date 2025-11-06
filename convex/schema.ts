import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // To store role and profile completion status
  userData: defineTable({
    userId: v.id("users"),
    role: v.union(
      v.literal("student"),
      v.literal("organization"),
      v.literal("admin")
    ),
    profileComplete: v.boolean(),
  }).index("by_userId", ["userId"]),

  // Student-specific data
  studentProfiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    department: v.string(),
    skills: v.array(v.string()),
    gpa: v.number(),
    location: v.string(),
    preferences: v.object({
      domains: v.array(v.string()),
      locations: v.array(v.string()),
    }),
  }).index("by_userId", ["userId"]),

  // Organization-specific data
  organizationProfiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    website: v.string(),
    location: v.string(),
  }).index("by_userId", ["userId"]),

  // Internship postings
  internships: defineTable({
    organizationId: v.id("users"),
    title: v.string(),
    domain: v.string(),
    skillsRequired: v.array(v.string()),
    duration: v.string(),
    location: v.string(),
  }).index("by_organizationId", ["organizationId"]),

  // Student applications to internships
  applications: defineTable({
    studentId: v.id("users"),
    internshipId: v.id("internships"),
    status: v.union(
      v.literal("pending"),
      v.literal("matched"),
      v.literal("rejected")
    ),
  }).index("by_student_and_internship", ["studentId", "internshipId"]),

  // Final allocations made by the admin/AI
  allocations: defineTable({
    studentId: v.id("users"),
    internshipId: v.id("internships"),
    score: v.number(),
    matchStatus: v.literal("confirmed"),
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
