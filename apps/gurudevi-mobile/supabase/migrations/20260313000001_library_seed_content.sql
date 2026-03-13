-- ============================================================================
-- GURUDEVI LIBRARY: SEED — The Epistemic Universe
--
-- 25+ carefully curated nodes spanning philosophy, Sri Lankan history,
-- pedagogy, inspirational films, stories, technology guides, and circulars.
-- 5 collections. Knowledge edges for semantic graph navigation.
-- 3 map layers for the geographic / abstract map.
--
-- All content is publicly accessible, non-community (is_community = false),
-- verified = true, creator = 'Architect' (no FK — seed rows have no user).
-- ============================================================================

-- ============================================================================
-- 1. MAP LAYERS
-- ============================================================================
INSERT INTO public.map_layers (id, name, layer_type, projection_type, description, icon_emoji, color)
VALUES
    ('00000000-0001-0001-0001-000000000001',
     'Epistemic Cosmos',   'cosmos',          'cosmos',
     'The abstract universe of knowledge islands — topics, concepts, and ideas mapped by semantic distance.',
     '🪐', '#8A2BE2'),

    ('00000000-0001-0001-0001-000000000002',
     'Lankan Schools',     'lankan_schools',  'earth',
     'Geographic map of schools across Sri Lanka. Explore educational presence island-wide.',
     '🏫', '#F5A623'),

    ('00000000-0001-0001-0001-000000000003',
     'Heritage Sites',     'heritage_sites',  'earth',
     'Ancient and UNESCO-listed heritage sites of Sri Lanka — temples, reservoirs, fortresses.',
     '🏛', '#4ECDC4'),

    ('00000000-0001-0001-0001-000000000004',
     'Charities & NGOs',   'charities_ngos',  'earth',
     'Educational charities and NGOs operating in Sri Lanka — mentorship, scholarships, libraries.',
     '🤝', '#10B981'),

    ('00000000-0001-0001-0001-000000000005',
     'Mind Maps',          'mind_maps',       'cosmos',
     'Teacher-created mind maps and visual summaries of curriculum topics.',
     '🧠', '#A78BFA')
ON CONFLICT (layer_type) DO NOTHING;

-- ============================================================================
-- 2. CORE KNOWLEDGE NODES
--
-- UUIDs use a predictable pattern (00000000-0002-XXXX-...) for easy reference
-- in edges below.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- A. PHILOSOPHY & HUMANISTIC EDUCATION
-- ---------------------------------------------------------------------------
INSERT INTO public.nodes (
    id, title, title_en, title_si, description, description_en, description_si,
    type, format, url, subjects, topics, grades, difficulty, language, visibility,
    verified, is_community, is_ministry_official, curriculum_aligned,
    creator_name, creator_role, copyright_notice, license, tags,
    views, endorsements, link_status
) VALUES
-- Freire: Pedagogy of the Oppressed
(
    '00000000-0002-0001-0000-000000000001',
    'Pedagogy of the Oppressed',
    'Pedagogy of the Oppressed',
    'පීඩිතයන්ගේ ශිල්පීය විද්‍යාව',
    'Paulo Freire''s landmark text explores the philosophy of education for liberation. Consciousness-raising and critical pedagogy for teachers who believe every student is a subject, not an object.',
    'Paulo Freire''s landmark text explores the philosophy of education for liberation.',
    'පාවුලෝ ෆ්‍රෙයිර්ගේ විමුක්තිකාමී ශිල්පීය ජ්ඥානය — ගුරුවරයා සහ ශිෂ්‍යයා අතර දෙඅංශ සංවාදය.',
    'pedagogy', 'document',
    'https://ia601800.us.archive.org/31/items/pedagogyoftheoppressed/Pedagogy%20of%20the%20Oppressed.pdf',
    ARRAY['Pedagogy','Philosophy','Education'],
    ARRAY['Critical Pedagogy','Liberation Education','Consciousness','Banking Model'],
    ARRAY[9,10,11,12],
    'advanced', ARRAY['en','si'], 'public',
    true, false, false, true,
    'Architect', 'admin',
    'Internet Archive — Public Domain / Fair Use for Education',
    'public_domain',
    ARRAY['freire','philosophy','must-read','liberation','pedagogy'],
    0, 0, 'working'
),
-- Vygotsky: Thought and Language
(
    '00000000-0002-0002-0000-000000000001',
    'Thought and Language — Vygotsky',
    'Thought and Language',
    'චින්තනය සහ භාෂාව — විගොට්ස්කි',
    'Lev Vygotsky''s foundational theory linking language acquisition to cognitive development. Introduces the Zone of Proximal Development (ZPD), essential for understanding how students learn through guided interaction.',
    'Vygotsky''s foundational text on language, thought, and the Zone of Proximal Development.',
    'ශිෂ්‍ය ඉගෙනීමේ ZPD සංකල්පය — ගුරුවරයාගේ මාර්ගෝපදේශය ඉක්මවා ශිෂ්‍යයා ළඟා වන ක්ෂේත්‍රය.',
    'pedagogy', 'document',
    'https://archive.org/download/VygotskyThoughtAndLanguage/Vygotsky%20Thought%20and%20Language.pdf',
    ARRAY['Psychology','Pedagogy','Child Development'],
    ARRAY['ZPD','Scaffolding','Language Acquisition','Cognition'],
    ARRAY[9,10,11,12],
    'advanced', ARRAY['en'], 'public',
    true, false, false, true,
    'Architect', 'admin',
    'Internet Archive — Fair Use for Education',
    'fair_use',
    ARRAY['vygotsky','zpd','scaffolding','development','psychology'],
    0, 0, 'working'
),
-- Kahlil Gibran: The Prophet — On Teaching
(
    '00000000-0002-0003-0000-000000000001',
    'The Prophet — On Teaching & Children',
    'The Prophet — On Teaching & Children',
    'නබිතුමා — ඉගැන්වීම සහ දරුවන් ගැන',
    'Kahlil Gibran''s timeless poem on the teacher''s role. "The teacher who walks in the shadow of the temple, among his followers, gives not of his wisdom but rather of his faith and his lovingness." A spiritual anchor for every educator.',
    'Gibran''s timeless poem on teaching — wisdom, love, and the teacher''s true role.',
    'ගිබ්රාන්ගේ ගුරුත්වය ගැන ශ්‍රේෂ්ඨ කාව්‍ය — ශ්‍රද්ධා සහ ආදරයෙන් ඉගැන්වීම.',
    'story', 'text',
    'https://www.gutenberg.org/ebooks/58585',
    ARRAY['Philosophy','Spirituality','Education'],
    ARRAY['Teacher Identity','Purpose','Love','Wisdom'],
    ARRAY[7,8,9,10,11,12],
    'beginner', ARRAY['en','si'], 'public',
    true, false, false, false,
    'Architect', 'admin',
    'Project Gutenberg — Public Domain',
    'public_domain',
    ARRAY['gibran','poetry','teaching','spiritual','inspiration'],
    0, 0, 'working'
),
-- Maria Montessori: The Absorbent Mind
(
    '00000000-0002-0004-0000-000000000001',
    'The Absorbent Mind — Montessori',
    'The Absorbent Mind',
    'ශෝෂිත මනස — මොන්ටෙසෝරි',
    'Maria Montessori''s exploration of how children absorb learning effortlessly in the first six years. Essential reading for early childhood educators and parents navigating how children build their inner world.',
    'Montessori explores how the young child absorbs culture and learning through immersive experience.',
    'ළමා ඉගෙනීමේ ස්වාභාවික සෞඛ්‍ය රහස — ශ්‍රේෂ්ඨ මොන්ටෙසෝරි ග්‍රන්ථය.',
    'pedagogy', 'document',
    'https://ia801002.us.archive.org/31/items/absorbentmind031961mbp/absorbentmind031961mbp.pdf',
    ARRAY['Early Childhood','Pedagogy','Child Development'],
    ARRAY['Montessori','Absorbent Mind','Child Autonomy','Sensitive Periods'],
    ARRAY[1,2,3,4,5,6],
    'intermediate', ARRAY['en'], 'public',
    true, false, false, true,
    'Architect', 'admin',
    'Internet Archive — Public Domain',
    'public_domain',
    ARRAY['montessori','early-childhood','child-development','pedagogy'],
    0, 0, 'working'
),
-- Rabindranath Tagore: The Centre of Indian Culture
(
    '00000000-0002-0005-0000-000000000001',
    'The Centre of Indian Culture — Tagore on Education',
    'The Centre of Indian Culture',
    'සංස්කෘතික කේන්ද්‍රය — ටාගෝර්ගේ අධ්‍යාපනය',
    'Tagore''s vision of education as a living communion with nature, culture, and community — not a factory for examinations. Deeply resonant for Sri Lankan educators building contextual, soulful schools.',
    'Tagore''s educational philosophy — school as a living community connected to land, culture, and joy.',
    'ටාගෝර්ගේ ශිල්ප ආදර්ශය — ස්වාභාවය, සංස්කෘතිය සහ ප්‍රජාව සමඟ ජීවත් ශාලාව.',
    'pedagogy', 'document',
    'https://www.gutenberg.org/ebooks/16479',
    ARRAY['Philosophy','Education','Culture'],
    ARRAY['Nature-based Learning','Cultural Pedagogy','Holistic Education'],
    ARRAY[9,10,11,12],
    'intermediate', ARRAY['en'], 'public',
    true, false, false, false,
    'Architect', 'admin',
    'Project Gutenberg — Public Domain',
    'public_domain',
    ARRAY['tagore','culture','holistic','nature','india-sri-lanka'],
    0, 0, 'working'
);

