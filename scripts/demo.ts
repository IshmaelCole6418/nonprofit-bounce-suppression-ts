import { sendDonorOrVolunteer, handleHardBounce } from "../src/nonprofit_mail.js";

const to = process.env.DEMO_EMAIL_TO;
if (!to) throw new Error("DEMO_EMAIL_TO is required");
const sent = await sendDonorOrVolunteer({ kind: "receipt", to, name: "Ari", amountCents: 1800, campaign: "Community garden" });
console.log("receipt accepted:", sent.message_id);
if (process.env.BOUNCED_EMAIL) console.log(await handleHardBounce(process.env.BOUNCED_EMAIL));
