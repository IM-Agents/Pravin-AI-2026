import Calculator from './components/Calculator'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Simple Calculator</h1>
        <p>A basic arithmetic calculator built with React</p>
      </header>
      <main className="app-main">
        <Calculator />
      </main>
      <footer className="app-footer">
        <p>Supports +, -, *, / operations</p>
      </footer>
    </div>
  )
}

export default App
