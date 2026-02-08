import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const token = searchParams.get('token');
  const userId = searchParams.get('id');

  useEffect(() => {
    if (!token || !userId) {
      toast.error('Invalid reset link');
      navigate('/login');
    }
  }, [token, userId, navigate]);

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) return 'Must include both lower and upper case letters';
    if (!/[0-9]/.test(password)) return 'Must include a number';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Should include a special character';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password strength
    const validationError = validatePassword(formData.newPassword);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId!),
          token,
          newPassword: formData.newPassword,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password reset successfully!');
        navigate('/login');
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Reset password error:', error);
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
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create new password</h1>
            <p className="mt-2 text-slate-500">
              Enter a strong password to secure your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-slate-700">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="h-11 pr-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-orange-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                • At least 8 characters<br/>
                • Mix of upper and lower case<br/>
                • At least one number<br/>
                • At least one special character (!@#$%)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="h-11 pr-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-orange-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-colors"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>

            <div className="text-center">
              <Link to="/login" className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Gradient */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600">
        <div className="h-full flex items-center justify-center p-12">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-3xl bg-white/10 backdrop-blur-sm mb-6">
              <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4">Secure Your Account</h2>
            <p className="text-lg text-orange-100">
              Use a strong password with a mix of letters, numbers, and special characters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
