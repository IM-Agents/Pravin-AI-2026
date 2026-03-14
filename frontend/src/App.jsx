import React from 'react';
import { BrowserRouter as Router, Route, Switch, NavLink, Redirect } from 'react-router-dom';
import ActionRequiredPage from './pages/ActionRequiredPage';
import AllOrdersPage from './pages/AllOrdersPage';
import PrinterManagementPage from './pages/PrinterManagementPage';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>📦 Order Management Automation</h1>
        </header>

        <nav className="app-nav">
          <NavLink 
            to="/orders/action-required" 
            className="nav-link"
            activeClassName="active"
          >
            ⚠️ Action Required
          </NavLink>
          <NavLink 
            to="/orders/all" 
            className="nav-link"
            activeClassName="active"
          >
            📋 All Orders
          </NavLink>
          <NavLink 
            to="/settings/printers" 
            className="nav-link"
            activeClassName="active"
          >
            🖨️ Printer Management
          </NavLink>
        </nav>

        <main className="app-main">
          <Switch>
            <Route path="/orders/action-required" component={ActionRequiredPage} />
            <Route path="/orders/all" component={AllOrdersPage} />
            <Route path="/settings/printers" component={PrinterManagementPage} />
            <Redirect from="/" to="/orders/action-required" />
          </Switch>
        </main>

        <footer className="app-footer">
          <p>Order Management Automation System v1.0</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;

