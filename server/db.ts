import fs from 'fs';
import path from 'path';
import { AdminStats, AuditRecord } from '../src/types.js';

interface PurchaseRecord {
  id: string;
  userEmail: string;
  auditId?: string;
  planId: string;
  planName: string;
  amount: number;
  credits: number;
  paddleTransactionId?: string;
  gateway?: 'paddle';
  createdAt: string;
}

interface UserRecord {
  email: string;
  credits: number;
  totalPurchased: number;
  createdAt: string;
}

interface DatabaseSchema {
  audits: Record<string, AuditRecord>;
  users: Record<string, UserRecord>;
  purchases: PurchaseRecord[];
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
    users: {},
    purchases: [],
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

export function unlockAudit(auditId: string, userEmail?: string): AuditRecord | null {
  const record = db.audits[auditId];
  if (!record) return null;

  record.isPaid = true;
  if (userEmail) {
    record.userEmail = userEmail;
    // ensure user exists
    if (!db.users[userEmail]) {
      db.users[userEmail] = {
        email: userEmail,
        credits: 0,
        totalPurchased: 1,
        createdAt: new Date().toISOString(),
      };
    }
  }

  saveDB(db);
  return record;
}

export function recordPurchase(
  email: string,
  planId: string,
  planName: string,
  amount: number,
  credits: number,
  auditId?: string,
  paddleTransactionId?: string
): PurchaseRecord {
  const purchase: PurchaseRecord = {
    id: `pur_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userEmail: email,
    auditId,
    planId,
    planName,
    amount,
    credits,
    paddleTransactionId: paddleTransactionId || `txn_pad_${Date.now()}`,
    gateway: 'paddle',
    createdAt: new Date().toISOString(),
  };

  db.purchases.unshift(purchase);

  if (!db.users[email]) {
    db.users[email] = {
      email,
      credits: 0,
      totalPurchased: 0,
      createdAt: new Date().toISOString(),
    };
  }

  db.users[email].credits += credits;
  db.users[email].totalPurchased += amount;

  if (auditId && db.audits[auditId]) {
    db.audits[auditId].isPaid = true;
    db.audits[auditId].userEmail = email;
  }

  saveDB(db);
  return purchase;
}

export function getUserCredits(email: string): { email: string; remainingCredits: number; totalPurchased: number } {
  const user = db.users[email];
  return {
    email,
    remainingCredits: user?.credits || 0,
    totalPurchased: user?.totalPurchased || 0,
  };
}

export function useUserCredit(email: string, auditId: string): boolean {
  const user = db.users[email];
  if (!user || user.credits < 1) return false;

  user.credits -= 1;
  if (db.audits[auditId]) {
    db.audits[auditId].isPaid = true;
    db.audits[auditId].userEmail = email;
  }
  saveDB(db);
  return true;
}

export function getAdminStats(): AdminStats {
  const allAudits = Object.values(db.audits);
  const paidAudits = allAudits.filter(a => a.isPaid).length;
  const totalAudits = allAudits.length;
  const freeScans = totalAudits - paidAudits;

  let totalRevenue = 0;
  db.purchases.forEach(p => {
    totalRevenue += p.amount;
  });

  const conversionRate = totalAudits > 0 ? Math.round((paidAudits / totalAudits) * 100) : 0;

  // Domain popularity
  const domainCounts: Record<string, number> = {};
  allAudits.forEach(a => {
    domainCounts[a.domain] = (domainCounts[a.domain] || 0) + 1;
  });

  const topDomains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([domain, count]) => ({ domain, count }));

  const recentPurchases = db.purchases.slice(0, 10).map(p => ({
    id: p.id,
    email: p.userEmail,
    plan: p.planName,
    amount: p.amount,
    createdAt: p.createdAt,
  }));

  const recentAudits = allAudits
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 15)
    .map(a => ({
      id: a.id,
      url: a.url,
      overallScore: a.overallScore,
      isPaid: a.isPaid,
      createdAt: a.createdAt,
    }));

  return {
    totalAudits,
    paidAudits,
    freeScans,
    totalRevenue,
    conversionRate,
    totalUsers: Object.keys(db.users).length,
    topDomains,
    recentPurchases,
    recentAudits,
    apiHealth: {
      geminiStatus: process.env.GEMINI_API_KEY ? 'operational' : 'mock',
      pageSpeedStatus: 'operational',
    },
  };
}
