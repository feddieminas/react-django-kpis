import React  from 'react';
import { Navigate, Outlet } from 'react-router-dom'
import { useContext } from 'react'
import AuthContext from '../context/AuthContext'

//https://github.com/divanov11/refresh-token-interval
//https://stackoverflow.com/questions/69864165/error-privateroute-is-not-a-route-component-all-component-children-of-rou

const PrivateRoute = () => {
    let {user} = useContext(AuthContext)
    return(
        user ? <Outlet /> : <Navigate to="/login" />
    )
}

export default PrivateRoute;