export enum StaticContentType {
  PRIVACY_POLICY = 'privacy-policy',
  TERMS_OF_SERVICE = 'terms-of-service',
  HELP_SUPPORT = 'help-support',
}

export interface StaticContent {
  content_type: string;
  content: any; // EditorJS content format
}

export interface StaticContentItem {
  type: StaticContentType;
  title: string;
  icon: string;
}
