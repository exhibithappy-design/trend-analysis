/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Font, Head, Img, Section } from 'npm:@react-email/components@0.0.22'

export const LOGO_URL =
  'https://trends.exhibithappy.design/__l5e/assets-v1/43de4a81-3e05-4e53-80d5-644980459878/exhibithappy-logo-email-v2.png'

export const fontStack =
  "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const BrandHead = () => (
  <Head>
    <Font
      fontFamily="Poppins"
      fallbackFontFamily="Helvetica"
      webFont={{
        url: 'https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2',
        format: 'woff2',
      }}
      fontWeight={400}
      fontStyle="normal"
    />
    <Font
      fontFamily="Poppins"
      fallbackFontFamily="Helvetica"
      webFont={{
        url: 'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLGT9Z1xlFd2JQEk.woff2',
        format: 'woff2',
      }}
      fontWeight={700}
      fontStyle="normal"
    />
  </Head>
)

export const BrandHeader = () => (
  <Section style={headerBar}>
    <Img
      src={LOGO_URL}
      width="176"
      alt="Exhibit Happy by Steelhead"
      style={{ display: 'block' }}
    />
  </Section>
)

const headerBar = {
  backgroundColor: '#000000',
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '0 0 28px',
}