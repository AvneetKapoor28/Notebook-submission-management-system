"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db, schema } from "@/db";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = formData.get("password") as string | null;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const teacher = await db.query.teachers.findFirst({
    where: eq(schema.teachers.email, email),
  });

  if (!teacher || !teacher.passwordHash) {
    return { error: "Invalid email or password." };
  }

  const valid = verifyPassword(password, teacher.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  await createSession(teacher.id);
  redirect("/dashboard");
}
