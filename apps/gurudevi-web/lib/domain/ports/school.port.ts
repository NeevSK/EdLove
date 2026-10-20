/**
 * School Domain Port
 *
 * Defines hexagonal contracts for institutional school profiles, national census binding,
 * living roll of honor (leadership tenures), and sanctuary credentials.
 */

export interface SchoolProfileFact {
  id: string;
  name: string;
  nameSi?: string;
  nameTa?: string;
  handle: string;
  type: string; // e.g. "1AB National", "1C Provincial", "Mixed School"
  category: string;
  motto?: string;
  avatarUrl?: string | null;
  timezone: string;
  contactEmail?: string;
  telNo?: string;
  address?: string;
  establishedYear?: number;
  website?: string;
}

export interface SchoolCensusBinding {
  censusNo: string;
  districtName: string;
  provinceName: string;
  zoneName?: string;
  divisionName?: string;
  gnDivision?: string;
  difficultyLevel?: string;
  coordPrecision?: string;
  latitude: number | null;
  longitude: number | null;
  isGroundTruthed: boolean;
  cariTier?: string; // Resource equity index tier
  hasMiddayMeal: boolean;
}

export interface SchoolVitals {
  totalStudents: number;
  totalEducators: number;
  totalClassrooms: number;
  totalSections: number;
  attendanceRatePercent: number;
  activeSanctuaryBonds: number;
}

export interface SchoolLeadershipTenure {
  id: string;
  personName: string;
  nameSi?: string;
  nameTa?: string;
  roleTitle: string; // e.g. "Principal", "Deputy Principal", "Founding Head"
  tenureStart: string;
  tenureEnd?: string | null;
  isCurrent: boolean;
  citation?: string;
}

export interface SchoolSocietyItem {
  id: string;
  name: string;
  nameSi?: string;
  category: 'academic' | 'sports' | 'culture' | 'service';
  memberCount: number;
  establishedYear?: number;
}

export interface SchoolProfileData {
  fact: SchoolProfileFact;
  census: SchoolCensusBinding;
  vitals: SchoolVitals;
  rollOfHonor: SchoolLeadershipTenure[];
  societies: SchoolSocietyItem[];
  qrPayload: string;
  isEditable: boolean;
}

export interface ISchoolPort {
  getSchoolProfile(schoolId: string): Promise<SchoolProfileData>;
  updateSchoolProfile(
    schoolId: string,
    updates: Partial<SchoolProfileFact>,
  ): Promise<SchoolProfileData>;
  searchNationalSchools(
    query: string,
  ): Promise<Array<{ censusNo: string; name: string; district: string }>>;
}

export interface ISchoolStoragePort {
  saveSchoolProfile(schoolId: string, data: SchoolProfileData): Promise<void>;
  getCachedSchoolProfile(schoolId: string): Promise<SchoolProfileData | null>;
}
