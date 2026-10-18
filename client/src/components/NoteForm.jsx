
import { useState } from "react";

const categories = [
  "General",
  "Work",
  "Personal",
  "Ideas",
  "School",
];

export default function NoteForm({
  note,
  onSave,
  onCancel,
}) {
  // Prepopulate fields when editing an existing note.
  const [form, setForm] = useState({
    title: note?.title || "",
    content: note?.content || "",
    category: note?.category || "General",
    isPinned: note?.isPinned || false,
    tags: note?.tags?.map((tag) => tag.name).join(", ") || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, type, value, checked } = event.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    // Convert comma-separated tags into an array.
    const tags = [
      ...new Set(
        form.tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean)
      ),
    ];

    try {
      await onSave({
        title: form.title,
        content: form.content,
        category: form.category,
        isPinned: form.isPinned,
        tags,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="editor-card">
      <div className="section-heading">
        <h2>{note ? "Edit Note" : "Create New Note"}</h2>
        <button
          type="button"
          className="icon-button"
          onClick={onCancel}
          aria-label="Close editor"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="note-title">Note Title</label>
        <input
          id="note-title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter note title"
          maxLength={150}
          required
        />

        <label htmlFor="note-content">Content</label>
        <textarea
          id="note-content"
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Write your note here..."
          rows={7}
          maxLength={5000}
          required
        />

        <label htmlFor="note-category">Category</label>
        <select
          id="note-category"
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <label htmlFor="note-tags">
          Tags (comma-separated)
        </label>
        <input
          id="note-tags"
          name="tags"
          value={form.tags}
          onChange={handleChange}
          placeholder="react, security, project"
        />

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="isPinned"
            checked={form.isPinned}
            onChange={handleChange}
          />
          Pin this note
        </label>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="primary-button"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Note"}
          </button>
        </div>
      </form>
    </section>
  );
}
