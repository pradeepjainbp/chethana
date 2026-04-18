import { describe, it, expect, afterAll } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from './index';
import { waterLogs } from './schema';
import { userScoped } from './scoped';

// Cross-user isolation proof for `userScoped()` against the live Neon DB.
// This is the test that backs the R3 safety claim: an /api/* route using
// `scoped.select/update/delete` on behalf of user A can never read, mutate,
// or delete rows owned by user B — and `scoped.insert` always stamps its
// own userId even if the caller tries to pass someone else's.

const ts = Date.now();
const USER_A = `test-user-a-${ts}`;
const USER_B = `test-user-b-${ts}`;

const scopedA = userScoped(USER_A);
const scopedB = userScoped(USER_B);

afterAll(async () => {
  await db.delete(waterLogs).where(eq(waterLogs.userId, USER_A));
  await db.delete(waterLogs).where(eq(waterLogs.userId, USER_B));
});

describe('userScoped — cross-user isolation', () => {
  it('read: user B cannot see user A rows', async () => {
    await scopedA.insert(waterLogs, { amountMl: 250, loggedAt: new Date() });
    await scopedA.insert(waterLogs, { amountMl: 500, loggedAt: new Date() });

    const bRows = await scopedB.select(waterLogs);
    expect(bRows.length).toBe(0);

    const aRows = await scopedA.select(waterLogs);
    expect(aRows.length).toBe(2);
  });

  it('update: user B updating "all" rows leaves user A rows untouched', async () => {
    const [created] = await scopedA
      .insert(waterLogs, { amountMl: 100, loggedAt: new Date() })
      .returning();

    await scopedB.update(waterLogs, { amountMl: 9999 });

    const [after] = await scopedA.select(waterLogs, eq(waterLogs.id, created.id));
    expect(after.amountMl).toBe(100);
  });

  it('delete: user B deleting "all" rows leaves user A rows intact', async () => {
    const [created] = await scopedA
      .insert(waterLogs, { amountMl: 150, loggedAt: new Date() })
      .returning();

    await scopedB.delete(waterLogs);

    const [after] = await scopedA.select(waterLogs, eq(waterLogs.id, created.id));
    expect(after).toBeDefined();
    expect(after.amountMl).toBe(150);
  });

  it('insert: ignores any userId the caller tries to spoof', async () => {
    const [created] = await scopedA
      .insert(waterLogs, {
        amountMl: 200,
        loggedAt: new Date(),
        userId: USER_B,
      })
      .returning();

    expect(created.userId).toBe(USER_A);
  });
});
