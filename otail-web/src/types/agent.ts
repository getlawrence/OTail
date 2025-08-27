export interface Agent {
  instanceId: string;
  instanceIdStr: string;
  userId: string;
  status: {
    sequenceNum: number;
    agentDescription?: {
      identifyingAttributes: Array<{
        key: string;
        value: string;
      }>;
      nonIdentifyingAttributes: Array<{
        key: string;
        value: string;
      }>;
    };
    health?: {
      healthy: boolean;
      startTimeUnixNano: number;
    };
    remoteConfigStatus?: {
      lastRemoteConfigHash: string;
      status: string;
      errorMessage?: string;
    };
  };
  effectiveConfig: string;
  customInstanceConfig: string;
  startedAt: string;
  clientCert?: {
    subject: {
      commonName: string;
      organization: string[];
    };
    issuer: {
      commonName: string;
      organization: string[];
    };
    notBefore: string;
    notAfter: string;
  };
  clientCertSha256Fingerprint: string;
  clientCertOfferError: string;
  groupId: string;
  deploymentId: string;
} 