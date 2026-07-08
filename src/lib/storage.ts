import { createClient, SupabaseClient } from "@supabase/supabase-js";

/* Uploaded slip/review images live in the private "uploads" bucket on
   Supabase Storage rather than local disk — Vercel's serverless filesystem
   is read-only, so writing to disk works locally but 500s in production. */
const BUCKET = "uploads";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY is not set");
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

export async function uploadFile(relPath: string, buf: Buffer, contentType: string): Promise<void> {
  const { error } = await getClient().storage.from(BUCKET).upload(relPath, buf, { contentType, upsert: true });
  if (error) throw error;
}

export async function downloadFile(relPath: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  const { data, error } = await getClient().storage.from(BUCKET).download(relPath);
  if (error || !data) return null;
  const buffer = Buffer.from(await data.arrayBuffer());
  return { buffer, contentType: data.type || "application/octet-stream" };
}

export async function deleteFile(relPath: string): Promise<void> {
  const { error } = await getClient().storage.from(BUCKET).remove([relPath]);
  if (error) throw error;
}
