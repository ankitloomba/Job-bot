import "./globals.css";
import Providers from "@/components/providers";

export const metadata = {
  title: "JobHuntPro",
  description: "Find the right jobs. Faster.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
