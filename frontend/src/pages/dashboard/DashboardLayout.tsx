import { Bell, CircleQuestionMark, CircleUser, CreditCard, Home, LanguagesIcon, LogOut, Server, Store } from "lucide-react";
import Branding from "../../branding.json";
import { Link, Outlet, useLocation } from "react-router";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";

export default function DashboardLayout() {

  const appName = Branding.AppName; // gets app name from @/src/branding.json

  // gets user info
  const user = useSelector((state: RootState) => state.AuthState);

  // genrates user fallback text 
  const arr = user.name?.split(" ");
  const fallbackUserAvatar = `${arr?.at(0)?.toUpperCase().charAt(0) + `${arr?.at(arr.length - 1)?.toUpperCase().charAt(0)}`}`;

  const links = [
    {
      name: "Home",
      href: "/dashboard",
      icon: Home
    },
    {
      name: "VPS",
      href: "/dashboard/vps",
      icon: Server
    },
    {
      name: "Billing",
      href: "/dashboard/billing",
      icon: CreditCard
    },
    {
      name: "Marketplace",
      href: "/dashboard/market",
      icon: Store
    }
  ];

  const footerLinks = [
    {
      name: "Help",
      href: "/help",
      icon: CircleQuestionMark
    }
  ];

  const accountLinks = [
    {
      name: "Account",
      href: "/",
      icon: CircleUser,
    },
    {
      name: "Notifications",
      href: "/",
      icon: Bell,
    },
    {
      name: "Language",
      href: "/",
      icon: LanguagesIcon,
    },
    {
      name: "Logout",
      href: "/",
      icon: LogOut,
    },
  ];

  // gets url location
  const location = useLocation();

  // get pathname eg. /dahboard/vps => VPS
  const currentURLRoute = location.pathname.split("/").pop();
  
  const fullURLPath = location.pathname // gets full url path eg. /dashboard/vps

  // handles user account collapasble button logic
  const [isCollapsableOpen, setIsCollapsableOpen] = useState(false);

  return (
    <div className="flex">
      {/* sidebar */}
      <aside className="h-screen bg-white w-[13%] p-4 relative">

        {/* App title */}
        <h2 className="logo font-semibold text-xl text-primary text-center">{appName}</h2>

        {/* Dashboard links */}
        <ul className="mt-6 space-y-1">
          {links.map((link, index) => (
            <li key={index}>
              <Link to={link.href} className={`flex items-center gap-2 hover:text-accent hover:bg-accent/[6%] py-3 px-4 rounded text-sm ${fullURLPath === link.href? "text-accent bg-accent/[6%]": "text-secondary-foreground"}`}>
                <link.icon className="size-5" />
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Footer Links */}
        <div className="absolute bottom-2">
          <ul className="flex flex-col">
            {footerLinks.map((link, index) => (
              <li key={index}>
                <Link to={link.href} className="flex items-center gap-2 text-primary hover:text-accent py-3 px-4 text-sm">
                  <link.icon className="size-5" />
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </aside>

      {/* main pannel */}
      <div className="flex-1 bg-primary-background border-l-[1px] border-border-primary">

        {/* main pannel nav bar */}
        <nav className="bg-white border-b-[1px] border-border-primary flex items-center justify-between px-8 py-2">

          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-secondary-foreground gap-2 uppercase">

            <Link to={"/dashboard"} className=""><Home className="size-5 hover:text-accent" /></Link>
            {currentURLRoute != "dashboard" &&
              <>
                <div className="">-</div>
                <div className="">{currentURLRoute}</div>
              </>
            }
          </div>

          <div className='flex items-center justify-center gap-4'>

            {/* user account info collapsable card */}
            <div className={`${isCollapsableOpen ? "absolute" : "hidden"} top-14 right-16 bg-white shadow border-[1px] border-border-primary rounded z-50`}>

              {/* user name, image and email */}
              <div className="flex items-center gap-4 p-4">
                <div className="size-12">
                  <img src={user.imageUrl} alt={fallbackUserAvatar}
                    className='w-full h-full object-cover rounded-full'
                  />
                </div>
                <div className="">
                  <h4 className="scroll-m-20 font-medium tracking-tight text-primary text-lg">{user.name}</h4>
                  <p className="text-secondary-foreground text-sm">{user.email}</p>
                </div>
              </div>
              <div className="border-t-[1px] mt-0 border-border-primary" />

              {/* user account button links */}
              <div className="">
                <ul className="p-2">
                  {accountLinks.map((link, index) => (
                    <li key={index}>
                      <Link to={link.href} className={`flex items-center gap-2 py-3  p-4 text-sm rounded ${link.name == "Logout" ? "hover:bg-red-100 text-red-500" : "text-primary hover:bg-accent/[6%]"}`}>
                        <link.icon className="size-5" />
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Overlay Screen  */}
            <div className={`${isCollapsableOpen ? "absolute top-0 left-0 right-0 bottom-0" : "hidden"}`} onClick={() => { setIsCollapsableOpen(!isCollapsableOpen); }}></div>

            {/* user account button */}
            <button className="size-9 rounded-full z-40 cursor-pointer" onClick={() => { setIsCollapsableOpen(!isCollapsableOpen); }}>
              <img src={user.imageUrl} alt={fallbackUserAvatar}
                className='w-full h-full object-cover rounded-full'
              />
            </button>

          </div>
        </nav>

        {/* page content */}
        <div className="px-8 py-4">
          <Outlet />
        </div>

      </div>
    </div>
  );
}
