import React, { useState, useEffect } from 'react';
import { organizationApi } from '../../api/organization';
import { useAuth } from '@/hooks/use-auth';
import { Organization } from '@/api/types';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { MembersCard } from './components/members-card';
import { InvitesCard } from './components/invites-card';
import { TokensCard } from './components/tokens-card';

const OrganizationPage: React.FC = () => {
    const [organization, setOrganization] = useState<Organization | null>(null);
    const { user } = useAuth();

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

    useEffect(() => {
        fetchOrganization();
    }, [user]);

    if (!organization) {
        return (
            <div className="space-y-4">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-[250px]" />
                    <Card>
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
                <div className="h-[calc(35vh)]">
                    <MembersCard members={organization.members} />
                </div>
                <div className="h-[calc(35vh)]">
                    <InvitesCard invites={organization.invites} />
                </div>
                <div className="h-[calc(35vh)]">
                    <TokensCard 
                        tokens={organization.tokens} 
                        organizationId={organization.id}
                        onTokenCreated={fetchOrganization}
                    />
                </div>
            </div>
        </div>
    );
};

export default OrganizationPage;