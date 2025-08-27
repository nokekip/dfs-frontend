import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useGlobalSettings } from "../contexts/SettingsContext";
import Layout from "../components/Layout";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Home, ArrowLeft, FileQuestion, GraduationCap } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getSiteName } = useGlobalSettings();

  useEffect(() => {
    // Log 404 error for debugging (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
      console.error(
        "404 Error: User attempted to access non-existent route:",
        location.pathname,
      );
    }
  }, [location.pathname]);

  const handleGoHome = () => {
    if (user) {
      // Authenticated user - go to dashboard
      navigate('/');
    } else {
      // Unauthenticated user - go to landing page
      navigate('/');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  // 404 Content Component
  const NotFoundContent = () => (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-20 h-20 bg-muted rounded-full">
              <FileQuestion className="w-10 h-10 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-primary">404</CardTitle>
          <p className="text-xl text-muted-foreground">Page Not Found</p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist in {getSiteName()}.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={handleGoHome}>
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            {!user && (
              <Button onClick={handleLogin} variant="secondary">
                Sign In
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // If user is authenticated, show with Layout (dashboard navigation)
  if (user) {
    return (
      <Layout>
        <NotFoundContent />
      </Layout>
    );
  }

  // If user is not authenticated, show standalone page
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
          <p className="text-muted-foreground mt-1">{getSiteName()} • Kenya</p>
        </div>

        {/* 404 Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-20 h-20 bg-muted rounded-full">
                <FileQuestion className="w-10 h-10 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold text-primary">404</CardTitle>
            <p className="text-xl text-muted-foreground">Page Not Found</p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist.
            </p>
            <div className="flex flex-col gap-2 justify-center">
              <Button onClick={handleGoBack} variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={handleGoHome} className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              <Button onClick={handleLogin} variant="secondary" className="w-full">
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Need help? <button onClick={handleLogin} className="text-primary hover:underline">Contact Support</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
