"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getJob, updateJob } from "@/lib/jobs";
import { isAuthenticated, getUserInfo, normalizeRole } from "@/lib/auth";
import type { Job } from "@/lib/jobs";

export default function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "FULL_TIME",
    description: "",
    requirements: "",
    salary: "",
    status: "ACTIVE",
  });

  const resolvedParams = use(params);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Authentication Required</p>
          <p className="text-sm">Please log in to continue.</p>
        </div>
      );
      router.push("/login");
      return;
    }

    // Check if user is an employer
    const userInfo = getUserInfo();
    if (!userInfo) {
      router.push("/login");
      return;
    }
    const normalizedRole = normalizeRole(userInfo.role);
    if (normalizedRole !== "EMPLOYER") {
      router.push("/login");
      return;
    }

    fetchJob();
  }, [resolvedParams.id, router]);

  const fetchJob = async () => {
    try {
      const job = await getJob(parseInt(resolvedParams.id));
      setFormData({
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        description: job.description,
        requirements: Array.isArray(job.requirements)
          ? job.requirements.join("\n")
          : job.requirements,
        salary: job.salary,
        status: job.status || "ACTIVE",
      });
    } catch (error: any) {
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Failed to Load Job</p>
          <p className="text-sm">
            {error.response?.data?.error || "Please try again"}
          </p>
        </div>
      );
      router.push("/employer/jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check authentication before submitting
    if (!isAuthenticated()) {
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Session Expired</p>
          <p className="text-sm">Please log in again to continue.</p>
        </div>
      );
      router.push("/login");
      return;
    }

    setIsSaving(true);

    try {
      await updateJob(parseInt(resolvedParams.id), formData);
      toast.success(
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Job Updated Successfully!</p>
          <p className="text-sm">Your job listing has been updated.</p>
        </div>
      );
      router.push("/employer/jobs");
    } catch (error: any) {
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Failed to Update Job</p>
          <p className="text-sm">
            {error.response?.data?.error || "Please try again"}
          </p>
        </div>
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <Link
        href="/employer/jobs"
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Job Listing</CardTitle>
          <CardDescription>
            Update the details of your job listing
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="e.g. Tech Corp"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. New York, NY"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Job Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="INTERNSHIP">Internship</SelectItem>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary Range</Label>
              <Input
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="e.g. $80,000 - $100,000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the role and responsibilities..."
                className="min-h-[150px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="List the required skills and qualifications..."
                className="min-h-[150px]"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Update Job
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
