import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export const ShareButtons = ({ title, url }: ShareButtonsProps) => {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedTitle} ${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
      <Share2 className="h-5 w-5 text-muted-foreground" />
      <span className="text-sm font-medium">שתף את המאמר:</span>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(shareLinks.whatsapp, '_blank')}
          className="bg-green-600 hover:bg-green-700 text-white border-green-600"
        >
          WhatsApp
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(shareLinks.telegram, '_blank')}
          className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
        >
          Telegram
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(shareLinks.facebook, '_blank')}
          className="bg-blue-700 hover:bg-blue-800 text-white border-blue-700"
        >
          Facebook
        </Button>
      </div>
    </div>
  );
};