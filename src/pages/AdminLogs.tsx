import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const LEVELS = ["info","warn","error"] as const;

type Level = typeof LEVELS[number];

const AdminLogs = () => {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<Level | "all">("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [excludePreviewNoise, setExcludePreviewNoise] = useState<boolean>(true);

  const logsQuery = useQuery({
    queryKey: ['app-logs', { level, search, fromDate, toDate, page, pageSize, excludePreviewNoise }],
    queryFn: async () => {
      let q = supabase
        .from('app_logs')
        .select('*', { count: 'exact' })
        .order('occurred_at', { ascending: false });

      if (level !== 'all') q = q.eq('level', level);

      if (fromDate) {
        q = q.gte('occurred_at', `${fromDate}T00:00:00`);
      }
      if (toDate) {
        q = q.lte('occurred_at', `${toDate}T23:59:59`);
      }

      if (search.trim()) {
        const s = `%${search.trim()}%`;
        q = q.or(`message.ilike.${s},route.ilike.${s},component.ilike.${s}`);
      }

      if (excludePreviewNoise) {
        q = q
          .not('context->>filename', 'ilike', '%cdn.gpteng.co/lovable.js%')
          .not('message', 'ilike', '%MutationRecord%');
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      q = q.range(from, to);

      const { data, error, count } = await q;
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    }
  });

  const logs = logsQuery.data?.data || [];
  const total = logsQuery.data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="container mx-auto px-2 md:px-4">
      <Helmet>
        <title>לוגים | K-Box Admin</title>
        <meta name="description" content="תצוגת לוגים לאיתור תקלות" />
        <link rel="canonical" href={`${window.location.origin}/admin/logs`} />
      </Helmet>

      <header className="mb-6">
        <h1 className="text-3xl font-bold">לוגים</h1>
        <p className="text-muted-foreground">אירועים ושגיאות מהאפליקציה</p>
      </header>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>סינון</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-sm block mb-1">חיפוש</label>
            <input className="border rounded px-2 py-1 bg-background" placeholder="טקסט לחיפוש" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div>
            <label className="text-sm block mb-1">רמה</label>
            <select className="border rounded px-2 py-1 bg-background" value={level} onChange={(e) => { setLevel(e.target.value as any); setPage(1); }}>
              <option value="all">הכל</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm block mb-1">מתאריך</label>
            <input type="date" className="border rounded px-2 py-1 bg-background ltr-numbers" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} />
          </div>
          <div>
            <label className="text-sm block mb-1">עד תאריך</label>
            <input type="date" className="border rounded px-2 py-1 bg-background ltr-numbers" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} />
          </div>
          <div>
            <label className="text-sm block mb-1">לכל עמוד</label>
            <select className="border rounded px-2 py-1 bg-background" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
              {[25,50,100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input id="exclude-preview-noise" type="checkbox" className="accent-current" checked={excludePreviewNoise} onChange={(e) => { setExcludePreviewNoise(e.target.checked); setPage(1); }} />
            <label htmlFor="exclude-preview-noise" className="text-sm select-none">הסתר שגיאות סביבת תצוגה</label>
          </div>
          <Button variant="secondary" size="sm" onClick={() => logsQuery.refetch()}>רענון</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>רשומות</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">עמוד {page} מתוך {totalPages}</span>
            <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>הקודם</Button>
            <Button size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>הבא</Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {logsQuery.isLoading ? (
            <div>טוען…</div>
          ) : logs.length === 0 ? (
            <div className="text-muted-foreground">אין נתונים</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right border-b">
                  <th className="py-2">זמן</th>
                  <th className="py-2">רמה</th>
                  <th className="py-2">הודעה</th>
                  <th className="py-2">מסך</th>
                  <th className="py-2">קומפוננטה</th>
                  <th className="py-2">מקור</th>
                  <th className="py-2">פרטים</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l: any) => (
                  <tr key={l.id} className="border-b align-top">
                    <td className="py-2 ltr-numbers whitespace-nowrap">{new Date(l.occurred_at).toLocaleString()}</td>
                    <td className="py-2">{l.level}</td>
                    <td className="py-2 max-w-[420px] truncate" title={l.message}>{l.message}</td>
                    <td className="py-2">{l.route || '-'}</td>
                    <td className="py-2">{l.component || '-'}</td>
                    <td className="py-2">{l.source}</td>
                    <td className="py-2">
                      {l.context ? (
                        <details>
                          <summary className="cursor-pointer">הצג</summary>
                          <pre className="text-xs whitespace-pre-wrap mt-2">{JSON.stringify(l.context, null, 2)}</pre>
                        </details>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogs;
