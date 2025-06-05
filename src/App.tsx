import React from 'react';
import logo from './logo.svg';
import { AppBar, Toolbar, Typography } from '@mui/material';
import Pharmdle from './Pharmdle';

function App() {
  console.log('hi');
  return (
    <div>
      <AppBar position="static" style={{ marginBottom: '25px' }}>
        <Toolbar variant="dense">
          <Typography variant="h6" color="inherit" component="div">
            Pharmdle (Beta)
          </Typography>
        </Toolbar>
      </AppBar>
      <Pharmdle numRows={8} />
    </div>
  );
}

export default App;
