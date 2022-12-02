import React  from 'react';
import { createContext, useState, useEffect } from 'react'
import jwt_decode from "jwt-decode"
import { useNavigate } from 'react-router-dom'

//https://github.com/divanov11/refresh-token-interval

const AuthContext = createContext()

export default AuthContext;

export const AuthProvider = ({children}) => {
    let [authTokens, setAuthTokens] = useState(()=> localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null)
    let [user, setUser] = useState(()=> localStorage.getItem('authTokens') ? jwt_decode(localStorage.getItem('authTokens')) : null)
    let [loading, setLoading] = useState(true)
    let [loggedin, setloggedin] = useState({"success": false, "msg": ""})

    const navigate = useNavigate()

    let loginUser = async (e)=> {
        e.preventDefault()
        let response = await fetch('http://127.0.0.1:8000/api/login/', {
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({'username':e.target.username.value, 'password':e.target.password.value})
        })
        let data = await response.json()

        if(response.status === 200){
            setAuthTokens(data)
            setUser(jwt_decode(data.access))
            localStorage.setItem('authTokens', JSON.stringify(data))
            setloggedin(prev => ({...prev, "success": true, "msg": ""}))
            navigate('/')
        }else{
            setloggedin(prev => ({...prev, "success": false, "msg": "Something went wrong!"}));
        }
    }

    let logoutUserWithBlackListToken = async (e)=> {
        e.preventDefault()
        let response = await fetch('http://127.0.0.1:8000/api/logout/', {
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authTokens?.access)
            },
            body:JSON.stringify({'refresh_token':authTokens?.refresh}) //?. to check whether refresh attrs object exist for the object authTokens or not
        })

        if (response.status === 205){ } //success it reset content
        
        logoutUser()
    }

    let logoutUser = () => {
        setAuthTokens(null)
        setUser(null)
        setloggedin(prev => ({...prev, "success": false, "msg": ""}))
        localStorage.removeItem('authTokens')
        navigate('/login')
    }


    let updateToken = async ()=> {

        let response = await fetch('http://127.0.0.1:8000/api/login/refresh/', {
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({'refresh':authTokens?.refresh}) //?. to check whether refresh attrs object exist for the object authTokens or not
        })
        
        let data = await response.json()

        if (response.status === 200){
            setAuthTokens(data)
            setUser(jwt_decode(data.access))
            setloggedin(prev => ({...prev, "success": true, "msg": ""}))
            localStorage.setItem('authTokens', JSON.stringify(data))
        }else{
            logoutUser()
        }

        if(loading){
            setLoading(false)
        }
    }

    let contextData = {
        user:user,
        authTokens:authTokens,
        loginUser:loginUser,
        loggedin: loggedin,
        logoutUserWithBlackListToken: logoutUserWithBlackListToken
    }


    useEffect(()=> {
        
        if(loading){
            updateToken()
        }

        let fourMinutes = 1000 * 60 * 4

        let interval =  setInterval(()=> {
            if(authTokens){
                updateToken()
            }
        }, fourMinutes)
        return ()=> clearInterval(interval)

    }, [authTokens, loading])

    return(
        <AuthContext.Provider value={contextData} >
            {loading ? null : children}
        </AuthContext.Provider>
    )
}