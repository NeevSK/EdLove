-- Trigger function: notify on new submission
CREATE OR REPLACE FUNCTION public.notify_on_submission()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_teacher_id UUID;
  v_assignment_title TEXT;
  v_student_name TEXT;
BEGIN
  -- Get teacher and assignment info
  SELECT a.title, c.teacher_id 
    INTO v_assignment_title, v_teacher_id
    FROM public.assignments a
    JOIN public.classrooms c ON c.id = a.classroom_id
    WHERE a.id = NEW.assignment_id;

  SELECT full_name INTO v_student_name FROM public.users WHERE id = NEW.student_id;

  IF v_teacher_id IS NOT NULL THEN
    INSERT INTO public.notifications(user_id, type, title, body, reference_id, reference_type)
    VALUES (
      v_teacher_id,
      'new_submission',
      'New Submission',
      COALESCE(v_student_name, 'A student') || ' submitted ' || COALESCE(v_assignment_title, 'an assignment'),
      NEW.id,
      'submission'
    );
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_notify_submission ON public.submissions;
CREATE TRIGGER trg_notify_submission
  AFTER INSERT ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_submission();

-- Trigger function: notify student when submission is graded
CREATE OR REPLACE FUNCTION public.notify_on_grade()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_assignment_title TEXT;
BEGIN
  IF OLD.graded_at IS NULL AND NEW.graded_at IS NOT NULL THEN
    SELECT title INTO v_assignment_title FROM public.assignments WHERE id = NEW.assignment_id;
    INSERT INTO public.notifications(user_id, type, title, body, reference_id, reference_type)
    VALUES (
      NEW.student_id,
      'submission_graded',
      'Assignment Graded',
      COALESCE(v_assignment_title, 'Your assignment') || ' has been graded',
      NEW.id,
      'submission'
    );
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_notify_grade ON public.submissions;
CREATE TRIGGER trg_notify_grade
  AFTER UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_grade();

-- Trigger function: notify group members on new community post
CREATE OR REPLACE FUNCTION public.notify_on_group_post()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_author_name TEXT;
  v_group_name  TEXT;
BEGIN
  SELECT full_name INTO v_author_name FROM public.users WHERE id = NEW.author_id;
  SELECT name INTO v_group_name FROM public.community_groups WHERE id = NEW.group_id;

  -- Batch-insert one notification per active group member (excluding the author).
  -- Avoids the N+1 loop (one INSERT per member) by using INSERT ... SELECT.
  INSERT INTO public.notifications(user_id, type, title, body, reference_id, reference_type)
  SELECT
    m.user_id,
    'new_post',
    COALESCE(v_group_name, 'Group') || ': New Post',
    COALESCE(v_author_name, 'Someone') || ' posted in ' || COALESCE(v_group_name, 'your circle'),
    NEW.id,
    'post'
  FROM public.community_group_members m
  WHERE m.group_id = NEW.group_id
    AND m.user_id <> NEW.author_id
    AND m.status = 'active';

  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_notify_group_post ON public.community_posts;
CREATE TRIGGER trg_notify_group_post
  AFTER INSERT ON public.community_posts
  FOR EACH ROW WHEN (NEW.group_id IS NOT NULL)
  EXECUTE FUNCTION public.notify_on_group_post();
