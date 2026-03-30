/**
 * Sri Lankan School Types and Hierarchy Constants
 */

export const SRI_LANKAN_SCHOOL_TYPES = {
    // Government Schools (Official Classification)
    '1AB': {
        key: '1AB',
        en: 'National School (1AB)',
        si: '\u0DA2\u0DCF\u0DAD\u0DD2\u0D9A \u0DB4\u0DCF\u0DC3\u0DBD (1AB)',
        ta: '\u0BA4\u0BC7\u0B9A\u0BBF\u0BAF \u0BAA\u0BB3\u0BCD\u0BB3\u0BBF (1AB)',
        description: 'National schools with complete facilities and all streams',
    },
    '1C': {
        key: '1C',
        en: 'Provincial School (1C)',
        si: '\u0DB4\u0DC5\u0DCF\u0DAD\u0DCA \u0DB4\u0DCF\u0DC3\u0DBD (1C)',
        ta: '\u0BAE\u0BBE\u0B95\u0BBE\u0BA3 \u0BAA\u0BB3\u0BCD\u0BB3\u0BBF (1C)',
        description: 'Provincial schools with good facilities',
    },
    Type_2: {
        key: 'Type_2',
        en: 'Type_2 (Up to O/L)',
        si: '\u0DAF\u0DD9\u0DC0\u0DB1 \u0DC0\u0DBB\u0DCA\u0D9C\u0DBA (O/L \u0DAF\u0D9A\u0DCA\u0DC0\u0DCF)',
        ta: '\u0BB5\u0B95\u0BC8 2 (O/L \u0BB5\u0BB0\u0BC8)',
        description: 'Schools up to GCE O/L only',
    },
    Type_3: {
        key: 'Type_3',
        en: 'Type 3 (Primary)',
        si: '\u0DAD\u0DD4\u0DB1\u0DCA\u0DC0\u0DB1 \u0DC0\u0DBB\u0DCA\u0D9C\u0DBA (\u0DB4\u0DCA\u200D\u0DBB\u0DCF\u0DAE\u0DB8\u0DD2\u0D9A)',
        ta: '\u0BB5\u0B95\u0BC8 3 (\u0B86\u0BB0\u0BAE\u0BCD\u0BAA)',
        description: 'Primary schools (Grades 1-5)',
    },

    // Other School Types
    semi_government: {
        key: 'semi_government',
        en: 'Semi-Government',
        si: '\u0D85\u0DBB\u0DCA\u0DB0 \u0DBB\u0DCF\u0DA2\u0DCA\u200D\u0DBA',
        ta: '\u0B85\u0BB0\u0BC8 \u0B85\u0BB0\u0B9A\u0BC1',
        description: 'Semi-government schools',
    },
    private: {
        key: 'private',
        en: 'Private School',
        si: '\u0DB4\u0DDE\u0DAF\u0DCA\u0D9C\u0DBD\u0DD2\u0D9A \u0DB4\u0DCF\u0DC3\u0DBD',
        ta: '\u0BA4\u0BA9\u0BBF\u0BAF\u0BBE\u0BB0\u0BCD \u0BAA\u0BB3\u0BCD\u0BB3\u0BBF',
        description: 'Private schools',
    },
    international: {
        key: 'international',
        en: 'International School',
        si: '\u0DA2\u0DCF\u0DAD\u0DCA\u200D\u0DBA\u0DB1\u0DCA\u0DAD\u0DBB \u0DB4\u0DCF\u0DC3\u0DBD',
        ta: '\u0B9A\u0BB0\u0BCD\u0BB5\u0BA4\u0BC7\u0B9A \u0BAA\u0BB3\u0BCD\u0BB3\u0BBF',
        description: 'International schools (Cambridge, IB, etc.)',
    },
    pirivena: {
        key: 'pirivena',
        en: 'Pirivena',
        si: '\u0DB4\u0DD2\u0DBB\u0DD2\u0DC0\u0DD9\u0DB1',
        ta: '\u0BAA\u0BBF\u0BB0\u0BBF\u0BB5\u0BC7\u0BA9',
        description: 'Buddhist education institutions',
    },
    personal_workspace: {
        key: 'personal_workspace',
        en: 'Personal Workspace',
        si: '\u0DB4\u0DD4\u0DAF\u0DCA\u0D9C\u0DBD\u0DD2\u0D9A \u0DC0\u0DD0\u0DA9\u0DB6\u0DD2\u0DB8',
        ta: '\u0BA4\u0BA9\u0BBF\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F \u0BAA\u0BA3\u0BBF\u0BAF\u0BBF\u0B9F\u0BAE\u0BCD',
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
        si: '\u0DB4\u0DCA\u200D\u0DBB\u0DCF\u0DAE\u0DB8\u0DD2\u0D9A \u0D85\u0D82\u0DC1\u0DBA',
        ta: '\u0B86\u0BB0\u0BAE\u0BCD\u0BAA \u0BAA\u0BBF\u0BB0\u0BBF\u0BB5\u0BC1',
        gradeRange: '1-5',
        grades: [1, 2, 3, 4, 5],
    },
    junior: {
        key: 'junior',
        en: 'Junior Secondary',
        si: '\u0D9A\u0DB1\u0DD2\u0DC2\u0DCA\u0DA8 \u0DAF\u0DCA\u0DC0\u0DD2\u0DAD\u0DD3\u0DBA\u0DD2\u0D9A',
        ta: '\u0B87\u0BB3\u0BC8\u0BAF \u0B87\u0B9F\u0BC8\u0BA8\u0BBF\u0BB2\u0BC8',
        gradeRange: '6-9',
        grades: [6, 7, 8, 9],
    },
    senior: {
        key: 'senior',
        en: 'Senior Secondary',
        si: '\u0DA2\u0DCA\u200D\u0DBA\u0DD9\u0DC2\u0DCA\u0DA8 \u0DAF\u0DCA\u0DC0\u0DD2\u0DAD\u0DD3\u0DBA\u0DD2\u0D9A',
        ta: '\u0BAE\u0BC2\u0BA4\u0BCD\u0BA4 \u0B87\u0B9F\u0BC8\u0BA8\u0BBF\u0BB2\u0BC8',
        gradeRange: '10-13',
        grades: [10, 11, 12, 13],
    },
} as const;

