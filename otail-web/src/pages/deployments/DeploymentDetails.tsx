import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { deploymentsApi } from '@/api/deployments';
import { Deployment } from '@/types/deployment';
import { useToast } from '@/hooks/use-toast';

export default function DeploymentDetails() {
  const { id } = useParams();
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDeployment();
  }, [id]);

  const loadDeployment = async () => {
    try {
      setLoading(true);
      const response = await deploymentsApi.get(id!);
      setDeployment(response);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load deployment details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!deployment) {
    return <div>Deployment not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">{deployment.name}</h1>
      {/* Add your deployment details UI here */}
    </div>
  );
} 