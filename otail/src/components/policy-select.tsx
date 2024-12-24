import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { POLICY_TYPES, PolicyType } from '@/types/policy';
import { FC } from "react";


interface PolicySelectProps {
    onSelect: (type: PolicyType) => void
}

export const PolicySelect: FC<PolicySelectProps> = ({ onSelect }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Add Policy</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {POLICY_TYPES.map(type => (
                    <DropdownMenuItem key={type} onSelect={() => onSelect(type)}>
                        {type.replace('_', ' ')}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}