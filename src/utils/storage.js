import { openDB } from 'idb';
import { ONTOLOGY_TEMPLATES } from '../data/templates';

const DB_NAME = 'IndustrialOntologyStudio_DB';
const DB_VERSION = 1;
const STORE_NAME = 'ontologies';
const ACTIVE_ONTOLOGY_KEY = 'iof_active_ontology_id';

/**
 * Initialize IndexedDB instance
 */
async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

/**
 * Save ontology to IndexedDB and update active ID in localStorage
 */
export async function saveOntologyToStorage(ontology) {
  try {
    const db = await getDB();
    const updatedOntology = {
      ...ontology,
      updatedAt: new Date().toISOString()
    };
    await db.put(STORE_NAME, updatedOntology);
    localStorage.setItem(ACTIVE_ONTOLOGY_KEY, ontology.id);
    return updatedOntology;
  } catch (err) {
    console.error('Error saving ontology to IndexedDB:', err);
    // Fallback to localStorage for small datasets
    try {
      localStorage.setItem(`iof_ont_${ontology.id}`, JSON.stringify(ontology));
      localStorage.setItem(ACTIVE_ONTOLOGY_KEY, ontology.id);
    } catch (e) {
      console.error('LocalStorage fallback error:', e);
    }
    return ontology;
  }
}

/**
 * Load all stored ontologies from IndexedDB
 */
export async function getAllOntologiesFromStorage() {
  try {
    const db = await getDB();
    const list = await db.getAll(STORE_NAME);
    if (list && list.length > 0) {
      return list;
    }
  } catch (err) {
    console.warn('Could not read from IndexedDB, checking default templates...', err);
  }

  // Seed default templates if empty
  const defaultList = [...ONTOLOGY_TEMPLATES];
  for (const t of defaultList) {
    await saveOntologyToStorage(t);
  }
  return defaultList;
}

/**
 * Get active ontology ID
 */
export function getActiveOntologyId() {
  return localStorage.getItem(ACTIVE_ONTOLOGY_KEY) || 'iof-core-maintenance';
}

/**
 * Load specific ontology by ID
 */
export async function getOntologyById(id) {
  try {
    const db = await getDB();
    const ontology = await db.get(STORE_NAME, id);
    if (ontology) return ontology;
  } catch (err) {
    console.warn(`Ontology ${id} not found in IndexedDB`, err);
  }

  // Check templates
  const template = ONTOLOGY_TEMPLATES.find(t => t.id === id);
  if (template) return template;

  return ONTOLOGY_TEMPLATES[0];
}

/**
 * Delete ontology by ID
 */
export async function deleteOntologyFromStorage(id) {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
    localStorage.removeItem(`iof_ont_${id}`);
  } catch (err) {
    console.error('Error deleting ontology:', err);
  }
}

/**
 * Export full workspace backup JSON
 */
export async function exportWorkspaceBackup() {
  const ontologies = await getAllOntologiesFromStorage();
  const backup = {
    app: 'Industrial Ontology Studio',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    ontologies
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `industrial_ontologies_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import workspace backup JSON
 */
export async function importWorkspaceBackup(jsonContent) {
  try {
    const data = JSON.parse(jsonContent);
    let listToImport = [];

    if (data.ontologies && Array.isArray(data.ontologies)) {
      listToImport = data.ontologies;
    } else if (data.id && data.classes) {
      listToImport = [data]; // Single ontology JSON
    }

    if (listToImport.length === 0) {
      throw new Error('No valid ontology data found in imported JSON file.');
    }

    for (const ont of listToImport) {
      if (!ont.id) ont.id = 'imported_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      await saveOntologyToStorage(ont);
    }

    return listToImport[0].id;
  } catch (err) {
    console.error('Error importing backup JSON:', err);
    throw err;
  }
}
