'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { FileText, Search, Mic, Zap, BarChart3, ArrowRight, BrainCircuit, Sparkles, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'

// --- MAIN DATA ---

const FEATURES = [
  {
    id: 0,
    title: "Gap Analysis",
    subtitle: "Resume Intelligence",
    description: "Don't guess. See exactly what's missing in your resume vs the job description.",
    details: [
      { label: "Missing Skills", value: "React, AWS" },
      { label: "Score Impact", value: "-15 pts" },
      { label: "Fix Difficulty", value: "Easy" },
    ],
    themeColor: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: Search,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" // Data analysis/charts
  },
  {
    id: 1,
    title: "ATS Match",
    subtitle: "System Optimization",
    description: "Pass the robot gatekeepers with optimized keywords and formatting.",
    details: [
      { label: "Parse Rate", value: "98%" },
      { label: "Keyword Match", value: "High" },
      { label: "Formatting", value: "Clean" },
    ],
    themeColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
    icon: CheckCircle2,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800" // Typing/Checklist
  },
  {
    id: 4,
    title: "Resume Builder",
    subtitle: "ATS Friendly",
    description: "Build professional, parsable resumes in minutes with proven templates.",
    details: [
      { label: "Templates", value: "Proven" },
      { label: "Export", value: "PDF/DOCX" },
      { label: "Layout", value: "Auto" },
    ],
    themeColor: "text-pink-600",
    bgColor: "bg-pink-50",
    icon: FileText,
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800" // Documents/Writing
  },
  {
    id: 7,
    title: "Voice Coach",
    subtitle: "Live Feedback",
    description: "Perfect your delivery, tone, pacing, and confidence in real-time.",
    details: [
      { label: "Clarity", value: "95%" },
      { label: "Pacing", value: "Good" },
      { label: "Fillers", value: "Detected" },
    ],
    themeColor: "text-rose-600",
    bgColor: "bg-rose-50",
    icon: Mic,
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800" // Microphone
  },
  {
    id: 3,
    title: "STAR Practice",
    subtitle: "Story Builder",
    description: "Structure behavioral answers (Situation, Task, Action, Result) that sell.",
    details: [
      { label: "Situation", value: "Clear" },
      { label: "Task/Action", value: "Strong" },
      { label: "Result", value: "+20% ROI" },
    ],
    themeColor: "text-orange-600",
    bgColor: "bg-orange-50",
    icon: Zap,
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800" // Interview setting
  },
  {
    id: 5,
    title: "Job Description",
    subtitle: "Smart Breakdown",
    description: "Decode exactly what hiring managers are looking for in any job post.",
    details: [
      { label: "Core Focus", value: "Leadership" },
      { label: "Hidden Reqs", value: "Agile" },
      { label: "Culture Fit", value: "High" },
    ],
    themeColor: "text-cyan-600",
    bgColor: "bg-cyan-50",
    icon: BrainCircuit,
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800" // Tech/Connections
  },
  {
    id: 6,
    title: "Smart Insights",
    subtitle: "Actionable Feedback",
    description: "Specific advice on what to fix. No generic 'good job' scores.",
    details: [
      { label: "Action", value: "Identified" },
      { label: "Result", value: "Metrics needed" },
      { label: "Structure", value: "STAR" },
    ],
    themeColor: "text-violet-600",
    bgColor: "bg-violet-50",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" // Dashboard/Analytics
  },
  {
    id: 2,
    title: "SWOT Analysis",
    subtitle: "Strategic Insight",
    description: "Know your internal strengths and external threats before the interview.",
    details: [
      { label: "Strength", value: "Leadership" },
      { label: "Weakness", value: "Tenure" },
      { label: "Opportunity", value: "Remote" },
    ],
    themeColor: "text-indigo-600",
    bgColor: "bg-indigo-50",
    icon: BarChart3,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800" // Strategy/Chess
  },
]

