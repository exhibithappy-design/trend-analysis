/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import { BrandHead, BrandHeader, fontStack } from '../email-brand.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  resultsUrl?: string
}

const Email = ({ name, resultsUrl = 'https://trends.exhibithappy.design/#assessment' }: Props) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>Your exhibit program self-assessment is in</Preview>
    <Body style={main}>
      <Container style={container}>
        <BrandHeader />
        <div style={eyebrow}>2026 EXHIBIT TREND REPORT</div>
        <Heading style={h1}>View your assessment results</Heading>
        <Text style={text}>
          {name ? `Hi ${name},` : 'Hi there,'} your self-assessment is complete. Thanks for taking the time
          to work through all six questions.
        </Text>
        <Text style={text}>
          Your answers are saved and our team is reviewing them now. You can revisit your responses any time
          using the link below, and we will follow up with a personalized read on where to focus next.
        </Text>
        <Button style={button} href={resultsUrl}>
          View My Assessment
        </Button>
        <Text style={footer}>Exhibit Happy by Steelhead</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Your exhibit program assessment results',
  displayName: 'Assessment: view your results',
  previewData: { name: 'Jane' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: fontStack }
const container = { padding: '32px 28px', maxWidth: '560px', border: '1px solid #ececee', borderRadius: '8px' }
const eyebrow = {
  fontSize: '11px',
  letterSpacing: '0.14em',
  color: '#ff0069',
  fontWeight: 'bold' as const,
  margin: '0 0 12px',
}
const h1 = { fontSize: '24px', letterSpacing: '-0.02em', fontWeight: 'bold' as const, color: '#000000', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#3f3f46', lineHeight: '1.55', margin: '0 0 20px' }
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