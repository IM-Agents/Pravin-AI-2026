import { useState } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')

  const addTodo = (e) => {
    e.preventDefault()
    if (inputValue.trim() === '') return
    
    const newTodo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false
    }
    
    setTodos([...todos, newTodo])
    setInputValue('')
  }

  const removeTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  return (
    <div className="app">
      <div className="container">
        <h1>Todo List</h1>
        
        <form className="todo-form" onSubmit={addTodo}>
          <input
            type="text"
            className="todo-input"
            placeholder="Add a new task..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" className="add-btn">
            Add
          </button>
        </form>

        <ul className="todo-list">
          {todos.length === 0 ? (
            <li className="empty-state">No tasks yet. Add one above!</li>
          ) : (
            todos.map(todo => (
              <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <label className="todo-label">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="todo-checkbox"
                  />
                  <span className="todo-text">{todo.text}</span>
                </label>
                <button 
                  className="delete-btn"
                  onClick={() => removeTodo(todo.id)}
                  aria-label="Delete task"
                >
                  Delete
                </button>
              </li>
            ))
          )}
        </ul>

        {todos.length > 0 && (
          <div className="todo-stats">
            <span>{todos.filter(t => !t.completed).length} tasks remaining</span>
            <span>{todos.filter(t => t.completed).length} completed</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
