/**
 * Script to import CSV data into Supabase
 * Run with: tsx scripts/import-csv-data.ts
 * 
 * Requires DATABASE_URL environment variable:
 * DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
 */

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as Papa from 'papaparse';

// Load environment variables
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set');
  console.error('Please set it in your .env.local file:');
  console.error('DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.yeyytxdwwgraesyiyqfl.supabase.co:5432/postgres');
  process.exit(1);
}

// Create PostgreSQL client
const client = new Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Supabase requires SSL
  },
});

interface CSVRow {
  [key: string]: string;
}

function parseCSV(filePath: string): CSVRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const result = Papa.parse<CSVRow>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim(),
  });

  if (result.errors.length > 0) {
    console.warn('CSV parsing errors:', result.errors);
  }

  return result.data;
}

async function importPeople(filePath: string) {
  console.log(`\nImporting people from ${filePath}...`);
  const rows = parseCSV(filePath);
  console.log(`Found ${rows.length} people`);

  const people = rows
    .map((row) => ({
      id: row.id || '',
      name: row.name || '',
      role: row.role || null,
      jurisdiction: row.jurisdiction || null,
      actor_type: row.actor_type || null,
      active_since: row.active_since || null,
      notes: row.notes || null,
      affiliations: row.affiliations || null,
    }))
    .filter((p) => p.id); // Filter out rows without ID

  if (people.length === 0) {
    console.log('No valid people to import');
    return;
  }

  // Insert using PostgreSQL
  for (const person of people) {
    await client.query(
      `INSERT INTO people (id, name, role, jurisdiction, actor_type, active_since, notes, affiliations)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         role = EXCLUDED.role,
         jurisdiction = EXCLUDED.jurisdiction,
         actor_type = EXCLUDED.actor_type,
         active_since = EXCLUDED.active_since,
         notes = EXCLUDED.notes,
         affiliations = EXCLUDED.affiliations`,
      [
        person.id,
        person.name,
        person.role,
        person.jurisdiction,
        person.actor_type,
        person.active_since,
        person.notes,
        person.affiliations,
      ]
    );
  }

  console.log(`✅ Imported ${people.length} people`);
}

async function importOrganizations(filePath: string) {
  console.log(`\nImporting organizations from ${filePath}...`);
  const rows = parseCSV(filePath);
  console.log(`Found ${rows.length} organizations`);

  const organizations = rows
    .map((row) => ({
      id: row.id || '',
      name: row.name || '',
      type: row.type || null,
      location: row.location || null,
      links: row.links || null,
      key_people: row.key_people || null,
      notes: row.notes || null,
      affiliated: row.affiliated || null,
    }))
    .filter((o) => o.id); // Filter out rows without ID

  if (organizations.length === 0) {
    console.log('No valid organizations to import');
    return;
  }

  // Insert using PostgreSQL
  for (const org of organizations) {
    await client.query(
      `INSERT INTO organizations (id, name, type, location, links, key_people, notes, affiliated)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         type = EXCLUDED.type,
         location = EXCLUDED.location,
         links = EXCLUDED.links,
         key_people = EXCLUDED.key_people,
         notes = EXCLUDED.notes,
         affiliated = EXCLUDED.affiliated`,
      [
        org.id,
        org.name,
        org.type,
        org.location,
        org.links,
        org.key_people,
        org.notes,
        org.affiliated,
      ]
    );
  }

  console.log(`✅ Imported ${organizations.length} organizations`);
}

async function importTopics(filePath: string) {
  console.log(`\nImporting topics from ${filePath}...`);
  const rows = parseCSV(filePath);
  console.log(`Found ${rows.length} topics`);

  const topics = rows
    .map((row) => ({
      id: row.id || '',
      label: row.label || '',
      definition: row.definition || null,
      domain: row.domain || null,
      related_topics: row.related_topics || null,
    }))
    .filter((t) => t.id); // Filter out rows without ID

  if (topics.length === 0) {
    console.log('No valid topics to import');
    return;
  }

  // Insert using PostgreSQL
  for (const topic of topics) {
    await client.query(
      `INSERT INTO topics (id, label, definition, domain, related_topics)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         label = EXCLUDED.label,
         definition = EXCLUDED.definition,
         domain = EXCLUDED.domain,
         related_topics = EXCLUDED.related_topics`,
      [topic.id, topic.label, topic.definition, topic.domain, topic.related_topics]
    );
  }

  console.log(`✅ Imported ${topics.length} topics`);
}

