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
import { Plus, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Layout from '@/components/Layout';

const Quality = () => {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const canEdit = userRole === 'admin' || userRole === 'tecnico';

  const { data: projects } = useQuery({
    queryKey: ['projects-for-quality'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: indicators, isLoading } = useQuery({
    queryKey: ['quality-indicators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quality_indicators')
        .select('*, projects(name)')
        .order('measurement_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createIndicatorMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const targetValue = parseFloat(formData.get('target_value') as string);
      const currentValue = parseFloat(formData.get('current_value') as string);
      
      // Determinar status automaticamente
      let status = 'conforme';
      const tolerance = targetValue * 0.05; // 5% de tolerância
      
      if (Math.abs(currentValue - targetValue) > tolerance) {
        status = 'nao_conforme';
      } else if (Math.abs(currentValue - targetValue) > tolerance * 0.5) {
        status = 'atencao';
      }

      const data: any = {
        project_id: formData.get('project_id'),
        indicator_name: formData.get('indicator_name'),
        indicator_type: formData.get('indicator_type'),
        target_value: targetValue,
        current_value: currentValue,
        unit: formData.get('unit'),
        measurement_date: formData.get('measurement_date'),
        status: status,
        notes: formData.get('notes'),
      };

      const { error } = await supabase.from('quality_indicators').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quality-indicators'] });
      toast({ title: 'Indicador registrado com sucesso!' });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao registrar indicador',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createIndicatorMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      conforme: 'default',
      atencao: 'secondary',
      nao_conforme: 'destructive',
    };
    return variants[status] || 'outline';
  };

  const getStatusIcon = (targetValue: number, currentValue: number) => {
    const diff = ((currentValue - targetValue) / targetValue) * 100;
    
    if (Math.abs(diff) < 2) {
      return <Minus className="h-4 w-4 text-yellow-500" />;
    } else if (diff > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      conforme: 'Conforme',
      atencao: 'Atenção',
      nao_conforme: 'Não Conforme',
    };
    return labels[status] || status;
  };

  const indicatorTypes = [
    { value: 'dimensional', label: 'Dimensional' },
    { value: 'pureza', label: 'Pureza' },
    { value: 'concentracao', label: 'Concentração' },
    { value: 'temperatura', label: 'Temperatura' },
    { value: 'pressao', label: 'Pressão' },
    { value: 'ph', label: 'pH' },
    { value: 'viabilidade', label: 'Viabilidade Celular' },
    { value: 'contaminacao', label: 'Contaminação' },
    { value: 'rendimento', label: 'Rendimento' },
    { value: 'outro', label: 'Outro' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Indicadores de Qualidade</h2>
            <p className="text-muted-foreground">
              Monitoramento de conformidade e métricas de qualidade
            </p>
          </div>
          {canEdit && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Indicador
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Registrar Indicador de Qualidade</DialogTitle>
                  <DialogDescription>
                    Adicione medições e métricas de qualidade
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
                      <Label htmlFor="indicator_name">Nome do Indicador *</Label>
                      <Input 
                        id="indicator_name" 
                        name="indicator_name" 
                        placeholder="Ex: Pureza do produto"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="indicator_type">Tipo *</Label>
                      <Select name="indicator_type" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {indicatorTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="target_value">Valor Meta *</Label>
                      <Input 
                        id="target_value" 
                        name="target_value" 
                        type="number"
                        step="0.0001"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current_value">Valor Medido *</Label>
                      <Input 
                        id="current_value" 
                        name="current_value" 
                        type="number"
                        step="0.0001"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unidade *</Label>
                      <Input 
                        id="unit" 
                        name="unit" 
                        placeholder="Ex: %, mg/L, °C"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="measurement_date">Data da Medição *</Label>
                    <Input 
                      id="measurement_date" 
                      name="measurement_date" 
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea id="notes" name="notes" rows={3} />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createIndicatorMutation.isPending}>
                      {createIndicatorMutation.isPending ? 'Registrando...' : 'Registrar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        ) : indicators && indicators.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {indicators.map((indicator: any) => {
              const deviation = ((indicator.current_value - indicator.target_value) / indicator.target_value) * 100;

              return (
                <Card key={indicator.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {indicator.indicator_name}
                          {getStatusIcon(indicator.target_value, indicator.current_value)}
                        </CardTitle>
                        <CardDescription>{indicator.projects?.name}</CardDescription>
                      </div>
                      <Badge variant={getStatusBadge(indicator.status)}>
                        {getStatusLabel(indicator.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Meta</div>
                        <div className="text-lg font-bold">
                          {indicator.target_value} {indicator.unit}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Medido</div>
                        <div className="text-lg font-bold">
                          {indicator.current_value} {indicator.unit}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Desvio:</span>
                        <span className={`font-medium ${
                          Math.abs(deviation) < 5 ? 'text-green-600' : 
                          Math.abs(deviation) < 10 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {deviation > 0 ? '+' : ''}{deviation.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Tipo:</span>
                        <span className="capitalize">{indicator.indicator_type}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Data:</span>
                        <span>{new Date(indicator.measurement_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    {indicator.notes && (
                      <div className="pt-2 border-t">
                        <div className="text-xs text-muted-foreground">Observações:</div>
                        <div className="text-sm mt-1">{indicator.notes}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Nenhum indicador registrado</p>
              <p className="text-sm text-muted-foreground mb-4">
                {canEdit
                  ? 'Comece registrando indicadores de qualidade'
                  : 'Aguarde registros de indicadores'}
              </p>
              {canEdit && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primeiro Indicador
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Quality;
