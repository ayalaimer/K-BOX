import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { format, addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { logInfo, logError, logWarn } from "@/lib/logging";

interface BookingRow {
  id: string;
  booking_date: string;
  start_time: string;
  duration_hours: number;
  status: 'pending' | 'approved' | 'completed' | 'cancelled' | 'waitlisted';
  price_total: number;
  room_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  booking_code?: string | null;
  guest_count?: number | null;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'completed' | 'cancelled' | 'waitlisted';

const BookingsAdmin = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<'date' | 'open'>('date');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [status, setStatus] = useState<FilterStatus>('all');
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);
  const [rangeStart, setRangeStart] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [rangeEnd, setRangeEnd] = useState<string>(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const roomsQuery = useQuery({
    queryKey: ['rooms-map'],
    queryFn: async () => {
      const { data } = await supabase.from('rooms').select('id, name');
      return Object.fromEntries((data || []).map((r: any) => [r.id, r.name])) as Record<string, string>;
    }
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const bookingsQuery = useQuery({
    queryKey: ['admin-bookings', { date, status, page, pageSize }],
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        .select('id, booking_date, start_time, duration_hours, status, price_total, room_id, customer_name, customer_phone, customer_email, booking_code, guest_count', { count: 'exact' })
        .eq('booking_date', date)
        .order('start_time');
      if (status !== 'all') query = query.eq('status', status);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await query.range(from, to);
      if (error) throw error;
      return { rows: (data || []) as BookingRow[], count: count || 0 };
    }
  });

const rooms = roomsQuery.data || {};

  const openBookingsQuery = useQuery({
    queryKey: ['admin-open-bookings', { rangeStart, rangeEnd, roomFilter }],
    enabled: tab === 'open',
    queryFn: async () => {
      let q = supabase
        .from('bookings')
        .select('id, booking_date, start_time, duration_hours, status, price_total, room_id, customer_name, customer_phone, customer_email, booking_code, guest_count')
        .eq('status', 'pending')
        .gte('booking_date', rangeStart)
        .lte('booking_date', rangeEnd)
        .order('booking_date')
        .order('start_time');
      if (roomFilter !== 'all') q = q.eq('room_id', roomFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as BookingRow[];
    }
  });

  async function sendConfirmation(b: BookingRow, statusToSend: BookingRow['status']) {
    if (!b.customer_email) return;
    const { error: fnErr } = await supabase.functions.invoke('send-booking-confirmation', {
      body: {
        to: b.customer_email,
        status: statusToSend,
        booking: {
          booking_code: b.booking_code,
          booking_date: b.booking_date,
          start_time: b.start_time,
          duration_hours: b.duration_hours,
          room_id: b.room_id,
          customer_name: b.customer_name,
          customer_phone: b.customer_phone,
          price_total: b.price_total,
          guest_count: b.guest_count ?? null,
        }
      }
    });
    if (fnErr) {
      await logWarn('Admin email send failed', { component: 'BookingsAdmin', context: { booking_id: b.id, status: statusToSend, message: (fnErr as any)?.message } });
    } else {
      await logInfo('Admin email sent', { component: 'BookingsAdmin', context: { booking_id: b.id, status: statusToSend } });
    }
  }

  async function updateStatus(b: BookingRow, newStatus: BookingRow['status']) {
    try {
      const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', b.id);
      if (error) throw error;
      toast({ title: 'עודכן', description: `סטטוס עודכן ל-${newStatus}` });
      await logInfo('Admin updated booking status', { component: 'BookingsAdmin', context: { booking_id: b.id, from: b.status, to: newStatus } });
      bookingsQuery.refetch();
      // send confirmation on certain statuses
      if (['approved', 'cancelled', 'waitlisted'].includes(newStatus)) {
        await sendConfirmation(b, newStatus);
      }
    } catch (e: any) {
      await logError('Admin update status failed', { component: 'BookingsAdmin', context: { booking_id: b.id, to: newStatus, message: e?.message } });
      toast({ title: 'שגיאה', description: e.message || 'בעיה בעדכון סטטוס', variant: 'destructive' });
    }
  }

function openNote(b: BookingRow) {
  setSelectedBooking(b);
  setNoteText('');
  setNoteOpen(true);
}

async function saveNote() {
  if (!selectedBooking || !noteText.trim()) {
    setNoteOpen(false);
    return;
  }
  try {
    const { error } = await supabase.from('booking_notes').insert({ booking_id: selectedBooking.id, note: noteText.trim() });
    if (error) throw error;
    toast({ title: 'נשמר', description: 'הערה נוספה להזמנה' });
    await logInfo('Admin added booking note', { component: 'BookingsAdmin', context: { booking_id: selectedBooking.id } });
    setNoteOpen(false);
    setNoteText('');
    setSelectedBooking(null);
  } catch (e: any) {
    await logError('Admin add note failed', { component: 'BookingsAdmin', context: { booking_id: selectedBooking?.id, message: e?.message } });
    toast({ title: 'שגיאה', description: e.message || 'הוספת הערה נכשלה', variant: 'destructive' });
  }
}

  return (
    <div className="container mx-auto px-2 md:px-4">
      <Helmet>
        <title>ניהול הזמנות | K-Box</title>
        <meta name="description" content="צפייה, סינון ועדכון סטטוס הזמנות" />
        <link rel="canonical" href={`${window.location.origin}/admin/bookings`} />
      </Helmet>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'date' | 'open')} dir="rtl">
        <TabsList className="mb-4">
          <TabsTrigger value="date">לפי תאריך</TabsTrigger>
          <TabsTrigger value="open">הזמנות פתוחות</TabsTrigger>
        </TabsList>

        <TabsContent value="date">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>סינון</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-3">
              <div>
                <Label>תאריך</Label>
                <Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setPage(1); }} className="ltr-numbers" />
              </div>
              <div>
                <Label>סטטוס</Label>
                <select className="border rounded px-2 py-2 bg-background" value={status} onChange={(e) => { setStatus(e.target.value as FilterStatus); setPage(1); }}>
                  <option value="all">הכל</option>
                  <option value="pending">ממתין</option>
                  <option value="approved">מאושר</option>
                  <option value="completed">הושלם</option>
                  <option value="cancelled">בוטל</option>
                  <option value="waitlisted">המתנה</option>
                </select>
              </div>
              <div>
                <Label>לכל עמוד</Label>
                <select className="border rounded px-2 py-2 bg-background" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                  {[10,25,50,100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <Button onClick={() => { setPage(1); bookingsQuery.refetch(); }}>רענון</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>הזמנות לתאריך {date}</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">עמוד {page} מתוך {Math.max(1, Math.ceil((bookingsQuery.data?.count || 0) / pageSize))}</span>
                <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>הקודם</Button>
                <Button size="sm" onClick={() => setPage(p => Math.min(Math.max(1, Math.ceil((bookingsQuery.data?.count || 0) / pageSize)), p + 1))} disabled={page >= Math.max(1, Math.ceil((bookingsQuery.data?.count || 0) / pageSize))}>הבא</Button>
              </div>
            </CardHeader>
            <CardContent>
              {bookingsQuery.isLoading ? (
                <div>טוען…</div>
              ) : (bookingsQuery.data?.rows?.length || 0) === 0 ? (
                <div className="text-muted-foreground">אין הזמנות לתאריך זה</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-right border-b">
                        <th className="py-2">שעה</th>
                        <th className="py-2">משך</th>
                        <th className="py-2">חדר</th>
                        <th className="py-2">לקוח</th>
                        <th className="py-2">טלפון</th>
                        <th className="py-2">מייל</th>
                        <th className="py-2">סטטוס</th>
                        <th className="py-2">מחיר (₪)</th>
                        <th className="py-2">פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingsQuery.data!.rows.map((b) => (
                        <tr key={b.id} className="border-b">
                          <td className="py-2 ltr-numbers">{b.start_time}</td>
                          <td className="py-2">{b.duration_hours}ש׳</td>
                          <td className="py-2">{rooms[b.room_id] || b.room_id}</td>
                          <td className="py-2">{b.customer_name}</td>
                          <td className="py-2 ltr-numbers">{b.customer_phone}</td>
                          <td className="py-2">{b.customer_email || '-'}</td>
                          <td className="py-2">{b.status}</td>
                          <td className="py-2 ltr-numbers">{Number(b.price_total)}</td>
                          <td className="py-2">
                            <div className="flex flex-wrap gap-2">
                              {b.status === 'pending' && (
                                <>
                                  <Button size="sm" onClick={() => updateStatus(b, 'approved')}>אשר</Button>
                                  <Button size="sm" variant="secondary" onClick={() => updateStatus(b, 'waitlisted')}>העבר להמתנה</Button>
                                  <Button size="sm" variant="outline" onClick={() => updateStatus(b, 'cancelled')}>בטל</Button>
                                </>
                              )}
                              {b.status === 'approved' && (
                                <>
                                  <Button size="sm" onClick={() => updateStatus(b, 'completed')}>הושלם</Button>
                                  <Button size="sm" variant="outline" onClick={() => updateStatus(b, 'cancelled')}>בטל</Button>
                                </>
                              )}
                              <Button size="sm" variant="secondary" onClick={() => openNote(b)}>הוסף הערה</Button>
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
        </TabsContent>

        <TabsContent value="open">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>סינון הזמנות פתוחות</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-3">
              <div>
                <Label>מתאריך</Label>
                <Input type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} className="ltr-numbers" />
              </div>
              <div>
                <Label>עד תאריך</Label>
                <Input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} className="ltr-numbers" />
              </div>
              <div>
                <Label>חדר</Label>
                <select className="border rounded px-2 py-2 bg-background min-w-[180px]" value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}>
                  <option value="all">כל החדרים</option>
                  {Object.entries(rooms).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-[220px]">
                <Label>חיפוש</Label>
                <Input placeholder="שם / טלפון / מייל" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Button onClick={() => openBookingsQuery.refetch()}>רענון</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>הזמנות פתוחות ({rangeStart} – {rangeEnd})</CardTitle>
            </CardHeader>
            <CardContent>
              {openBookingsQuery.isLoading ? (
                <div>טוען…</div>
              ) : (openBookingsQuery.data?.length || 0) === 0 ? (
                <div className="text-muted-foreground">אין הזמנות פתוחות בטווח שנבחר</div>
              ) : (
                (() => {
                  const filtered = (openBookingsQuery.data || []).filter((b) => {
                    const q = search.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      b.customer_name.toLowerCase().includes(q) ||
                      (b.customer_phone || '').toLowerCase().includes(q) ||
                      (b.customer_email || '').toLowerCase().includes(q)
                    );
                  });
                  const groups = filtered.reduce((acc: Record<string, BookingRow[]>, b) => {
                    (acc[b.booking_date] ||= []).push(b);
                    return acc;
                  }, {});
                  const dates = Object.keys(groups).sort();
                  return (
                    <div className="space-y-6">
                      {dates.map((d) => (
                        <div key={d}>
                          <h3 className="text-xl font-semibold mb-2">{d}</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-right border-b">
                                  <th className="py-2">שעה</th>
                                  <th className="py-2">משך</th>
                                  <th className="py-2">חדר</th>
                                  <th className="py-2">לקוח</th>
                                  <th className="py-2">טלפון</th>
                                  <th className="py-2">מייל</th>
                                  <th className="py-2">מחיר (₪)</th>
                                  <th className="py-2">פעולות</th>
                                </tr>
                              </thead>
                              <tbody>
                                {groups[d].map((b) => (
                                  <tr key={b.id} className="border-b">
                                    <td className="py-2 ltr-numbers">{b.start_time}</td>
                                    <td className="py-2">{b.duration_hours}ש׳</td>
                                    <td className="py-2">{rooms[b.room_id] || b.room_id}</td>
                                    <td className="py-2">{b.customer_name}</td>
                                    <td className="py-2 ltr-numbers">{b.customer_phone}</td>
                                    <td className="py-2">{b.customer_email || '-'}</td>
                                    <td className="py-2 ltr-numbers">{Number(b.price_total)}</td>
                                    <td className="py-2">
                                      <div className="flex flex-wrap gap-2">
                                        <Button size="sm" onClick={() => updateStatus(b, 'approved')}>אשר</Button>
                                        <Button size="sm" variant="secondary" onClick={() => updateStatus(b, 'waitlisted')}>העבר להמתנה</Button>
                                        <Button size="sm" variant="outline" onClick={() => updateStatus(b, 'cancelled')}>בטל</Button>
                                        <Button size="sm" variant="secondary" onClick={() => openNote(b)}>הוסף הערה</Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוספת הערת מנהל</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>הערה</Label>
            <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={4} placeholder="פרטי הערה פנימית" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteOpen(false)}>ביטול</Button>
            <Button onClick={saveNote} disabled={!noteText.trim()}>שמור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsAdmin;
