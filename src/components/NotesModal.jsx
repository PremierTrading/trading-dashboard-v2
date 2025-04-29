// FILE: src/components/NotesModal.jsx
import React, { useState } from 'react';

export default function NotesModal({ trade, note, tag, onSave, onClose }) {
  const [newNote, setNewNote] = useState(note || "");
  const [newTag, setNewTag] = useState(tag || "");

  const handleSave = () => {
    onSave(newNote, newTag);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit Trade</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Notes:</label>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={4}
            className="w-full p-2 border rounded dark:bg-gray-700"
            placeholder="Enter notes about this trade..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Tag (Strategy Type):</label>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700"
            placeholder="Example: Breakout, Reversal, Scalp..."
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
