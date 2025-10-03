-- Create enum for TRL levels
CREATE TYPE public.trl_level AS ENUM (
  'TRL1', 'TRL2', 'TRL3', 'TRL4', 'TRL5', 
  'TRL6', 'TRL7', 'TRL8', 'TRL9'
);

-- Create enum for project status
CREATE TYPE public.project_status AS ENUM (
  'planejamento', 'em_andamento', 'pausado', 'concluido', 'cancelado'
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  current_trl trl_level NOT NULL DEFAULT 'TRL1',
  target_trl trl_level NOT NULL DEFAULT 'TRL9',
  status project_status NOT NULL DEFAULT 'planejamento',
  start_date DATE NOT NULL,
  expected_end_date DATE,
  responsible_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view all projects"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Admins and technicians can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'tecnico')
  );

CREATE POLICY "Admins and technicians can update projects"
  ON public.projects FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'tecnico')
  );

CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- TRL History table
CREATE TABLE public.trl_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  from_trl trl_level NOT NULL,
  to_trl trl_level NOT NULL,
  evidence TEXT NOT NULL,
  validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trl_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view TRL history"
  ON public.trl_history FOR SELECT
  USING (true);

CREATE POLICY "Admins and technicians can manage TRL history"
  ON public.trl_history FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'tecnico')
  );

-- Instruments table
CREATE TABLE public.instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT UNIQUE,
  category TEXT NOT NULL,
  location TEXT,
  calibration_frequency_months INTEGER NOT NULL DEFAULT 12,
  last_calibration_date DATE,
  next_calibration_date DATE,
  status TEXT NOT NULL DEFAULT 'ativo',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view instruments"
  ON public.instruments FOR SELECT
  USING (true);

CREATE POLICY "Admins and technicians can manage instruments"
  ON public.instruments FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'tecnico')
  );

-- Calibrations table
CREATE TABLE public.calibrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id UUID REFERENCES public.instruments(id) ON DELETE CASCADE NOT NULL,
  calibration_date DATE NOT NULL,
  next_calibration_date DATE NOT NULL,
  certificate_number TEXT,
  calibration_lab TEXT,
  result TEXT NOT NULL,
  uncertainty_value NUMERIC,
  uncertainty_unit TEXT,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.calibrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view calibrations"
  ON public.calibrations FOR SELECT
  USING (true);

CREATE POLICY "Admins and technicians can manage calibrations"
  ON public.calibrations FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'tecnico')
  );

-- Quality indicators table
CREATE TABLE public.quality_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  indicator_name TEXT NOT NULL,
  indicator_type TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL,
  unit TEXT,
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL,
  notes TEXT,
  measured_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quality_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quality indicators"
  ON public.quality_indicators FOR SELECT
  USING (true);

CREATE POLICY "Admins and technicians can manage quality indicators"
  ON public.quality_indicators FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'tecnico')
  );

-- TDP Documents table
CREATE TABLE public.tdp_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL DEFAULT '1.0',
  status TEXT NOT NULL DEFAULT 'rascunho',
  file_url TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approval_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tdp_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view TDP documents"
  ON public.tdp_documents FOR SELECT
  USING (true);

CREATE POLICY "Admins and technicians can manage TDP documents"
  ON public.tdp_documents FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'tecnico')
  );

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instruments_updated_at
  BEFORE UPDATE ON public.instruments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tdp_documents_updated_at
  BEFORE UPDATE ON public.tdp_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();