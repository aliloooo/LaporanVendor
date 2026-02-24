-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: vendors
CREATE TABLE public.vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: report_types
CREATE TABLE public.report_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    period_type TEXT NOT NULL CHECK (period_type IN ('monthly', 'specific_date', 'bi_monthly', 'semi_annual', 'end_of_month')),
    due_day INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: report_uploads
CREATE TABLE public.report_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    report_type_id UUID REFERENCES public.report_types(id) ON DELETE CASCADE,
    report_month DATE NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('uploaded', 'pending', 'overdue')),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) setup
-- For demo purposes, we allow all selects and inserts to authenticated users.
-- In production, policies should restrict based on vendor user roles.
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_uploads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read access on vendors" ON public.vendors;
CREATE POLICY "Allow anonymous read access on vendors" ON public.vendors FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anonymous read access on report_types" ON public.report_types;
CREATE POLICY "Allow anonymous read access on report_types" ON public.report_types FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow read access on report_uploads" ON public.report_uploads;
CREATE POLICY "Allow read access on report_uploads" ON public.report_uploads FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow insert access on report_uploads" ON public.report_uploads;
CREATE POLICY "Allow insert access on report_uploads" ON public.report_uploads FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin delete on report_uploads" ON public.report_uploads;
CREATE POLICY "Allow admin delete on report_uploads" ON public.report_uploads FOR DELETE TO authenticated USING (true);

-- Storage Policies for 'vendor-reports' bucket
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
CREATE POLICY "Allow public upload" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'vendor-reports');

DROP POLICY IF EXISTS "Allow public select" ON storage.objects;
CREATE POLICY "Allow public select" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'vendor-reports');

DROP POLICY IF EXISTS "Allow public update" ON storage.objects;
CREATE POLICY "Allow public update" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'vendor-reports');

DROP POLICY IF EXISTS "Allow admin delete vendor-reports" ON storage.objects;
CREATE POLICY "Allow admin delete vendor-reports" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vendor-reports');

-- Seed Data: vendors
INSERT INTO public.vendors (name) VALUES 
    ('PT. Bringin Inti Teknologi (MS)'),
    ('PT. Insan Teknologi Semesta (MS)'),
    ('PT. Satkomindo Mediyasa (MS)'),
    ('PT. Datindo Infonet Prima (MA MS)'),
    ('PT. Swadharma Sarana Informatika (CRO)'),
    ('PT. Bringin Gigantara (CRO)'),
    ('PT. Advantage SCM (CRO)'),
    ('PT. Kelola Jasa Artha (CRO)'),
    ('PT. Tunas Artha Gardatama (CRO)'),
    ('PT. NCR Indonesia (MA)'),
    ('PT. Diebold Nixdorf Indonesia (MA)'),
    ('PT. Jalin Pembayaran Nusantara (MA)');

-- Seed Data: report_types
INSERT INTO public.report_types (name, period_type, due_day) VALUES 
    ('Kaset Unrepair', 'specific_date', 5),
    ('Laporan Bulanan via Email', 'specific_date', 5),
    ('Sidak KL CRO', 'specific_date', 5),
    ('Plan PM', 'specific_date', 25),
    ('Surat Balasan 8 Aspek Penilaian CRO', 'specific_date', 30),
    ('Surat Tanggapan Penilaian', 'end_of_month', NULL),
    ('Bukti PM Mesin (Format Vendor)', 'end_of_month', NULL),
    ('Bukti PM Kaset (Format Vendor)', 'end_of_month', NULL),
    ('RFI & Surat Balasan Kartu Tertelan', 'end_of_month', NULL);

-- ============================================================
-- PHASE 11: Admin Panel & Template Download System
-- Run this block in Supabase SQL Editor to enable new features
-- ============================================================

-- Table: user_roles (maps auth.users → role)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'vendor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read their own role" ON public.user_roles;
CREATE POLICY "Users can read their own role" ON public.user_roles
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Table: reports (laporan yang diupload admin untuk referensi)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access on reports" ON public.reports;
CREATE POLICY "Admin full access on reports" ON public.reports
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    ) WITH CHECK (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- Table: report_templates (template yang bisa didownload vendor)
CREATE TABLE IF NOT EXISTS public.report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('excel', 'word', 'pdf')),
    file_url TEXT NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access on templates" ON public.report_templates;
CREATE POLICY "Admin full access on templates" ON public.report_templates
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    ) WITH CHECK (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
DROP POLICY IF EXISTS "Vendor read templates" ON public.report_templates;
CREATE POLICY "Vendor read templates" ON public.report_templates
    FOR SELECT TO anon, authenticated USING (true);

-- Storage bucket: templates (for downloadable template files)
-- Note: Create the bucket manually in Supabase Dashboard > Storage > New Bucket
-- Bucket name: "templates", Public: true
-- Then run these policies:
DROP POLICY IF EXISTS "Admin upload to templates bucket" ON storage.objects;
CREATE POLICY "Admin upload to templates bucket" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
        bucket_id = 'templates' AND
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
DROP POLICY IF EXISTS "Authenticated read templates bucket" ON storage.objects;
CREATE POLICY "Authenticated read templates bucket" ON storage.objects
    FOR SELECT TO anon, authenticated USING (bucket_id = 'templates');
DROP POLICY IF EXISTS "Admin delete templates bucket" ON storage.objects;
CREATE POLICY "Admin delete templates bucket" ON storage.objects
    FOR DELETE TO authenticated USING (
        bucket_id = 'templates' AND
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- Storage bucket: vendor-reports (for reports)
DROP POLICY IF EXISTS "Admin upload to reports bucket" ON storage.objects;
CREATE POLICY "Admin upload to reports bucket" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
        bucket_id = 'vendor-reports' AND
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
DROP POLICY IF EXISTS "Authenticated read reports bucket" ON storage.objects;
CREATE POLICY "Authenticated read reports bucket" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'vendor-reports');
DROP POLICY IF EXISTS "Admin delete reports bucket" ON storage.objects;
CREATE POLICY "Admin delete reports bucket" ON storage.objects
    FOR DELETE TO authenticated USING (
        bucket_id = 'vendor-reports' AND
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
