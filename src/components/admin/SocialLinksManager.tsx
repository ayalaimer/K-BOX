
import { useState, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

type Row = {
  id?: string;
  platform: string;
  label?: string | null;
  url: string;
  icon_name?: string | null;
  order_index: number;
  enabled: boolean;
};

export default function SocialLinksManager() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Row>({
    platform: "",
    label: "",
    url: "",
    icon_name: "",
    order_index: 0,
    enabled: true,
  });

  const listQ = useQuery({
    queryKey: ["social-links-admin"],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await (supabase as any)
        .from("business_social_links")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return (data || []) as Row[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (payload: Row) => {
      if (payload.id) {
        const { error } = await (supabase as any)
          .from("business_social_links")
          .update({
            platform: payload.platform,
            label: payload.label || null,
            url: payload.url,
            icon_name: payload.icon_name || null,
            order_index: payload.order_index ?? 0,
            enabled: payload.enabled,
          })
          .eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("business_social_links")
          .insert({
            platform: payload.platform,
            label: payload.label || null,
            url: payload.url,
            icon_name: payload.icon_name || null,
            order_index: payload.order_index ?? 0,
            enabled: payload.enabled,
          });
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      toast({ title: "נשמר", description: "הרשת החברתית עודכנה" });
      await qc.invalidateQueries({ queryKey: ["social-links-admin"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("business_social_links")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast({ title: "נמחק", description: "הקישור הוסר" });
      await qc.invalidateQueries({ queryKey: ["social-links-admin"] });
    },
  });

  const sorted = useMemo(() => listQ.data || [], [listQ.data]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>קישורים חברתיים</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <div>
            <Label>פלטפורמה</Label>
            <Input
              placeholder="facebook / instagram / waze / youtube / custom"
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
            />
          </div>
          <div>
            <Label>תווית</Label>
            <Input
              placeholder="Facebook / אינסטגרם / וואז"
              value={form.label || ""}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label>URL</Label>
            <Input
              placeholder="https://..."
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </div>
          <div>
            <Label>Icon (lucide)</Label>
            <Input
              placeholder="facebook / instagram / navigation / external-link"
              value={form.icon_name || ""}
              onChange={(e) => setForm({ ...form, icon_name: e.target.value })}
            />
          </div>
          <div>
            <Label>סדר</Label>
            <Input
              type="number"
              value={form.order_index}
              onChange={(e) =>
                setForm({ ...form, order_index: Number(e.target.value) })
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.enabled}
              onCheckedChange={(v) => setForm({ ...form, enabled: v })}
            />
            <span className="text-sm">פעיל</span>
          </div>
          <div className="md:col-span-6">
            <Button
              onClick={() => upsertMutation.mutate(form)}
              disabled={!form.platform || !form.url}
            >
              הוסף קישור
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right border-b">
                <th className="py-2">פלטפורמה</th>
                <th className="py-2">תווית</th>
                <th className="py-2">URL</th>
                <th className="py-2">Icon</th>
                <th className="py-2">סדר</th>
                <th className="py-2">פעיל</th>
                <th className="py-2">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="py-2">{row.platform}</td>
                  <td className="py-2">{row.label || "-"}</td>
                  <td className="py-2 truncate max-w-[260px]">
                    <a
                      className="text-primary hover:underline"
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {row.url}
                    </a>
                  </td>
                  <td className="py-2">{row.icon_name || "-"}</td>
                  <td className="py-2">{row.order_index ?? 0}</td>
                  <td className="py-2">{row.enabled ? "כן" : "לא"}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          upsertMutation.mutate({
                            ...row,
                            enabled: !row.enabled,
                          })
                        }
                      >
                        {row.enabled ? "השבת" : "הפעל"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => row.id && deleteMutation.mutate(row.id)}
                      >
                        מחיקה
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td className="py-3 text-muted-foreground" colSpan={7}>
                    אין קישורים עדיין
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
