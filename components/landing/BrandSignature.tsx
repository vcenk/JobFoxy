'use client'

import { motion } from 'framer-motion'

export function BrandSignature() {
  return (
    <section className="bg-white py-20 overflow-hidden border-t border-gray-100 relative z-10">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-[15vw] md:text-[18vw] font-black text-[#1a1615] leading-[0.8] tracking-tighter text-center whitespace-nowrap select-none"
        >
          JOB FOXY
        </motion.h2>
      </div>
    </section>
  )
}
