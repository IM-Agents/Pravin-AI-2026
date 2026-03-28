import { TodoForm, TodoList } from './components';
import { useTodos } from './hooks';
import './App.css';

function App() {
  const { todos, addTodo, updateTodo, deleteTodo, toggleComplete, pendingCount, completedCount } = useTodos();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Todo App</h1>
        <p className="app-subtitle">
          {pendingCount} pending, {completedCount} completed
        </p>
      </header>

      <main className="app-main">
        <TodoForm onSubmit={addTodo} />
        <TodoList
          todos={todos}
          onToggle={toggleComplete}
          onUpdate={updateTodo}
          onDelete={deleteTodo}
        />
      </main>

      <footer className="app-footer">
        <p>Built with React + TypeScript</p>
      </footer>
    </div>
  );
}

export default App;
