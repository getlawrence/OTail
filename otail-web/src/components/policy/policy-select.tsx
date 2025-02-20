import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { POLICY_TYPES, PolicyType } from '@/types/policy';
import { FC } from "react";

interface PolicySelectProps {
    onSelect: (type: PolicyType) => void
    trigger?: JSX.Element
}

export const PolicySelect: FC<PolicySelectProps> = ({ onSelect, trigger }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {trigger || (
                    <Button variant="outline">
                        Add Policy
                    </Button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Select Policy Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {POLICY_TYPES.map((type) => (
                    <DropdownMenuItem
                        key={type}
                        onClick={() => onSelect(type)}
                    >
                        {type.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}