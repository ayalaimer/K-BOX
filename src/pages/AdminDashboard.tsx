import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, DollarSign, DoorOpen, Check, X, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { subDays, format } from "date-fns";
import { Link } from "react-router-dom";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { logInfo, logError } from "@/lib/logging";

function formatDateISO(d: Date) {
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [isAuthed, setIsAuthed] = useState(false);
  const today = useMemo(() => formatDateISO(new Date()), []);
  const weekStart = useMemo(() => formatDateISO(subDays(new Date(), 6)), []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(!!session);
      if (!session) window.location.replace('/auth');
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthed(!!session);
      if (!session) window.location.replace('/auth');
    });
    return () => subscription.unsubscribe();
  }, []);

  const roomsQuery = useQuery({
    queryKey: ['rooms-map'],
    enabled: isAuthed,
    queryFn: async () => {
      const { data, error } = await supabase.from('rooms').select('id, name');
      if (error) throw error;
      return Object.fromEntries((data || []).map((r: any) => [r.id, r.name])) as Record<string, string>;
    }
  });

  const bookingsTodayQuery = useQuery({
    queryKey: ['bookings-count', today],
    enabled: isAuthed,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('booking_date', today);
      if (error) throw error;
      return count || 0;
    }
  });

  const revenueTodayQuery = useQuery({
    queryKey: ['revenue-today', today],
    enabled: isAuthed,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('price_total, status')
        .eq('booking_date', today)
        .in('status', ['approved', 'completed']);
      if (error) throw error;
      return (data || []).reduce((sum, b) => sum + Number(b.price_total || 0), 0);
    }
  });

  const roomsOccupiedQuery = useQuery({
    queryKey: ['rooms-occupied', today],
    enabled: isAuthed,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('room_id, status')
        .eq('booking_date', today)
        .in('status', ['approved', 'completed']);
      if (error) throw error;
      const unique = new Set((data || []).map((b) => b.room_id));
      return unique.size;
    }
  });

  const pendingTodayCountQuery = useQuery({
    queryKey: ['pending-count', today],
    enabled: isAuthed,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('booking_date', today)
        .eq('status', 'pending');
      if (error) throw error;
      return count || 0;
    }
  });

  const pendingQuery = useQuery({
    queryKey: ['pending-today', today],
    enabled: isAuthed,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, booking_date, start_time, duration_hours, status, price_total, room_id, customer_name, customer_phone, customer_email, booking_code')
        .eq('status', 'pending')
        .gte('booking_date', today)
        .order('booking_date')
        .order('start_time');
      if (error) throw error;
      return data || [];
    }
  });

  const last7DaysQuery = useQuery({
    queryKey: ['last7days', weekStart, today],
    enabled: isAuthed,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('booking_date, price_total, status')
        .gte('booking_date', weekStart)
        .lte('booking_date', today);
      if (error) throw error;
      return data || [];
    }
  });

  const chartData = useMemo(() => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(today), i);
      days.push(format(d, 'yyyy-MM-dd'));
    }
    const byDay = days.map((d) => ({
      day: format(new Date(d), 'dd/MM'),
      bookings: 0,
      revenue: 0,
    }));
    (last7DaysQuery.data || []).forEach((row: any) => {
      const idx = days.indexOf(row.booking_date);
      if (idx >= 0) {
        byDay[idx].bookings += 1;
        if (['approved','completed'].includes(row.status)) byDay[idx].revenue += Number(row.price_total || 0);
      }
    });
    return byDay;
  }, [last7DaysQuery.data, today]);

  async function approve(b: any) {
    try {
      const { error } = await supabase.from('bookings').update({ status: 'approved' }).eq('id', b.id);
      if (error) throw error;
      toast({ title: 'אושר', description: 'ההזמנה אושרה' });
      await logInfo('Admin approved booking', { component: 'AdminDashboard', context: { booking_id: b.id } });
      pendingQuery.refetch();
      bookingsTodayQuery.refetch();
      revenueTodayQuery.refetch();
      roomsOccupiedQuery.refetch();
      if (b.customer_email) {
        const { error: fnErr } = await supabase.functions.invoke('send-booking-confirmation', {
          body: {
            to: b.customer_email,
            status: 'approved',
            booking: {
              booking_code: b.booking_code,
              booking_date: b.booking_date,
              start_time: b.start_time,
              duration_hours: b.duration_hours,
              room_id: b.room_id,
              customer_name: b.customer_name,
              customer_phone: b.customer_phone,
              price_total: b.price_total,
            }
          }
        });
        if (fnErr) {
          await logError('Admin email send failed', { component: 'AdminDashboard', context: { booking_id: b.id, message: (fnErr as any)?.message } });
        } else {
          await logInfo('Admin email sent', { component: 'AdminDashboard', context: { booking_id: b.id } });
        }
      }
    } catch (e: any) {
      await logError('Admin approve failed', { component: 'AdminDashboard', context: { booking_id: b.id, message: e?.message } });
      toast({ title: 'שגיאה באישור', description: e.message || 'נכשל', variant: 'destructive' });
    }
  }

  async function cancel(b: any) {
    try {
      const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', b.id);
      if (error) throw error;
      toast({ title: 'בוטל', description: 'ההזמנה בוטלה' });
      await logInfo('Admin cancelled booking', { component: 'AdminDashboard', context: { booking_id: b.id } });
      pendingQuery.refetch();
      bookingsTodayQuery.refetch();
      revenueTodayQuery.refetch();
      roomsOccupiedQuery.refetch();
    } catch (e: any) {
      await logError('Admin cancel failed', { component: 'AdminDashboard', context: { booking_id: b.id, message: e?.message } });
      toast({ title: 'שגיאת ביטול', description: e.message || 'נכשל', variant: 'destructive' });
    }
  }

  return (
    <div className="container mx-auto px-2 md:px-4">
      <Helmet>
        <title>דשבורד אדמין | K-Box</title>
        <meta name="description" content="סטטיסטיקות יומיות, הזמנות ממתינות וגרפים לתמונה מלאה" />
        <link rel="canonical" href={`${window.location.origin}/admin/dashboard`} />
      </Helmet>

      <header className="mb-6">
        <h1 className="text-3xl font-bold">דשבורד</h1>
        <p className="text-muted-foreground">סקירה יומית וניהול מהיר</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" /> הזמנות היום</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{bookingsTodayQuery.isLoading ? '…' : bookingsTodayQuery.data}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5" /> הכנסות היום</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold ltr-numbers">₪{revenueTodayQuery.isLoading ? '…' : revenueTodayQuery.data}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DoorOpen className="w-5 h-5" /> חדרים תפוסים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{roomsOccupiedQuery.isLoading ? '…' : roomsOccupiedQuery.data}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" /> ממתינות לאישור</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{pendingTodayCountQuery.isLoading ? '…' : pendingTodayCountQuery.data}</div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>הזמנות 7 הימים האחרונים</CardTitle>
            <Button asChild variant="outline" size="sm"><Link to="/admin/analytics">ראה הכל</Link></Button>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                bookings: { label: 'הזמנות', color: 'hsl(var(--primary))' },
              }}
              className="w-full h-64"
            >
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="bookings" stroke="var(--color-bookings)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>הכנסות 7 הימים האחרונים</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ revenue: { label: '₪', color: 'hsl(var(--primary))' } }}
              className="w-full h-64"
            >
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>הזמנות ממתינות לאישור</CardTitle>
            <Button asChild variant="outline" size="sm"><Link to="/admin/bookings">ראה הכל</Link></Button>
          </CardHeader>
          <CardContent>
            {pendingQuery.isLoading ? (
              <div>טוען…</div>
            ) : (pendingQuery.data as any[])?.length === 0 ? (
              <div className="text-muted-foreground">אין הזמנות ממתינות</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-right border-b">
                      <th className="py-2">תאריך</th>
                      <th className="py-2">שעה</th>
                      <th className="py-2">חדר</th>
                      <th className="py-2">לקוח</th>
                      <th className="py-2">טלפון</th>
                      <th className="py-2">מחיר (₪)</th>
                      <th className="py-2">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(pendingQuery.data) ? pendingQuery.data : []).map((b: any) => (
                      <tr key={b.id} className="border-b">
                        <td className="py-2 ltr-numbers">{b.booking_date}</td>
                        <td className="py-2 ltr-numbers">{b.start_time}</td>
                        <td className="py-2">{roomsQuery.data?.[b.room_id] || b.room_id}</td>
                        <td className="py-2">{b.customer_name}</td>
                        <td className="py-2 ltr-numbers">{b.customer_phone}</td>
                        <td className="py-2 ltr-numbers">{Number(b.price_total)}</td>
                        <td className="py-2">
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => approve(b)} className="flex items-center gap-1"><Check className="w-4 h-4" /> אשר</Button>
                            <Button size="sm" variant="outline" onClick={() => cancel(b)} className="flex items-center gap-1"><X className="w-4 h-4" /> בטל</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default AdminDashboard;
