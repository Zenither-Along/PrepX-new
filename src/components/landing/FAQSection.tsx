"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  const faqs = [
    {
      question: "Is PrepX free to use?",
      answer: "Yes! PrepX is completely free to use. Create unlimited learning paths, use AI generation, manage classrooms, and access all core features at no cost."
    },
    {
      question: "What makes PrepX different?",
      answer: "PrepX combines branching learning paths, AI-powered generation, classroom management, and progress tracking in one platform. It's designed for both individual learners and educators managing entire classrooms."
    },
    {
      question: "Can I use PrepX as a teacher?",
      answer: "Absolutely! Create classrooms, assign learning paths to students, track their progress, manage submissions, and view analytics—all in one place."
    },
    {
      question: "How does the AI path generator work?",
      answer: "Simply describe what you want to learn, choose your preferences (modules, depth, audience level), and our AI instantly creates a complete structured learning path with branches, topics, and content sections."
    },
    {
      question: "Can I keep my paths private?",
      answer: "Yes! You have full control. Keep paths private for personal use, share them publicly in the explore page, or assign them directly to your classroom students."
    },
    {
      question: "Is there a mobile app?",
      answer: "PrepX is fully responsive and works great on mobile browsers. The entire platform is optimized for both desktop and mobile experiences."
    }
  ];

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-gray-600">
          Everything you need to know about PrepX
        </p>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-gray-700">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-gray-600">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
