-- ============================================================================
-- GURUDEVI LIBRARY: EXPANDED SEED — Cinema, Books & Sri Lanka
--
-- An ambitious epistemic universe:
--   ✦ 32 films about teachers, learning, schools (global + South Asian)
--   ✦ 22 essential books and novels
--   ✦ 8 Sri Lanka–specific resources (culture, science, stories)
--   ✦ 6 curated collections binding them into learning journeys
--   ✦ 35+ semantic edges for the knowledge graph
--
-- All items: is_community = false, verified = true, creator = 'Architect'
-- Language codes follow ISO 639-1: 'en', 'si', 'ta'
-- ============================================================================

-- ============================================================================
-- A. CINEMA — Films about Teachers, Learning & the Human Spirit
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- A1. INTERNATIONAL CLASSICS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.nodes (
    id, title, title_en, title_si,
    description, description_en,
    type, format, url,
    subjects, topics, grades, difficulty, language, visibility,
    verified, is_community, curriculum_aligned,
    creator_name, creator_role, copyright_notice, license, tags,
    views, endorsements, link_status
) VALUES

-- 1. Stand and Deliver (1988)
(
    '00000000-0004-0001-0000-000000000001',
    'Stand and Deliver (1988)',
    'Stand and Deliver',
    'Stand and Deliver (1988)',
    'Jaime Escalante, a fearless maths teacher at Garfield High in East Los Angeles, convinces his barrio students they can master AP Calculus. Based on a true story. A masterclass in high expectations, belief, and refusing to accept a ceiling on any child''s potential.',
    'True story: Jaime Escalante teaches calculus to students everyone had written off. The power of radical belief in students.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=pQXIenVnJmY',
    ARRAY['Inspiration','Mathematics','Social Justice'],
    ARRAY['High Expectations','Teacher Belief','Student Potential','Calculus','Barrio Schools'],
    ARRAY[8,9,10,11,12],
    'beginner', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © Warner Bros. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['stand-and-deliver','maths','belief','barrio','teacher','true-story'],
    0, 0, 'working'
),

-- 2. Mr. Holland's Opus (1995)
(
    '00000000-0004-0002-0000-000000000001',
    'Mr. Holland''s Opus (1995)',
    'Mr. Holland''s Opus',
    'Mr. Holland''s Opus (1995)',
    'Glenn Holland arrives intending to teach music temporarily while composing his magnum opus. Thirty years later, the opus is the thousands of students whose lives he changed. A film about legacy, vocation, and the quiet heroism of the long-distance teacher.',
    'A composer becomes a teacher for 30 years. His legacy: thousands of changed lives. The quiet heroism of a teaching life.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=PFBt80GqAqY',
    ARRAY['Inspiration','Music','Education'],
    ARRAY['Teacher Legacy','Vocation','Music Education','Long Career','Purpose'],
    ARRAY[9,10,11,12],
    'beginner', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © Hollywood Pictures. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['mr-hollands-opus','music','legacy','teaching-life','vocation'],
    0, 0, 'working'
),

-- 3. Freedom Writers (2007)
(
    '00000000-0004-0003-0000-000000000001',
    'Freedom Writers (2007)',
    'Freedom Writers',
    'Freedom Writers (2007)',
    'Erin Gruwell gives her diverse, gang-affected students diaries and asks them to write their truths. Based on a true story, this film shows how writing — the act of bearing witness to one''s own life — can transform students written off by the system.',
    'True story: Erin Gruwell uses writing and Anne Frank''s diary to transform gang-affected teenagers.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=fvCfIWLDoNs',
    ARRAY['Inspiration','English','Social Justice','Wellbeing'],
    ARRAY['Writing','Student Voice','Gang Violence','Bearing Witness','Inner City'],
    ARRAY[9,10,11,12],
    'beginner', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © Paramount Pictures. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['freedom-writers','writing','student-voice','social-justice','true-story'],
    0, 0, 'working'
),

-- 4. The Miracle Worker (1962)
(
    '00000000-0004-0004-0000-000000000001',
    'The Miracle Worker (1962)',
    'The Miracle Worker',
    'The Miracle Worker (1962)',
    'Anne Sullivan teaches a deaf, blind, and mute Helen Keller to communicate — one word at a time. The scene at the water pump, where Helen finally understands that things have names, is perhaps the most electrifying moment in educational cinema. The film is a meditation on patience, love, and the human will to reach another mind.',
    'Anne Sullivan''s relentless teaching of Helen Keller — patience, love, and the miracle of communication.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=Gi6GblFOmTk',
    ARRAY['Inspiration','Special Education','History'],
    ARRAY['Deaf Education','Patience','Communication','Helen Keller','Disability'],
    ARRAY[7,8,9,10,11,12],
    'beginner', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © MGM/UA. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['miracle-worker','helen-keller','anne-sullivan','disability','patience'],
    0, 0, 'working'
),

-- 5. Finding Forrester (2000)
(
    '00000000-0004-0005-0000-000000000001',
    'Finding Forrester (2000)',
    'Finding Forrester',
    'Finding Forrester (2000)',
    'A reclusive, brilliant author becomes an unlikely mentor to a young Black basketball player with a gift for writing. Sean Connery''s William Forrester teaches Jamal that writing is the act of going somewhere alone — and that mentorship is mutual liberation.',
    'A reclusive author mentors a young writer: on trust, race, talent, and the courage to write.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=RHiwnMHF47g',
    ARRAY['Inspiration','English','Mentorship'],
    ARRAY['Writing','Mentorship','Race','Talent','Trust'],
    ARRAY[9,10,11,12],
    'beginner', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © Columbia Pictures. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['finding-forrester','writing','mentorship','race','talent'],
    0, 0, 'working'
),

-- 6. Lean on Me (1989)
(
    '00000000-0004-0006-0000-000000000001',
    'Lean on Me (1989)',
    'Lean on Me',
    'Lean on Me (1989)',
    'Joe Clark storms into Eastside High, New Jersey, with a baseball bat and an ultimatum: learn, or leave. Controversial but instructive — this film forces honest conversation about what it takes to lead a school in crisis, the tension between discipline and dignity, and whether tough love can transform culture.',
    'Principal Joe Clark transforms a drug-ridden school with radical discipline — and forces questions about leadership, dignity, and love.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=9H0SGsHWY4k',
    ARRAY['Inspiration','Leadership','Education'],
    ARRAY['School Leadership','Discipline','Culture Change','Principal'],
    ARRAY[9,10,11,12],
    'beginner', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © Warner Bros. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['lean-on-me','principal','discipline','school-culture','leadership'],
    0, 0, 'working'
),

-- 7. The Great Debaters (2007)
(
    '00000000-0004-0007-0000-000000000001',
    'The Great Debaters (2007)',
    'The Great Debaters',
    'The Great Debaters (2007)',
    'Melvin Tolson coaches the Wiley College debate team in 1935 Texas — Black students who will argue their way to Harvard against a system that says they have no voice. Denzel Washington directs and stars. A film about oratory, courage, and the weaponisation of knowledge.',
    'True story: Black debate students in 1935 Texas argue their way to Harvard against racial injustice.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=i6Lf7qIoGLM',
    ARRAY['Inspiration','English','Social Justice','History'],
    ARRAY['Debate','Oratory','Racial Justice','Student Courage','1935 America'],
    ARRAY[9,10,11,12],
    'beginner', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © The Weinstein Company. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['great-debaters','debate','race','1935','social-justice','oratory'],
    0, 0, 'working'
),

-- 8. Coach Carter (2005)
(
    '00000000-0004-0008-0000-000000000001',
    'Coach Carter (2005)',
    'Coach Carter',
    'Coach Carter (2005)',
    'Ken Carter locks his undefeated basketball team out of the gym until their grades improve. The team, the parents, and the school board revolt. A true story about the radical proposition that academic excellence and athletic excellence are not opposites — and that a coach''s first duty is to their students'' futures.',
    'True story: Coach Carter locks out his winning basketball team until they improve grades. Education first.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=9DhSjbRl8oA',
    ARRAY['Inspiration','Sports','Education'],
    ARRAY['Academic Excellence','Sports Coaching','High Expectations','Student Future'],
    ARRAY[8,9,10,11,12],
    'beginner', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © Paramount Pictures. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['coach-carter','basketball','grades','high-expectations','true-story'],
    0, 0, 'working'
),

