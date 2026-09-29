import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const LinkedInProvider: any = {
  id: "linkedin",
  name: "LinkedIn",
  type: "oauth" as const,
  clientId: process.env.LINKEDIN_CLIENT_ID!,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
  wellKnown: "https://www.linkedin.com/oauth/.well-known/openid-configuration",
  issuer: "https://www.linkedin.com",
  idToken: true,
  authorization: {
    params: {
      scope: "openid profile email",
    },
  },
  client: {
    token_endpoint_auth_method: "client_secret_post",
  },
  profile(profile: any) {
    return {
      id: profile.sub,
      name:
        profile.name ??
        ([profile.given_name, profile.family_name].filter(Boolean).join(" ") || null),
      email: profile.email ?? null,
      image: profile.picture ?? null,
    };
  },
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    LinkedInProvider,
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user?.passwordHash || !user.emailVerified) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          profileComplete: user.profileComplete,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).id = user.id;
        (token as any).role = (user as any).role;
        (token as any).profileComplete = (user as any).profileComplete;
      }
      return token;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "linkedin") {
        const dbUser = user.id ? await prisma.user.findUnique({ where: { id: user.id } }) : null;
        if (dbUser && !dbUser.profileComplete) return "/complete-profile";
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id;
        (session.user as any).role = (token as any).role;
        const dbUser = (token as any).id ? await prisma.user.findUnique({ where: { id: (token as any).id } }) : null;
        (session.user as any).profileComplete = dbUser?.profileComplete ?? (token as any).profileComplete ?? false;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

export const getAuthSession = () => getServerSession(authOptions);
