"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  MapPin,
  Star,
  CheckCircle2,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getJob, applyForJob, hasAppliedForJob } from "@/lib/jobs";
import { isAuthenticated, getUserInfo, normalizeRole } from "@/lib/auth";
import type { Job } from "@/lib/jobs";

export default function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const resolvedParams = use(params);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        router.push("/login");
        return;
      }

      const info = getUserInfo();
      if (!info) {
        router.push("/login");
        return;
      }
      const normalizedRole = normalizeRole(info.role);
      if (normalizedRole !== "JOB_SEEKER") {
        router.push("/");
        return;
      }

      setUserInfo(info);
      await fetchJobDetails();
    };

    checkAuth();
  }, [router, resolvedParams.id]);

  const fetchJobDetails = async () => {
    try {
      const jobId = parseInt(resolvedParams.id);
      const jobData = await getJob(jobId);
      setJob(jobData);

      // Check if user has already applied
      if (isAuthenticated()) {
        const applied = await hasAppliedForJob(jobId);
        setHasApplied(applied);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!cvFile) {
      toast.error("Please upload your CV before applying.");
      return;
    }
    setApplying(true);
    try {
      await applyForJob(resolvedParams.id, cvFile, coverLetter);
      toast.success("Application submitted successfully!");
      setShowApplyForm(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to apply for job.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Job Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/jobs">Browse Jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <p className="text-muted-foreground">{job.company}</p>
          </div>
        </div>
        <Badge variant="secondary">{job.type}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>{job.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>{job.requirements}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Posted{" "}
                    {job.posted
                      ? new Date(job.posted).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {!showApplyForm && !hasApplied && (
            <Button onClick={() => setShowApplyForm(true)}>Apply Now</Button>
          )}

          {hasApplied && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">
                  You have already applied for this job
                </span>
              </div>
            </div>
          )}

          {showApplyForm && !hasApplied && (
            <Card>
              <CardHeader>
                <CardTitle>Apply for this Job</CardTitle>
                <CardDescription>
                  Upload your CV to apply for this position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mt-6 space-y-4">
                  <label htmlFor="cv-upload" className="block font-medium">
                    Upload CV (PDF, DOC, DOCX)
                  </label>
                  <input
                    id="cv-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    title="Upload your CV"
                    className="mt-1"
                  />
                  <label
                    htmlFor="cover-letter"
                    className="block font-medium mt-4"
                  >
                    Cover Letter (optional)
                  </label>
                  <textarea
                    id="cover-letter"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={4}
                    className="w-full border rounded p-2 mt-1"
                    placeholder="Write a brief cover letter (optional)"
                  />
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleApply} disabled={applying}>
                      {applying ? "Applying..." : "Submit Application"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowApplyForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
