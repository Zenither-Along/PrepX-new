"use client";

export function HowItWorksSection() {
  const steps = [
    { title: "Create or Generate", description: "Start from scratch or use AI to generate a complete path" },
    { title: "Customize & Build", description: "Add branches, content, quizzes, and rich media" },
    { title: "Share & Assign", description: "Publish publicly or assign to your classroom" },
    { title: "Track & Learn", description: "Monitor progress, complete assignments, and achieve goals" }
  ];

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Get started in minutes
          </p>
        </div>
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-0 top-1/2 hidden h-0.5 w-full -translate-y-1/2 bg-gray-100 lg:block" />
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative bg-white p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white shadow-lg ring-4 ring-white">
                  {index + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
