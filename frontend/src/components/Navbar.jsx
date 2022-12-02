import React, { useContext } from 'react'
import { ReactComponent as NavBrand } from '../assets/mytilineos-logo.svg'
import { Link, useMatch, useResolvedPath } from 'react-router-dom'
import AuthContext from '../context/AuthContext'

const Navbar = () => {
    let {logoutUserWithBlackListToken, loggedin} = useContext(AuthContext)

    return (
    <div className="navbar pb-0 pb-sm-2 text-dark">
        <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-center overflow-hidden">
            <Link to="/" className="logo d-inline-block p-0">
                <NavBrand className="align-middle" alt="Mytilineos" width="65" height="65"/>
            </Link>
            <nav>
                <ul className="d-flex mt-2 mt-sm-auto mb-0 p-2 pb-0 p-sm-3">
                    <CustomLink to="/gridjsClient">GRIDJS_CL</CustomLink>
                    <CustomLink to="/login">LOGIN</CustomLink>
                    {
                        loggedin.success &&
                        <li id="logout">
                            <Link to onClick={logoutUserWithBlackListToken} className="mx-1 p-2 text-decoration-none text-dark">
                                <i className="bi bi-box-arrow-right" style={{ "fontSize": "1.2rem","marginRight": "0.15em" }}></i>
                                LOGOUT
                            </Link>
                        </li>
                    }
                </ul>
            </nav>
        </div>
    </div>
    )

    // https://github.com/WebDevSimplified/react-navbar/blob/main/src/Navbar.js
    
    function CustomLink({to, children, ...props }) {
        const resolvedPath = useResolvedPath(to)
        const isActive = useMatch({ path: resolvedPath.pathname, end: true })
      
        return (
          <li>
            <Link to={to} className={"mx-1 p-2 text-decoration-none text-dark" + (isActive ? " active" : "")} {...props}>
              {children}
            </Link>
          </li>
        )
    }

}

export default Navbar