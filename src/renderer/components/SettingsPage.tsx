import React, { useState } from 'react'
import { Button, ButtonGroup, Container, Stack, TextField } from '@mui/material'
import { TechnicalConf } from '../../common/ipc-types'
import ipcContextApi from '../ipc-context-api'

type Props = {
  technicalConf: TechnicalConf
  invalidateTechnicalConf: () => void
}

export const SettingsPage = (props: Props) => {
  const [apiKey, setApiKey] = useState(props.technicalConf.apiKey)

  return <Container>
  <Stack spacing={1}>
    <h2 style={{ marginBottom: 0}}>Settings</h2>
    <TextField label="API Key" value={apiKey} onChange={e => {
      setApiKey(e.target.value)
    }} />
    <ButtonGroup>
      <Button variant="contained" onClick={async () => {
        await ipcContextApi.updateTechnicalConf({
          ...props.technicalConf,
          apiKey,
        })
        props.invalidateTechnicalConf()
      }}>
        Save
      </Button>
    </ButtonGroup>
  </Stack>
  </Container>
}
