import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/blog/LoginForm';
import { PostsList } from '@/components/blog/PostsList';
import { BlogPostForm } from '@/components/blog/BlogPostForm';
import { AdminNav } from "@/components/admin/AdminNav";
const BlogAdmin = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handlePostDeleted = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <AdminNav />
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">ניהול בלוג - יצירת פוסטים</h1>
          <Button onClick={logout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 ml-2" />
            התנתק
          </Button>
        </div>

        <div className="space-y-8">
          <BlogPostForm onSaveSuccess={handleUploadSuccess} />
          <PostsList key={refreshKey} onPostDeleted={handlePostDeleted} />
        </div>
      </div>
    </div>
  );
};

export default BlogAdmin;