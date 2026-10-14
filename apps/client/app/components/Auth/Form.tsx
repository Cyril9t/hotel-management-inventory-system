import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { NavLink, useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate()
    const handleSubmit = (e: any) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false)

        }, 1500);

    };

    const dash = [
        {
            title: "GM",
            link: "/GM.dashboard",
        },
        {
            title: "CEO",
            link: "/CEO.dashboard",
        },
        {
            title: "RECEP",
            link: "/reception",
        }
    ]

    return (
        <div className="w-full max-w-md mx-auto">

            <Card >
                <CardHeader className="bg-destructive-foreground">
                    <h1 className="text-destructive">This is for easy navigation until Authentication is integrated</h1>
                </CardHeader>

                <CardContent>
                    {dash.map((d) => {
                        return (
                            <NavLink
                                to={d.link}

                            >
                                <Button>
                                    {d.title}
                                </Button>
                            </NavLink>
                        )

                    })}
                </CardContent>
            </Card>

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Welcome Back</h2>
                <p className="text-sm text-muted-foreground mt-1">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                        Email address
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--muted-foreground)]">
                            <Mail className="w-4 h-4" />
                        </span>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@hotel.com"
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-[var(--radius)] border border-[var(--input)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                        />
                    </div>
                </div>


                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                        Password
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--muted-foreground)]">
                            <Lock className="w-4 h-4" />
                        </span>
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-[var(--radius)] border border-[var(--input)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                        />
                        <Button
                            variant={"ghost"}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 pt-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors border-none"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>


                <div className="flex items-center justify-between text-sm py-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-[var(--input)] text-[var(--primary)] focus:ring-[var(--ring)] accent-[var(--primary)]"
                        />
                        <span className="text-xs font-medium text-[var(--muted-foreground)]">Remember me</span>
                    </label>
                    <a href="#forgot" className="text-xs font-medium text-[var(--primary)] hover:underline">
                        Forgot password?
                    </a>
                </div>


                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10"
                >
                    {isLoading ? (
                        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            Sign In <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </Button>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-[var(--border)]"></div>
                    <span className="flex-shrink mx-4 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">or</span>
                    <div className="flex-grow border-t border-[var(--border)]"></div>
                </div>

                {/* Google SSO Button */}
                <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-[var(--radius)] border border-[var(--input)] bg-[var(--card)] text-[var(--foreground)] font-medium text-sm hover:bg-[var(--secondary)] transition-all"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Continue with Google
                </button>

                {/* Footer Admin Link */}
                <div className="text-center pt-3 text-xs text-[var(--muted-foreground)]">
                    Don&apos;t have an account?{' '}
                    <a href="#admin" className="text-[var(--primary)] font-medium hover:underline">
                        Contact your administrator
                    </a>
                </div>
            </form>
        </div>
    );
}