-- ---------------------------------------------------------------------------
-- B. SRI LANKA — HISTORY, HERITAGE & CULTURE
-- ---------------------------------------------------------------------------
INSERT INTO public.nodes (
    id, title, title_en, title_si, description, description_en, description_si,
    type, format, url, subjects, topics, grades, difficulty, language, visibility,
    verified, is_community, is_ministry_official, curriculum_aligned,
    creator_name, creator_role, copyright_notice, license, tags,
    views, endorsements, link_status
) VALUES
-- Ancient Irrigation Systems
(
    '00000000-0002-0010-0000-000000000001',
    'Ancient Irrigation Systems of Sri Lanka',
    'Ancient Irrigation Systems of Sri Lanka',
    'ශ්‍රී ලංකාවේ පුරාතන ජලාශ පද්ධතිය',
    'An infographic and scholarly overview of Sri Lanka''s 2,000-year-old hydraulic civilisation — wewas (tanks), canals, and the legendary Parakrama Samudra. A marvel of ancient engineering that still sustains millions.',
    'Sri Lanka''s 2,000-year hydraulic civilisation: tanks, canals, and the mastery of water.',
    'ශ්‍රී ලංකාවේ ජල ශිෂ්ටාචාරය — වෙව් 2000ක ඉතිහාසය, ජල කළමනාකරණය.',
    'infographic', 'document',
    'https://whc.unesco.org/en/list/200',
    ARRAY['History','Geography','Science','Environment'],
    ARRAY['Ancient Engineering','Water Management','Sri Lanka Heritage','Civilization'],
    ARRAY[6,7,8,9,10],
    'beginner', ARRAY['en','si','ta'], 'public',
    true, false, true, true,
    'Architect', 'admin',
    '© UNESCO World Heritage Centre — Educational Use',
    'educational_use',
    ARRAY['irrigation','ancient','heritage','sri-lanka','geography','history'],
    0, 0, 'working'
),
-- Sigiriya — Architecture of a Sky Palace
(
    '00000000-0002-0011-0000-000000000001',
    'Sigiriya: Architecture of the Sky Palace',
    'Sigiriya: Architecture of the Sky Palace',
    'සීගිරිය: ආකාශ මාළිගාවේ ශිල්ප රහස',
    'An architectural and historical study of Sigiriya — the 5th-century rock fortress, frescoes, water gardens, and city planning that place it among the world''s greatest ancient engineering feats. Includes UNESCO documentation.',
    'Sigiriya''s 5th-century rock fortress: frescoes, water gardens, and ancient urban planning.',
    'සීගිරිය — ෆ්‍රෙස්කෝ සිතුවම්, ජල උද්‍යාන, සහ ශිල්ප ශාස්ත්‍රය.',
    'map', 'document',
    'https://whc.unesco.org/en/list/202',
    ARRAY['History','Architecture','Art','Heritage'],
    ARRAY['Sigiriya','UNESCO','Rock Fortress','Frescoes','Ancient Architecture'],
    ARRAY[6,7,8,9,10],
    'intermediate', ARRAY['en','si','ta'], 'public',
    true, false, true, true,
    'Architect', 'admin',
    '© UNESCO World Heritage Centre — Educational Use',
    'educational_use',
    ARRAY['sigiriya','heritage','architecture','art','ancient','sri-lanka'],
    0, 0, 'working'
),
-- Mahavamsa — The Great Chronicle
(
    '00000000-0002-0012-0000-000000000001',
    'Mahavamsa: The Great Chronicle',
    'Mahavamsa: The Great Chronicle',
    'මහාවංශය: ශ්‍රී ලංකාවේ මහා ඉතිහාස ග්‍රන්ථය',
    'The Mahavamsa, written by the monk Mahanama in the 5th–6th century CE, is one of the world''s longest unbroken historical chronicles. It documents the arrival of Buddhism in Sri Lanka, the great kings, and the civilisation they built.',
    'Sri Lanka''s 5th-century Pali chronicle — the definitive history of ancient Lanka.',
    'පෙනී සිටි ශ්‍රී ලංකාවේ ඉතිහාසය — 5 වැනි ශතකයේ ලියූ ‍ශ්‍රේෂ්ඨ ඓතිහාසික ග්‍රන්ථය.',
    'reading', 'document',
    'https://www.gutenberg.org/ebooks/7804',
    ARRAY['History','Culture','Buddhism','Sinhala Literature'],
    ARRAY['Ancient Sri Lanka','Buddhism','Kings','Chronicles'],
    ARRAY[8,9,10,11,12],
    'advanced', ARRAY['en','si'], 'public',
    true, false, false, true,
    'Architect', 'admin',
    'Project Gutenberg — Public Domain',
    'public_domain',
    ARRAY['mahavamsa','history','buddhism','sinhala','ancient','primary-source'],
    0, 0, 'working'
),
-- Kandy Esala Perahera — Cultural Guide
(
    '00000000-0002-0013-0000-000000000001',
    'The Esala Perahera: Sri Lanka''s Grand Procession',
    'The Esala Perahera',
    'ඇසළ පෙරහැර: ශ්‍රී ලංකාවේ ශ්‍රේෂ්ඨ ශාසනික ගමන',
    'A cultural and religious guide to the Kandy Esala Perahera — the 10-day procession of the Sacred Tooth Relic. Covers history, costumes, drummers, dancers, and the spiritual significance of the pageant.',
    'The Kandy Esala Perahera: 10 nights of ritual, elephants, and the Sacred Tooth Relic.',
    'ඇසළ පෙරහැරේ ආගමික, ශිල්ප සහ ඓතිහාසික ස්ථානය.',
    'guide', 'document',
    'https://www.kandy.lk/esala-perahera',
    ARRAY['Culture','Religion','History','Arts'],
    ARRAY['Buddhism','Cultural Heritage','Kandy','Ritual','Festival'],
    ARRAY[4,5,6,7,8,9,10],
    'beginner', ARRAY['en','si','ta'], 'public',
    true, false, false, true,
    'Architect', 'admin',
    'Public Information — Educational Use',
    'educational_use',
    ARRAY['perahera','kandy','culture','buddhism','heritage','festival'],
    0, 0, 'working'
);

