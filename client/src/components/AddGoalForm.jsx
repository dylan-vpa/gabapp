import React, { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';

const AddGoalForm = ({ onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!title || !startDate || !endDate) {
            setError('Por favor completa todos los campos requeridos');
            return;
        }

        setLoading(true);
        try {
            // Step 1: Generate plan with AI
            const aiResponse = await api.post('/ai/generate', { mainGoal: title });

            // Step 2: Create goal with generated plan
            await api.post('/goals', {
                title,
                description,
                startDate,
                endDate,
                subGoals: aiResponse.data.subgoals || []
            });

            // Reset form
            setTitle('');
            setDescription('');
            setStartDate('');
            setEndDate('');

            if (onSuccess) onSuccess();
        } catch (err) {
            if (err.response?.status === 500) {
                setError('Error generando plan con IA. Asegúrate de que Ollama esté corriendo con el modelo llama3.');
            } else {
                setError('Error creando la meta. Intenta de nuevo.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title">Título de la Meta *</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Aprender a cocinar"
                    required
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe tu meta..."
                    rows={3}
                    disabled={loading}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha de Inicio *</Label>
                    <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endDate">Fecha Límite *</Label>
                    <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    La IA generará automáticamente un plan detallado para tu meta
                </div>
            </div>

            {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                    {error}
                </div>
            )}

            <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando y creando meta...
                    </>
                ) : (
                    <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Crear Meta con IA
                    </>
                )}
            </Button>
        </form>
    );
};

export default AddGoalForm;
