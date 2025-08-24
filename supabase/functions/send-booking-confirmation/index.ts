
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingPayload {
  to?: string;
  status?: string;
  language?: string;
  booking: {
    booking_code?: string;
    booking_date?: string;
    start_time?: string;
    duration_hours?: number;
    room_id?: string;
    customer_name?: string;
    customer_phone?: string;
    price_total?: number;
    guest_count?: number | null;
  };
}

function renderTemplate(tpl: string, data: Record<string, any>) {
  return tpl.replace(/{{\s*([\w\.]+)\s*}}/g, (_m, key) => {
    const parts = String(key).split('.')
    let cur: any = data
    for (const p of parts) {
      cur = cur?.[p]
      if (cur === undefined || cur === null) return ''
    }
    return String(cur)
  })
}

async function log(level: 'info' | 'warn' | 'error', message: string, context?: any) {
  try {
    await supabase.from('app_logs').insert({
      level,
      message,
      source: 'server',
      component: 'send-booking-confirmation',
      route: '/functions/send-booking-confirmation',
      context: context || null,
    });
  } catch (_) {}
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as BookingPayload;
    const to = body.to || "info@kbox.co.il";
    const b = body.booking || {};
    const status = (body.status || 'approved').toLowerCase();
    const language = (body.language || 'he').toLowerCase();
    await log('info', 'Email invoke', { to_present: !!body.to, status, language, booking_code: b.booking_code });

    // Load business settings (single row)
    const { data: biz } = await supabase.from('business_settings').select('*').limit(1).maybeSingle();
    const business = {
      name: biz?.company_name || 'K-Box',
      phone: biz?.phone || '',
      email: biz?.email || '',
      website: biz?.website || '',
    };

    // Load template by status+language
    const { data: tpl } = await supabase
      .from('booking_email_templates')
      .select('subject, body_html, enabled')
      .eq('status', status)
      .eq('language', language)
      .eq('enabled', true)
      .maybeSingle();

    let subject = tpl?.subject || `אישור שריון הזמנה - ${b.booking_code ?? ''}`;
    let html = tpl?.body_html || `
      <div dir="rtl" style="font-family:Arial,Helvetica,sans-serif">
        <h2>תודה! ההזמנה שוריינה</h2>
        <p>מספר הזמנה: <strong>{{booking_code}}</strong></p>
        <p>תאריך: <strong>{{booking_date}}</strong></p>
        <p>שעה: <strong>{{start_time}}</strong></p>
        <p>משך: <strong>{{duration_hours}} שעות</strong></p>
        <p>מספר משתתפים: <strong>{{guest_count}}</strong></p>
        <p>שם הלקוח/ה: <strong>{{customer_name}}</strong></p>
        <p>טלפון: <strong>{{customer_phone}}</strong></p>
        <p>סכום משוער: <strong>₪{{price_total}}</strong></p>
        <hr />
        <p>לתשומת ליבך: התשלום מתבצע במקום.</p>
        <p>בברכה,<br />{{business.name}} | {{business.phone}}</p>
      </div>
    `;

    subject = renderTemplate(subject, { ...b, business });
    html = renderTemplate(html, { ...b, business });

    if (!Deno.env.get("RESEND_API_KEY")) {
      console.warn("RESEND_API_KEY not set - skipping email send");
      return new Response(JSON.stringify({ ok: true, skipped: true, subject, html }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const resp = await resend.emails.send({
      from: `${business.name} <onboarding@resend.dev>`,
      to: [to],
      subject,
      html,
    });

    return new Response(JSON.stringify({ ok: true, resp }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-booking-confirmation error:", error);
    return new Response(JSON.stringify({ error: error.message || "unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