-- ---------------------------------------------------------------------------
-- C. PEDAGOGY & TEACHING PRACTICE
-- ---------------------------------------------------------------------------
INSERT INTO public.nodes (
    id, title, title_en, title_si, description, description_en, description_si,
    type, format, url, subjects, topics, grades, difficulty, language, visibility,
    verified, is_community, is_ministry_official, curriculum_aligned,
    creator_name, creator_role, copyright_notice, license, tags,
    views, endorsements, link_status
) VALUES
-- Bloom's Taxonomy: Teacher Guide
(
    '00000000-0002-0020-0000-000000000001',
    'Bloom''s Taxonomy: A Teacher''s Quick Guide',
    'Bloom''s Taxonomy: Teacher Guide',
    'බ්ලූම්ගේ ටැක්සොනොමි: ගුරු මාර්ගෝපදේශය',
    'A practical guide to Bloom''s Revised Taxonomy — from Remember to Create. Includes verb lists, lesson planning templates, and question design strategies for all subject areas. The single most cited framework in Sri Lankan curriculum design.',
    'Bloom''s Revised Taxonomy with verb lists, lesson planning templates, and question banks.',
    'බ්ලූම්ගේ ටැක්සොනොමිය — ශ්‍රේෂ්ඨ ප්‍රශ්න සෑදීමේ සහ ගෙදරකාර්ය සැලසුමේ රාමුව.',
    'guide', 'document',
    'https://cft.vanderbilt.edu/guides-sub-pages/blooms-taxonomy/',
    ARRAY['Pedagogy','Lesson Planning','Assessment'],
    ARRAY['Bloom''s Taxonomy','Learning Objectives','Critical Thinking','Assessment Design'],
    ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
    'beginner', ARRAY['en','si'], 'public',
    true, false, false, true,
    'Architect', 'admin',
    'Vanderbilt University CFT — Open Educational Resource',
    'cc_by',
    ARRAY['blooms','taxonomy','lesson-plan','assessment','teaching','tools'],
    0, 0, 'working'
),
-- Socratic Questioning Technique
(
    '00000000-0002-0021-0000-000000000001',
    'Socratic Questioning in the Classroom',
    'Socratic Questioning',
    'සොක්‍රටීස් ප්‍රශ්නන ශිල්පය',
    'A comprehensive guide to using Socratic questioning to deepen understanding, develop critical thinking, and move students beyond rote recall. Includes 6 Socratic question types, classroom scripts, and sample dialogues.',
    'Using Socratic questioning to develop critical thinking and deep comprehension.',
    'ශ්‍රේෂ්ඨ සිතුවිලි ගෝනෙල ගන්නා සොක්‍රෙටික් ප්‍රශ්නන ක්‍රමය — ගුරු ප්‍රශ්නන ශිල්ප.',
    'guide', 'text',
    'https://www.teachthought.com/critical-thinking/types-of-questions-socratic-method/',
    ARRAY['Pedagogy','Critical Thinking','Philosophy'],
    ARRAY['Socratic Method','Questioning','Discussion','Critical Thinking','Dialogue'],
    ARRAY[5,6,7,8,9,10,11,12],
    'intermediate', ARRAY['en','si'], 'public',
    true, false, false, true,
    'Architect', 'admin',
    'TeachThought — Open Educational Content',
    'educational_use',
    ARRAY['socratic','questioning','critical-thinking','discussion','method'],
    0, 0, 'working'
),
-- Differentiated Instruction Guide
(
    '00000000-0002-0022-0000-000000000001',
    'Differentiated Instruction: Meeting Every Learner',
    'Differentiated Instruction',
    'වෙනස් ශිෂ්‍ය ඉගෙනීමේ ශිල්ප',
    'Carol Ann Tomlinson''s framework for differentiated instruction — adapting content, process, and product to match each student''s readiness, interest, and learning profile. Includes 12 practical strategies for diverse Sri Lankan classrooms.',
    'Tomlinson''s differentiated instruction framework with 12 classroom strategies.',
    'සෑම ශිෂ්‍යයෙකුගේම ඉගෙනුම් ශෛලිය දැකගෙන ඉගැන්වීමේ ශිල්ප.',
    'guide', 'document',
    'https://www.ascd.org/books/differentiated-classroom',
    ARRAY['Pedagogy','Inclusion','Assessment'],
    ARRAY['Differentiated Instruction','Inclusive Education','Learning Styles','Classroom Management'],
    ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
    'intermediate', ARRAY['en'], 'public',
    true, false, false, true,
    'Architect', 'admin',
    'ASCD — Fair Use for Educational Reference',
    'fair_use',
    ARRAY['differentiation','inclusion','tomlinson','teaching','classroom'],
    0, 0, 'working'
),
-- Sri Lanka National Education Policy 2026
(
    '00000000-0002-0023-0000-000000000001',
    'National Education Policy 2024 — Sri Lanka',
    'National Education Policy 2024',
    '2024 ජාතික අධ්‍යාපන ප්‍රතිපත්තිය — ශ්‍රී ලංකාව',
    'The landmark 2024 National Education Policy of Sri Lanka — vision, reforms, STEAM integration, social-emotional learning mandates, and trilingual education framework. Every teacher and principal should read this.',
    'Sri Lanka''s 2024 National Education Policy — reforms, STEAM, SEL, and trilingual mandate.',
    '2024 ජාතික ශිල්ප ප්‍රතිපත්තිය — STEAM, SEL, ත්‍රිභාෂා අධ්‍යාපනය.',
    'circular', 'document',
    'https://www.moe.gov.lk',
    ARRAY['Policy','Education','Governance'],
    ARRAY['National Policy','STEAM','SEL','Trilingual','Curriculum Reform'],
    ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
    'intermediate', ARRAY['en','si','ta'], 'public',
    true, false, true, true,
    'Architect', 'admin',
    '© Ministry of Education, Sri Lanka',
    'institutional',
    ARRAY['policy','ministry','moe','reform','2024','official'],
    0, 0, 'working'
);

