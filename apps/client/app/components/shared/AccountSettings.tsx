import { useState } from "react";
import { KeyRound, LoaderCircle, Mail, Moon, Sun, UserRound } from "lucide-react";
import { useAuth } from "~/Context/AuthContext";
import { useTheme } from "~/Context/ThemeContext";
import { Button } from "~/components/ui/button";
import { requestPasswordReset } from "~/services/auth";

function getErrorMessage(error: any) {
    const message = error?.response?.data?.error?.message;
    return typeof message === "string" ? message : "We couldn't send the password reset email. Please try again.";
}

export default function AccountSettings() {
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const [sendingReset, setSendingReset] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [error, setError] = useState("");
    const email = typeof user?.email === "string" ? user.email : "";
    const name = [user?.firstName, user?.lastName].filter((part) => typeof part === "string" && part.trim()).join(" ");
    const role = typeof user?.role === "string" ? user.role.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter: string) => letter.toUpperCase()) : "";

    async function sendPasswordReset() {
        if (!email || sendingReset) return;
        setSendingReset(true);
        setError("");
        setResetSent(false);
        try {
            await requestPasswordReset(email);
            setResetSent(true);
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setSendingReset(false);
        }
    }

    return (
        <section className="">
            <header>
                <p className="text-sm font-medium text-muted-foreground">Account and application preferences</p>
                <h1 className="mt-1 text-3xl font-bold text-foreground">Settings</h1>
            </header>

            <div className="grid gap-5 lg:grid-cols-2 mt-2">
                <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                        <span className="rounded-lg bg-primary/10 p-2.5 text-primary"><UserRound className="h-5 w-5" /></span>
                        <div>
                            <h2 className="font-semibold text-foreground">Account profile</h2>
                            <p className="mt-1 text-sm text-muted-foreground">Your account details used by the management system.</p>
                        </div>
                    </div>
                    <dl className="mt-6 divide-y divide-border">
                        <div className="grid gap-1 py-3 sm:grid-cols-[120px_1fr] sm:gap-4"><dt className="text-sm text-muted-foreground">Name</dt><dd className="text-sm font-medium text-foreground">{name || "Not available"}</dd></div>
                        <div className="grid gap-1 py-3 sm:grid-cols-[120px_1fr] sm:gap-4"><dt className="text-sm text-muted-foreground">Email</dt><dd className="break-all text-sm font-medium text-foreground">{email || "Not available"}</dd></div>
                        <div className="grid gap-1 py-3 sm:grid-cols-[120px_1fr] sm:gap-4"><dt className="text-sm text-muted-foreground">Access role</dt><dd className="text-sm font-medium text-foreground">{role || "Not available"}</dd></div>
                    </dl>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Profile details are managed by your system administrator. Profile editing is not currently supported by the account API.</p>
                </section>

                <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                        <span className="rounded-lg bg-primary/10 p-2.5 text-primary"><KeyRound className="h-5 w-5" /></span>
                        <div>
                            <h2 className="font-semibold text-foreground">Password and security</h2>
                            <p className="mt-1 text-sm text-muted-foreground">Send a secure password reset link to your account email.</p>
                        </div>
                    </div>
                    <div className="mt-6 rounded-lg border border-border bg-background p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground"><Mail className="h-4 w-4 text-muted-foreground" />{email || "Account email unavailable"}</div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">We’ll email a one-time reset link. You can choose a new password after opening it.</p>
                    </div>
                    {resetSent && <p role="status" className="mt-4 text-sm text-foreground">If an account exists for this email, password reset instructions have been sent.</p>}
                    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
                    <Button type="button" className="h-10 mt-5 w-full sm:w-auto" disabled={!email || sendingReset} onClick={sendPasswordReset}>
                        {sendingReset ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Sending…</> : "Send password reset email"}
                    </Button>
                    {!email && <p className="mt-2 text-xs text-muted-foreground">Sign in again to refresh your account details before requesting a reset.</p>}
                </section>

                <section className="rounded-xl border border-border bg-card p-5 sm:p-6 lg:col-span-2">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <span className="rounded-lg bg-primary/10 p-2.5 text-primary">{theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}</span>
                            <div><h2 className="font-semibold text-foreground">Appearance</h2><p className="mt-1 text-sm text-muted-foreground">Choose the display theme for this browser.</p></div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant={theme === "light" ? "default" : "outline"} aria-pressed={theme === "light"} onClick={() => setTheme("light")}><Sun className="h-4 w-4" /> Light</Button>
                            <Button type="button" variant={theme === "dark" ? "default" : "outline"} aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}><Moon className="h-4 w-4" /> Dark</Button>
                        </div>
                    </div>
                </section>
            </div>
        </section>
    );
}
