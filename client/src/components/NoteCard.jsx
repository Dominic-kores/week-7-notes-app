
export default function NoteCard({
  note,
  onEdit,
  onDelete,
  onTagClick,
}) {
  // Format the note's modification timestamp.
  const formattedDate = new Date(
    note.updatedAt
  ).toLocaleDateString();

  return (
    <article className="note-card">
      <div className="note-card-top">
        <span className="category-badge">
          {note.category}
        </span>

        {note.isPinned && (
          <span className="pin-indicator">
            📌 Pinned
          </span>
        )}
      </div>

      <h3>{note.title}</h3>

      <p className="note-content">
        {note.content}
      </p>

      <div className="note-tags">
        {note.tags?.map((tag) => (
          <button
            key={tag.id}
            type="button"
            className="tag-badge"
            onClick={() => onTagClick(tag.name)}
          >
            #{tag.name}
          </button>
        ))}
      </div>

      <div className="note-footer">
        <span>Updated {formattedDate}</span>

        <div className="note-actions">
          <button
            type="button"
            onClick={() => onEdit(note)}
            aria-label={`Edit ${note.title}`}
          >
            Edit
          </button>

          <button
            type="button"
            className="delete-button"
            onClick={() => onDelete(note)}
            aria-label={`Delete ${note.title}`}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