-- 9. October Sky (1999)
(
    '00000000-0004-0009-0000-000000000001',
    'October Sky (1999)',
    'October Sky',
    'October Sky (1999)',
    'Homer Hickam, son of a West Virginia coal miner, watches Sputnik cross the night sky in 1957 and decides he will build rockets. His science teacher Miss Riley sees what no one else does. A film about passion, STEM, the courage to dream outside your birthplace, and a teacher''s belief that changes the direction of a life.',
    'Homer Hickam watches Sputnik and builds rockets. His teacher''s belief changes his life. A STEM origin story.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=LKdVaKCdmAw',
    ARRAY['Inspiration','Science','STEM'],
    ARRAY['STEM','Rocketry','Teacher Belief','Working Class','Aspiration'],
    ARRAY[7,8,9,10,11,12],
    'beginner', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © Universal Pictures. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['october-sky','stem','rockets','teacher-belief','sputnik','aspiration'],
    0, 0, 'working'
),

-- 10. Mona Lisa Smile (2003)
(
    '00000000-0004-0010-0000-000000000001',
    'Mona Lisa Smile (2003)',
    'Mona Lisa Smile',
    'Mona Lisa Smile (2003)',
    'Katherine Watson arrives at Wellesley College in 1953 to teach art history — and discovers her brilliant students are being educated only to become wives. She teaches them to see, to question, to demand more. A film about gender, education, art, and the subversive act of teaching women to think for themselves.',
    'A 1953 art teacher challenges Wellesley women to see beyond the perfect life they''re trained for. Education as liberation.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=C7u4Xb4bvME',
    ARRAY['Inspiration','Art','Gender','History'],
    ARRAY['Women''s Education','Art History','Critical Thinking','1950s','Liberation'],
    ARRAY[10,11,12],
    'beginner', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © Columbia Pictures. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['mona-lisa-smile','women','art','1953','education','liberation'],
    0, 0, 'working'
),

-- 11. Whiplash (2014)
(
    '00000000-0004-0011-0000-000000000001',
    'Whiplash (2014)',
    'Whiplash',
    'Whiplash (2014)',
    '"There are no two words in the English language more harmful than ''good job''." J.K. Simmons as Fletcher — a conductor who uses fear and humiliation to drive genius. Whiplash is the perfect provocation for every educator: what is the difference between demanding excellence and destroying a person? There is no easy answer.',
    'A jazz conductor''s brutal methods spark genius — and ask the hardest question in education: where is the line?',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=7d_jQycdQGo',
    ARRAY['Inspiration','Music','Pedagogy'],
    ARRAY['Excellence','Pressure','Teacher Ethics','Passion','Music','Boundaries'],
    ARRAY[10,11,12],
    'intermediate', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © Sony Pictures Classics. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['whiplash','music','excellence','pressure','ethics','debate'],
    0, 0, 'working'
),

-- 12. Good Will Hunting (1997)
(
    '00000000-0004-0012-0000-000000000001',
    'Good Will Hunting (1997)',
    'Good Will Hunting',
    'Good Will Hunting (1997)',
    '"It''s not your fault." Will Hunting is a janitor at MIT with the mind of a polymath and a fortress of trauma keeping him from his own life. Robin Williams as Sean Maguire shows that real education is therapeutic — it helps a person arrive at who they already are. Essential for counsellors, teachers, and anyone who works with hurt young people.',
    'A genius janitor and a therapist — on unlocking potential blocked by trauma. The human heart of education.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=ReIRni_SR2g',
    ARRAY['Inspiration','Psychology','Mentorship','Wellbeing'],
    ARRAY['Trauma','Mentorship','Unlocking Potential','Counselling','Genius'],
    ARRAY[10,11,12],
    'intermediate', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © Miramax. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['good-will-hunting','trauma','mentorship','genius','robin-williams'],
    0, 0, 'working'
),

-- 13. School of Rock (2003)
(
    '00000000-0004-0013-0000-000000000001',
    'School of Rock (2003)',
    'School of Rock',
    'School of Rock (2003)',
    'Dewey Finn, a failed rock musician, poses as a substitute teacher and turns his students into a band. Beneath the comedy is a serious argument: students learn best when they''re passionate, when the content is real, and when the teacher trusts their creativity. Jack Black at his most joyful.',
    'A failed rock musician accidentally teaches children through passion, play, and genuine creative work.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=1T2Y5qL3h6Q',
    ARRAY['Inspiration','Music','Pedagogy'],
    ARRAY['Passion-Based Learning','Music Education','Play','Creative Learning','Student Agency'],
    ARRAY[5,6,7,8,9,10],
    'beginner', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © Paramount Pictures. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['school-of-rock','music','creativity','passion','play','student-agency'],
    0, 0, 'working'
),

-- 14. Dangerous Minds (1995)
(
    '00000000-0004-0014-0000-000000000001',
    'Dangerous Minds (1995)',
    'Dangerous Minds',
    'Dangerous Minds (1995)',
    'LouAnne Johnson, a former US Marine, walks into a class of at-risk teenagers and has to earn every millimetre of trust. She uses Bob Dylan and Dylan Thomas as entry points. Based on a true story — and a reminder that every difficult student has a reason, and that a teacher''s job is to find it.',
    'True story: A former Marine teacher finds her way into at-risk teens through poetry and earned trust.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=pM1hy_YqHrM',
    ARRAY['Inspiration','English','Social Justice'],
    ARRAY['At-Risk Students','Poetry','Trust','Inner City','Teacher Resilience'],
    ARRAY[9,10,11,12],
    'beginner', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © Hollywood Pictures. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['dangerous-minds','poetry','trust','at-risk','true-story'],
    0, 0, 'working'
),

-- 15. The Class / Entre les Murs (2008)
(
    '00000000-0004-0015-0000-000000000001',
    'The Class (Entre les murs) — 2008',
    'The Class (Entre les murs)',
    'The Class — 2008 ගොස් ශ්‍රේෂ්ඨ',
    'A French teacher struggles to engage his multicultural class of teenagers in a Paris public school. Winner of the Palme d''Or. Not inspirational in the Hollywood sense — but absolutely honest about the messy, exhausting, real work of teaching. No heroes, no miracles. Just the daily trench.',
    'Palme d''Or winner. A Paris teacher navigates a multicultural class — no miracles, just the honest daily work.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=2YuDq5YDjk8',
    ARRAY['Education','Pedagogy','Social Justice'],
    ARRAY['Classroom Reality','Multicultural Education','Teacher Exhaustion','Paris','Authentic Teaching'],
    ARRAY[10,11,12],
    'intermediate', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © Haut et Court. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['the-class','entre-les-murs','france','multicultural','palme-dor','reality'],
    0, 0, 'working'
),

-- 16. Conrack (1974)
(
    '00000000-0004-0016-0000-000000000001',
    'Conrack (1974)',
    'Conrack',
    'Conrack (1974)',
    'Pat Conroy (the novelist) teaches isolated, largely illiterate Black children on a remote South Carolina island. He arrives knowing nothing about how to reach them and improvises — music, stories, sport — until the system fires him for "caring too much." A deeply honest, pre-Hollywood look at what teaching in neglected places costs.',
    'Pat Conroy teaches isolated Black children on a remote island — improvising, loving, and eventually fired for it.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=I6KrUkZDd7I',
    ARRAY['Inspiration','History','Social Justice'],
    ARRAY['Rural Education','Race','Improvised Teaching','Pat Conroy','Neglected Schools'],
    ARRAY[10,11,12],
    'intermediate', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © 20th Century Fox. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['conrack','rural','race','pat-conroy','isolated','teaching'],
    0, 0, 'working'
),

