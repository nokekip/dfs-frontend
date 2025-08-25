import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface PlaceholderPageProps {
  title?: string;
  description?: string;
}

export default function PlaceholderPage({ 
  title = "Page Under Development", 
  description = "This feature is coming soon!" 
}: PlaceholderPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    if (title !== "Page Under Development") return title;
    
    // Extract page name from URL
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const pageName = pathSegments[pathSegments.length - 1];
    
    return pageName 
      ? pageName.charAt(0).toUpperCase() + pageName.slice(1).replace('-', ' ')
      : "Page Under Development";
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Construction className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">{getPageTitle()}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We're working hard to bring you this feature. Check back soon for updates!
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate(-1)} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')} 
                className="w-full"
              >
                Return to Dashboard
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Need this feature urgently? Contact your system administrator.
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
