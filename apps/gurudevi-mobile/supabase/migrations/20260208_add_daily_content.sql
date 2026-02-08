-- Migration: Add Daily Content System
-- Purpose: Daily motivation quotes and educational "Did you know?" facts
-- Date: 2026-02-08

-- Create daily_content table
CREATE TABLE IF NOT EXISTS daily_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('motivation', 'did_you_know')),
  content TEXT NOT NULL,
  author TEXT,
  date DATE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient querying by date and type
CREATE INDEX IF NOT EXISTS idx_daily_content_date_type ON daily_content(date, type, active);

-- Enable RLS
ALTER TABLE daily_content ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active content
CREATE POLICY "Anyone can read active daily content"
  ON daily_content FOR SELECT
  USING (active = true);

-- Insert sample motivational content for teachers
INSERT INTO daily_content (type, content, author, date) VALUES
  ('motivation', 'Teaching is not about filling a bucket, but lighting a fire.', 'William Butler Yeats', '2026-02-09'),
  ('motivation', 'The art of teaching is the art of assisting discovery.', 'Mark Van Doren', '2026-02-10'),
  ('motivation', 'To teach is to touch a life forever.', 'Anonymous', '2026-02-11'),
  ('motivation', 'A teacher affects eternity; they can never tell where their influence stops.', 'Henry Adams', '2026-02-12'),
  ('motivation', 'The best teachers teach from the heart, not from the book.', 'Anonymous', '2026-02-13'),
  ('motivation', 'Education is the most powerful weapon which you can use to change the world.', 'Nelson Mandela', '2026-02-14'),
  ('motivation', 'It is the supreme art of the teacher to awaken joy in creative expression and knowledge.', 'Albert Einstein', '2026-02-15'),
  ('motivation', 'One child, one teacher, one book, one pen can change the world.', 'Malala Yousafzai', '2026-02-16'),
  ('motivation', 'The mediocre teacher tells. The good teacher explains. The superior teacher demonstrates. The great teacher inspires.', 'William Arthur Ward', '2026-02-17'),
  ('motivation', 'Teaching is the one profession that creates all other professions.', 'Anonymous', '2026-02-18');

-- Insert educational "Did you know?" facts
INSERT INTO daily_content (type, content, author, date) VALUES
  ('did_you_know', 'The Socratic Method, still used today in teaching critical thinking, was developed over 2,400 years ago by the Greek philosopher Socrates.', NULL, '2026-02-09'),
  ('did_you_know', 'Finland''s education system, considered one of the world''s best, has no standardized testing until age 16 and focuses on play-based learning in early years.', NULL, '2026-02-10'),
  ('did_you_know', 'The concept of homework was invented in 1905 by Italian teacher Roberto Nevilis as punishment for his students.', NULL, '2026-02-11'),
  ('did_you_know', 'Studies show that students remember only 10% of what they read, but 90% of what they teach to others, highlighting the power of peer teaching.', NULL, '2026-02-12'),
  ('did_you_know', 'The word "school" comes from the ancient Greek word "scholē" which originally meant "leisure" – learning was considered a leisurely activity.', NULL, '2026-02-13'),
  ('did_you_know', 'Ancient Sri Lankan education system included Pirivenas (Buddhist monastic schools) dating back over 2,000 years, teaching philosophy, medicine, and astronomy.', NULL, '2026-02-14'),
  ('did_you_know', 'Research shows that handwriting notes improves memory and learning better than typing, as it engages different cognitive processes.', NULL, '2026-02-15'),
  ('did_you_know', 'The "forgetting curve" discovered by Hermann Ebbinghaus shows we forget 75% of new information within 24 hours without review.', NULL, '2026-02-16'),
  ('did_you_know', 'Maria Montessori, who developed the Montessori method, was Italy''s first female physician and designed her approach based on scientific observation.', NULL, '2026-02-17'),
  ('did_you_know', 'The practice of raising hands to ask questions originated in ancient Rome as a gesture of respect and to maintain order in public forums.', NULL, '2026-02-18');

-- Add more content for continuous rotation (next 10 days)
INSERT INTO daily_content (type, content, date) VALUES
  ('motivation', 'Every child deserves a champion – an adult who will never give up on them.', '2026-02-19'),
  ('motivation', 'The influence of a good teacher can never be erased.', '2026-02-20'),
  ('motivation', 'Teaching is a work of heart.', '2026-02-21'),
  ('motivation', 'Great teachers empathize with kids, respect them, and believe that each one has something special that can be built upon.', '2026-02-22'),
  ('motivation', 'Teachers plant seeds of knowledge that grow forever.', '2026-02-23'),
  ('motivation', 'The task of the modern educator is not to cut down jungles but to irrigate deserts.', '2026-02-24'),
  ('motivation', 'Teaching kids to count is fine, but teaching them what counts is best.', '2026-02-25'),
  ('motivation', 'A good teacher is like a candle – it consumes itself to light the way for others.', '2026-02-26'),
  ('motivation', 'Teachers change the world one child at a time.', '2026-02-27'),
  ('motivation', 'The dream begins with a teacher who believes in you.', '2026-02-28');

INSERT INTO daily_content (type, content, date) VALUES
  ('did_you_know', 'The "zone of proximal development" concept by Lev Vygotsky suggests learners can achieve more with guidance than alone.', '2026-02-19'),
  ('did_you_know', 'The tradition of academic gowns and caps dates back to the 12th century when most scholars were also members of the clergy.', '2026-02-20'),
  ('did_you_know', 'Spaced repetition, studying information at increasing intervals, can improve long-term retention by up to 200%.', '2026-02-21'),
  ('did_you_know', 'The youngest college graduate ever was Michael Kearney, who earned his bachelor''s degree at age 10 in 1994.', '2026-02-22'),
  ('did_you_know', 'Sir Arthur C. Clarke, famous sci-fi author, was also a science teacher and popularizer who inspired generations of scientists.', '2026-02-23'),
  ('did_you_know', 'Studies show that background music can improve focus for some tasks but silence is better for complex problem-solving.', '2026-02-24'),
  ('did_you_know', 'The Reggio Emilia approach to education emerged in Italy after WWII, viewing children as capable researchers of their own learning.', '2026-02-25'),
  ('did_you_know', 'The ancient Library of Alexandria had an estimated 400,000 scrolls and was the greatest center of learning in the ancient world.', '2026-02-26'),
  ('did_you_know', 'The Pomodoro Technique (25 min focused work, 5 min break) was invented by Francesco Cirillo using a tomato-shaped kitchen timer.', '2026-02-27'),
  ('did_you_know', 'Educational psychologist Benjamin Bloom found that one-on-one tutoring can improve student performance by two standard deviations.', '2026-02-28');

-- Create a function to get today's content
CREATE OR REPLACE FUNCTION get_daily_content_for_today(content_type TEXT DEFAULT NULL)
RETURNS SETOF daily_content
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM daily_content
  WHERE active = true
    AND date <= CURRENT_DATE
    AND (content_type IS NULL OR type = content_type)
  ORDER BY date DESC
  LIMIT 1;
$$;

COMMENT ON TABLE daily_content IS 'Daily motivational quotes and educational facts for the Self section';
COMMENT ON FUNCTION get_daily_content_for_today IS 'Returns the most recent active daily content for today, optionally filtered by type';
