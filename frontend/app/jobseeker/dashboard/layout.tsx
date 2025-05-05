"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserInfo, isAuthenticated, normalizeRole } from "@/lib/auth";
import { toast } from "sonner";

export default function JobSeekerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isAuthenticated()) {
          toast.error("Please login to access the dashboard");
          router.push("/login");
          return;
        }

        const userInfo = getUserInfo();
        if (!userInfo) {
          toast.error("User information not found");
          router.push("/login");
          return;
        }

        const normalizedRole = normalizeRole(userInfo.role);
        console.log("JobSeeker Dashboard - User role:", normalizedRole); // Debug log

        if (normalizedRole !== "JOB_SEEKER") {
          toast.error("Access denied. This dashboard is for job seekers only.");
          router.push("/employer/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error in jobseeker dashboard auth check:", error);
        toast.error("An error occurred while checking authentication");
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  return <>{children}</>;
}