export function Features() {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const [sliderWidth, setSliderWidth] = useState(0)
  const [trackWidth, setTrackWidth] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // 1. Measure track width
  useEffect(() => {
    const updateWidths = () => {
      if (ref.current) {
        setSliderWidth(ref.current.offsetWidth)
        setTrackWidth(ref.current.scrollWidth)
      }
    }
    
    updateWidths()
    window.addEventListener('resize', updateWidths)
    // Small delay to ensure images loaded/layout settled
    setTimeout(updateWidths, 500) 
    return () => window.removeEventListener('resize', updateWidths)
  }, [])

  // 2. Movement Logic
  const CARD_WIDTH = 700 // Updated for more compact card width
  
  const slideLeft = () => {
    const current = x.get()
    const newX = Math.min(current + CARD_WIDTH, 0)
    animate(x, newX, { type: "spring", stiffness: 300, damping: 30 })
  }

  const slideRight = () => {
    const current = x.get()
    // If we're at the end, loop back to start (optional) or just stop
    // Let's loop back for continuous auto-play feel
    const maxScroll = -(trackWidth - sliderWidth)
    
    if (current <= maxScroll + 10) { // Tolerance
       animate(x, 0, { type: "spring", stiffness: 200, damping: 30 }) // Reset to start
    } else {
       const newX = Math.max(current - CARD_WIDTH, maxScroll)
       animate(x, newX, { type: "spring", stiffness: 300, damping: 30 })
    }
  }

  // 3. Auto-Play Interval
  useEffect(() => {
    if (isPaused || trackWidth === 0) return

    const interval = setInterval(() => {
      slideRight()
    }, 4500)

    return () => clearInterval(interval)
  }, [isPaused, trackWidth, sliderWidth]) // Dependencies matter here

  return (
    <section id="features" className="py-20 bg-[#fafafa] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 max-w-6xl mx-auto">
          <div className="max-w-xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block mb-3"
            >
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-100">
                Powerful Features
              </span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold text-[#1a1615] tracking-tight mb-3"
            >
              Everything you need to succeed.
            </motion.h2>
            <p className="text-gray-500 text-base">
              Swipe to explore the complete toolkit tailored for modern job seekers.
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-2 hidden md:flex">
             <button onClick={slideLeft} className="p-2.5 rounded-full border border-gray-200 hover:bg-white hover:shadow-md transition-all">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
             </button>
             <button onClick={slideRight} className="p-2.5 rounded-full border border-gray-200 hover:bg-white hover:shadow-md transition-all">
                <ChevronRight className="w-4 h-4 text-gray-600" />
             </button>
          </div>
        </div>

        {/* --- SLIDING CARDS TRACK --- */}
        <div 
           ref={ref} 
           className="cursor-grab active:cursor-grabbing overflow-hidden -mx-4 px-4 py-4"
           onMouseEnter={() => setIsPaused(true)}
           onMouseLeave={() => setIsPaused(false)}
           onTouchStart={() => setIsPaused(true)}
        >
          <motion.div 
            drag="x"
            dragConstraints={{ right: 0, left: -(trackWidth - sliderWidth) }}
            style={{ x }}
            className="flex gap-6 w-max pl-4 md:pl-0"
          >
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={feature.id}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="w-[85vw] md:w-[600px] lg:w-[700px] flex-shrink-0"
              >
                <div className="h-full bg-white rounded-[40px] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row group">
                   
                   {/* LEFT: CONTENT (45%) */}
                   <div className="p-7 md:p-8 flex flex-col justify-center w-full md:w-[45%] border-b md:border-b-0 md:border-r border-gray-50 bg-white z-10">
                        <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-5`}>
                            <feature.icon className={`w-6 h-6 ${feature.themeColor}`} />
                        </div>

                        <h3 className="text-2xl font-bold text-[#1a1615] mb-1">{feature.title}</h3>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${feature.themeColor}`}>
                            {feature.subtitle}
                        </p>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            {feature.description}
                        </p>

                        <div className="space-y-2 mb-6">
                            {feature.details.map((d, i) => (
                                <div key={i} className="flex justify-between items-center text-[13px] border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                    <span className="text-gray-400 font-medium">{d.label}</span>
                                    <span className="text-gray-900 font-bold">{d.value}</span>
                                </div>
                            ))}
                        </div>

                        <button className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all hover:gap-3 ${feature.bgColor} ${feature.themeColor}`}>
                            Explore <ArrowRight className="w-4 h-4" />
                        </button>
                   </div>


                   {/* RIGHT: REAL IMAGE (55%) */}
                   <div className="w-full md:w-[55%] relative overflow-hidden h-[240px] md:h-auto">
                       {/* Overlay Gradient for Text readability if needed, or style */}
                       <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/5 z-10" />
                       
                       <img 
                          src={feature.image} 
                          alt={feature.title}
                          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                       />
                   </div>

                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  )
}