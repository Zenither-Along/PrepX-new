import Link from "next/link";
import { ArrowLeft, Users, ClipboardList, BarChart3, MessageCircle, Calendar, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Classrooms | PrepX",
  description: "Powerful classroom management features for educators. Create virtual classrooms, assign learning paths, track student progress, and foster collaborative learning.",
};

export default function ClassroomsPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo width={140} height={48} />
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">For Educators</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful Classroom Management
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              Create, manage, and scale your teaching with virtual classrooms. Track student progress, assign learning paths, and foster collaborative learning—all in one platform.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Virtual Classrooms */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Virtual Classrooms
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Set up a class in 60 seconds. Click "Create Classroom", name it (e.g., "Biology 101 - Spring 2024"), get a join code (like "ABC123"), and share it with students. They enter the code, click join, and they're in. No email lists, no complicated setup—just instant classroom access.
              </p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Six-character join codes students can type anywhere—email, text, or LMS</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Organize classes by semester, subject, or grade level with custom names</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>See total student count and enrolled members per class</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Students and teachers have separate, role-specific views</span>
                </li>
              </ul>
            </div>

            {/* Assignments System */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Assignment Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Pick any learning path you've created, set a deadline, and assign it to your entire class with one click. Students see it instantly in their assignments tab with a countdown timer showing days remaining. Track who's started, who's finished, and who needs a reminder.
              </p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Assign any learning path to your whole class</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Set custom deadlines—students see countdown timers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Track completion status: Not Started, In Progress, Completed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>View all assignments and their status from your teacher dashboard</span>
                </li>
              </ul>
            </div>

            {/* Progress Tracking */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Student Progress Monitoring
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Open your classroom dashboard and see every student's assignment progress in one place. Check completion percentages, see who's actively working, and identify who might need help—all in real-time without juggling multiple spreadsheets.
              </p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Live dashboard showing each student's assignment status</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Track overall completion rates per assignment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>See individual student progress and completion dates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Monitor class-wide engagement and participation</span>
                </li>
              </ul>
            </div>

            {/* Collaborative Learning */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Shared Learning Paths
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Share your learning paths with the class so everyone has access to the same materials. Students can browse the Explore page to find community-created paths and add useful ones to their own library. Build a collaborative learning environment where quality content is easily discoverable.
              </p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Make your paths public so students can find and use them</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Students browse the Explore page for community content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Everyone can contribute their own learning paths to the community</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Build a knowledge base of high-quality learning materials</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Perfect for Every Educational Setting
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <Calendar className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Schools & Universities
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Manage multiple courses, track hundreds of students, and integrate with existing curriculums seamlessly.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <Award className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Training Programs
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Deliver professional development, onboard new employees, and track certification progress efficiently.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <Users className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Tutoring & Coaching
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Provide personalized attention, track individual progress, and scale your tutoring business effectively.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-linear-to-br from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 text-center border border-primary/20">
            <Users className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Start Teaching Smarter Today
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join educators worldwide who are transforming their teaching with PrepX's powerful classroom tools. Create your first classroom in minutes.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="gap-2">
                  <Users className="h-5 w-5" />
                  Get Started Free
                </Button>
              </Link>
              <Link href="/blog">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
