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
  answeredCount?: number
  resumeUrl?: string
}

const Email = ({ name, answeredCount = 0, resumeUrl = 'https://trends.exhibithappy.design/#assessment' }: Props) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>Pick up your exhibit program self-assessment where you left off</Preview>
    <Body style={main}>
      <Container style={container}>
        <BrandHeader />
        <div style={eyebrow}>2026 EXHIBIT TREND REPORT</div>
        <Heading style={h1}>Finish your assessment</Heading>
        <Text style={text}>
          {name ? `Hi ${name},` : 'Hi there,'} thanks for starting the self-assessment. You have answered{' '}
          {answeredCount} of 6 questions so far, and your progress is saved.
        </Text>
        <Text style={text}>
          Finish the remaining questions and our team will send back a personalized read on where your
          exhibit program stands against the 12 trends in the report.
        </Text>
        <Button style={button} href={resumeUrl}>
          Finish My Assessment
        </Button>
        <Text style={footer}>Exhibit Happy by Steelhead</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Finish your exhibit program assessment',
  displayName: 'Assessment: finish your assessment',
  previewData: { name: 'Jane', answeredCount: 3 },
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