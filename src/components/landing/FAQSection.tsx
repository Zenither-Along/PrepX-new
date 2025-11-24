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
      answer: "Yes! PrepX is completely free for individuals. You can create unlimited public paths and access all core features without paying a dime."
    },
    {
      question: "Can I keep my learning paths private?",
      answer: "Currently, all paths are public to foster a community of shared knowledge. We are working on private path features for a future update."
    },
    {
      question: "How does the AI assistance work?",
      answer: "Our AI helps you structure your content, suggests topics to cover, and can even help generate quizzes and summaries for your learning nodes."
    },
    {
      question: "Can I collaborate with others?",
      answer: "Yes, you can share your paths with anyone. We are actively building real-time collaboration features to let teams work on paths together."
    },
    {
      question: "What kind of content can I add?",
      answer: "You can add text, images, videos, code snippets, links, and more to your learning nodes. We support Markdown for rich text formatting."
    },
    {
      question: "Is there a mobile app?",
      answer: "PrepX is a fully responsive web application that works great on mobile devices, tablets, and desktops. A dedicated mobile app is on our roadmap."
    }
  ];

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-muted-foreground">
          Everything you need to know about PrepX
        </p>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
