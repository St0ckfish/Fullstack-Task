import "~/styles/globals.css";

import { type Metadata } from "next";


export const metadata: Metadata = {
  title: "Website Generator",
  description: "Generate website sections based on your ideas",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body>
        {children}
      </body>
    </html>
  );
}
