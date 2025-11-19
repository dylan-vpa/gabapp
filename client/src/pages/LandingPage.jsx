import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Trophy, Zap, Target } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Navbar */}
            <nav className="border-b border-border">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Target className="h-6 w-6 text-foreground" />
                        <span className="text-xl font-semibold text-foreground">NeedIt</span>
                    </div>
                    <div className="space-x-3">
                        <Link to="/login">
                            <Button variant="ghost" size="sm">Iniciar Sesión</Button>
                        </Link>
                        <Link to="/register">
                            <Button size="sm">Empezar</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow flex flex-col items-center justify-center px-4 py-20">
                <div className="max-w-3xl text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                        Convierte tus metas en realidad
                    </h1>

                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        NeedIt usa IA para desglosar tus objetivos en pasos alcanzables.
                        Simple, visual y efectivo.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                        <Link to="/register">
                            <Button size="lg" className="gap-2">
                                Comenzar gratis <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" size="lg">
                                Iniciar sesión
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-4xl w-full px-4">
                    <FeatureCard
                        icon={<Zap className="h-5 w-5" />}
                        title="IA Generativa"
                        description="Desglosa automáticamente tus metas en un plan de acción detallado."
                    />
                    <FeatureCard
                        icon={<CheckCircle className="h-5 w-5" />}
                        title="Seguimiento Visual"
                        description="Visualiza tu progreso en tiempo real con gráficos claros."
                    />
                    <FeatureCard
                        icon={<Trophy className="h-5 w-5" />}
                        title="Gamificación"
                        description="Celebra cada logro y mantén la motivación alta."
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
                <div className="container mx-auto px-6">
                    <p>&copy; {new Date().getFullYear()} NeedIt. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="space-y-3">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-md">
                {icon}
            </div>
            <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
);

export default LandingPage;
