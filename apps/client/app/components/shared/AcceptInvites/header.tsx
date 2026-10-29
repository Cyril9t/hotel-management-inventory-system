import React from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
export const CreatePasswordHeader: React.FC = () => {
    return (


        <div>

            <div className="text-center space-y-3">

                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl   border border-brand-gold text-brand-navy shadow-lg mb-1 mt-2 rotate-8">
                    <KeyRound className="w-6 h-7" />
                </div>

                <div>
                    <div className="flex items-center justify-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-brand-success">
                            Create Password
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                        Set a strong security password for your staff account at Brandy Hotel.
                    </p>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-primary border border-primary/20">
                    <ShieldCheck className="w-4 h-4" />
                    <span>256-Bit Encrypted Staff Authentication</span>
                </div>
            </div>
        </div>
    );
}; 