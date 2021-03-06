import {
  Card,
  LayerProvider,
  PortalProvider,
  ThemeColorProvider,
  ThemeProvider,
  useRootTheme,
} from '@sanity/ui'
import config from 'config:sanity'
import RootComponent from 'part:@sanity/base/root'
import SnackbarProvider from 'part:@sanity/components/snackbar/provider'
import React, {useState} from 'react'
import Refractor from 'react-refractor'
import jsx from 'refractor/lang/jsx'
import cssVars from 'sanity:css-custom-properties'
import styled from 'styled-components'
import {REQUIRED_UI_VERSION} from '../requiredSanityUiVersion'
import {theme} from '../theme'
import {userColorManager, UserColorManagerProvider} from '../user-color'
import ErrorHandler from './ErrorHandler'
import DevServerStatus from './DevServerStatus'
import {GlobalStyle} from './GlobalStyle'
import MissingProjectConfig from './MissingProjectConfig'
import VersionChecker from './VersionChecker'

Refractor.registerLanguage(jsx)

const Root = styled(Card).attrs({tone: 'transparent'})`
  height: 100%;
`

function UIErrorMessage() {
  return (
    <div
      style={{WebkitFontSmoothing: 'antialiased', padding: 20, margin: '0 auto', maxWidth: '40rem'}}
    >
      <h1>Error: Missing theme context</h1>

      <p>
        This problem is usually caused by the existence of multiple versions of{' '}
        <code>@sanity/ui</code> in the same application.
      </p>

      <p>
        Make sure to install the same version of <code>@sanity/ui</code> as{' '}
        <code>@sanity/base</code>:
      </p>

      <pre style={{padding: 20, background: cssVars['--black'], color: cssVars['--white']}}>
        <code>npm install @sanity/ui@{REQUIRED_UI_VERSION}</code>
      </pre>
    </div>
  )
}

function AppProvider() {
  const [portalElement, setPortalElement] = useState(() => document.createElement('div'))
  const [uiError, setUIError] = useState<Error | null>(null)

  try {
    useRootTheme()
  } catch (_) {
    return <UIErrorMessage />
  }

  if (uiError) {
    return <UIErrorMessage />
  }

  return (
    <UserColorManagerProvider manager={userColorManager}>
      <PortalProvider element={portalElement}>
        <LayerProvider>
          <SnackbarProvider>
            <ThemeColorProvider tone="transparent">
              <GlobalStyle />
            </ThemeColorProvider>
            <Root scheme="light">
              <DevServerStatus />
              <ErrorHandler onUIError={setUIError} />
              <RootComponent />
              <VersionChecker />
              <div data-portal="" ref={setPortalElement} />
            </Root>
          </SnackbarProvider>
        </LayerProvider>
      </PortalProvider>
    </UserColorManagerProvider>
  )
}

function SanityRoot() {
  const {projectId, dataset} = config.api || {}

  if (!projectId || !dataset) {
    return <MissingProjectConfig />
  }

  return (
    <ThemeProvider theme={theme}>
      <AppProvider />
    </ThemeProvider>
  )
}

export default SanityRoot
