"use client";

export function HowItWorksSection() {
  const steps = [
    { title: "Create a Path", description: "Start with a topic or goal" },
    { title: "Build Structure", description: "Add branches and organize content" },
    { title: "Add Content", description: "Fill with rich, dynamic materials" },
    { title: "Share or Learn", description: "Publish or use for yourself" }
  ];

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
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
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
