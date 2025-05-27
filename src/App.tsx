import React from 'react';
import logo from './logo.svg';
import {
  AppBar,
  Box,
  Grid,
  IconButton,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import Drugdle from './Drugdle';

function App() {
  return (
    <div>
      <AppBar position="static" style={{ marginBottom: '25px' }}>
        <Toolbar variant="dense">
          <Typography variant="h6" color="inherit" component="div">
            Pharmdle
          </Typography>
        </Toolbar>
      </AppBar>
      <Drugdle numRows={8} />
    </div>
  );
}

export default App;
