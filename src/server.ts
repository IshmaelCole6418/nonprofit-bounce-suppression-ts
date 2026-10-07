import { handleHardBounce, mailRequest, sendDonorOrVolunteer } from "./nonprofit_mail.js";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    if (body.event === "hard_bounce") return Response.json(await handleHardBounce(body.email));
    const parsed = mailRequest.safeParse(body);
    if (!parsed.success) return Response.json({ error: "invalid request", details: parsed.error.flatten() }, { status: 400 });
    return Response.json(await sendDonorOrVolunteer(parsed.data));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "request failed" }, { status: 502 });
  }
}
