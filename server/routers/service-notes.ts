/**
 * Service Notes Router — manages internal notes for service requests.
 *
 * This router provides CRUD operations for service request notes.
 * All procedures are admin-only to ensure privacy of internal notes.
 */
import { z } from "zod/v4";
import { eq, desc } from "drizzle-orm";
import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { serviceRequestNotes, users } from "../../drizzle/schema";

export const serviceNotesRouter = router({
  /**
   * Add a new note to a service request (admin only).
   * Content must be at least 1 character long.
   */
  add: adminProcedure
    .input(
      z.object({
        serviceRequestId: z.number(),
        content: z.string().min(1, "Content cannot be empty"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Insert the new note
      await db.insert(serviceRequestNotes).values({
        serviceRequestId: input.serviceRequestId,
        authorId: ctx.user.id,
        content: input.content,
      });

      return { success: true, message: "Note added successfully." };
    }),

  /**
   * List all notes for a service request (admin only).
   * Returns notes ordered by newest first.
   */
  list: adminProcedure
    .input(z.object({ serviceRequestId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Fetch notes with author information
      const notes = await db
        .select({
          id: serviceRequestNotes.id,
          serviceRequestId: serviceRequestNotes.serviceRequestId,
          authorId: serviceRequestNotes.authorId,
          content: serviceRequestNotes.content,
          createdAt: serviceRequestNotes.createdAt,
          authorName: users.name,
        })
        .from(serviceRequestNotes)
        .leftJoin(users, eq(serviceRequestNotes.authorId, users.id))
        .where(eq(serviceRequestNotes.serviceRequestId, input.serviceRequestId))
        .orderBy(desc(serviceRequestNotes.createdAt));

      return { notes };
    }),

  /**
   * Delete a note by ID (admin only).
   */
  delete: adminProcedure
    .input(z.object({ noteId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Delete the note
      await db
        .delete(serviceRequestNotes)
        .where(eq(serviceRequestNotes.id, input.noteId));

      return { success: true, message: "Note deleted successfully." };
    }),
});
