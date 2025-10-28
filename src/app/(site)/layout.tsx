import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Providers from "./providers";
import FloatingEmail from "./components/FloatingEmail";
import HelpButton from "./components/HelpButton";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Navbar />
      {children}
      <Footer />
      <FloatingEmail />
      <HelpButton />
    </Providers>
  );
}
