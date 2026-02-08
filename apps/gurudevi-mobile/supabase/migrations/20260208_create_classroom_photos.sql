-- Migration: Create classroom_photos table
-- Date: 2026-02-08
-- Purpose: Store classroom photos with principal sharing capability

-- Create classroom_photos table
CREATE TABLE IF NOT EXISTS classroom_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  caption TEXT,
  shared_with_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE classroom_photos ENABLE ROW LEVEL SECURITY;

-- Teacher can insert/update/delete their own photos
CREATE POLICY teacher_photos_crud ON classroom_photos
  FOR ALL
  USING (teacher_id = auth.uid());

-- Principal can read shared photos from their school
CREATE POLICY principal_read_shared_photos ON classroom_photos
  FOR SELECT
  USING (
    shared_with_principal = true 
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role IN ('principal', 'section_head', 'grade_head')
      AND u.school = (
        SELECT school FROM users WHERE id = classroom_photos.teacher_id
      )
    )
  );

-- Add indices for performance
CREATE INDEX IF NOT EXISTS idx_photos_teacher ON classroom_photos(teacher_id);
CREATE INDEX IF NOT EXISTS idx_photos_classroom ON classroom_photos(classroom_id);
CREATE INDEX IF NOT EXISTS idx_photos_shared ON classroom_photos(shared_with_principal) WHERE shared_with_principal = true;
CREATE INDEX IF NOT EXISTS idx_photos_created ON classroom_photos(created_at DESC);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_classroom_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER classroom_photos_updated_at
  BEFORE UPDATE ON classroom_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_classroom_photos_updated_at();

-- Comments
COMMENT ON TABLE classroom_photos IS 'Photos uploaded by teachers with optional principal sharing';
COMMENT ON COLUMN classroom_photos.file_url IS 'Supabase Storage URL to photo file';
COMMENT ON COLUMN classroom_photos.shared_with_principal IS 'Flag indicating if photo is shared with principal';
