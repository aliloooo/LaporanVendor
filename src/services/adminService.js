import { supabase } from './supabaseClient';

const REPORTS_BUCKET = 'vendor-reports';
const TEMPLATES_BUCKET = 'templates';

// ─── REPORTS ────────────────────────────────────────────────

export const getReports = async () => {
    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

export const createReport = async ({ title, description, file }) => {
    const { data: { user } } = await supabase.auth.getUser();
    const filePath = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`;

    const { error: uploadError } = await supabase.storage
        .from(REPORTS_BUCKET)
        .upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from(REPORTS_BUCKET).getPublicUrl(filePath);

    const { data, error } = await supabase.from('reports').insert([{
        title, description,
        file_url: urlData.publicUrl,
        file_path: filePath,
        uploaded_by: user.id,
    }]).select().single();
    if (error) throw error;
    return data;
};

export const updateReport = async (id, { title, description }) => {
    const { data, error } = await supabase
        .from('reports')
        .update({ title, description, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select().single();
    if (error) throw error;
    return data;
};

export const deleteReport = async (id, filePath) => {
    await supabase.storage.from(REPORTS_BUCKET).remove([filePath]);
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (error) throw error;
};

// ─── TEMPLATES ──────────────────────────────────────────────

export const getTemplates = async () => {
    const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

export const createTemplate = async ({ name, category, file_type, file }) => {
    const { data: { user } } = await supabase.auth.getUser();
    const folder = `${file_type}`;
    const filePath = `${folder}/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`;

    const { error: uploadError } = await supabase.storage
        .from(TEMPLATES_BUCKET)
        .upload(filePath, file);
    if (uploadError) throw uploadError;

    // Use public URL so vendors (not logged in) can download directly
    const { data: urlData } = supabase.storage
        .from(TEMPLATES_BUCKET)
        .getPublicUrl(filePath);

    const { data, error } = await supabase.from('report_templates').insert([{
        name, category, file_type,
        file_url: urlData.publicUrl,
        file_path: filePath,
        uploaded_by: user.id,
    }]).select().single();
    if (error) throw error;
    return data;
};


export const updateTemplate = async (id, { name, category }) => {
    const { data, error } = await supabase
        .from('report_templates')
        .update({ name, category, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select().single();
    if (error) throw error;
    return data;
};

export const deleteTemplate = async (id, filePath) => {
    await supabase.storage.from(TEMPLATES_BUCKET).remove([filePath]);
    const { error } = await supabase.from('report_templates').delete().eq('id', id);
    if (error) throw error;
};

export const getTemplateDownloadUrl = async (filePath) => {
    // Templates bucket is public — return public URL directly
    const { data } = supabase.storage
        .from(TEMPLATES_BUCKET)
        .getPublicUrl(filePath);
    return data.publicUrl;
};

