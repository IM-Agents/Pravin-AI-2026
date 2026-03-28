import { useState, type FormEvent } from 'react';
import type { CreateTodoInput } from '../types';
import './TodoForm.css';

interface TodoFormProps {
  onSubmit: (input: CreateTodoInput) => void;
}

export function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
    });

    setTitle('');
    setDescription('');
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="todo-input"
          aria-label="Todo title"
        />
      </div>
      <div className="form-group">
        <textarea
          placeholder="Add a description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="todo-textarea"
          rows={2}
          aria-label="Todo description"
        />
      </div>
      <button type="submit" className="todo-submit" disabled={!title.trim()}>
        Add Todo
      </button>
    </form>
  );
}
