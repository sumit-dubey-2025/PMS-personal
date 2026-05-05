import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      // issuer must match exactly what Microsoft's OIDC discovery returns (no trailing slash)
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    jwt({ token, account, profile }) {
      if (account && profile) {
        token.id = profile.sub;
        // Entra ID includes group object IDs when groupMembershipClaims is configured on the app registration.
        const rawGroups = (profile as Record<string, unknown>).groups;
        token.groups = Array.isArray(rawGroups) ? (rawGroups as string[]) : [];

        // Entra ID includes roles when App Roles are configured.
        const rawRoles = (profile as Record<string, unknown>).roles;
        token.roles = Array.isArray(rawRoles) ? (rawRoles as string[]) : [];
      }
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      session.user.groups = token.groups ?? [];
      session.user.roles = token.roles ?? [];
      return session;
    },
  },
});
