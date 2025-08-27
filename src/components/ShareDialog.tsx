import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { 
  Share, 
  Copy, 
  Mail, 
  Globe, 
  X,
  CheckCircle,
  Plus
} from 'lucide-react';
import { Document } from '../services/types';

interface ShareDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: (shareData: ShareData) => void;
}

interface ShareData {
  isPublic: boolean;
  emails: string[];
  message?: string;
  publicLink?: string;
}

export default function ShareDialog({ document, open, onOpenChange, onShare }: ShareDialogProps) {
  const [isPublic, setIsPublic] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [message, setMessage] = useState('');
  const [publicLink, setPublicLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const generatePublicLink = () => {
    if (!document) return;
    const baseUrl = window.location.origin;
    const shareId = Math.random().toString(36).substr(2, 9);
    const link = `${baseUrl}/shared/${document.id}/${shareId}`;
    setPublicLink(link);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      toast.success('Link Copied', {
        description: 'Share link has been copied to clipboard'
      });
    } catch (err) {
      // Fallback for older browsers
      const textArea = window.document.createElement('textarea');
      textArea.value = text;
      window.document.body.appendChild(textArea);
      textArea.select();
      window.document.execCommand('copy');
      window.document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      toast.success('Link Copied', {
        description: 'Share link has been copied to clipboard'
      });
    }
  };

  const addEmail = () => {
    if (currentEmail && isValidEmail(currentEmail) && !emails.includes(currentEmail)) {
      setEmails([...emails, currentEmail]);
      setCurrentEmail('');
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleShare = () => {
    const shareData: ShareData = {
      isPublic,
      emails,
      message: message.trim() || undefined,
      publicLink: isPublic ? publicLink : undefined
    };
    onShare(shareData);
    onOpenChange(false);
    // Reset form
    setIsPublic(false);
    setEmails([]);
    setCurrentEmail('');
    setMessage('');
    setPublicLink('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setIsPublic(false);
      setEmails([]);
      setCurrentEmail('');
      setMessage('');
      setPublicLink('');
      setCopySuccess(false);
    }
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share Document
          </DialogTitle>
          <DialogDescription>
            Share "{document.title}" with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Public Link Option */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Public Link</Label>
                <p className="text-xs text-muted-foreground">
                  Anyone with the link can access this document
                </p>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={(checked) => {
                  setIsPublic(checked);
                  if (checked) {
                    generatePublicLink();
                  } else {
                    setPublicLink('');
                  }
                }}
              />
            </div>

            {isPublic && publicLink && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={publicLink}
                    readOnly
                    className="text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(publicLink)}
                    className="flex-shrink-0"
                  >
                    {copySuccess ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {copySuccess && (
                  <p className="text-xs text-green-600">Link copied to clipboard!</p>
                )}
              </div>
            )}
          </div>

          {/* Email Sharing */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Share with specific people</Label>
            
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addEmail();
                  }
                }}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={addEmail}
                disabled={!currentEmail || !isValidEmail(currentEmail) || emails.includes(currentEmail)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {emails.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  People with access ({emails.length})
                </Label>
                <div className="flex flex-wrap gap-1">
                  {emails.map((email) => (
                    <Badge key={email} variant="secondary" className="text-xs">
                      <Mail className="h-3 w-3 mr-1" />
                      {email}
                      <button
                        onClick={() => removeEmail(email)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Optional Message */}
          {(emails.length > 0 || isPublic) && (
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Message (optional)
              </Label>
              <Textarea
                id="message"
                placeholder="Add a message for the recipients..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleShare}
            disabled={!isPublic && emails.length === 0}
          >
            <Share className="h-4 w-4 mr-2" />
            Share Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
