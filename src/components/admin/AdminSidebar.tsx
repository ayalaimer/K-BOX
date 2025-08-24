import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, CalendarDays, DoorOpen, PencilLine, Languages, BarChart3, Bug, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "דשבורד", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "הזמנות", url: "/admin/bookings", icon: CalendarDays },
  { title: "חדרים", url: "/admin/rooms", icon: DoorOpen },
  { title: "בלוג", url: "/admin/blog/new", icon: PencilLine },
  { title: "הודעות", url: "/admin/messages", icon: MessageSquare, badge: true },
  { title: "תרגומים", url: "/admin/translations", icon: Languages },
  { title: "אנליטיקות", url: "/admin/analytics", icon: BarChart3 },
  { title: "לוגים", url: "/admin/logs", icon: Bug },
];

export const AdminSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  
  const isActive = (path: string) => location.pathname === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

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

  return (
    <Sidebar className={state === 'collapsed' ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>אדמין</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {state !== 'collapsed' && (
                        <div className="flex items-center justify-between w-full">
                          <span>{item.title}</span>
                          {item.badge && newMessagesCount > 0 && (
                            <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                              {newMessagesCount}
                            </span>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
