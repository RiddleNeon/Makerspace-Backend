import { betterAuth } from "better-auth";

interface Env {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const auth = betterAuth({
      database: env.DB,

      baseURL: "http://localhost:8787",

      secret: env.BETTER_AUTH_SECRET,

      emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
      },
    });

    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/auth/")) {
      return auth.handler(request);
    }

    if (url.pathname === "/api/me") {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        return Response.json(
          { authenticated: false },
          { status: 401 }
        );
      }

      return Response.json({
        authenticated: true,
        user: session.user,
        session: session.session,
      });
    }

    return Response.json({
      message: "Backend is running",
    });
  },
};
