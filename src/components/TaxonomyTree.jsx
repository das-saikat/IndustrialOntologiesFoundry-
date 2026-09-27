import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, Plus, Search, Edit3, Trash2, ArrowUpRight } from 'lucide-react';

export default function TaxonomyTree({ ontology, onSelectEntity, onAddClass, onDeleteClass }) {
  const [expandedNodes, setExpandedNodes] = useState({ bfo_Entity: true, bfo_Continuant: true, bfo_Occurrent: true });
  const [search, setSearch] = useState('');

  const classes = ontology.classes || [];
  const classMap = new Map(classes.map(c => [c.id, c]));

  // Build tree hierarchy children map
  const childrenMap = new Map();
  classes.forEach(c => {
    const parentId = c.superclassId || 'ROOT';
    if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
    childrenMap.get(parentId).push(c);
  });

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (node) => {
    const children = childrenMap.get(node.id) || [];
    const isExpanded = expandedNodes[node.id];
    const hasChildren = children.length > 0;

    // Search filter check
    const matchesSearch = !search || node.label.toLowerCase().includes(search.toLowerCase());
    const childMatches = children.some(c => c.label.toLowerCase().includes(search.toLowerCase()));

    if (search && !matchesSearch && !childMatches) return null;

    let tierBadgeClass = 'badge-domain';
    if (node.bfoTier === 'Top-Level (BFO)') tierBadgeClass = 'badge-bfo';
    else if (node.bfoTier === 'Mid-Level (IOF Core)') tierBadgeClass = 'badge-iof';

    return (
      <div key={node.id} style={{ marginLeft: 16 }}>
        <div 
          onClick={() => onSelectEntity({ ...node, entityType: 'class' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            padding: '0.45rem 0.6rem',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'background 0.15s',
            margin: '2px 0'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {hasChildren ? (
              <span onClick={(e) => toggleExpand(node.id, e)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                {isExpanded ? <ChevronDown size={16} color="var(--accent-cyan)" /> : <ChevronRight size={16} color="var(--text-muted)" />}
              </span>
            ) : (
              <span style={{ width: 16 }} />
            )}
            
            <Folder size={15} color={node.bfoTier === 'Top-Level (BFO)' ? '#a78bfa' : '#00f2fe'} />
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>{node.label}</span>
            <span className={`badge ${tierBadgeClass}`} style={{ fontSize: '0.62rem' }}>{node.bfoTier || 'Class'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button 
              className="btn-secondary" 
              style={{ padding: '0.2rem 0.4rem', fontSize: '0.72rem' }}
              onClick={(e) => { e.stopPropagation(); onAddClass(node.id); }}
              title="Add Subclass"
            >
              <Plus size={12} />
              <span>Subclass</span>
            </button>

            {!node.id.startsWith('bfo_') && (
              <button 
                className="btn-danger" 
                style={{ padding: '0.2rem 0.4rem', fontSize: '0.72rem' }}
                onClick={(e) => { e.stopPropagation(); onDeleteClass(node.id); }}
                title="Delete Class"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: 8, paddingLeft: 4 }}>
            {children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  // Find root nodes (bfo_Entity or unparented)
  const rootNodes = childrenMap.get('ROOT') || [classes.find(c => c.id === 'bfo_Entity')].filter(Boolean);

  return (
    <div style={{ padding: '1.25rem', height: '100%', overflowY: 'auto' }}>
      {/* Top Header & Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Class Taxonomy Hierarchy</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Explore subClassOf inheritance tree anchored to BFO 2020 foundation.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.7rem', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <Search size={14} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search taxonomy..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none', width: 180 }}
            />
          </div>

          <button className="btn-primary" onClick={() => onAddClass(null)}>
            <Plus size={16} />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {/* Tree Container */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        {rootNodes.map(root => renderNode(root))}
      </div>
    </div>
  );
}
