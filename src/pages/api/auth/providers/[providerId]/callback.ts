import { Team, TeamUser } from '@prisma/client';
import redis from '@umami/redis-client';
import debug from 'debug';
import { NextApiRequest, NextApiResponse } from 'next';
import {
    badRequest,
    createSecureToken,
    methodNotAllowed,
    notFound,
    ok,
    serverError,
} from 'next-basics';
import * as yup from 'yup';
import { saveAuth } from '../../../../../lib/auth';
import { ROLES } from '../../../../../lib/constants';
import { secret, uuid } from '../../../../../lib/crypto';
import { callbackUrl } from '../../../../../lib/oauth';
import {
    createTeamUser,
    createUser,
    findTeamByName,
    getAuthProvider,
    getUserByUsername,
    updateUser,
} from '../../../../../queries';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const { providerId } = req.query;
    const searchParams = new URL(req.url!, 'http://api').searchParams;

    if (!searchParams.get('code')) {
      return badRequest(res, searchParams.get('error') ?? '');
    }

    const provider = await getAuthProvider(providerId as string);

    if (!provider) {
      return notFound(res);
    }

    const tokenExchangeEndpoint = new URL(provider.tokenEndpoint);

    let tokenResponse: Record<string, any>;
    try {
      tokenResponse = await fetch(tokenExchangeEndpoint.href, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${provider.clientId}:${provider.clientSecret}`,
          ).toString('base64')}`,
        },
        body: new URLSearchParams({
          code: searchParams.get('code')!,
          redirect_uri: callbackUrl(providerId as string).href,
          grant_type: 'authorization_code',
          client_id: provider.clientId,
          client_secret: provider.clientSecret,
        }),
      }).then(res => res.json());
    } catch (error) {
      console.error(error);
      return serverError(res);
    }

    if (!('access_token' in tokenResponse)) {
      return serverError(res, 'No access token in response');
    }

    const { access_token: accessToken } = tokenResponse as { access_token: string };

    let userInfoEndpoint = new URL(provider.userinfoEndpoint);
    if (provider.passAccessTokenViaGetParameter) {
      userInfoEndpoint.searchParams.set('access_token', accessToken);
    }

    let userinfo: Record<string, any>;

    try {
      userinfo = await fetch(userInfoEndpoint.href, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then(res => res.json());
    } catch (error) {
      console.error(error);
      return serverError(res);
    }

    const userinfoSchema = yup.object().shape({
      [provider.usernameClaim]: yup.string().required(),
      [provider.displayNameClaim]: yup.string().nullable(),
      [provider.teamNamesClaim]: yup.array().of(yup.string()).nullable(),
      [provider.logoUrlClaim]: yup.string().nullable(),
    });

    await userinfoSchema.validate(userinfo);

    const username: string = userinfo[provider.usernameClaim];
    const displayName: string | undefined = provider.displayNameClaim
      ? userinfo[provider.displayNameClaim]
      : undefined;
    const teamNames: string[] = provider.teamNamesClaim ? userinfo[provider.teamNamesClaim] : [];
    const logoUrl: string | undefined = provider.logoUrlClaim
      ? userinfo[provider.logoUrlClaim]
      : undefined;

    let user = await getUserByUsername(username);

    if (user) {
      user = await updateUser(user.id, {
        displayName,
        logoUrl,
      });
    } else {
      user = await createUser({
        id: uuid(),
        username,
        password: '',
        role: ROLES.user,
        logoUrl,
        displayName,
      });
    }

    for (const teamName of teamNames) {
      const team = (await findTeamByName(teamName, { includeMembers: true })) as
        | null
        | (Team & { teamUser: Array<TeamUser> });
      if (!team) continue;

      if (!team.teamUser.some(tu => tu.userId === user.id)) {
        await createTeamUser(user.id, team.id, ROLES.teamMember);
      }
    }

    if (redis.enabled) {
      const token = await saveAuth({ userId: user.id });

      return ok(res, { token, user });
    }

    const token = createSecureToken({ userId: user.id }, secret());

    res.redirect(`/login?${new URLSearchParams({ token })}`);
  }

  return methodNotAllowed(res);
};
