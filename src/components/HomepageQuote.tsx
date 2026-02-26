interface HomepageQuoteProps {
  quoteText: string | null | undefined;
}

export function HomepageQuote({ quoteText }: HomepageQuoteProps) {
  if (!quoteText?.trim()) return null;

  return (
    <div className="mt-[60px]">
      {/* Subtle divider */}
      <div className="w-16 h-px bg-border mx-auto mb-10" />

      <div className="max-w-[750px] mx-auto">
        <div
          className="relative rounded-[20px] shadow-sm px-8 py-8 overflow-hidden"
          style={{ backgroundColor: 'hsl(35, 50%, 95%)' }}
        >
          {/* Decorative quotation marks */}
          <span
            className="absolute top-3 right-8 text-[140px] leading-none font-serif pointer-events-none select-none"
            style={{ opacity: 0.05, color: 'hsl(var(--foreground))' }}
            aria-hidden="true"
          >
            ❝
          </span>
          <span
            className="absolute bottom-[-30px] left-8 text-[140px] leading-none font-serif pointer-events-none select-none"
            style={{ opacity: 0.04, color: 'hsl(var(--foreground))' }}
            aria-hidden="true"
          >
            ❞
          </span>

          <p
            dir="rtl"
            className="relative z-10 text-foreground"
            style={{
              fontSize: '20px',
              lineHeight: 1.9,
              textAlign: 'center',
              whiteSpace: 'pre-line',
              unicodeBidi: 'plaintext',
            }}
          >
            {quoteText}
          </p>
        </div>
      </div>
    </div>
  );
}
