import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/src/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    let query = supabaseServer.from('sources').select('*').range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`title.ilike.%${search}%,outlet.ilike.%${search}%,summary.ilike.%${search}%`);
    }

    if (dateFrom) {
      query = query.gte('date_published', dateFrom);
    }

    if (dateTo) {
      query = query.lte('date_published', dateTo);
    }

    const { data, error } = await query.order('date_published', { ascending: false });

    if (error) {
      console.error('Error fetching sources:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count: data?.length || 0 });
  } catch (error) {
    console.error('Error in /api/sources:', error);
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
  }
}

