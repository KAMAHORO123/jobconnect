"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Building2,
  Briefcase,
  DollarSign,
  Calendar,
  Loader2,
  ArrowRight,
  Filter,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { searchJobs, applyForJob } from "@/lib/jobs";
import { isAuthenticated, getUserInfo, normalizeRole } from "@/lib/auth";
import type { Job } from "@/lib/jobs";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function JobsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isApplying, setIsApplying] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        const info = getUserInfo();
        setUserInfo(info);
      }
      await fetchJobs();
    };

    checkAuth();
  }, []);

  const fetchJobs = async () => {
    try {
      const jobsData = await searchJobs();
      setJobs(jobsData);
    } catch (error: any) {
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Failed to Load Jobs</p>
          <p className="text-sm">
            {error.response?.data?.error || "Please try again"}
          </p>
        </div>
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (jobId: number) => {
    if (!isAuthenticated()) {
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Authentication Required</p>
          <p className="text-sm">Please log in to apply for jobs.</p>
        </div>
      );
      router.push("/login");
      return;
    }

    try {
      setIsApplying(jobId);
      await applyForJob(jobId, new File([], "dummy.pdf"));
      toast.success(
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Application Submitted</p>
          <p className="text-sm">
            Your application has been sent successfully.
          </p>
        </div>
      );
      // Refresh jobs to update application status
      fetchJobs();
    } catch (error: any) {
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Application Failed</p>
          <p className="text-sm">
            {error.response?.data?.error || "Please try again"}
          </p>
        </div>
      );
    } finally {
      setIsApplying(null);
    }
  };

  const handleDashboardClick = () => {
    if (!isAuthenticated()) {
      toast.info("Please sign in to access your dashboard");
      router.push("/login");
      return;
    }

    const userInfo = getUserInfo();
    if (!userInfo) {
      toast.error("User information not found");
      router.push("/login");
      return;
    }

    const role = normalizeRole(userInfo.role);
    if (role === "JOB_SEEKER") {
      router.push("/jobseeker/dashboard");
    } else if (role === "EMPLOYER") {
      router.push("/employer/dashboard");
    } else {
      toast.error("Invalid user role");
      router.push("/login");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation =
      locationFilter === "all" ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesType = typeFilter === "all" || job.type === typeFilter;

    return matchesSearch && matchesLocation && matchesType;
  });

  const locations = Array.from(new Set(jobs.map((job) => job.location)));
  const jobTypes = Array.from(new Set(jobs.map((job) => job.type)));

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              href="/"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
            <Link href="/jobs" className="text-sm font-medium text-blue-600">
              Find Jobs
            </Link>
            <Link
              href="/employers"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              For Employers
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {isAuthenticated() ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDashboardClick}
              >
                <User className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold tracking-tight">
            Find Your Next Opportunity
          </h1>
          <p className="text-muted-foreground mt-2">
            Browse through our curated list of job opportunities
          </p>
        </motion.div>

        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Search Jobs</CardTitle>
              <CardDescription>
                Find the perfect job that matches your skills and interests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by job title, company, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-4">
                  <Select
                    value={locationFilter}
                    onValueChange={setLocationFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="all-locations" value="all">
                        All Locations
                      </SelectItem>
                      {locations.map((location, index) => (
                        <SelectItem
                          key={`${location}-${index}`}
                          value={location}
                        >
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="all-types" value="all">
                        All Types
                      </SelectItem>
                      {jobTypes.map((type, index) => (
                        <SelectItem key={`${type}-${index}`} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredJobs.map((job) => (
            <motion.div key={job.id} variants={fadeIn}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="line-clamp-1">
                        {job.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-1">
                        {job.company}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{job.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <DollarSign className="mr-2 h-4 w-4" />
                      {job.salary}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      Posted{" "}
                      {job.posted
                        ? new Date(job.posted).toLocaleDateString()
                        : ""}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleApply(job.id)}
                      disabled={isApplying === job.id}
                    >
                      {isApplying === job.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        "Apply Now"
                      )}
                    </Button>
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/jobs/${job.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredJobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <h3 className="text-lg font-semibold">No jobs found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search criteria
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
