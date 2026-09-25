import "./globals.css";
export const metadata = { title: "JobFitPro", description: "Find jobs that fit you." };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
