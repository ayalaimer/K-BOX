import { useState, useEffect } from 'react';
import { Plus, Download, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/blog/LoginForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminNav } from "@/components/admin/AdminNav";

interface Translation {
  id: string;
  key: string;
  he: string | null;
  en: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export const TranslationsAdmin = () => {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Translation>>({});
  const [newTranslation, setNewTranslation] = useState({
    key: '',
    he: '',
    en: '',
    category: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | 'all'>('all');
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    fetchTranslations();
  }, []);

  const fetchTranslations = async () => {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true });

      if (error) throw error;
      setTranslations(data || []);
    } catch (error) {
      console.error('Error fetching translations:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא ניתן לטעון את התרגומים"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id: string) => {
    try {
      const current = translations.find(t => t.id === id);
      if (!current) return;
      const payload = {
        key: (editForm.key ?? current.key)!,
        he: editForm.he ?? current.he,
        en: editForm.en ?? current.en,
        category: editForm.category ?? current.category
      };
      const { error } = await supabase
        .from('translations')
        .update(payload)
        .eq('id', id);

      if (error) throw error;

      await fetchTranslations();
      setEditingId(null);
      setEditForm({});
      
      toast({
        title: "הצלחה",
        description: "התרגום עודכן בהצלחה"
      });
    } catch (error) {
      console.error('Error updating translation:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא ניתן לעדכן את התרגום"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את התרגום?')) return;

    try {
      const { error } = await supabase
        .from('translations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTranslations();
      
      toast({
        title: "הצלחה",
        description: "התרגום נמחק בהצלחה"
      });
    } catch (error) {
      console.error('Error deleting translation:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא ניתן למחוק את התרגום"
      });
    }
  };

  const handleAddNew = async () => {
    try {
      const { error } = await supabase
        .from('translations')
        .insert([newTranslation]);

      if (error) throw error;

      await fetchTranslations();
      setNewTranslation({ key: '', he: '', en: '', category: '' });
      setShowAddForm(false);
      
      toast({
        title: "הצלחה",
        description: "תרגום חדש נוסף בהצלחה"
      });
    } catch (error) {
      console.error('Error adding translation:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא ניתן להוסיף את התרגום"
      });
    }
  };

  const exportTranslations = async () => {
    try {
      const { data } = await supabase.functions.invoke('export-translations');
      
      if (data) {
        // Save Hebrew translations
        const heBlob = new Blob([JSON.stringify(data.he, null, 2)], { type: 'application/json' });
        const heUrl = URL.createObjectURL(heBlob);
        const heLink = document.createElement('a');
        heLink.href = heUrl;
        heLink.download = 'he.json';
        heLink.click();
        
        // Save English translations
        const enBlob = new Blob([JSON.stringify(data.en, null, 2)], { type: 'application/json' });
        const enUrl = URL.createObjectURL(enBlob);
        const enLink = document.createElement('a');
        enLink.href = enUrl;
        enLink.download = 'en.json';
        enLink.click();

        toast({
          title: "הצלחה",
          description: "קבצי התרגום יוצאו בהצלחה"
        });
      }
    } catch (error) {
      console.error('Error exporting translations:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא ניתן לייצא את התרגומים"
      });
    }
  };

  const startEdit = (translation: Translation) => {
    setEditingId(translation.id);
    setEditForm(translation);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (loading || isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">טוען...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <AdminNav />
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">ניהול תרגומים</CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                הוספת תרגום
              </Button>
              <Button 
                variant="outline" 
                onClick={exportTranslations}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                ייצא JSON
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 w-full md:w-1/2">
              <Input
                placeholder="חיפוש לפי מפתח / עברית / אנגלית"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="סינון לפי קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הקטגוריות</SelectItem>
                  {[...new Set(translations.map(t => t.category).filter(Boolean))].map((cat) => (
                    <SelectItem key={cat as string} value={cat as string}>{cat as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {showAddForm && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/50">
              <h3 className="text-lg font-semibold mb-4">הוספת תרגום חדש</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <Input
                  placeholder="מפתח (key)"
                  value={newTranslation.key}
                  onChange={(e) => setNewTranslation({ ...newTranslation, key: e.target.value })}
                />
                <Input
                  placeholder="עברית"
                  value={newTranslation.he}
                  onChange={(e) => setNewTranslation({ ...newTranslation, he: e.target.value })}
                />
                <Input
                  placeholder="אנגלית"
                  value={newTranslation.en}
                  onChange={(e) => setNewTranslation({ ...newTranslation, en: e.target.value })}
                />
                <Input
                  placeholder="קטגוריה"
                  value={newTranslation.category}
                  onChange={(e) => setNewTranslation({ ...newTranslation, category: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddNew} disabled={!newTranslation.key}>
                  <Save size={16} className="mr-2" />
                  שמירה
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  <X size={16} className="mr-2" />
                  ביטול
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>מפתח</TableHead>
                  <TableHead>עברית</TableHead>
                  <TableHead>אנגלית</TableHead>
                  <TableHead>קטגוריה</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(translations
                  .filter(t => (category === 'all' || t.category === category))
                  .filter(t => {
                    const q = search.toLowerCase().trim();
                    if (!q) return true;
                    return (
                      t.key.toLowerCase().includes(q) ||
                      (t.he ?? '').toLowerCase().includes(q) ||
                      (t.en ?? '').toLowerCase().includes(q)
                    );
                  })
                ).map((translation) => (
                  <TableRow key={translation.id}>
                    <TableCell>
                      {editingId === translation.id ? (
                        <Input
                          value={editForm.key || ''}
                          onChange={(e) => setEditForm({ ...editForm, key: e.target.value })}
                        />
                      ) : (
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {translation.key}
                        </code>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === translation.id ? (
                        <Input
                          value={editForm.he || ''}
                          onChange={(e) => setEditForm({ ...editForm, he: e.target.value })}
                        />
                      ) : (
                        translation.he
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === translation.id ? (
                        <Input
                          value={editForm.en || ''}
                          onChange={(e) => setEditForm({ ...editForm, en: e.target.value })}
                        />
                      ) : (
                        translation.en
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === translation.id ? (
                        <Input
                          value={editForm.category || ''}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        />
                      ) : (
                        <span className="text-xs bg-secondary px-2 py-1 rounded">
                          {translation.category}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === translation.id ? (
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => handleSave(translation.id)}>
                            <Save size={14} />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            <X size={14} />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => startEdit(translation)}>
                            <Edit2 size={14} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDelete(translation.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {translations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              אין תרגומים במערכת
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};