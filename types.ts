
export interface Package {
  id: string;
  name: string;
  trackingId: string;
  receivedAt: string;
  pickedUp: boolean;
  locationCode: string | null;
}

export type Tab = 'scan' | 'set-location' | 'inventory' | 'search';

export interface OCRResult {
  name: string;
  trackingId: string;
}
