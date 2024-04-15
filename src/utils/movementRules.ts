export type MovementStatus = 'in' | 'out';

export interface MovementResult {
  success: string[];
  failed: string[];
}

/**
 * A shipment can only move to the opposite of where its last history entry
 * left it: something checked in can go out, and vice versa. A missing
 * history means the shipment was never received and cannot move at all.
 */
export const canMove = (lastStatus: string | undefined, target: MovementStatus): boolean =>
  lastStatus !== undefined && lastStatus !== target;
