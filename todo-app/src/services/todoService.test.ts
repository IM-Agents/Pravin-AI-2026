import { describe, it, expect, vi, beforeEach } from 'vitest';
import { todoService } from './todoService';

describe('todoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  describe('getAll', () => {
    it('returns empty array when no todos exist', () => {
      const todos = todoService.getAll();
      expect(todos).toEqual([]);
    });

    it('returns todos from localStorage', () => {
      const mockTodos = [
        { id: '1', title: 'Test', completed: false, createdAt: '', updatedAt: '' },
      ];
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(JSON.stringify(mockTodos));

      const todos = todoService.getAll();
      expect(todos).toEqual(mockTodos);
    });

    it('returns empty array on invalid JSON', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('invalid json');

      const todos = todoService.getAll();
      expect(todos).toEqual([]);
    });
  });

  describe('create', () => {
    it('creates a new todo with title', () => {
      const todo = todoService.create({ title: 'New Todo' });

      expect(todo.title).toBe('New Todo');
      expect(todo.completed).toBe(false);
      expect(todo.id).toBeDefined();
      expect(todo.createdAt).toBeDefined();
      expect(todo.updatedAt).toBeDefined();
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('creates a new todo with description', () => {
      const todo = todoService.create({ title: 'New Todo', description: 'Description' });

      expect(todo.title).toBe('New Todo');
      expect(todo.description).toBe('Description');
    });
  });

  describe('update', () => {
    it('updates an existing todo', () => {
      const mockTodos = [
        { id: '1', title: 'Test', completed: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ];
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(JSON.stringify(mockTodos));

      const updated = todoService.update('1', { title: 'Updated' });

      expect(updated?.title).toBe('Updated');
      expect(updated?.updatedAt).not.toBe('2024-01-01');
    });

    it('returns undefined for non-existent todo', () => {
      const updated = todoService.update('non-existent', { title: 'Updated' });
      expect(updated).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('deletes an existing todo', () => {
      const mockTodos = [
        { id: '1', title: 'Test', completed: false, createdAt: '', updatedAt: '' },
      ];
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(JSON.stringify(mockTodos));

      const result = todoService.delete('1');

      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('returns false for non-existent todo', () => {
      const result = todoService.delete('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('toggleComplete', () => {
    it('toggles todo completion status', () => {
      const mockTodos = [
        { id: '1', title: 'Test', completed: false, createdAt: '', updatedAt: '' },
      ];
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(JSON.stringify(mockTodos));

      const updated = todoService.toggleComplete('1');

      expect(updated?.completed).toBe(true);
    });

    it('returns undefined for non-existent todo', () => {
      const updated = todoService.toggleComplete('non-existent');
      expect(updated).toBeUndefined();
    });
  });

  describe('getById', () => {
    it('returns todo by id', () => {
      const mockTodos = [
        { id: '1', title: 'Test', completed: false, createdAt: '', updatedAt: '' },
      ];
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(JSON.stringify(mockTodos));

      const todo = todoService.getById('1');

      expect(todo?.id).toBe('1');
      expect(todo?.title).toBe('Test');
    });

    it('returns undefined for non-existent id', () => {
      const todo = todoService.getById('non-existent');
      expect(todo).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('removes todos from localStorage', () => {
      todoService.clear();
      expect(localStorage.removeItem).toHaveBeenCalledWith('todos');
    });
  });
});
