export type Confidence = "green" | "amber" | "grey";

export type VisaStatus =
  | "free"
  | "voa"
  | "evisa"
  | "required"
  | "unknown"
  | "no-passport"
  | "loading";

export interface Program {
  airline: string;
  code: string;
  name: string;
  slug: string;
  city: string;
  airport: string;
  country: string;
  type: string;
  carrierAgnostic: boolean;
  minH: number | null;
  maxH: number | null;
  maxDays: number | null;
  cabins: string[];
  exclFares: string[];
  freeHotel: boolean;
  hotelNights: number | null;
  hotelStar: number | null;
  freeTours: boolean;
  freeVisa: boolean;
  hotelValueUSD: number;
  tourMinH: number | null;
  tourMaxH: number | null;
  url: string;
  status: string;
  validUntil?: string | null;
  [key: string]: unknown;
}

export interface TransitInfo {
  exit: number;
  toCity: number;
  buffer: number;
}

export interface VisaSeed {
  req?: boolean;
  transitFree?: boolean;
  voa?: boolean;
  eVisa?: boolean;
  maxH?: number | null;
  notes?: string;
  [key: string]: unknown;
}

export interface VisaInfo {
  status: VisaStatus;
  notes?: string;
  maxTransitHours?: number | null;
  live?: boolean;
}

export interface Verdict {
  confidence: Confidence;
  mode: "hotel" | "tour" | "unknown";
  airport: string;
  city: string;
  country: string;
  airline: string;
  programName: string;
  slug: string;
  url: string;
  layoverMin: number | null;
  usableHours: number | null;
  freeHotel: boolean;
  freeTours: boolean;
  freeVisa: boolean;
  visa: VisaInfo;
  maxDays: number | null;
  hotelValueUSD: number;
  hotelModel: string;
  hotelConditional: boolean;
  windowH: [number, number];
  reasons: string[];
  otherHubs?: string[];
  selfTransfer?: boolean;
}

export interface Card {
  stops: string[];
  layovers: Record<string, number>;
  carriers: string[];
  selfTransfer?: boolean;
  origin?: string;
  dest?: string;
  naStops?: string[];
  connections?: { code: string; min: number }[];
}

export interface RiskVerdict {
  kind: "us-transit" | "ca-transit";
  country: "US" | "CA";
  airport: string;
  city: string;
  layoverMin?: number;
  reasons: string[];
}

export interface FitVerdict {
  severity: "red" | "amber";
  airport: string;
  layoverMin: number;
  needMin: number;
  selfTransfer: boolean;
  intl: boolean;
  mega: boolean;
  parts: { base: number; intl: number; mega: number };
}

export interface BagVerdict {
  kind: "separate" | "customs";
  hub: string | null;
  country?: "US" | "CA";
  layoverMin?: number;
  tight: boolean;
}

export interface Adapter {
  id: string;
  matches: () => boolean;
  findCards: () => HTMLElement[];
  parseCard: (el: HTMLElement) => Card | null;
  _parse?: (label: string, text: string) => Card;
  badgePos?: "top" | "bottom";
  badgeAnchor?: (cardEl: HTMLElement) => HTMLElement | null;
  badgeInline?: boolean;
  skipRot?: () => boolean;
}

export interface Settings {
  confidentTraveler: boolean;
  bufferAdjustMin: number;
  passport: string | null;
}

export interface VisaApiResponse {
  found: boolean;
  visa?: {
    visa_required: boolean;
    transit_visa_free: boolean;
    visa_on_arrival: boolean;
    e_visa_available: boolean;
    max_transit_hours: number | null;
    notes: string | null;
  };
  source?: string;
}
