"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Bell,
  Briefcase,
  Building,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  FileText,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

// Mock data for applications
const applications = [
  {
    id: 1,
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp",
    location: "Remote",
    appliedDate: "May 10, 2024",
    status: "Interview",
    statusColor: "blue",
    nextStep: "Technical Interview on May 15, 2024",
    progress: 60,
    logo: "/placeholder.svg?height=40&width=40",
    description: "We are looking for an experienced Frontend Developer to join our team.",
    timeline: [
      { date: "May 10, 2024", event: "Application submitted", completed: true },
      { date: "May 12, 2024", event: "Application reviewed", completed: true },
      { date: "May 13, 2024", event: "Initial screening call", completed: true },
      { date: "May 15, 2024", event: "Technical interview", completed: false },
      { date: "May 20, 2024", event: "Final interview", completed: false },
      { date: "May 25, 2024", event: "Decision", completed: false },
    ],
  },
  {
    id: 2,
    jobTitle: "UX/UI Designer",
    company: "DesignHub",
    location: "New York, NY",
    appliedDate: "May 5, 2024",
    status: "Rejected",
    statusColor: "red",
    nextStep: "Application closed",
    progress: 100,
    logo: "/placeholder.svg?height=40&width=40",
    description: "Join our design team to create beautiful and intuitive user experiences for our products.",
    timeline: [
      { date: "May 5, 2024", event: "Application submitted", completed: true },
      { date: "May 7, 2024", event: "Application reviewed", completed: true },
      { date: "May 9, 2024", event: "Application rejected", completed: true },
    ],
  },
  {
    id: 3,
    jobTitle: "Product Manager",
    company: "InnovateTech",
    location: "Chicago, IL",
    appliedDate: "May 8, 2024",
    status: "Applied",
    statusColor: "gray",
    nextStep: "Waiting for review",
    progress: 20,
    logo: "/placeholder.svg?height=40&width=40",
    description: "Lead product development from conception to launch, working with cross-functional teams.",
    timeline: [
      { date: "May 8, 2024", event: "Application submitted", completed: true },
      { date: "Pending", event: "Application review", completed: false },
      { date: "Pending", event: "Initial screening", completed: false },
      { date: "Pending", event: "Interview", completed: false },
      { date: "Pending", event: "Decision", completed: false },
    ],
  },
  {
    id: 4,
    jobTitle: "Backend Engineer",
    company: "DataSystems",
    location: "San Francisco, CA",
    appliedDate: "May 3, 2024",
    status: "Assessment",
    statusColor: "yellow",
    nextStep: "Complete coding challenge by May 12, 2024",
    progress: 40,
    logo: "/placeholder.svg?height=40&width=40",
    description: "We're seeking a Backend Engineer to develop and maintain our server-side applications.",
    timeline: [
      { date: "May 3, 2024", event: "Application submitted", completed: true },
      { date: "May 5, 2024", event: "Application reviewed", completed: true },
      { date: "May 7, 2024", event: "Initial screening call", completed: true },
      { date: "May 10, 2024", event: "Coding assessment sent", completed: true },
      { date: "May 12, 2024", event: "Assessment deadline", completed: false },
      { date: "Pending", event: "Technical interview", completed: false },
      { date: "Pending", event: "Final interview", completed: false },
      { date: "Pending", event: "Decision", completed: false },
    ],
  },
  {
    id: 5,
    jobTitle: "DevOps Engineer",
    company: "CloudWorks",
    location: "Remote",
    appliedDate: "May 1, 2024",
    status: "Offer",
    statusColor: "green",
    nextStep: "Review offer by May 15, 2024",
    progress: 90,
    logo: "/placeholder.svg?height=40&width=40",
    description: "Help us build and maintain our cloud infrastructure and deployment pipelines.",
    timeline: [
      { date: "May 1, 2024", event: "Application submitted", completed: true },
      { date: "May 2, 2024", event: "Application reviewed", completed: true },
      { date: "May 3, 2024", event: "Initial screening call", completed: true },
      { date: "May 5, 2024", event: "Technical interview", completed: true },
      { date: "May 8, 2024", event: "Final interview", completed: true },
      { date: "May 10, 2024", event: "Offer extended", completed: true },
      { date: "May 15, 2024", event: "Offer deadline", completed: false },
    ],
  },
]

