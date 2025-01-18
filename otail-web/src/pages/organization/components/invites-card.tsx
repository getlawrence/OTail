import React, { useState } from 'react';
import { Copy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { OrganizationInvite } from '@/api/types';
import { organizationApi } from '@/api/organization';
import { useToast } from "@/hooks/use-toast"

interface InvitesCardProps {
    invites: OrganizationInvite[];
}

export const InvitesCard: React.FC<InvitesCardProps> = ({ invites }) => {
    const [inviteToken, setInviteToken] = useState<string | null>(null);
    const [inviteEmail, setInviteEmail] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const getInviteLink = (token: string) => {
        return `${window.location.origin}/register?invite=${token}`;
    };

    const handleCreateInvite = async () => {
        if (!inviteEmail) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Email is required for invite",
            });
            return;
        }
        try {
            setLoading(true);
            const response = await organizationApi.createInvite(inviteEmail);
            setInviteToken(response.token);
            setInviteEmail('');
            toast({
                variant: "default",
                title: "Success",
                description: "Invite created successfully",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create invite",
            });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            variant: "default",
            title: "Success",
            description: "Copied to clipboard",
        });
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
                <CardTitle>Invite Members</CardTitle>
                <CardDescription>Invite new members to join your organization</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 flex flex-col gap-4">
                <div className="flex gap-4 flex-shrink-0">
                    <Input
                        type="email"
                        placeholder="Enter email address"
                        className="flex-1"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <Button onClick={handleCreateInvite} disabled={loading || !inviteEmail}>
                        <Plus className="mr-2 h-4 w-4" /> Create Invite
                    </Button>
                </div>
                {inviteToken && (
                    <div className="rounded-lg border p-4 bg-muted/50 flex-shrink-0">
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
                <div className="flex-1 min-h-0 overflow-auto">
                    {invites?.length > 0 && (
                        <div className="space-y-1">
                            {invites.filter(invite => !invite.used).map((invite, index) => (
                                <div key={index} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
                                    <code className="relative rounded bg-background px-2 py-1 font-mono text-sm truncate flex-1">
                                        {getInviteLink(invite.token)}
                                    </code>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => copyToClipboard(getInviteLink(invite.token))}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                    <Badge variant="outline" className="whitespace-nowrap text-xs px-2 py-0">
                                        {new Date(invite.expires_at).toLocaleDateString(undefined, {
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
