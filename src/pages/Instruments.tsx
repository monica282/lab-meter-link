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
import { Plus, Gauge, Calendar, AlertTriangle } from 'lucide-react';
import Layout from '@/components/Layout';

const Instruments = () => {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const canEdit = userRole === 'admin' || userRole === 'tecnico';

  const { data: instruments, isLoading } = useQuery({
    queryKey: ['instruments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instruments')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const createInstrumentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const data: any = {
        name: formData.get('name') as string,
        manufacturer: formData.get('manufacturer') as string,
        model: formData.get('model') as string,
        serial_number: formData.get('serial_number') as string,
        category: formData.get('category') as string,
        metrology_area: formData.get('metrology_area') as string,
        location: formData.get('location') as string,
        calibration_frequency_months: parseInt(formData.get('calibration_frequency_months') as string),
        last_calibration_date: formData.get('last_calibration_date') as string || null,
        notes: formData.get('notes') as string,
      };

      const { error } = await supabase.from('instruments').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instruments'] });
      toast({ title: 'Instrumento cadastrado com sucesso!' });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao cadastrar instrumento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createInstrumentMutation.mutate(formData);
  };

  const isCalibrationExpired = (lastCalibration: string | null, frequencyMonths: number) => {
    if (!lastCalibration) return true;
    
    const lastDate = new Date(lastCalibration);
    const nextDate = new Date(lastDate);
    nextDate.setMonth(nextDate.getMonth() + frequencyMonths);
    
    return nextDate < new Date();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Instrumentos</h2>
            <p className="text-muted-foreground">
              Gestão e rastreabilidade metrológica
            </p>
          </div>
          {canEdit && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Instrumento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Cadastrar Instrumento</DialogTitle>
                  <DialogDescription>
                    Adicione um novo instrumento para rastreabilidade
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Instrumento *</Label>
                    <Input id="name" name="name" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="manufacturer">Fabricante</Label>
                      <Input id="manufacturer" name="manufacturer" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Modelo</Label>
                      <Input id="model" name="model" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="serial_number">Número de Série</Label>
                      <Input id="serial_number" name="serial_number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Input id="category" name="category" placeholder="Ex: Paquímetro" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="metrology_area">Área Metrológica *</Label>
                      <Select name="metrology_area" defaultValue="fisica" required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fisica">Metrologia Física</SelectItem>
                          <SelectItem value="quimica">Metrologia Química</SelectItem>
                          <SelectItem value="biologica">Metrologia Biológica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Localização</Label>
                      <Input id="location" name="location" placeholder="Ex: Sala 101" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="calibration_frequency_months">Frequência de Calibração (meses) *</Label>
                    <Input 
                      id="calibration_frequency_months" 
                      name="calibration_frequency_months" 
                      type="number" 
                      min="1"
                      defaultValue="12"
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_calibration_date">Última Calibração</Label>
                    <Input id="last_calibration_date" name="last_calibration_date" type="date" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea id="notes" name="notes" rows={3} />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createInstrumentMutation.isPending}>
                      {createInstrumentMutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
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
        ) : instruments && instruments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {instruments.map((instrument) => {
              const expired = isCalibrationExpired(
                instrument.last_calibration_date,
                instrument.calibration_frequency_months
              );

              return (
                <Card key={instrument.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{instrument.name}</CardTitle>
                        <CardDescription>
                          {instrument.manufacturer} {instrument.model}
                        </CardDescription>
                      </div>
                      {expired && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Vencido
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <span>{instrument.category}</span>
                      {instrument.metrology_area && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <Badge variant="outline" className="text-xs">
                            {instrument.metrology_area === 'fisica' && 'Física'}
                            {instrument.metrology_area === 'quimica' && 'Química'}
                            {instrument.metrology_area === 'biologica' && 'Biológica'}
                          </Badge>
                        </>
                      )}
                    </div>
                    {instrument.serial_number && (
                      <div className="text-sm text-muted-foreground">
                        S/N: {instrument.serial_number}
                      </div>
                    )}
                    {instrument.last_calibration_date ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Última calibração:{' '}
                          {new Date(instrument.last_calibration_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Nunca calibrado
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      Periodicidade: {instrument.calibration_frequency_months} meses
                    </div>
                    {instrument.location && (
                      <div className="text-sm text-muted-foreground">
                        Local: {instrument.location}
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
              <Gauge className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Nenhum instrumento cadastrado</p>
              <p className="text-sm text-muted-foreground mb-4">
                {canEdit
                  ? 'Comece cadastrando seus instrumentos'
                  : 'Aguarde um administrador ou técnico cadastrar instrumentos'}
              </p>
              {canEdit && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Instrumento
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Instruments;