export type SectionType = keyof typeof SCHOOL_SECTIONS;

/**
 * Sri Lankan Provinces
 */
export const SRI_LANKAN_PROVINCES = [
    { id: 'WP', en: 'Western', si: '\u0DB6\u0DC3\u0DCA\u0DB1\u0DCF\u0DC4\u0DD2\u0DBB', ta: '\u0BAE\u0BC7\u0BB2\u0BCD' },
    { id: 'CP', en: 'Central', si: '\u0DB8\u0DB0\u0DCA\u200D\u0DBA\u0DB8', ta: '\u0BAE\u0BA4\u0BCD\u0BA4\u0BBF\u0BAF' },
    { id: 'SP', en: 'Southern', si: '\u0DAF\u0D9A\u0DD4\u0DAB\u0DD4', ta: '\u0BA4\u0BC6\u0BA9\u0BCD' },
    { id: 'NW', en: 'North Western', si: '\u0DC0\u0DBA\u0DB9', ta: '\u0BB5\u0B9F \u0BAE\u0BC7\u0BB2\u0BCD' },
    { id: 'SG', en: 'Sabaragamuwa', si: '\u0DC3\u0DB6\u0DBB\u0D9C\u0DB8\u0DD4\u0DC0', ta: '\u0B9A\u0BAA\u0BCD\u0BB0\u0B95\u0BAE\u0BC1\u0BB5' },
    { id: 'EP', en: 'Eastern', si: '\u0DB1\u0DD0\u0D9C\u0DD9\u0DB1\u0DC4\u0DD2\u0DBB', ta: '\u0B95\u0BBF\u0BB4\u0B95\u0BCD\u0B95\u0BC1' },
    { id: 'UP', en: 'Uva', si: '\u0D8C\u0DC0', ta: '\u0B8A\u0BB5\u0BBE' },
    { id: 'NC', en: 'North Central', si: '\u0D8B\u0DAD\u0DD4\u0DBB\u0DD4 \u0DB8\u0DD0\u0DAF', ta: '\u0BB5\u0B9F \u0BAE\u0BA4\u0BCD\u0BA4\u0BBF\u0BAF' },
    { id: 'NP', en: 'Northern', si: '\u0D8B\u0DAD\u0DD4\u0DBB\u0DD4', ta: '\u0BB5\u0B9F' },
] as const;

export type ProvinceID = typeof SRI_LANKAN_PROVINCES[number]['id'];

/**
 * Sri Lankan Districts (for school location)
 */
