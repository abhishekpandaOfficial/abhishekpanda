-- Enable realtime for login_audit_logs table
ALTER PUBLICATION supabase_realtime ADD TABLE public.login_audit_logs;

-- Set replica identity to full for complete row data
ALTER TABLE public.login_audit_logs REPLICA IDENTITY FULL;