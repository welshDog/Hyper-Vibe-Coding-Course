-- Performance: clear the Supabase `auth_rls_initplan` advisor warnings by
-- wrapping auth.uid() in a scalar subselect, so Postgres evaluates it once per
-- query (initplan) instead of once per scanned row. ALTER POLICY changes only
-- the USING / WITH CHECK expressions; commands, roles, and logic are identical
-- ((select auth.uid()) returns the same value as auth.uid()). Zero behaviour change.
-- (pending_enrollments_own_read already wraps auth.jwt() in a subselect, so it's skipped.)
ALTER POLICY "Users can read their own achievements" ON public.achievements
  USING (user_id = (select auth.uid()));

ALTER POLICY "Instructors can manage their own courses" ON public.courses
  USING (((select auth.uid()) = instructor_id) OR (EXISTS (SELECT 1 FROM users WHERE ((users.id = (select auth.uid())) AND ((users.role)::text = 'admin'::text)))));

ALTER POLICY "users can delete own discord link" ON public.discord_links
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can create their own enrollments" ON public.enrollments
  WITH CHECK (user_id = (select auth.uid()));
ALTER POLICY "Users can insert their own enrollments" ON public.enrollments
  WITH CHECK ((select auth.uid()) = user_id);
ALTER POLICY "Users can update their own enrollments" ON public.enrollments
  USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
ALTER POLICY "Users can view their own enrollments" ON public.enrollments
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Instructors can manage their course lessons" ON public.lessons
  USING (EXISTS (SELECT 1 FROM courses WHERE ((courses.id = lessons.course_id) AND ((courses.instructor_id = (select auth.uid())) OR (EXISTS (SELECT 1 FROM users WHERE ((users.id = (select auth.uid())) AND ((users.role)::text = 'admin'::text))))))));

ALTER POLICY "users_own_completions" ON public.module_completions
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Admins can read playtest responses" ON public.playtest_responses
  USING (EXISTS (SELECT 1 FROM users WHERE ((users.id = (select auth.uid())) AND ((users.role)::text = 'admin'::text))));

ALTER POLICY "Users can insert their own progress" ON public.progress
  WITH CHECK ((select auth.uid()) = user_id);
ALTER POLICY "Users can read their own progress" ON public.progress
  USING (user_id = (select auth.uid()));
ALTER POLICY "Users can update their own progress" ON public.progress
  USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
ALTER POLICY "Users can upsert their own progress" ON public.progress
  WITH CHECK (user_id = (select auth.uid()));
ALTER POLICY "Users can view their own progress" ON public.progress
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Owner can read own progress" ON public.user_level_progress
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Admins can read waitlist" ON public.waitlist
  USING (EXISTS (SELECT 1 FROM users WHERE ((users.id = (select auth.uid())) AND ((users.role)::text = 'admin'::text))));
