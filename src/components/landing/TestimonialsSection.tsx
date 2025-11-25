"use client";

import { TestimonialCard } from "@/components/TestimonialCard";
import { Sparkles } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "PrepX has completely transformed how I structure my university courses. The branching paths make complex topics so much easier to explain.",
      name: "Dr. Sarah Chen",
      role: "Computer Science Professor"
    },
    {
      quote: "Finally, a tool that lets me organize my self-learning journey. I can map out exactly what I need to learn and track my progress.",
      name: "Marcus Johnson",
      role: "Self-Taught Developer"
    },
    {
      quote: "The AI assistance is a game-changer. It helps me brainstorm curriculum ideas and fills in the gaps when I'm stuck.",
      name: "Emily Rodriguez",
      role: "Corporate Trainer"
    },
    {
      quote: "I use PrepX to onboard new employees. It's intuitive, fast, and the visual structure helps them understand our processes quickly.",
      name: "David Kim",
      role: "HR Manager"
    },
    {
      quote: "As a student, having a visual roadmap of my subjects helps me stay on track and not get overwhelmed by the workload.",
      name: "Lisa Patel",
      role: "Medical Student"
    },
    {
      quote: "The ability to share paths with my study group has made collaboration so much more effective. Highly recommended!",
      name: "James Wilson",
      role: "Graduate Student"
    }
  ];

  const firstRow = testimonials.slice(0, 3);
  const secondRow = testimonials.slice(3, 6);

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 overflow-hidden">
      {/* Side fade gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      
      <div className="text-center mb-16">
        <div className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600">
          <Sparkles className="h-4 w-4" />
          Testimonials
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
          Loved by Learners & Educators
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Join thousands of users who are already learning smarter with PrepX
        </p>
      </div>
      
      <div className="flex flex-col gap-8">
        {/* First Row - Scrolls Left */}
        <div className="flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
          <div className="flex min-w-full shrink-0 animate-scroll-left gap-6 py-4 hover:[animation-play-state:paused]">
            {[...firstRow, ...firstRow, ...firstRow, ...firstRow].map((testimonial, i) => (
              <div key={i} className="w-[350px] shrink-0">
                <TestimonialCard
                  quote={testimonial.quote}
                  name={testimonial.name}
                  role={testimonial.role}
                  index={i}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Second Row - Scrolls Right */}
        <div className="flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
          <div className="flex min-w-full shrink-0 animate-scroll-right gap-6 py-4 hover:[animation-play-state:paused]">
            {[...secondRow, ...secondRow, ...secondRow, ...secondRow].map((testimonial, i) => (
              <div key={i} className="w-[350px] shrink-0">
                <TestimonialCard
                  quote={testimonial.quote}
                  name={testimonial.name}
                  role={testimonial.role}
                  index={i}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
