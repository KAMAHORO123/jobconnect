export type NotificationType = "success" | "error" | "info" | "warning";

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

export const notifications: NotificationData[] = [
  {
    id: "application_submitted",
    type: "success",
    title: "Application Submitted",
    message: "Your job application was submitted successfully!",
  },
  {
    id: "application_failed",
    type: "error",
    title: "Submission Failed",
    message: "There was a problem submitting your application.",
  },
  // Add more as needed
]; 