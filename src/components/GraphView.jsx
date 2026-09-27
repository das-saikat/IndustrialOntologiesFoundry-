import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { ZoomIn, ZoomOut, Maximize2, Search, Filter, RefreshCw, Layers, Link as LinkIcon, Plus } from 'lucide-react';

export default function GraphView({ ontology, onSelectEntity, selectedEntity, onAddRelationship }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  
  const [layoutName, setLayoutName] = useState('cose');
  const [searchQuery, setSearchQuery] = useState('');
  const [bfoFilter, setBfoFilter] = useState('ALL');
  const [showIndividuals, setShowIndividuals] = useState(true);

  // Initialize and update Cytoscape instance
  useEffect(() => {
    if (!containerRef.current) return;

    const elements = [];
    const classMap = new Map((ontology.classes || []).map(c => [c.id, c]));

    // 1. Add Class Nodes
    (ontology.classes || []).forEach(cls => {
      // Filter by search
      if (searchQuery && !cls.label.toLowerCase().includes(searchQuery.toLowerCase())) return;
      // Filter by BFO tier
      if (bfoFilter !== 'ALL' && cls.bfoTier !== bfoFilter) return;

      let color = '#38bdf8'; // IOF cyan default
      if (cls.bfoTier === 'Top-Level (BFO)') color = '#a78bfa'; // violet
      else if (cls.bfoTier === 'Domain Level') color = '#34d399'; // emerald

      elements.push({
        data: {
          id: cls.id,
          label: cls.label,
          type: 'class',
          bfoTier: cls.bfoTier || 'Domain Level',
          color
        }
      });

      // Class hierarchy edges (subClassOf)
      if (cls.superclassId && classMap.has(cls.superclassId)) {
        elements.push({
          data: {
            id: `sub_${cls.id}_${cls.superclassId}`,
            source: cls.id,
            target: cls.superclassId,
            label: 'subClassOf',
            type: 'subClassOf'
          }
        });
      }
    });

    // 2. Add Object Property Edges
    (ontology.objectProperties || []).forEach(op => {
      if (op.domainId && op.rangeId) {
        elements.push({
          data: {
            id: op.id,
            source: op.domainId,
            target: op.rangeId,
            label: op.label,
            type: 'objectProperty'
          }
        });
      }
    });

    // 3. Add Individual Nodes and Edges
    if (showIndividuals) {
      (ontology.individuals || []).forEach(ind => {
        if (searchQuery && !ind.label.toLowerCase().includes(searchQuery.toLowerCase())) return;

        elements.push({
          data: {
            id: ind.id,
            label: ind.label,
            type: 'individual',
            color: '#f59e0b' // amber
          }
        });

        // Class instantiation edge
        if (ind.classId) {
          elements.push({
            data: {
              id: `type_${ind.id}_${ind.classId}`,
              source: ind.id,
              target: ind.classId,
              label: 'rdf:type',
              type: 'type'
            }
          });
        }

        // Object property assertions between individuals
        if (ind.relationships) {
          ind.relationships.forEach(rel => {
            elements.push({
              data: {
                id: `rel_${ind.id}_${rel.targetIndividualId}_${rel.propertyId}`,
                source: ind.id,
                target: rel.targetIndividualId,
                label: rel.propertyId,
                type: 'relationship'
              }
            });
          });
        }
      });
    }

    // Destroy existing instance before creating a new one
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'background-color': 'data(color)',
            'color': '#ffffff',
            'font-family': 'Inter, sans-serif',
            'font-size': '11px',
            'font-weight': '600',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-background-opacity': 0.8,
            'text-background-color': '#0b0f19',
            'text-background-padding': '3px 6px',
            'text-background-shape': 'roundrectangle',
            'width': (node) => node.data('type') === 'class' ? 32 : 24,
            'height': (node) => node.data('type') === 'class' ? 32 : 24,
            'border-width': 2,
            'border-color': 'rgba(255,255,255,0.4)',
            'shadow-blur': 12,
            'shadow-color': 'data(color)',
            'shadow-opacity': 0.6
          }
        },
        {
          selector: 'node[type="individual"]',
          style: {
            'shape': 'diamond'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#00f2fe',
            'shadow-blur': 20,
            'shadow-color': '#00f2fe'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': 'rgba(255,255,255,0.2)',
            'target-arrow-color': 'rgba(255,255,255,0.4)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '9px',
            'color': '#9ca3af',
            'text-rotation': 'autorotate',
            'text-background-opacity': 0.8,
            'text-background-color': '#111827',
            'text-background-padding': '2px 4px'
          }
        },
        {
          selector: 'edge[type="subClassOf"]',
          style: {
            'line-style': 'dashed',
            'line-color': '#8b5cf6',
            'target-arrow-color': '#8b5cf6'
          }
        },
        {
          selector: 'edge[type="type"]',
          style: {
            'line-style': 'dotted',
            'line-color': '#f59e0b',
            'target-arrow-color': '#f59e0b'
          }
        }
      ],
      layout: {
        name: layoutName,
        animate: true,
        animationDuration: 500,
        fit: true,
        padding: 40
      }
    });

    cy.on('tap', 'node', (evt) => {
      const nodeData = evt.target.data();
      let entity = null;
      if (nodeData.type === 'class') {
        entity = (ontology.classes || []).find(c => c.id === nodeData.id);
        if (entity) entity = { ...entity, entityType: 'class' };
      } else if (nodeData.type === 'individual') {
        entity = (ontology.individuals || []).find(i => i.id === nodeData.id);
        if (entity) entity = { ...entity, entityType: 'individual' };
      }
      if (entity && onSelectEntity) onSelectEntity(entity);
    });

    cyRef.current = cy;

    return () => {
      if (cyRef.current) cyRef.current.destroy();
    };
  }, [ontology, layoutName, searchQuery, bfoFilter, showIndividuals]);

  const handleZoomIn = () => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current && cyRef.current.fit();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      {/* Top Toolbar */}
      <div className="glass-panel" style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-secondary)', padding: '0.35rem 0.6rem', borderRadius: 6, border: '1px solid var(--border-color)' }}>
          <Search size={14} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search classes or assets..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none', width: 160 }}
          />
        </div>

        {/* BFO Tier Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={14} color="var(--text-muted)" />
          <select 
            value={bfoFilter} 
            onChange={(e) => setBfoFilter(e.target.value)}
            className="input-field" 
            style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', width: 150 }}
          >
            <option value="ALL">All Tiers</option>
            <option value="Top-Level (BFO)">Top-Level (BFO)</option>
            <option value="Mid-Level (IOF Core)">Mid-Level (IOF Core)</option>
            <option value="Domain Level">Domain Level</option>
          </select>
        </div>

        {/* Layout Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Layers size={14} color="var(--text-muted)" />
          <select 
            value={layoutName} 
            onChange={(e) => setLayoutName(e.target.value)}
            className="input-field" 
            style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', width: 130 }}
          >
            <option value="cose">Force-Directed</option>
            <option value="concentric">Concentric</option>
            <option value="breadthfirst">Tree / Hierarchy</option>
            <option value="circle">Circular</option>
            <option value="grid">Grid</option>
          </select>
        </div>

        {/* Toggle Asset Individuals */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={showIndividuals} 
            onChange={(e) => setShowIndividuals(e.target.checked)} 
          />
          <span>Show Assets ({ontology.individuals ? ontology.individuals.length : 0})</span>
        </label>
      </div>

      {/* Floating Zoom & Fit Controls */}
      <div className="glass-panel" style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.35rem' }}>
        <button className="btn-secondary" style={{ padding: '0.4rem' }} onClick={handleZoomIn} title="Zoom In">
          <ZoomIn size={16} />
        </button>
        <button className="btn-secondary" style={{ padding: '0.4rem' }} onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut size={16} />
        </button>
        <button className="btn-secondary" style={{ padding: '0.4rem' }} onClick={handleFit} title="Fit View">
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Legend Badge */}
      <div className="glass-panel" style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10, padding: '0.5rem 0.8rem', display: 'flex', gap: '0.8rem', fontSize: '0.72rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#a78bfa' }} />
          <span>Top-Level BFO</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#38bdf8' }} />
          <span>Mid-Level IOF Core</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399' }} />
          <span>Domain Class</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#f59e0b', transform: 'rotate(45deg)' }} />
          <span>Asset Instance</span>
        </div>
      </div>

      {/* Canvas Container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
