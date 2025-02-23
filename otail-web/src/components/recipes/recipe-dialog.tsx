import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RecipeManager } from "./recipe-manager";
import { Policy, Recipe } from "@/types/policy";

export const RecipeDialog = ({ isOpen, onOpenChange, onApplyRecipe, currentPolicies }: { isOpen: boolean, onOpenChange: (isOpen: boolean) => void, onApplyRecipe: (recipe: Recipe) => void, currentPolicies: Policy[] }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] max-h-[90vh]">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle>Manage Recipes</DialogTitle>
                </DialogHeader>
                <RecipeManager onApplyRecipe={onApplyRecipe} currentPolicies={currentPolicies} />
            </DialogContent>
        </Dialog>
    )
}