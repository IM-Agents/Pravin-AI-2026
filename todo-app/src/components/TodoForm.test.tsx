import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from './TodoForm';

describe('TodoForm', () => {
  it('renders form elements', () => {
    render(<TodoForm onSubmit={vi.fn()} />);

    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add a description (optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
  });

  it('submit button is disabled when title is empty', () => {
    render(<TodoForm onSubmit={vi.fn()} />);

    const submitButton = screen.getByRole('button', { name: /add todo/i });
    expect(submitButton).toBeDisabled();
  });

  it('submit button is enabled when title has content', async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={vi.fn()} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'New Todo');

    const submitButton = screen.getByRole('button', { name: /add todo/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('calls onSubmit with title when form is submitted', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TodoForm onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'New Todo');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'New Todo',
      description: undefined,
    });
  });

  it('calls onSubmit with title and description', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TodoForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'New Todo');
    await user.type(screen.getByPlaceholderText('Add a description (optional)'), 'Description');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'New Todo',
      description: 'Description',
    });
  });

  it('clears form after submission', async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={vi.fn()} />);

    const titleInput = screen.getByPlaceholderText('What needs to be done?') as HTMLInputElement;
    const descInput = screen.getByPlaceholderText('Add a description (optional)') as HTMLTextAreaElement;

    await user.type(titleInput, 'New Todo');
    await user.type(descInput, 'Description');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    expect(titleInput.value).toBe('');
    expect(descInput.value).toBe('');
  });

  it('does not submit when title is only whitespace', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TodoForm onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, '   ');

    const submitButton = screen.getByRole('button', { name: /add todo/i });
    expect(submitButton).toBeDisabled();
  });
});
