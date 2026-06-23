import { supabase } from "./supabaseClient";

// Max upload size for ALL images across the app: 500 KB.
export const MAX_IMAGE_BYTES = 500 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];

// Validate a File against the 500 KB limit + allowed types. Returns an error
// string, or "" if the file is acceptable. Use this on any image input.
export function validateImage(file) {
  if (!file) return "No file selected.";
  if (!ALLOWED.includes(file.type)) return "File must be a PNG, JPG, WEBP, or PDF.";
  if (file.size > MAX_IMAGE_BYTES) {
    return `File is ${(file.size / 1024).toFixed(0)} KB — max allowed is 500 KB. Please upload a smaller image.`;
  }
  return "";
}

// Upload a KYC/ID file to the private `kyc-documents` bucket, under the signed-in
// user's folder. Returns the stored path. Throws if validation fails or upload errors.
export async function uploadKycFile(file, label) {
  const err = validateImage(file);
  if (err) throw new Error(err);

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("You must be signed in to upload.");

  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${auth.user.id}/${label}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("kyc-documents")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw new Error(error.message || "Upload failed.");

  return path;
}
