/** NextAuth configuration (moved from the route file so server code can import it). */
import type { AuthOptions, SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db/db"; // your Drizzle db client
import { users } from "@/db/schema"; // your user table schema
import { sql } from "drizzle-orm";
import { verifyCredentials } from "./credentials";
import { clientIp } from "./rate-limit";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const ip = clientIp((req?.headers ?? {}) as Record<string, string | string[] | undefined>);
        return verifyCredentials(
          { email: credentials?.username, password: credentials?.password, ip },
          {
            findUserByEmail: async (email) => {
              const [user] = await db
                .select()
                .from(users)
                .where(sql`lower(${users.email}) = ${email}`)
                .limit(1);
              return user;
            },
          }
        );
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Attach user.id, role, and companyId to token on initial sign-in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyId = user.companyId;
      } 
      
      // No more token fetching - tokens are now fetched directly from database when needed
      return token;
    },
    async session({ session, token }) {
      // Add custom fields to session.user
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.companyId = token.companyId as string;
        // No more accessTokens - tokens are fetched directly from database when needed
      }
      return session;  // Return updated session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to baseUrl (usually "/") after sign-in
      return baseUrl;
    },
  },
};

