"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db, schema } from "@/db";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

export async function registerAction(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = formData.get("password") as string | null;
  const confirmPassword = formData.get("confirmPassword") as string | null;

  if (!name || !email || !password || !confirmPassword) {
    return { error: "All fields are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  // Check if email already taken
  const existing = await db.query.teachers.findFirst({
    where: eq(schema.teachers.email, email),
  });

  if (existing && existing.passwordHash) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = hashPassword(password);

  let teacher;
  if (existing) {
    // Update the existing teacher (e.g., the old hard-coded one) with a password
    const [updated] = await db
      .update(schema.teachers)
      .set({ name, passwordHash })
      .returning();
    teacher = updated;
  } else {
    const [created] = await db
      .insert(schema.teachers)
      .values({ name, email, passwordHash })
      .returning();
    teacher = created;
  }

  await createSession(teacher.id);
  redirect("/dashboard");
}
