"use client";

import { motion, Variants } from "framer-motion";

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    yOffset?: number;
}

export default function ScrollReveal({
    children,
    className,
    delay = 0,
    yOffset = 50,
}: ScrollRevealProps) {
    const variants: Variants = {
        hidden: { opacity: 0, y: yOffset },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                delay: delay / 1000,
                ease: [0.25, 0.1, 0.25, 1],
            },
        },
    };

    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="visible"
            variants={variants}
            viewport={{ once: true, amount: 0.2 }}
        >
            {children}
        </motion.div>
    );
}
