import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/api/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Member {
  user_id: string
  organization_id: string
  role: 'admin' | 'member'
  joined_at: string
  email?: string
}

export default function ManageOrganization() {
  const { user } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [newMemberEmail, setNewMemberEmail] = useState('')

  useEffect(() => {
    if (user?.current_organization?.id) {
      fetchMembers()
    }
  }, [user?.current_organization?.id])

  const fetchMembers = async () => {
    try {
      const data = await apiClient.get<Member[]>(
        `/api/auth/organizations/${user?.current_organization?.id}/members`
      );
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.current_organization?.id) return;

    try {
      await apiClient.post(
        `/api/auth/organizations/${user.current_organization.id}/members`,
        { email: newMemberEmail, role: 'member' }
      );
      setNewMemberEmail('');
      await fetchMembers();
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  if (!user?.current_organization) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Members</CardTitle>
        </CardHeader>
        <CardContent>
          {user && (
            <form onSubmit={handleAddMember} className="flex gap-4 mb-6">
              <Input
                type="email"
                placeholder="Enter member email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="max-w-md"
              />
              <Button type="submit">Add Member</Button>
            </form>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.user_id}>
                  <TableCell>{member.email}</TableCell>
                  <TableCell className="capitalize">{member.role}</TableCell>
                  <TableCell>{new Date(member.joined_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
