import React from 'react';
import { 
  Network, GitFork, Table, Terminal, ShieldCheck, FileCode, FolderKanban, Info 
} from 'lucide-react';

export default function SidebarNav({ activeView, onChangeView, counts, healthScore }) {
  const navItems = [
    { id: 'graph', label: 'Knowledge Graph', icon: Network, badge: counts.classes },
    { id: 'tree', label: 'Class Taxonomy', icon: GitFork, badge: counts.classes },
    { id: 'entities', label: 'Entities & Assets', icon: Table, badge: counts.individuals },
    { id: 'sparql', label: 'SPARQL Query', icon: Terminal },
    { id: 'validator', label: 'Health & Rules', icon: ShieldCheck, badge: `${healthScore}%`, badgeColor: healthScore > 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)' },
    { id: 'code', label: 'Code Studio', icon: FileCode },
    { id: 'workspace', label: 'Workspace Manager', icon: FolderKanban }
  ];

  return (
    <aside className="glass-panel" style={{ width: 240, height: 'calc(100vh - 61px)', borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderBottom: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem 0.75rem', shrink: 0 }}>
      {/* Navigation Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', padding: '0 0.5rem 0.4rem 0.5rem', letterSpacing: '0.05em' }}>
          VIEWS & TOOLS
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                padding: '0.65rem 0.8rem',
                borderRadius: 8,
                background: isActive ? 'linear-gradient(90deg, rgba(0,242,254,0.15), rgba(139,92,246,0.15))' : 'transparent',
                border: isActive ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid transparent',
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-main)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Icon size={18} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: 99, background: 'rgba(255,255,255,0.08)', color: item.badgeColor || 'var(--text-muted)' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="glass-panel" style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: 4 }}>
          <Info size={14} />
          <span>IOF Architecture</span>
        </div>
        <p style={{ lineHeight: 1.3 }}>
          Built on <strong>BFO 2020</strong> top-level ontology and <strong>IOF Core</strong> mid-level interoperability.
        </p>
      </div>
    </aside>
  );
}
