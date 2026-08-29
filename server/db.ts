import fs from 'fs';
import path from 'path';
import { AdminStats, AuditRecord } from '../src/types.js';

interface DatabaseSchema {
  audits: Record<string, AuditRecord>;
  cache: Record<string, { auditId: string; timestamp: number }>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

function loadDB(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read store.json, creating new database state:', err);
  }
  return {
    audits: {},
    cache: {},
  };
}

function saveDB(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save store.json:', err);
  }
}

// In-memory runtime cache instance
let db = loadDB();

export function getAudit(id: string): AuditRecord | null {
  return db.audits[id] || null;
}

export function saveAudit(record: AuditRecord): void {
  db.audits[record.id] = record;
  // Cache by normalized URL (valid for 2 hours)
  db.cache[record.url] = {
    auditId: record.id,
    timestamp: Date.now(),
  };
  saveDB(db);
}

export function getCachedAuditByUrl(url: string, maxAgeMs = 2 * 60 * 60 * 1000): AuditRecord | null {
  const cached = db.cache[url];
  if (cached && Date.now() - cached.timestamp < maxAgeMs) {
    const record = db.audits[cached.auditId];
    if (record && record.status === 'completed') {
      return record;
    }
  }
  return null;
}

export function getAdminStats(): AdminStats {
  const allAudits = Object.values(db.audits);
  const totalAudits = allAudits.length;

  // Domain popularity
  const domainCounts: Record<string, number> = {};
  // Unique users tracking
  const uniqueUsersSet = new Set<string>();

  allAudits.forEach(a => {
    domainCounts[a.domain] = (domainCounts[a.domain] || 0) + 1;
    if (a.userEmail) {
      uniqueUsersSet.add(a.userEmail.toLowerCase().trim());
    }
  });

  const topDomains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([domain, count]) => ({ domain, count }));

  const recentAudits = allAudits
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 15)
    .map(a => ({
      id: a.id,
      url: a.url,
      overallScore: a.overallScore,
      createdAt: a.createdAt,
    }));

  return {
    totalAudits,
    totalUsers: uniqueUsersSet.size || 1, // Fallback to at least 1 guest user
    topDomains,
    recentAudits,
    apiHealth: {
      geminiStatus: process.env.GEMINI_API_KEY ? 'operational' : 'mock',
      pageSpeedStatus: 'operational',
    },
  };
}
