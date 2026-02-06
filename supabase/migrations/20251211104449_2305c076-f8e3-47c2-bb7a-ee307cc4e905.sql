-- Create family_members table for LifeMap
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  photo_url TEXT,
  date_of_birth DATE,
  occupation TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  generation INTEGER NOT NULL DEFAULT 1,
  parent_id TEXT,
  spouse_id TEXT,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage all family members"
ON public.family_members
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policy for users to manage their own family data
CREATE POLICY "Users can manage their own family members"
ON public.family_members
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_family_members_updated_at
BEFORE UPDATE ON public.family_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX idx_family_members_generation ON public.family_members(generation);