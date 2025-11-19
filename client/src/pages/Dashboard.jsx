import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import GoalList from '@/components/GoalList';
import AddGoalForm from '@/components/AddGoalForm';
import { LogOut, Plus, Target } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [dialogOpen, setDialogOpen] = useState(false);
    const userName = localStorage.getItem('userName') || '';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        navigate('/');
    };

    const handleGoalCreated = () => {
        setDialogOpen(false);
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border sticky top-0 z-50 bg-background">
                <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-foreground" />
                        <span className="text-lg font-semibold">NeedIt</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground hidden sm:block">
                            {userName}
                        </span>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    Nueva meta
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Crear nueva meta</DialogTitle>
                                </DialogHeader>
                                <AddGoalForm onSuccess={handleGoalCreated} />
                            </DialogContent>
                        </Dialog>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold mb-1">Tus metas</h1>
                    <p className="text-sm text-muted-foreground">Gestiona tu progreso</p>
                </div>
                <GoalList />
            </main>
        </div>
    );
};

export default Dashboard;
