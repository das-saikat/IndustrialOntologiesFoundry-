import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SidebarNav from './components/SidebarNav';
import GraphView from './components/GraphView';
import TaxonomyTree from './components/TaxonomyTree';
import EntityInspector from './components/EntityInspector';
import SparqlQueryStudio from './components/SparqlQueryStudio';
import ValidatorStudio from './components/ValidatorStudio';
import CodeStudio from './components/CodeStudio';
import WorkspaceManager from './components/WorkspaceManager';

import ClassEditorModal from './components/ClassEditorModal';
import PropertyEditorModal from './components/PropertyEditorModal';
import IndividualEditorModal from './components/IndividualEditorModal';

import { 
  getAllOntologiesFromStorage, 
  getOntologyById, 
  saveOntologyToStorage, 
  deleteOntologyFromStorage, 
  getActiveOntologyId 
} from './utils/storage';
import { validateOntology } from './utils/validator';
import { ONTOLOGY_TEMPLATES, BFO_CLASSES } from './data/templates';
import { Plus, Edit3, Trash2, Layers, Table, BookOpen } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeView, setActiveView] = useState('graph');
  const [allOntologies, setAllOntologies] = useState([]);
  const [ontology, setOntology] = useState(ONTOLOGY_TEMPLATES[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);

  // Modals
  const [showClassModal, setShowClassModal] = useState(false);
  const [showPropModal, setShowPropertyModal] = useState(false);
  const [showIndModal, setShowIndModal] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [parentClassId, setParentClassId] = useState(null);

  // Initialize and load saved ontologies
  const loadWorkspace = async () => {
    const list = await getAllOntologiesFromStorage();
    setAllOntologies(list);
    const activeId = getActiveOntologyId();
    const active = await getOntologyById(activeId);
    setOntology(active || list[0]);
  };

  useEffect(() => {
    loadWorkspace();
  }, []);

  // Set theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Auto-save ontology updates to persistent IndexedDB
  const updateOntologyState = async (nextOntology) => {
    setOntology(nextOntology);
    setIsSaving(true);
    await saveOntologyToStorage(nextOntology);
    const updatedList = await getAllOntologiesFromStorage();
    setAllOntologies(updatedList);
    setTimeout(() => setIsSaving(false), 300);
  };

  // Switch Ontology
  const handleSelectOntology = async (id) => {
    const target = await getOntologyById(id);
    if (target) {
      setOntology(target);
      setSelectedEntity(null);
      localStorage.setItem('iof_active_ontology_id', id);
    }
  };

  // Load Template
  const handleLoadTemplate = async (template) => {
    const cloned = JSON.parse(JSON.stringify(template));
    cloned.id = 'ont_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    cloned.name = `${template.name} (Custom Copy)`;
    await updateOntologyState(cloned);
  };

  // Create Blank Ontology
  const handleCreateBlankOntology = async () => {
    const blank = {
      id: 'ont_blank_' + Date.now(),
      name: 'New Custom Industrial Ontology',
      description: 'Custom BFO 2020 aligned ontology for physical and digital assets.',
      version: '1.0.0',
      baseIri: 'https://example.org/ontology/custom/',
      namespaces: {
        bfo: 'http://purl.obolibrary.org/obo/',
        xsd: 'http://www.w3.org/2001/XMLSchema#'
      },
      classes: [...BFO_CLASSES],
      objectProperties: [],
      dataProperties: [],
      individuals: []
    };
    await updateOntologyState(blank);
  };

  // Delete Ontology
  const handleDeleteOntology = async (id) => {
    if (allOntologies.length <= 1) return;
    await deleteOntologyFromStorage(id);
    const remaining = allOntologies.filter(o => o.id !== id);
    setAllOntologies(remaining);
    handleSelectOntology(remaining[0].id);
  };

  // Save / Add Class
  const handleSaveClass = async (classData) => {
    const existing = ontology.classes || [];
    const idx = existing.findIndex(c => c.id === classData.id);
    let nextClasses = [];
    if (idx >= 0) {
      nextClasses = [...existing];
      nextClasses[idx] = classData;
    } else {
      nextClasses = [...existing, classData];
    }
    await updateOntologyState({ ...ontology, classes: nextClasses });
    setShowClassModal(false);
    setEditingItem(null);
    setParentClassId(null);
  };

  // Delete Class
  const handleDeleteClass = async (classId) => {
    if (classId.startsWith('bfo_')) return; // Preserve top-level BFO
    const nextClasses = (ontology.classes || []).filter(c => c.id !== classId);
    await updateOntologyState({ ...ontology, classes: nextClasses });
    if (selectedEntity && selectedEntity.id === classId) setSelectedEntity(null);
  };

  // Save Property
  const handleSaveProperty = async (propData) => {
    if (propData.propertyKind === 'object') {
      const existing = ontology.objectProperties || [];
      const idx = existing.findIndex(p => p.id === propData.id);
      let nextProps = [...existing];
      if (idx >= 0) nextProps[idx] = propData;
      else nextProps.push(propData);
      await updateOntologyState({ ...ontology, objectProperties: nextProps });
    } else {
      const existing = ontology.dataProperties || [];
      const idx = existing.findIndex(p => p.id === propData.id);
      let nextProps = [...existing];
      if (idx >= 0) nextProps[idx] = propData;
      else nextProps.push(propData);
      await updateOntologyState({ ...ontology, dataProperties: nextProps });
    }
    setShowPropertyModal(false);
    setEditingItem(null);
  };

  // Save Individual
  const handleSaveIndividual = async (indData) => {
    const existing = ontology.individuals || [];
    const idx = existing.findIndex(i => i.id === indData.id);
    let nextInds = [...existing];
    if (idx >= 0) nextInds[idx] = indData;
    else nextInds.push(indData);
    await updateOntologyState({ ...ontology, individuals: nextInds });
    setShowIndModal(false);
    setEditingItem(null);
  };

  // Delete Entity
  const handleDeleteEntity = async (entity) => {
    if (entity.entityType === 'class' || (ontology.classes || []).some(c => c.id === entity.id)) {
      handleDeleteClass(entity.id);
    } else if (entity.entityType === 'individual' || (ontology.individuals || []).some(i => i.id === entity.id)) {
      const nextInds = (ontology.individuals || []).filter(i => i.id !== entity.id);
      await updateOntologyState({ ...ontology, individuals: nextInds });
      setSelectedEntity(null);
    }
  };

  const validation = validateOntology(ontology);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Header */}
      <Header 
        ontology={ontology}
        allOntologies={allOntologies}
        onSelectOntology={handleSelectOntology}
        onLoadTemplate={handleLoadTemplate}
        isSaving={isSaving}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenCreateModal={() => setShowQuickCreate(true)}
      />

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 61px)', overflow: 'hidden' }}>
        <SidebarNav 
          activeView={activeView}
          onChangeView={setActiveView}
          counts={{
            classes: (ontology.classes || []).length,
            individuals: (ontology.individuals || []).length
          }}
          healthScore={validation.score}
        />

        {/* View Router */}
        <main style={{ flex: 1, height: '100%', overflow: 'hidden', position: 'relative' }}>
          {activeView === 'graph' && (
            <GraphView 
              ontology={ontology}
              onSelectEntity={setSelectedEntity}
              selectedEntity={selectedEntity}
            />
          )}

          {activeView === 'tree' && (
            <TaxonomyTree 
              ontology={ontology}
              onSelectEntity={setSelectedEntity}
              onAddClass={(parentId) => {
                setParentClassId(parentId);
                setEditingItem(null);
                setShowClassModal(true);
              }}
              onDeleteClass={handleDeleteClass}
            />
          )}

          {activeView === 'entities' && (
            <div style={{ padding: '1.25rem', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Entities & Asset Inventory</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Structured table list of classes, relationship object properties, data properties, and instantiated assets.</p>
              </div>

              {/* Classes Table */}
              <div className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>CLASSES ({(ontology.classes || []).length})</div>
                  <button className="btn-primary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => { setEditingItem(null); setShowClassModal(true); }}>
                    <Plus size={12} /> Add Class
                  </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem' }}>Label</th>
                      <th style={{ padding: '0.5rem' }}>BFO Tier</th>
                      <th style={{ padding: '0.5rem' }}>Superclass</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(ontology.classes || []).map(cls => (
                      <tr key={cls.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.5rem', fontWeight: 600 }}>{cls.label}</td>
                        <td style={{ padding: '0.5rem' }}><span className="badge badge-iof" style={{ fontSize: '0.65rem' }}>{cls.bfoTier}</span></td>
                        <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>{cls.superclassId || 'None'}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                          <button className="btn-secondary" style={{ padding: '0.2rem 0.4rem' }} onClick={() => { setEditingItem(cls); setShowClassModal(true); }}><Edit3 size={12} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Individuals / Asset Table */}
              <div className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-amber)' }}>ASSET INDIVIDUALS ({(ontology.individuals || []).length})</div>
                  <button className="btn-primary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => { setEditingItem(null); setShowIndModal(true); }}>
                    <Plus size={12} /> Instantiate Asset
                  </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem' }}>Asset Name</th>
                      <th style={{ padding: '0.5rem' }}>Class Type</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(ontology.individuals || []).map(ind => (
                      <tr key={ind.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--accent-amber)' }}>{ind.label}</td>
                        <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>{ind.classId}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                          <button className="btn-secondary" style={{ padding: '0.2rem 0.4rem' }} onClick={() => { setEditingItem(ind); setShowIndModal(true); }}><Edit3 size={12} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'sparql' && <SparqlQueryStudio ontology={ontology} />}

          {activeView === 'validator' && (
            <ValidatorStudio 
              ontology={ontology} 
              onSelectEntity={(ent) => { setSelectedEntity(ent); setActiveView('graph'); }} 
            />
          )}

          {activeView === 'code' && <CodeStudio ontology={ontology} />}

          {activeView === 'workspace' && (
            <WorkspaceManager 
              allOntologies={allOntologies}
              activeOntologyId={ontology.id}
              onSelectOntology={handleSelectOntology}
              onCreateNewOntology={handleCreateBlankOntology}
              onDeleteOntology={handleDeleteOntology}
              onReload={loadWorkspace}
            />
          )}
        </main>

        {/* Entity Inspector Side Pane */}
        {selectedEntity && (
          <EntityInspector 
            entity={selectedEntity}
            ontology={ontology}
            onClose={() => setSelectedEntity(null)}
            onEdit={(ent) => {
              setEditingItem(ent);
              if (ent.entityType === 'individual' || (ontology.individuals || []).some(i => i.id === ent.id)) {
                setShowIndModal(true);
              } else {
                setShowClassModal(true);
              }
            }}
            onDelete={handleDeleteEntity}
          />
        )}
      </div>

      {/* Quick Create Choice Modal */}
      {showQuickCreate && (
        <div className="modal-overlay" onClick={() => setShowQuickCreate(false)}>
          <div className="glass-panel" style={{ width: 420, padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>Create New Entity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn-secondary" style={{ padding: '0.75rem', justifyContent: 'flex-start' }} onClick={() => { setShowQuickCreate(false); setEditingItem(null); setShowClassModal(true); }}>
                <BookOpen size={18} color="var(--accent-cyan)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>Create New Class</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Define a physical machine, component, or maintenance concept</div>
                </div>
              </button>

              <button className="btn-secondary" style={{ padding: '0.75rem', justifyContent: 'flex-start' }} onClick={() => { setShowQuickCreate(false); setEditingItem(null); setShowPropertyModal(true); }}>
                <Layers size={18} color="var(--accent-violet)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>Create Relationship Property</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Define object relationships (e.g. hasPart, isLocatedIn) or data properties</div>
                </div>
              </button>

              <button className="btn-secondary" style={{ padding: '0.75rem', justifyContent: 'flex-start' }} onClick={() => { setShowQuickCreate(false); setEditingItem(null); setShowIndModal(true); }}>
                <Table size={18} color="var(--accent-amber)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>Instantiate Asset Individual</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Add specific physical asset instance with serial numbers and values</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showClassModal && (
        <ClassEditorModal 
          initialClass={editingItem}
          parentClassId={parentClassId}
          ontology={ontology}
          onClose={() => { setShowClassModal(false); setEditingItem(null); setParentClassId(null); }}
          onSave={handleSaveClass}
        />
      )}

      {showPropModal && (
        <PropertyEditorModal 
          initialProperty={editingItem}
          ontology={ontology}
          onClose={() => { setShowPropertyModal(false); setEditingItem(null); }}
          onSave={handleSaveProperty}
        />
      )}

      {showIndModal && (
        <IndividualEditorModal 
          initialIndividual={editingItem}
          ontology={ontology}
          onClose={() => { setShowIndModal(false); setEditingItem(null); }}
          onSave={handleSaveIndividual}
        />
      )}
    </div>
  );
}
