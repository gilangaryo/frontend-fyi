import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Providers from "./providers";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Navbar />
      {children}
      <Footer />
    </Providers>
  );
}
