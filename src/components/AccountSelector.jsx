// FILE: src/components/AccountSelector.jsx
import React, { useState, useEffect } from 'react';

export default function AccountSelector() {
  const [accounts, setAccounts] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    // Load saved accounts from localStorage
    const savedAccounts = JSON.parse(localStorage.getItem('accounts')) || ["Account 1", "Account 2", "Account 3"];
    setAccounts(savedAccounts);
  }, []);

  const saveAccounts = (updatedAccounts) => {
    setAccounts(updatedAccounts);
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setNewName(accounts[index]);
  };

  const handleSave = (index) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[index] = newName.trim() || accounts[index];
    saveAccounts(updatedAccounts);
    setEditingIndex(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Select & Rename Accounts</h2>
      <div className="flex flex-wrap gap-2">
        {accounts.map((account, index) => (
          <div key={index} className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 p-2 rounded">
            {editingIndex === index ? (
              <>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-2 py-1 rounded border dark:bg-gray-600"
                />
                <button
                  onClick={() => handleSave(index)}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <span>{account}</span>
                <button
                  onClick={() => handleEdit(index)}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
