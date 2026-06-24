import type { Metadata } from "next";
import "./globals.css";

import { AppShell } from "@/components/app/app-shell";
import { ClientProviders } from "@/components/app/client-providers";
import { APP_NAME } from "@/lib/constants";
import { listClassesOverview } from "@/features/classes/queries";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Workflow-first notebook tracking for school teachers.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const classes = await listClassesOverview().catch(() => []);

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppShell classes={classes}>{children}</AppShell>
        <ClientProviders />
      </body>
    </html>
  );
}
