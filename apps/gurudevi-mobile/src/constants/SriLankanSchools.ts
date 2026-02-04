/**
 * Sri Lankan School Types and Hierarchy Constants
 */

export const SRI_LANKAN_SCHOOL_TYPES = {
    // Government Schools (Official Classification)
    '1AB': {
        key: '1AB',
        en: 'National School (1AB)',
        si: 'ජාතික පාසල (1AB)',
        ta: 'தேசிய பள்ளி (1AB)',
        description: 'National schools with complete facilities and all streams',
    },
    '1C': {
        key: '1C',
        en: 'Provincial School (1C)',
        si: 'පළාත් පාසල (1C)',
        ta: 'மாகாண பள்ளி (1C)',
        description: 'Provincial schools with good facilities',
    },
    Type_2: {
        key: 'Type_2',
        en: 'Type 2 (Up to O/L)',
        si: 'දෙවන වර්ගය (O/L දක්වා)',
        ta: 'வகை 2 (O/L வரை)',
        description: 'Schools up to GCE O/L only',
    },
    Type_3: {
        key: 'Type_3',
        en: 'Type 3 (Primary)',
        si: 'තුන්වන වර්ගය (ප්‍රාථමික)',
        ta: 'வகை 3 (ஆரம்ப)',
        description: 'Primary schools (Grades 1-5)',
    },

    // Other School Types
    semi_government: {
        key: 'semi_government',
        en: 'Semi-Government',
        si: 'අර්ධ රාජ්‍ය',
        ta: 'அரை அரசு',
        description: 'Semi-government schools',
    },
    private: {
        key: 'private',
        en: 'Private School',
        si: 'පෞද්ගලික පාසල',
        ta: 'தனியார் பள்ளி',
        description: 'Private schools',
    },
    international: {
        key: 'international',
        en: 'International School',
        si: 'ජාත්‍යන්තර පාසල',
        ta: 'சர்வதேச பள்ளி',
        description: 'International schools (Cambridge, IB, etc.)',
    },
    pirivena: {
        key: 'pirivena',
        en: 'Pirivena',
        si: 'පිරිවෙන',
        ta: 'பிரிவேன',
        description: 'Buddhist education institutions',
    },
    personal_workspace: {
        key: 'personal_workspace',
        en: 'Personal Workspace',
        si: 'පුද්ගලික වැඩබිම',
        ta: 'தனிப்பட்ட பணியிடம்',
        description: 'Solo teacher workspace (can join school later)',
    },
} as const;

export type SchoolType = keyof typeof SRI_LANKAN_SCHOOL_TYPES;

/**
 * School Sections (Primary, Junior, Senior)
 */
export const SCHOOL_SECTIONS = {
    primary: {
        key: 'primary',
        en: 'Primary Section',
        si: 'ප්‍රාථමික අංශය',
        ta: 'ஆரம்ப பிரிவு',
        gradeRange: '1-5',
        grades: [1, 2, 3, 4, 5],
    },
    junior: {
        key: 'junior',
        en: 'Junior Secondary',
        si: 'කනිෂ්ඨ ද්විතීයික',
        ta: 'இளைய இடைநிலை',
        gradeRange: '6-9',
        grades: [6, 7, 8, 9],
    },
    senior: {
        key: 'senior',
        en: 'Senior Secondary',
        si: 'ජ්‍යෙෂ්ඨ ද්විතීයික',
        ta: 'மூத்த இடைநிலை',
        gradeRange: '10-13',
        grades: [10, 11, 12, 13],
    },
} as const;

export type SectionType = keyof typeof SCHOOL_SECTIONS;

/**
 * User Roles with Hierarchy
 */
export const USER_ROLES = {
    principal: {
        key: 'principal',
        en: 'Principal',
        si: 'විදුහල්පතිවරයා',
        ta: 'அதிபர்',
        level: 1, // Highest
        navigationTab: 'school', // Shows entire school
    },
    section_head: {
        key: 'section_head',
        en: 'Section Head',
        si: 'අංශ ප්‍රධානී',
        ta: 'பிரிவு தலைவர்',
        level: 2,
        navigationTab: 'section', // Shows their section only
    },
    grade_head: {
        key: 'grade_head',
        en: 'Grade Head',
        si: 'ශ්‍රේණි ප්‍රධානී',
        ta: 'வகுப்பு தலைவர்',
        level: 3,
        navigationTab: 'grade', // Shows their grade only
    },
    teacher: {
        key: 'teacher',
        en: 'Teacher',
        si: 'ගුරුවරයා',
        ta: 'ஆசிரியர்',
        level: 4,
        navigationTab: 'classroom', // Shows assigned classes only
    },
    student: {
        key: 'student',
        en: 'Student',
        si: 'ශිෂ්‍යයා',
        ta: 'மாணவர்',
        level: 5,
        navigationTab: 'classroom', // Shows own class only
    },
} as const;

