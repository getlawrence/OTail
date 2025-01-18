import React, { useState } from 'react';
import { Copy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { OrganizationInvite } from '@/api/types';
import { organizationApi } from '@/api/organization';

interface InvitesCardProps {
    invites: OrganizationInvite[];
}

export const InvitesCard: React.FC<InvitesCardProps> = ({ invites }) => {
    const [inviteToken, setInviteToken] = useState<string | null>(null);
    const [inviteEmail, setInviteEmail] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const getInviteLink = (token: string) => {
        return `${window.location.origin}/register?invite=${token}`;
    };

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

    return (
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
                    {invites?.length > 0 && (
                        <div className="space-y-4">
                            {invites.filter(invite => !invite.used).map((invite, index) => (
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
    );
};
