"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  User,
  Calendar,
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
import { getAllJobApplications, updateApplicationStatus } from "@/lib/jobs";
import { isAuthenticated, getUserInfo, normalizeRole } from "@/lib/auth";
import type { JobApplication } from "@/lib/jobs";

export default function EmployerApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);

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
      if (normalizedRole !== "EMPLOYER") {
        router.push("/login");
        return;
      }

      setUserInfo(info);
      await fetchApplications();
    };

    checkAuth();
  }, [router]);

  const fetchApplications = async () => {
    try {
      const data = await getAllJobApplications();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: number, status: string) => {
    try {
      await updateApplicationStatus(applicationId, status);
      toast.success(`Application marked as ${status.toLowerCase()}`);
      await fetchApplications(); // Refresh the list
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("Failed to update application status");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>
            Review and manage applications for your job postings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="mb-4 text-lg font-medium">No applications yet</p>
              <p className="mb-6 text-sm text-muted-foreground">
                Applications will appear here when candidates apply to your jobs
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((application) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          {application.job.title}
                        </h3>
                        <Badge
                          variant={
                            application.status === "ACCEPTED"
                              ? "default"
                              : application.status === "REJECTED"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {application.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>
                            {application.jobSeekerEmail ||
                              "Email not available"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Applied on{" "}
                            {new Date(
                              application.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          asChild
                          disabled={!application.jobSeekerEmail}
                          title={
                            application.jobSeekerEmail
                              ? "Send Email"
                              : "Email not available"
                          }
                        >
                          <a
                            href={
                              application.jobSeekerEmail
                                ? `mailto:${
                                    application.jobSeekerEmail
                                  }?subject=Regarding your application for ${encodeURIComponent(
                                    application.job.title
                                  )}&body=Dear Applicant,%0D%0A%0D%0AThank you for your interest in the ${encodeURIComponent(
                                    application.job.title
                                  )} position at ${encodeURIComponent(
                                    application.job.company
                                  )}.%0D%0A%0D%0ABest regards,%0D%0A${
                                    userInfo?.username
                                  }`
                                : undefined
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            tabIndex={application.jobSeekerEmail ? 0 : -1}
                            aria-disabled={!application.jobSeekerEmail}
                          >
                            Email
                          </a>
                        </Button>
                      </div>
                    </div>
                    {application.status === "PENDING" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() =>
                            handleStatusUpdate(application.id, "ACCEPTED")
                          }
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() =>
                            handleStatusUpdate(application.id, "REJECTED")
                          }
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Job Details</h4>
                      <p className="text-sm text-muted-foreground">
                        {application.job.company} • {application.job.location}
                      </p>
                    </div>
                    {application.cv && (
                      <div>
                        <h4 className="font-medium">CV</h4>
                        <Button variant="link" size="sm" asChild>
                          <Link href={application.cv} target="_blank">
                            <FileText className="mr-2 h-4 w-4" />
                            View CV
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
