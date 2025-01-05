"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import OtelConfig from "@/pages/config"

interface ConfigDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    config: any
    onUpdate: (value: string) => void
}

export function ConfigDialog({ open, onOpenChange, config, onUpdate }: ConfigDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Agent Configuration</DialogTitle>
                </DialogHeader>
                <div className="h-[80vh] overflow-auto">
                    <OtelConfig config={config} onUpdate={onUpdate} />
                </div>
            </DialogContent>
        </Dialog>
    )
}
