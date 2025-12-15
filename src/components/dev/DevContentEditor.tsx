import { useState, useEffect } from 'react';
import { Edit3, Copy, Check, X, RotateCcw } from 'lucide-react';

/**
 * Dev-Only Content Editor
 *
 * A lightweight inline content editor for local development.
 * Allows editing text content directly on the page without touching code.
 *
 * Features:
 * - Toggle edit mode with floating button
 * - Click any text to edit it inline
 * - Copy new text to clipboard
 * - localStorage persistence (survives page refresh)
 * - Only renders in development mode
 *
 * Usage:
 * 1. Click "Edit Mode" button
 * 2. Click any text element
 * 3. Edit the text
 * 4. Press Escape or click outside to save
 * 5. Click copy icon to copy new text
 * 6. Paste into your source code
 */

interface EditedElement {
  path: string;
  originalText: string;
  newText: string;
  element: HTMLElement;
  savedToFile?: boolean;
  saveError?: string;
}

const STORAGE_KEY = 'devContentEdits';

export function DevContentEditor() {
  // Only render in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  const [editMode, setEditMode] = useState(false);
  const [editedElements, setEditedElements] = useState<Map<string, EditedElement>>(new Map());
  const [currentlyEditing, setCurrentlyEditing] = useState<HTMLElement | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  // Get element identifier (path or data-edit-id)
  const getElementPath = (element: HTMLElement): string => {
    // Check for custom data-edit-id first
    if (element.dataset.editId) {
      return element.dataset.editId;
    }

    // Generate path based on tag name and position
    const path: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current !== document.body) {
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children);
        const index = siblings.indexOf(current);
        path.unshift(`${current.tagName.toLowerCase()}:${index}`);
      }
      current = parent;
    }

    return path.join('>');
  };

  // Save edits to localStorage
  const saveToLocalStorage = (edits: Map<string, EditedElement>) => {
    const currentPath = window.location.pathname;
    const stored = localStorage.getItem(STORAGE_KEY);
    const allEdits = stored ? JSON.parse(stored) : {};

    const pageEdits: Record<string, { originalText: string; newText: string }> = {};
    edits.forEach((edit, path) => {
      pageEdits[path] = {
        originalText: edit.originalText,
        newText: edit.newText
      };
    });

    allEdits[currentPath] = pageEdits;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allEdits));
  };

  // Load edits from localStorage
  const loadFromLocalStorage = (): Map<string, EditedElement> => {
    const currentPath = window.location.pathname;
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return new Map();

    const allEdits = JSON.parse(stored);
    const pageEdits = allEdits[currentPath];

    if (!pageEdits) return new Map();

    const editsMap = new Map<string, EditedElement>();

    Object.entries(pageEdits).forEach(([path, data]: [string, any]) => {
      // Try to find the element
      const element = findElementByPath(path);
      if (element) {
        editsMap.set(path, {
          path,
          originalText: data.originalText,
          newText: data.newText,
          element
        });
        // Apply the saved edit
        element.textContent = data.newText;
      }
    });

    return editsMap;
  };

  // Find element by path
  const findElementByPath = (path: string): HTMLElement | null => {
    // Check for data-edit-id first
    const byId = document.querySelector(`[data-edit-id="${path}"]`) as HTMLElement;
    if (byId) return byId;

    // Parse path and find element
    const parts = path.split('>');
    let current: Element = document.body;

    for (const part of parts) {
      const [tag, indexStr] = part.split(':');
      const index = parseInt(indexStr, 10);
      const children = Array.from(current.children).filter(
        child => child.tagName.toLowerCase() === tag
      );

      if (index >= children.length) return null;
      current = children[index];
    }

    return current as HTMLElement;
  };

  // Load saved edits on mount
  useEffect(() => {
    const savedEdits = loadFromLocalStorage();
    setEditedElements(savedEdits);
  }, []);

  // Handle clicking on text elements
  const handleElementClick = (e: MouseEvent) => {
    if (!editMode) return;

    const target = e.target as HTMLElement;

    // Only allow editing text-containing elements
    const isTextElement = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'DIV', 'A', 'LI', 'BUTTON'].includes(target.tagName);
    if (!isTextElement) return;

    // Don't edit if clicking the editor itself
    if (target.closest('.dev-content-editor')) return;

    e.preventDefault();
    e.stopPropagation();

    // If already editing this element, skip
    if (currentlyEditing === target) return;

    // Save previous edit if any
    if (currentlyEditing) {
      saveCurrentEdit();
    }

    // Start editing
    const path = getElementPath(target);
    const originalText = editedElements.get(path)?.originalText || target.textContent || '';

    target.contentEditable = 'true';
    target.focus();
    target.style.outline = '2px solid #22c55e';
    target.style.outlineOffset = '2px';

    setCurrentlyEditing(target);

    // If not already in edited elements, add it
    if (!editedElements.has(path)) {
      const newEdits = new Map(editedElements);
      newEdits.set(path, {
        path,
        originalText,
        newText: originalText,
        element: target
      });
      setEditedElements(newEdits);
    }
  };

  // Map route to likely source file
  const getSourceFileForRoute = (pathname: string): string => {
    const routeMap: Record<string, string> = {
      '/': 'src/pages/HomePage.tsx',
      '/camps': 'src/pages/CampsPage.tsx',
      '/for-parents': 'src/pages/ForParentsPage.tsx',
      '/for-schools': 'src/pages/ForSchoolsPage.tsx',
      '/partners': 'src/pages/PartnersPage.tsx',
      '/talk-to-advisor': 'src/pages/TalkToAdvisorPage.tsx',
    };

    return routeMap[pathname] || 'src/pages/HomePage.tsx';
  };

  // Save edit to source file with retry logic
  const saveToSourceFile = async (originalText: string, newText: string) => {
    try {
      const filePath = getSourceFileForRoute(window.location.pathname);

      // First attempt: Try the mapped file
      let response = await fetch('/api/dev-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath,
          oldText: originalText,
          newText,
          elementType: currentlyEditing?.tagName || 'unknown',
          searchInMultipleFiles: false
        })
      });

      let result = await response.json();

      // Second attempt: If first failed, try with multi-file search
      if (!response.ok && response.status === 404) {
        console.log('[DevEditor] Primary file failed, trying multi-file search...');

        response = await fetch('/api/dev-edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filePath,
            oldText: originalText,
            newText,
            elementType: currentlyEditing?.tagName || 'unknown',
            searchInMultipleFiles: true
          })
        });

        result = await response.json();
      }

      if (!response.ok) {
        throw new Error(result.error || result.hint || 'Failed to save');
      }

      console.log('[DevEditor] Saved to source file:', result);
      return { success: true, message: result.message };
    } catch (error: any) {
      console.error('[DevEditor] Failed to save to source:', error);
      return { success: false, error: error.message };
    }
  };

  // Save current edit
  const saveCurrentEdit = async () => {
    if (!currentlyEditing) return;

    const path = getElementPath(currentlyEditing);
    const newText = currentlyEditing.textContent || '';

    currentlyEditing.contentEditable = 'false';
    currentlyEditing.style.outline = '';
    currentlyEditing.style.outlineOffset = '';

    const newEdits = new Map(editedElements);
    const existing = newEdits.get(path);

    if (existing) {
      existing.newText = newText;

      // Save to source file automatically with retry logic
      try {
        const result = await saveToSourceFile(existing.originalText, newText);
        existing.savedToFile = result.success;
        if (!result.success) {
          existing.saveError = result.error || 'Failed to save to file';
        } else {
          existing.saveError = undefined;
        }
      } catch (error: any) {
        existing.savedToFile = false;
        existing.saveError = error.message;
      }

      newEdits.set(path, existing);
      setEditedElements(newEdits);
      saveToLocalStorage(newEdits);
    }

    setCurrentlyEditing(null);
  };

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!currentlyEditing) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      saveCurrentEdit();
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode && currentlyEditing) {
      saveCurrentEdit();
    }
    setEditMode(!editMode);
  };

  // Copy text to clipboard
  const copyToClipboard = async (path: string) => {
    const edit = editedElements.get(path);
    if (!edit) return;

    try {
      await navigator.clipboard.writeText(edit.newText);
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Clear all edits
  const clearAllEdits = () => {
    if (!confirm('Clear all edits? This will reload the page.')) return;

    const currentPath = window.location.pathname;
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const allEdits = JSON.parse(stored);
      delete allEdits[currentPath];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allEdits));
    }

    window.location.reload();
  };

  // Add/remove event listeners
  useEffect(() => {
    if (editMode) {
      document.addEventListener('click', handleElementClick, true);
      document.addEventListener('keydown', handleKeyDown, true);

      // Add hover styles
      const style = document.createElement('style');
      style.id = 'dev-editor-hover-styles';
      style.innerHTML = `
        .dev-edit-mode h1:hover,
        .dev-edit-mode h2:hover,
        .dev-edit-mode h3:hover,
        .dev-edit-mode h4:hover,
        .dev-edit-mode h5:hover,
        .dev-edit-mode h6:hover,
        .dev-edit-mode p:hover,
        .dev-edit-mode span:hover,
        .dev-edit-mode div:hover,
        .dev-edit-mode a:hover,
        .dev-edit-mode li:hover,
        .dev-edit-mode button:hover {
          outline: 2px dashed #fbbf24 !important;
          outline-offset: 2px;
          cursor: pointer !important;
        }
      `;
      document.head.appendChild(style);
      document.body.classList.add('dev-edit-mode');

      return () => {
        document.removeEventListener('click', handleElementClick, true);
        document.removeEventListener('keydown', handleKeyDown, true);
        document.getElementById('dev-editor-hover-styles')?.remove();
        document.body.classList.remove('dev-edit-mode');
      };
    }
  }, [editMode, currentlyEditing, editedElements]);

  return (
    <div className="dev-content-editor">
      {/* Floating Toggle Button */}
      <button
        onClick={toggleEditMode}
        className={`fixed bottom-6 right-6 z-[9999] rounded-full p-4 shadow-2xl transition-all duration-300 ${
          editMode
            ? 'bg-airbnb-pink-500 text-white scale-110'
            : 'bg-white text-airbnb-grey-900 border-2 border-airbnb-grey-300 hover:border-airbnb-pink-500'
        }`}
        title={editMode ? 'Exit Edit Mode (Esc)' : 'Enter Edit Mode'}
      >
        <Edit3 className="w-6 h-6" />
      </button>

      {/* Edit Mode Panel */}
      {editMode && (
        <div className="fixed bottom-24 right-6 z-[9999] bg-white rounded-lg shadow-2xl border-2 border-airbnb-grey-200 p-4 max-w-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-medium text-airbnb-grey-900">Edit Mode Active</span>
            </div>
            <button
              onClick={toggleEditMode}
              className="text-airbnb-grey-600 hover:text-airbnb-grey-900"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-airbnb-grey-600 mb-3">
            Click any text to edit it. Press <kbd className="px-2 py-1 bg-airbnb-grey-100 rounded text-xs">Esc</kbd> to save.
          </p>

          {/* Edited Elements List */}
          {editedElements.size > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-airbnb-grey-700">
                  {editedElements.size} edit{editedElements.size !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={clearAllEdits}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear All
                </button>
              </div>

              {Array.from(editedElements.entries()).map(([path, edit]) => (
                <div
                  key={path}
                  className="bg-airbnb-grey-50 rounded p-2 text-sm border border-airbnb-grey-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-xs text-airbnb-grey-500 truncate" title={path}>
                          {edit.element.tagName.toLowerCase()}
                        </div>
                        {edit.savedToFile === true && (
                          <span className="text-xs text-green-600 flex items-center gap-1" title="Saved to source file">
                            <Check className="w-3 h-3" />
                            Saved
                          </span>
                        )}
                        {edit.savedToFile === false && (
                          <span className="text-xs text-orange-600 flex items-center gap-1" title={edit.saveError || 'Failed to save'}>
                            ⚠️ Manual
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-xs text-airbnb-grey-900 break-words">
                        {edit.newText}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(path)}
                      className="flex-shrink-0 p-1.5 rounded hover:bg-white transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedPath === path ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-airbnb-grey-600" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {editedElements.size === 0 && (
            <div className="text-center py-6 text-airbnb-grey-400 text-sm">
              No edits yet. Click any text to start editing.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
