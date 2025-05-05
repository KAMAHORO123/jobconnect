"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  FileText,
  Loader2,
  LogOut,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Building2,
  MapPin,
  Download,
  Eye,
  Users,
  TrendingUp,
  BriefcaseIcon,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";

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
import {
  getEmployerJobs,
  getAllJobApplications,
  updateApplicationStatus,
  getCvUrl,
} from "@/lib/jobs";
import { isAuthenticated, getUserInfo, logout, getAuthToken } from "@/lib/auth";
import type { Job, JobApplication } from "@/lib/jobs";
import { useNotification } from "@/context/NotificationContext";
import { notifications } from "@/data/notifications";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function EmployerDashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        router.push("/login");
        return;
      }

      const info = getUserInfo();
      if (info?.role !== "EMPLOYER") {
        router.push("/");
        return;
      }

      setUserInfo(info);
      await fetchData();
    };

    checkAuth();
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [jobsData, applicationsData] = await Promise.all([
        getEmployerJobs(),
        getAllJobApplications(),
      ]);
      setJobs(jobsData);
      // Attach job object to each application if missing
      const applicationsWithJob = applicationsData
        .map((app) => {
          if (!app.job && app.jobId) {
            const foundJob = jobsData.find((j) => j.id === app.jobId);
            if (foundJob) {
              return { ...app, job: foundJob };
            }
            return null;
          }
          return app;
        })
        .filter(
          (app): app is JobApplication => app !== null && app.job !== undefined
        );
      setApplications(applicationsWithJob);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to load dashboard data");
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Failed to Load Data</p>
          <p className="text-sm">{error.message || "Please try again"}</p>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: number, status: string) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await updateApplicationStatus(applicationId, status);
      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status: status as
                  | "PENDING"
                  | "REVIEWED"
                  | "ACCEPTED"
                  | "REJECTED",
              }
            : app
        )
      );
      toast.success(`Application marked as ${status.toLowerCase()}`);
      if (status === "ACCEPTED") {
        showNotification(
          notifications.find((n) => n.id === "application_submitted")!
        );
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      setError(error.message || "Failed to update application status");
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Failed to Update Status</p>
          <p className="text-sm">{error.message || "Please try again"}</p>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const getApplicationStatusData = () => {
    const statusCounts = {
      PENDING: applications.filter((app) => app.status === "PENDING").length,
      ACCEPTED: applications.filter((app) => app.status === "ACCEPTED").length,
      REJECTED: applications.filter((app) => app.status === "REJECTED").length,
    };

    return {
      labels: ["Pending", "Accepted", "Rejected"],
      datasets: [
        {
          data: [
            statusCounts.PENDING,
            statusCounts.ACCEPTED,
            statusCounts.REJECTED,
          ],
          backgroundColor: ["#FCD34D", "#34D399", "#F87171"],
          borderColor: ["#F59E0B", "#10B981", "#EF4444"],
          borderWidth: 1,
        },
      ],
    };
  };

  const getApplicationTrendData = () => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toLocaleString("default", { month: "short" });
    }).reverse();

    const monthlyApplications = last6Months.map((month) => {
      return applications.filter((app) => {
        const appDate = new Date(app.createdAt);
        return appDate.toLocaleString("default", { month: "short" }) === month;
      }).length;
    });

    return {
      labels: last6Months,
      datasets: [
        {
          label: "Applications",
          data: monthlyApplications,
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const getJobTypeDistribution = () => {
    const jobTypes = jobs.reduce((acc, job) => {
      const type = job.type || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(jobTypes),
      datasets: [
        {
          data: Object.values(jobTypes),
          backgroundColor: [
            "#3B82F6",
            "#10B981",
            "#F59E0B",
            "#EF4444",
            "#8B5CF6",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const handleSendEmail = (application: JobApplication) => {
    if (!application.jobSeekerEmail) {
      toast.error("Job seeker's email not available");
      return;
    }

    const subject = `Regarding your application for ${application.job?.title}`;
    const body = `Dear Applicant,\n\nThank you for your interest in the ${application.job?.title} position at ${application.job?.company}.\n\nBest regards,\n${userInfo?.username}`;

    // Create mailto link
    const mailtoLink = `mailto:${
      application.jobSeekerEmail
    }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open default email client
    window.location.href = mailtoLink;
  };

  const handleViewCV = async (application: JobApplication) => {
    try {
      // Open a blank tab immediately to avoid popup blockers
      const newTab = window.open("", "_blank");
      if (!newTab) {
        toast.error("Popup blocked! Please allow popups for this site.");
        return;
      }
      const response = await fetch(getCvUrl(application.id, true), {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch CV");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      newTab.location.href = url;
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      toast.error("Failed to view CV");
    }
  };

  const handleDownloadCV = async (application: JobApplication) => {
    try {
      const response = await fetch(getCvUrl(application.id, true), {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch CV");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = application.cvFilename || "cv.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Failed to download CV");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => fetchData()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-blue-600">
            <Briefcase className="h-6 w-6" />
            <span className="text-xl">JobConnect</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/employer/dashboard"
              className="text-sm font-medium text-blue-600"
            >
              Dashboard
            </Link>
            <Link
              href="/employer/jobs"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              My Jobs
            </Link>
            <Link
              href="/employer/applications"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Applications
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Employer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back,{" "}
            <span className="font-semibold text-blue-700">
              {userInfo?.username}
            </span>
            ! Manage your job postings and applications.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            {
              title: "Total Jobs",
              value: jobs.length,
              icon: <BriefcaseIcon className="h-4 w-4 text-blue-600" />,
              color: "text-blue-600",
            },
            {
              title: "Total Applications",
              value: applications.length,
              icon: <Users className="h-4 w-4 text-purple-600" />,
              color: "text-purple-600",
            },
            {
              title: "Pending Reviews",
              value: applications.filter((app) => app.status === "PENDING")
                .length,
              icon: <Clock className="h-4 w-4 text-yellow-600" />,
              color: "text-yellow-600",
            },
            {
              title: "Accepted",
              value: applications.filter((app) => app.status === "ACCEPTED")
                .length,
              icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
              color: "text-green-600",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>Distribution of applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Doughnut
                  data={getApplicationStatusData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Application Trend</CardTitle>
              <CardDescription>
                Applications over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Line
                  data={getApplicationTrendData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>
                    View and manage job applications
                  </CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/employer/jobs">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Manage Jobs
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          {application.job ? (
                            <Link
                              href={`/employer/jobs/${application.job.id}`}
                              className="font-medium hover:text-blue-600 hover:underline"
                            >
                              {application.job.title}
                            </Link>
                          ) : (
                            <span className="font-medium text-gray-500">
                              Job not found
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {application.job?.company || "Unknown company"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            application.status === "ACCEPTED"
                              ? "secondary"
                              : application.status === "REJECTED"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {application.createdAt &&
                        !isNaN(new Date(application.createdAt).getTime())
                          ? new Date(application.createdAt).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {application.cvFilename && (
                            <>
                              {/* Remove View CV button for employer dashboard */}
                              {/*
                              {application.cvFilename.toLowerCase().endsWith('.pdf') ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewCV(application)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View CV
                                </Button>
                              ) : (
                                <Button variant="outline" size="sm" disabled>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View CV (PDF only)
                                </Button>
                              )}
                              */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadCV(application)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download CV
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendEmail(application)}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                          </Button>
                          {application.status === "PENDING" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleStatusUpdate(application.id, "ACCEPTED")
                                }
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleStatusUpdate(application.id, "REJECTED")
                                }
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
