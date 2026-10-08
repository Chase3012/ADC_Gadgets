"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { ShoppingBag, UserCog, CreditCard, HelpCircle, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SidebarDemo() {
  const links = [
    {
      label: "Shop",
      href: "/src/user/user-home.html",
      icon: (
        <ShoppingBag className="text-white h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Profile",
      href: "/src/user/account.html",
      icon: (
        <UserCog className="text-white h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Loan",
      href: "/src/user/loan.html",
      icon: (
        <CreditCard className="text-white h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Support",
      href: "/src/user/support.html",
      icon: (
        <HelpCircle className="text-white h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-black w-full flex-1 h-screen overflow-hidden"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 bg-black text-white border-r border-white/10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} className="hover:bg-white/10 hover:text-pink-500 rounded-md px-2" />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              className="hover:bg-white/10 hover:text-pink-500 rounded-md px-2"
              link={{
                label: "Logout",
                href: "/src/user/login.html",
                icon: (
                  <LogOut className="text-white h-5 w-5 flex-shrink-0" />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 p-8 bg-gray-100 overflow-y-auto">
        <h1 className="text-2xl font-bold">Main Content Area</h1>
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <a
      href="#"
      className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
    >
      <img src="../../images/logo.jpg" alt="Logo" className="h-8 w-8 rounded-full flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold text-white text-lg whitespace-pre"
      >
        ADC Gadgets
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
    >
      <img src="../../images/logo.jpg" alt="Logo" className="h-8 w-8 rounded-full flex-shrink-0" />
    </a>
  );
};
