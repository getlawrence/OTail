"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Log } from "@/api/types"

interface LogsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    logs: Log[]
    loading: boolean
}

export function LogsDialog({ open, onOpenChange, logs, loading }: LogsDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const highlightText = (text: string, query: string) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) => 
            part.toLowerCase() === query.toLowerCase() 
                ? <span key={i} className="bg-yellow-200 dark:bg-yellow-900">{part}</span> 
                : part
        );
    };

    const formatAndHighlightJson = (jsonString: string, query: string) => {
        try {
            const parsed = JSON.parse(jsonString);
            const formatted = JSON.stringify(parsed, null, 2);
            if (!query) return formatted;
            
            return formatted.split('\n').map((line) => {
                if (line.toLowerCase().includes(query.toLowerCase())) {
                    return highlightText(line, query);
                }
                return line;
            }).map((line, i) => (
                <span key={i}>
                    {line}
                    {i < formatted.split('\n').length - 1 && '\n'}
                </span>
            ));
        } catch {
            return highlightText(jsonString, query);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] max-h-[90vh]">
                <DialogHeader className="flex flex-row items-center justify-between pr-0">
                    <DialogTitle>Agent Logs</DialogTitle>
                </DialogHeader>
                <div className="mb-4">
                    <Input
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                    />
                </div>
                <ScrollArea className="h-[70vh] w-full rounded-md border p-4">
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <pre className="whitespace-pre-wrap break-words font-mono text-sm">
                            {logs.filter(line => 
                                line.body.toLowerCase().includes(searchQuery.toLowerCase())
                            ).map((line, index) => (
                                <div key={index} className="mb-2 rounded bg-muted/50 p-2">
                                    {formatAndHighlightJson(line.body, searchQuery)}
                                </div>
                            ))}
                        </pre>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
