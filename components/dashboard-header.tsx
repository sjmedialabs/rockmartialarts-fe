"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, MoreVertical, Menu, Settings, User, LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuPortal } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import NotificationDropdown from "@/components/notification-dropdown"

interface DashboardHeaderProps {
  currentPage?: string;
}

export default function DashboardHeader({ currentPage = "Dashboard" }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("/placeholder.svg");

  // Load profile image from localStorage on mount
  useEffect(() => {
    const savedProfileImage = localStorage.getItem("profileImage");
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }

    // Listen for profile image updates
    const handleStorageChange = () => {
      const updatedImage = localStorage.getItem("profileImage");
      if (updatedImage) {
        setProfileImage(updatedImage);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/login");
    }
  };

  const handleMobileNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    return pathname === path || pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200/80 backdrop-blur-sm">
      <div className="w-full px-4 lg:px-6 py-2">
        <div className="flex justify-between items-center h-auto gap-4">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="flex-shrink-0">
              <img src="/footer_logo.png" alt="Logo" className="xl:w-[95px] w-[80px] h-auto" />
            </div>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden hover:bg-gray-100/80 transition-colors duration-200 rounded-lg">
                  <Menu className="w-5 h-5 text-gray-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-white/95 backdrop-blur-md border-r border-gray-200/50">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-200/60">
                    <div className="flex items-center space-x-3">
                      <img src="/footer_logo.png" alt="Logo" className="w-8 h-8" />
                    </div>
                  </div>
                  <nav className="flex-1 p-6">
                    <div className="space-y-3">
                      <button onClick={() => handleMobileNavigation("/dashboard")} className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100/80 text-sm font-medium transition-all duration-200 ${isActivePath("/dashboard") && pathname === "/dashboard" ? "bg-gradient-to-r from-yellow-50 to-yellow-100/50 text-[#E1BB33] border-l-3 border-[#E1BB33] shadow-sm" : "text-gray-700 hover:text-gray-900"}`}>Dashboard</button>
                      <button onClick={() => handleMobileNavigation("/dashboard/branches")} className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100/80 text-sm font-medium transition-all duration-200 ${isActivePath("/dashboard/branches") ? "bg-gradient-to-r from-yellow-50 to-yellow-100/50 text-[#E1BB33] border-l-3 border-[#E1BB33] shadow-sm" : "text-gray-700 hover:text-gray-900"}`}>Branches</button>
                      <button onClick={() => handleMobileNavigation("/dashboard/coaches")} className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100/80 text-sm font-medium transition-all duration-200 ${isActivePath("/dashboard/coaches") ? "bg-gradient-to-r from-yellow-50 to-yellow-100/50 text-[#E1BB33] border-l-3 border-[#E1BB33] shadow-sm" : "text-gray-700 hover:text-gray-900"}`}>Coachs</button>
                      <button onClick={() => handleMobileNavigation("/dashboard/students")} className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100/80 text-sm font-medium transition-all duration-200 ${isActivePath("/dashboard/students") ? "bg-gradient-to-r from-yellow-50 to-yellow-100/50 text-[#E1BB33] border-l-3 border-[#E1BB33] shadow-sm" : "text-gray-700 hover:text-gray-900"}`}>Students</button>
                      <button onClick={() => handleMobileNavigation("/dashboard/messages")} className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100/80 text-sm font-medium transition-all duration-200 ${isActivePath("/dashboard/messages") ? "bg-gradient-to-r from-yellow-50 to-yellow-100/50 text-[#E1BB33] border-l-3 border-[#E1BB33] shadow-sm" : "text-gray-700 hover:text-gray-900"}`}>Messages</button>
                      <button onClick={() => handleMobileNavigation("/dashboard/courses")} className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100/80 text-sm font-medium transition-all duration-200 ${isActivePath("/dashboard/courses") ? "bg-gradient-to-r from-yellow-50 to-yellow-100/50 text-[#E1BB33] border-l-3 border-[#E1BB33] shadow-sm" : "text-gray-700 hover:text-gray-900"}`}>Courses</button>
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-gray-500 mb-2">Attendance</p>
                        <button onClick={() => handleMobileNavigation("/dashboard/attendance")} className={`w-full text-left px-3 py-1 rounded-md hover:bg-gray-100 text-sm text-gray-600 ${isActivePath("/dashboard/attendance") && !isActivePath("/dashboard/attendance/students") && !isActivePath("/dashboard/attendance/coaches") ? "bg-yellow-50 text-[#E1BB33]" : ""}`}>Overview</button>
                        <button onClick={() => handleMobileNavigation("/dashboard/attendance/students")} className={`w-full text-left px-3 py-1 rounded-md hover:bg-gray-100 text-sm text-gray-600 ${isActivePath("/dashboard/attendance/students") ? "bg-yellow-50 text-[#E1BB33]" : ""}`}>Student Attendance</button>
                        <button onClick={() => handleMobileNavigation("/dashboard/attendance/coaches")} className={`w-full text-left px-3 py-1 rounded-md hover:bg-gray-100 text-sm text-gray-600 ${isActivePath("/dashboard/attendance/coaches") ? "bg-yellow-50 text-[#E1BB33]" : ""}`}>Coach Attendance</button>
                      </div>
                      <button onClick={() => handleMobileNavigation("/dashboard/reports")} className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm ${isActivePath("/dashboard/reports") ? "bg-yellow-50 text-[#E1BB33]" : ""}`}>Reports</button>
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-gray-500 mb-2">More</p>
                        <button onClick={() => handleMobileNavigation("/dashboard/payment-tracking")} className={`w-full text-left px-3 py-1 rounded-md hover:bg-gray-100 text-sm text-gray-600 ${isActivePath("/dashboard/payment-tracking") ? "bg-yellow-50 text-[#E1BB33]" : ""}`}>Payment Tracking</button>
                      </div>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-3 ml-auto">
            <nav className="hidden lg:flex items-center space-x-2 xl:space-x-3 2xl:space-x-4">
              <button onClick={() => router.push("/dashboard")} className={`pb-2 px-1 text-sm font-semibold whitespace-nowrap cursor-pointer transition-all duration-300 hover:scale-105 ${pathname === "/dashboard" ? "text-[#E1BB33]" : "text-gray-600 hover:text-gray-900"}`}>Dashboard</button>
              <button onClick={() => router.push("/dashboard/branches")} className={`pb-2 px-1 text-sm font-semibold whitespace-nowrap cursor-pointer transition-all duration-300 hover:scale-105 ${isActivePath("/dashboard/branches") ? "text-[#E1BB33]" : "text-gray-600 hover:text-gray-900"}`}>Branches</button>
              <button onClick={() => router.push("/dashboard/coaches")} className={`pb-2 px-1 text-sm font-semibold whitespace-nowrap cursor-pointer transition-all duration-300 hover:scale-105 ${isActivePath("/dashboard/coaches") ? "text-[#E1BB33]" : "text-gray-600 hover:text-gray-900"}`}>Coachs</button>
              <button onClick={() => router.push("/dashboard/students")} className={`pb-2 px-1 text-sm font-semibold whitespace-nowrap cursor-pointer transition-all duration-300 hover:scale-105 ${isActivePath("/dashboard/students") ? "text-[#E1BB33]" : "text-gray-600 hover:text-gray-900"}`}>Students</button>
              <button onClick={() => router.push("/dashboard/messages")} className={`pb-2 px-1 text-sm font-semibold whitespace-nowrap cursor-pointer transition-all duration-300 hover:scale-105 ${isActivePath("/dashboard/messages") ? "text-[#E1BB33]" : "text-gray-600 hover:text-gray-900"}`}>Messages</button>
              <button onClick={() => router.push("/dashboard/courses")} className={`pb-2 px-1 text-sm font-semibold whitespace-nowrap cursor-pointer transition-all duration-300 hover:scale-105 ${isActivePath("/dashboard/courses") ? "text-[#E1BB33]" : "text-gray-600 hover:text-gray-900"}`}>Courses</button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`pb-2 px-1 text-sm font-semibold whitespace-nowrap flex items-center cursor-pointer transition-all duration-300 hover:scale-105 ${isActivePath("/dashboard/attendance") ? "text-[#E1BB33]" : "text-gray-600 hover:text-gray-900"}`}>
                    Attendance
                    <ChevronDown className="w-3 h-3 ml-1 transition-transform duration-200" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent align="start" className="w-56 z-[1000] bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-xl rounded-lg p-2" sideOffset={8}>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/attendance")} className="cursor-pointer hover:bg-gray-100/80 rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200">Overview</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/attendance/students")} className="cursor-pointer hover:bg-gray-100/80 rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200">Student Attendance</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/attendance/coaches")} className="cursor-pointer hover:bg-gray-100/80 rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200">Coach Attendance</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
              <button onClick={() => router.push("/dashboard/reports")} className={`pb-2 px-1 text-sm font-semibold whitespace-nowrap cursor-pointer transition-all duration-300 hover:scale-105 ${isActivePath("/dashboard/reports") ? "text-[#E1BB33]" : "text-gray-600 hover:text-gray-900"}`}>Reports</button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="pb-2 px-2 text-gray-700 hover:text-gray-900 cursor-pointer rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center border border-gray-200 hover:border-gray-300 flex-shrink-0 h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent align="end" className="w-56 z-[1000] bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-xl rounded-lg p-2" sideOffset={8}>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/categories")} className="cursor-pointer hover:bg-gray-100/80 rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200">Categories Management</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/payment-tracking")} className="cursor-pointer hover:bg-gray-100/80 rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200">Payment Tracking</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            </nav>

            <NotificationDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-3 bg-white rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={profileImage} />
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white font-semibold text-sm">SA</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold text-gray-800 hidden lg:inline">Super admin</span>
                  <ChevronDown className="w-4 h-4 text-gray-600 transition-transform duration-200" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent align="end" className="w-56 z-[1000] bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-xl rounded-lg p-2" sideOffset={8}>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/profile")} className="cursor-pointer hover:bg-gray-100/80 rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="cursor-pointer hover:bg-gray-100/80 rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </DropdownMenuItem>
                  <div className="h-px bg-gray-200/60 my-2"></div>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-red-50/80 rounded-md px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 transition-colors duration-200 flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
