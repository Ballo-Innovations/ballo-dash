import { and, eq } from "drizzle-orm";
import { db } from "@/db/db";
import { users } from "@/db/schema";
import { apiHandler, route } from "@/server/api";
import { notFound } from "@/server/errors";

export default apiHandler({
  GET: route({
    handler: async ({ user: sessionUser }) => {
      const [user] = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          role: users.role,
          companyId: users.companyId,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(and(eq(users.id, sessionUser.id), eq(users.companyId, sessionUser.companyId)))
        .limit(1);
      if (!user) throw notFound("User");
      const { firstName, lastName, ...rest } = user;
      return { user: { ...rest, name: `${firstName} ${lastName}` } };
    },
  }),
});
