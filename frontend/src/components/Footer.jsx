import React from 'react'
import PropTypes from 'prop-types'

const Footer = ({ title }) => {
  return (
    <footer>
      <div className="container d-flex justify-content-center align-items-center h-100">
            <div>
                <h3 className="my-0 px-2">{title}</h3>
                <p className="text-center my-0">&copy; 2022</p>
            </div>
        </div>
    </footer>
  )
}

Footer.defaultProps = {
    title: 'MIS',
}

Footer.propTypes = {
    title: PropTypes.string.isRequired,
}

export default Footer;