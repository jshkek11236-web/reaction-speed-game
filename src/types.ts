/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameState = 'IDLE' | 'WAITING' | 'SIGNAL' | 'EARLY' | 'SUCCESS';

export interface Attempt {
  id: string;
  timeMs: number;
  timestamp: number;
}
