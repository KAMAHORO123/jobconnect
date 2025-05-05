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
  DollarSign,
  TrendingUp,
  Users,
  ArrowLeft,
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
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

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
import { getUserApplications, getCvUrl } from "@/lib/jobs";
import {
  isAuthenticated,
  getUserInfo,
  logout,
  normalizeRole,
} from "@/lib/auth";
import type { JobApplication } from "@/lib/jobs";
import { useNotification } from "@/context/NotificationContext";
import { notifications } from "@/data/notifications";
import { CvViewerModal } from "@/components/CvViewerModal";

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
  ArcElement
);

export default function JobSeekerDashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const { showNotification } = useNotification();
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
      const sortedApplications = data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setApplications(sortedApplications);
      showNotification(
        notifications.find((n) => n.id === "application_submitted")!
      );
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      if (error.message === "No authentication token found") {
        toast.error(
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Authentication Required</p>
            <p className="text-sm">Please sign in to view your applications</p>
          </div>
        );
        router.push("/login");
        return;
      }
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Failed to Load Applications</p>
          <p className="text-sm">
            {error.response?.data?.error || "Please try again"}
          </p>
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
    const jobTypes = applications.reduce((acc, app) => {
      const type = app.job?.type || "Unknown";
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

  const handleViewCV = (application: JobApplication) => {
    if (!application.cvFilename) {
      toast.error("No CV available for this application");
      return;
    }
    const cvUrl = getCvUrl(application.id, false);
    setSelectedCv({ url: cvUrl, filename: application.cvFilename });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
              href="/jobseeker/dashboard"
              className="text-sm font-medium text-blue-600"
            >
              Dashboard
            </Link>
            <Link
              href="/jobs"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Find Jobs
            </Link>
            <Link
              href="/jobseeker/applications"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              My Applications
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
        <div className="mb-6 flex items-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            JobSeeker Dashboard
          </h1>
        </div>

        <div className="mb-8">
          <p className="text-muted-foreground">
            Welcome back,{" "}
            <span className="font-semibold text-blue-700">
              {userInfo?.username}
            </span>
            ! Here's an overview of your job applications.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            {
              title: "Total Applications",
              value: applications.length,
              icon: <Users className="h-4 w-4 text-blue-600" />,
              color: "text-blue-600",
            },
            {
              title: "Pending",
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
            {
              title: "Rejected",
              value: applications.filter((app) => app.status === "REJECTED")
                .length,
              icon: <XCircle className="h-4 w-4 text-red-600" />,
              color: "text-red-600",
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
              <CardDescription>
                Distribution of your applications
              </CardDescription>
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
                    Your latest job applications
                  </CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/jobs">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Find More Jobs
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="mb-4 text-lg font-medium">
                    No applications yet
                  </p>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Start applying for jobs to see your applications here
                  </p>
                  <Button asChild>
                    <Link href="/jobs">
                      Browse Jobs
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.slice(0, 5).map((application) => (
                    <motion.div
                      key={application.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border bg-white p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {application.job?.title || "N/A"}
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
                          {application.job && (
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                <span>{application.job?.company || "N/A"}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{application.job.location}</span>
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
                            </div>
                          )}
                        </div>
                        {application.cvFilename && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCV(application)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
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
        </motion.div>
      </main>

      {selectedCv && (
        <CvViewerModal
          isOpen={!!selectedCv}
          onClose={() => setSelectedCv(null)}
          cvUrl={selectedCv.url}
          filename={selectedCv.filename}
        />
      )}
    </div>
  );
}