-- ---------------------------------------------------------------------------
-- D. INSPIRING FILMS & DOCUMENTARIES (movie_trailer type)
-- ---------------------------------------------------------------------------
INSERT INTO public.nodes (
    id, title, title_en, title_si, description, description_en, description_si,
    type, format, url, subjects, topics, grades, difficulty, language, visibility,
    verified, is_community, is_ministry_official, curriculum_aligned,
    creator_name, creator_role, copyright_notice, license, tags,
    views, endorsements, link_status
) VALUES
-- Dead Poets Society
(
    '00000000-0002-0030-0000-000000000001',
    'Dead Poets Society — Trailer',
    'Dead Poets Society',
    'Dead Poets Society — ට්‍රේලර්',
    '"O Captain, My Captain!" Robin Williams as John Keating — the teacher who taught boys to seize the day. This trailer captures everything we hope to embody: passion, rebellion against rote learning, and the transformative power of literature.',
    'The trailer for Dead Poets Society — inspiration for every teacher who dares to teach differently.',
    '"Carpe Diem!" — ජෝන් කීටිං ගුරුවරයාගේ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=veT9JasMkXs',
    ARRAY['Inspiration','Education','Literature'],
    ARRAY['Teacher Inspiration','Carpe Diem','Poetry','Non-Conformity'],
    ARRAY[9,10,11,12],
    'beginner', ARRAY['en'], 'public',
    true, false, false, false,
    'Architect', 'admin',
    'YouTube — © Touchstone Pictures. Fair use: Educational inspiration excerpt.',
    'fair_use',
    ARRAY['dead-poets','inspiration','teacher','film','carpe-diem'],
    0, 0, 'working'
),
-- To Sir, With Love
(
    '00000000-0002-0031-0000-000000000001',
    'To Sir, With Love — 1967 Film Clip',
    'To Sir, With Love',
    'To Sir, With Love — 1967 චිත්‍රපටය',
    'Sidney Poitier as Mark Thackeray — a teacher who refuses to give up on difficult students in London''s East End. This 1967 classic asks: what is education really for? Deeply relevant for teachers working with marginalised youth.',
    'Sidney Poitier''s classic — a teacher transforming difficult students through dignity and respect.',
    'ශ්‍රේෂ්ඨ ගුරුවරයෙකු ශිෂ්‍යයන් ජීවිතය ඉගෙනවා දෙයි.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=g6s35v_TdH0',
    ARRAY['Inspiration','Social Justice','Education'],
    ARRAY['Teacher Resilience','Dignity','Social Justice','Student Potential'],
    ARRAY[9,10,11,12],
    'beginner', ARRAY['en'], 'public',
    true, false, false, false,
    'Architect', 'admin',
    'YouTube — © Columbia Pictures. Fair use: Educational inspiration excerpt.',
    'fair_use',
    ARRAY['sir-with-love','poitier','film','inspiration','social-justice'],
    0, 0, 'working'
),
-- Iqbal (Bollywood — inspiring for students)
(
    '00000000-0002-0032-0000-000000000001',
    'Iqbal — Official Trailer (2005)',
    'Iqbal — Official Trailer',
    'ඉක්බාල් — 2005 ට්‍රේලර්',
    'A deaf and mute boy from rural India dreams of playing cricket for the national team. An inspiring Indian film about overcoming impossibility with determination, the right mentor, and unwavering self-belief. Perfect for students facing barriers.',
    'Iqbal: A deaf boy''s dream to play for India — about mentorship, disability, and determination.',
    'ශ්‍රේෂ්ඨ ළමා ස්වප්නය — ශ්‍රේෂ්ඨ ශිෂ්‍ය ස්ප්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=l6GKiimGM5o',
    ARRAY['Inspiration','Sports','Inclusion'],
    ARRAY['Disability','Mentorship','Determination','Sports','Student Aspiration'],
    ARRAY[5,6,7,8,9,10],
    'beginner', ARRAY['en','si'], 'public',
    true, false, false, false,
    'Architect', 'admin',
    'YouTube — © Shemaroo. Fair use: Educational inspiration excerpt.',
    'fair_use',
    ARRAY['iqbal','cricket','disability','bollywood','inspiration','students'],
    0, 0, 'working'
),
-- 3 Idiots — Education system satire (Hindi, with eng subs)
(
    '00000000-0002-0033-0000-000000000001',
    '3 Idiots — Trailer (Education System Satire)',
    '3 Idiots — Official Trailer',
    '3 Idiots — ශ්‍රේෂ්ඨ ත්‍රිලෝකය',
    '"All is Well!" — Aamir Khan in this beloved Indian comedy-drama that skewers rote memorisation and academic pressure while championing genuine curiosity and passion-led learning. Essential viewing for every Sri Lankan principal and parent.',
    '3 Idiots: A satirical look at exam pressure and the failure of rote learning systems.',
    'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශිෂ්‍ය ශ්‍රේෂ්ඨ — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=K0dn0BtK-ik',
    ARRAY['Education','Social Commentary','Inspiration'],
    ARRAY['Exam Pressure','Rote Learning','Passion','Innovation','Student Wellbeing'],
    ARRAY[7,8,9,10,11,12],
    'beginner', ARRAY['en'], 'public',
    true, false, false, false,
    'Architect', 'admin',
    'YouTube — © Vinod Chopra Productions. Fair use: Educational inspiration excerpt.',
    'fair_use',
    ARRAY['3-idiots','bollywood','education','exam-pressure','inspiration','film'],
    0, 0, 'working'
);

