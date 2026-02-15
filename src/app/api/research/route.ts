import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { researchBusiness } from '@/lib/research';

export async function POST(request: Request) {
  try {
    const { businessName, website, location, businessType, businessId } = await request.json();

    if (!businessName) {
      return NextResponse.json({ error: 'businessName is required' }, { status: 400 });
    }

    try {
      const result = await researchBusiness({ businessName, website, location, businessType });

      // Store research results in Supabase
      if (businessId) {
        const supabase = createServerSupabaseClient();
        await supabase.from('research_results').insert({
          business_id: businessId,
          business_name: businessName,
          data: result,
          status: 'complete',
        });
      }

      return NextResponse.json({ ok: true, result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Research failed';
      if (businessId) {
        const supabase = createServerSupabaseClient();
        await supabase.from('research_results').insert({
          business_id: businessId,
          business_name: businessName,
          data: null,
          status: 'failed',
        });
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
