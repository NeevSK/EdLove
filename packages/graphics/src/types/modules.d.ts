declare module 'srilankan-postalcode-backend' {
  export function validate(code: string): boolean;
  export function getDetails(code: string): any;
  // Add more as needed, but validate is what's used
}
