import React, {Fragment} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import PrivateRoute from './utils/PrivateRoute'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import GridJS from './pages/GridjsClient'
import Login from './pages/Login'
import Footer from './components/Footer'

function App() {

  return (
    <div className="d-flex flex-column min-vh-100">
      <Router>
        <Fragment>
        <AuthProvider>
          <Navbar/>
          <main className="container flex-grow-1">
              <Routes>
                <Route path='/' element={<PrivateRoute/>}>
                  <Route index element={<GridJS/>}/>
                  <Route element={<GridJS/>} path="/gridjsClient"/>
                </Route>             
                <Route element={<Login/>} path="/login/"/>
              </Routes>
            </main>
          <Footer/>
          </AuthProvider>
        </Fragment>
      </Router>
    </div>
  )
};

export default App;
