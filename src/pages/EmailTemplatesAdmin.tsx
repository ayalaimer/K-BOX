import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface TemplateRow {
  id: string;
  status: string;
  language: string;
  subject: string;
  body_html: string;
  enabled: boolean;
}

const EmailTemplatesAdmin = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TemplateRow | null>(null);
  const [form, setForm] = useState<Partial<TemplateRow>>({ language: 'he', enabled: true });

  const listQuery = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_email_templates')
        .select('*')
        .order('status', { ascending: true })
        .order('language', { ascending: true });
      if (error) throw error;
      return (data || []) as TemplateRow[];
    }
  });

  const upsertMutation = useMutation({
    mutationFn: async (payload: Partial<TemplateRow>) => {
      if (editing) {
        const { error } = await supabase
          .from('booking_email_templates')
          .update({
            status: payload.status,
            language: payload.language,
            subject: payload.subject,
            body_html: payload.body_html,
            enabled: payload.enabled,
          })
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('booking_email_templates')
          .insert({
            status: payload.status,
            language: payload.language || 'he',
            subject: payload.subject,
            body_html: payload.body_html,
            enabled: payload.enabled ?? true,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-templates'] });
      setOpen(false);
      setEditing(null);
      setForm({ language: 'he', enabled: true });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (row: TemplateRow) => {
      const { error } = await supabase.from('booking_email_templates').delete().eq('id', row.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['email-templates'] })
  });

  function startNew() {
    setEditing(null);
    setForm({ language: 'he', enabled: true });
    setOpen(true);
  }

  function startEdit(row: TemplateRow) {
    setEditing(row);
    setForm(row);
    setOpen(true);
  }

  return (
    <div className="container mx-auto px-2 md:px-4">
      <Helmet>
        <title>ניהול טמפלטי מייל | K-Box</title>
        <meta name="robots" content="noindex" />
        <meta name="description" content="יצירה ועריכה של טקסטי מייל לפי סטטוס הזמנה" />
        <link rel="canonical" href={`${window.location.origin}/admin/email-templates`} />
      </Helmet>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>טמפלטי מייל להזמנות</CardTitle>
          <Button onClick={startNew}>+ חדש</Button>
        </CardHeader>
        <CardContent>
          {listQuery.isLoading ? (
            <div>טוען…</div>
          ) : (listQuery.data || []).length === 0 ? (
            <div className="text-muted-foreground">אין טמפלטים עדיין</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-right border-b">
                    <th className="py-2">סטטוס</th>
                    <th className="py-2">שפה</th>
                    <th className="py-2">נושא</th>
                    <th className="py-2">פעיל</th>
                    <th className="py-2">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {(listQuery.data || []).map((row) => (
                    <tr key={row.id} className="border-b">
                      <td className="py-2">{row.status}</td>
                      <td className="py-2">{row.language}</td>
                      <td className="py-2">{row.subject}</td>
                      <td className="py-2">
                        <Switch checked={row.enabled} onCheckedChange={(v) => upsertMutation.mutate({ ...row, enabled: v })} />
                      </td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => startEdit(row)}>ערוך</Button>
                          <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(row)}>מחק</Button>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{editing ? 'עריכת טמפלט' : 'טמפלט חדש'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>סטטוס</Label>
              <Input value={form.status || ''} onChange={(e) => setForm({ ...form, status: e.target.value })} placeholder="approved / cancelled / custom" />
            </div>
            <div>
              <Label>שפה</Label>
              <select className="border rounded px-2 py-2 bg-background w-full" value={form.language || 'he'} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                <option value="he">עברית</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Label>נושא</Label>
              <Input value={form.subject || ''} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>תוכן HTML (עם משתנים)</Label>
              <Textarea rows={10} value={form.body_html || ''} onChange={(e) => setForm({ ...form, body_html: e.target.value })} placeholder="Hello {{customer_name}}, הזמנתך ל-{{booking_date}} אושרה" />
              <p className="text-xs text-muted-foreground mt-1">משתנים נתמכים: {'{{customer_name}}'}, {'{{booking_date}}'}, {'{{start_time}}'}, {'{{duration_hours}}'}, {'{{price_total}}'}, {'{{booking_code}}'}, {'{{business.name}}'}, {'{{business.phone}}'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
            <Button onClick={() => upsertMutation.mutate(form)}>שמור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplatesAdmin;
