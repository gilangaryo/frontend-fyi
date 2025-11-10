import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "./(site)/providers";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],

});

export const metadata: Metadata = {
  title: "FYI",
  description: "Ecommerce website",

};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>

        <Providers>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#705A4F",
                color: "#fff",
                borderRadius: "8px",
                padding: "12px 16px",
              },
            }}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
