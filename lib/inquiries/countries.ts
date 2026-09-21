export type ShippingZone = "ukraine" | "europe" | "usa";

export interface Country {
    code: string;
    name: string;
    dialCode: string;
    zone: ShippingZone
}

export const COUNTRIES: Country[] = [
{ code: "UA", name: "Ukraine", dialCode: "+380", zone: "ukraine" },

  { code: "AT", name: "Austria", dialCode: "+43", zone: "europe" },
  { code: "BE", name: "Belgium", dialCode: "+32", zone: "europe" },
  { code: "BG", name: "Bulgaria", dialCode: "+359", zone: "europe" },
  { code: "HR", name: "Croatia", dialCode: "+385", zone: "europe" },
  { code: "CY", name: "Cyprus", dialCode: "+357", zone: "europe" },
  { code: "CZ", name: "Czech Republic", dialCode: "+420", zone: "europe" },
  { code: "DK", name: "Denmark", dialCode: "+45", zone: "europe" },
  { code: "EE", name: "Estonia", dialCode: "+372", zone: "europe" },
  { code: "FI", name: "Finland", dialCode: "+358", zone: "europe" },
  { code: "FR", name: "France", dialCode: "+33", zone: "europe" },
  { code: "DE", name: "Germany", dialCode: "+49", zone: "europe" },
  { code: "GR", name: "Greece", dialCode: "+30", zone: "europe" },
  { code: "HU", name: "Hungary", dialCode: "+36", zone: "europe" },
  { code: "IE", name: "Ireland", dialCode: "+353", zone: "europe" },
  { code: "IT", name: "Italy", dialCode: "+39", zone: "europe" },
  { code: "LV", name: "Latvia", dialCode: "+371", zone: "europe" },
  { code: "LT", name: "Lithuania", dialCode: "+370", zone: "europe" },
  { code: "LU", name: "Luxembourg", dialCode: "+352", zone: "europe" },
  { code: "MT", name: "Malta", dialCode: "+356", zone: "europe" },
  { code: "NL", name: "Netherlands", dialCode: "+31", zone: "europe" },
  { code: "NO", name: "Norway", dialCode: "+47", zone: "europe" },
  { code: "PL", name: "Poland", dialCode: "+48", zone: "europe" },
  { code: "PT", name: "Portugal", dialCode: "+351", zone: "europe" },
  { code: "RO", name: "Romania", dialCode: "+40", zone: "europe" },
  { code: "SK", name: "Slovakia", dialCode: "+421", zone: "europe" },
  { code: "SI", name: "Slovenia", dialCode: "+386", zone: "europe" },
  { code: "ES", name: "Spain", dialCode: "+34", zone: "europe" },
  { code: "SE", name: "Sweden", dialCode: "+46", zone: "europe" },
  { code: "CH", name: "Switzerland", dialCode: "+41", zone: "europe" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", zone: "europe" },

  { code: "US", name: "United States", dialCode: "+1", zone: "usa" },
];

export const ZONE_LABELS: Record<ShippingZone, string> = {
    ukraine: "Ukraine",
    europe: "Europe",
    usa: "United States"
};