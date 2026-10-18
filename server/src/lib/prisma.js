
import { PrismaClient } from "@prisma/client";

// Reuse one Prisma client instance across API routes.
const prisma = new PrismaClient();

export default prisma;
