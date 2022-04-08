export type ReporterConfig = {
  enabled: boolean;
  reportingServerHostname: string;
  reportingProjectKey?: string;
  reportingRunDisplayName?: string;
  reportingRunBuild?: string;
  reportingRunEnvironment?: string;
  reportingNotifyOnEachFailure?: boolean;
  reportingNotificationSlackChannels?: string;
  reportingNotificationMsTeamsChannels?: string;
  reportingNotificationEmails?: string;
  reportingMilestoneId?: string;
  reportingMilestoneName?: string;
  reportingRunLocale?: string;
};

export type BrowserCapabilities = {
  browserName?: string;
  browserVersion?: string;
  platformName?: string;
};

export type RunOptions = {
  tcmConfig?: {};
  labels?: any[];
  attachments?: [];
  references?: [];
};

export type TestOptions = {
  [id: string]: {
    maintainer?: string;
    testTcmOptions?: [][];
    labels?: [][];
    attachments?: [][];
    references?: [][];
    revertTest?: boolean;
  };
};