export type UserRole = keyof typeof USER_ROLES;

/**
 * Sri Lankan Districts (for school location)
 */
export const SRI_LANKAN_DISTRICTS = [
    { en: 'Colombo', si: 'කොළඹ', ta: 'கொழும்பு' },
    { en: 'Gampaha', si: 'ගම්පහ', ta: 'கம்பஹா' },
    { en: 'Kalutara', si: 'කළුතර', ta: 'களுத்துறை' },
    { en: 'Kandy', si: 'මහනුවර', ta: 'கண்டி' },
    { en: 'Matale', si: 'මාතලේ', ta: 'மாத்தளை' },
    { en: 'Nuwara Eliya', si: 'නුවරඑළිය', ta: 'நுவரெலியா' },
    { en: 'Galle', si: 'ගාල්ල', ta: 'காலி' },
    { en: 'Matara', si: 'මාතර', ta: 'மாத்தறை' },
    { en: 'Hambantota', si: 'හම්බන්තොට', ta: 'அம்பாந்தோட்டை' },
    { en: 'Jaffna', si: 'යාපනය', ta: 'யாழ்ப்பாணம்' },
    { en: 'Kilinochchi', si: 'කිලිනොච්චිය', ta: 'கிளிநொச்சி' },
    { en: 'Mannar', si: 'මන්නාරම', ta: 'மன்னார்' },
    { en: 'Vavuniya', si: 'වවුනියාව', ta: 'வவுனியா' },
    { en: 'Mullaitivu', si: 'මුලතිව්', ta: 'முல்லைத்தீவு' },
    { en: 'Batticaloa', si: 'මඩකලපුව', ta: 'மட்டக்களப்பு' },
    { en: 'Ampara', si: 'අම්පාර', ta: 'அம்பாறை' },
    { en: 'Trincomalee', si: 'ත්‍රිකුණාමලය', ta: 'திருகோணமலை' },
    { en: 'Kurunegala', si: 'කුරුණෑගල', ta: 'குருனாகல்' },
    { en: 'Puttalam', si: 'පුත්තලම', ta: 'புத்தளம்' },
    { en: 'Anuradhapura', si: 'අනුරාධපුරය', ta: 'அனுராதபுரம்' },
    { en: 'Polonnaruwa', si: 'පොළොන්නරුව', ta: 'பொலன்னறுவை' },
    { en: 'Badulla', si: 'බදුල්ල', ta: 'பதுளை' },
    { en: 'Moneragala', si: 'මොණරාගල', ta: 'மொணராகலை' },
    { en: 'Ratnapura', si: 'රත්නපුර', ta: 'இரத்தினபுரி' },
    { en: 'Kegalle', si: 'කෑගල්ල', ta: 'கேகாலை' },
] as const;

/**
 * Get school type display name by language
 */
export function getSchoolTypeLabel(
    type: SchoolType,
    language: 'en' | 'si' | 'ta' = 'en'
): string {
    return SRI_LANKAN_SCHOOL_TYPES[type]?.[language] || type;
}

/**
 * Get section display name by language
 */
export function getSectionLabel(
    section: SectionType,
    language: 'en' | 'si' | 'ta' = 'en'
): string {
    return SCHOOL_SECTIONS[section]?.[language] || section;
}

/**
 * Get role display name by language
 */
export function getRoleLabel(
    role: UserRole,
    language: 'en' | 'si' | 'ta' = 'en'
): string {
    return USER_ROLES[role]?.[language] || role;
}

/**
 * Get grades for a section
 */
export function getGradesForSection(section: SectionType): number[] {
    return SCHOOL_SECTIONS[section]?.grades || [];
}

/**
 * Determine which section a grade belongs to
 */
export function getSectionForGrade(gradeNumber: number): SectionType | null {
    if (gradeNumber >= 1 && gradeNumber <= 5) return 'primary';
    if (gradeNumber >= 6 && gradeNumber <= 9) return 'junior';
    if (gradeNumber >= 10 && gradeNumber <= 13) return 'senior';
    return null;
}
