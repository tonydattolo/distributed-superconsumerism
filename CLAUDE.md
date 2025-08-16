# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

## Essential Commands

### Web Development (in `apps/web`)

```bash
# Run nextjs server
pnpm dev                    # Start Next.js dev server with Doppler env vars

# Database Management  
pnpm db:generate           # Generate Drizzle migrations from schema changes
pnpm db:migrate            # Apply migrations to database
```

## Architecture & Key Patterns

### Tech Stack
- **Frontend**: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **API**: tRPC for type-safe endpoints, Zod for validation
- **Database**: PostgreSQL via Supabase, Drizzle ORM for type-safe queries
- **Authentication**: Supabase Auth (authentication only, not authorization)
- **Environment**: we don't use .env files, we use doppler to inject our env vars at runtime using commands like this: `doppler run -p crm -c dev -- next dev` which is just a package.json script replacement for the `pnpm dev` command for running the nextjs frontend as an example. we use @t3-oss/env-nextjs in `apps/web/src/env.js` to handle adding env vars we need and then we manually add them to doppler, so you can just add them there. 
- **MCP**: We're using Anthropics MCP Server in conjuction with trpc-to-
- **Events**: We're self-hosting trigger.dev to run extended jobs
- **Emails**: We're using resend to send emails along with their react-email library for templating.


### Project Structure
```
/apps/web/                 # Next.js application
  /src/
    /app/                 # App Router pages and API routes
      /(frontend)/
         /api/             # nextjs apis
    /components/          # Reusable UI components
    /contexts/          # react contexts
    /server/
      /api/              # tRPC root and procedure definitions
         /routers/      # trpc procedures
      /db/               # Drizzle schemas and queries
    /hooks/              # Custom React hooks
    /lib/                # Utilities and configurations
/docker/ # it's just self-hosted supabase docker compose for now, we may add more services later
   /dev/
   /volumes/
   docker-compose.yml
/llm-txt/               # additional contexts if needed
```

### Development Workflow
0. **Goals**:
   - the goal is to ensure the entire application is typed correctly end to end to reduce bugs and mismatches between frontend/backend/database when data models or behavior is changed.

1. **Database Changes**: 
   - Edit schema in `apps/web/src/server/db/schemas/` using 3NF normalization.
      note: we auto-generate ts types and zod schemas from drizzle-orm methods for example:
      ```ts
      export type Profile = typeof profiles.$inferSelect;
      export type NewProfile = typeof profiles.$inferInsert;
      export const profilesSelectSchema = createSelectSchema(profiles);
      export const profilesInsertSchema = createInsertSchema(profiles);
      ```
   - Run `pnpm db:generate` then `pnpm db:migrate` in `apps/web`

2. **API/MCP Development**:
   - use our generated schemas and types when creating both our trpc procedures and wiring up our frontend with the trpc mutations/queries and react-hook-form zod resolver
   - Create tRPC procedures in `apps/web/src/server/api/routers/`
   - Use `authenticatedProcedure` for protected endpoints
   - Add Zod validation schemas inline
   - 

3. **Frontend Development**:
   - Use tRPC hooks for data fetching
   - Forms: React Hook Form + Zod resolver
   - Mark components as 'use client' when using React hooks
   - Use shadcn/ui components from `apps/web/src/components/ui/`

4. **Smart Contract Development**:
   - Write contracts in `apps/contracts/src/`
   - Tests in `apps/contracts/test/`
   - Always write comprehensive tests for new functionality, run the tests, and fix any issues that appear in the terminal output.

## Critical Rules

1. **Never delete code features unrelated to what we asked about** - Comment it out instead if you think it's not needed and we'll manually determine if it's still needed later.
2. **File naming**: Use kebab-case (e.g., `user-profile.tsx`)
3. **No raw SQL**: Use Drizzle ORM schemas to manage our database structure, don't try and generate sql files, we always use db:generate. 
4. **Environment variables**: we don't use .env files, we use doppler to inject our env vars at runtime using commands like this: `doppler run -p distributed-superconsumerism -c dev -- next dev`. we use @t3-oss/env-nextjs in `apps/web/src/env.js` to handle adding env vars we need and then we manually add them to doppler, so you can just add them there. 
5. **Icons**: dont waste time implementing SVGs just use lucide react icon placeholders
6. **UI density**: Make interfaces information-dense (Bloomberg terminal style)
7. **Client components**: Explicitly add 'use client' when using hooks
8. use kebab-case for file names
9. you don't need to remove unused imports if they're needed later for implementing important things.
10. nextjs params need to be awaited now
11. when implementing components, ensure they comply with our shadcn next-themes, for example background/text color are always set by default. 
12. when implementing input forms, textareas, etc: disable 1password from popping up by adding `data-1p-ignore`

## Key Solidity Contract Architecture for this specific project

contracts are in ./contracts/src

## Common Tasks

### Add a New Database Table
1. Create schema in `apps/web/src/server/db/schemas/[name]-schema.ts`
2. Export from `apps/web/src/server/db/schemas/index.ts`
3. Run `pnpm db:generate` and `pnpm db:migrate`
4. Create tRPC router in `apps/web/src/server/api/routers/[name]-router.ts`

