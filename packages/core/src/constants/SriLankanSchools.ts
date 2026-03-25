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
        en: 'Type_2 (Up to O/L)',
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
 * Sri Lankan Provinces
 */
export const SRI_LANKAN_PROVINCES = [
    { id: 'WP', en: 'Western', si: 'බස්නාහිර', ta: 'மேல்' },
    { id: 'CP', en: 'Central', si: 'මධ්‍යම', ta: 'மத்திய' },
    { id: 'SP', en: 'Southern', si: 'දකුණු', ta: 'தென்' },
    { id: 'NW', en: 'North Western', si: 'වයඹ', ta: 'வட மேல்' },
    { id: 'SG', en: 'Sabaragamuwa', si: 'සබරගමුව', ta: 'சப்ரகமுவ' },
    { id: 'EP', en: 'Eastern', si: 'නැගෙනහිර', ta: 'கிழக்கு' },
    { id: 'UP', en: 'Uva', si: 'ඌව', ta: 'ஊவா' },
    { id: 'NC', en: 'North Central', si: 'උතුරු මැද', ta: 'வட மத்திய' },
    { id: 'NP', en: 'Northern', si: 'උතුරු', ta: 'வட' },
] as const;

export type ProvinceID = typeof SRI_LANKAN_PROVINCES[number]['id'];

/**
 * Sri Lankan Districts (for school location)
 */
export const SRI_LANKAN_DISTRICTS = [
    // Western Province (WP)
    { id: 'CO', provinceId: 'WP', en: 'Colombo', si: 'කොළඹ', ta: 'கொழும்பு' },
    { id: 'GA', provinceId: 'WP', en: 'Gampaha', si: 'ගම්පහ', ta: 'கம்பஹா' },
    { id: 'KL', provinceId: 'WP', en: 'Kalutara', si: 'කළුතර', ta: 'களுத்துறை' },

    // Central Province (CP)
    { id: 'KY', provinceId: 'CP', en: 'Kandy', si: 'මහනුවර', ta: 'கண்டி' },
    { id: 'MT', provinceId: 'CP', en: 'Matale', si: 'මාතලේ', ta: 'மாத்தளை' },
    { id: 'NE', provinceId: 'CP', en: 'Nuwara Eliya', si: 'නුවරඑළිය', ta: 'நுவரெலியா' },

    // Southern Province (SP)
    { id: 'GL', provinceId: 'SP', en: 'Galle', si: 'ගාල්ල', ta: 'காலி' },
    { id: 'MA', provinceId: 'SP', en: 'Matara', si: 'මාතර', ta: 'மாத்தறை' },
    { id: 'HA', provinceId: 'SP', en: 'Hambantota', si: 'හම්බන්තොට', ta: 'அம்பாந்தோட்டை' },

    // Northern Province (NP)
    { id: 'JA', provinceId: 'NP', en: 'Jaffna', si: 'යාපනය', ta: 'யாழ்ப்பாணம்' },
    { id: 'KI', provinceId: 'NP', en: 'Kilinochchi', si: 'කිලිනොච්චිය', ta: 'கிளிநොச்சி' },
    { id: 'MN', provinceId: 'NP', en: 'Mannar', si: 'මන්නාරම', ta: 'மன்னார்' },
    { id: 'VA', provinceId: 'NP', en: 'Vavuniya', si: 'වවුනියාව', ta: 'வவுனியா' },
    { id: 'MU', provinceId: 'NP', en: 'Mullaitivu', si: 'මුලතිව්', ta: 'முல்லைத்தீவு' },

    // Eastern Province (EP)
    { id: 'BT', provinceId: 'EP', en: 'Batticaloa', si: 'මඩකලපුව', ta: 'மட்டக்களப்பு' },
    { id: 'AM', provinceId: 'EP', en: 'Ampara', si: 'අම්පාර', ta: 'அம்பாறை' },
    { id: 'TR', provinceId: 'EP', en: 'Trincomalee', si: 'ත්‍රිකුණාමලය', ta: 'திருகோணமலை' },

    // North Western Province (NW)
    { id: 'KU', provinceId: 'NW', en: 'Kurunegala', si: 'කුරුණෑගල', ta: 'குருனாகல்' },
    { id: 'PU', provinceId: 'NW', en: 'Puttalam', si: 'පුත්තලම', ta: 'புத்தளம்' },

    // North Central Province (NC)
    { id: 'AN', provinceId: 'NC', en: 'Anuradhapura', si: 'අනුරාධපුරය', ta: 'அனுராதபுரம்' },
    { id: 'PO', provinceId: 'NC', en: 'Polonnaruwa', si: 'පොළොන්නරුව', ta: 'பொலன்னறுவை' },

    // Uva Province (UP)
    { id: 'BD', provinceId: 'UP', en: 'Badulla', si: 'බදුල්ල', ta: 'பதுளை' },
    { id: 'MO', provinceId: 'UP', en: 'Moneragala', si: 'මොණරාගල', ta: 'மொணராகலை' },

    // Sabaragamuwa Province (SG)
    { id: 'RG', provinceId: 'SG', en: 'Ratnapura', si: 'රත්නපුර', ta: 'இரத்தினபுரி' },
    { id: 'KE', provinceId: 'SG', en: 'Kegalle', si: 'කෑගල්ල', ta: 'கேகாலை' },
] as const;

