import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/src/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const actorId = searchParams.get('actor_id');
    const topicIds = searchParams.get('topic_ids');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    // Select statements with joined source data
    let query = supabaseServer
      .from('statements')
      .select(`
        *,
        sources (
          id,
          title,
          url,
          outlet,
          date_published
        )
      `)
      .range(offset, offset + limit - 1);

    if (actorId) {
      query = query.eq('actor_id', actorId);
    }

    if (topicIds) {
      // Topic IDs is a comma-separated string in the database
      // Filter by checking if topic_ids contains any of the requested topics
      const topics = topicIds.split(',').map((t) => t.trim());
      // Use text search - check if topic_ids contains any of the requested topics
      const topicFilters = topics.map((topic) => `topic_ids.ilike.%${topic}%`).join(',');
      query = query.or(topicFilters);
    }

    if (dateFrom) {
      query = query.gte('date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('date', dateTo);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      console.error('Error fetching statements:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count: data?.length || 0 });
  } catch (error) {
    console.error('Error in /api/statements:', error);
    return NextResponse.json({ error: 'Failed to fetch statements' }, { status: 500 });
  }
}

