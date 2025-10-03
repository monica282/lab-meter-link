import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle, TrendingUp, Gauge } from 'lucide-react';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-2xl">Sistema Metrológico Digital</CardTitle>
            <CardDescription>
              Faça login para acessar o sistema de gestão de TRL e qualidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = '/auth'}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: projectsCount } = useQuery({
    queryKey: ['projects-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'em_andamento');
      return count || 0;
    },
  });

  const { data: avgTRL } = useQuery({
    queryKey: ['avg-trl'],
    queryFn: async () => {
      const { data } = await supabase
        .from('projects')
        .select('current_trl')
        .eq('status', 'em_andamento');
      
      if (!data || data.length === 0) return null;
      
      const trlValues = data.map(p => parseInt(p.current_trl.replace('TRL', '')));
      const avg = trlValues.reduce((a, b) => a + b, 0) / trlValues.length;
      return Math.round(avg * 10) / 10;
    },
  });

  const { data: calibrationsOK } = useQuery({
    queryKey: ['calibrations-ok'],
    queryFn: async () => {
      const { data } = await supabase
        .from('instruments')
        .select('last_calibration_date, calibration_frequency_months');
      
      if (!data) return 0;
      
      const validCalibrations = data.filter(inst => {
        if (!inst.last_calibration_date) return false;
        const lastDate = new Date(inst.last_calibration_date);
        const nextDate = new Date(lastDate);
        nextDate.setMonth(nextDate.getMonth() + inst.calibration_frequency_months);
        return nextDate >= new Date();
      });
      
      return validCalibrations.length;
    },
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            Bem-vindo!
          </h2>
          <p className="text-muted-foreground">
            Sistema de apoio técnico para evolução de TRL e Technical Data Package (TDP)
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link to="/projects">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projectsCount ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  {projectsCount === 0 ? 'Nenhum projeto ativo' : 'em andamento'}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">TRL Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {avgTRL ? `TRL ${avgTRL}` : '-'}
              </div>
              <p className="text-xs text-muted-foreground">
                {avgTRL ? 'dos projetos ativos' : 'Aguardando dados'}
              </p>
            </CardContent>
          </Card>

          <Link to="/instruments">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Calibrações OK</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calibrationsOK ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  {calibrationsOK === 0 ? 'Nenhuma calibração' : 'dentro do prazo'}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Instrumentos</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Total cadastrado</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Funcionalidades Implementadas</CardTitle>
              <CardDescription>
                Sistema completo para gestão metrológica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <Link to="/projects" className="font-medium hover:underline">
                      Gestão de TRL
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Acompanhar evolução tecnológica (TRL 1-9)
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <Link to="/instruments" className="font-medium hover:underline">
                      Rastreabilidade Metrológica
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Controle de calibração e instrumentos
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Indicadores de Qualidade
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Monitoramento de conformidade (em breve)
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Technical Data Package (TDP)
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Documentação técnica completa (em breve)
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Começar</CardTitle>
              <CardDescription>
                Primeiros passos no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/projects">
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Criar seu primeiro projeto TRL
                </Button>
              </Link>
              <Link to="/instruments">
                <Button className="w-full justify-start" variant="outline">
                  <Gauge className="h-4 w-4 mr-2" />
                  Cadastrar instrumentos
                </Button>
              </Link>
              <div className="pt-4 text-sm text-muted-foreground">
                <p className="font-medium mb-2">Sobre o sistema:</p>
                <p>
                  Sistema desenvolvido para apoiar deep techs nas exigências de evolução de TRL
                  (Manual de Oslo) até TRL 9 e Technical Data Package (TDP).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
