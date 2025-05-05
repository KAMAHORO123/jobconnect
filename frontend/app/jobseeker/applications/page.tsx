"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, FileText, Calendar } from "lucide-react";
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
import { getUserApplications, getCvUrl } from "@/lib/jobs";
import { isAuthenticated, getUserInfo, normalizeRole } from "@/lib/auth";
import type { JobApplication } from "@/lib/jobs";
import { CvViewerModal } from "@/components/CvViewerModal";

export default function JobSeekerApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [selectedCv, setSelectedCv] = useState<{
    url: string;
    filename: string;
  } | null>(null);

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
      await fetchApplications();
    };
    checkAuth();
  }, [router]);

  const fetchApplications = async () => {
    try {
      const data = await getUserApplications();
      setApplications(data);
    } catch (error) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleViewCV = (application: JobApplication) => {
    if (application.cv) {
      setSelectedCv({
        url: getCvUrl(application.id),
        filename: application.cvFilename || "CV.pdf",
      });
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground">
          Here are all the jobs you have applied for.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>
            Track the status of your job applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="mb-4 text-lg font-medium">No applications yet</p>
              <p className="mb-6 text-sm text-muted-foreground">
                Start applying for jobs to see your applications here
              </p>
              <Button asChild>
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
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
                          {application.job?.title || "Job Title Not Available"}
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
                          <Calendar className="h-4 w-4" />
                          <span>
                            Applied on{" "}
                            {new Date(
                              application.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {application.cv && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleViewCV(application)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View CV
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <CvViewerModal
        isOpen={!!selectedCv}
        onClose={() => setSelectedCv(null)}
        cvUrl={selectedCv?.url || ""}
        fileName={selectedCv?.filename || ""}
      />
    </div>
  );
}
