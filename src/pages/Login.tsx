import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalSettings } from '../contexts/SettingsContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Mail, Lock, Smartphone, GraduationCap, Shield } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  
  const { login, verifyOTP, isLoading } = useAuth();
  const { getSiteName } = useGlobalSettings();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!showOTP) {
        // First step: email and password
        const response = await login(formData.email, formData.password);
        if (response.requiresOTP) {
          setShowOTP(true);
          setOtpMessage(response.message || 'OTP sent to your registered phone number');
          toast.success('OTP Sent', {
            description: 'Please check your phone for the verification code'
          });
        }
      } else {
        // Second step: OTP verification
        await verifyOTP(formData.email, formData.otp);

        toast.success('Login Successful', {
          description: `Welcome to ${getSiteName()}`
        });

        // Redirect based on user role (this will be handled by the App routing)
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{getSiteName()}</h1>
          <p className="text-muted-foreground mt-1">Teachers Document Management • Kenya</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">
              {showOTP ? 'Verify OTP' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-center">
              {showOTP 
                ? 'Enter the verification code sent to your phone'
                : 'Sign in to access your document management system'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!showOTP ? (
                <>
                  {/* Demo Credentials */}
                  <div className="bg-info/10 border border-info/20 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-info mt-0.5" />
                      <div className="text-xs text-info-foreground/80">
                        <div className="font-medium mb-1">Demo Credentials:</div>
                        <div>Admin: admin@school.co.ke / admin123</div>
                        <div>Teacher: teacher@school.co.ke / teacher123</div>
                        <div className="mt-1 text-xs opacity-75">OTP: 123456</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {otpMessage && (
                    <Alert className="bg-info/10 border-info/20">
                      <Smartphone className="h-4 w-4 text-info" />
                      <AlertDescription className="text-info-foreground">
                        {otpMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otp"
                        name="otp"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={formData.otp}
                        onChange={handleInputChange}
                        className="pl-10 text-center text-lg tracking-widest"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {error && (
                <Alert className="bg-destructive/10 border-destructive/20">
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {showOTP ? 'Verifying...' : 'Signing In...'}
                  </>
                ) : (
                  showOTP ? 'Verify OTP' : 'Sign In'
                )}
              </Button>

              {showOTP && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setShowOTP(false);
                    setFormData(prev => ({ ...prev, otp: '' }));
                    setError('');
                  }}
                >
                  ← Back to Login
                </Button>
              )}
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              New teacher? {' '}
              <Link 
                to="/register" 
                className="text-primary hover:underline font-medium"
              >
                Request Account Access
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="text-center mt-6 text-xs text-muted-foreground">
          Secured by 2-Factor Authentication • Ministry of Education, Kenya
        </div>
      </div>
    </div>
  );
}
