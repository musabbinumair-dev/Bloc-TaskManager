// Clean seed data file - no hardcoded demo accounts or tasks
export const SEED_TASKS: any[] = [];
export const SEED_DONE: any[] = [];

export async function seedIfEmpty() {
  // Fresh clean database - no hardcoded demo data
  return Promise.resolve();
}
