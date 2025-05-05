import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

interface CvViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvUrl: string;
  filename: string;
}

export function CvViewerModal({
  isOpen,
  onClose,
  cvUrl,
  filename,
}: CvViewerModalProps) {
  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to download CVs.");
        return;
      }
      const response = await fetch(cvUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to download CV");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert("Error downloading CV. Please try again or contact support.");
      console.error("Error downloading CV:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogTitle>{filename || "CV Viewer"}</DialogTitle>
        <div className="flex justify-between items-center mb-4">
          <span />
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
        <div className="h-full">
          <iframe
            src={cvUrl}
            className="w-full h-full border-0"
            title="CV Viewer"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
