declare module 'srilankan-postalcode-backend' {
  export function validate(code: string): boolean;
  export function getDistricts(): string[];
  // Add more as needed
}

declare module '@nishansanjuka/srilanka_geographics';
