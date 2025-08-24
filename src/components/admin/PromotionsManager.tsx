
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PromotionRow = {
  id?: string;
  title: string;
  description?: string | null;
  regular_price: number;
  discounted_price: number;
  valid_from?: string | null;
  valid_to?: string | null;
  is_active: boolean;
  terms?: string | null;
  created_at?: string;
  updated_at?: string;
  language?: 'he' | 'en';
  included_features?: string[];
};

const emptyForm: PromotionRow = {
  title: "",
  description: "",
  regular_price: 0,
  discounted_price: 0,
  valid_from: "",
  valid_to: "",
  is_active: true,
  terms: "",
  language: "he",
  included_features: [],
};

function numberOrZero(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const PromotionsManager = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<PromotionRow>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [featureInput, setFeatureInput] = useState("");

  const listQ = useQuery({
    queryKey: ["admin-promotions"],
    queryFn: async (): Promise<PromotionRow[]> => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as PromotionRow[];
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!editingId) return;
    const row = (listQ.data || []).find((p) => p.id === editingId);
    if (row) {
      setForm({
        id: row.id,
        title: row.title,
        description: row.description ?? "",
        regular_price: numberOrZero(row.regular_price),
        discounted_price: numberOrZero(row.discounted_price),
        valid_from: row.valid_from ?? "",
        valid_to: row.valid_to ?? "",
        is_active: !!row.is_active,
        terms: row.terms ?? "",
        language: (row.language as 'he' | 'en') ?? 'he',
        included_features: Array.isArray(row.included_features)
          ? (row.included_features as any[]).map(String)
          : [],
      });
    }
  }, [editingId, listQ.data]);

  const upsertMutation = useMutation({
    mutationFn: async (payload: PromotionRow) => {
      const base = {
        title: payload.title.trim(),
        description: (payload.description || "").trim() || null,
        regular_price: 0, // Default value as required by DB
        discounted_price: 0, // Default value as required by DB
        valid_from: payload.valid_from || null,
        valid_to: payload.valid_to || null,
        is_active: !!payload.is_active,
        terms: (payload.terms || "").trim() || null,
        language: (payload.language as string) || 'he',
        included_features: Array.isArray(payload.included_features) ? payload.included_features : [],
      };
      if (payload.id) {
        const { error } = await supabase.from("promotions").update(base).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("promotions").insert(base);
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-promotions"] });
      toast({ title: "נשמר", description: "המבצע נשמר בהצלחה" });
      setEditingId(null);
      setForm(emptyForm);
      setFeatureInput("");
    },
    meta: {
      onError: (err: any) => {
        console.error("[PromotionsManager] upsert error", err);
      },
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promotions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-promotions"] });
      toast({ title: "נמחק", description: "המבצע נמחק" });
      if (editingId) {
        setEditingId(null);
        setForm(emptyForm);
        setFeatureInput("");
      }
    },
    meta: {
      onError: (err: any) => {
        console.error("[PromotionsManager] delete error", err);
      },
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return listQ.data || [];
    return (listQ.data || []).filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
  }, [search, listQ.data]);

  const addFeature = () => {
    const v = featureInput.trim();
    if (!v) return;
    const current = form.included_features || [];
    setForm({ ...form, included_features: [...current, v] });
    setFeatureInput("");
  };

  const removeFeature = (idx: number) => {
    const current = form.included_features || [];
    const next = current.filter((_, i) => i !== idx);
    setForm({ ...form, included_features: next });
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <CardTitle>ניהול מבצעים</CardTitle>
        <div className="flex gap-2">
          <Input placeholder="חיפוש…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-[220px]" />
          <Button
            variant="outline"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setFeatureInput("");
            }}
          >
            מבצע חדש
          </Button>
          <Button onClick={() => listQ.refetch()} variant="secondary">רענון</Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <Label>כותרת</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="שם המבצע"
            />
          </div>
          <div>
            <Label>שפה</Label>
            <Select
              value={form.language || 'he'}
              onValueChange={(v: 'he' | 'en') => setForm({ ...form, language: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר/י שפה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="he">עברית</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label>תיאור</Label>
            <Textarea
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="תיאור קצר של המבצע"
            />
          </div>

          <div>
            <Label>בתוקף מ-</Label>
            <Input
              type="date"
              className="ltr-numbers"
              value={form.valid_from || ""}
              onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
            />
          </div>
          <div>
            <Label>בתוקף עד</Label>
            <Input
              type="date"
              className="ltr-numbers"
              value={form.valid_to || ""}
              onChange={(e) => setForm({ ...form, valid_to: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={!!form.is_active}
              onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              id="active"
            />
            <Label htmlFor="active">פעיל</Label>
          </div>

          <div className="md:col-span-2">
            <Label>מה כלול</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="הוסיפו פריט לרשימה (למשל: עוגה, שתייה...)"
              />
              <Button type="button" onClick={addFeature}>הוסף</Button>
            </div>
            {Array.isArray(form.included_features) && form.included_features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.included_features.map((f, idx) => (
                  <Badge
                    key={`${f}-${idx}`}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <span>{f}</span>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => removeFeature(idx)}
                      aria-label={`הסר ${f}`}
                      title="הסר"
                    >
                      ✕
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <Label>תנאים</Label>
            <Textarea
              value={form.terms || ""}
              onChange={(e) => setForm({ ...form, terms: e.target.value })}
              rows={3}
              placeholder="תנאים והגבלות למבצע"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => upsertMutation.mutate(form)}
              disabled={!form.title.trim()}
            >
              שמור מבצע
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setFeatureInput("");
              }}
            >
              נקה
            </Button>
            {editingId && (
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(editingId)}
              >
                מחק
              </Button>
            )}
          </div>
        </div>

        {/* List */}
        {listQ.isLoading ? (
          <div>טוען…</div>
        ) : (filtered.length === 0) ? (
          <div className="text-muted-foreground">אין מבצעים להצגה</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right border-b">
                  <th className="py-2">כותרת</th>
                  <th className="py-2">תוקף</th>
                  <th className="py-2">שפה</th>
                  <th className="py-2">סטטוס</th>
                  <th className="py-2">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2">{p.title}</td>
                    <td className="py-2">
                      {(p.valid_from || p.valid_to) ? (
                        <span className="ltr-numbers">
                          {p.valid_from || "-"} – {p.valid_to || "-"}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="py-2">{(p.language as 'he' | 'en') || 'he'}</td>
                    <td className="py-2">
                      {p.is_active ? <span className="text-green-600">פעיל</span> : <span className="text-muted-foreground">מושבת</span>}
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => setEditingId(p.id!)}>ערוך</Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => upsertMutation.mutate({ ...(p as PromotionRow), is_active: !p.is_active })}
                        >
                          {p.is_active ? "השבת" : "הפעל"}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(p.id!)}>מחק</Button>
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
  );
};

export default PromotionsManager;
