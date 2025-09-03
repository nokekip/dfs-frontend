import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../services/api';
import { DocumentShareRequest } from '../services/types';
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
  onShare?: () => void; // Callback after successful share
}

export default function ShareDialog({ document, open, onOpenChange, onShare }: ShareDialogProps) {
  const [isPublic, setIsPublic] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [message, setMessage] = useState('');
  const [publicLink, setPublicLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Reset form when dialog opens/closes or document changes
  useEffect(() => {
    if (!open) {
      setIsPublic(false);
      setEmails([]);
      setCurrentEmail('');
      setMessage('');
      setPublicLink('');
      setCopySuccess(false);
      setIsSharing(false);
    }
  }, [open, document]);

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

  const handleShare = async () => {
    if (!document) return;
    
    setIsSharing(true);
    
    try {
      if (isPublic) {
        // Create public share
        const shareRequest: DocumentShareRequest = {
          share_type: 'public',
          can_download: true,
          can_view: true,
        };
        
        const response = await apiClient.shareDocument(document.id, shareRequest);
        
        if (response.success && response.data.public_url) {
          const fullUrl = `${window.location.origin}${response.data.public_url}`;
          setPublicLink(fullUrl);
          
          toast.success('Public Link Created', {
            description: 'Document is now publicly accessible via the link'
          });
        }
      }
      
      // Handle private shares (emails)
      for (const email of emails) {
        // In a real implementation, you'd resolve email to teacher ID
        // For now, we'll skip this or you could add a teacher search API
        toast.info('Private sharing not yet implemented', {
          description: 'Email-based sharing will be available soon'
        });
      }
      
      if (onShare) {
        onShare();
      }
      
    } catch (error) {
      toast.error('Share Failed', {
        description: 'Failed to create share link. Please try again.'
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleUnshare = async () => {
    if (!document) return;
    
    setIsSharing(true);
    
    try {
      const response = await apiClient.unshareDocument(document.id);
      
      if (response.success) {
        toast.success('Document Unshared', {
          description: response.data.message || 'All shares have been revoked'
        });
        
        // Reset form
        setIsPublic(false);
        setPublicLink('');
        setEmails([]);
        
        if (onShare) {
          onShare(); // Refresh parent component
        }
      }
    } catch (error) {
      toast.error('Unshare Failed', {
        description: 'Failed to unshare document. Please try again.'
      });
    } finally {
      setIsSharing(false);
    }
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
                  if (!checked) {
                    setPublicLink('');
                  }
                }}
              />
            </div>

            {isPublic && !publicLink && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <Globe className="h-4 w-4 inline mr-2" />
                  Click "Generate Public Link" to create a shareable link that anyone can access.
                </p>
              </div>
            )}

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
          
          {/* Show unshare button if document is currently shared */}
          {document.isShared && (
            <Button 
              variant="destructive"
              onClick={handleUnshare}
              disabled={isSharing}
            >
              <X className="h-4 w-4 mr-2" />
              {isSharing ? 'Unsharing...' : 'Unshare Document'}
            </Button>
          )}
          
          <Button 
            onClick={handleShare}
            disabled={(!isPublic && emails.length === 0) || isSharing}
          >
            <Share className="h-4 w-4 mr-2" />
            {isSharing ? 'Creating Share...' : 
             isPublic && !publicLink ? 'Generate Public Link' : 
             'Share Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
