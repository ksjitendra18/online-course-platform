"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Book, GraduationCap, Home, LogIn, Menu } from "lucide-react";
import { MdSpaceDashboard } from "react-icons/md";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NavbarProps = {
  currentUser: CurrentUser;
};

type CurrentUser = {
  userId: string;
  name: string;
  email: string;
  role: string;
  staff: boolean;
  avatar?: string;
} | null;

export default function Navbar({ currentUser }: NavbarProps) {
  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Courses", href: "/courses", icon: Book },
    ...(currentUser?.staff
      ? [{ label: "Dashboard", href: "/dashboard", icon: MdSpaceDashboard }]
      : []),
    ...(currentUser && !currentUser.staff
      ? [{ label: "My Courses", href: "/my-courses", icon: GraduationCap }]
      : []),
  ];

  const renderNavItems = (isMobile: boolean = false) => (
    <>
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          asChild
          className={isMobile ? "w-full justify-start" : ""}
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
        </Button>
      ))}
    </>
  );

  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout");
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="border-b">
      <div className="mx-auto px-3">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">LearningApp</span>
            </Link>

          </div>

          <div className="hidden items-center space-x-4 md:flex">
            {renderNavItems()}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={currentUser.avatar}
                        alt={currentUser.name}
                      />
                      <AvatarFallback className="bg-blue-700 text-white">
                        {currentUser?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{currentUser.name}</DropdownMenuLabel>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/account">Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log in
                </Link>
              </Button>
            )}
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="mt-4 flex flex-col space-y-4">
                  {renderNavItems(true)}
                  {currentUser ? (
                    <>
                      <div className="mb-4 flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={currentUser.avatar}
                            alt={currentUser.name}
                          />
                          <AvatarFallback className="bg-blue-700 text-white">
                            {currentUser?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{currentUser.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {currentUser.role}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" className="w-full justify-start">
                        Profile
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        Settings
                      </Button>
                      <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className="w-full justify-start"
                      >
                        Log out
                      </Button>
                    </>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Log in
                      </Link>
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