export type DistrictID = typeof SRI_LANKAN_DISTRICTS[number]['id'];

/**
 * Common School Student Body Types in Sri Lanka
 */
export const STUDENT_TYPES = [
    { id: 'mixed', en: 'Mixed (Co-educational)', si: 'මිශ්‍ර', ta: 'கலப்பு' },
    { id: 'boys', en: 'Boys Only', si: 'පිරිමි', ta: 'ஆண்கள்' },
    { id: 'girls', en: 'Girls Only', si: 'ගැහැණු', ta: 'பெண்கள்' },
] as const;

/**
 * Religious Affiliations for Sri Lankan Schools
 */
export const RELIGIOUS_AFFILIATIONS = [
    { id: 'secular', en: 'Secular / Non-denominational', si: 'සර්ව ආගමික', ta: 'மதச்சார்பற்ற' },
    { id: 'buddhist', en: 'Buddhist', si: 'බෞද්ධ', ta: 'பௌத்த' },
    { id: 'catholic', en: 'Catholic', si: 'කතෝලික', ta: 'கத்தோலிக்க' },
    { id: 'christian', en: 'Christian', si: 'ක්‍රිස්තියානි', ta: 'கிறிஸ்தவ' },
    { id: 'hindu', en: 'Hindu', si: 'හින්දු', ta: 'இந்து' },
    { id: 'islamic', en: 'Islamic', si: 'ඉස්ලාමීය', ta: 'இஸ்லாமிய' },
] as const;

/**
 * Syllabus Versions (Legacy vs 2026 Reforms)
 */
export const SYLLABUS_VERSIONS = [
    { id: 'legacy', en: 'Existing Syllabus', si: 'පවතින විෂය නිර්දේශය', ta: 'தற்போதுள்ள பாடத்திட்டம்' },
    { id: 'reform2026', en: 'New Reform (2026)', si: 'නව ප්‍රතිසංස්කරණ (2026)', ta: 'නව ප්‍රතිසංස්කරණ (2026)' },
] as const;

/**
 * Sri Lankan Subjects by Level
 */