async function importSources(filePath: string) {
  console.log(`\nImporting sources from ${filePath}...`);
  const rows = parseCSV(filePath);
  console.log(`Found ${rows.length} sources`);

  const sources = rows
    .map((row) => ({
      id: row.id || null,
      date_published: row.date_published || null,
      outlet: row.outlet || null,
      type: row.type || null,
      title: row.title || null,
      topic: row.topic || null,
      summary: row.summary || null,
      url: row.url || null,
    }))
    .filter((s) => s.id); // Filter out rows without ID

  if (sources.length === 0) {
    console.log('No valid sources to import');
    return;
  }

  // Insert using PostgreSQL
  for (const source of sources) {
    await client.query(
      `INSERT INTO sources (id, date_published, outlet, type, title, topic, summary, url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         date_published = EXCLUDED.date_published,
         outlet = EXCLUDED.outlet,
         type = EXCLUDED.type,
         title = EXCLUDED.title,
         topic = EXCLUDED.topic,
         summary = EXCLUDED.summary,
         url = EXCLUDED.url`,
      [
        source.id,
        source.date_published || null,
        source.outlet,
        source.type,
        source.title,
        source.topic,
        source.summary,
        source.url,
      ]
    );
  }

  console.log(`✅ Imported ${sources.length} sources`);
}

async function importStatements(filePath: string) {
  console.log(`\nImporting statements from ${filePath}...`);
  const rows = parseCSV(filePath);
  console.log(`Found ${rows.length} statements`);

  const statements = rows
    .map((row) => ({
      id: row.id || '',
      date: row.date || null,
      actor_id: row.actor_id || null,
      type: row.type || null,
      short_quote: row.short_quote || null,
      topic_ids: row.topic_ids || null,
      source_id: row.source_id || null,
      notes: row.notes || null,
    }))
    .filter((s) => s.id && s.date && s.actor_id); // Filter out rows without required fields

  if (statements.length === 0) {
    console.log('No valid statements to import');
    return;
  }

  // Insert using PostgreSQL
  for (const statement of statements) {
    await client.query(
      `INSERT INTO statements (id, date, actor_id, type, short_quote, topic_ids, source_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         date = EXCLUDED.date,
         actor_id = EXCLUDED.actor_id,
         type = EXCLUDED.type,
         short_quote = EXCLUDED.short_quote,
         topic_ids = EXCLUDED.topic_ids,
         source_id = EXCLUDED.source_id,
         notes = EXCLUDED.notes`,
      [
        statement.id,
        statement.date,
        statement.actor_id,
        statement.type,
        statement.short_quote,
        statement.topic_ids,
        statement.source_id,
        statement.notes,
      ]
    );
  }

  console.log(`✅ Imported ${statements.length} statements`);
}

async function main() {
  // Use the Downloads folder path from the user's system
  // On Windows, use USERPROFILE; on Unix, use HOME
  const homeDir = process.env.USERPROFILE || process.env.HOME || process.env.HOMEPATH || '';
  const csvDir = path.join(homeDir, 'Downloads');
  
  console.log(`Looking for CSV files in: ${csvDir}`);
  
  const files = {
    people: path.join(csvDir, 'Right wing tracker prelim spreadsheet - People.csv'),
    organizations: path.join(csvDir, 'Right wing tracker prelim spreadsheet - Organisations.csv'),
    topics: path.join(csvDir, 'Right wing tracker prelim spreadsheet - Topics.csv'),
    sources: path.join(csvDir, 'Right wing tracker prelim spreadsheet - Sources.csv'),
    statements: path.join(csvDir, 'Right wing tracker prelim spreadsheet - Statements.csv'),
  };

  // Check if files exist
  for (const [name, filePath] of Object.entries(files)) {
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      console.error(`Please ensure the CSV files are in your Downloads folder`);
      process.exit(1);
    }
  }

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Import in order (sources first since statements reference them)
    await importTopics(files.topics);
    await importPeople(files.people);
    await importOrganizations(files.organizations);
    await importSources(files.sources);
    await importStatements(files.statements);

    console.log('\n✅ Import complete!');
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