export const SRI_LANKAN_DISTRICTS = [
    // Western Province (WP)
    { id: 'CO', provinceId: 'WP', en: 'Colombo', si: '\u0D9A\u0DDC\u0DC5\u0DB9', ta: '\u0B95\u0BCA\u0BB4\u0BC1\u0BAE\u0BCD\u0BAA\u0BC1' },
    { id: 'GA', provinceId: 'WP', en: 'Gampaha', si: '\u0D9C\u0DB8\u0DCA\u0DB4\u0DC4', ta: '\u0B95\u0BAE\u0BCD\u0BAA\u0BB9\u0BBE' },
    { id: 'KL', provinceId: 'WP', en: 'Kalutara', si: '\u0D9A\u0DC5\u0DD4\u0DAD\u0DBB', ta: '\u0B95\u0BB3\u0BC1\u0BA4\u0BCD\u0BA4\u0BC1\u0BB1\u0BC8' },

    // Central Province (CP)
    { id: 'KY', provinceId: 'CP', en: 'Kandy', si: '\u0DB8\u0DC4\u0DB1\u0DD4\u0DC0\u0DBB', ta: '\u0B95\u0BA3\u0BCD\u0B9F\u0BBF' },
    { id: 'MT', provinceId: 'CP', en: 'Matale', si: '\u0DB8\u0DCF\u0DAD\u0DBD\u0DDA', ta: '\u0BAE\u0BBE\u0BA4\u0BCD\u0BA4\u0BB3\u0BC8' },
    { id: 'NE', provinceId: 'CP', en: 'Nuwara Eliya', si: '\u0DB1\u0DD4\u0DC0\u0DBB\u0D91\u0DC5\u0DD2\u0DBA', ta: '\u0BA8\u0BC1\u0BB5\u0BB0\u0BC6\u0BB2\u0BBF\u0BAF\u0BBE' },

    // Southern Province (SP)
    { id: 'GL', provinceId: 'SP', en: 'Galle', si: '\u0D9C\u0DCF\u0DBD\u0DCA\u0DBD', ta: '\u0B95\u0BBE\u0BB2\u0BBF' },
    { id: 'MA', provinceId: 'SP', en: 'Matara', si: '\u0DB8\u0DCF\u0DAD\u0DBB', ta: '\u0BAE\u0BBE\u0BA4\u0BCD\u0BA4\u0BB1\u0BC8' },
    { id: 'HA', provinceId: 'SP', en: 'Hambantota', si: '\u0DC4\u0DB8\u0DCA\u0DB6\u0DB1\u0DCA\u0DAD\u0DDC\u0DA7', ta: '\u0B85\u0BAE\u0BCD\u0BAA\u0BBE\u0BA8\u0BCD\u0BA4\u0BCB\u0B9F\u0BCD\u0B9F\u0BC8' },

    // Northern Province (NP)
    { id: 'JA', provinceId: 'NP', en: 'Jaffna', si: '\u0DBA\u0DCF\u0DB4\u0DB1\u0DBA', ta: '\u0BAF\u0BBE\u0BB4\u0BCD\u0BAA\u0BCD\u0BAA\u0BBE\u0BA3\u0BAE\u0BCD' },
    { id: 'KI', provinceId: 'NP', en: 'Kilinochchi', si: '\u0D9A\u0DD2\u0DBD\u0DD2\u0DB1\u0DDC\u0DA0\u0DCA\u0DA0\u0DD2\u0DBA', ta: '\u0B95\u0BBF\u0BB3\u0BBF\u0BA8\u0DDC\u0B9A\u0BCD\u0B9A\u0BBF' },
    { id: 'MN', provinceId: 'NP', en: 'Mannar', si: '\u0DB8\u0DB1\u0DCA\u0DB1\u0DCF\u0DBB\u0DB8', ta: '\u0BAE\u0BA9\u0BCD\u0BA9\u0BBE\u0BB0\u0BCD' },
    { id: 'VA', provinceId: 'NP', en: 'Vavuniya', si: '\u0DC0\u0DC0\u0DD4\u0DB1\u0DD2\u0DBA\u0DCF\u0DC0', ta: '\u0BB5\u0BB5\u0BC1\u0BA9\u0BBF\u0BAF\u0BBE' },
    { id: 'MU', provinceId: 'NP', en: 'Mullaitivu', si: '\u0DB8\u0DD4\u0DBD\u0DAD\u0DD2\u0DC0\u0DCA', ta: '\u0BAE\u0BC1\u0BB2\u0BCD\u0BB2\u0BC8\u0BA4\u0BCD\u0BA4\u0BC0\u0BB5\u0BC1' },

    // Eastern Province (EP)
    { id: 'BT', provinceId: 'EP', en: 'Batticaloa', si: '\u0DB8\u0DA9\u0D9A\u0DBD\u0DB4\u0DD4\u0DC0', ta: '\u0BAE\u0B9F\u0BCD\u0B9F\u0B95\u0BCD\u0B95\u0BB3\u0BAA\u0BCD\u0BAA\u0BC1' },
    { id: 'AM', provinceId: 'EP', en: 'Ampara', si: '\u0D85\u0DB8\u0DCA\u0DB4\u0DCF\u0DBB', ta: '\u0B85\u0BAE\u0BCD\u0BAA\u0BBE\u0BB1\u0BC8' },
    { id: 'TR', provinceId: 'EP', en: 'Trincomalee', si: '\u0DAD\u0DCA\u200D\u0DBB\u0DD2\u0D9A\u0DD4\u0DAB\u0DCF\u0DB8\u0DBD\u0DBA', ta: '\u0BA4\u0BBF\u0BB0\u0BC1\u0B95\u0BCB\u0BA3\u0BAE\u0BB2\u0BC8' },

    // North Western Province (NW)
    { id: 'KU', provinceId: 'NW', en: 'Kurunegala', si: '\u0D9A\u0DD4\u0DBB\u0DD4\u0DAB\u0DD1\u0D9C\u0DBD', ta: '\u0B95\u0BC1\u0BB0\u0BC1\u0BA9\u0BBE\u0B95\u0BB2\u0BCD' },
    { id: 'PU', provinceId: 'NW', en: 'Puttalam', si: '\u0DB4\u0DD4\u0DAD\u0DCA\u0DAD\u0DBD\u0DB8', ta: '\u0BAA\u0BC1\u0BA4\u0BCD\u0BA4\u0BB3\u0BAE\u0BCD' },

    // North Central Province (NC)
    { id: 'AN', provinceId: 'NC', en: 'Anuradhapura', si: '\u0D85\u0DB1\u0DD4\u0DBB\u0DCF\u0DB0\u0DB4\u0DD4\u0DBB\u0DBA', ta: '\u0B85\u0BA9\u0BC1\u0BB0\u0BBE\u0BA4\u0BAA\u0BC1\u0BB0\u0BAE\u0BCD' },
    { id: 'PO', provinceId: 'NC', en: 'Polonnaruwa', si: '\u0DB4\u0DDC\u0DC5\u0DDC\u0DB1\u0DCA\u0DB1\u0DBB\u0DD4\u0DC0', ta: '\u0BAA\u0BCA\u0BB2\u0BA9\u0BCD\u0BA9\u0BB1\u0BC1\u0BB5\u0BC8' },

    // Uva Province (UP)
    { id: 'BD', provinceId: 'UP', en: 'Badulla', si: '\u0DB6\u0DAF\u0DD4\u0DBD\u0DCA\u0DBD', ta: '\u0BAA\u0BA4\u0BC1\u0BB3\u0BC8' },
    { id: 'MO', provinceId: 'UP', en: 'Moneragala', si: '\u0DB8\u0DDC\u0DAB\u0DBB\u0DCF\u0D9C\u0DBD', ta: '\u0BAE\u0BCA\u0BA3\u0BB0\u0BBE\u0B95\u0BB2\u0BC8' },

    // Sabaragamuwa Province (SG)
    { id: 'RG', provinceId: 'SG', en: 'Ratnapura', si: '\u0DBB\u0DAD\u0DCA\u0DB1\u0DB4\u0DD4\u0DBB', ta: '\u0B87\u0BB0\u0BA4\u0BCD\u0BA4\u0BBF\u0BA9\u0BAA\u0BC1\u0BB0\u0BBF' },
    { id: 'KE', provinceId: 'SG', en: 'Kegalle', si: '\u0D9A\u0DD1\u0D9C\u0DBD\u0DCA\u0DBD', ta: '\u0B95\u0BC7\u0B95\u0BBE\u0BB2\u0BC8' },
] as const;

