import Fastify from "fastify";
import staticPlugin from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname for Bun
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify();

// Serve static files from /public
await fastify.register(staticPlugin, {
  root: path.join(path.dirname(fileURLToPath(import.meta.url)), "public"),
  prefix: "/", // maps to root
});
// Fallback route
// fastify.get("/", async (req, reply) => {
//   return { message: "Vault is working!" };
// });

const DOPPLER_TOKEN = process.env.DOPPLER_TOKEN_DEV;
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase());

fastify.get("/env", async (request, reply) => {
  const rawEmail = request.headers["x-dev-email"] as string | undefined;
  const email = rawEmail?.trim().toLowerCase();

  console.log("📩 Incoming email:", email);
  console.log("✅ Allowed list:", ALLOWED_EMAILS);

  if (!email || !ALLOWED_EMAILS.includes(email)) {
    return reply.status(403).send({ error: "Unauthorized" });
  }

  const dopplerRes = await fetch(
    "https://api.doppler.com/v3/configs/config/secrets/download?project=law-and-ledger&config=dev&format=json",
    {
      headers: {
        Authorization: `Bearer ${DOPPLER_TOKEN}`,
        accept: "application/json",
      },
    }
  );

  if (!dopplerRes.ok) {
    return reply
      .status(dopplerRes.status)
      .send({ error: "Failed to fetch secrets" });
  }

  const rawText = await dopplerRes.text();

  let secrets: Record<string, string>;
  try {
    secrets = JSON.parse(rawText);
    console.log("✅ Secrets from Doppler:", secrets);
  } catch (err) {
    console.error("❌ Failed to parse Doppler JSON:", err);
    return reply
      .status(500)
      .send({ error: "Invalid JSON response from Doppler" });
  }

  const allowedKeys = ["NEXT_PUBLIC_API_URL"]; // Update this as needed
  const filtered = Object.fromEntries(
    Object.entries(secrets).filter(([key]) => allowedKeys.includes(key))
  );

  return reply.send({ env: secrets });
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, () => {
  console.log("✅ Fastify is listening on http://0.0.0.0:3000");
});
