import React from 'react';
import { Check, X } from 'lucide-react';

export interface PasswordCriteria {
    minLength: boolean;
    hasUpperLower: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
}

export interface PasswordRequirementsProps {
    criteria: PasswordCriteria;
}

export const PasswordRequirementsCard: React.FC<PasswordRequirementsProps> = ({ criteria }) => {
    const requirements = [
        { label: 'At least 8 characters long', met: criteria.minLength },
        { label: 'Contains uppercase & lowercase letters', met: criteria.hasUpperLower },
        { label: 'Includes at least one number (0-9)', met: criteria.hasNumber },
        { label: 'Includes at least one special character (!@#$%^&*)', met: criteria.hasSpecial },
    ];

    const totalMet = Object.values(criteria).filter(Boolean).length;
    const strengthPercentage = (totalMet / 4) * 100;

    const getStrengthLabel = () => {
        if (totalMet === 0) return { text: 'Weak', color: 'text-destructive', bar: 'bg-destructive' };
        if (totalMet <= 2) return { text: 'Moderate', color: 'text-brand-gold', bar: 'bg-brand-gold' };
        if (totalMet === 3) return { text: 'Good', color: 'text-brand-navy-light', bar: 'bg-brand-navy-light' };
        return { text: 'Strong Security', color: 'text-brand-success', bar: 'bg-brand-success' };
    };

    const strength = getStrengthLabel();

    return (
        <div className="rounded-xl border border-border/80 bg-secondary/30 p-4 space-y-3">

            <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-muted-foreground">Password Strength:</span>
                    <span className={`font-bold ${strength.color}`}>{strength.text}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${strength.bar}`}
                        style={{ width: `${strengthPercentage}%` }}
                    />
                </div>
            </div>


            <div className="grid grid-cols-1 gap-2 pt-1">
                {requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                        <div
                            className={`w-4 h-4 rounded-full font-bold flex items-center justify-center shrink-0  ${req.met
                                ? 'text-brand-success border border-brand-success'
                                : 'bg-secondary text-muted-foreground border border-border'
                                }`}
                        >
                            {req.met ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" color='#dc4545' />}
                        </div>
                        <span className={req.met ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                            {req.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};