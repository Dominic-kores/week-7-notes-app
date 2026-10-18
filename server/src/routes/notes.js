
import { Router } from "express";
import prisma from "../lib/prisma.js";

import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

import {
  createNoteSchema,
  updateNoteSchema,
  categories,
} from "../validators/notes.js";

const router = Router();

// All routes in this router require authentication.
router.use(authenticate);

// Parse and validate a numeric note ID.
function getNoteId(req, res) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      message: "Invalid note ID",
    });
    return null;
  }

  return id;
}

// Convert tags into Prisma connectOrCreate operations.
function prepareTags(tags = []) {
  const uniqueTags = [
    ...new Set(
      tags.map((tag) => tag.trim().toLowerCase())
    ),
  ];

  return uniqueTags.map((name) => ({
    where: { name },
    create: { name },
  }));
}

// Checks existence and ownership of a note.
// 404 for nonexistent notes and 403 for another owner's note.
async function checkOwnership(noteId, userId, res) {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { id: true, userId: true },
  });

  if (!note) {
    res.status(404).json({
      message: "Note not found",
    });
    return false;
  }

  if (note.userId !== userId) {
    res.status(403).json({
      message: "Access denied. You do not own this note.",
    });
    return false;
  }

  return true;
}

// GET /api/notes
// List only notes belonging to the current user.
router.get("/", async (req, res, next) => {
  try {
    const { search, category, tag } = req.query;

    // Never accept userId from query parameters.
    const where = {
      userId: req.user.id,
    };

    if (search) {
      if (typeof search !== "string" || search.length > 150) {
        return res.status(400).json({
          message: "Invalid search term",
        });
      }

      // Case-insensitive title or content search.
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (category) {
      if (
        typeof category !== "string" ||
        !categories.includes(category)
      ) {
        return res.status(400).json({
          message: "Invalid category",
        });
      }

      where.category = category;
    }

    if (tag) {
      if (typeof tag !== "string" || tag.length > 30) {
        return res.status(400).json({
          message: "Invalid tag",
        });
      }

      where.tags = {
        some: {
          name: tag.toLowerCase(),
        },
      };
    }

    const notes = await prisma.note.findMany({
      where,
      include: { tags: true },
      orderBy: [
        { isPinned: "desc" },
        { updatedAt: "desc" },
      ],
    });

    return res.json({
      count: notes.length,
      notes,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/notes
// Create a note for the authenticated user.
router.post(
  "/",
  validate(createNoteSchema),
  async (req, res, next) => {
    try {
      const {
        title,
        content,
        category,
        isPinned = false,
        tags = [],
      } = req.body;

      const note = await prisma.note.create({
        data: {
          title,
          content,
          category,
          isPinned,

          // Ownership comes from the verified token.
          userId: req.user.id,

          tags: {
            connectOrCreate: prepareTags(tags),
          },
        },
        include: { tags: true },
      });

      return res.status(201).json({
        message: "Note created successfully",
        note,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/notes/:id
router.get("/:id", async (req, res, next) => {
  try {
    const id = getNoteId(req, res);
    if (id === null) return;

    const allowed = await checkOwnership(
      id,
      req.user.id,
      res
    );

    if (!allowed) return;

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: { tags: true },
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    return res.json({ note });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notes/:id
router.put(
  "/:id",
  validate(updateNoteSchema),
  async (req, res, next) => {
    try {
      const id = getNoteId(req, res);
      if (id === null) return;

      const allowed = await checkOwnership(
        id,
        req.user.id,
        res
      );

      if (!allowed) return;

      const { tags, ...changes } = req.body;

      // Only permitted data fields can be changed.
      const data = { ...changes };

      if (tags !== undefined) {
        data.tags = {
          set: [],
          connectOrCreate: prepareTags(tags),
        };
      }

      // Update within the user's ownership scope.
      const result = await prisma.note.updateMany({
        where: {
          id,
          userId: req.user.id,
        },
        data: changes,
      });

      if (result.count === 0) {
        return res.status(404).json({
          message: "Note no longer available",
        });
      }

      // Apply tag relation changes separately if supplied.
      if (tags !== undefined) {
        await prisma.note.update({
          where: { id },
          data: {
            tags: data.tags,
          },
        });
      }

      const note = await prisma.note.findUnique({
        where: { id },
        include: { tags: true },
      });

      return res.json({
        message: "Note updated successfully",
        note,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/notes/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const id = getNoteId(req, res);
    if (id === null) return;

    const allowed = await checkOwnership(
      id,
      req.user.id,
      res
    );

    if (!allowed) return;

    // Recheck ownership during deletion.
    const result = await prisma.note.deleteMany({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        message: "Note no longer available",
      });
    }

    return res.json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
