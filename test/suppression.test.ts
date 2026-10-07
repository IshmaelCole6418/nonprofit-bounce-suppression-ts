import assert from "node:assert/strict";
import { mailRequest } from "../src/nonprofit_mail.js";

const valid = mailRequest.safeParse({ kind: "receipt", to: "donor@example.org", name: "Mina", amountCents: 2500, campaign: "River cleanup" });
assert.equal(valid.success, true);
const missingAmount = mailRequest.safeParse({ kind: "receipt", to: "donor@example.org", name: "Mina" });
assert.equal(missingAmount.success, true);
if (missingAmount.success) assert.equal(missingAmount.data.amountCents, undefined);
console.log("request boundary test passed");
