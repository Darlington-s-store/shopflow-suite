import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Password reset link sent! Check your email.');
        setSubmitted(true);
        // Redirect to login after 3 seconds
        setTimeout(() => navigate('/login'), 3000);
      } else {
        toast.error(data.error || 'Failed to request password reset');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Forgot password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-md shadow-orange-100 group-hover:bg-orange-700 transition-colors">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-xl font-bold text-slate-900">TechMart</span>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reset your password</h1>
            <p className="mt-2 text-slate-500">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {submitted ? (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900">Check your email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-green-800">
                  We've sent a password reset link to <span className="font-semibold">{email}</span>
                </p>
                <p className="text-sm text-green-700">
                  The link will expire in 1 hour. If you don't see the email, check your spam folder.
                </p>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Back to Login
                </Button>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-orange-500 transition-colors"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-colors"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <div className="text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Side - Gradient */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600">
        <div className="h-full flex items-center justify-center p-12">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-3xl bg-white/10 backdrop-blur-sm mb-6">
              <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4">Secure Your Account</h2>
            <p className="text-lg text-orange-100">
              We take your security seriously. Reset your password to keep your account safe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