-- ---------------------------------------------------------------------------
-- E. STORIES FOR STUDENTS
-- ---------------------------------------------------------------------------
INSERT INTO public.nodes (
    id, title, title_en, title_si, description, description_en, description_si,
    type, format, url, subjects, topics, grades, difficulty, language, visibility,
    verified, is_community, is_ministry_official, curriculum_aligned,
    creator_name, creator_role, copyright_notice, license, tags,
    views, endorsements, link_status
) VALUES
-- The Old Man and the Sea (short extract)
(
    '00000000-0002-0040-0000-000000000001',
    'The Old Man and the Sea — Hemingway',
    'The Old Man and the Sea',
    'වෘද්ධ මිනිසා සහ මුහුද — හෙමිංවේ',
    'Hemingway''s Nobel-winning novella of endurance, dignity, and the human spirit. Santiago battles a great marlin for three days alone at sea — a story that teaches Sri Lankan students about resilience and the meaning of not giving up.',
    'Hemingway''s Nobel novella about endurance, dignity, and the indomitable human spirit.',
    'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',
    'story', 'document',
    'https://www.gutenberg.org/ebooks/2701',
    ARRAY['Literature','English','Life Skills'],
    ARRAY['Resilience','Endurance','Character','Dignity','Courage'],
    ARRAY[9,10,11,12],
    'intermediate', ARRAY['en'], 'public',
    true, false, false, true,
    'Architect', 'admin',
    'Public Domain (pre-1978 US edition) — Project Gutenberg',
    'public_domain',
    ARRAY['hemingway','literature','resilience','story','english','nobel'],
    0, 0, 'working'
),
-- Jataka Tales — Sri Lankan Buddhist stories
(
    '00000000-0002-0041-0000-000000000001',
    'Jataka Tales: Stories of Wisdom',
    'Jataka Tales: Stories of Wisdom',
    'ජාතක කතා: ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',
    'The Jataka Tales are 547 stories of the Buddha''s past lives — each a moral lesson on compassion, wisdom, and ethical action. Deeply woven into Sri Lankan culture and curriculum. Perfect for character education from Grade 1 upward.',
    'The Jataka Tales: 547 Buddhist stories of wisdom, compassion, and moral character.',
    'ජාතක කතා — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',
    'story', 'text',
    'https://www.sacred-texts.com/bud/j1/index.htm',
    ARRAY['Buddhism','Ethics','Character Education','Sinhala Culture'],
    ARRAY['Moral Stories','Compassion','Wisdom','Buddhist Ethics','Character'],
    ARRAY[1,2,3,4,5,6,7,8],
    'beginner', ARRAY['en','si'], 'public',
    true, false, false, true,
    'Architect', 'admin',
    'Sacred-texts.com — Public Domain Translations',
    'public_domain',
    ARRAY['jataka','buddhism','stories','character','ethics','primary'],
    0, 0, 'working'
),
-- The Little Prince (for teachers and students)
(
    '00000000-0002-0042-0000-000000000001',
    'The Little Prince — Antoine de Saint-Exupéry',
    'The Little Prince',
    'කුඩා කුමාරයා — ස‍ෙයින්ට්-ෙ​ක්සූෙේරි',
    '"What is essential is invisible to the eye." The Little Prince is the world''s most-translated book after the Bible. For Sri Lankan classrooms: a gentle introduction to philosophy, imagination, and the question of what truly matters.',
    'The world''s most translated philosophical novella — on imagination, love, and essential truths.',
    'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',
    'story', 'document',
    'https://www.gutenberg.org/ebooks/525',
    ARRAY['Literature','Philosophy','Life Skills'],
    ARRAY['Imagination','Values','Friendship','Philosophy for Children'],
    ARRAY[4,5,6,7,8,9],
    'beginner', ARRAY['en'], 'public',
    true, false, false, false,
    'Architect', 'admin',
    'Project Gutenberg — Public Domain',
    'public_domain',
    ARRAY['little-prince','philosophy','story','imagination','values'],
    0, 0, 'working'
);

