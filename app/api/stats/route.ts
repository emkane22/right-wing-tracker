import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/src/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    // Get counts for each table
    const [peopleCount, orgsCount, topicsCount, sourcesCount, statementsCount] = await Promise.all([
      supabaseServer.from('people').select('id', { count: 'exact', head: true }),
      supabaseServer.from('organizations').select('id', { count: 'exact', head: true }),
      supabaseServer.from('topics').select('id', { count: 'exact', head: true }),
      supabaseServer.from('sources').select('id', { count: 'exact', head: true }),
      supabaseServer.from('statements').select('id', { count: 'exact', head: true }),
    ]);

    // Get recent activity (statements in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const { count: recentStatements } = await supabaseServer
      .from('statements')
      .select('id', { count: 'exact', head: true })
      .gte('date', dateStr);

    // Get topic frequency (most mentioned topics in statements)
    const { data: statements } = await supabaseServer
      .from('statements')
      .select('topic_ids')
      .gte('date', dateStr);

    // Count topics
    const topicCounts: Record<string, number> = {};
    statements?.forEach((stmt) => {
      if (stmt.topic_ids) {
        const topics = stmt.topic_ids.split(',').map((t) => t.trim());
        topics.forEach((topic) => {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        });
      }
    });

    const topTopics = Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      people: peopleCount.count || 0,
      organizations: orgsCount.count || 0,
      topics: topicsCount.count || 0,
      sources: sourcesCount.count || 0,
      statements: statementsCount.count || 0,
      recentStatements: recentStatements || 0,
      topTopics,
    });
  } catch (error) {
    console.error('Error in /api/stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

