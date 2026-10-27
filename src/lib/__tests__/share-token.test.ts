/**
 * Regression guard for GHSA-3xx8-742v-m4mq.
 *
 * `parseShareToken` must only accept tokens explicitly minted as share tokens.
 * Any other token signed with the shared secret - e.g. the session token the
 * tracker gets back from POST /api/send - must be rejected, otherwise it can be
 * replayed as a share token to read a website's analytics with no login.
 */

// auth.ts pulls in the redis client and DB queries at module load; stub them so
// parseShareToken can be imported in isolation (it uses neither).
jest.mock('@umami/redis-client', () => ({ __esModule: true, default: { client: {} } }), {
  virtual: true,
});
jest.mock('queries', () => ({ getTeamUser: jest.fn(), getWebsite: jest.fn() }), { virtual: true });

process.env.APP_SECRET = 'test-secret-for-ci';

import { createToken } from 'next-basics';
import { parseShareToken } from '../auth';
import { secret } from '../crypto';
import { SHARE_TOKEN_HEADER, SHARE_TOKEN_TYPE } from '../constants';

const reqWith = (token: string) => ({ headers: { [SHARE_TOKEN_HEADER]: token } } as any);

describe('parseShareToken (GHSA-3xx8-742v-m4mq)', () => {
  it('rejects a token not minted as a share token (e.g. an /api/send session token)', () => {
    const sessionLikeToken = createToken({ websiteId: 'w1' }, secret());
    expect(parseShareToken(reqWith(sessionLikeToken))).toBeNull();
  });

  it('accepts a genuine share token', () => {
    const shareToken = createToken({ websiteId: 'w1', type: SHARE_TOKEN_TYPE }, secret());
    expect(parseShareToken(reqWith(shareToken))).toMatchObject({
      websiteId: 'w1',
      type: SHARE_TOKEN_TYPE,
    });
  });

  it('rejects a garbage token', () => {
    expect(parseShareToken(reqWith('not-a-valid-token'))).toBeNull();
  });
});
