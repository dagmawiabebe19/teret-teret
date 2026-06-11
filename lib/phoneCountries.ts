export type CountryCode = {
  dial: string;
  flag: string;
  name: string;
  /** National number length (digits only, no leading 0) */
  nationalLength: number;
};

export const PHONE_COUNTRIES: CountryCode[] = [
  { dial: "+251", flag: "🇪🇹", name: "Ethiopia", nationalLength: 9 },
  { dial: "+254", flag: "🇰🇪", name: "Kenya", nationalLength: 9 },
  { dial: "+256", flag: "🇺🇬", name: "Uganda", nationalLength: 9 },
  { dial: "+234", flag: "🇳🇬", name: "Nigeria", nationalLength: 10 },
  { dial: "+250", flag: "🇷🇼", name: "Rwanda", nationalLength: 9 },
  { dial: "+233", flag: "🇬🇭", name: "Ghana", nationalLength: 9 },
  { dial: "+27", flag: "🇿🇦", name: "South Africa", nationalLength: 9 },
  { dial: "+1", flag: "🇺🇸", name: "US / Canada", nationalLength: 10 },
  { dial: "+44", flag: "🇬🇧", name: "United Kingdom", nationalLength: 10 },
  { dial: "+49", flag: "🇩🇪", name: "Germany", nationalLength: 10 },
  { dial: "+33", flag: "🇫🇷", name: "France", nationalLength: 9 },
  { dial: "+61", flag: "🇦🇺", name: "Australia", nationalLength: 9 },
];

export const DEFAULT_COUNTRY = PHONE_COUNTRIES[0];

export function stripPhoneInput(raw: string): string {
  return raw.replace(/[\s\-().]/g, "").replace(/\D/g, "");
}

export function findCountryByDial(dial: string): CountryCode | undefined {
  return PHONE_COUNTRIES.find((c) => c.dial === dial);
}

export function validateNationalNumber(country: CountryCode, digits: string): boolean {
  const d = stripPhoneInput(digits);
  if (!d) return false;
  // Ethiopia mobile often starts with 9
  if (country.dial === "+251" && d.length === 9 && !d.startsWith("9")) {
    return false;
  }
  return d.length === country.nationalLength;
}

export function toE164(country: CountryCode, nationalDigits: string): string {
  const d = stripPhoneInput(nationalDigits);
  return `${country.dial}${d}`;
}

export function isValidE164(phone: string): boolean {
  if (!/^\+\d{10,15}$/.test(phone)) return false;
  const country = PHONE_COUNTRIES.find((c) => phone.startsWith(c.dial));
  if (!country) return false;
  const national = phone.slice(country.dial.length);
  return validateNationalNumber(country, national);
}

export function maskPhoneE164(phone: string): string {
  if (phone.length < 8) return phone;
  const prefix = phone.slice(0, 5);
  const suffix = phone.slice(-4);
  return `${prefix}****${suffix}`;
}

export function parseE164(phone: string): { country: CountryCode; national: string } | null {
  const sorted = [...PHONE_COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const country of sorted) {
    if (phone.startsWith(country.dial)) {
      const national = phone.slice(country.dial.length);
      if (validateNationalNumber(country, national)) {
        return { country, national };
      }
    }
  }
  return null;
}
