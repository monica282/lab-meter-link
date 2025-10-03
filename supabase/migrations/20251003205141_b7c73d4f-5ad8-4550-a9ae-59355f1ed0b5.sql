-- Create enum for metrology areas
CREATE TYPE public.metrology_area AS ENUM ('quimica', 'fisica', 'biologica');

-- Create enum for production stage
CREATE TYPE public.production_stage AS ENUM ('desenvolvimento', 'piloto', 'escala_industrial');

-- Add metrology area to instruments
ALTER TABLE public.instruments 
ADD COLUMN metrology_area metrology_area NOT NULL DEFAULT 'fisica';

-- Reference Standards table
CREATE TABLE public.reference_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  metrology_area metrology_area NOT NULL,
  standard_type TEXT NOT NULL,
  manufacturer TEXT,
  certificate_number TEXT,
  uncertainty_value NUMERIC,
  uncertainty_unit TEXT,
  validity_date DATE,
  storage_conditions TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reference_standards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reference standards"
  ON public.reference_standards FOR SELECT
  USING (true);

CREATE POLICY "Admins and technicians can manage reference standards"
  ON public.reference_standards FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'tecnico')
  );

-- Production Batches table
CREATE TABLE public.production_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  batch_number TEXT UNIQUE NOT NULL,
  production_stage production_stage NOT NULL DEFAULT 'desenvolvimento',
  production_date DATE NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  responsible_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'em_producao',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view production batches"
  ON public.production_batches FOR SELECT
  USING (true);

CREATE POLICY "Admins and technicians can manage production batches"
  ON public.production_batches FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'tecnico')
  );

-- Process Control (SPC) table
CREATE TABLE public.process_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.production_batches(id) ON DELETE CASCADE NOT NULL,
  measurement_parameter TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  measured_value NUMERIC NOT NULL,
  upper_control_limit NUMERIC,
  lower_control_limit NUMERIC,
  unit TEXT NOT NULL,
  measurement_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  instrument_id UUID REFERENCES public.instruments(id) ON DELETE SET NULL,
  operator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  in_control BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.process_control ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view process control"
  ON public.process_control FOR SELECT
  USING (true);

CREATE POLICY "Admins and technicians can manage process control"
  ON public.process_control FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'tecnico')
  );

-- Non-conformities table
CREATE TABLE public.non_conformities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.production_batches(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,
  detected_date DATE NOT NULL DEFAULT CURRENT_DATE,
  detected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  root_cause TEXT,
  corrective_action TEXT,
  status TEXT NOT NULL DEFAULT 'aberta',
  closed_date DATE,
  closed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.non_conformities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view non conformities"
  ON public.non_conformities FOR SELECT
  USING (true);

CREATE POLICY "Admins and technicians can manage non conformities"
  ON public.non_conformities FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'tecnico')
  );

-- Add production stage to projects
ALTER TABLE public.projects
ADD COLUMN production_stage production_stage DEFAULT 'desenvolvimento';

-- Triggers for updated_at
CREATE TRIGGER update_reference_standards_updated_at
  BEFORE UPDATE ON public.reference_standards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_production_batches_updated_at
  BEFORE UPDATE ON public.production_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_non_conformities_updated_at
  BEFORE UPDATE ON public.non_conformities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();