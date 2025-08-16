import { type Config } from "drizzle-kit";

import { env } from "@/env";

export default {
  schema: "./src/server/db/**/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  schemaFilter: ["public", "auth", "storage"],
  entities: {
    roles: {
      provider: "supabase",
    },
  },
} satisfies Config;
