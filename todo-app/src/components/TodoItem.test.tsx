import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItem } from './TodoItem';
import type { Todo } from '../types';

const mockTodo: Todo = {
  id: '1',
  title: 'Test Todo',
  description: 'Test Description',
  completed: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('TodoItem', () => {
  it('renders todo title and description', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders without description when not provided', () => {
    const todoWithoutDesc = { ...mockTodo, description: undefined };
    render(
      <TodoItem
        todo={todoWithoutDesc}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('calls onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(onToggle).toHaveBeenCalledWith('1');
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={onDelete}
      />
    );

    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('enters edit mode when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });

  it('calls onUpdate when save is clicked in edit mode', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onUpdate={onUpdate}
        onDelete={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /edit/i }));
    const titleInput = screen.getByDisplayValue('Test Todo');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Title');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onUpdate).toHaveBeenCalledWith('1', {
      title: 'Updated Title',
      description: 'Test Description',
    });
  });

  it('cancels edit mode when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /edit/i }));
    const titleInput = screen.getByDisplayValue('Test Todo');
    await user.clear(titleInput);
    await user.type(titleInput, 'Changed');
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Changed')).not.toBeInTheDocument();
  });

  it('applies completed class when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: true };
    const { container } = render(
      <TodoItem
        todo={completedTodo}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(container.querySelector('.todo-item.completed')).toBeInTheDocument();
  });
});
