import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { trackAuth } from '../../utils/events';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      trackAuth.login(true);
    } catch (err) {
      trackAuth.login(false);
      setError('Invalid email or password');
    }
  };

  return (
    <Card className="w-[400px] shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
          <LogIn className="h-6 w-6" />
          Login to OTail
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-500 text-center">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Create one
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
