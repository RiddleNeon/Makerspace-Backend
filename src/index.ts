import { betterAuth } from "better-auth";
import { z } from "zod";

interface Env {
  AUTH_DB: D1Database;
  BETTER_AUTH_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const auth = betterAuth({
      database: env.AUTH_DB,
      baseURL: "http://localhost:8787",

      secret: env.BETTER_AUTH_SECRET,

      emailAndPassword: {
        enabled: true,
      },
    });

    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/auth/")) {
      return auth.handler(request);
    }
    const ScheduleSchema = z.object({
      title: z.string().min(1),
      start: z.string(),
      end: z.string(),
    });

    if (url.pathname === "/api/schedule" && request.method === "POST") {
      return authenticatedJson(
        request,
        ScheduleSchema,

        () => auth.api.getSession({
          headers: request.headers,
        }),

        async (body, session) => {
          console.log(body.title);
          console.log(session.user.id);

          return Response.json({
            success: true,
          });
        }
      );
    }
    return Response.json({ message: "Backend is running" });
  },
};

async function authenticatedJson<T>(
  request: Request,
  schema: z.ZodType<T>,
  getSession: () => Promise<any>,
  handler: (body: T, session: any) => Promise<Response>,
): Promise<Response> {
  const session = await getSession();

  if (!session) {
    return Response.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const result = schema.safeParse(json);

  if (!result.success) {
    return Response.json(
      {
        error: "Invalid request body",
        details: result.error.issues,
      },
      { status: 400 }
    );
  }

  return handler(result.data, session);
}
