import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Create Account · ${APP_NAME}`,
  description: "Create your Notebook Flow teacher account.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
