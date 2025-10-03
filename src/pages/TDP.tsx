import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const TDP = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Technical Data Package (TDP)</h2>
          <p className="text-muted-foreground">
            Documentação técnica completa dos projetos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Em Desenvolvimento
            </CardTitle>
            <CardDescription>
              Esta funcionalidade está sendo construída
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Em breve você poderá gerenciar documentação técnica (TDP) completa dos seus projetos.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TDP;
