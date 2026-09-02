update public.social_profiles
set username = 'iamabhishekpanda',
    profile_url = 'https://www.linkedin.com/in/iamabhishekpanda/',
    updated_at = now()
where platform = 'linkedin';

update public.social_profiles
set username = 'i_am_abhishekPanda',
    profile_url = 'https://www.instagram.com/i_am_abhishekPanda',
    updated_at = now()
where platform = 'instagram';

update public.social_profiles
set username = 'stackedin',
    profile_url = 'https://www.youtube.com/@stackedin',
    updated_at = now()
where platform = 'youtube';

update public.social_profiles
set username = 'Stacked_in',
    profile_url = 'https://x.com/Stacked_in',
    updated_at = now()
where platform = 'x';

update public.social_profiles
set username = 'stackedin',
    profile_url = 'https://stackedin.substack.com/',
    updated_at = now()
where platform = 'substack';
