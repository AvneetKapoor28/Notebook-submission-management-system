import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Sign in · ${APP_NAME}`,
  description: "Sign in to your Notebook Flow teacher account.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
