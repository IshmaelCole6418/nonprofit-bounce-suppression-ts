import { z } from "zod";
import { infrai } from "./infrai.js";

export const mailRequest = z.object({ kind: z.enum(["receipt", "volunteer_reminder"]), to: z.string().email(), name: z.string().min(1), amountCents: z.number().int().positive().optional(), campaign: z.string().min(1).optional() });
export type MailRequest = z.infer<typeof mailRequest>;

export async function sendDonorOrVolunteer(input: MailRequest) {
  const value = mailRequest.parse(input);
  const receipt = value.kind === "receipt";
  if (receipt && value.amountCents === undefined) throw new Error("amountCents is required for receipts");
  const subject = receipt ? `Thank you for your gift to ${value.campaign ?? "our nonprofit"}` : `Volunteer reminder for ${value.campaign ?? "this week's shift"}`;
  const html = receipt ? `<p>Hi ${value.name}, your gift of $${(value.amountCents! / 100).toFixed(2)} helps our work.</p>` : `<p>Hi ${value.name}, this is a reminder about your volunteer shift.</p>`;
  return infrai.email.send({ to: value.to, subject, html }, `${value.kind}:${value.to}`);
}

export async function handleHardBounce(email: string) {
  const status = await infrai.email.suppression.check(email);
  if (status.suppressed) return { email, action: "already_suppressed" as const };
  await infrai.email.suppression.add(email);
  return { email, action: "suppressed" as const };
}