export type DistrictID = typeof SRI_LANKAN_DISTRICTS[number]['id'];

/**
 * Common School Student Body Types in Sri Lanka
 */
export const STUDENT_TYPES = [
    { id: 'mixed', en: 'Mixed (Co-educational)', si: '\u0DB8\u0DD2\u0DC1\u0DCA\u200D\u0DBB', ta: '\u0B95\u0BB2\u0BAA\u0BCD\u0BAA\u0BC1' },
    { id: 'boys', en: 'Boys Only', si: '\u0DB4\u0DD2\u0DBB\u0DD2\u0DB8\u0DD2', ta: '\u0B86\u0BA3\u0BCD\u0B95\u0BB3\u0BCD' },
    { id: 'girls', en: 'Girls Only', si: '\u0D9C\u0DD0\u0DC4\u0DD0\u0DAB\u0DD4', ta: '\u0BAA\u0BC6\u0BA3\u0BCD\u0B95\u0BB3\u0BCD' },
] as const;

/**
 * Religious Affiliations for Sri Lankan Schools
 */
export const RELIGIOUS_AFFILIATIONS = [
    { id: 'secular', en: 'Secular / Non-denominational', si: '\u0DC3\u0DBB\u0DCA\u0DC0 \u0D86\u0D9C\u0DB8\u0DD2\u0D9A', ta: '\u0BAE\u0BA4\u0B9A\u0BCD\u0B9A\u0BBE\u0BB0\u0BCD\u0BAA\u0BB1\u0BCD\u0BB1' },
    { id: 'buddhist', en: 'Buddhist', si: '\u0DB6\u0DDE\u0DAF\u0DCA\u0DB0', ta: '\u0BAA\u0BCC\u0BA4\u0BCD\u0BA4' },
    { id: 'catholic', en: 'Catholic', si: '\u0D9A\u0DAD\u0DDD\u0DBD\u0DD2\u0D9A', ta: '\u0B95\u0BA4\u0BCD\u0BA4\u0BCB\u0BB2\u0BBF\u0B95\u0BCD\u0B95' },
    { id: 'christian', en: 'Christian', si: '\u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DC3\u0DCA\u0DAD\u0DD2\u0DBA\u0DCF\u0DB1\u0DD2', ta: '\u0B95\u0BBF\u0BB1\u0BBF\u0BB8\u0BCD\u0BA4\u0BB5' },
    { id: 'hindu', en: 'Hindu', si: '\u0DC4\u0DD2\u0DB1\u0DCA\u0DAF\u0DD4', ta: '\u0B87\u0BA8\u0BCD\u0BA4\u0BC1' },
    { id: 'islamic', en: 'Islamic', si: '\u0D89\u0DC3\u0DCA\u0DBD\u0DCF\u0DB8\u0DD3\u0DBA', ta: '\u0B87\u0BB8\u0BCD\u0BB2\u0BBE\u0BAE\u0BBF\u0BAF' },
] as const;

/**
 * Syllabus Versions (Legacy vs 2026 Reforms)
 */
export const SYLLABUS_VERSIONS = [
    { id: 'legacy', en: 'Existing Syllabus', si: '\u0DB4\u0DC0\u0DAD\u0DD2\u0DB1 \u0DC0\u0DD2\u0DC2\u0DBA \u0DB1\u0DD2\u0DBB\u0DCA\u0DAF\u0DDA\u0DC1\u0DBA', ta: '\u0BA4\u0BB1\u0BCD\u0BAA\u0BCB\u0BA4\u0BC1\u0BB3\u0BCD\u0BB3 \u0BAA\u0BBE\u0B9F\u0BA4\u0BCD\u0BA4\u0BBF\u0B9F\u0BCD\u0B9F\u0BAE\u0BCD' },
    { id: 'reform2026', en: 'New Reform (2026)', si: '\u0DB1\u0DC0 \u0DB4\u0DCA\u200D\u0DBB\u0DAD\u0DD2\u0DC3\u0D82\u0DC3\u0DCA\u0D9A\u0DBB\u0DAB (2026)', ta: '\u0DB1\u0DC0 \u0DB4\u0DCA\u200D\u0DBB\u0DAD\u0DD2\u0DC3\u0D82\u0DC3\u0DCA\u0D9A\u0DBB\u0DAB (2026)' },
] as const;

/**
 * Sri Lankan Subjects by Level
 */
