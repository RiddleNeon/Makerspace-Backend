
import { z } from "zod";
import { authenticatedJson, AuthInstance } from "../auth/auth";

const ScheduleSchema = z.object({
  title: z.string().min(1),
  start: z.string(),
  end: z.string(),
});

export async function handle_schedule_request(request: Request, auth: AuthInstance
): Promise<Response> {
  return authenticatedJson(
    request,
    ScheduleSchema,
    (_, __) => "user",

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
  )
}
