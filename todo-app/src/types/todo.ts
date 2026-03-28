export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateTodoInput = Pick<Todo, 'title' | 'description'>;

export type UpdateTodoInput = Partial<Pick<Todo, 'title' | 'description' | 'completed'>>;
