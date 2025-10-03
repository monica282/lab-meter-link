import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import Layout from '@/components/Layout';

const Production = () => {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [isNonConformityDialogOpen, setIsNonConformityDialogOpen] = useState(false);

  const canEdit = userRole === 'admin' || userRole === 'tecnico';

  const { data: projects } = useQuery({
    queryKey: ['projects-for-production'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: batches, isLoading: batchesLoading } = useQuery({
    queryKey: ['production-batches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_batches')
        .select('*, projects(name)')
        .order('production_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: nonConformities, isLoading: ncLoading } = useQuery({
    queryKey: ['non-conformities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('non_conformities')
        .select('*, projects(name), production_batches(batch_number)')
        .order('detected_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createBatchMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const data: any = {
        project_id: formData.get('project_id'),
        batch_number: formData.get('batch_number'),
        production_stage: formData.get('production_stage'),
        production_date: formData.get('production_date'),
        quantity: parseFloat(formData.get('quantity') as string),
        unit: formData.get('unit'),
        notes: formData.get('notes'),
      };

      const { error } = await supabase.from('production_batches').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-batches'] });
      toast({ title: 'Lote criado com sucesso!' });
      setIsBatchDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao criar lote', description: error.message, variant: 'destructive' });
    },
  });

  const createNonConformityMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const data: any = {
        project_id: formData.get('project_id') || null,
        batch_id: formData.get('batch_id') || null,
        title: formData.get('title'),
        description: formData.get('description'),
        severity: formData.get('severity'),
        detected_date: formData.get('detected_date'),
      };

      const { error } = await supabase.from('non_conformities').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['non-conformities'] });
      toast({ title: 'Não-conformidade registrada!' });
      setIsNonConformityDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao registrar não-conformidade', description: error.message, variant: 'destructive' });
    },
  });

  const handleBatchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createBatchMutation.mutate(formData);
  };

  const handleNonConformitySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createNonConformityMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      em_producao: 'default',
      concluido: 'secondary',
      cancelado: 'destructive',
    };
    return variants[status] || 'outline';
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, any> = {
      critica: 'destructive',
      alta: 'default',
      media: 'secondary',
      baixa: 'outline',
    };
    return variants[severity] || 'outline';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Controle de Produção</h2>
            <p className="text-muted-foreground">
              Lotes, CEP e rastreabilidade para escala
            </p>
          </div>
        </div>

        <Tabs defaultValue="batches" className="w-full">
          <TabsList>
            <TabsTrigger value="batches">Lotes de Produção</TabsTrigger>
            <TabsTrigger value="nonconformities">Não-Conformidades</TabsTrigger>
          </TabsList>

          <TabsContent value="batches" className="space-y-4">
            <div className="flex justify-end">
              {canEdit && (
                <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Lote
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Registrar Lote de Produção</DialogTitle>
                      <DialogDescription>
                        Registre um novo lote para rastreabilidade
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleBatchSubmit} className="space-y-4">
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
                          <Label htmlFor="batch_number">Número do Lote *</Label>
                          <Input id="batch_number" name="batch_number" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="production_stage">Estágio *</Label>
                          <Select name="production_stage" defaultValue="desenvolvimento" required>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                              <SelectItem value="piloto">Piloto</SelectItem>
                              <SelectItem value="escala_industrial">Escala Industrial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="production_date">Data de Produção *</Label>
                          <Input id="production_date" name="production_date" type="date" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantidade *</Label>
                          <Input id="quantity" name="quantity" type="number" step="0.01" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="unit">Unidade *</Label>
                        <Input id="unit" name="unit" placeholder="Ex: kg, L, unidades" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea id="notes" name="notes" rows={3} />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsBatchDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createBatchMutation.isPending}>
                          {createBatchMutation.isPending ? 'Criando...' : 'Criar Lote'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {batchesLoading ? (
              <div>Carregando...</div>
            ) : batches && batches.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {batches.map((batch: any) => (
                  <Card key={batch.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{batch.batch_number}</CardTitle>
                          <CardDescription>{batch.projects?.name}</CardDescription>
                        </div>
                        <Badge variant={getStatusBadge(batch.status)}>
                          {batch.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{batch.quantity} {batch.unit}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Estágio: {batch.production_stage.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Data: {new Date(batch.production_date).toLocaleDateString('pt-BR')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Nenhum lote registrado</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {canEdit ? 'Comece registrando seu primeiro lote' : 'Aguarde registros de lotes'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="nonconformities" className="space-y-4">
            <div className="flex justify-end">
              {canEdit && (
                <Dialog open={isNonConformityDialogOpen} onOpenChange={setIsNonConformityDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Não-Conformidade
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Registrar Não-Conformidade</DialogTitle>
                      <DialogDescription>
                        Documente problemas para análise e ação corretiva
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleNonConformitySubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input id="title" name="title" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição *</Label>
                        <Textarea id="description" name="description" rows={4} required />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="severity">Severidade *</Label>
                          <Select name="severity" required>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="baixa">Baixa</SelectItem>
                              <SelectItem value="media">Média</SelectItem>
                              <SelectItem value="alta">Alta</SelectItem>
                              <SelectItem value="critica">Crítica</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="detected_date">Data de Detecção *</Label>
                          <Input id="detected_date" name="detected_date" type="date" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="project_id">Projeto (opcional)</Label>
                        <Select name="project_id">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione se aplicável" />
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

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsNonConformityDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createNonConformityMutation.isPending}>
                          {createNonConformityMutation.isPending ? 'Registrando...' : 'Registrar'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {ncLoading ? (
              <div>Carregando...</div>
            ) : nonConformities && nonConformities.length > 0 ? (
              <div className="space-y-4">
                {nonConformities.map((nc: any) => (
                  <Card key={nc.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{nc.title}</CardTitle>
                            <Badge variant={getSeverityBadge(nc.severity)}>
                              {nc.severity}
                            </Badge>
                            <Badge variant={nc.status === 'aberta' ? 'destructive' : 'secondary'}>
                              {nc.status}
                            </Badge>
                          </div>
                          <CardDescription>{nc.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {nc.projects && (
                        <div className="text-sm">
                          <span className="font-medium">Projeto:</span> {nc.projects.name}
                        </div>
                      )}
                      {nc.production_batches && (
                        <div className="text-sm">
                          <span className="font-medium">Lote:</span> {nc.production_batches.batch_number}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        Detectado em: {new Date(nc.detected_date).toLocaleDateString('pt-BR')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Nenhuma não-conformidade registrada</p>
                  <p className="text-sm text-muted-foreground">
                    Sistema sem registros de problemas
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Production;
