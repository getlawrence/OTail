import { AgentGroup } from '@/types/deployment';
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

interface AgentGroupListProps {
  groups: AgentGroup[];
  onDelete: (id: string) => void;
}

export function AgentGroupList({ groups, onDelete }: AgentGroupListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Agents</TableHead>
          <TableHead>Deployment</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Updated At</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((group) => (
          <TableRow key={group.id}>
            <TableCell>{group.name}</TableCell>
            <TableCell>{group.agents.length} agents</TableCell>
            <TableCell>{group.id || 'None'}</TableCell>
            <TableCell>{new Date(group.createdAt).toLocaleString()}</TableCell>
            <TableCell>{new Date(group.updatedAt).toLocaleString()}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(group.id)}
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