import { useState, useEffect } from 'react'
import Alert from 'react-bootstrap/Alert';

//https://stackoverflow.com/questions/65214950/how-to-disappear-alert-after-5-seconds-in-react-js

const AlertMessage = ({ variant, msg, setShowAlertKPI }) => {
  const [show, setShow] = useState(true)

  // On componentDidMount set the timer
  useEffect(() => {
    const timeId = setTimeout(() => {
      // After 3 seconds set the show value to false
      setShow(false)
    }, 3000)

    return () => {
      clearTimeout(timeId)
    }
  }, []);

  // If show is false the component will return null and stop here
  if (!show) {
    setShowAlertKPI({"type": null,"variant": null, "msg": null})
    return null;
  }

  // If show is true this will be returned
  return (
    <Alert variant={variant}>
        {msg}
    </Alert>
  )
}

AlertMessage.defaultPros = {
  variant: 'success',
}

export default AlertMessage;