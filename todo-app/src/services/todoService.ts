import { v4 as uuidv4 } from 'uuid';
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../types';

const STORAGE_KEY = 'todos';

export const todoService = {
  getAll(): Todo[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data) as Todo[];
    } catch {
      return [];
    }
  },

  getById(id: string): Todo | undefined {
    const todos = this.getAll();
    return todos.find(todo => todo.id === id);
  },

  create(input: CreateTodoInput): Todo {
    const todos = this.getAll();
    const now = new Date().toISOString();
    const newTodo: Todo = {
      id: uuidv4(),
      title: input.title,
      description: input.description,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    todos.push(newTodo);
    this.save(todos);
    return newTodo;
  },

  update(id: string, input: UpdateTodoInput): Todo | undefined {
    const todos = this.getAll();
    const index = todos.findIndex(todo => todo.id === id);
    if (index === -1) return undefined;

    const updatedTodo: Todo = {
      ...todos[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    todos[index] = updatedTodo;
    this.save(todos);
    return updatedTodo;
  },

  delete(id: string): boolean {
    const todos = this.getAll();
    const index = todos.findIndex(todo => todo.id === id);
    if (index === -1) return false;

    todos.splice(index, 1);
    this.save(todos);
    return true;
  },

  toggleComplete(id: string): Todo | undefined {
    const todo = this.getById(id);
    if (!todo) return undefined;
    return this.update(id, { completed: !todo.completed });
  },

  save(todos: Todo[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
