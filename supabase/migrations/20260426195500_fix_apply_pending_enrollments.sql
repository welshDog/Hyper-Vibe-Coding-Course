BEGIN;

CREATE OR REPLACE FUNCTION public.apply_pending_enrollments(p_email text, p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_row   RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_row IN
    SELECT course_id FROM public.pending_enrollments WHERE email = p_email
  LOOP
    INSERT INTO public.enrollments (user_id, course_id, progress_percentage, created_at)
    SELECT p_user_id, v_row.course_id, 0, NOW()
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.enrollments e
      WHERE e.user_id = p_user_id AND e.course_id = v_row.course_id
    );

    IF FOUND THEN
      v_count := v_count + 1;
    END IF;

    DELETE FROM public.pending_enrollments
    WHERE email = p_email AND course_id = v_row.course_id;
  END LOOP;

  RETURN v_count;
END;
$function$;

COMMIT;

