import { and, eq, type SQL } from 'drizzle-orm';
import { db } from './index';

// Row-ownership safety net. Every table in the schema has a `userId` text column;
// `userScoped(userId)` returns a thin wrapper around `db` that auto-applies
// `eq(table.userId, userId)` on every read/write and forces inserts to set
// userId to the scoped value. This is the app-layer replacement for Supabase-
// style RLS: all query sites that would have written `eq(table.userId, ...)`
// by hand must go through this helper instead.
//
// Usage:
//   const scoped = userScoped(session.user.id);
//   const [profile] = await scoped.select(profiles).limit(1);
//   await scoped.insert(waterLogs, { amountMl: 250 });
//   await scoped.update(fastingSessions, { endedAt: new Date() }, isNull(fastingSessions.endedAt));
//
// The wrapper intentionally returns `any` from each method — it forwards the
// Drizzle query builder so callers can still chain `.limit()`, `.orderBy()`,
// `.returning()`, `.onConflictDoUpdate()`. The trade-off is that the caller
// does not get precise row typing on the result; in exchange we get a single
// table-agnostic helper that guarantees every read/write is userId-scoped.

/* eslint-disable @typescript-eslint/no-explicit-any */

type OwnedTable = { userId: unknown };

function scopedWhere(table: OwnedTable, userId: string, extra?: SQL): SQL {
  const scope = eq((table as any).userId, userId);
  return extra ? and(scope, extra)! : scope;
}

export function userScoped(userId: string) {
  return {
    userId,

    select<T extends OwnedTable>(table: T, extra?: SQL): any {
      return db.select().from(table as any).where(scopedWhere(table, userId, extra));
    },

    selectFields<T extends OwnedTable, F extends Record<string, unknown>>(
      fields: F,
      table: T,
      extra?: SQL,
    ): any {
      return db.select(fields as any).from(table as any).where(scopedWhere(table, userId, extra));
    },

    insert<T extends OwnedTable>(table: T, values: Record<string, unknown>): any {
      return db.insert(table as any).values({ ...values, userId } as any);
    },

    update<T extends OwnedTable>(table: T, set: Record<string, unknown>, extra?: SQL): any {
      return db.update(table as any).set(set as any).where(scopedWhere(table, userId, extra));
    },

    delete<T extends OwnedTable>(table: T, extra?: SQL): any {
      return db.delete(table as any).where(scopedWhere(table, userId, extra));
    },
  };
}

export type UserScopedDb = ReturnType<typeof userScoped>;
