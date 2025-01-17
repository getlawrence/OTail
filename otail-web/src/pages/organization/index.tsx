import React, { useState, useEffect } from 'react';
import { Copy, Plus } from "lucide-react";
import { organizationApi } from '../../api/organization';
import { useAuth } from '@/hooks/use-auth';
import { Organization } from '@/api/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';

const OrganizationPage: React.FC = () => {
    const [inviteToken, setInviteToken] = useState<string | null>(null);
    const [inviteEmail, setInviteEmail] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const { user } = useAuth();

    const getInviteLink = (token: string) => {
        return `${window.location.origin}/register?invite=${token}`;
    };

    useEffect(() => {
        const fetchOrganization = async () => {
            if (!user?.organization_id) {
                console.error('User is not associated with an organization', user);
                return;
            }

            try {
                const org = await organizationApi.getOrganization(user.organization_id);
                setOrganization(org);
            } catch (error) {
                console.error(error);
            }
        };

        fetchOrganization();
    }, [user]);

    const handleCreateInvite = async () => {
        if (!inviteEmail) {
            console.error('Email is required for invite');
            return;
        }
        try {
            setLoading(true);
            const response = await organizationApi.createInvite(inviteEmail);
            setInviteToken(response.token);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    if (!organization) {
        return (
            <div className="space-y-4">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-[250px]" />
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-[100px]" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
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

    return (
        <div className="flex flex-col h-full gap-4 p-4">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold">{organization.name}</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your organization members and invites
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 flex-1">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Members</CardTitle>
                                <CardDescription>
                                    Your organization has {organization.members.length} members
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {organization.members.map((member) => (
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Invite Members</CardTitle>
                        <CardDescription>Invite new members to join your organization</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <Input
                                    type="email"
                                    placeholder="Enter email address"
                                    className="flex-1 px-3 py-2 border rounded-md"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                                <Button onClick={handleCreateInvite} disabled={loading || !inviteEmail}>
                                    <Plus className="mr-2 h-4 w-4" /> Create Invite
                                </Button>
                            </div>
                            {inviteToken && (
                                <div className="rounded-lg border p-4 bg-muted/50">
                                    <div className="text-sm font-medium mb-2">New Invite Link:</div>
                                    <div className="flex items-center gap-2">
                                        <code className="relative rounded bg-background px-[0.3rem] py-[0.2rem] font-mono text-sm truncate flex-1">
                                            {getInviteLink(inviteToken)}
                                        </code>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => copyToClipboard(getInviteLink(inviteToken))}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {organization.invites?.length > 0 && (
                                <div className="space-y-4">
                                    {organization.invites.filter(invite => !invite.used).map((invite, index) => (
                                        <div key={index} className="flex items-center gap-2 rounded-lg border p-3">
                                            <code className="relative rounded bg-background px-[0.3rem] py-[0.2rem] font-mono text-sm truncate flex-1">
                                                {getInviteLink(invite.token)}
                                            </code>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => copyToClipboard(getInviteLink(invite.token))}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Badge variant="outline" className="whitespace-nowrap">
                                                Expires {new Date(invite.expires_at).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OrganizationPage;