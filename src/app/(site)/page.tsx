import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import About from "./components/landing/About";
import CTA from "./components/landing/CTA";
import ScrollReveal from "./components/ScrollReveal";

export default function Home() {
  return (
    <>
      <Hero />
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