-- ---------------------------------------------------------------------------
-- F. TECHNOLOGY GUIDES FOR TEACHERS
-- ---------------------------------------------------------------------------
INSERT INTO public.nodes (
    id, title, title_en, title_si, description, description_en, description_si,
    type, format, url, subjects, topics, grades, difficulty, language, visibility,
    verified, is_community, is_ministry_official, curriculum_aligned,
    creator_name, creator_role, copyright_notice, license, tags,
    views, endorsements, link_status
) VALUES
-- Introduction to AI for Teachers
(
    '00000000-0002-0050-0000-000000000001',
    'Introduction to AI in Education — Teacher Guide',
    'AI in Education: Teacher Guide',
    'ශිෂ්‍ය ගුරු ජීවිතයේ AI — ගුරු මාර්ගෝපදේශ',
    'A practical, jargon-free guide to using Artificial Intelligence tools in Sri Lankan classrooms. Covers ChatGPT for lesson planning, AI art for student creativity, automated grading tools, and what AI can''t (and shouldn''t) do.',
    'Practical AI tools for Sri Lankan teachers: ChatGPT for lessons, AI art, grading, and boundaries.',
    'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ AI ශිල්ප — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',
    'tech_guide', 'document',
    'https://teachai.org/toolkit',
    ARRAY['Technology','Pedagogy','Innovation'],
    ARRAY['AI Tools','ChatGPT','EdTech','Lesson Planning','Automation'],
    ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
    'beginner', ARRAY['en','si'], 'public',
    true, false, false, false,
    'Architect', 'admin',
    'TeachAI Toolkit — Creative Commons CC-BY',
    'cc_by',
    ARRAY['ai','chatgpt','technology','edtech','teacher-guide','tools'],
    0, 0, 'working'
),
-- Google Classroom Guide for SL Teachers
(
    '00000000-0002-0051-0000-000000000001',
    'Google Classroom: Complete Setup Guide for Sri Lankan Teachers',
    'Google Classroom Setup Guide',
    'Google Classroom: ශ්‍රී ලාංකික ගුරු ස්ථාපන මාර්ගෝපදේශය',
    'Step-by-step guide to setting up Google Classroom for Sri Lankan schools — creating classes, assigning work, grading, parent communication, and integrating Google Meet for hybrid teaching. Optimised for low-bandwidth environments.',
    'Complete Google Classroom setup guide tailored for Sri Lankan schools and low-bandwidth settings.',
    'Google Classroom ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',
    'tech_guide', 'document',
    'https://edu.google.com/intl/ALL_lk/workspace-for-education/classroom/',
    ARRAY['Technology','EdTech','Digital Literacy'],
    ARRAY['Google Classroom','LMS','Hybrid Teaching','Digital Tools','Low Bandwidth'],
    ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
    'beginner', ARRAY['en','si'], 'public',
    true, false, false, false,
    'Architect', 'admin',
    '© Google LLC — Fair Use: Educational Setup Reference',
    'fair_use',
    ARRAY['google-classroom','lms','edtech','digital','teacher-guide','setup'],
    0, 0, 'working'
),
-- Canva for Educators
(
    '00000000-0002-0052-0000-000000000001',
    'Canva for Education: Visual Learning for Every Classroom',
    'Canva for Education Guide',
    'Canva Education: ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',
    'How to use Canva''s free Education tier to create stunning visual lessons, student presentations, infographics, notices, and certificates. Includes templates ready-made for Sri Lankan school contexts.',
    'Canva Education guide: visual lessons, infographics, presentations, and certificates for free.',
    'Canva ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',
    'tech_guide', 'document',
    'https://www.canva.com/education/',
    ARRAY['Technology','Arts','Design','EdTech'],
    ARRAY['Visual Learning','Design Tools','Presentations','Infographics','Free Tools'],
    ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
    'beginner', ARRAY['en'], 'public',
    true, false, false, false,
    'Architect', 'admin',
    '© Canva Pty Ltd — Fair Use: Educational Reference',
    'fair_use',
    ARRAY['canva','design','visual-learning','free-tools','presentations','edtech'],
    0, 0, 'working'
);

-- ---------------------------------------------------------------------------
-- G. SCIENCE & ENVIRONMENT
-- ---------------------------------------------------------------------------
INSERT INTO public.nodes (
    id, title, title_en, title_si, description, description_en, description_si,
    type, format, url, subjects, topics, grades, difficulty, language, visibility,
    verified, is_community, is_ministry_official, curriculum_aligned,
    creator_name, creator_role, copyright_notice, license, tags,
    views, endorsements, link_status
) VALUES
-- Sri Lanka Biodiversity Hotspot
(
    '00000000-0002-0060-0000-000000000001',
    'Sri Lanka: A Biodiversity Hotspot',
    'Sri Lanka Biodiversity Hotspot',
    'ශ්‍රී ලංකාව: ජෛව විවිධත්ව ශ්‍රේෂ්ඨ ස්ථානය',
    'Sri Lanka is one of the world''s 36 biodiversity hotspots — home to elephants, leopards, 250+ endemic bird species, and the world''s highest density of biodiversity per unit area. This guide covers ecosystems, threatened species, and conservation.',
    'Sri Lanka is one of 36 global biodiversity hotspots — endemic species, ecosystems, conservation.',
    'ශ්‍රී ලංකාවේ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',
    'reading', 'document',
    'https://www.iucn.org/asia/countries/sri-lanka',
    ARRAY['Science','Environment','Geography','Biology'],
    ARRAY['Biodiversity','Endemic Species','Conservation','Ecology','Sri Lanka'],
    ARRAY[6,7,8,9,10,11,12],
    'intermediate', ARRAY['en','si','ta'], 'public',
    true, false, false, true,
    'Architect', 'admin',
    '© IUCN — Educational Use',
    'educational_use',
    ARRAY['biodiversity','environment','ecology','sri-lanka','science','conservation'],
    0, 0, 'working'
),
-- Climate Change Explainer for Students
(
    '00000000-0002-0061-0000-000000000001',
    'Climate Change: A Guide for Sri Lankan Students',
    'Climate Change for Students',
    'දේශගුණ විපර්යාසය: ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශිෂ්‍ය ශ්‍රේෂ්ඨ',
    'Climate change explained for secondary-level students — the greenhouse effect, sea level rise affecting Sri Lanka''s coasts, monsoon disruption, and what young people can do. Includes data from the IPCC Sri Lanka country profile.',
    'Climate change for secondary students: greenhouse effect, sea level rise, monsoon disruption, action.',
    'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',
    'reading', 'document',
    'https://www.ipcc.ch/report/ar6/wg2/',
    ARRAY['Science','Environment','Geography'],
    ARRAY['Climate Change','Greenhouse Effect','Sea Level Rise','Monsoon','IPCC'],
    ARRAY[7,8,9,10,11,12],
    'intermediate', ARRAY['en','si'], 'public',
    true, false, false, true,
    'Architect', 'admin',
    '© IPCC — Open Access for Education',
    'cc_by',
    ARRAY['climate-change','environment','ipcc','sea-level','students','science'],
    0, 0, 'working'
);

