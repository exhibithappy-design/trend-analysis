import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { sendTemplateEmail } from '../_shared/transactional-email-templates/send-email.ts'

const REPORT_URL = 'https://trends.exhibithappy.design/#assessment'
const TOTAL_QUESTIONS = 6

type Action = 'start' | 'save' | 'submit'

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') return json({ error: 'Invalid body' }, 400)

    const name = String(body.name ?? '').trim().slice(0, 200)
    const email = String(body.email ?? '').trim().toLowerCase().slice(0, 320)
    const company = String(body.company ?? '').trim().slice(0, 200)
    const action: Action = ['start', 'save', 'submit'].includes(body.action) ? body.action : 'start'
    const answers = body.answers && typeof body.answers === 'object' ? body.answers : {}

    if (!name || !company) return json({ error: 'Name and company are required' }, 400)
    if (!isEmail(email)) return json({ error: 'A valid email is required' }, 400)

    const answeredCount = Object.values(answers as Record<string, { choice?: string }>).filter(
      (a) => a && typeof a === 'object' && a.choice,
    ).length
    const completed = action === 'submit' && answeredCount >= TOTAL_QUESTIONS

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: row, error } = await supabase
      .from('assessment_submissions')
      .upsert(
        {
          name,
          email,
          company,
          answers,
          answered_count: answeredCount,
          completed,
          submitted_at: action === 'submit' ? new Date().toISOString() : null,
          last_email_sent_at: new Date().toISOString(),
        },
        { onConflict: 'email' },
      )
      .select('id')
      .single()

    if (error) {
      console.error('assessment upsert failed', error)
      return json({ error: 'Could not save your assessment' }, 500)
    }

    const templateName = completed ? 'assessment-results' : 'assessment-finish'
    let emailSent = false
    try {
      const result = await sendTemplateEmail(templateName, email, {
        templateData: completed
          ? { name, resultsUrl: REPORT_URL }
          : { name, answeredCount, resumeUrl: REPORT_URL },
        idempotencyKey: `${templateName}-${row.id}-${action}-${answeredCount}`,
      })
      emailSent = result.sent
    } catch (err) {
      console.error('assessment email failed', err)
    }

    return json({ ok: true, completed, answeredCount, emailSent, template: templateName })
  } catch (err) {
    console.error('assessment-submit error', err)
    return json({ error: 'Unexpected error' }, 500)
  }
})