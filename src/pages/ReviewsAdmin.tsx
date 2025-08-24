import { useState } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Star, Edit, Trash2, Plus, User } from "lucide-react";
import { useAllReviews, useAddReview, useUpdateReview, useDeleteReview, type Review, type NewReview } from "@/hooks/useReviews";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ReviewsAdmin = () => {
  const { data: reviews = [], isLoading } = useAllReviews();
  const addReviewMutation = useAddReview();
  const updateReviewMutation = useUpdateReview();
  const deleteReviewMutation = useDeleteReview();

  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState<NewReview & { is_verified?: boolean; is_visible?: boolean }>({
    customer_name: "",
    rating: 5,
    review_text: "",
    experience_type: "",
    is_verified: false,
    is_visible: true,
  });

  const handleAddReview = async () => {
    await addReviewMutation.mutateAsync(newReview);
    setNewReview({
      customer_name: "",
      rating: 5,
      review_text: "",
      experience_type: "",
      is_verified: false,
      is_visible: true,
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;
    await updateReviewMutation.mutateAsync(editingReview);
    setEditingReview(null);
  };

  const handleDeleteReview = async (id: string) => {
    await deleteReviewMutation.mutateAsync(id);
  };

  const renderStars = (rating: number, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            disabled={!onChange}
            className={!onChange ? "cursor-default" : ""}
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">טוען...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">ניהול ביקורות</h1>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 ml-2" />
                הוסף ביקורת
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>הוספת ביקורת חדשה</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">שם המבקר</label>
                  <Input
                    value={newReview.customer_name}
                    onChange={(e) => setNewReview({ ...newReview, customer_name: e.target.value })}
                    placeholder="הכנס שם"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">דירוג</label>
                  {renderStars(newReview.rating, (rating) => setNewReview({ ...newReview, rating }))}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">סוג חוויה</label>
                  <Input
                    value={newReview.experience_type}
                    onChange={(e) => setNewReview({ ...newReview, experience_type: e.target.value })}
                    placeholder="למשל: יום הולדת, ערב חברים"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">טקסט הביקורת</label>
                  <Textarea
                    value={newReview.review_text}
                    onChange={(e) => setNewReview({ ...newReview, review_text: e.target.value })}
                    placeholder="כתוב את הביקורת כאן..."
                    rows={4}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">מאומת</label>
                  <Switch
                    checked={newReview.is_verified}
                    onCheckedChange={(checked) => setNewReview({ ...newReview, is_verified: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">גלוי לציבור</label>
                  <Switch
                    checked={newReview.is_visible}
                    onCheckedChange={(checked) => setNewReview({ ...newReview, is_visible: checked })}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleAddReview} disabled={addReviewMutation.isPending}>
                    {addReviewMutation.isPending ? "מוסיף..." : "הוסף ביקורת"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    ביטול
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{review.customer_name}</h4>
                        {review.is_verified && (
                          <Badge variant="secondary" className="text-xs">
                            מאומת
                          </Badge>
                        )}
                        {!review.is_visible && (
                          <Badge variant="destructive" className="text-xs">
                            מוסתר
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{new Date(review.created_at).toLocaleDateString("he-IL")}</span>
                        {review.experience_type && (
                          <>
                            <span>•</span>
                            <span>{review.experience_type}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    <div className="flex gap-1 mr-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingReview(review)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>מחיקת ביקורת</AlertDialogTitle>
                            <AlertDialogDescription>
                              האם אתה בטוח שברצונך למחוק את הביקורת הזו? פעולה זו לא ניתנת לביטול.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ביטול</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteReview(review.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              מחק
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
                
                <p className="text-muted-foreground mt-4 leading-relaxed">
                  {review.review_text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>עריכת ביקורת</DialogTitle>
            </DialogHeader>
            {editingReview && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">שם המבקר</label>
                  <Input
                    value={editingReview.customer_name}
                    onChange={(e) => setEditingReview({ ...editingReview, customer_name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">דירוג</label>
                  {renderStars(editingReview.rating, (rating) => setEditingReview({ ...editingReview, rating }))}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">סוג חוויה</label>
                  <Input
                    value={editingReview.experience_type || ""}
                    onChange={(e) => setEditingReview({ ...editingReview, experience_type: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">טקסט הביקורת</label>
                  <Textarea
                    value={editingReview.review_text}
                    onChange={(e) => setEditingReview({ ...editingReview, review_text: e.target.value })}
                    rows={4}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">מאומת</label>
                  <Switch
                    checked={editingReview.is_verified}
                    onCheckedChange={(checked) => setEditingReview({ ...editingReview, is_verified: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">גלוי לציבור</label>
                  <Switch
                    checked={editingReview.is_visible}
                    onCheckedChange={(checked) => setEditingReview({ ...editingReview, is_visible: checked })}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleUpdateReview} disabled={updateReviewMutation.isPending}>
                    {updateReviewMutation.isPending ? "שומר..." : "שמור שינויים"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingReview(null)}>
                    ביטול
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ReviewsAdmin;