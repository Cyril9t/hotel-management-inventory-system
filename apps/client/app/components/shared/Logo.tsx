function Logo({ variant = 'default', className = '', logoColor = "#142234", textColor = "#d99a28" }) {

    const isHero = variant === "hero";

    return (
        <div className={`flex ${isHero ? "flex-col items-center text-center " : "items-center gap-3"} ${className}`}>

            <div className={`relative flex items-center justify-center rounded-xl bg-linear-to-br from-background pb-1 shadow-lg shadow-brand-gold/20 ${isHero ? "w-16 h-16 mb-4" : "w-10 h-10 bg-amber-red"}`}>

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
                    <defs>
                        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stop-color="#FFD16A" />
                            <stop offset="48%" stop-color="#F5A623" />
                            <stop offset="100%" stop-color="#D88917" />
                        </linearGradient>
                    </defs>
                    <path fill="url(#gold)"
                        d="M25 14H66C88 14 98 25 98 42
           C98 54 92 61 82 65
           C95 69 102 78 102 91
           C102 109 88 116 66 116H25Z"/>
                    <path fill={`${logoColor ? logoColor : "var(--brand-gold)"}`}
                        d="M49 27H65C77 27 84 32 84 43
           C84 53 77 58 65 58H49Z"/>
                    <path fill={`${logoColor ? logoColor : "var(--brand-gold)"}`}
                        d="M49 71H66C80 71 88 76 88 88
           C88 99 80 103 66 103H49Z"/>
                </svg>

            </div>


            <div>
                <h1 className={` font-bold tracking-wider font-serif ${isHero ? `text-2xl text-[${textColor}]` : `text-[${textColor}]`} ${textColor ? `text-[${textColor}]` : "text-brand-navy"}`}>
                    BRANDY <span className="font-light tracking-widest text-brand-gold">HOTEL</span>
                </h1>
                {isHero && (
                    <p className="text-xs uppercase tracking-[0.25em] text-brand-gold-light mt-1 font-medium">
                        Manage. Operate. Grow.
                    </p>
                )}
            </div>
        </div>
    );
}

export default Logo;