export default function ApplicationsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<(typeof applications)[0] | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Filter applications based on search term and status
  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      application.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.company.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || application.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const openApplicationDetails = (application: (typeof applications)[0]) => {
    setSelectedApplication(application)
    setDetailsOpen(true)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return "bg-gray-100 text-gray-800"
      case "assessment":
        return "bg-yellow-100 text-yellow-800"
      case "interview":
        return "bg-blue-100 text-blue-800"
      case "offer":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar className="hidden md:flex">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-3">
              <Briefcase className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl text-blue-600">JobConnect</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard">
                    <Briefcase className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/jobs">
                    <Search className="h-4 w-4" />
                    <span>Find Jobs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive>
                  <Link href="/applications">
                    <Calendar className="h-4 w-4" />
                    <span>Applications</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/profile">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="p-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <span>John Doe</span>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex h-16 items-center border-b px-6">
                  <div className="flex items-center gap-2 font-bold text-blue-600">
                    <Briefcase className="h-6 w-6" />
                    <span className="text-xl">JobConnect</span>
                  </div>
                </div>
                <nav className="grid gap-2 p-4">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Briefcase className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/jobs"
                    className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Search className="h-4 w-4" />
                    <span>Find Jobs</span>
                  </Link>
                  <Link
                    href="/applications"
                    className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Applications</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <SidebarTrigger className="hidden md:flex" />
            <div className="w-full flex-1">
              <form>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search applications..."
                    className="w-full rounded-md bg-white pl-8 md:max-w-sm lg:max-w-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </form>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-blue-600"></span>
              <span className="sr-only">Notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="hidden md:flex">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="flex-1 p-4 md:p-6">
            <div className="grid gap-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
                <p className="text-gray-500">Track and manage your job applications</p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                    className={statusFilter === "all" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === "applied" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("applied")}
                    className={statusFilter === "applied" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    Applied
                  </Button>
                  <Button
                    variant={statusFilter === "assessment" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("assessment")}
                    className={statusFilter === "assessment" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    Assessment
                  </Button>
                  <Button
                    variant={statusFilter === "interview" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("interview")}
                    className={statusFilter === "interview" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    Interview
                  </Button>
                  <Button
                    variant={statusFilter === "offer" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("offer")}
                    className={statusFilter === "offer" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    Offer
                  </Button>
                  <Button
                    variant={statusFilter === "rejected" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("rejected")}
                    className={statusFilter === "rejected" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    Rejected
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Select defaultValue="newest">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="company">Company Name</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4">
                {filteredApplications.length === 0 ? (
                  <Card className="border-none shadow-sm">
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <div className="rounded-full bg-blue-50 p-3">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium">No applications found</h3>
                      <p className="mt-2 text-center text-sm text-gray-500">
                        {searchTerm || statusFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "Start applying for jobs to track your applications"}
                      </p>
                      <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                        <Link href="/jobs">Browse Jobs</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  filteredApplications.map((application) => (
                    <Card
                      key={application.id}
                      className="overflow-hidden border-none shadow-sm transition-all hover:shadow-md"
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="flex items-center gap-4 border-b p-4 md:border-b-0 md:border-r md:p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
                              <Building className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{application.jobTitle}</h3>
                              <p className="text-sm text-gray-500">{application.company}</p>
                            </div>
                          </div>
                          <div className="flex flex-1 flex-col justify-between p-4 md:p-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                              <div>
                                <p className="text-sm font-medium">Status</p>
                                <Badge variant="outline" className={getStatusBadgeColor(application.status)}>
                                  {application.status}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Applied on</p>
                                <p className="text-sm text-gray-500">{application.appliedDate}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Location</p>
                                <p className="text-sm text-gray-500">{application.location}</p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <div className="mb-1 flex items-center justify-between">
                                <p className="text-xs font-medium">Application Progress</p>
                                <p className="text-xs text-gray-500">{application.progress}%</p>
                              </div>
                              <Progress value={application.progress} className="h-2" />
                            </div>
                            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-between">
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="mr-1 h-4 w-4" />
                                <span>Next: {application.nextStep}</span>
                              </div>
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => openApplicationDetails(application)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Application Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Application Details</DialogTitle>
                <DialogDescription>
                  Track the progress of your application for {selectedApplication.jobTitle} at{" "}
                  {selectedApplication.company}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-md bg-blue-100">
                    <Building className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedApplication.jobTitle}</h2>
                    <p className="text-gray-500">
                      {selectedApplication.company} • {selectedApplication.location}
                    </p>
                  </div>
                  <Badge variant="outline" className={`ml-auto ${getStatusBadgeColor(selectedApplication.status)}`}>
                    {selectedApplication.status}
                  </Badge>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-2 font-medium">Job Description</h3>
                  <p className="text-sm text-gray-600">{selectedApplication.description}</p>
                </div>

                <div>
                  <h3 className="mb-4 font-medium">Application Timeline</h3>
                  <div className="space-y-4">
                    {selectedApplication.timeline.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                            item.completed
                              ? "bg-blue-100 text-blue-600"
                              : "border border-gray-200 bg-white text-gray-400"
                          }`}
                        >
                          {item.completed ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.event}</p>
                          <p className="text-sm text-gray-500">{item.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-medium">Next Steps</h3>
                    <p className="text-sm text-gray-600">{selectedApplication.nextStep}</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedApplication.status === "Offer" && (
                      <>
                        <Button variant="outline" size="sm">
                          Decline Offer
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Accept Offer
                        </Button>
                      </>
                    )}
                    {selectedApplication.status === "Assessment" && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Complete Assessment
                      </Button>
                    )}
                    {selectedApplication.status === "Interview" && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Prepare for Interview
                      </Button>
                    )}
                    {selectedApplication.status !== "Rejected" && (
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        Upload Documents
                      </Button>
                    )}
                    {selectedApplication.status !== "Offer" && selectedApplication.status !== "Rejected" && (
                      <Button variant="outline" size="sm">
                        <X className="mr-2 h-4 w-4" />
                        Withdraw Application
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
