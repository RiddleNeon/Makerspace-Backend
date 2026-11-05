import { betterAuth } from "better-auth";
import { Env } from "..";
import z from "zod";
import { admin as adminPlugin } from "better-auth/plugins";
import { ac, admin, moderator, user } from "./roles";


export function createAuth(env: Env) {
  return betterAuth({
    database: env.AUTH_DB,
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,

    emailAndPassword: {
      enabled: true,
    },


    trustedOrigins: [
      "http://localhost:5173",
      "https://makerspace-frontend.arcegamer2022.workers.dev",
    ],

    user: {
      additionalFields: {
        role: {
          type: ["user", "moderator", "admin"],
          required: false,
          defaultValue: "user",
          input: false,
        },
        displayName: {
          type: "string",
          required: false,
        },
      },
    },

    plugins: [
      adminPlugin({
        ac,
        roles: {
          user,
          moderator,
          admin,
        },
        defaultRole: "user",
        adminRoles: ["moderator", "admin"],
      }),
    ]
  });
}

export type AuthInstance = ReturnType<typeof createAuth>;

export enum UserRole {
  User = 0, Moderator = 1, Admin = 2
}

const userByName: Record<string, UserRole> = {
  user: UserRole.User,
  moderator: UserRole.Moderator,
  admin: UserRole.Admin,
  User: UserRole.User,
  Moderator: UserRole.Moderator,
  Admin: UserRole.Admin,
};

export function has_access(role: string, required: string): boolean {
  let role_enum_val = userByName[role];
  if (role_enum_val === null) return false;

  let required_role_enum_val = userByName[required];
  if (required_role_enum_val === null) return false;

  let has_access = role_enum_val >= required_role_enum_val;

  return has_access;
}

const ManageAdminSchema = z.object({
  user_id: z.string(),
  new_role: z.string()
});

export async function manage_admin(request: Request, auth: AuthInstance
): Promise<Response> {
  return authenticatedJson(
    request,
    ManageAdminSchema,
    (_body, _session) => "admin",

    () => auth.api.getSession({
      headers: request.headers,
    }),

    async (body, session) => {
      console.log(body.new_role);
      console.log(body.user_id);
      console.log(session.user.id);

      switch (body.new_role) {
        case "user": { await auth.api.setRole({ body: { userId: body.user_id, role: "user" }, headers: request.headers }); break; };
        case "moderator": { await auth.api.setRole({ body: { userId: body.user_id, role: "moderator" }, headers: request.headers }); break; };
        case "admin": { await auth.api.setRole({ body: { userId: body.user_id, role: "admin" }, headers: request.headers }); break; };
        default: throw new Error("no valid role!");
      }



      return Response.json({
        success: true,
      });
    }
  )
}




export async function authenticatedJson<T>(
  request: Request,
  schema: z.ZodType<T>,
  getRequiredRole: (body: T, session: any) => string,
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

  let body = result.data;


  if (!has_access(session.user.role, getRequiredRole(body, session))) {
    return Response.json(
      { authenticated: false },
      { status: 403 }
    );
  }
  return handler(body, session);
}

export async function unauthenticatedJson<T>(
  request: Request,
  schema: z.ZodType<T>,
  handler: (body: T) => Promise<Response>,
): Promise<Response> {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  console.log(json);

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

  let body = result.data;


  return handler(body);
}


export async function checkNameAvailability(nameToTest: string, auth: AuthInstance): Promise<boolean> {
  const { adapter } = await auth.$context;

  const existingUser = await adapter.findOne({
    model: "user",
    where: [
      {
        field: "name",
        value: nameToTest,
      },
    ],
  });

  console.log(existingUser);


  return existingUser === null;
}


export async function checkEmailAvailability(emailToTest: string, auth: AuthInstance): Promise<boolean> {
  const { adapter } = await auth.$context;
  const existingUser = await adapter.findOne({
    model: "user",
    where: [
      {
        field: "email",
        value: emailToTest,
      },
    ],
  });

  console.log(existingUser);

  return existingUser === null;
}
