import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import Footer from './components/Footer'
import SqlToTypeScript from './components/SqlToTypeScript/SqlToTypeScript';
import ErrorPage from './components/ErrorPage';
import TypeScriptToSql from './components/TypeScriptToSql/TypeScriptToSql';

function App() {

  return (
    <div className='app'>

      <header>
        <nav>
          <ul>
            <li>
              <a href='/sql-to-typescript'>SQL -{'>'} TypeScript</a>
            </li>
            <li>
              <a href='/typescript-to-sql'>TypeScript -{'>'} SQL</a>
            </li>
          </ul>
        </nav>
      </header>

      <div className='container'>

        <Router>
          <Routes>
            <Route path='/sql-to-typescript' element={<SqlToTypeScript />} />
            <Route path='/typescript-to-sql' element={<TypeScriptToSql />} />
            <Route path='/' element={<Navigate to='/sql-to-typescript' />} />
            <Route path='*' element={<ErrorPage />} />
          </Routes>
        </Router>

      </div>

      <Footer />
    </div >
  )
}

export default App 
