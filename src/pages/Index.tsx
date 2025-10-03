import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, TrendingUp, Users } from 'lucide-react';

const Index = () => {
  const { user, userRole, signOut } = useAuth();

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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'tecnico':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'tecnico':
        return 'Técnico';
      default:
        return 'Usuário';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Sistema Metrológico Digital</h1>
            <p className="text-sm text-muted-foreground">Gestão de TRL e Qualidade</p>
          </div>
          <div className="flex items-center gap-4">
            {userRole && (
              <Badge variant={getRoleBadgeVariant(userRole)}>
                {getRoleLabel(userRole)}
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={signOut}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Bem-vindo, {user.email}!
          </h2>
          <p className="text-muted-foreground">
            Sistema de apoio técnico para evolução de TRL e Technical Data Package (TDP)
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Nenhum projeto cadastrado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">TRL Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Aguardando dados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Calibrações OK</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Nenhuma calibração registrada</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Você está conectado</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades em Desenvolvimento</CardTitle>
            <CardDescription>
              O sistema está sendo construído. Em breve você poderá:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <strong>Gestão de TRL:</strong> Acompanhar a evolução tecnológica de projetos do TRL 1 ao TRL 9
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <strong>Technical Data Package (TDP):</strong> Documentação técnica completa
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <strong>Indicadores de Qualidade:</strong> Monitoramento de conformidade e métricas
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <strong>Rastreabilidade Metrológica:</strong> Controle de calibração e incertezas
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
