-- Fix login_location_confirmations UPDATE policy to only allow users to update their own confirmations
DROP POLICY IF EXISTS "Anyone can update their own confirmations" ON login_location_confirmations;

CREATE POLICY "Users can update their own confirmations" 
ON login_location_confirmations 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Also fix cv_downloads SELECT policy to restrict to admins only
DROP POLICY IF EXISTS "Admin can view all downloads" ON cv_downloads;

CREATE POLICY "Admin can view all downloads" 
ON cv_downloads 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));