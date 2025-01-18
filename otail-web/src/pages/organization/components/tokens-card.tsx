import React, { useState } from 'react';
import { Copy, Key, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { OrganizationToken } from '@/api/types';
import { organizationApi } from '@/api/organization';
import { useToast } from "@/hooks/use-toast"

interface TokensCardProps {
    tokens: OrganizationToken[];
    organizationId: string;
    onTokenCreated: () => void;
}

export const TokensCard: React.FC<TokensCardProps> = ({ tokens, organizationId, onTokenCreated }) => {
    const [tokenDescription, setTokenDescription] = useState<string>('');
    const [newToken, setNewToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());
    const { toast } = useToast()

    const handleCreateToken = async () => {
        if (!tokenDescription || !organizationId) return;

        try {
            setLoading(true);
            const { token } = await organizationApi.createToken(organizationId, tokenDescription);
            setNewToken(token);
            setTokenDescription('');
            onTokenCreated();
            toast({
                variant: "default",
                title: "Success",
                description: "Token created successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create token",
            })
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const toggleTokenVisibility = (tokenId: string) => {
        setVisibleTokens(prev => {
            const next = new Set(prev);
            if (next.has(tokenId)) {
                next.delete(tokenId);
            } else {
                next.add(tokenId);
            }
            return next;
        });
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
                <CardTitle>API Tokens</CardTitle>
                <CardDescription>Create and manage API tokens for accessing the API</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 flex flex-col gap-4">
                <div className="flex gap-4 flex-shrink-0">
                    <Input
                        type="text"
                        placeholder="Token description"
                        className="flex-1"
                        value={tokenDescription}
                        onChange={(e) => setTokenDescription(e.target.value)}
                    />
                    <Button onClick={handleCreateToken} disabled={loading || !tokenDescription}>
                        <Key className="mr-2 h-4 w-4" /> Create Token
                    </Button>
                </div>

                {newToken && (
                    <div className="rounded-lg border p-4 bg-muted/50 flex-shrink-0">
                        <div className="text-sm font-medium mb-2">New Token Created:</div>
                        <div className="flex items-center gap-2">
                            <code className="relative rounded bg-background px-[0.3rem] py-[0.2rem] font-mono text-sm truncate flex-1">
                                {newToken}
                            </code>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => copyToClipboard(newToken)}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            Make sure to copy this token now. You won't be able to see it again!
                        </p>
                    </div>
                )}

                <div className="flex-1 min-h-0 overflow-auto">
                    {tokens?.length > 0 && (
                        <div className="space-y-1">
                            {tokens.map((token) => (
                                <div key={token.id} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
                                    <div className="font-medium min-w-[120px] max-w-[120px] truncate">
                                        {token.description}
                                    </div>
                                    <code className="relative rounded bg-muted px-2 py-1 font-mono text-sm truncate min-w-0 flex-1">
                                        {visibleTokens.has(token.id) ? token.token : '••••••••••••••••'}
                                    </code>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() => toggleTokenVisibility(token.id)}
                                        >
                                            {visibleTokens.has(token.id) ? (
                                                <EyeOff className="h-3 w-3" />
                                            ) : (
                                                <Eye className="h-3 w-3" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() => copyToClipboard(token.token)}
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
