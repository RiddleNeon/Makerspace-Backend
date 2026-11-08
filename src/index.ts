import { handle_schedule_request } from "./schedule/schedule_manager";
import { authenticatedJson, checkEmailAvailability, checkNameAvailability, createAuth, manage_admin, unauthenticatedJson } from "./auth/auth";
import { detect_filament_type } from "./wiki/filament/filament_detector";
import z from "zod";

export interface Env {
  AUTH_DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  OPENROUTER_API_KEY: string,
  OPENCODE_API_KEY: string
}

const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "https://makerspace-frontend.arcegamer2022.workers.dev",
]);

function getCorsHeaders(origin: string | null): Headers {
  const headers = new Headers();

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    headers.append("Vary", "Origin");
  }

  return headers;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const corsHeaders = getCorsHeaders(origin);

    if (request.method === "OPTIONS") {
      if (!origin || !ALLOWED_ORIGINS.has(origin)) {
        return new Response("Origin not allowed", { status: 403 });
      }
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    let response: Response;

    if (
      url.pathname === "/api/auth/check/name" &&
      request.method === "POST"
    ) {
      const NameCheckSchema = z.object({
        nameToCheck: z.string().min(1),
      });

      response = await unauthenticatedJson(request, NameCheckSchema, async (body) => {
        let nameToCheck = body.nameToCheck;
        let available = await checkNameAvailability(nameToCheck, createAuth(env));
        console.log(`name available: ${available}`);
        return Response.json({ available });
      });
    } else if (
      url.pathname === "/api/auth/check/email" &&
      request.method === "POST"
    ) {
      const EmailCheckSchema = z.object({
        emailToCheck: z.string().min(1),
      });

      response = await unauthenticatedJson(request, EmailCheckSchema, async (body) => {
        let emailToCheck = body.emailToCheck;
        let available = await checkEmailAvailability(emailToCheck, createAuth(env));
        console.log(`available: ${available}`);
        return Response.json({ available });
      });
    } else if (url.pathname.startsWith("/api/auth/")) {
      const auth = createAuth(env);
      response = await auth.handler(request);
    } else if (
      url.pathname === "/api/schedule" &&
      request.method === "POST"
    ) {
      response = await handle_schedule_request(request, createAuth(env));
    } else if (
      url.pathname === "/api/admin/manage" &&
      request.method === "POST"
    ) {
      response = await manage_admin(request, createAuth(env));
    } else if (
      url.pathname === "/api/wiki/filament/decide" &&
      request.method === "POST"
    ) {
      const FilamentDecideSchema = z.object({
        idea: z.string().min(1),
      });
      response = await authenticatedJson(
        request,
        FilamentDecideSchema,
        (_body, _session) => "user",
        () => createAuth(env).api.getSession({
          headers: request.headers,
        }),
        async (body) => {
          let idea = body.idea;
          let response = await detect_filament_type(idea, env);
          return Response.json(response);
        })
    } else {
      response = Response.json({ message: "Backend is running" });
    }

    const finalHeaders = new Headers(response.headers);
    corsHeaders.forEach((value, key) => {
      finalHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: finalHeaders,
    });
  },
};
