"use client";

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  index: number;
}

export function TestimonialCard({ quote, name, role, index }: TestimonialCardProps) {
  return (
    <div
      className="rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-md transition-all duration-300 ease-out h-full"
    >
      <p className="text-sm text-gray-900 mb-6 leading-relaxed">
        &quot;{quote}&quot;
      </p>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold text-sm">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div className="font-semibold text-sm">{name}</div>
          <div className="text-xs text-gray-600">{role}</div>
        </div>
      </div>
    </div>
  );
}
