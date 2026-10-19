import { createClient } from "@supabase/supabase-js";
import { createServerClient as createSupabaseSSRClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Membuat client Supabase di sisi server menggunakan SUPABASE_SECRET_KEY.
 * Digunakan untuk membaca data publik (seperti katalog dan detail produk)
 * melewati aturan RLS secara aman tanpa ekspos ke browser.
 */
export function createServerClient() {
  let supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  // Bersihkan URL jika tidak sengaja menyertakan /rest/v1 atau garis miring di akhir
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const createSupabaseServerClient = createServerClient;

/**
 * Membuat client Supabase sesi di sisi server menggunakan SUPABASE_PUBLISHABLE_KEY dan cookie.
 * Digunakan untuk autentikasi admin (login, keluar, ganti password) dan aksi pengelolaan produk.
 */
export async function createSessionClient() {
  const cookieStore = await cookies();
  let supabaseUrl = process.env.SUPABASE_URL;
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diatur di environment variable."
    );
  }

  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

  return createSupabaseSSRClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ditangani jika dipanggil dari konteks yang tidak mengizinkan set cookie
        }
      },
    },
  });
}

export const createAdminSessionClient = createSessionClient;
