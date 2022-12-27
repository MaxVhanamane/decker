
import React, { useContext } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertColor } from '@mui/material/Alert';
import { AlertContext } from "../context/AlertState"
import Alert from '@mui/material/Alert';

export default function SimpleSnackbar() {
  const AlertContextVal = useContext(AlertContext)
  const { alert, setAlert } = AlertContextVal
  const show = alert?.show
  // const Alert = React.forwardRef(function Alert(props:any, ref:any) {
  //   return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  // });

  // handleling onClose event. 
  //If you do not add onClose prop in snackbar then it's autoHideDuration prop won't work (from documentation).
  const handleClose = (event:Event | React.SyntheticEvent<any, Event>, reason:string) => {
    // If user clicks on screen/window except snackbar notification then do nothing.
    if (reason === 'clickaway') {
      return
    }
    // If I don't add this snackbar will not hide automatically
    setAlert((preval:any) => (
      {
        ...preval,
        show: false
      }))

  };
 
  const handleClick=()=>{
    setAlert((preval:any) => (
      {
        ...preval,
        show: false
      }))
  }
  return (
    <div >
      <Snackbar onClick={handleClick} open={show} autoHideDuration={alert.autoHideDuration} onClose={handleClose} anchorOrigin={{
        vertical: "top",
        horizontal: "center"
      }} >
        <div className="text-center">
          <Alert severity={alert?.severity as AlertColor} variant="filled" sx={{ width: '100%' }}>
            {alert?.message}
          </Alert>
        </div>
      </Snackbar>
    </div>
  );
}