export const SRI_LANKAN_SUBJECTS_BY_LEVEL = {
    primary: [
        { id: 'math', en: 'Mathematics', si: 'ගණිතය', ta: 'கணிதம்' },
        { id: 'env', en: 'Environment', si: 'පරිසරය', ta: 'சுற்றுச்சூழல்' },
        { id: 'rel', en: 'Religion', si: 'ආගම', ta: 'சமயம்' },
        { id: 'lang', en: 'Mother Tongue', si: 'මව් භාෂාව', ta: 'தாய்மொழி' },
        { id: 'eng', en: 'English', si: 'ඉංග්‍රීසි', ta: 'ஆங்கிலம்' },
    ],
    junior: [
        { id: 'math', en: 'Mathematics', si: 'ගණිතය', ta: 'கணிதம்' },
        { id: 'sci', en: 'Science', si: 'විද්‍යාව', ta: 'அறிவியல்' },
        { id: 'his', en: 'History', si: 'ඉතිහාසය', ta: 'வரலாறு' },
        { id: 'eng', en: 'English', si: 'ඉංග්‍රීසි', ta: 'ஆங்கிலம்' },
        { id: 'lang', en: 'Mother Tongue', si: 'මව් භාෂාව', ta: 'தாய்மொழி' },
        { id: 'geo', en: 'Geography', si: 'භූගෝල විද්‍යාව', ta: 'புவியியல்' },
        { id: 'civ', en: 'Civic Education', si: 'පුරවැසි අධ්‍යාපනය', ta: 'குடியியல் கல்வி' },
        { id: 'ict', en: 'ICT', si: 'තොරතුරු තාක්ෂණය', ta: 'தகவல் தொழில்நுட்பம்' },
        { id: 'pts', en: 'Practical & Tech Skills', si: 'ප්‍රායෝගික හා තාක්ෂණික කුසලතා', ta: 'நடைமுறை மற்றும் தொழில்நுட்ப திறன்கள்' },
    ],
    ordinary_level: [
        { id: 'math', en: 'Mathematics', si: 'ගණිතය', ta: 'கணிதம்' },
        { id: 'sci', en: 'Science', si: 'විද්‍යාව', ta: 'அறிவியல்' },
        { id: 'his', en: 'History', si: 'ඉතිහාසය', ta: 'வரலாறு' },
        { id: 'eng', en: 'English', si: 'ඉංග්‍රීසි', ta: 'ஆங்கிலம்' },
        { id: 'lang', en: 'Mother Tongue', si: 'මව් භාෂාව', ta: 'தாய்மொழி' },
        { id: 'rel', en: 'Religion', si: 'ආගම', ta: 'சமயம்' },
        // Basket 1
        { id: 'bus', en: 'Business & Accounting', si: 'ව්‍යාපාර හා ගිණුම්කරණය', ta: 'வணிகம் மற்றும் கணக்கியல்' },
        { id: 'civ', en: 'Civic Education', si: 'පුරවැසි අධ්‍යාපනය', ta: 'குடியியல் கல்வி' },
        // Aesthetics
        { id: 'art', en: 'Art', si: 'චිත්‍ර', ta: 'சித்திரம்' },
        { id: 'mus', en: 'Music', si: 'සංගීතය', ta: 'சங்கீதம்' },
        { id: 'dan', en: 'Dancing', si: 'නර්තනය', ta: 'நடனம்' },
        // Tech
        { id: 'ict', en: 'ICT', si: 'තොරතුරු තාක්ෂණය', ta: 'தகவல் தொழில்நுட்பம்' },
        { id: 'agri', en: 'Agriculture', si: 'කෘෂිකර්මය', ta: 'விவசாயம்' },
    ],
    advanced_level: [
        // Science
        { id: 'phy', en: 'Physics', si: 'භෞතික විද්‍යාව', ta: 'பௌதிகவியல்' },
        { id: 'che', en: 'Chemistry', si: 'රසායන විද්‍යාව', ta: 'இரசாயனவியல்' },
        { id: 'bio', en: 'Biology', si: 'ජීව විද්‍යාව', ta: 'உயிரியல்' },
        { id: 'com_math', en: 'Combined Maths', si: 'සංයුක්ත ගණිතය', ta: 'இணைந்த கணிதம்' },
        // Commerce
        { id: 'acc', en: 'Accounting', si: 'ගිණුම්කරණය', ta: 'கணக்கியல்' },
        { id: 'bst', en: 'Business Studies', si: 'ව්‍යාපාර අධ්‍යයනය', ta: 'வணிக ஆய்வுகள்' },
        { id: 'eco', en: 'Economics', si: 'ආර්ථික විද්‍යාව', ta: 'பொருளியல்' },
        // Arts/Tech
        { id: 'ict', en: 'ICT', si: 'තොරතුරු තාක්ෂණය', ta: 'தகவல் தொழில்நுட்பம்' },
        { id: 'pol', en: 'Political Science', si: 'දේශපාලන විද්‍යාව', ta: 'அரசியல் அறிவியல்' },
        { id: 'sft', en: 'Science for Tech', si: 'තාක්ෂණය සඳහා විද්‍යාව', ta: 'தொழில்நுட்பத்திற்கான அறிவியல்' },
        { id: 'et', en: 'Engineering Tech', si: 'ඉංජිනේරු තාක්ෂණය', ta: 'பொறியியல் தொழில்நுட்பம்' },
        { id: 'bt', en: 'Bio Systems Tech', si: 'ජෛව පද්ධති තාක්ෂණය', ta: 'உயிர் பද්ධதி தொழில்நுட்பம்' },
    ],
} as const;

