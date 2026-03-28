import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoList } from './TodoList';
import type { Todo } from '../types';

const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Pending Todo',
    completed: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Completed Todo',
    completed: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

describe('TodoList', () => {
  it('renders empty state when no todos', () => {
    render(
      <TodoList
        todos={[]}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
  });

  it('renders todos grouped by status', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Pending (1)')).toBeInTheDocument();
    expect(screen.getByText('Completed (1)')).toBeInTheDocument();
    expect(screen.getByText('Pending Todo')).toBeInTheDocument();
    expect(screen.getByText('Completed Todo')).toBeInTheDocument();
  });

  it('renders only pending section when no completed todos', () => {
    const pendingOnly = [mockTodos[0]];
    render(
      <TodoList
        todos={pendingOnly}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Pending (1)')).toBeInTheDocument();
    expect(screen.queryByText(/completed/i)).not.toBeInTheDocument();
  });

  it('renders only completed section when no pending todos', () => {
    const completedOnly = [mockTodos[1]];
    render(
      <TodoList
        todos={completedOnly}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Completed (1)')).toBeInTheDocument();
    expect(screen.queryByText(/pending/i)).not.toBeInTheDocument();
  });
});