-- ---------------------------------------------------------------------------
-- H. WELLBEING & SOCIAL-EMOTIONAL LEARNING
-- ---------------------------------------------------------------------------
INSERT INTO public.nodes (
    id, title, title_en, title_si, description, description_en, description_si,
    type, format, url, subjects, topics, grades, difficulty, language, visibility,
    verified, is_community, is_ministry_official, curriculum_aligned,
    creator_name, creator_role, copyright_notice, license, tags,
    views, endorsements, link_status
) VALUES
-- SEL: Introduction to Social-Emotional Learning
(
    '00000000-0002-0070-0000-000000000001',
    'Introduction to Social-Emotional Learning (SEL)',
    'Introduction to SEL',
    'සමාජ-හැඟීම් ඉගෙනීමේ හැඳින්වීම (SEL)',
    'CASEL''s framework for Social-Emotional Learning: self-awareness, self-management, social awareness, relationship skills, and responsible decision-making. Includes classroom activities for each competency, adapted for Sri Lankan contexts.',
    'CASEL''s SEL framework with five competencies and classroom activities for Sri Lanka.',
    'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ — CASEL SEL ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',
    'guide', 'document',
    'https://casel.org/fundamentals-of-sel/',
    ARRAY['Wellbeing','SEL','Character Education','Mental Health'],
    ARRAY['Social-Emotional Learning','CASEL','Self-Awareness','Empathy','Relationships'],
    ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
    'beginner', ARRAY['en','si'], 'public',
    true, false, false, true,
    'Architect', 'admin',
    '© CASEL — Open Educational Resource',
    'educational_use',
    ARRAY['sel','wellbeing','casel','social-emotional','mental-health','character'],
    0, 0, 'working'
),
-- Mindfulness for Classrooms
(
    '00000000-0002-0071-0000-000000000001',
    'Mindfulness in the Classroom: A Practical Guide',
    'Mindfulness in the Classroom',
    'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',
    'Evidence-based mindfulness practices adapted for Sri Lankan school settings — 3-minute morning breathing exercises, mindful listening during lessons, and end-of-day reflection rituals. Grounded in Buddhist mindfulness tradition.',
    'Mindfulness practices for Sri Lankan classrooms — breathing, listening, reflection, Buddhist roots.',
    'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',
    'guide', 'document',
    'https://greatergood.berkeley.edu/topic/mindfulness/definition',
    ARRAY['Wellbeing','Mindfulness','Buddhist Education','Mental Health'],
    ARRAY['Mindfulness','Breathing','Reflection','Buddhist Practice','Student Wellbeing'],
    ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
    'beginner', ARRAY['en','si','ta'], 'public',
    true, false, false, true,
    'Architect', 'admin',
    'Greater Good Science Center — Open Educational Resource',
    'cc_by',
    ARRAY['mindfulness','wellbeing','breathing','reflection','buddhist','classroom'],
    0, 0, 'working'
);

-- ============================================================================
-- 3. COLLECTIONS — Curated Learning Paths
-- ============================================================================
INSERT INTO public.collections (
    id, name, description, subjects, grades, resource_ids, sequence_order,
    visibility, is_official, estimated_duration
) VALUES
-- 1. Teacher Foundations
(
    '00000000-0003-0001-0000-000000000001',
    'Teacher Foundations: The Essential Shelf',
    'The five books and guides every Gurudevi teacher should read in their first year. From Freire''s liberation pedagogy to Bloom''s taxonomy to mindful classroom practice.',
    ARRAY['Pedagogy','Philosophy'],
    ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
    ARRAY[
        '00000000-0002-0001-0000-000000000001'::UUID,  -- Freire
        '00000000-0002-0002-0000-000000000001'::UUID,  -- Vygotsky
        '00000000-0002-0003-0000-000000000001'::UUID,  -- Gibran
        '00000000-0002-0020-0000-000000000001'::UUID,  -- Bloom's Taxonomy
        '00000000-0002-0021-0000-000000000001'::UUID   -- Socratic Questioning
    ],
    ARRAY[0,1,2,3,4],
    'public', true,
    '8–10 hours'
),
-- 2. Sri Lanka Heritage Journey
(
    '00000000-0003-0002-0000-000000000001',
    'Sri Lanka Heritage Journey',
    'Explore the deep roots of Sri Lankan civilisation — from the Mahavamsa to Sigiriya, ancient irrigation, and the living culture of the Esala Perahera. For students and teachers who want to know where they come from.',
    ARRAY['History','Culture','Heritage'],
    ARRAY[5,6,7,8,9,10],
    ARRAY[
        '00000000-0002-0012-0000-000000000001'::UUID,  -- Mahavamsa
        '00000000-0002-0010-0000-000000000001'::UUID,  -- Ancient Irrigation
        '00000000-0002-0011-0000-000000000001'::UUID,  -- Sigiriya
        '00000000-0002-0013-0000-000000000001'::UUID   -- Esala Perahera
    ],
    ARRAY[0,1,2,3],
    'public', true,
    '4–6 hours'
),
-- 3. Inspiring Cinema: Films Every Student Should Watch
(
    '00000000-0003-0003-0000-000000000001',
    'Inspiring Cinema: Films for the Aspiring Mind',
    'Four inspiring films (trailer clips) that challenge assumptions about education, potential, and purpose. Perfect for school screenings, homeroom discussions, or weekend watching.',
    ARRAY['Inspiration','Education'],
    ARRAY[7,8,9,10,11,12],
    ARRAY[
        '00000000-0002-0030-0000-000000000001'::UUID,  -- Dead Poets Society
        '00000000-0002-0031-0000-000000000001'::UUID,  -- To Sir With Love
        '00000000-0002-0032-0000-000000000001'::UUID,  -- Iqbal
        '00000000-0002-0033-0000-000000000001'::UUID   -- 3 Idiots
    ],
    ARRAY[0,1,2,3],
    'public', true,
    '2 hours (trailers) / 10 hours (films)'
),
-- 4. Digital Teacher Toolkit
(
    '00000000-0003-0004-0000-000000000001',
    'Digital Teacher Toolkit 2026',
    'Three practical guides to get every Sri Lankan teacher online, visual, and AI-ready. No coding required. Start with Google Classroom, add visual power with Canva, then explore AI tools with confidence.',
    ARRAY['Technology','EdTech'],
    ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
    ARRAY[
        '00000000-0002-0051-0000-000000000001'::UUID,  -- Google Classroom
        '00000000-0002-0052-0000-000000000001'::UUID,  -- Canva
        '00000000-0002-0050-0000-000000000001'::UUID   -- AI in Education
    ],
    ARRAY[0,1,2],
    'public', true,
    '3–4 hours'
),
-- 5. Wellbeing First: SEL & Mindfulness
(
    '00000000-0003-0005-0000-000000000001',
    'Wellbeing First: SEL & Mindfulness in School',
    'Social-emotional learning and mindfulness form the invisible foundation of every great school. This collection covers the CASEL framework, Buddhist-rooted mindfulness, and the Jataka Tales as character education.',
    ARRAY['Wellbeing','SEL','Character Education'],
    ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
    ARRAY[
        '00000000-0002-0070-0000-000000000001'::UUID,  -- SEL Introduction
        '00000000-0002-0071-0000-000000000001'::UUID,  -- Mindfulness
        '00000000-0002-0041-0000-000000000001'::UUID   -- Jataka Tales
    ],
    ARRAY[0,1,2],
    'public', true,
    '3–4 hours'
);

