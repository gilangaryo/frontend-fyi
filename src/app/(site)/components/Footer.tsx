"use client";

import { ArrowUp, ArrowUpRight } from "lucide-react";
import Link from "next/link";
export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-primary text-charcoal px-6  py-10 relative ">
      <div className="max-w-full mx-auto flex flex-col gap-10">
        {/* Top Area */}
        <h2 className="text-3xl font-medium mb-4 flex items-center gap-2">
          Collection{" "}
          <span className="text-lg -translate-y-4">
            {" "}
            <ArrowUpRight />
          </span>
        </h2>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
          {/* Left Section */}
          <div className="flex-1 md:place-self-end max-w-full">
            <nav className="flex flex-wrap gap-2 text-sm text-charcoal max-w-60">
              {[
                "Home",
                "Beyond",
                "Story",
              ].map((link, idx, arr) => (
                <span key={link}>
                  <Link href={link === "Home" ? "/" : `/${link.toLowerCase().replace(" ", "-")}`} className="hover:underline hover:text-secondary transition-colors">
                    {link}
                  </Link>
                  {idx < arr.length - 1 && " /"}
                </span>
              ))}
            </nav>
          </div>

          {/* Middle Section */}
          <div className="flex-1 text-sm space-y-6">
            <div>
              <p className="uppercase text-xs text-charcoal mb-1">Contact Us</p>
              <p className="text-sm md:text-lg font-medium">
                +62 818 0909 5005
              </p>
            </div>
            <div>
              <p className="uppercase text-xs text-charcoal mb-1">Email</p>
              <p className="text-sm md:text-lg text-charcoal">
                foryourinfinity@gmail.com
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex-1 text-sm space-y-6">
            <div>
              <p className="uppercase text-xs text-charcoal mb-1">Address</p>
              <a 
                href="https://maps.google.com/?q=Butik+FYI,+Jalan+Tanah+Barak+no.15,+Badung,+Bali,+Indonesia+80351"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm md:text-lg text-charcoal hover:underline block"
              >
                Jalan Tanah Barak no.15, Badung, Bali, Indonesia 80351
              </a>
            </div>
            <div>
              <p className="uppercase text-xs text-charcoal mb-1">
                Opening Hours
              </p>
              <p className="text-sm md:text-lg font-medium">10am—5pm </p>
              <p className="text-xs">(Sunday closed)</p>
            </div>
          </div>
          {/* Copyright */}
          <div className="text-xs text-charcoal text-right place-self-end ">
            © 2025 — Copyright FYI Couture
          </div>
        </div>

        <button
          onClick={scrollToTop}
          className="absolute top-10 right-6 md:right-10 bg-secondary-green text-white rounded-full w-12 h-12 flex items-center justify-center hover:opacity-80 transition"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      </div>
    </footer>
  );
}
