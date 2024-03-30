import { NextApiRequest, NextApiResponse } from 'next';
import { methodNotAllowed } from 'next-basics';
import { getAuthProviders } from '../../../queries';
import { ok } from 'next-basics';
import { callbackUrl } from '../../../lib/oauth';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    let providers = await getAuthProviders({}, {});

    providers.data = providers.data.map(
      ({ name, authorizationEndpoint, clientId, scope, enableCsrfProtection, id }) => {
        let authorizationUrl = new URL(authorizationEndpoint);
        authorizationUrl.searchParams.set('client_id', clientId);
        authorizationUrl.searchParams.set('response_type', 'code');
        authorizationUrl.searchParams.set('scope', scope);
        authorizationUrl.searchParams.set('redirect_uri', callbackUrl(id).href);

        return {
          name,
          authorizationEndpoint,
          clientId,
          scope,
          enableCsrfProtection,
          authorizationUrl,
          redirectUri: callbackUrl(id).href,
        };
      },
    );

    return ok(res, providers);
  }

  return methodNotAllowed(res);
};
