"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function FeedbackPage() {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: user?.fullName || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    type: "general",
    subject: "",
    message: "",
    rating: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          user_id: user?.id || null,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
          type: "general",
          subject: "",
          message: "",
          rating: 0,
        });
      } else {
        alert("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo width={140} height={48} forceTheme="light" textColor="text-gray-900" />
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-6 py-12">
        {submitted ? (
          <div className="text-center py-12">
            <div className="mb-6 inline-flex p-4 bg-green-100 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
            <p className="text-lg text-gray-600 mb-8">
              Your feedback has been submitted successfully. We appreciate you taking the time to help us improve PrepX.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setSubmitted(false)} variant="outline">
                Submit Another
              </Button>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Share Your Feedback</h1>
              <p className="text-lg text-gray-600">
                We'd love to hear your thoughts, suggestions, or report any issues you've encountered.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Email */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white"
                    required
                  />
                </div>
              </div>

              {/* Feedback Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-900 mb-2">
                  Feedback Type
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="general">General Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="improvement">Improvement Suggestion</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-900 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your feedback"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white placeholder:text-gray-500"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us more about your feedback..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-900 bg-white placeholder:text-gray-500"
                  required
                />
              </div>

              {/* Rating (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Overall Experience (Optional)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`text-2xl transition-colors ${
                        star <= formData.rating ? "text-yellow-400" : "text-gray-300"
                      } hover:text-yellow-400`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Feedback"
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} PrepX. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/terms" className="text-gray-600 hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
