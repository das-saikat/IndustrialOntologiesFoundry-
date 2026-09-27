import React from 'react';
import { X, Edit3, Trash2, Tag, BookOpen, Layers, Link as LinkIcon, Hash, Globe } from 'lucide-react';

export default function EntityInspector({ entity, ontology, onClose, onEdit, onDelete }) {
  if (!entity) return null;

  const classMap = new Map((ontology.classes || []).map(c => [c.id, c]));
  const propMap = new Map((ontology.objectProperties || []).map(p => [p.id, p]));
  const indMap = new Map((ontology.individuals || []).map(i => [i.id, i]));

  return (
    <div className="glass-panel" style={{ width: 340, height: '100%', borderTop: 'none', borderRight: 'none', borderBottom: 'none', padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', shrink: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span className="badge badge-iof" style={{ marginBottom: 4 }}>
            {entity.entityType ? entity.entityType.toUpperCase() : 'ENTITY'}
          </span>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>{entity.label}</h3>
        </div>
        <button className="btn-secondary" style={{ padding: '0.3rem' }} onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      {/* IRI */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.6rem 0.8rem', borderRadius: 8, fontSize: '0.78rem', wordBreak: 'break-all' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', marginBottom: 2 }}>
          <Globe size={12} />
          <span>IRI / URI</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{entity.iri}</div>
      </div>

      {/* Superclass / Class Type */}
      {entity.superclassId && classMap.has(entity.superclassId) && (
        <div style={{ fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Superclass: </span>
          <strong style={{ color: 'var(--accent-violet)' }}>{classMap.get(entity.superclassId).label}</strong>
        </div>
      )}

      {entity.classId && classMap.has(entity.classId) && (
        <div style={{ fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Type Class: </span>
          <strong style={{ color: 'var(--accent-amber)' }}>{classMap.get(entity.classId).label}</strong>
        </div>
      )}

      {/* Definition */}
      <div style={{ fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', marginBottom: 4 }}>
          <BookOpen size={14} />
          <span style={{ fontWeight: 600 }}>Definition & Meaning</span>
        </div>
        <p style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: 8, fontSize: '0.82rem', lineHeight: 1.4, color: 'var(--text-main)' }}>
          {entity.definition || 'No description provided.'}
        </p>
      </div>

      {/* Property Assertions / Values for Individuals */}
      {entity.propertyValues && entity.propertyValues.length > 0 && (
        <div style={{ fontSize: '0.85rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>DATA PROPERTY VALUES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {entity.propertyValues.map((pv, idx) => {
              const dp = (ontology.dataProperties || []).find(p => p.id === pv.propertyId);
              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '0.4rem 0.6rem', borderRadius: 6, fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{dp ? dp.label : pv.propertyId}:</span>
                  <strong style={{ color: 'var(--accent-cyan)' }}>{String(pv.value)}</strong>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Relationship Links */}
      {entity.relationships && entity.relationships.length > 0 && (
        <div style={{ fontSize: '0.85rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>RELATIONSHIP LINKS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {entity.relationships.map((rel, idx) => {
              const op = propMap.get(rel.propertyId);
              const target = indMap.get(rel.targetIndividualId);
              return (
                <div key={idx} style={{ background: 'var(--bg-secondary)', padding: '0.4rem 0.6rem', borderRadius: 6, fontSize: '0.8rem' }}>
                  <div style={{ color: 'var(--accent-violet)', fontSize: '0.72rem' }}>{op ? op.label : rel.propertyId}</div>
                  <strong style={{ color: 'var(--text-main)' }}>{target ? target.label : rel.targetIndividualId}</strong>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ marginTop: 'auto', display: 'flex', gap: '0.6rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onEdit(entity)}>
          <Edit3 size={14} />
          <span>Edit</span>
        </button>
        {!entity.id.startsWith('bfo_') && (
          <button className="btn-danger" style={{ justifyContent: 'center' }} onClick={() => onDelete(entity)}>
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
