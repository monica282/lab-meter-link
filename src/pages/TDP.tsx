import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import Layout from '@/components/Layout';

const TDP = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const canEdit = userRole === 'admin' || userRole === 'tecnico';

  const { data: projects } = useQuery({
    queryKey: ['projects-for-tdp'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: documents, isLoading } = useQuery({
    queryKey: ['tdp-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tdp_documents')
        .select('*, projects(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const data: any = {
        project_id: formData.get('project_id'),
        document_type: formData.get('document_type'),
        title: formData.get('title'),
        description: formData.get('description'),
        version: formData.get('version'),
        file_url: formData.get('file_url'),
        author_id: user?.id,
      };

      const { error } = await supabase.from('tdp_documents').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tdp-documents'] });
      toast({ title: 'Documento registrado com sucesso!' });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao registrar documento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createDocumentMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      rascunho: 'outline',
      revisao: 'secondary',
      aprovado: 'default',
      obsoleto: 'destructive',
    };
    return variants[status] || 'outline';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'revisao':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'obsoleto':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      rascunho: 'Rascunho',
      revisao: 'Em Revisão',
      aprovado: 'Aprovado',
      obsoleto: 'Obsoleto',
    };
    return labels[status] || status;
  };

  const documentTypes = [
    { value: 'especificacao_tecnica', label: 'Especificação Técnica' },
    { value: 'desenho_tecnico', label: 'Desenho Técnico' },
    { value: 'procedimento_operacional', label: 'Procedimento Operacional' },
    { value: 'relatorio_validacao', label: 'Relatório de Validação' },
    { value: 'manual_operacao', label: 'Manual de Operação' },
    { value: 'lista_materiais', label: 'Lista de Materiais (BOM)' },
    { value: 'analise_risco', label: 'Análise de Risco' },
    { value: 'plano_qualidade', label: 'Plano de Qualidade' },
    { value: 'certificado', label: 'Certificado' },
    { value: 'outro', label: 'Outro' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Technical Data Package (TDP)</h2>
            <p className="text-muted-foreground">
              Documentação técnica completa dos projetos
            </p>
          </div>
          {canEdit && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Documento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Registrar Documento TDP</DialogTitle>
                  <DialogDescription>
                    Adicione documentação técnica ao projeto
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="project_id">Projeto *</Label>
                    <Select name="project_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o projeto" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="document_type">Tipo de Documento *</Label>
                      <Select name="document_type" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="version">Versão *</Label>
                      <Input 
                        id="version" 
                        name="version" 
                        placeholder="Ex: 1.0, 2.1"
                        defaultValue="1.0"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Documento *</Label>
                    <Input 
                      id="title" 
                      name="title" 
                      placeholder="Ex: Especificação do Produto Final"
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      rows={3}
                      placeholder="Descreva o conteúdo e propósito do documento"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file_url">URL do Arquivo</Label>
                    <Input 
                      id="file_url" 
                      name="file_url" 
                      type="url"
                      placeholder="https://exemplo.com/documento.pdf"
                    />
                    <p className="text-xs text-muted-foreground">
                      Link para o documento no seu sistema de armazenamento
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createDocumentMutation.isPending}>
                      {createDocumentMutation.isPending ? 'Registrando...' : 'Registrar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((doc: any) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(doc.status)}
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                        <Badge variant={getStatusBadge(doc.status)}>
                          {getStatusLabel(doc.status)}
                        </Badge>
                        <Badge variant="outline">v{doc.version}</Badge>
                      </div>
                      <CardDescription>
                        {doc.projects?.name} • {doc.document_type.replace(/_/g, ' ')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {doc.description && (
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">
                      Criado em: {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    {doc.file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Abrir Documento
                      </Button>
                    )}
                  </div>

                  {doc.approval_date && (
                    <div className="text-sm text-muted-foreground pt-2 border-t">
                      Aprovado em: {new Date(doc.approval_date).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Nenhum documento registrado</p>
              <p className="text-sm text-muted-foreground mb-4">
                {canEdit
                  ? 'Comece construindo o TDP dos seus projetos'
                  : 'Aguarde documentação TDP'}
              </p>
              {canEdit && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primeiro Documento
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default TDP;
