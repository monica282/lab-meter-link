import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

const Quality = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Indicadores de Qualidade</h2>
          <p className="text-muted-foreground">
            Monitoramento de conformidade e métricas de qualidade
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Em Desenvolvimento
            </CardTitle>
            <CardDescription>
              Esta funcionalidade está sendo construída
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Em breve você poderá gerenciar e acompanhar indicadores de qualidade relacionados aos seus projetos.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Quality;