export const SRI_LANKAN_SUBJECTS_BY_LEVEL = {
    primary: [
        { id: 'math', en: 'Mathematics', si: '\u0D9C\u0DAB\u0DD2\u0DAD\u0DBA', ta: '\u0B95\u0BA3\u0BBF\u0BA4\u0BAE\u0BCD' },
        { id: 'env', en: 'Environment', si: '\u0DB4\u0DBB\u0DD2\u0DC3\u0DBB\u0DBA', ta: '\u0B9A\u0BC1\u0BB1\u0BCD\u0BB1\u0BC1\u0B9A\u0BCD\u0B9A\u0BC2\u0BB4\u0BB2\u0BCD' },
        { id: 'rel', en: 'Religion', si: '\u0D86\u0D9C\u0DB8', ta: '\u0B9A\u0BAE\u0BAF\u0BAE\u0BCD' },
        { id: 'lang', en: 'Mother Tongue', si: '\u0DB8\u0DC0\u0DCA \u0DB7\u0DCF\u0DC2\u0DCF\u0DC0', ta: '\u0BA4\u0BBE\u0BAF\u0BCD\u0BAE\u0BCA\u0BB4\u0BBF' },
        { id: 'eng', en: 'English', si: '\u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2', ta: '\u0B86\u0B99\u0BCD\u0B95\u0BBF\u0BB2\u0BAE\u0BCD' },
    ],
    junior: [
        { id: 'math', en: 'Mathematics', si: '\u0D9C\u0DAB\u0DD2\u0DAD\u0DBA', ta: '\u0B95\u0BA3\u0BBF\u0BA4\u0BAE\u0BCD' },
        { id: 'sci', en: 'Science', si: '\u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DC0', ta: '\u0B85\u0BB1\u0BBF\u0BB5\u0BBF\u0BAF\u0BB2\u0BCD' },
        { id: 'his', en: 'History', si: '\u0D89\u0DAD\u0DD2\u0DC4\u0DCF\u0DC3\u0DBA', ta: '\u0BB5\u0BB0\u0BB2\u0BBE\u0BB1\u0BC1' },
        { id: 'eng', en: 'English', si: '\u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2', ta: '\u0B86\u0B99\u0BCD\u0B95\u0BBF\u0BB2\u0BAE\u0BCD' },
        { id: 'lang', en: 'Mother Tongue', si: '\u0DB8\u0DC0\u0DCA \u0DB7\u0DCF\u0DC2\u0DCF\u0DC0', ta: '\u0BA4\u0BBE\u0BAF\u0BCD\u0BAE\u0BCA\u0BB4\u0BBF' },
        { id: 'geo', en: 'Geography', si: '\u0DB7\u0DD6\u0D9C\u0DDD\u0DBD \u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DC0', ta: '\u0BAA\u0BC1\u0BB5\u0BBF\u0BAF\u0BBF\u0BAF\u0BB2\u0BCD' },
        { id: 'civ', en: 'Civic Education', si: '\u0DB4\u0DD4\u0DBB\u0DC0\u0DD0\u0DC3\u0DD2 \u0D85\u0DB0\u0DCA\u200D\u0DBA\u0DCF\u0DB4\u0DB1\u0DBA', ta: '\u0B95\u0BC1\u0B9F\u0BBF\u0BAF\u0BBF\u0BAF\u0BB2\u0BCD \u0B95\u0BB2\u0BCD\u0BB5\u0BBF' },
        { id: 'ict', en: 'ICT', si: '\u0DAD\u0DDC\u0DBB\u0DAD\u0DD4\u0DBB\u0DD4 \u0DAD\u0DCF\u0D9A\u0DCA\u0DC2\u0DAB\u0DBA', ta: '\u0BA4\u0B95\u0BB5\u0BB2\u0BCD \u0BA4\u0BCA\u0BB4\u0BBF\u0BB2\u0BCD\u0BA8\u0BC1\u0B9F\u0BCD\u0BAA\u0BAE\u0BCD' },
        { id: 'pts', en: 'Practical & Tech Skills', si: '\u0DB4\u0DCA\u200D\u0DBB\u0DCF\u0DBA\u0DDD\u0D9C\u0DD2\u0D9A \u0DC4\u0DCF \u0DAD\u0DCF\u0D9A\u0DCA\u0DC2\u0DAB\u0DD2\u0D9A \u0D9A\u0DD4\u0DC3\u0DBD\u0DAD\u0DCF', ta: '\u0BA8\u0B9F\u0BC8\u0BAE\u0BC1\u0BB1\u0BC8 \u0BAE\u0BB1\u0BCD\u0BB1\u0BC1\u0BAE\u0BCD \u0BA4\u0BCA\u0BB4\u0BBF\u0BB2\u0BCD\u0BA8\u0BC1\u0B9F\u0BCD\u0BAA \u0BA4\u0BBF\u0BB1\u0BA9\u0BCD\u0B95\u0BB3\u0BCD' },
    ],
    ordinary_level: [
        { id: 'math', en: 'Mathematics', si: '\u0D9C\u0DAB\u0DD2\u0DAD\u0DBA', ta: '\u0B95\u0BA3\u0BBF\u0BA4\u0BAE\u0BCD' },
        { id: 'sci', en: 'Science', si: '\u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DC0', ta: '\u0B85\u0BB1\u0BBF\u0BB5\u0BBF\u0BAF\u0BB2\u0BCD' },
        { id: 'his', en: 'History', si: '\u0D89\u0DAD\u0DD2\u0DC4\u0DCF\u0DC3\u0DBA', ta: '\u0BB5\u0BB0\u0BB2\u0BBE\u0BB1\u0BC1' },
        { id: 'eng', en: 'English', si: '\u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2', ta: '\u0B86\u0B99\u0BCD\u0B95\u0BBF\u0BB2\u0BAE\u0BCD' },
        { id: 'lang', en: 'Mother Tongue', si: '\u0DB8\u0DC0\u0DCA \u0DB7\u0DCF\u0DC2\u0DCF\u0DC0', ta: '\u0BA4\u0BBE\u0BAF\u0BCD\u0BAE\u0BCA\u0BB4\u0BBF' },
        { id: 'rel', en: 'Religion', si: '\u0D86\u0D9C\u0DB8', ta: '\u0B9A\u0BAE\u0BAF\u0BAE\u0BCD' },
        // Basket 1
        { id: 'bus', en: 'Business & Accounting', si: '\u0DC0\u0DCA\u200D\u0DBA\u0DCF\u0DB4\u0DCF\u0DBB \u0DC4\u0DCF \u0D9C\u0DD2\u0DAB\u0DD4\u0DB8\u0DCA\u0D9A\u0DBB\u0DAB\u0DBA', ta: '\u0BB5\u0BA3\u0BBF\u0B95\u0BAE\u0BCD \u0BAE\u0BB1\u0BCD\u0BB1\u0BC1\u0BAE\u0BCD \u0B95\u0BA3\u0B95\u0BCD\u0B95\u0BBF\u0BAF\u0BB2\u0BCD' },
        { id: 'civ', en: 'Civic Education', si: '\u0DB4\u0DD4\u0DBB\u0DC0\u0DD0\u0DC3\u0DD2 \u0D85\u0DB0\u0DCA\u200D\u0DBA\u0DCF\u0DB4\u0DB1\u0DBA', ta: '\u0B95\u0BC1\u0B9F\u0BBF\u0BAF\u0BBF\u0BAF\u0BB2\u0BCD \u0B95\u0BB2\u0BCD\u0BB5\u0BBF' },
        // Aesthetics
        { id: 'art', en: 'Art', si: '\u0DA0\u0DD2\u0DAD\u0DCA\u200D\u0DBB', ta: '\u0B9A\u0BBF\u0BA4\u0BCD\u0BA4\u0BBF\u0BB0\u0BAE\u0BCD' },
        { id: 'mus', en: 'Music', si: '\u0DC3\u0D82\u0D9C\u0DD3\u0DAD\u0DBA', ta: '\u0B9A\u0B99\u0BCD\u0B95\u0BC0\u0BA4\u0BAE\u0BCD' },
        { id: 'dan', en: 'Dancing', si: '\u0DB1\u0DBB\u0DCA\u0DAD\u0DB1\u0DBA', ta: '\u0BA8\u0B9F\u0BA9\u0BAE\u0BCD' },
        // Tech
        { id: 'ict', en: 'ICT', si: '\u0DAD\u0DDC\u0DBB\u0DAD\u0DD4\u0DBB\u0DD4 \u0DAD\u0DCF\u0D9A\u0DCA\u0DC2\u0DAB\u0DBA', ta: '\u0BA4\u0B95\u0BB5\u0BB2\u0BCD \u0BA4\u0BCA\u0BB4\u0BBF\u0BB2\u0BCD\u0BA8\u0BC1\u0B9F\u0BCD\u0BAA\u0BAE\u0BCD' },
        { id: 'agri', en: 'Agriculture', si: '\u0D9A\u0DD8\u0DC2\u0DD2\u0D9A\u0DBB\u0DCA\u0DB8\u0DBA', ta: '\u0BB5\u0BBF\u0BB5\u0B9A\u0BBE\u0BAF\u0BAE\u0BCD' },
    ],
    advanced_level: [
        // Science
        { id: 'phy', en: 'Physics', si: '\u0DB7\u0DDE\u0DAD\u0DD2\u0D9A \u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DC0', ta: '\u0BAA\u0BCC\u0BA4\u0BBF\u0B95\u0BB5\u0BBF\u0BAF\u0BB2\u0BCD' },
        { id: 'che', en: 'Chemistry', si: '\u0DBB\u0DC3\u0DCF\u0DBA\u0DB1 \u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DC0', ta: '\u0B87\u0BB0\u0B9A\u0BBE\u0BAF\u0BA9\u0BB5\u0BBF\u0BAF\u0BB2\u0BCD' },
        { id: 'bio', en: 'Biology', si: '\u0DA2\u0DD3\u0DC0 \u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DC0', ta: '\u0B89\u0BAF\u0BBF\u0BB0\u0BBF\u0BAF\u0BB2\u0BCD' },
        { id: 'com_math', en: 'Combined Maths', si: '\u0DC3\u0D82\u0DBA\u0DD4\u0D9A\u0DCA\u0DAD \u0D9C\u0DAB\u0DD2\u0DAD\u0DBA', ta: '\u0B87\u0BA3\u0BC8\u0BA8\u0BCD\u0BA4 \u0B95\u0BA3\u0BBF\u0BA4\u0BAE\u0BCD' },
        // Commerce
        { id: 'acc', en: 'Accounting', si: '\u0D9C\u0DD2\u0DAB\u0DD4\u0DB8\u0DCA\u0D9A\u0DBB\u0DAB\u0DBA', ta: '\u0B95\u0BA3\u0B95\u0BCD\u0B95\u0BBF\u0BAF\u0BB2\u0BCD' },
        { id: 'bst', en: 'Business Studies', si: '\u0DC0\u0DCA\u200D\u0DBA\u0DCF\u0DB4\u0DCF\u0DBB \u0D85\u0DB0\u0DCA\u200D\u0DBA\u0DBA\u0DB1\u0DBA', ta: '\u0BB5\u0BA3\u0BBF\u0B95 \u0B86\u0BAF\u0BCD\u0BB5\u0BC1\u0B95\u0BB3\u0BCD' },
        { id: 'eco', en: 'Economics', si: '\u0D86\u0DBB\u0DCA\u0DAE\u0DD2\u0D9A \u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DC0', ta: '\u0BAA\u0BCA\u0BB0\u0BC1\u0BB3\u0BBF\u0BAF\u0BB2\u0BCD' },
        // Arts/Tech
        { id: 'ict', en: 'ICT', si: '\u0DAD\u0DDC\u0DBB\u0DAD\u0DD4\u0DBB\u0DD4 \u0DAD\u0DCF\u0D9A\u0DCA\u0DC2\u0DAB\u0DBA', ta: '\u0BA4\u0B95\u0BB5\u0BB2\u0BCD \u0BA4\u0BCA\u0BB4\u0BBF\u0BB2\u0BCD\u0BA8\u0BC1\u0B9F\u0BCD\u0BAA\u0BAE\u0BCD' },
        { id: 'pol', en: 'Political Science', si: '\u0DAF\u0DDA\u0DC1\u0DB4\u0DCF\u0DBD\u0DB1 \u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DC0', ta: '\u0B85\u0BB0\u0B9A\u0BBF\u0BAF\u0BB2\u0BCD \u0B85\u0BB1\u0BBF\u0BB5\u0BBF\u0BAF\u0BB2\u0BCD' },
        { id: 'sft', en: 'Science for Tech', si: '\u0DAD\u0DCF\u0D9A\u0DCA\u0DC2\u0DAB\u0DBA \u0DC3\u0DB3\u0DC4\u0DCF \u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DC0', ta: '\u0BA4\u0BCA\u0BB4\u0BBF\u0BB2\u0BCD\u0BA8\u0BC1\u0B9F\u0BCD\u0BAA\u0BA4\u0BCD\u0BA4\u0BBF\u0BB1\u0BCD\u0B95\u0BBE\u0BA9 \u0B85\u0BB1\u0BBF\u0BB5\u0BBF\u0BAF\u0BB2\u0BCD' },
        { id: 'et', en: 'Engineering Tech', si: '\u0D89\u0D82\u0DA2\u0DD2\u0DB1\u0DDA\u0DBB\u0DD4 \u0DAD\u0DCF\u0D9A\u0DCA\u0DC2\u0DAB\u0DBA', ta: '\u0BAA\u0BCA\u0BB1\u0BBF\u0BAF\u0BBF\u0BAF\u0BB2\u0BCD \u0BA4\u0BCA\u0BB4\u0BBF\u0BB2\u0BCD\u0BA8\u0BC1\u0B9F\u0BCD\u0BAA\u0BAE\u0BCD' },
        { id: 'bt', en: 'Bio Systems Tech', si: '\u0DA2\u0DDB\u0DC0 \u0DB4\u0DAF\u0DCA\u0DB0\u0DAD\u0DD2 \u0DAD\u0DCF\u0D9A\u0DCA\u0DC2\u0DAB\u0DBA', ta: '\u0B89\u0BAF\u0BBF\u0BB0\u0BCD \u0BAA\u0DAF\u0DCA\u0DB0\u0BA4\u0BBF \u0BA4\u0BCA\u0BB4\u0BBF\u0BB2\u0BCD\u0BA8\u0BC1\u0B9F\u0BCD\u0BAA\u0BAE\u0BCD' },
    ],
} as const;

