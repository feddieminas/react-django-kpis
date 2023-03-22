import React, {Fragment} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import PrivateRoute from './utils/PrivateRoute'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import GridJS from './pages/GridjsClient'
import AddKPIs from './pages/AddKPIs'
import Login from './pages/Login'
import Footer from './components/Footer'

//https://stackoverflow.com/questions/61120850/how-do-i-upload-a-file-with-fetch-method-in-react
//django post multiple records find way nice when receive, as bulk collect select related similar

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
                  <Route element={<AddKPIs/>} path="/kpis/add"/>
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
