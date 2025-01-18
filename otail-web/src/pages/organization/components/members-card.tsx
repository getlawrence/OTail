import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { OrganizationMember } from '@/api/types';

interface MembersCardProps {
    members: OrganizationMember[];
}

const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
        case 'admin':
            return 'default';
        case 'member':
            return 'secondary';
        default:
            return 'outline';
    }
};

export const MembersCard: React.FC<MembersCardProps> = ({ members }) => {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Members</CardTitle>
                        <CardDescription>
                            Your organization has {members.length} members
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                <div className="h-full overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background">
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow key={member.user_id}>
                                    <TableCell className="font-medium">{member.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={getRoleBadgeVariant(member.role)}>
                                            {member.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(member.joined_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
