import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import confetti from 'canvas-confetti';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Trophy, AlertCircle, Edit, Trash2, ChevronRight, CheckCircle2 } from 'lucide-react';
import EditGoalDialog from './EditGoalDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

const GoalList = () => {
    const [goals, setGoals] = useState([]);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [editingGoal, setEditingGoal] = useState(null);
    const [deletingGoal, setDeletingGoal] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const response = await api.get('/goals');
            setGoals(response.data);
        } catch (error) {
            console.error('Error fetching goals:', error);
        }
    };

    const calculateProgress = (goal) => {
        let totalWeight = 0;
        let completedWeight = 0;

        goal.subGoals.forEach(sg => {
            sg.actions.forEach(action => {
                const actionWeight = (sg.weight / 100) * (action.weight / 100) * 100;
                totalWeight += actionWeight;
                if (action.isCompleted) {
                    completedWeight += actionWeight;
                }
            });
        });

        return totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100);
    };

    const triggerConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    };

    const handleToggleAction = async (actionId, currentStatus) => {
        try {
            await api.patch(`/goals/actions/${actionId}/toggle`);

            const response = await api.get('/goals');
            setGoals(response.data);

            if (selectedGoal) {
                const updatedSelectedGoal = response.data.find(g => g.id === selectedGoal.id);
                setSelectedGoal(updatedSelectedGoal);

                if (updatedSelectedGoal?.isCompleted && !selectedGoal.isCompleted) {
                    triggerConfetti();
                }
            }
        } catch (error) {
            console.error('Error toggling action:', error);
        }
    };

    const handleDeleteGoal = async () => {
        try {
            await api.delete(`/goals/${deletingGoal.id}`);
            fetchGoals();
            setDeleteOpen(false);
            setDeletingGoal(null);
            setDetailOpen(false);
        } catch (error) {
            console.error('Error deleting goal:', error);
        }
    };

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {goals.map((goal) => {
                    const progress = calculateProgress(goal);
                    const isExpired = new Date(goal.endDate) < new Date() && !goal.isCompleted;
                    const isCompleted = goal.isCompleted;

                    return (
                        <Card
                            key={goal.id}
                            className={`border ${isExpired ? 'border-destructive/50 bg-destructive/5' :
                                    isCompleted ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/10' :
                                        'border-border'
                                }`}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="flex justify-between items-start gap-2 text-base">
                                    <span className="line-clamp-2">{goal.title}</span>
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {progress}%
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pb-3">
                                <Progress value={progress} className="h-1.5" />
                                {goal.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">{goal.description}</p>
                                )}
                                <div className="text-xs text-muted-foreground">
                                    Vence: {new Date(goal.endDate).toLocaleDateString()}
                                </div>
                                {isExpired && (
                                    <div className="text-destructive text-sm flex items-center gap-1.5">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        <span>Meta no completada</span>
                                    </div>
                                )}
                                {isCompleted && (
                                    <div className="text-green-600 dark:text-green-500 text-sm flex items-center gap-1.5 font-medium">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>Meta completada</span>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex gap-2 pt-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => {
                                        setSelectedGoal(goal);
                                        setDetailOpen(true);
                                    }}
                                >
                                    Ver detalles
                                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="px-2"
                                    onClick={() => {
                                        setEditingGoal(goal);
                                        setEditOpen(true);
                                    }}
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="px-2"
                                    onClick={() => {
                                        setDeletingGoal(goal);
                                        setDeleteOpen(true);
                                    }}
                                >
                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {/* Detail Dialog */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedGoal?.title}
                            {selectedGoal?.isCompleted && (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedGoal && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <Progress
                                        value={calculateProgress(selectedGoal)}
                                        className="h-2"
                                    />
                                </div>
                                <span className="text-sm font-medium">
                                    {calculateProgress(selectedGoal)}%
                                </span>
                            </div>

                            {selectedGoal.isCompleted && (
                                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm font-medium">
                                        <Trophy className="h-4 w-4" />
                                        Meta completada
                                    </div>
                                </div>
                            )}

                            {selectedGoal.subGoals.map(sg => (
                                <div key={sg.id} className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-medium">{sg.title}</h4>
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                            {sg.weight}%
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {sg.actions.map(action => (
                                            <div
                                                key={action.id}
                                                className="flex items-center gap-3 p-2 rounded hover:bg-muted/50"
                                            >
                                                <Checkbox
                                                    id={`action-${action.id}`}
                                                    checked={action.isCompleted}
                                                    onCheckedChange={() => handleToggleAction(action.id, action.isCompleted)}
                                                />
                                                <label
                                                    htmlFor={`action-${action.id}`}
                                                    className={`flex-1 text-sm cursor-pointer ${action.isCompleted ? 'line-through text-muted-foreground' : ''
                                                        }`}
                                                >
                                                    {action.title}
                                                </label>
                                                <span className="text-xs text-muted-foreground">{action.weight}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            {editingGoal && (
                <EditGoalDialog
                    goal={editingGoal}
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    onSuccess={() => {
                        fetchGoals();
                        setEditOpen(false);
                    }}
                />
            )}

            {/* Delete Confirmation Dialog */}
            {deletingGoal && (
                <DeleteConfirmDialog
                    open={deleteOpen}
                    onOpenChange={setDeleteOpen}
                    onConfirm={handleDeleteGoal}
                    title={`¿Eliminar "${deletingGoal.title}"?`}
                    description="Esta acción no se puede deshacer. Se eliminarán todos los sub-objetivos y tareas asociadas."
                />
            )}
        </>
    );
};

export default GoalList;