/**
 * Library Resource Categories
 * Expanded to include Teacher Guides, Pedagogy, etc.
 */
export const LIBRARY_RESOURCE_CATEGORIES = [
    { id: 'lesson', en: 'Lessons', si: '\u0DB4\u0DCF\u0DA9\u0DB8\u0DCA', ta: '\u0BAA\u0BBE\u0B9F\u0B99\u0BCD\u0B95\u0BB3\u0BCD' },
    { id: 'worksheet', en: 'Worksheets', si: '\u0DC0\u0DD0\u0DA9\u0DB4\u0DAD\u0DCA', ta: '\u0BAA\u0BA3\u0BBF\u0BA4\u0BCD\u0BA4\u0BBE\u0BB3\u0BCD\u0B95\u0BB3\u0BCD' },
    { id: 'guide', en: 'Teacher Guides', si: '\u0D9C\u0DD4\u0DBB\u0DD4 \u0DB8\u0DCF\u0DBB\u0DCA\u0D9C\u0DDD\u0DB4\u0DAF\u0DDA\u0DC1', ta: '\u0B86\u0B9A\u0BBF\u0BB0\u0BBF\u0BAF\u0BB0\u0BCD \u0BB5\u0BB4\u0BBF\u0B95\u0BBE\u0B9F\u0BCD\u0B9F\u0BBF\u0B95\u0BB3\u0BCD' },
    { id: 'reading', en: 'Reading Materials', si: '\u0D9A\u0DD2\u0DBA\u0DC0\u0DD3\u0DB8\u0DDA \u0DAF\u0DCA\u200D\u0DBB\u0DC0\u0DCA\u200D\u0DBA', ta: '\u0BB5\u0BBE\u0B9A\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1\u0BAA\u0BCD \u0BAA\u0BCA\u0BB0\u0BC1\u0B9F\u0BCD\u0B95\u0BB3\u0BCD' },
    { id: 'pedagogy', en: 'Pedagogy', si: '\u0D85\u0DB0\u0DCA\u200D\u0DBA\u0DCF\u0DB4\u0DB1\u0DD2\u0D9A \u0DC1\u0DCF\u0DC3\u0DCA\u0DAD\u0DCA\u200D\u0DBB\u0DBA', ta: '\u0B95\u0BB1\u0BCD\u0BAA\u0BBF\u0BA4\u0BCD\u0BA4\u0BB2\u0BCD \u0BAE\u0BC1\u0BB1\u0BC8' },
    { id: 'video', en: 'Videos', si: '\u0DC0\u0DD3\u0DA9\u0DD2\u0DBA\u0DDD', ta: '\u0B95\u0BBE\u0BA3\u0BCA\u0BB3\u0BBF\u0B95\u0BB3\u0BCD' },
    { id: 'link', en: 'External Links', si: '\u0DB6\u0DCF\u0DC4\u0DD2\u0DBB \u0DC3\u0DB6\u0DD0\u0DB3\u0DD2', ta: '\u0BB5\u0BC6\u0BB3\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1\u0BB1 \u0B87\u0BA3\u0BC8\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD' },
    // Holistic library expansion
    { id: 'map', en: 'Maps & Visuals', si: '\u0DC3\u0DD2\u0DAD\u0DD2\u0DBA\u0DB8\u0DCA \u0DC3\u0DC4 \u0DAF\u0DD8\u0DC1\u0DCA\u200D\u0DBA', ta: '\u0BB5\u0BB0\u0BC8\u0BAA\u0B9F\u0B99\u0BCD\u0B95\u0BB3\u0BCD & \u0B95\u0BBE\u0B9F\u0BCD\u0B9A\u0BBF\u0B95\u0BB3\u0BCD' },
    { id: 'infographic', en: 'Infographics', si: '\u0DAD\u0DDC\u0DBB\u0DAD\u0DD4\u0DBB\u0DD4 \u0DBB\u0DD6\u0DB4', ta: '\u0BA4\u0B95\u0BB5\u0BB2\u0BCD \u0BB5\u0BB0\u0BC8\u0B95\u0BB2\u0BC8\u0B95\u0BB3\u0BCD' },
    { id: 'story', en: 'Stories', si: '\u0D9A\u0DAE\u0DCF', ta: '\u0B95\u0BA4\u0BC8\u0B95\u0BB3\u0BCD' },
    { id: 'circular', en: 'Edu Circulars', si: '\u0DBB\u0DA2\u0DBA\u0DDA \u0DA0\u0D9A\u0DCA\u200D\u0DBB\u0DBD\u0DDA\u0D9B', ta: '\u0B85\u0BB0\u0B9A\u0BC1 \u0B9A\u0BC1\u0BB1\u0BCD\u0BB1\u0BB1\u0BBF\u0B95\u0BCD\u0B95\u0BC8\u0B95\u0BB3\u0BCD' },
    { id: 'movie_trailer', en: 'Inspiring Films', si: '\u0D86\u0DB1\u0DD4\u0DB7\u0DCF\u0DC0\u0DD3 \u0DA0\u0DD2\u0DAD\u0DCA\u200D\u0DBB\u0DB4\u0DA7', ta: '\u0B8A\u0B95\u0BCD\u0B95\u0DB8\u0BB3\u0BBF\u0B95\u0BCD\u0B95\u0BC1\u0BAE\u0BCD \u0BA4\u0BBF\u0BB0\u0BC8\u0BAA\u0BCD\u0BAA\u0B9F\u0B99\u0BCD\u0B95\u0BB3\u0BCD' },
    { id: 'tech_guide', en: 'Tech Guides', si: '\u0DAD\u0DCF\u0D9A\u0DCA\u0DC2\u0DAB \u0DB8\u0DCF\u0DBB\u0DCA\u0D9C\u0DDD\u0DB4\u0DAF\u0DDA\u0DC1', ta: '\u0BA4\u0BCA\u0BB4\u0BBF\u0BB2\u0BCD\u0BA8\u0BC1\u0B9F\u0BCD\u0BAA \u0BB5\u0BB4\u0BBF\u0B95\u0BBE\u0B9F\u0BCD\u0B9F\u0BBF\u0B95\u0BB3\u0BCD' },
    { id: 'other', en: 'Other Resources', si: '\u0DC0\u0DD9\u0DB1\u0DAD\u0DCA \u0DC3\u0DB8\u0DCA\u0DB4\u0DAD\u0DCA', ta: '\u0BAE\u0BB1\u0BCD\u0BB1 \u0BB5\u0BB3\u0B99\u0BCD\u0B95\u0BB3\u0BCD' },
] as const;

