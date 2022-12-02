import React, { useContext } from 'react'
import AuthContext from '../context/AuthContext'

const Login = () => {
  let {loginUser, loggedin} = useContext(AuthContext)

  return (
    <div className="d-flex flex-column justify-content-start align-items-center mt-3">
      {
        loggedin.msg && 
        <div className="col-12 col-sm-12 col-md-8 col-lg-6 alert alert-danger my-2" role="alert">
          Something went wrong!
        </div>
      }
      <div className="col-12 col-sm-12 col-md-8 col-lg-6">
        <form className="mt-2" onSubmit={loginUser}>
          <fieldset disabled={loggedin.success}>
            <div className="form-group row">
              <div className="col-md-12 col-lg-10 mb-3">
                <label htmlFor="username" className={`form-label ${loggedin.success && "text-muted"}`}>Username</label>
                <input type="username" name="username" 
                className="form-control" id="username" required/>
              </div>
              <div className="col-md-12 col-lg-10 mb-3">
                <label htmlFor="password" className={`form-label ${loggedin.success && "text-muted"}`}>Password</label>
                <input type="password" name="password" 
                className="form-control" id="password" required/>
              </div>
            </div>
            <button type="submit" className={`btn btn-lg ${loggedin.success ? "btn-light" : "btn-primary"} mb-3`} name="action" value="login_action">Login</button>
          </fieldset>
        </form>
      </div>
    </div>
  )
}

export default Login