/**
 * Library Resource Categories
 * Expanded to include Teacher Guides, Pedagogy, etc.
 */
export const LIBRARY_RESOURCE_CATEGORIES = [
    { id: 'lesson', en: 'Lessons', si: 'පාඩම්', ta: 'பாடங்கள்' },
    { id: 'worksheet', en: 'Worksheets', si: 'වැඩපත්', ta: 'பணித்தாள்கள்' },
    { id: 'guide', en: 'Teacher Guides', si: 'ගුරු මාර්ගෝපදේශ', ta: 'ஆசிரியர் வழிகாட்டிகள்' },
    { id: 'reading', en: 'Reading Materials', si: 'කියවීමේ ද්‍රව්‍ය', ta: 'வாசிப்புப் பொருட்கள்' },
    { id: 'pedagogy', en: 'Pedagogy', si: 'අධ්‍යාපනික ශාස්ත්‍රය', ta: 'கற்பித்தல் முறை' },
    { id: 'video', en: 'Videos', si: 'වීඩියෝ', ta: 'காணொளிகள்' },
    { id: 'link', en: 'External Links', si: 'බාහිර සබැඳි', ta: 'வெளிப்புற இணைப்புகள்' },
    // Holistic library expansion
    { id: 'map', en: 'Maps & Visuals', si: 'සිතියම් සහ දෘශ්‍ය', ta: 'வரைபடங்கள் & காட்சிகள்' },
    { id: 'infographic', en: 'Infographics', si: 'තොරතුරු රූප', ta: 'தகவல் வரைகலைகள்' },
    { id: 'story', en: 'Stories', si: 'කථා', ta: 'கதைகள்' },
    { id: 'circular', en: 'Edu Circulars', si: 'රජයේ චක්‍රලේඛ', ta: 'அரசு சுற்றறிக்கைகள்' },
    { id: 'movie_trailer', en: 'Inspiring Films', si: 'ආනුභාවී චිත්‍රපට', ta: 'ஊக்கමளிக்கும் திரைப்படங்கள்' },
    { id: 'tech_guide', en: 'Tech Guides', si: 'තාක්ෂණ මාර්ගෝපදේශ', ta: 'தொழில்நுட்ப வழிகாட்டிகள்' },
    { id: 'other', en: 'Other Resources', si: 'වෙනත් සම්පත්', ta: 'மற்ற வளங்கள்' },
] as const;

/**
 * Classroom Themes
 */
export const CLASSROOM_THEMES = [
    { id: 'saffron', color: '#F59E0B', en: 'Saffron', si: 'සැෆ්රන්', ta: 'குங்குமப்பூ' },
    { id: 'ocean', color: '#0EA5E9', en: 'Ocean', si: 'සාගර', ta: 'கடல்' },
    { id: 'emerald', color: '#10B981', en: 'Emerald', si: 'මරකත', ta: 'මරකත' },
    { id: 'orchid', color: '#8B5CF6', en: 'Orchid', si: 'ඕකිඩ්', ta: 'ஆர்க்கிடு' },
    { id: 'rose', color: '#F43F5E', en: 'Rose', si: 'රෝස', ta: 'ரோஜா' },
    { id: 'slate', color: '#64748B', en: 'Slate', si: 'ස්ලෙට්', ta: 'ஸ்லேட்' },
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
