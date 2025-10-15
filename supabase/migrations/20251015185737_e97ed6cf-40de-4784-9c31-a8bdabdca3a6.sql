-- Add policy to user_roles table to satisfy linter
-- Only admins should be able to view user roles
CREATE POLICY "Admins can view all user roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));