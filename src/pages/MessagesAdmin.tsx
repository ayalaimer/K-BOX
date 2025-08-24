import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Eye, Edit, Trash2, Download, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";

interface ContactMessage {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
  handled_at: string | null;
  notes: string | null;
  source: string;
}

export const MessagesAdmin = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [editingStatus, setEditingStatus] = useState<'new' | 'in_progress' | 'resolved'>('new');

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages((data || []) as ContactMessage[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בטעינת ההודעות",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.phone.includes(searchTerm) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || message.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const updateMessage = async (id: number, updates: Partial<ContactMessage>) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await fetchMessages();
      toast({
        title: "עודכן בהצלחה",
        description: "ההודעה עודכנה בהצלחה",
      });
    } catch (error) {
      console.error('Error updating message:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בעדכון ההודעה",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (id: number) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchMessages();
      toast({
        title: "נמחק בהצלחה",
        description: "ההודעה נמחקה בהצלחה",
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה במחיקת ההודעה",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['תאריך', 'שם', 'טלפון', 'אימייל', 'הודעה', 'סטטוס', 'הערות'].join(','),
      ...filteredMessages.map(msg => [
        format(parseISO(msg.created_at), 'dd/MM/yyyy HH:mm', { locale: he }),
        msg.full_name,
        msg.phone,
        msg.email,
        `"${msg.message.replace(/"/g, '""')}"`,
        msg.status,
        `"${(msg.notes || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contact_messages_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />חדש</Badge>;
      case 'in_progress':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />בטיפול</Badge>;
      case 'resolved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />טופל</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const newMessagesCount = messages.filter(msg => msg.status === 'new').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">הודעות צור קשר</h1>
          {newMessagesCount > 0 && (
            <p className="text-muted-foreground">
              יש לך {newMessagesCount} הודעות חדשות שלא נקראו
            </p>
          )}
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          ייצא ל-CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="חיפוש לפי שם, טלפון, אימייל או תוכן..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="סנן לפי סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="new">חדש</SelectItem>
                <SelectItem value="in_progress">בטיפול</SelectItem>
                <SelectItem value="resolved">טופל</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>רשימת הודעות ({filteredMessages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">טוען...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>תאריך</TableHead>
                  <TableHead>שם</TableHead>
                  <TableHead>טלפון</TableHead>
                  <TableHead>אימייל</TableHead>
                  <TableHead>הודעה</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      {format(parseISO(message.created_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                    </TableCell>
                    <TableCell className="font-medium">{message.full_name}</TableCell>
                    <TableCell>{message.phone}</TableCell>
                    <TableCell>{message.email}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {message.message.substring(0, 30)}...
                    </TableCell>
                    <TableCell>{getStatusBadge(message.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedMessage(message);
                                setEditingNotes(message.notes || "");
                                setEditingStatus(message.status);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>פרטי הודעה</DialogTitle>
                            </DialogHeader>
                            {selectedMessage && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="font-semibold">שם:</label>
                                    <p>{selectedMessage.full_name}</p>
                                  </div>
                                  <div>
                                    <label className="font-semibold">טלפון:</label>
                                    <p>{selectedMessage.phone}</p>
                                  </div>
                                  <div>
                                    <label className="font-semibold">אימייל:</label>
                                    <p>{selectedMessage.email}</p>
                                  </div>
                                  <div>
                                    <label className="font-semibold">תאריך:</label>
                                    <p>{format(parseISO(selectedMessage.created_at), 'dd/MM/yyyy HH:mm', { locale: he })}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="font-semibold">הודעה:</label>
                                  <p className="bg-muted p-3 rounded-md whitespace-pre-wrap">
                                    {selectedMessage.message}
                                  </p>
                                </div>

                                <div>
                                  <label className="font-semibold mb-2 block">סטטוס:</label>
                                  <Select value={editingStatus} onValueChange={(value: any) => setEditingStatus(value)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="new">חדש</SelectItem>
                                      <SelectItem value="in_progress">בטיפול</SelectItem>
                                      <SelectItem value="resolved">טופל</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <label className="font-semibold mb-2 block">הערות פנימיות:</label>
                                  <Textarea
                                    value={editingNotes}
                                    onChange={(e) => setEditingNotes(e.target.value)}
                                    placeholder="הוסף הערות פנימיות..."
                                    rows={3}
                                  />
                                </div>

                                <div className="flex gap-2 pt-4">
                                  <Button
                                    onClick={async () => {
                                      const updates: any = {
                                        status: editingStatus,
                                        notes: editingNotes
                                      };
                                      
                                      if (editingStatus === 'resolved' && !selectedMessage.handled_at) {
                                        updates.handled_at = new Date().toISOString();
                                      }
                                      
                                      await updateMessage(selectedMessage.id, updates);
                                      setSelectedMessage(null);
                                    }}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    עדכן
                                  </Button>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        מחק
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>אישור מחיקה</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          האם אתה בטוח שברצונך למחוק הודעה זו? פעולה זו לא ניתנת לביטול.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>ביטול</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={async () => {
                                            await deleteMessage(selectedMessage.id);
                                            setSelectedMessage(null);
                                          }}
                                        >
                                          מחק
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};