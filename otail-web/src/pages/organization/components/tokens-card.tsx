import React, { useState } from 'react';
import { Copy, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { OrganizationToken } from '@/api/types';
import { organizationApi } from '@/api/organization';

interface TokensCardProps {
    tokens: OrganizationToken[];
    organizationId: string;
    onTokenCreated: () => void;
}

export const TokensCard: React.FC<TokensCardProps> = ({ tokens, organizationId, onTokenCreated }) => {
    const [tokenDescription, setTokenDescription] = useState<string>('');
    const [newToken, setNewToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCreateToken = async () => {
        if (!tokenDescription || !organizationId) {
            return;
        }
        try {
            setLoading(true);
            const token = await organizationApi.createToken(organizationId, tokenDescription);
            setNewToken(token);
            setTokenDescription('');
            onTokenCreated();
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
                <CardTitle>API Tokens</CardTitle>
                <CardDescription>Create and manage API tokens for accessing the API</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <div className="flex gap-4">
                        <Input
                            type="text"
                            placeholder="Token description"
                            className="flex-1 px-3 py-2 border rounded-md"
                            value={tokenDescription}
                            onChange={(e) => setTokenDescription(e.target.value)}
                        />
                        <Button onClick={handleCreateToken} disabled={loading || !tokenDescription}>
                            <Key className="mr-2 h-4 w-4" /> Create Token
                        </Button>
                    </div>
                    {newToken && (
                        <div className="rounded-lg border p-4 bg-muted/50">
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
                    {tokens?.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Token</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tokens.map((token) => (
                                    <TableRow key={token.id}>
                                        <TableCell className="font-medium">{token.description}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(token.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            <div className="flex items-center gap-2 max-w-[300px]">
                                                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm truncate flex-1">
                                                    {token.token}
                                                </code>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 flex-shrink-0"
                                                    onClick={() => copyToClipboard(token.token)}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
