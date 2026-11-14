/**
 * Chooses the first useful admitted surface without duplicating workspace
 * capability resolution. Institutional capacities enter the existing workspace
 * dispatcher; personal, guest, and unresolved capacity keep the safe self
 * fallback.
 */
export function getFirstValueRoute(capacity: string | null | undefined): '/self' | '/workspace' {
  switch (capacity) {
    case 'teacher':
    case 'gradeHead':
    case 'sectionHead':
    case 'principal':
    case 'assistantPrincipal':
    case 'admin':
    case 'founder':
    case 'developer':
    case 'guardian':
    case 'parent':
    case 'librarian':
    case 'nurse':
      return '/workspace';
    case 'student':
    default:
      return '/self';
  }
}
