import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import About from "./components/landing/About";
import CTA from "./components/landing/CTA";
import ScrollReveal from "./components/ScrollReveal";
import FloatingEmail from "./components/FloatingEmail";

export default function Home() {
  return (
    <>
      <Hero />
      <FloatingEmail />

      <ScrollReveal>
        <h2 className="text-secondary text-base md:text-xl font-light text-center mx-auto px-4 md:px-0 py-20 leading-relaxed my-0">
          Welcome to FYI Couture
        </h2>
      </ScrollReveal>
      <ScrollReveal>
        <Features />
      </ScrollReveal>
      <ScrollReveal>
        <About />
      </ScrollReveal>
      <ScrollReveal>
        <CTA />
      </ScrollReveal>
    </>
  );
}
