import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Zap, CreditCard, Sparkles } from "lucide-react";
import { buttonClass } from "@/lib/ui";
import { DotPattern } from "@/components/ui/dot-pattern";

export function ShadcnCTA() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-b from-background via-secondary/30 to-background border-t border-border/60">
      <DotPattern className="opacity-50" size="md" fadeStyle="ellipse" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[12.5px] font-medium text-primary mb-6">
          <Sparkles className="size-3.5 fill-current" />
          <span>Comece em menos de 2 minutos</span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground text-balance">
          Pronto para assumir o controle definitivo do seu
          <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Negócio Digital?
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed text-balance">
          Junte-se a dezenas de gestores e empreendedores que escalam com números auditados e lucro real. 14 dias de teste completo sem cadastrar cartão.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className={buttonClass("primary", "lg", "w-full sm:w-auto gap-2 px-8 text-[15px] font-semibold shadow-[var(--shadow-raised)]")}
          >
            <span>Iniciar Teste Gratuito de 14 Dias</span>
            <ArrowRight className="size-4" />
          </Link>

          <Link
            to="/pricing"
            className={buttonClass("outline", "lg", "w-full sm:w-auto gap-2 px-8 text-[15px] font-medium bg-background")}
          >
            <CreditCard className="size-4 text-primary" />
            <span>Ver Planos & Preços Oficiais</span>
          </Link>
        </div>

        {/* Trust Guarantees */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[12px] text-muted-foreground border-t border-border/80 pt-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-success" />
            <span>Sem necessidade de cartão para testar</span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            <span>Ativação e integração instantânea</span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-primary" />
            <span>Processamento Oficial Mercado Pago</span>
          </div>
        </div>
      </div>
    </section>
  );
}
