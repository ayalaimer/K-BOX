import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  PencilLine,
  Languages,
  DoorOpen,
  CalendarDays,
  BarChart3,
  Bug,
  Mail,
  Settings,
  Star,
  MessageSquare,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export const adminNavItems: { title: string; url: string; icon: LucideIcon; end?: boolean; badge?: boolean }[] = [
  { title: "דשבורד", url: "/admin/dashboard", icon: LayoutDashboard, end: true },
  { title: "הזמנות", url: "/admin/bookings", icon: CalendarDays },
  { title: "חדרים", url: "/admin/rooms", icon: DoorOpen },
  { title: "ביקורות", url: "/admin/reviews", icon: Star },
  { title: "בלוג", url: "/admin/blog/new", icon: PencilLine },
  { title: "הודעות", url: "/admin/messages", icon: MessageSquare, badge: true },
  { title: "תרגומים", url: "/admin/translations", icon: Languages },
  { title: "טמפלטי מייל", url: "/admin/email-templates", icon: Mail },
  { title: "הגדרות עסק", url: "/admin/settings", icon: Settings },
  { title: "אנליטיקות", url: "/admin/analytics", icon: BarChart3 },
  { title: "לוגים", url: "/admin/logs", icon: Bug },
];

export const AdminNav = () => {
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  useEffect(() => {
    const fetchNewMessagesCount = async () => {
      try {
        const { count } = await supabase
          .from('contact_messages')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'new');
        
        setNewMessagesCount(count || 0);
      } catch (error) {
        console.error('Error fetching new messages count:', error);
      }
    };

    fetchNewMessagesCount();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('contact_messages_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contact_messages'
      }, () => {
        fetchNewMessagesCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `inline-flex h-9 w-9 items-center justify-center rounded-md text-sm transition-smooth hover-scale ${
      isActive ? 'bg-primary text-primary-foreground' : 'bg-card border text-foreground hover:bg-muted/50'
    }`;

  return (
    <nav aria-label="Admin navigation" className="sm:mb-0">
      <ul className="hidden sm:flex items-center gap-1 justify-center overflow-x-auto whitespace-nowrap">
        {adminNavItems.map(({ title, url, icon: Icon, end, badge }) => (
          <li key={url} className="flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink to={url} className={linkCls} aria-label={title} end={end}>
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {badge && newMessagesCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center rounded-full"
                      >
                        {newMessagesCount}
                      </Badge>
                    )}
                  </div>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="bottom" dir="rtl">{title}</TooltipContent>
            </Tooltip>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AdminNav;
