import { Container, Stack, Toolbar, TextField } from '@mui/material'
import { AppBar, Button, CssBaseline } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import React, { useState } from 'react'

const Application: React.FC = () => {
  const [apiKey, setApiKey] = useState('')
  return <>
    <CssBaseline />
    <AppBar position='sticky'>
      <Toolbar>
        <Button
          color="inherit"
        >
          <SettingsIcon />
          Settings
        </Button>
      </Toolbar>
    </AppBar>
    <Container>
      <Stack spacing={1}>
        <h2 style={{ marginBottom: 0}}>Settings</h2>
        <TextField label="API Key" value={apiKey} onChange={e => setApiKey(e.target.value)} />
      </Stack>
    </Container>
  </>
}

export default Application
