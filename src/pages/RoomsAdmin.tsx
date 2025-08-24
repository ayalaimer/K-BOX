import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";

interface Room {
  id: string;
  name: string;
  capacity: number;
  is_active: boolean;
  description?: string | null;
  image_url?: string | null;
}

const RoomsAdmin = () => {
  const { toast } = useToast();
  const [newRoom, setNewRoom] = useState({ name: "", capacity: 4, is_active: true });
  const [drafts, setDrafts] = useState<Record<string, Partial<Room>>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const roomsQuery = useQuery({
    queryKey: ["admin-rooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("id, name, capacity, is_active, description, image_url");
      if (error) throw error;
      return (data || []) as Room[];
    },
  });

  const refresh = () => roomsQuery.refetch();

  useEffect(() => {
    const map: Record<string, Partial<Room>> = {};
    (roomsQuery.data || []).forEach((r) => (map[r.id] = {}));
    setDrafts(map);
  }, [roomsQuery.data]);

  const handleCreate = async () => {
    try {
      const { error } = await supabase.from("rooms").insert({
        name: newRoom.name,
        capacity: Number(newRoom.capacity),
        price_per_hour: 0, // Default value since field is required
        is_active: newRoom.is_active,
      });
      if (error) throw error;
      toast({ title: "חדר נוצר", description: `"${newRoom.name}" נוסף בהצלחה` });
      setNewRoom({ name: "", capacity: 4, is_active: true });
      refresh();
    } catch (e: any) {
      toast({ title: "שגיאה", description: e.message || "נכשלה יצירת חדר", variant: "destructive" });
    }
  };

  const handleUpdate = async (room: Room) => {
    try {
      const draft = drafts[room.id] || {};
      const payload = {
        name: draft.name ?? room.name,
        capacity: Number(draft.capacity ?? room.capacity),
        is_active: draft.is_active ?? room.is_active,
        description: draft.description ?? room.description ?? null,
        image_url: draft.image_url ?? room.image_url ?? null,
      };
      const { error } = await supabase
        .from("rooms")
        .update(payload)
        .eq("id", room.id);
      if (error) throw error;
      toast({ title: "עודכן", description: `חדר "${payload.name}" עודכן` });
      setDrafts((prev) => ({ ...prev, [room.id]: {} }));
      refresh();
    } catch (e: any) {
      toast({ title: "שגיאה", description: e.message || "עדכון נכשל", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("rooms").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "נמחק", description: "החדר הוסר" });
      refresh();
    } catch (e: any) {
      toast({ title: "שגיאה", description: e.message || "מחיקה נכשלה", variant: "destructive" });
    }
  };

  const handleUpload = async (room: Room, file: File) => {
    try {
      setUploadingId(room.id);
      const path = `${room.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('room-images').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('room-images').getPublicUrl(path);
      const publicUrl = pub.publicUrl;
      const { error } = await supabase.from('rooms').update({ image_url: publicUrl }).eq('id', room.id);
      if (error) throw error;
      toast({ title: 'תמונה הועלתה', description: 'תמונת החדר עודכנה' });
      refresh();
    } catch (e: any) {
      toast({ title: 'שגיאת העלאה', description: e.message || 'נכשלה העלאת תמונה', variant: 'destructive' });
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="container mx-auto px-2 md:px-4">
      <Helmet>
        <title>ניהול חדרים | K-Box</title>
        <meta name="description" content="ניהול חדרים, תמונות ותיאורים" />
        <link rel="canonical" href={`${window.location.origin}/admin/rooms`} />
      </Helmet>

      <header className="mb-6">
        <h1 className="text-3xl font-bold">ניהול חדרים</h1>
        <p className="text-muted-foreground">יצירה, עדכון, תמונות ותיאורים</p>
      </header>

      {/* Create new */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>הוספת חדר</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <Label>שם</Label>
            <Input value={newRoom.name} onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} />
          </div>
          <div>
            <Label>קיבולת</Label>
            <Input type="number" className="ltr-numbers" value={newRoom.capacity} onChange={(e) => setNewRoom({ ...newRoom, capacity: Number(e.target.value) })} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={newRoom.is_active} onCheckedChange={(v) => setNewRoom({ ...newRoom, is_active: v })} />
            <Label className="mt-0">פעיל</Label>
          </div>
          <Button onClick={handleCreate} disabled={!newRoom.name}>שמור</Button>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>חדרים קיימים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {roomsQuery.isLoading && <div>טוען…</div>}
          {!roomsQuery.isLoading && roomsQuery.data?.length === 0 && <div className="text-muted-foreground">אין חדרים</div>}
          {(roomsQuery.data || []).map((room) => {
            const draft = drafts[room.id] || {};
            return (
              <div key={room.id} className="border rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                  <div className="flex items-center gap-3">
                    {room.image_url ? (
                      <img src={room.image_url} alt={`תמונת חדר ${room.name}`} className="h-16 w-16 object-cover rounded" loading="lazy" />
                    ) : (
                      <div className="h-16 w-16 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">ללא תמונה</div>
                    )}
                  </div>
                  <Input value={draft.name ?? room.name} onChange={(e) => setDrafts((prev) => ({ ...prev, [room.id]: { ...prev[room.id], name: e.target.value } }))} />
                  <Input type="number" className="ltr-numbers" value={draft.capacity ?? room.capacity} onChange={(e) => setDrafts((prev) => ({ ...prev, [room.id]: { ...prev[room.id], capacity: Number(e.target.value) } }))} />
                  
                  <div className="flex items-center gap-2">
                    <Switch checked={(draft.is_active ?? room.is_active) as boolean} onCheckedChange={(v) => setDrafts((prev) => ({ ...prev, [room.id]: { ...prev[room.id], is_active: v } }))} />
                    <span className="text-sm text-muted-foreground">פעיל</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => handleUpdate(room)}>עדכן</Button>
                    <Button variant="outline" className="text-destructive" onClick={() => handleDelete(room.id)}>מחק</Button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <Label className="mb-1 block">תיאור</Label>
                    <Textarea
                      value={(draft.description ?? room.description ?? '') as string}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [room.id]: { ...prev[room.id], description: e.target.value } }))}
                      placeholder="תיאור החדר, ציוד, הערות…"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block">תמונת חדר</Label>
                    <Input type="file" accept="image/*" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(room, f);
                    }} />
                    {uploadingId === room.id && <div className="text-xs text-muted-foreground mt-1">מעלה…</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomsAdmin;
