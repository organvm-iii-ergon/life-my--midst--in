import type { Pool } from 'pg';
import type { IdentityCore } from '@in-midst-my-life/schema';

export interface IdentityCoreRow {
  id: string;
  profile_id: string;
  thesis: string;
  invariants: string[];
  master_keywords: string[];
  intellectual_lineage: string[];
  strategic_differentiators: string[];
  tensions: string[];
  constraints: string[];
  created_at: string;
  updated_at: string;
}

export interface IdentityCoreRepo {
  getByProfileId(profileId: string): Promise<IdentityCoreRow | null>;
  upsert(profileId: string, data: IdentityCore): Promise<IdentityCoreRow>;
  deleteByProfileId(profileId: string): Promise<boolean>;
}

export function createIdentityCoreRepo(pool: Pool): IdentityCoreRepo {
  return {
    async getByProfileId(profileId: string): Promise<IdentityCoreRow | null> {
      const result = await pool.query<IdentityCoreRow>(
        `SELECT * FROM identity_core WHERE profile_id = $1`,
        [profileId],
      );
      return result.rows[0] ?? null;
    },

    async upsert(profileId: string, data: IdentityCore): Promise<IdentityCoreRow> {
      const result = await pool.query<IdentityCoreRow>(
        `INSERT INTO identity_core (profile_id, thesis, invariants, master_keywords, intellectual_lineage, strategic_differentiators, tensions, constraints)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (profile_id) DO UPDATE SET
           thesis = EXCLUDED.thesis,
           invariants = EXCLUDED.invariants,
           master_keywords = EXCLUDED.master_keywords,
           intellectual_lineage = EXCLUDED.intellectual_lineage,
           strategic_differentiators = EXCLUDED.strategic_differentiators,
           tensions = EXCLUDED.tensions,
           constraints = EXCLUDED.constraints,
           updated_at = now()
         RETURNING *`,
        [
          profileId,
          data.thesis,
          JSON.stringify(data.invariants),
          JSON.stringify(data.master_keywords),
          JSON.stringify(data.intellectual_lineage),
          JSON.stringify(data.strategic_differentiators),
          JSON.stringify(data.tensions),
          JSON.stringify(data.constraints),
        ],
      );
      return result.rows[0]!;
    },

    async deleteByProfileId(profileId: string): Promise<boolean> {
      const result = await pool.query(`DELETE FROM identity_core WHERE profile_id = $1`, [
        profileId,
      ]);
      return (result.rowCount ?? 0) > 0;
    },
  };
}
