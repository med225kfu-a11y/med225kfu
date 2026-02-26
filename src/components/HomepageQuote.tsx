interface HomepageQuoteProps {
  quoteText: string | null | undefined;
}

export function HomepageQuote({ quoteText }: HomepageQuoteProps) {
  if (!quoteText?.trim()) return null;

  return (
    <div className="mt-8 max-w-3xl mx-auto">
      <div
        className="relative rounded-2xl shadow-sm px-8 py-7 overflow-hidden"
        style={{ backgroundColor: 'hsl(35, 50%, 95%)' }}
      >
        {/* Decorative quotation mark */}
        <span
          className="absolute top-2 right-6 text-[120px] leading-none font-serif pointer-events-none select-none"
          style={{ opacity: 0.06, color: 'hsl(var(--foreground))' }}
          aria-hidden="true"
        >
          ❝
        </span>

        <p
          dir="rtl"
          className="relative z-10 text-foreground"
          style={{
            fontSize: '20px',
            lineHeight: 2,
            textAlign: 'center',
            whiteSpace: 'pre-line',
            unicodeBidi: 'plaintext',
          }}
        >
          {quoteText}
        </p>
      </div>
    </div>
  );
}
