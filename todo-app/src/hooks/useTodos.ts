import { useState, useCallback } from 'react';
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../types';
import { todoService } from '../services';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(() => todoService.getAll());
  const [loading] = useState(false);

  const loadTodos = useCallback(() => {
    const data = todoService.getAll();
    setTodos(data);
  }, []);

  const addTodo = useCallback((input: CreateTodoInput) => {
    const newTodo = todoService.create(input);
    setTodos(prev => [...prev, newTodo]);
    return newTodo;
  }, []);

  const updateTodo = useCallback((id: string, input: UpdateTodoInput) => {
    const updated = todoService.update(id, input);
    if (updated) {
      setTodos(prev => prev.map(todo => (todo.id === id ? updated : todo)));
    }
    return updated;
  }, []);

  const deleteTodo = useCallback((id: string) => {
    const success = todoService.delete(id);
    if (success) {
      setTodos(prev => prev.filter(todo => todo.id !== id));
    }
    return success;
  }, []);

  const toggleComplete = useCallback((id: string) => {
    const updated = todoService.toggleComplete(id);
    if (updated) {
      setTodos(prev => prev.map(todo => (todo.id === id ? updated : todo)));
    }
    return updated;
  }, []);

  const completedCount = todos.filter(t => t.completed).length;
  const pendingCount = todos.filter(t => !t.completed).length;

  return {
    todos,
    loading,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    completedCount,
    pendingCount,
    refresh: loadTodos,
  };
}
