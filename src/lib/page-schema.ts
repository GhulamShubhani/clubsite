export type DeviceOverride = {
  desktop?: Record<string, unknown>;
  tablet?: Record<string, unknown>;
  mobile?: Record<string, unknown>;
};

export type PageSection = {
  id: string;
  type: string;
  props: Record<string, unknown>;
  styles?: Record<string, unknown>;
  responsive?: DeviceOverride;
};

export type PageContent = {
  sections: PageSection[];
};
