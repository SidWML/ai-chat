import NextAuth from "next-auth";
import { authOptions } from "@/lib/v2/auth-options";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