### Create a New Page
1. Add route in `apps/web/src/app/(frontend)/a/[route]/page.tsx`
2. Use existing layout structure from sibling pages
3. Implement with shadcn/ui components and tRPC queries/mutations

# Auth

- `apps/web/src/app/(frontend)/a/` authenticated routes gate, protected by supabase middleware in `apps/web/src/utils/supabase/middleware.ts`
- `apps/web/src/app/(frontend)/auth/**` and `apps/web/src/app/(frontend)/(landing)/**` are except from middleware auth checks

## Auth System, Multi-tenancy, RBAC, postgres RLS via drizzle pgPolicy()
We're using supabase self-hosted for our authentication system. we use the auth system just for auth, and then we use RLS policies using drizzle-orm native postgres RLS support for determining who can access what content. we have implemented multi-tenancy through workspace tables. since the auth schema from supabase is not editable for security purposes, we use the profiles table to reference the user for things like profile metadata, authorization like which workspaces they belong to, and user type for cases where there are many different types of users and depending on which type of user they are determines which app they are shown for example an LMS will have admins/teachers/students.

the drizzle-orm schema and trpc procedures are located in:
- `apps/web/src/server/db/schemas/workspaces_schema.ts`
- `apps/web/src/server/db/schemas/profiles_schema.ts`
- `apps/web/src/server/api/routers/profile_router.ts`
- `apps/web/src/server/api/routers/workspace_router.ts`

an example of adding pg RLS using drizzle on a table will look like this:
```ts
(table) => [
    // Unique constraint for workspace-user combination
    unique("unique_workspace_member").on(table.workspaceId, table.userId),

    // Policy: Members can view other members in their workspaces
    pgPolicy("view_workspace_members", {
      for: "select",
      to: authenticatedRole,
      using: sql`
        EXISTS (
          SELECT 1 FROM workspace_members self
          WHERE self.workspace_id = ${table.workspaceId}
          AND self.user_id = auth.uid()
          AND self.deleted_at IS NULL
        )
      `,
    }),

    // Policy: Only admins and owners can manage members
    pgPolicy("manage_workspace_members", {
      for: "all",
      to: authenticatedRole,
      using: sql`
        EXISTS (
          SELECT 1 FROM workspace_members self
          WHERE self.workspace_id = ${table.workspaceId}
          AND self.user_id = auth.uid()
          AND self.role IN ('admin', 'owner')
          AND self.deleted_at IS NULL
        )
      `,
    }),
  ],
```
we have a custom trpc procedure for implemented protected routes where the user needs to be authenticated located in `apps/web/src/server/api/trpc.ts`:

```ts
/**
 * Protected (authenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It guarantees
 * that a user querying is authorized and logged in.
 */
export const authenticatedProcedure = t.procedure.use(
  async function isAuthed(opts) {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { ctx } = opts;
    // `ctx.user` is nullable
    if (!session?.user) {
      //     ^?
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    if (!ctx.db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection not found",
      });
    }

    return opts.next({
      ctx: {
        // ✅ user value is known to be non-null now
        user: session.user,
        // ^?
        db: ctx.db,
      },
    });
  },
);
```

for projects where we use oauth we have an additional schema and routers so that we can do actions on the users behalf like send emails or refresh their oauth and store it so we can send scheduled emails later, these are located in `apps/web/src/server/db/schemas/oauth_tokens_schema.ts` and `apps/web/src/server/api/routers/oauth_router.ts`. not every project needs this.

### Profile, RBAC Context Providers
- information about logged in users profile, workspace info, is stored in `app/web/src/context/rbac-context.tsx` if you need to make changes, make sure you update this. it's done to provide the rest of the UI with updates about the user, their type, status, workspaces, active workspace, etc.
- this information is set on login SSR after the user is logged in and the app loads in `apps/web/src/app/(frontend)/a/layout.tsx`

```ts
...
export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </Suspense>
  );
}

async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Fetch profile and workspace memberships
  let [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id));

  if (!profile) {
    // Edge case, postgres trigger to create profile didn't run, we create manually for authenticated user
    try {
      const manualProfileInit = await api.profile.createInitialProfile();
      if (!manualProfileInit) {
        throw new Error("Failed to create profile");
      }
    } catch (error) {
      console.error("No profile found: ", error);
      // redirect("/auth/login");
    }
  }

  // Fetch all workspaces the user is a member of, including their role
  const workspaceMembershipsData = await db
    .select({
      workspace: workspaces,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(
      and(
        eq(workspaceMembers.userId, user.id),
        isNull(workspaceMembers.deletedAt),
        isNull(workspaces.deletedAt),
      ),
    );

  // Transform the memberships into the WorkspaceAccess format
  const workspaceMemberships = workspaceMembershipsData.map(
    ({ workspace, role }) => ({
      workspace,
      role,
      permissions: ROLE_PERMISSIONS[role] ?? [],
    }),
  );

  // If user has no workspaces, show the create workspace form
  if (workspaceMemberships.length === 0) {
    return (
      <RBACProvider
        initialProfile={profile}
        initialWorkspaces={workspaceMemberships}
      >
        <CreateWorkspaceForm />
      </RBACProvider>
    );
  }

  return (
    <RBACProvider
      initialProfile={profile}
      initialWorkspaces={workspaceMemberships}
    >
    ...
```
