
import jwt from "jsonwebtoken";

// Checks whether a valid JWT was supplied.
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication token required",
    });
  }

  // Extract token after "Bearer "
  const token = authHeader.split(" ")[1];

  try {
    // Verify both token signature and expiration.
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    // Attach authenticated user's identity to request.
    req.user = {
      id: Number(decoded.sub),
      role: decoded.role,
    };

    if (!Number.isSafeInteger(req.user.id) || req.user.id <= 0) {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

// Optional role-based authorization middleware.
// Example usage: authorizeRoles("ADMIN").
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Insufficient permissions",
      });
    }

    next();
  };
}
