import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Providers from "./providers";
import HelpButton from "./components/HelpButton";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <Navbar />
      {children}
      <Footer />
      <HelpButton />
    </Providers>
  );
}
