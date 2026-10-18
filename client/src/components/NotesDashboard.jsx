
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import api, { getErrorMessage } from "../services/api";

import NoteForm from "./NoteForm";
import NoteCard from "./NoteCard";

const categories = [
  "All",
  "General",
  "Work",
  "Personal",
  "Ideas",
  "School",
];

export default function NotesDashboard() {
  const { user, logout } = useAuth();

  // Store note data and UI states.
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [tag, setTag] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load the authenticated user's notes.
  const loadNotes = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (category !== "All") {
        params.category = category;
      }

      if (tag) {
        params.tag = tag;
      }

      const response = await api.get("/notes", {
        params,
        signal,
      });

      setNotes(response.data.notes);
    } catch (err) {
      if (err.code === "ERR_CANCELED") return;

      if (err.response?.status === 401) {
        logout();
        return;
      }

      setError(getErrorMessage(err));
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [search, category, tag, logout]);

  // Refresh when search or filters change.
  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(() => {
      loadNotes(controller.signal);
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadNotes]);

  function openCreateForm() {
    setEditingNote(null);
    setShowEditor(true);
  }

  function openEditForm(note) {
    setEditingNote(note);
    setShowEditor(true);
  }

  function closeForm() {
    setShowEditor(false);
    setEditingNote(null);
  }

  // Create or update the selected note.
  async function saveNote(data) {
    try {
      if (editingNote) {
        await api.put(`/notes/${editingNote.id}`, data);
      } else {
        await api.post("/notes", data);
      }

      closeForm();
      await loadNotes();
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }

  // Delete a note after user confirmation.
  async function deleteNote(note) {
    const confirmed = window.confirm(
      `Delete "${note.title}" permanently?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/notes/${note.id}`);
      await loadNotes();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function filterByTag(tagName) {
    setTag(tagName);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">🔐</span>
          <span>SecureNotes</span>
        </div>

        <div className="sidebar-content">
          <p className="sidebar-label">WORKSPACE</p>
          <div className="active-nav">
            🗒️ My Notes
          </div>

          <p className="sidebar-label categories-heading">
            CATEGORIES
          </p>

          <nav className="category-nav">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  category === item
                    ? "category-link selected"
                    : "category-link"
                }
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <span>Signed in as</span>
          <strong>{user.name}</strong>
          <small>{user.email}</small>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <span>My Workspace</span>

          <div className="user-controls">
            <span className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="dashboard-content">
          <div className="dashboard-heading">
            <div>
              <h1>My Notes</h1>
              <p>
                Your private space for ideas, tasks
                and everything important.
              </p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={openCreateForm}
            >
              + New Note
            </button>
          </div>

          <div className="dashboard-toolbar">
            <input
              type="search"
              placeholder="Search your notes..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              aria-label="Search notes"
            />

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              aria-label="Filter by category"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {tag && (
            <div className="filter-notice">
              Filtering by tag: #{tag}
              <button
                type="button"
                onClick={() => setTag("")}
              >
                Clear filter
              </button>
            </div>
          )}

          {showEditor && (
            <NoteForm
              key={editingNote?.id || "new"}
              note={editingNote}
              onSave={saveNote}
              onCancel={closeForm}
            />
          )}

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="empty-state">
              Loading your notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h2>No notes found</h2>
              <p>
                Create your first note or change your filters.
              </p>
            </div>
          ) : (
            <>
              <p className="result-count">
                {notes.length} note
                {notes.length !== 1 ? "s" : ""}
              </p>

              <div className="notes-grid">
                {notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={openEditForm}
                    onDelete={deleteNote}
                    onTagClick={filterByTag}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
