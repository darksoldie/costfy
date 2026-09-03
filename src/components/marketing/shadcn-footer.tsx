import { Link } from "@tanstack/react-router";
import { CostfyLogo } from "@/components/brand/costfy-mark";

export function ShadcnFooter() {
  return (
    <footer className="border-t border-border bg-card/60 py-12 sm:py-16 text-[13px] text-muted-foreground">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <CostfyLogo markSize={24} />
            <p className="text-[13px] text-muted-foreground max-w-sm leading-relaxed">
              Intelligent Operating System for Digital Businesses.
              Centralize marketing, vendas, financeiro, DRE e inteligência executiva com segurança corporativa.
            </p>
            <div className="text-[12px] text-subtle-foreground">
              Infraestrutura oficial de pagamentos: <strong>Mercado Pago</strong>
            </div>
          </div>

          {/* Col 1: Produto */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-[12px] uppercase tracking-wider">
              Produto
            </h4>
            <ul className="space-y-2">
              <li><Link to="/product" className="hover:text-foreground transition-colors">Visão Geral</Link></li>
              <li><Link to="/solutions" className="hover:text-foreground transition-colors">Soluções</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground transition-colors">Planos & Preços</Link></li>
              <li><Link to="/resources" className="hover:text-foreground transition-colors">Recursos</Link></li>
            </ul>
          </div>

          {/* Col 2: Operação */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-[12px] uppercase tracking-wider">
              Módulos
            </h4>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Cockpit Executivo</Link></li>
              <li><Link to="/finance" className="hover:text-foreground transition-colors">Financeiro & DRE</Link></li>
              <li><Link to="/tracking" className="hover:text-foreground transition-colors">Tracking First-Party</Link></li>
              <li><Link to="/brain" className="hover:text-foreground transition-colors">Brain Copilot</Link></li>
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-[12px] uppercase tracking-wider">
              Segurança
            </h4>
            <ul className="space-y-2">
              <li><span className="text-muted-foreground">Isolamento RLS</span></li>
              <li><span className="text-muted-foreground">LGPD Compliant</span></li>
              <li><span className="text-muted-foreground">Trilha de Auditoria</span></li>
              <li><span className="text-muted-foreground">Status do Sistema</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px]">
          <div>
            © {new Date().getFullYear()} Costfy Inc. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-6">
            <span>Privacidade</span>
            <span>Termos de Uso</span>
            <span>Segurança</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
