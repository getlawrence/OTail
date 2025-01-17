import React, { useState, useEffect } from 'react';
import { Copy } from "lucide-react";
import { organizationApi } from '../../api/organization';
import { useAuth } from '@/hooks/use-auth';
import { Organization } from '@/api/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const OrganizationPage: React.FC = () => {
    const [inviteToken, setInviteToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const { user } = useAuth();

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
        try {
            setLoading(true);
            const response = await organizationApi.createInvite();
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
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{organization.name}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Members</CardTitle>
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
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell className="capitalize">{member.role}</TableCell>
                                    <TableCell>{new Date(member.joined_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Invite Members</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Button
                            onClick={handleCreateInvite}
                            disabled={loading}
                        >
                            Generate Invite Token
                        </Button>
                    </div>

                    {inviteToken && (
                        <div className="space-y-2">
                            <div className="text-sm font-medium">New Invite Token:</div>
                            <div className="flex items-center gap-2">
                                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                                    {inviteToken}
                                </code>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => copyToClipboard(inviteToken)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {organization.invites?.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Pending Invites:</div>
                            <div className="space-y-2">
                                {organization.invites.map((invite, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                                            {invite.token}
                                        </code>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => copyToClipboard(invite.token)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm text-muted-foreground">
                                            Expires: {new Date(invite.expires_at).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default OrganizationPage;