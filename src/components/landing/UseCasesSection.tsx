"use client";

import { GraduationCap, Users, Briefcase, BookOpen } from "lucide-react";

export function UseCasesSection() {
  const useCases = [
    {
      icon: GraduationCap,
      title: "Students & Learners",
      description: "Organize study materials, create revision guides, and track your learning progress",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Teachers & Professors",
      description: "Design comprehensive courses, create lesson plans, and share knowledge effortlessly",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Briefcase,
      title: "Institutions & Tutors",
      description: "Build custom curricula, manage course content, and update materials in real-time",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: BookOpen,
      title: "Everyone Else",
      description: "Organize projects, plan events, structure ideas - anything that needs structure",
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Who is PrepX for?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Whether you're teaching, learning, or just organizing ideas
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className={`mb-4 inline-flex rounded-lg bg-gradient-to-br ${useCase.color} p-3 text-white`}>
                <useCase.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{useCase.title}</h3>
              <p className="text-muted-foreground">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
