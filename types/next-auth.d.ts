import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id?: string;
      /** Azure AD group object IDs — populated when groupMembershipClaims is configured. */
      groups?: string[];
      /** Azure AD App roles — populated when App roles are configured. */
      roles?: string[];
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    groups?: string[];
    roles?: string[];
  }
}