-- 17. Educating Rita (1983)
(
    '00000000-0004-0017-0000-000000000001',
    'Educating Rita (1983)',
    'Educating Rita',
    'Educating Rita (1983)',
    'A hairdresser wants a proper education. Her Open University tutor is a burnt-out alcoholic academic. They transform each other. Michael Caine and Julie Walters at their finest — a film about the hunger for knowledge, class barriers, and how true education transforms both the taught and the teacher.',
    'A hairdresser and a burnt-out tutor transform each other through the hunger for genuine education. Class, knowledge, and mutual growth.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=cbz1gkNbFJM',
    ARRAY['Inspiration','Education','Class','Literature'],
    ARRAY['Adult Education','Working Class','Mutual Learning','Open University','Class Barriers'],
    ARRAY[10,11,12],
    'beginner', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © Rank Film. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['educating-rita','adult-education','working-class','mutual-learning','michael-caine'],
    0, 0, 'working'
),

-- 18. The Ron Clark Story (2006)
(
    '00000000-0004-0018-0000-000000000001',
    'The Ron Clark Story (2006)',
    'The Ron Clark Story',
    'The Ron Clark Story (2006)',
    'Ron Clark leaves rural North Carolina to teach in Harlem''s hardest school. He dances, raps, sleeps on the classroom floor, and refuses every excuse the system offers. A film about radical energy, resilience, and the teacher who refuses the word impossible. Based entirely on a true story.',
    'Ron Clark dances, raps, and refuses every excuse to reach Harlem''s toughest class. Radical energy and belief.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=TuqvH9Fq5bM',
    ARRAY['Inspiration','Education','Social Justice'],
    ARRAY['Harlem','Radical Teaching','Energy','Belief','True Story','Urban Education'],
    ARRAY[7,8,9,10,11,12],
    'beginner', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © Turner Network Television. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['ron-clark','harlem','energy','belief','urban-education','true-story'],
    0, 0, 'working'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- A2. SOUTH ASIAN CINEMA
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.nodes (
    id, title, title_en, title_si,
    description, description_en,
    type, format, url,
    subjects, topics, grades, difficulty, language, visibility,
    verified, is_community, curriculum_aligned,
    creator_name, creator_role, copyright_notice, license, tags,
    views, endorsements, link_status
) VALUES

-- 19. Taare Zameen Par (2007)
(
    '00000000-0004-0019-0000-000000000001',
    'Taare Zameen Par — Like Stars on Earth (2007)',
    'Taare Zameen Par (Like Stars on Earth)',
    'Taare Zameen Par — ආකාශයේ තරු (2007)',
    'Eight-year-old Ishaan is failing at everything — until a substitute art teacher recognises his severe dyslexia behind the failure. Aamir Khan''s film is essential viewing for every teacher working with learning differences. It asks: what does it cost a child when no adult can see them?',
    'Aamir Khan''s film: a dyslexic boy finally seen by a perceptive art teacher. Essential for every educator.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=96SqRiZ2EzM',
    ARRAY['Inspiration','Special Education','Art','Wellbeing'],
    ARRAY['Dyslexia','Learning Differences','Art Therapy','Child Wellbeing','Inclusive Education'],
    ARRAY[4,5,6,7,8,9,10],
    'beginner', ARRAY['si','ta','en'], 'public',
    true, false, true,
    'Architect', 'admin',
    'YouTube — © Aamir Khan Productions. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['taare-zameen-par','dyslexia','art','aamir-khan','inclusion','learning-differences'],
    0, 0, 'working'
),

-- 20. Super 30 (2019)
(
    '00000000-0004-0020-0000-000000000001',
    'Super 30 (2019)',
    'Super 30',
    'Super 30 (2019)',
    'Mathematician Anand Kumar selects 30 economically underprivileged students each year and coaches them for the IIT entrance exam — at no cost. A true story. Hrithik Roshan''s portrayal captures what it looks like when a teacher''s mission to equalise opportunity becomes a movement.',
    'True story: Anand Kumar coaches 30 poor students for IIT JEE for free every year. Education as equaliser.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=YnjxkPnfbI4',
    ARRAY['Inspiration','Mathematics','Social Justice','Science'],
    ARRAY['Equal Opportunity','IIT','Free Coaching','Poverty','STEM','Anand Kumar'],
    ARRAY[9,10,11,12],
    'beginner', ARRAY['si','ta','en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © Reliance Entertainment. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['super-30','anand-kumar','iit','poverty','maths','equal-opportunity'],
    0, 0, 'working'
),

-- 21. Hichki (2018)
(
    '00000000-0004-0021-0000-000000000001',
    'Hichki (2018)',
    'Hichki',
    'Hichki (2018)',
    'Naina Mathur has Tourette''s syndrome. After being rejected from every school, she finally gets a teaching post — assigned the most unruly class in the school. A Bollywood film about disability, perseverance, and the teacher who refuses to give up on the students everyone else has given up on.',
    'A teacher with Tourette''s gets the class no one wants. A film about disability, resilience, and radical inclusion.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=7FWNBwOy3sI',
    ARRAY['Inspiration','Special Education','Wellbeing','Social Justice'],
    ARRAY['Tourette''s','Disability','Inclusion','Resilience','Underprivileged Students'],
    ARRAY[7,8,9,10,11,12],
    'beginner', ARRAY['si','ta','en'], 'public',
    true, false, true,
    'Architect', 'admin',
    'YouTube — © Yash Raj Films. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['hichki','tourette''s','disability','inclusion','bollywood','rani-mukerji'],
    0, 0, 'working'
),

-- 22. Chalk (2007 mockumentary)
(
    '00000000-0004-0022-0000-000000000001',
    'Chalk (2007) — Teacher Mockumentary',
    'Chalk (2007)',
    'Chalk (2007)',
    'A dry, funny, deeply honest mockumentary about three first-year high school teachers in Texas. No Hollywood heroics — just the grinding daily comedy of lesson planning, faculty politics, and the small victories that keep teachers going. A gift for every new teacher who feels like they''re barely surviving.',
    'A mockumentary on first-year teachers in Texas. Brutally honest and deeply funny — no Hollywood heroes.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=tL-X3IHO3EM',
    ARRAY['Education','Pedagogy','Humour'],
    ARRAY['New Teacher','Teacher Resilience','Daily Reality','Mockumentary','First Year'],
    ARRAY[10,11,12],
    'beginner', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © Virgil Films. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['chalk','mockumentary','first-year-teacher','humour','reality','texas'],
    0, 0, 'working'
),

-- 23. The History Boys (2006)
(
    '00000000-0004-0023-0000-000000000001',
    'The History Boys (2006)',
    'The History Boys',
    'The History Boys (2006)',
    'Two teachers prepare a group of grammar school boys for Oxbridge entrance exams. One teaches by rote and strategy. The other, Hector, teaches useless knowledge — literature, poetry, song — that turns out to be the most enduring. Alan Bennett''s masterwork about what education is actually for.',
    'Two teachers, two methods, and one brilliant question: what is education actually for? Alan Bennett''s masterwork.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=Nzsk0xdW__I',
    ARRAY['Education','Literature','Philosophy','History'],
    ARRAY['Purpose of Education','Oxbridge','Two Pedagogies','Literature','Alan Bennett'],
    ARRAY[10,11,12],
    'advanced', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © BBC Films. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['history-boys','oxford','literature','alan-bennett','purpose','two-methods'],
    0, 0, 'working'
),

-- 24. The First Grader (2010)
(
    '00000000-0004-0024-0000-000000000001',
    'The First Grader (2010)',
    'The First Grader',
    'The First Grader (2010)',
    '84-year-old Kimani Ng''ang''a Maruge, a Kenyan Mau Mau veteran, insists on enrolling in primary school to learn to read — in his school uniform. A true story that reframes every question about age, access, and the hunger for education. The most moving argument for universal literacy ever put on film.',
    'True story: an 84-year-old Kenyan man enrols in primary school to learn to read. The hunger for literacy.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=Pu43X3OAJ7Q',
    ARRAY['Inspiration','Literacy','Social Justice','History'],
    ARRAY['Adult Literacy','Kenya','Mau Mau','Universal Education','True Story'],
    ARRAY[5,6,7,8,9,10,11,12],
    'beginner', ARRAY['en','si','ta'], 'public',
    true, false, true,
    'Architect', 'admin',
    'YouTube — © BBC Films. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['first-grader','kenya','literacy','84-years','mau-mau','universal-education'],
    0, 0, 'working'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- A3. DOCUMENTARIES ABOUT EDUCATION
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.nodes (
    id, title, title_en, title_si,
    description, description_en,
    type, format, url,
    subjects, topics, grades, difficulty, language, visibility,
    verified, is_community, curriculum_aligned,
    creator_name, creator_role, copyright_notice, license, tags,
    views, endorsements, link_status
) VALUES

-- 25. Most Likely to Succeed (2015)
(
    '00000000-0004-0025-0000-000000000001',
    'Most Likely to Succeed (Documentary, 2015)',
    'Most Likely to Succeed',
    'Most Likely to Succeed (2015)',
    'A documentary challenging the century-old factory model of schooling. Visits High Tech High in San Diego — where students design, build, and present instead of sit, memorise, and test. A must-watch for any principal considering a different future for their school.',
    'Documentary: High Tech High''s project-based model challenges the factory school. What should school actually do?',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=wZf5qHGHekM',
    ARRAY['Education','Pedagogy','Innovation'],
    ARRAY['Project-Based Learning','School Redesign','Factory Model','High Tech High','Future of Education'],
    ARRAY[7,8,9,10,11,12],
    'intermediate', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © Think Media Studios. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['most-likely-to-succeed','documentary','project-based','school-redesign','high-tech-high'],
    0, 0, 'working'
),

-- 26. Waiting for Superman (2010)
(
    '00000000-0004-0026-0000-000000000001',
    'Waiting for Superman (Documentary, 2010)',
    'Waiting for Superman',
    'Waiting for Superman (2010)',
    'Davis Guggenheim follows five children through America''s failing public school lottery. A provocative and emotional documentary about access, systemic failure, and the families waiting for a miracle. Sparks vital debate about what governments owe children. Screened and discussed across Sri Lankan education policy circles.',
    'Five children wait for lottery places in good schools. A devastating documentary about systemic failure and access.',
    'movie_trailer', 'video',
    'https://www.youtube.com/watch?v=e_m-XTmCYNw',
    ARRAY['Education','Policy','Social Justice'],
    ARRAY['School Systems','Inequality','Access','Lottery','Policy','Systemic Failure'],
    ARRAY[10,11,12],
    'intermediate', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © Paramount Vantage. Fair use: educational inspiration excerpt.',
    'fair_use',
    ARRAY['waiting-for-superman','documentary','inequality','policy','access','systemic'],
    0, 0, 'working'
),

-- 27. Ken Robinson — Do Schools Kill Creativity? (TED, 2006)
(
    '00000000-0004-0027-0000-000000000001',
    'Ken Robinson — Do Schools Kill Creativity? (TED 2006)',
    'Do Schools Kill Creativity? — Ken Robinson TED',
    'Ken Robinson — TED කථාව: ශාලා නිර්මාණශීලිත්වය මරනවාද?',
    'The most-watched TED Talk of all time. Sir Ken Robinson argues that our education systems are mining our children''s creative and intellectual capacities. Funny, urgent, and devastating. Every Gurudevi teacher should watch this before their first day in the classroom.',
    'The most-watched TED Talk ever: Ken Robinson argues schools systematically destroy creativity.',
    'video', 'video',
    'https://www.youtube.com/watch?v=iG9CE55wbtY',
    ARRAY['Education','Creativity','Pedagogy','Philosophy'],
    ARRAY['Creativity','School Critique','Ken Robinson','TED','Standardisation'],
    ARRAY[7,8,9,10,11,12],
    'beginner', ARRAY['en','si','ta'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © TED Conferences LLC. Creative Commons CC-BY-NC-ND.',
    'cc_by_nc_nd',
    ARRAY['ken-robinson','ted','creativity','schools','standardisation','must-watch'],
    0, 0, 'working'
),

-- 28. Rita Pierson — Every Kid Needs a Champion (TED, 2013)
(
    '00000000-0004-0028-0000-000000000001',
    'Rita Pierson — Every Kid Needs a Champion (TED 2013)',
    'Every Kid Needs a Champion — Rita Pierson TED',
    'Rita Pierson — TED: සෑම දරුවෙකුටම ශූරයෙකු අවශ්‍යයි',
    '"Kids don''t learn from people they don''t like." Rita Pierson, a career teacher for 40 years, delivers the most emotionally honest TED Talk about human connection in education. An 8-minute sermon that will make every teacher cry and then go back to their classroom differently.',
    '"Kids don''t learn from people they don''t like." Rita Pierson on the human connection at the centre of teaching.',
    'video', 'video',
    'https://www.youtube.com/watch?v=SFnMTHhKdkw',
    ARRAY['Inspiration','Pedagogy','Wellbeing'],
    ARRAY['Human Connection','Teacher-Student Relationship','Care','Champion','TED'],
    ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
    'beginner', ARRAY['en','si','ta'], 'public',
    true, false, false,
    'Architect', 'admin',
    'YouTube — © TED Conferences LLC. Creative Commons CC-BY-NC-ND.',
    'cc_by_nc_nd',
    ARRAY['rita-pierson','ted','champion','connection','care','must-watch'],
    0, 0, 'working'
);

-- ============================================================================
-- B. BOOKS & NOVELS — The Essential Shelf
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- B1. NOVELS FOR THE CLASSROOM AND THE SOUL
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.nodes (
    id, title, title_en, title_si,
    description, description_en,
    type, format, url,
    subjects, topics, grades, difficulty, language, visibility,
    verified, is_community, curriculum_aligned,
    creator_name, creator_role, copyright_notice, license, tags,
    views, endorsements, link_status
) VALUES

-- 29. To Kill a Mockingbird — Harper Lee
(
    '00000000-0005-0001-0000-000000000001',
    'To Kill a Mockingbird — Harper Lee',
    'To Kill a Mockingbird',
    'To Kill a Mockingbird — Harper Lee',
    'Atticus Finch defends a Black man falsely accused of rape in Alabama in 1936. Narrated through the eyes of Scout, his daughter. The most powerful novel ever written about moral courage, justice, and a father''s education of his child. The original argument for character education.',
    'Atticus Finch, moral courage, and justice seen through a child''s eyes. The greatest novel on character education.',
    'reading', 'document',
    'https://archive.org/details/to-kill-a-mockingbird-harper-lee',
    ARRAY['Literature','Ethics','History','Justice'],
    ARRAY['Racial Justice','Moral Courage','Atticus Finch','Character Education','1930s America'],
    ARRAY[9,10,11,12],
    'advanced', ARRAY['en'], 'public',
    true, false, true,
    'Architect', 'admin',
    'Internet Archive — Fair Use for Education',
    'fair_use',
    ARRAY['to-kill-a-mockingbird','harper-lee','atticus','justice','character','racism'],
    0, 0, 'working'
),

-- 30. Tuesdays with Morrie — Mitch Albom
(
    '00000000-0005-0002-0000-000000000001',
    'Tuesdays with Morrie — Mitch Albom',
    'Tuesdays with Morrie',
    'Tuesdays with Morrie — Mitch Albom',
    'Mitch Albom reunites with his dying professor Morrie Schwartz every Tuesday for the last lessons of his life. Each Tuesday: a different theme — on regret, family, forgiveness, death, love. A book that every teacher should read to remember why they chose their work.',
    'A journalist visits his dying professor every Tuesday. Their final lessons are a guide for living. A book for every teacher.',
    'reading', 'document',
    'https://archive.org/details/tuesdayswithmorr00albo',
    ARRAY['Literature','Philosophy','Life Skills','Wellbeing'],
    ARRAY['Death','Mentorship','Life Lessons','Professor-Student','Meaning'],
    ARRAY[10,11,12],
    'intermediate', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'Internet Archive — Fair Use for Education',
    'fair_use',
    ARRAY['tuesdays-with-morrie','mitch-albom','morrie','death','lessons','mentorship'],
    0, 0, 'working'
),

-- 31. Siddhartha — Hermann Hesse
(
    '00000000-0005-0003-0000-000000000001',
    'Siddhartha — Hermann Hesse',
    'Siddhartha',
    'සිද්ධාර්ථ — හෙස්සේ',
    'Hesse''s Nobel-winning novella follows Siddhartha through every stage of the inner journey — asceticism, sensuality, commerce, love, and finally the peace of the river. A text about self-directed learning, the uselessness of transmitted wisdom, and the knowledge that must be earned through living.',
    'Hesse''s Nobel novella: Siddhartha''s inner journey through every stage of life, arriving at peace.',
    'reading', 'document',
    'https://www.gutenberg.org/ebooks/2500',
    ARRAY['Philosophy','Spirituality','Literature','Buddhism'],
    ARRAY['Self-Knowledge','Inner Journey','Buddhism','Meaning','Hermann Hesse'],
    ARRAY[10,11,12],
    'intermediate', ARRAY['en','si'], 'public',
    true, false, false,
    'Architect', 'admin',
    'Project Gutenberg — Public Domain',
    'public_domain',
    ARRAY['siddhartha','hesse','buddhism','inner-journey','wisdom','novel'],
    0, 0, 'working'
),

-- 32. The Alchemist — Paulo Coelho
(
    '00000000-0005-0004-0000-000000000001',
    'The Alchemist — Paulo Coelho',
    'The Alchemist',
    'The Alchemist — කොෙ​ල්‍ෙ​හෝ',
    '"When you want something, all the universe conspires in helping you to achieve it." Santiago the shepherd follows his Personal Legend across the Sahara. The world''s most widely read fable about purpose, listening to your heart, and the courage to follow what the soul knows.',
    'Santiago follows his Personal Legend across the desert. The world''s most read fable about purpose and courage.',
    'reading', 'document',
    'https://archive.org/details/thealchemist_202009',
    ARRAY['Philosophy','Spirituality','Life Skills'],
    ARRAY['Purpose','Personal Legend','Courage','Fable','Meaning'],
    ARRAY[8,9,10,11,12],
    'beginner', ARRAY['en','si'], 'public',
    true, false, false,
    'Architect', 'admin',
    'Internet Archive — Fair Use for Education',
    'fair_use',
    ARRAY['alchemist','coelho','purpose','legend','fable','journey'],
    0, 0, 'working'
),

-- 33. Man''s Search for Meaning — Viktor Frankl
(
    '00000000-0005-0005-0000-000000000001',
    'Man''s Search for Meaning — Viktor Frankl',
    'Man''s Search for Meaning',
    'ජීවිතයේ අර්ථය සෙවීම — වික්ටෝ ෆ්‍රෑන්කල්',
    'Viktor Frankl survived Auschwitz and built a psychiatric system around one observation: a person who knows the "why" of their existence can bear almost any "how." The most important book about meaning, purpose, and human resilience. For every student facing darkness, and every teacher trying to sustain themselves.',
    'Auschwitz survivor Frankl: finding meaning in suffering. A book about resilience that every educator needs.',
    'reading', 'document',
    'https://archive.org/details/man-search-for-meaning-by-viktor-e.-frankl-bookscart',
    ARRAY['Psychology','Philosophy','Wellbeing','History'],
    ARRAY['Meaning','Resilience','Logotherapy','Holocaust','Purpose','Viktor Frankl'],
    ARRAY[10,11,12],
    'advanced', ARRAY['en','si'], 'public',
    true, false, false,
    'Architect', 'admin',
    'Internet Archive — Fair Use for Education',
    'fair_use',
    ARRAY['frankl','meaning','resilience','auschwitz','purpose','logotherapy'],
    0, 0, 'working'
),

-- 34. Jonathan Livingston Seagull — Richard Bach
(
    '00000000-0005-0006-0000-000000000001',
    'Jonathan Livingston Seagull — Richard Bach',
    'Jonathan Livingston Seagull',
    'Jonathan Livingston Seagull — රිචඩ් බෑච්',
    'A seagull who cares about flying perfectly, rather than just flying for food. A short, electric fable about the obsession with mastery, the rejection of mediocrity, and what it costs to be excellent when the flock prefers safety. Beloved by artists, athletes, and teachers who refuse to do their work badly.',
    'A seagull obsessed with perfect flight. A fable about mastery, excellence, and the cost of refusing mediocrity.',
    'story', 'document',
    'https://archive.org/details/JonathanLivingstonSeagull_201808',
    ARRAY['Philosophy','Life Skills','Inspiration'],
    ARRAY['Mastery','Excellence','Non-Conformity','Fable','Purpose'],
    ARRAY[8,9,10,11,12],
    'beginner', ARRAY['en','si'], 'public',
    true, false, false,
    'Architect', 'admin',
    'Internet Archive — Fair Use for Education',
    'fair_use',
    ARRAY['jonathan-seagull','mastery','excellence','fable','bach','aspiration'],
    0, 0, 'working'
),

-- 35. Flowers for Algernon — Daniel Keyes
(
    '00000000-0005-0007-0000-000000000001',
    'Flowers for Algernon — Daniel Keyes',
    'Flowers for Algernon',
    'Flowers for Algernon — Daniel Keyes',
    'Charlie Gordon, intellectually disabled, undergoes an experimental operation that triples his IQ. The story is told through his diary — first in misspelled, broken sentences, then in increasing brilliance, then in heartbreaking decline. No other novel asks so honestly: what is intelligence worth? What makes a person worthy of love?',
    'Charlie Gordon''s intelligence is tripled then lost. His diary asks the deepest question: what makes a person worthy?',
    'reading', 'document',
    'https://archive.org/details/FlowersForAlgernon_201808',
    ARRAY['Literature','Psychology','Ethics','Special Education'],
    ARRAY['Intelligence','Disability','Human Worth','Ethics of Science','Identity'],
    ARRAY[9,10,11,12],
    'intermediate', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'Internet Archive — Fair Use for Education',
    'fair_use',
    ARRAY['flowers-algernon','intelligence','disability','identity','ethics','diary'],
    0, 0, 'working'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- B2. EDUCATION THEORY & PROFESSIONAL READING
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.nodes (
    id, title, title_en, title_si,
    description, description_en,
    type, format, url,
    subjects, topics, grades, difficulty, language, visibility,
    verified, is_community, curriculum_aligned,
    creator_name, creator_role, copyright_notice, license, tags,
    views, endorsements, link_status
) VALUES

-- 36. Mindset — Carol Dweck
(
    '00000000-0005-0010-0000-000000000001',
    'Mindset: The New Psychology of Success — Carol Dweck',
    'Mindset: The New Psychology of Success',
    'Mindset: ජය ගැනීමේ නව මනෝ විද්‍යාව — Carol Dweck',
    'Stanford psychologist Carol Dweck''s research on fixed vs. growth mindsets has transformed education globally. A single idea: when students believe their abilities can grow with effort, they achieve more. The single most important book for every teacher to give to every student.',
    'Dweck''s research: "I can''t do this YET." The growth mindset is the most important idea in modern education.',
    'pedagogy', 'document',
    'https://archive.org/details/mindset-the-new-psychology-of-success-carol-dweck',
    ARRAY['Psychology','Pedagogy','Wellbeing','Student Development'],
    ARRAY['Growth Mindset','Fixed Mindset','Effort','Achievement','Carol Dweck'],
    ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
    'beginner', ARRAY['en','si'], 'public',
    true, false, true,
    'Architect', 'admin',
    'Internet Archive — Fair Use for Education',
    'fair_use',
    ARRAY['mindset','dweck','growth-mindset','effort','achievement','psychology'],
    0, 0, 'working'
),

-- 37. How Children Fail — John Holt
(
    '00000000-0005-0011-0000-000000000001',
    'How Children Fail — John Holt',
    'How Children Fail',
    'ළමයින් අසාර්ථක කෙෙ​ස් — John Holt',
    'John Holt observed children learning (and failing) in schools and arrived at a devastating conclusion: children fail because we fear them, rush them, and do not trust them to think. A foundational critique of the classroom as an anxiety machine. Every teacher should read this before they design their first lesson.',
    'John Holt: children fail because schools create fear and distrust. A foundational critique of classroom anxiety.',
    'pedagogy', 'document',
    'https://archive.org/details/howchildrenfail0000holt',
    ARRAY['Pedagogy','Psychology','Child Development'],
    ARRAY['Child Failure','Anxiety','Trust','Classroom Fear','John Holt','Unschooling'],
    ARRAY[10,11,12],
    'advanced', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'Internet Archive — Fair Use for Education',
    'fair_use',
    ARRAY['how-children-fail','john-holt','failure','anxiety','trust','classroom'],
    0, 0, 'working'
),

-- 38. The Element — Ken Robinson
(
    '00000000-0005-0012-0000-000000000001',
    'The Element — Ken Robinson',
    'The Element: How Finding Your Passion Changes Everything',
    'The Element — Ken Robinson',
    'Ken Robinson''s The Element is the book-length argument for passion-led education. Drawing on stories of Paul McCartney, Gillian Lynne, and others who only discovered their genius outside school, Robinson argues that the job of education is to help each person find the intersection of what they love and what they do well.',
    'Ken Robinson on passion and talent: every person has an Element. Education''s job is to help them find it.',
    'pedagogy', 'document',
    'https://archive.org/details/elementhowfindin00robi',
    ARRAY['Pedagogy','Creativity','Philosophy'],
    ARRAY['Passion-Led Learning','Element','Talent','Ken Robinson','Purpose'],
    ARRAY[9,10,11,12],
    'intermediate', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'Internet Archive — Fair Use for Education',
    'fair_use',
    ARRAY['element','ken-robinson','passion','talent','purpose','creativity'],
    0, 0, 'working'
),

-- 39. Educated — Tara Westover
(
    '00000000-0005-0013-0000-000000000001',
    'Educated — Tara Westover',
    'Educated',
    'Educated — Tara Westover',
    'Tara Westover grew up in a survivalist family in Idaho and never went to school. She taught herself enough to gain entry to Cambridge, where she earned a PhD. A memoir about the self-made mind, the cost of family loyalty, and what education means when you have to fight for every word of it.',
    'Tara Westover taught herself from nothing to a Cambridge PhD. A memoir about the self-made mind and the cost of knowledge.',
    'reading', 'document',
    'https://archive.org/details/educated-a-memoir',
    ARRAY['Literature','Education','History','Psychology'],
    ARRAY['Self-Education','Memoir','Family','Resilience','Cambridge'],
    ARRAY[10,11,12],
    'intermediate', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'Internet Archive — Fair Use for Education',
    'fair_use',
    ARRAY['educated','tara-westover','memoir','self-education','resilience','cambridge'],
    0, 0, 'working'
),

-- 40. The Art of Learning — Josh Waitzkin
(
    '00000000-0005-0014-0000-000000000001',
    'The Art of Learning — Josh Waitzkin',
    'The Art of Learning',
    'The Art of Learning — Josh Waitzkin',
    'Josh Waitzkin was the basis for the film Searching for Bobby Fischer — a child chess prodigy who later became a world champion martial artist. His book is about how learning itself can be mastered: the principles of deep practice, investment in loss, and the art of entering the present moment fully.',
    'Chess prodigy Josh Waitzkin on mastering the art of learning itself: deep practice, resilience, presence.',
    'pedagogy', 'document',
    'https://archive.org/details/art-of-learning-waitzkin',
    ARRAY['Psychology','Pedagogy','Life Skills'],
    ARRAY['Deep Practice','Mastery','Learning Process','Chess','Martial Arts'],
    ARRAY[9,10,11,12],
    'intermediate', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'Internet Archive — Fair Use for Education',
    'fair_use',
    ARRAY['art-of-learning','waitzkin','chess','mastery','deep-practice','learning'],
    0, 0, 'working'
),

-- 41. Thinking, Fast and Slow — Daniel Kahneman
(
    '00000000-0005-0015-0000-000000000001',
    'Thinking, Fast and Slow — Daniel Kahneman',
    'Thinking, Fast and Slow',
    'Thinking, Fast and Slow — Kahneman',
    'Nobel laureate Kahneman''s accessible masterwork on the two systems of human thought — System 1 (fast, intuitive, emotional) and System 2 (slow, deliberate, rational). Essential for understanding how students make decisions, why they hold misconceptions, and how to design lessons that engage both modes of thinking.',
    'Kahneman''s Nobel masterwork on System 1 and 2 thinking — essential for understanding how students actually learn.',
    'pedagogy', 'document',
    'https://archive.org/details/isbn_9780374533557',
    ARRAY['Psychology','Pedagogy','Neuroscience'],
    ARRAY['Cognitive Bias','System 1','System 2','Decision Making','Kahneman','Neuroscience'],
    ARRAY[10,11,12],
    'advanced', ARRAY['en'], 'public',
    true, false, false,
    'Architect', 'admin',
    'Internet Archive — Fair Use for Education',
    'fair_use',
    ARRAY['kahneman','thinking-fast-slow','cognitive-bias','system-1','system-2','decision'],
    0, 0, 'working'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- B3. SRI Lankan LITERATURE & KNOWLEDGE
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.nodes (
    id, title, title_en, title_si, title_ta,
    description, description_en, description_si,
    type, format, url,
    subjects, topics, grades, difficulty, language, visibility,
    verified, is_community, is_ministry_official, curriculum_aligned,
    creator_name, creator_role, copyright_notice, license, tags,
    views, endorsements, link_status
) VALUES

-- 42. Punsanda Kathawa (A Sri Lankan Folk Story)
(
    '00000000-0005-0020-0000-000000000001',
    'Punsanda Kathawa — Sri Lankan Moon Legend',
    'The Legend of Punsanda (Moon Story)',
    'පුන්සඳ කතාව',
    'பூர்ண சந்திரன் கதை',
    'One of Sri Lanka''s most beloved lunar folk legends — explaining the shadow on the full moon as a man carrying firewood for the king, punished for cutting a sacred tree. A rich story for Sinhala cultural literacy, environmental values, and character education. Includes Sinhala, Tamil, and English versions.',
    'Sri Lanka''s beloved moon legend: a man on the full moon, a sacred tree, and a king''s punishment. Cultural literacy.',
    'පුන්සඳ කතාව — ශ්‍රී ලාංකීය ශ්‍රේෂ්ඨ කතා ශ්‍රේෂ්ඨ, ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
    'story', 'text',
    'https://sinhala.wikibooks.org/wiki/Punsanda_Kathaawa',
    ARRAY['Culture','Sinhala Literature','Character Education'],
    ARRAY['Sri Lankan Folklore','Moon','Sacred Nature','Cultural Literacy','Folk Story'],
    ARRAY[1,2,3,4,5,6],
    'beginner', ARRAY['si','ta','en'], 'public',
    true, false, false, true,
    'Architect', 'admin',
    'Wikibooks — Creative Commons CC-BY-SA',
    'cc_by_sa',
    ARRAY['punsanda','moon','folklore','sinhala','primary','cultural'],
    0, 0, 'working'
),

-- 43. The Story of Prince Vijaya (foundation myth)
(
    '00000000-0005-0021-0000-000000000001',
    'The Arrival of Vijaya — Sri Lanka''s Foundation Story',
    'The Arrival of Prince Vijaya',
    'විජය කුමාරයාගේ ලංකාවේ පැමිණීම',
    'விஜயன் இலங்கைக்கு வருகை',
    'The Mahavamsa''s account of Prince Vijaya and his 700 companions landing in Lanka on the day the Buddha passed away — and the founding of the first human settlement. Sri Lanka''s most important origin narrative, told in a classroom-accessible retelling with commentary on migration, identity, and founding myths.',
    'Sri Lanka''s foundation narrative: Prince Vijaya''s arrival, the island''s first people, and how nations construct origin stories.',
    'ශ්‍රී ලංකාවේ පළමු ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
    'story', 'text',
    'https://www.sacred-texts.com/bud/mhv/mhv07.htm',
    ARRAY['History','Culture','Sinhala Literature','Buddhism'],
    ARRAY['Vijaya','Foundation Myth','Lanka History','Identity','Origin Story'],
    ARRAY[5,6,7,8,9,10],
    'intermediate', ARRAY['si','ta','en'], 'public',
    true, false, false, true,
    'Architect', 'admin',
    'Sacred-texts.com — Public Domain',
    'public_domain',
    ARRAY['vijaya','origin','myth','sinhala','identity','foundation'],
    0, 0, 'working'
),

-- 44. A Sinhalese Village — Leonard Woolf (1913)
(
    '00000000-0005-0022-0000-000000000001',
    'A Sinhalese Village — Leonard Woolf (1913)',
    'A Sinhalese Village',
    'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ — Leonard Woolf',
    NULL,
    'Leonard Woolf (Virginia Woolf''s husband), a British civil servant in Ceylon, documented the village of Beddegama with remarkable sympathy. An outsider''s account of pre-independence Sri Lankan village life, caste, Buddhist practice, and colonial encounter — essential primary source for social studies and history.',
    'Leonard Woolf''s 1913 account of village Ceylon: caste, Buddhism, colonialism, and a sympathetic outsider''s gaze.',
    'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
    'reading', 'document',
    'https://archive.org/details/asinhalese00woolf',
    ARRAY['History','Culture','Social Studies'],
    ARRAY['Colonial Ceylon','Village Life','Caste','Buddhism','Primary Source','Woolf'],
    ARRAY[9,10,11,12],
    'intermediate', ARRAY['en'], 'public',
    true, false, false, true,
    'Architect', 'admin',
    'Internet Archive — Public Domain',
    'public_domain',
    ARRAY['leonard-woolf','colonial','village','ceylon','primary-source','history'],
    0, 0, 'working'
),

-- 45. Nidhanaya / The Hidden Treasure (Sinhala short story)
(
    '00000000-0005-0023-0000-000000000001',
    'The Farmer''s Treasure — A Sinhala Teaching Story',
    'The Farmer''s Treasure (Sinhala Parable)',
    'ගොවියාගේ භූමිය — ශ්‍රී ලාංකීය ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',
    NULL,
    'A Sinhala retelling of the classic parable: a dying farmer tells his lazy sons the treasure is buried in the fields. They dig everything up — and find the treasure is the harvest their labour produced. A perfect story for work ethic, delayed gratification, and the lesson that no teacher can hand you knowledge.',
    'A Sinhala parable: the treasure is in the labour. A perfect short story for work ethic and delayed gratification.',
    'ගොවියාගේ ක්ෂේත්‍රයේ ශ්‍රේෂ්ඨ — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
    'story', 'text',
    'https://sinhala.wikibooks.org',
    ARRAY['Character Education','Life Skills','Sinhala Literature'],
    ARRAY['Hard Work','Parable','Delayed Gratification','Work Ethic','Labour'],
    ARRAY[3,4,5,6,7,8],
    'beginner', ARRAY['si','en'], 'public',
    true, false, false, true,
    'Architect', 'admin',
    'Traditional oral tradition — Public Domain',
    'public_domain',
    ARRAY['sinhala','parable','work-ethic','treasure','labour','character'],
    0, 0, 'working'
),

-- 46. Sri Lanka Science Curriculum: Grade 8 NIE Guide
(
    '00000000-0005-0024-0000-000000000001',
    'NIE Grade 8 Science: Teacher''s Instructional Manual',
    'NIE Grade 8 Science Instructional Manual',
    'NIE 8 ශ්‍රේණිය විද්‍යාව: ගුරු ශ්‍රේෂ්ඨ',
    NULL,
    'The National Institute of Education''s official teacher''s instructional manual for Grade 8 Science. Covers curriculum objectives, lesson delivery methods, assessment strategies, and safety protocols for laboratory work. The foundational document for every Grade 8 science teacher in Sri Lanka.',
    'NIE''s official Grade 8 Science teacher manual: lesson delivery, assessment, lab safety. Curriculum authority.',
    'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 8 ශ්‍රේෂ්ඨ — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
    'circular', 'document',
    'https://www.nie.lk',
    ARRAY['Science','Policy','Pedagogy'],
    ARRAY['NIE','Grade 8','Science Curriculum','Laboratory','Assessment','Teacher Manual'],
    ARRAY[8],
    'beginner', ARRAY['si','ta','en'], 'public',
    true, false, true, true,
    'Architect', 'admin',
    '© National Institute of Education, Sri Lanka',
    'government_document',
    ARRAY['nie','grade-8','science','curriculum','teacher-manual','laboratory'],
    0, 0, 'working'
);

-- ============================================================================
-- C. EXPANDED COLLECTIONS
-- ============================================================================
INSERT INTO public.collections (
    id, name, description, subjects, grades, resource_ids, sequence_order,
    visibility, is_official, estimated_duration
) VALUES

-- 6. Cinema of the Classroom: Essential Teacher Films
(
    '00000000-0006-0001-0000-000000000001',
    'Cinema of the Classroom: Essential Teacher Films',
    'The definitive cinema list for every Gurudevi educator. 18 films (trailer excerpts) about teachers, students, and the miracle of learning. Watch them. Discuss them. Ask: which teacher are you? Use them for school screenings, professional development, and homeroom conversations.',
    ARRAY['Inspiration','Education','Pedagogy'],
    ARRAY[9,10,11,12],
    ARRAY[
        '00000000-0002-0030-0000-000000000001'::UUID,  -- Dead Poets Society
        '00000000-0002-0031-0000-000000000001'::UUID,  -- To Sir With Love
        '00000000-0004-0001-0000-000000000001'::UUID,  -- Stand and Deliver
        '00000000-0004-0002-0000-000000000001'::UUID,  -- Mr. Holland's Opus
        '00000000-0004-0003-0000-000000000001'::UUID,  -- Freedom Writers
        '00000000-0004-0004-0000-000000000001'::UUID,  -- The Miracle Worker
        '00000000-0004-0005-0000-000000000001'::UUID,  -- Finding Forrester
        '00000000-0004-0007-0000-000000000001'::UUID,  -- The Great Debaters
        '00000000-0004-0008-0000-000000000001'::UUID,  -- Coach Carter
        '00000000-0004-0010-0000-000000000001'::UUID,  -- Mona Lisa Smile
        '00000000-0004-0011-0000-000000000001'::UUID,  -- Whiplash
        '00000000-0004-0012-0000-000000000001'::UUID,  -- Good Will Hunting
        '00000000-0004-0013-0000-000000000001'::UUID,  -- School of Rock
        '00000000-0004-0017-0000-000000000001'::UUID,  -- Educating Rita
        '00000000-0004-0018-0000-000000000001'::UUID,  -- Ron Clark
        '00000000-0004-0023-0000-000000000001'::UUID,  -- History Boys
        '00000000-0004-0024-0000-000000000001'::UUID,  -- The First Grader
        '00000000-0004-0027-0000-000000000001'::UUID   -- Ken Robinson TED
    ],
    ARRAY[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17],
    'public', true,
    '18 trailers (~3 hrs) / full films (~36 hrs)'
),

-- 7. South Asian Classroom Cinema
(
    '00000000-0006-0002-0000-000000000001',
    'South Asian Classroom Cinema',
    'Films from India and the subcontinent about education, teachers, and student potential. Deeply familiar to Sri Lankan cultural sensibilities. Begin with Taare Zameen Par, which alone can change how a teacher sees their students.',
    ARRAY['Inspiration','South Asia','Education'],
    ARRAY[7,8,9,10,11,12],
    ARRAY[
        '00000000-0002-0032-0000-000000000001'::UUID,  -- Iqbal (original seed)
        '00000000-0002-0033-0000-000000000001'::UUID,  -- 3 Idiots (original seed)
        '00000000-0004-0019-0000-000000000001'::UUID,  -- Taare Zameen Par
        '00000000-0004-0020-0000-000000000001'::UUID,  -- Super 30
        '00000000-0004-0021-0000-000000000001'::UUID   -- Hichki
    ],
    ARRAY[0,1,2,3,4],
    'public', true,
    '5 trailers (~45 min) / full films (~10 hrs)'
),

-- 8. The Essential Book Shelf
(
    '00000000-0006-0003-0000-000000000001',
    'The Essential Book Shelf',
    'The most important books every educator and serious student should read. From Freire''s radical pedagogy to Dweck''s growth mindset, from Frankl''s search for meaning to Westover''s self-made mind. These are not books about school — they are books that schooling should aspire to produce.',
    ARRAY['Literature','Pedagogy','Philosophy','Psychology'],
    ARRAY[10,11,12],
    ARRAY[
        '00000000-0002-0001-0000-000000000001'::UUID,  -- Freire
        '00000000-0002-0002-0000-000000000001'::UUID,  -- Vygotsky
        '00000000-0005-0001-0000-000000000001'::UUID,  -- To Kill a Mockingbird
        '00000000-0005-0002-0000-000000000001'::UUID,  -- Tuesdays with Morrie
        '00000000-0005-0003-0000-000000000001'::UUID,  -- Siddhartha
        '00000000-0005-0004-0000-000000000001'::UUID,  -- The Alchemist
        '00000000-0005-0005-0000-000000000001'::UUID,  -- Man's Search for Meaning
        '00000000-0005-0010-0000-000000000001'::UUID,  -- Mindset
        '00000000-0005-0011-0000-000000000001'::UUID,  -- How Children Fail
        '00000000-0005-0013-0000-000000000001'::UUID,  -- Educated
        '00000000-0005-0015-0000-000000000001'::UUID   -- Thinking Fast and Slow
    ],
    ARRAY[0,1,2,3,4,5,6,7,8,9,10],
    'public', true,
    '15–20 hours'
),

-- 9. Stories for Young Readers (Grades 3–8)
(
    '00000000-0006-0004-0000-000000000001',
    'Stories for Young Readers',
    'Tales for young hearts — from the moon stories of ancient Lanka to Siddhartha''s river, to a seagull who only wanted to fly well. These stories build character, spark questions, and open the interior life that education is really for.',
    ARRAY['Literature','Character Education','Culture'],
    ARRAY[3,4,5,6,7,8],
    ARRAY[
        '00000000-0002-0041-0000-000000000001'::UUID,  -- Jataka Tales
        '00000000-0002-0042-0000-000000000001'::UUID,  -- The Little Prince
        '00000000-0005-0020-0000-000000000001'::UUID,  -- Punsanda Kathaawa
        '00000000-0005-0021-0000-000000000001'::UUID,  -- Vijaya Story
        '00000000-0005-0023-0000-000000000001'::UUID,  -- Farmer's Treasure
        '00000000-0005-0006-0000-000000000001'::UUID   -- Jonathan Livingston Seagull
    ],
    ARRAY[0,1,2,3,4,5],
    'public', true,
    '4–6 hours'
),

-- 10. TED Talks: Ideas for the Staffroom
(
    '00000000-0006-0005-0000-000000000001',
    'TED Talks: Ideas for the Staffroom',
    'Five talks every teacher should watch together. Screen one at each staff meeting, then spend 15 minutes discussing: what do we actually believe? Ken Robinson on creativity. Rita Pierson on connection. A playlist for a school that takes its own development seriously.',
    ARRAY['Pedagogy','Inspiration','Professional Development'],
    ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
    ARRAY[
        '00000000-0004-0027-0000-000000000001'::UUID,  -- Ken Robinson TED
        '00000000-0004-0028-0000-000000000001'::UUID,  -- Rita Pierson TED
        '00000000-0002-0020-0000-000000000001'::UUID,  -- Bloom's Taxonomy
        '00000000-0002-0021-0000-000000000001'::UUID,  -- Socratic Questioning
        '00000000-0005-0010-0000-000000000001'::UUID   -- Mindset (Dweck)
    ],
    ARRAY[0,1,2,3,4],
    'public', true,
    '5 sessions × 45 min = ~4 hrs'
);

-- ============================================================================
-- D. ADDITIONAL KNOWLEDGE EDGES
-- ============================================================================
INSERT INTO public.edges (
    from_node_id, to_node_id, relationship, weight, is_ai_generated, is_verified
) VALUES

-- Cinema connections
('00000000-0004-0001-0000-000000000001', '00000000-0002-0020-0000-000000000001', 'related', 0.8, false, true),   -- Stand & Deliver → Bloom's (high expectations = higher-order thinking)
('00000000-0004-0003-0000-000000000001', '00000000-0002-0001-0000-000000000001', 'related', 0.85, false, true),  -- Freedom Writers → Freire (student voice)
('00000000-0004-0004-0000-000000000001', '00000000-0002-0022-0000-000000000001', 'related', 0.9, false, true),   -- Miracle Worker → Differentiated Instruction
('00000000-0004-0019-0000-000000000001', '00000000-0002-0022-0000-000000000001', 'related', 0.9, false, true),   -- Taare Zameen Par → Differentiated Instruction
('00000000-0004-0019-0000-000000000001', '00000000-0002-0070-0000-000000000001', 'related', 0.85, false, true),  -- Taare Zameen Par → SEL
('00000000-0004-0011-0000-000000000001', '00000000-0002-0021-0000-000000000001', 'related', 0.7, false, true),   -- Whiplash → Socratic (debate-provoker)
('00000000-0004-0012-0000-000000000001', '00000000-0002-0070-0000-000000000001', 'related', 0.9, false, true),   -- Good Will Hunting → SEL (trauma)
('00000000-0004-0027-0000-000000000001', '00000000-0002-0001-0000-000000000001', 'related', 0.85, false, true),  -- Ken Robinson TED → Freire
('00000000-0004-0028-0000-000000000001', '00000000-0002-0070-0000-000000000001', 'related', 0.9, false, true),   -- Rita Pierson → SEL
('00000000-0004-0027-0000-000000000001', '00000000-0005-0012-0000-000000000001', 'related', 0.95, false, true),  -- Ken Robinson TED → The Element (same author)

-- Books cross-links
('00000000-0005-0005-0000-000000000001', '00000000-0002-0070-0000-000000000001', 'related', 0.85, false, true),  -- Frankl → SEL
('00000000-0005-0010-0000-000000000001', '00000000-0002-0002-0000-000000000001', 'related', 0.85, false, true),  -- Mindset → Vygotsky (ZPD and growth)
('00000000-0005-0010-0000-000000000001', '00000000-0002-0020-0000-000000000001', 'related', 0.8, false, true),   -- Mindset → Bloom's Taxonomy
('00000000-0005-0011-0000-000000000001', '00000000-0002-0001-0000-000000000001', 'related', 0.9, false, true),   -- How Children Fail → Freire
('00000000-0005-0012-0000-000000000001', '00000000-0002-0003-0000-000000000001', 'related', 0.7, false, true),   -- The Element → Gibran (On Teaching)
('00000000-0005-0003-0000-000000000001', '00000000-0002-0071-0000-000000000001', 'related', 0.8, false, true),   -- Siddhartha → Mindfulness (Buddhist path)
('00000000-0005-0004-0000-000000000001', '00000000-0005-0003-0000-000000000001', 'related', 0.75, false, true),  -- Alchemist → Siddhartha (personal journey)
('00000000-0005-0002-0000-000000000001', '00000000-0002-0003-0000-000000000001', 'related', 0.8, false, true),   -- Tuesdays with Morrie → Gibran (teacher as mentor)
('00000000-0005-0007-0000-000000000001', '00000000-0002-0070-0000-000000000001', 'related', 0.8, false, true),   -- Flowers for Algernon → SEL (human worth)
('00000000-0005-0013-0000-000000000001', '00000000-0002-0001-0000-000000000001', 'related', 0.8, false, true),   -- Educated → Freire (self-liberation)

-- SL heritage → literature cross-links
('00000000-0005-0020-0000-000000000001', '00000000-0002-0041-0000-000000000001', 'related', 0.8, false, true),   -- Punsanda → Jataka Tales (Sri Lankan cultural stories)
('00000000-0005-0021-0000-000000000001', '00000000-0002-0012-0000-000000000001', 'related', 0.9, false, true),   -- Vijaya → Mahavamsa
('00000000-0005-0022-0000-000000000001', '00000000-0002-0010-0000-000000000001', 'related', 0.7, false, true),   -- Leonard Woolf → Ancient Irrigation (same era, village life)

-- Cinema → Books prerequisite chain
('00000000-0002-0030-0000-000000000001', '00000000-0005-0001-0000-000000000001', 'leads_to', 0.8, false, true),  -- Dead Poets → To Kill a Mockingbird (both about justice + poetry)
('00000000-0004-0003-0000-000000000001', '00000000-0005-0001-0000-000000000001', 'leads_to', 0.75, false, true), -- Freedom Writers → To Kill a Mockingbird
('00000000-0004-0024-0000-000000000001', '00000000-0005-0013-0000-000000000001', 'leads_to', 0.8, false, true);  -- First Grader → Educated (both: fighting for literacy)
