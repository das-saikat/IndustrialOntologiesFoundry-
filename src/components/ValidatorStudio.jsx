import React from 'react';
import { validateOntology } from '../utils/validator';
import { ShieldCheck, AlertTriangle, AlertCircle, Info, CheckCircle2, RefreshCw } from 'lucide-react';

export default function ValidatorStudio({ ontology, onSelectEntity }) {
  const report = validateOntology(ontology);
  const { score, issues, summary } = report;

  return (
    <div style={{ padding: '1.25rem', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>IOF & BFO Quality Engine</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Automated compliance rules checking for BFO alignment, missing definitions, orphan classes, and domain/range inconsistencies.</p>
      </div>

      {/* Top Health Score Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ position: 'relative', width: 72, height: 72, borderRadius: '50%', background: score > 80 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', border: `3px solid ${score > 80 ? '#10b981' : '#f59e0b'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.4rem', color: score > 80 ? '#10b981' : '#f59e0b' }}>
            {score}%
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {score >= 90 ? 'Excellent Compliance' : score >= 75 ? 'Good Alignment' : 'Issues Detected'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {summary.bfoAlignedClasses} of {summary.totalClasses} classes aligned with Basic Formal Ontology (BFO) top-level.
            </div>
          </div>
        </div>

        {/* Counts Grid */}
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem 1rem', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CLASSES</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{summary.totalClasses}</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem 1rem', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>RELATIONS</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-violet)' }}>{summary.totalObjectProps + summary.totalDataProps}</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem 1rem', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ERRORS</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-rose)' }}>{summary.errorsCount}</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem 1rem', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>WARNINGS</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-amber)' }}>{summary.warningsCount}</div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="glass-panel" style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          VALIDATION REPORT ({issues.length} FINDINGS)
        </div>

        {issues.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', color: 'var(--accent-emerald)', gap: '0.5rem' }}>
            <CheckCircle2 size={36} />
            <span style={{ fontWeight: 600 }}>Zero quality issues found! Ontology is fully compliant.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {issues.map((issue, idx) => {
              let Icon = Info;
              let iconColor = 'var(--accent-cyan)';
              let bg = 'rgba(0, 242, 254, 0.05)';
              let border = 'rgba(0, 242, 254, 0.2)';

              if (issue.severity === 'error') {
                Icon = AlertCircle;
                iconColor = 'var(--accent-rose)';
                bg = 'rgba(244, 63, 94, 0.08)';
                border = 'rgba(244, 63, 94, 0.25)';
              } else if (issue.severity === 'warning') {
                Icon = AlertTriangle;
                iconColor = 'var(--accent-amber)';
                bg = 'rgba(245, 158, 11, 0.08)';
                border = 'rgba(245, 158, 11, 0.25)';
              }

              return (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justify: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 8,
                    background: bg,
                    border: `1px solid ${border}`,
                    fontSize: '0.83rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <Icon size={18} color={iconColor} style={{ marginTop: 2, shrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        [{issue.code}] {issue.entityLabel ? `Entity: ${issue.entityLabel}` : ''}
                      </div>
                      <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{issue.message}</div>
                    </div>
                  </div>

                  {issue.entityId && (
                    <button 
                      className="btn-secondary"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                      onClick={() => {
                        const target = (ontology.classes || []).find(c => c.id === issue.entityId) ||
                                       (ontology.individuals || []).find(i => i.id === issue.entityId);
                        if (target && onSelectEntity) onSelectEntity(target);
                      }}
                    >
                      Inspect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
