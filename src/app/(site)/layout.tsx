import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HelpButton from "./components/HelpButton";
import SmoothScroll from "./components/SmoothScroll";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SmoothScroll>
        <Navbar />
        {children}
        <Footer />
        <HelpButton />
      </SmoothScroll>
    </>
  );
}