/**
 * Classroom Themes
 */
export const CLASSROOM_THEMES = [
    { id: 'saffron', color: '#F59E0B', en: 'Saffron', si: '\u0DC3\u0DD0\u0DC6\u0DCA\u0DBB\u0DB1\u0DCA', ta: '\u0B95\u0BC1\u0B99\u0BCD\u0B95\u0BC1\u0BAE\u0BAA\u0BCD\u0BAA\u0BC2' },
    { id: 'ocean', color: '#0EA5E9', en: 'Ocean', si: '\u0DC3\u0DCF\u0D9C\u0DBB', ta: '\u0B95\u0B9F\u0BB2\u0BCD' },
    { id: 'emerald', color: '#10B981', en: 'Emerald', si: '\u0DB8\u0DBB\u0D9A\u0DAD', ta: '\u0DB8\u0DBB\u0D9A\u0DAD' },
    { id: 'orchid', color: '#8B5CF6', en: 'Orchid', si: '\u0D95\u0D9A\u0DD2\u0DA9\u0DCA', ta: '\u0B86\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BBF\u0B9F\u0BC1' },
    { id: 'rose', color: '#F43F5E', en: 'Rose', si: '\u0DBB\u0DDD\u0DC3', ta: '\u0BB0\u0BCB\u0B9C\u0BBE' },
    { id: 'slate', color: '#64748B', en: 'Slate', si: '\u0DC3\u0DCA\u0DBD\u0DD9\u0DA7\u0DCA', ta: '\u0BB8\u0BCD\u0BB2\u0BC7\u0B9F\u0BCD' },
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
 * Get grades for a section
 */
export function getGradesForSection(section: SectionType): number[] {
    const sec = SCHOOL_SECTIONS[section] as any;
    return sec?.grades || [];
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
