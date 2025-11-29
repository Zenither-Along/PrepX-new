"use client";

import { GraduationCap, Users, Briefcase, BookOpen } from "lucide-react";

export function UseCasesSection() {
  const useCases = [
    {
      icon: GraduationCap,
      title: "Students & Learners",
      description: "Organize study materials, track assignment progress, use AI chat for help, and follow custom learning paths tailored to your goals",
      color: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Educators & Teachers",
      description: "Design courses, create classrooms, assign paths to students, track completion rates, and manage all your teaching in one place",
      color: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-500"
    },
    {
      icon: Briefcase,
      title: "Institutions & Tutors",
      description: "Build comprehensive curricula, manage multiple classrooms, analyze student analytics, and scale your educational offerings",
      color: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      iconBg: "bg-gradient-to-br from-orange-500 to-red-500"
    },
    {
      icon: BookOpen,
      title: "Content Creators",
      description: "Share your expertise with the world, build a library of public paths, and help learners discover your curated content",
      color: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-500"
    }
  ];

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-3">
            Who is PrepX for?
          </h2>
          <p className="text-lg text-gray-600">
            Whether you're teaching, learning, or just organizing ideas
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 shadow-sm"
            >
              {/* Icon */}
              <div className={`mb-4 inline-flex rounded-xl ${useCase.iconBg} p-3 text-white shadow-md`}>
                <useCase.icon className="h-6 w-6" />
              </div>
              
              {/* Title */}
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                {useCase.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