-- ============================================================================
-- 4. EDGES — Knowledge Relationships
-- ============================================================================
INSERT INTO public.edges (
    from_node_id, to_node_id, relationship, weight, is_ai_generated, is_verified
) VALUES
-- Pedagogy graph
('00000000-0002-0001-0000-000000000001', '00000000-0002-0002-0000-000000000001', 'related', 0.9, false, true),   -- Freire → Vygotsky
('00000000-0002-0001-0000-000000000001', '00000000-0002-0020-0000-000000000001', 'related', 0.8, false, true),   -- Freire → Bloom's
('00000000-0002-0001-0000-000000000001', '00000000-0002-0021-0000-000000000001', 'leads_to', 0.75, false, true), -- Freire → Socratic
('00000000-0002-0002-0000-000000000001', '00000000-0002-0022-0000-000000000001', 'leads_to', 0.85, false, true), -- Vygotsky → Differentiated Instruction (ZPD basis)
('00000000-0002-0004-0000-000000000001', '00000000-0002-0022-0000-000000000001', 'related', 0.7, false, true),   -- Montessori → Differentiated Instruction
('00000000-0002-0020-0000-000000000001', '00000000-0002-0021-0000-000000000001', 'related', 0.8, false, true),   -- Bloom's → Socratic
('00000000-0002-0003-0000-000000000001', '00000000-0002-0071-0000-000000000001', 'leads_to', 0.7, false, true),  -- Gibran → Mindfulness

-- Sri Lanka heritage links
('00000000-0002-0010-0000-000000000001', '00000000-0002-0011-0000-000000000001', 'related', 0.85, false, true),  -- Irrigation → Sigiriya
('00000000-0002-0012-0000-000000000001', '00000000-0002-0010-0000-000000000001', 'leads_to', 0.8, false, true),  -- Mahavamsa → Irrigation
('00000000-0002-0012-0000-000000000001', '00000000-0002-0011-0000-000000000001', 'related', 0.7, false, true),   -- Mahavamsa → Sigiriya
('00000000-0002-0013-0000-000000000001', '00000000-0002-0012-0000-000000000001', 'related', 0.65, false, true),  -- Perahera → Mahavamsa

-- Wellbeing / SEL links
('00000000-0002-0070-0000-000000000001', '00000000-0002-0071-0000-000000000001', 'leads_to', 0.9, false, true),  -- SEL → Mindfulness
('00000000-0002-0041-0000-000000000001', '00000000-0002-0070-0000-000000000001', 'related', 0.75, false, true),  -- Jataka Tales → SEL
('00000000-0002-0071-0000-000000000001', '00000000-0002-0041-0000-000000000001', 'related', 0.8, false, true),   -- Mindfulness → Jataka Tales

-- Stories for literature
('00000000-0002-0040-0000-000000000001', '00000000-0002-0070-0000-000000000001', 'related', 0.6, false, true),   -- Old Man & Sea → SEL (resilience)
('00000000-0002-0042-0000-000000000001', '00000000-0002-0070-0000-000000000001', 'related', 0.7, false, true),   -- Little Prince → SEL (values)

-- Films → Pedagogy topics
('00000000-0002-0030-0000-000000000001', '00000000-0002-0001-0000-000000000001', 'related', 0.7, false, true),   -- Dead Poets → Freire
('00000000-0002-0033-0000-000000000001', '00000000-0002-0022-0000-000000000001', 'related', 0.6, false, true),   -- 3 Idiots → Differentiated Instruction

-- Technology → Bloom's (tools enable higher-order thinking)
('00000000-0002-0050-0000-000000000001', '00000000-0002-0020-0000-000000000001', 'related', 0.6, false, true),   -- AI Guide → Bloom's
('00000000-0002-0051-0000-000000000001', '00000000-0002-0022-0000-000000000001', 'related', 0.6, false, true),   -- Google Classroom → Differentiation

-- Environment links
('00000000-0002-0060-0000-000000000001', '00000000-0002-0061-0000-000000000001', 'related', 0.9, false, true),   -- Biodiversity → Climate Change
('00000000-0002-0010-0000-000000000001', '00000000-0002-0060-0000-000000000001', 'related', 0.55, false, true);  -- Ancient Irrigation → Biodiversity
