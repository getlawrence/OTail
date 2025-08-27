import { Deployment } from '@/types/deployment';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DeploymentListProps {
  deployments: Deployment[];
  onDelete: (id: string) => void;
}

export function DeploymentList({ deployments, onDelete }: DeploymentListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Groups</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Updated At</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deployments.map((deployment) => (
          <TableRow key={deployment.id}>
            <TableCell>{deployment.name}</TableCell>
            <TableCell>{deployment.agentGroups.length} groups</TableCell>
            <TableCell>{new Date(deployment.created_at).toLocaleString()}</TableCell>
            <TableCell>{new Date(deployment.updated_at).toLocaleString()}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(deployment.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 