/**
 * Script to test Supabase connection and verify environment variables
 * Run with: tsx scripts/test-supabase-connection.ts
 */

import { getSupabaseServer } from '../src/lib/supabase-server';

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const databaseUrl = process.env.DATABASE_URL;

  console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  if (supabaseUrl) {
    console.log(`    Value: ${supabaseUrl}`);
    
    // Validate URL format
    try {
      const url = new URL(supabaseUrl);
      console.log(`    Protocol: ${url.protocol}`);
      console.log(`    Hostname: ${url.hostname}`);
      
      // Test DNS resolution
      console.log(`\n  🔄 Testing DNS resolution...`);
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000),
        });
        console.log(`    ✅ DNS resolved successfully (Status: ${response.status})`);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log(`    ⚠️  DNS resolved but connection timed out`);
        } else if (error.message?.includes('getaddrinfo ENOTFOUND') || error.message?.includes('Could not resolve host')) {
          console.log(`    ❌ DNS resolution failed: ${error.message}`);
          console.log(`    💡 The domain '${url.hostname}' cannot be resolved.`);
          console.log(`    💡 Possible issues:`);
          console.log(`       - Project reference is incorrect`);
          console.log(`       - Project has been deleted or paused`);
          console.log(`       - Network/DNS issues`);
        } else {
          console.log(`    ⚠️  Connection error: ${error.message}`);
        }
      }
    } catch (error: any) {
      console.log(`    ❌ Invalid URL format: ${error.message}`);
    }
  }

  console.log(`  SUPABASE_SERVICE_KEY: ${serviceKey ? '✅ Set' : '❌ Missing'}`);
  if (serviceKey) {
    console.log(`    Length: ${serviceKey.length} characters`);
    console.log(`    Preview: ${serviceKey.substring(0, 20)}...`);
  }

  console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${anonKey ? '✅ Set' : '❌ Missing'}`);
  if (anonKey) {
    console.log(`    Length: ${anonKey.length} characters`);
    console.log(`    Preview: ${anonKey.substring(0, 20)}...`);
  }

  console.log(`  DATABASE_URL: ${databaseUrl ? '✅ Set' : '❌ Missing'}`);
  if (databaseUrl) {
    // Extract project reference from DATABASE_URL
    const match = databaseUrl.match(/@db\.([^.]+)\.supabase\.co/);
    if (match) {
      const projectRef = match[1];
      console.log(`    Project Reference: ${projectRef}`);
      console.log(`    Expected API URL: https://${projectRef}.supabase.co`);
      
      if (supabaseUrl && !supabaseUrl.includes(projectRef)) {
        console.log(`    ⚠️  WARNING: Project reference mismatch!`);
        console.log(`       DATABASE_URL uses: ${projectRef}`);
        console.log(`       NEXT_PUBLIC_SUPABASE_URL uses: ${supabaseUrl}`);
      }
    }
  }

  console.log('\n🔌 Testing Supabase Client...');

  try {
    const supabase = getSupabaseServer();
    console.log('  ✅ Supabase client created successfully');

    // Test a simple query
    console.log('\n📊 Testing database query...');
    const { data, error, count } = await supabase
      .from('people')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      console.log(`  ❌ Query failed: ${error.message}`);
      if (error.details) {
        console.log(`    Details: ${error.details}`);
      }
      if (error.hint) {
        console.log(`    Hint: ${error.hint}`);
      }
      if (error.code) {
        console.log(`    Code: ${error.code}`);
      }
    } else {
      console.log(`  ✅ Query successful`);
      console.log(`    Records in 'people' table: ${count ?? 0}`);
    }
  } catch (error: any) {
    console.log(`  ❌ Failed to create Supabase client: ${error.message}`);
    console.log(`    ${error.stack}`);
  }

  console.log('\n📝 Next Steps:');
  console.log('  1. Verify your Supabase project URL in the Supabase dashboard');
  console.log('  2. Check that your project is active (not paused)');
  console.log('  3. Verify your API keys in Project Settings > API');
  console.log('  4. Ensure your .env.local file has the correct values');
  console.log('  5. If the project reference is wrong, update NEXT_PUBLIC_SUPABASE_URL');
}

testConnection().catch(console.error);

