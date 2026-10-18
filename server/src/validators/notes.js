
import { z } from "zod";

// Allowed note categories.
export const categories = [
  "Work",
  "Personal",
  "Ideas",
  "School",
  "General",
];

const tagSchema = z.string()
  .trim()
  .min(1)
  .max(30);

// Reusable validation rules for note content.
const noteFields = {
  title: z.string().trim().min(1).max(150),

  content: z.string().trim().min(1).max(5000),

  category: z.enum(categories),

  isPinned: z.boolean(),

  tags: z.array(tagSchema).max(10),
};

// Required fields for creating a note.
export const createNoteSchema = z.object({
  title: noteFields.title,
  content: noteFields.content,
  category: noteFields.category,
  isPinned: noteFields.isPinned.optional(),
  tags: noteFields.tags.optional(),
}).strict();

// Updating a note supports partial changes.
export const updateNoteSchema = z.object(
  noteFields
).partial().strict().refine(
  (data) => Object.keys(data).length > 0,
  "Provide at least one field to update"
);
