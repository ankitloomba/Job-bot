import "./globals.css";
import Providers from "@/components/providers";

export const metadata = { title: "JobHuntPro — Find the right jobs. Faster.", description: "AI-powered job matching that helps professionals discover relevant opportunities, understand their fit, and apply faster.", icons: { icon: "/favicon.svg" }, manifest: "/manifest.webmanifest", openGraph: { title: "JobHuntPro — Find the right jobs. Faster.", description: "Search less. Match better. Apply faster.", type: "website" } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
