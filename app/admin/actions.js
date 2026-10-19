"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

export async function login(prevState, formData) {
  const form =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
        ? prevState
        : null;

  if (!form) {
    return { error: "Data formulir tidak valid." };
  }

  const email = form.get("email")?.toString().trim();
  const password = form.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let success = false;

  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === "Invalid login credentials") {
        return { error: "Email atau password salah. Silakan coba lagi." };
      }
      return { error: error.message || "Gagal masuk. Silakan coba lagi." };
    }

    success = true;
  } catch (err) {
    return {
      error: err.message || "Terjadi kesalahan server saat mencoba masuk.",
    };
  }

  if (success) {
    redirect("/admin");
  }
}

export async function keluar() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

