import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalSettings } from '../contexts/SettingsContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import MaintenanceBanner from '../components/MaintenanceBanner';
import { Loader2, User, Mail, Phone, Lock, GraduationCap, CheckCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, isLoading } = useAuth();
  const { getSiteName, systemSettings } = useGlobalSettings();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-primary-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Registration Submitted!</h2>
                <p className="text-muted-foreground mt-2">
                  Your account request has been submitted for admin approval. 
                  You will receive an email notification once your account is activated.
                </p>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Return to Login
                </Button>
                <p className="text-xs text-muted-foreground">
                  Account activation typically takes 1-2 business days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-primary-100 flex flex-col">
      {/* Maintenance Mode Banner */}
      {systemSettings?.maintenanceMode && (
        <MaintenanceBanner dismissible={false} />
      )}
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Teacher Account Request</h1>
          <p className="text-muted-foreground mt-1">{getSiteName()} • Kenya</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">
              Join the Platform
            </CardTitle>
            <CardDescription className="text-center">
              Request access to the teacher document management system
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john.doe@email.co.ke"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="+254 700 000 000"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert className="bg-destructive/10 border-destructive/20">
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                <p>
                  By submitting this form, you acknowledge that your information will be 
                  verified by system administrators before account activation.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  'Submit Account Request'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account? {' '}
            <Link 
              to="/login" 
              className="text-primary hover:underline font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
