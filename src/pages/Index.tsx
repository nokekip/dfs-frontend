import { useNavigate } from 'react-router-dom';
import { useGlobalSettings } from '../contexts/SettingsContext';
import { useDashboard } from '../hooks/useDashboard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  GraduationCap, 
  FileText, 
  Shield, 
  Share, 
  Users, 
  FolderOpen,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { getSiteName, getSiteDescription, getRegistrationEnabled } = useGlobalSettings();
  const { stats } = useDashboard('teacher');

    const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    if (getRegistrationEnabled()) {
      navigate('/register');
    } else {
      // Registration is disabled, maybe show a message
      navigate('/login');
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'Secure Storage',
      description: 'Your documents are safely stored with enterprise-grade security'
    },
    {
      icon: Share,
      title: 'Easy Sharing',
      description: 'Share documents with colleagues and collaborate seamlessly'
    },
    {
      icon: Users,
      title: 'Admin Control',
      description: 'Comprehensive administrative tools for user and document management'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">{getSiteName()}</h1>
                <p className="text-sm text-muted-foreground">Kenya Teachers</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleLogin}>
                Sign In
              </Button>
              {getRegistrationEnabled() ? (
                <Button onClick={handleRegister}>
                  Get Started
                </Button>
              ) : (
                <Button variant="secondary" onClick={handleLogin}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Welcome to {getSiteName()}
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            {getSiteDescription()}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {getRegistrationEnabled() ? (
              <Button size="lg" onClick={handleRegister} className="gap-2">
                Start Managing Documents
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button size="lg" onClick={handleLogin} className="gap-2">
                Sign In to Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            <Button size="lg" variant="outline" onClick={handleLogin}>
              Sign In to Your Account
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-slate-900 mb-4">
            Everything You Need
          </h3>
          <p className="text-lg text-slate-600">
            Powerful tools designed specifically for educational professionals
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Join Our Community
            </h3>
            <p className="text-slate-600">
              Trusted by educators across Kenya
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {stats?.totalTeachers || '50+'}
              </div>
              <div className="text-sm text-slate-600">Teachers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {stats?.totalDocuments || '500+'}
              </div>
              <div className="text-sm text-slate-600">Documents</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {stats?.totalCategories || '15+'}
              </div>
              <div className="text-sm text-slate-600">Categories</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-primary text-primary-foreground rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
            {getRegistrationEnabled() 
              ? `Join thousands of teachers already using ${getSiteName()} to organize and share their educational resources.`
              : `Sign in to access ${getSiteName()} and manage your educational resources.`
            }
          </p>
          {getRegistrationEnabled() ? (
            <Button size="lg" variant="secondary" onClick={handleRegister} className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Create Your Account
            </Button>
          ) : (
            <Button size="lg" variant="secondary" onClick={handleLogin} className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Sign In Now
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-slate-600">
            © 2025 {getSiteName()}. Empowering educators across Kenya.
          </div>
        </div>
      </footer>
    </div>
  );
}
