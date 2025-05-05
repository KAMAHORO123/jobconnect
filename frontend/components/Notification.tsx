"use client";
import { useNotification } from "@/context/NotificationContext";
import { useEffect } from "react";

export function Notification() {
  const { notification, hideNotification } = useNotification();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [notification, hideNotification]);

  if (!notification) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded shadow-lg bg-white border-l-4
      ${notification.type === "success" ? "border-green-500" : ""}
      ${notification.type === "error" ? "border-red-500" : ""}
      ${notification.type === "info" ? "border-blue-500" : ""}
      ${notification.type === "warning" ? "border-yellow-500" : ""}
    `}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="font-bold">{notification.title}</div>
          <div>{notification.message}</div>
        </div>
        <button
          onClick={hideNotification}
          className="ml-4 text-gray-400 hover:text-black"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
