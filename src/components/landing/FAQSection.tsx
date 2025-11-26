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
      answer: "PrepX operates on a Freemium model. You can create and explore paths for free. Premium features like unlimited AI generation, advanced quizzes, and the AI Study Buddy will be available with a subscription."
    },
    {
      question: "What AI features are available?",
      answer: "Currently, you can use the AI Path Generator to instantly create structured courses. We are actively developing an AI Quiz Generator and an interactive AI Study Buddy to personalize your learning even further."
    },
    {
      question: "Can I keep my learning paths private?",
      answer: "Yes! You can choose to keep your paths private or publish them to the community. Collaboration features for teams are also on our roadmap."
    },
    {
      question: "What's coming next for PrepX?",
      answer: "We are building a complete AI-powered learning ecosystem. Upcoming features include gamified quizzes, spaced repetition, a mobile app, and real-time collaboration tools."
    },
    {
      question: "What kind of content can I add?",
      answer: "You can add text, images, videos, code snippets, links, and more to your learning nodes. We support Markdown for rich text formatting."
    },
    {
      question: "Is there a mobile app?",
      answer: "PrepX is fully responsive for mobile browsers. A dedicated mobile app is planned for the future to provide an even better on-the-go learning experience."
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
