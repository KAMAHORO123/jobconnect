import Link from "next/link";
import { ArrowRight, Briefcase, Building, Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-blue-600">
            <Briefcase className="h-6 w-6" />
            <span className="text-xl">JobConnect</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/jobs"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Find Jobs
            </Link>
            <Link
              href="/register?role=employer"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              For Employers
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              About Us
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="h-9 px-4">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="h-9 px-4 bg-blue-600 hover:bg-blue-700">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-blue-900">
                    Find Your Dream Job Today
                  </h1>
                  <p className="max-w-[600px] text-gray-600 md:text-xl">
                    Connect with top employers and discover opportunities that
                    match your skills and aspirations.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/jobs">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Browse Jobs
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline">Create Account</Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[500px] aspect-video overflow-hidden rounded-xl bg-white p-6 shadow-lg animate-fade-in">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-white/50 backdrop-blur-sm"></div>
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Search className="h-5 w-5" />
                      <span className="font-medium">Job Search</span>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-lg border p-3 bg-white animate-slide-up"
                          style={{ animationDelay: `${i * 150}ms` }}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <Building className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="font-medium">Software Engineer</p>
                            <p className="text-sm text-gray-500">
                              TechCorp • Remote
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-blue-900">
                  How It Works
                </h2>
                <p className="max-w-[700px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform makes it easy to find the perfect job or the
                  perfect candidate.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              {[
                {
                  icon: <Users className="h-10 w-10 text-blue-600" />,
                  title: "Create an Account",
                  description:
                    "Sign up as a job seeker or employer to get started on your journey.",
                },
                {
                  icon: <Search className="h-10 w-10 text-blue-600" />,
                  title: "Find Opportunities",
                  description:
                    "Browse through thousands of job listings or post your own job openings.",
                },
                {
                  icon: <Briefcase className="h-10 w-10 text-blue-600" />,
                  title: "Apply or Hire",
                  description:
                    "Apply for jobs with a single click or review applications from candidates.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md animate-fade-in"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-blue-900">
                    {item.title}
                  </h3>
                  <p className="text-center text-gray-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-blue-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-blue-900">
                  Join Thousands of Satisfied Users
                </h2>
                <p className="max-w-[700px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform has helped thousands of job seekers find their
                  dream jobs and employers find the perfect candidates.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-white py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-bold text-blue-600">
            <Briefcase className="h-5 w-5" />
            <span>JobConnect</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2024 JobConnect. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
