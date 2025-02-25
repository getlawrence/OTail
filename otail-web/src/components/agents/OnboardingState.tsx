import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CopyIcon, CheckIcon, UpdateIcon } from "@radix-ui/react-icons"
import { useAuth } from "@/hooks/use-auth"

interface OnboardingStateProps {
    onRefresh: () => void
    apiToken: string
}

export function OnboardingState({ onRefresh, apiToken }: OnboardingStateProps) {
    const [copied, setCopied] = useState(false)
    const { organization } = useAuth()
    const opampEndpoint = import.meta.env.VITE_OPAMP_ENDPOINT || 'ws://localhost:4320/v1/opamp'

    const exampleConfig = `server:
  endpoint: ${opampEndpoint}
  headers:
    Authorization: Bearer ${apiToken}
  tls:
    insecure: true`

    return (
        <div className="flex flex-col items-center justify-start h-[calc(100vh-8rem)] overflow-y-auto space-y-6 p-4">
            <div className="max-w-2xl text-center space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Connect to OTail</h2>
                <p className="text-muted-foreground">
                    Connect your OpenTelemetry agent to {organization?.name} using the configuration below. 
                    Need help setting up OpAMP? Check out the <a href="https://opentelemetry.io/docs/collector/deployment/agent/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">OpenTelemetry documentation</a>.
                </p>
            </div>

            <div className="w-full max-w-2xl">
                <Alert>
                    <AlertTitle className="mb-2">OpAMP Configuration</AlertTitle>
                    <AlertDescription className="space-y-4">
                        <p>Add this configuration to your OpAMP supervisor configuration file:</p>
                        <div className="flex items-center space-x-2">
                            <pre className="flex-1 bg-muted p-2 rounded-md overflow-x-auto whitespace-pre break-normal">
                                <code>{exampleConfig}</code>
                            </pre>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    navigator.clipboard.writeText(exampleConfig)
                                    setCopied(true)
                                }}
                                className="shrink-0"
                            >
                                {copied ? <CheckIcon /> : <CopyIcon />}
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>

            <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={onRefresh}>
                    <UpdateIcon className="mr-2 h-4 w-4" />
                    Check Connection Status
                </Button>
            </div>
        </div>
    )
}
