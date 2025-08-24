import { Outlet, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { AdminNav, adminNavItems } from "@/components/admin/AdminNav";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, LogOut } from "lucide-react";
import { ReactNode } from "react";

interface AdminLayoutProps {
  children?: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps = {}) => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      <header className="border-b">
        <Sheet>
          <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="sm:hidden" aria-label="פתח תפריט ניהול">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <span className="font-medium truncate">אזור ניהול</span>
            </div>
            <div className="flex-1 flex justify-center">
              <AdminNav />
            </div>
            <div className="flex-1 flex justify-end">
              <div className="hidden sm:block">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={logout} aria-label="התנתק">
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">התנתק</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <SheetContent side="top" className="sm:hidden">
            <nav aria-label="Admin mobile navigation" className="mt-2">
              <ul className="flex flex-col gap-2">
                {adminNavItems.map((item) => (
                  <li key={item.url}>
                    <SheetClose asChild>
                      <NavLink
                        to={item.url}
                        end={item.end}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-md px-3 py-2 transition-smooth ${
                            isActive ? 'bg-primary text-primary-foreground' : 'bg-card border text-foreground hover:bg-muted/50'
                          }`
                        }
                        aria-label={item.title}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SheetClose>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t pt-3">
                <SheetClose asChild>
                  <Button variant="destructive" className="w-full" onClick={logout} aria-label="התנתק">
                    <LogOut className="h-4 w-4 ml-2" /> התנתק
                  </Button>
                </SheetClose>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </header>
      <main className="flex-1 w-full mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-4">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout;
