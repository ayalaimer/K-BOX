import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Slider } from "@/components/ui/slider";

function formatDateISO(d: Date) {
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

const ALL_STATUSES = ['approved','completed','pending','cancelled'] as const;
type BookingStatus = typeof ALL_STATUSES[number];

const AdminAnalytics = () => {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [status, setStatus] = useState<Array<'pending'|'approved'|'cancelled'|'completed'>>(["approved", "completed"]);
  const [hourRange, setHourRange] = useState<[number, number]>([0, 23]);

  const roomsQuery = useQuery({
    queryKey: ['rooms-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('id, name, is_active');
      if (error) throw error;
      return (data || []).filter((r: any) => r.is_active !== false);
    }
  });

  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  useEffect(() => {
    if (roomsQuery.data && roomsQuery.data.length && selectedRooms.length === 0) {
      setSelectedRooms((roomsQuery.data as any[]).map((r) => r.id));
    }
  }, [roomsQuery.data]);

  const range = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const from = formatDateISO(startOfMonth(new Date(y, (m - 1), 1)));
    const to = formatDateISO(endOfMonth(new Date(y, (m - 1), 1)));
    return { from, to };
  }, [month]);

  const bookingsQuery = useQuery({
    queryKey: ['analytics-bookings', range, status.join(','), selectedRooms.join(',')],
    queryFn: async () => {
      let q = supabase
        .from('bookings')
        .select('booking_date, price_total, status, start_time, duration_hours, room_id')
        .gte('booking_date', range.from)
        .lte('booking_date', range.to)
        .in('status', status);
      if (selectedRooms.length) {
        q = q.in('room_id', selectedRooms as any);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    }
  });

  const byDay = useMemo(() => {
    const map: Record<string, { date: string; orders: number; revenue: number } > = {};
    const d = new Date(range.from);
    const end = new Date(range.to);
    while (d <= end) {
      const key = formatDateISO(d);
      map[key] = { date: key.slice(8,10), orders: 0, revenue: 0 };
      d.setDate(d.getDate() + 1);
    }
    (bookingsQuery.data || []).forEach((b: any) => {
      const key = b.booking_date;
      if (!map[key]) return;
      map[key].orders += 1;
      map[key].revenue += Number(b.price_total || 0);
    });
    return Object.values(map);
  }, [bookingsQuery.data, range]);

  const occupancyByHour = useMemo(() => {
    const counts = Array.from({ length: 24 }, (_, h) => ({ hour: h, label: String(h).padStart(2, '0'), count: 0 }));
    (bookingsQuery.data || []).forEach((b: any) => {
      const startH = Number(String(b.start_time || '0').split(':')[0]);
      const dur = Number(b.duration_hours || 0);
      const endH = Math.min(23, startH + dur - 1);
      for (let h = startH; h <= endH; h++) {
        if (h >= hourRange[0] && h <= hourRange[1]) {
          counts[h].count += 1;
        }
      }
    });
    return counts.slice(hourRange[0], hourRange[1] + 1);
  }, [bookingsQuery.data, hourRange]);

  const hoursPerRoom = useMemo(() => {
    const map: Record<string, number> = {};
    (bookingsQuery.data || []).forEach((b: any) => {
      if (!b.room_id) return;
      map[b.room_id] = (map[b.room_id] || 0) + Number(b.duration_hours || 0);
    });
    const roomsIndex: Record<string, string> = Object.fromEntries((roomsQuery.data || []).map((r: any) => [r.id, r.name]));
    return Object.entries(map).map(([roomId, value]) => ({ name: roomsIndex[roomId] || 'חדר', value }));
  }, [bookingsQuery.data, roomsQuery.data]);

  const totals = useMemo(() => {
    const rows = bookingsQuery.data || [];
    const orders = rows.length;
    const revenue = rows.reduce((sum: number, b: any) => sum + (['approved','completed'].includes(b.status) ? Number(b.price_total || 0) : 0), 0);
    return { orders, revenue };
  }, [bookingsQuery.data]);

  return (
    <div className="container mx-auto px-2 md:px-4">
      <Helmet>
        <title>אנליטיקות אדמין | K-Box</title>
        <meta name="description" content="דוחות חודשיים של הזמנות והכנסות" />
        <link rel="canonical" href={`${window.location.origin}/admin/analytics`} />
      </Helmet>

      <header className="mb-6">
        <h1 className="text-3xl font-bold">אנליטיקות</h1>
        <p className="text-muted-foreground">דוחות חודשיים מפורטים</p>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>פילטרים</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-sm block mb-1">חודש</label>
            <input type="month" className="border rounded px-2 py-1 ltr-numbers bg-background" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {ALL_STATUSES.map((s) => (
              <Button key={s} variant={status.includes(s) ? 'default' : 'outline'} size="sm" onClick={() => setStatus((prev) => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s])}>
                {s}
              </Button>
            ))}
          </div>
          <div className="min-w-[220px]">
            <label className="text-sm block mb-1">חדרים</label>
            <div className="flex flex-wrap gap-2">
              {roomsQuery.data?.map((r: any) => (
                <Button
                  key={r.id}
                  size="sm"
                  variant={selectedRooms.includes(r.id) ? 'default' : 'outline'}
                  onClick={() =>
                    setSelectedRooms((prev) => prev.includes(r.id) ? prev.filter((id) => id !== r.id) : [...prev, r.id])
                  }
                >
                  {r.name}
                </Button>
              ))}
              {!!roomsQuery.data?.length && (
                <Button size="sm" variant="secondary" onClick={() => setSelectedRooms((roomsQuery.data as any[]).map((r) => r.id))}>בחר הכל</Button>
              )}
            </div>
          </div>
          <div className="min-w-[220px]">
            <label className="text-sm block mb-1">טווח שעות: {hourRange[0]}–{hourRange[1]}</label>
            <div className="px-2 py-3">
              <Slider min={0} max={23} step={1} value={hourRange as any} onValueChange={(v: any) => setHourRange([v[0], v[1]])} />
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => bookingsQuery.refetch()}>רענון</Button>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>סה"כ הזמנות בחודש</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold ltr-numbers">{bookingsQuery.isLoading ? '…' : totals.orders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>סה"כ הכנסות בחודש</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold ltr-numbers">₪{bookingsQuery.isLoading ? '…' : totals.revenue}</div>
          </CardContent>
        </Card>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>הזמנות ביום</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ orders: { label: 'הזמנות', color: 'hsl(var(--primary))' } }}>
              <LineChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="orders" stroke="var(--color-orders)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>הכנסות ביום (₪)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ revenue: { label: 'הכנסות', color: 'hsl(var(--primary))' } }}>
              <BarChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>תפוסה לפי שעה</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ count: { label: 'מס׳ הזמנות', color: 'hsl(var(--primary))' } }}>
              <BarChart data={occupancyByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>שעות שהוזמנו לפי חדר</CardTitle>
          </CardHeader>
          <CardContent>
            {hoursPerRoom.length === 0 ? (
              <div className="text-muted-foreground">אין נתונים</div>
            ) : (
              <ChartContainer config={{ value: { label: 'שעות', color: 'hsl(var(--primary))' } }}>
                <PieChart>
                  <Pie data={hoursPerRoom} dataKey="value" nameKey="name" outerRadius={100}>
                    {hoursPerRoom.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${0.4 + (index % 5) * 0.12})`} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
