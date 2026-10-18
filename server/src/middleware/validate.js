
import { ZodError } from "zod";

// ======================================================
// VALIDATION MIDDLEWARE
// ======================================================

// Validates incoming request data using a Zod schema.
export const validate = (schema) => (req, res, next) => {
  try {
    // Validate the incoming request body.
    const validatedData = schema.parse(req.body);

    // Replace the original body with validated data.
    req.body = validatedData;

    // Continue to the next middleware or route.
    next();
  } catch (error) {
    // Handle Zod validation errors.
    if (error instanceof ZodError) {
      // Safely access validation issues.
      const issues = error.issues ?? error.errors ?? [];

      return res.status(400).json({
        success: false,
        message: "Validation failed",

        errors: issues.map((item) => ({
          field: item.path?.join(".") || "unknown",
          message: item.message,
        })),
      });
    }

    // Pass unexpected errors to Express error middleware.
    next(error);
  }
};
