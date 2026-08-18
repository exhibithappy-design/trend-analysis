/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import { BrandHead, BrandHeader, fontStack } from '../email-brand.tsx'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>Confirm your email for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <BrandHeader />
        <Heading style={h1}>Confirm your email</Heading>
        <Text style={text}>
          Thanks for signing up for{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          !
        </Text>
        <Text style={text}>
          Please confirm your email address (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) by clicking the button below:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Verify Email
        </Button>
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: fontStack }
const container = { padding: '32px 28px', maxWidth: '560px', border: '1px solid #ececee', borderRadius: '8px' }
const h1 = {
  fontSize: '24px',
  letterSpacing: '-0.02em',
  fontWeight: 'bold' as const,
  color: '#000000',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: '#3f3f46',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const link = { color: 'inherit', textDecoration: 'underline' }
const button = {
  backgroundColor: '#ff0069',
  color: '#ffffff',
  fontSize: '15px',
  borderRadius: '4px',
  padding: '13px 22px',
  fontWeight: 'bold' as const,
  display: 'inline-block',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
