import { NextApiRequestQueryBody, SearchFilter } from 'lib/types';
import { pageInfo } from '../../../../lib/schema';
import * as yup from 'yup';
import { NextApiResponse } from 'next';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { canCreateAuthProvider, canListAuthProviders } from 'lib/auth';
import { uuid } from 'lib/crypto';
import { createAuthProvider, getAuthProviders } from 'queries';

const schema = {
  GET: yup.object().shape({
    ...pageInfo,
  }),
  POST: yup.object().shape({
    name: yup.string().max(100).required(),
    clientId: yup.string().required(),
    clientSecret: yup.string().required(),
    authorizationEndpoint: yup.string().url().required(),
    tokenEndpoint: yup.string().url().required(),
    userinfoEndpoint: yup.string().url().required(),
    idClaim: yup.string().required(),
    usernameClaim: yup.string().required(),
    displayNameClaim: yup.string().nullable(),
    logoUrlClaim: yup.string().nullable(),
    teamNamesClaim: yup.string().nullable(),
    scope: yup.string().nullable().nullable(),
    enableCsrfProtection: yup.boolean().nullable(),
    passAccessTokenViaGetParameter: yup.boolean().nullable(),
  }),
};

export type AuthProvidersRequestQuery = {};

export interface AuthProvidersRequestBody {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userinfoEndpoint: string;
  idClaim: string;
  usernameClaim: string;
  displayNameClaim?: string;
  logoUrlClaim?: string;
  teamNamesClaim?: string;
  scope?: string;
  enableCsrfProtection?: boolean;
  passAccessTokenViaGetParameter?: boolean;
}

export default async (
  req: NextApiRequestQueryBody<AuthProvidersRequestQuery, AuthProvidersRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  if (req.method === 'GET') {
    if (!canListAuthProviders(req.auth)) {
      return unauthorized(res);
    }

    const providers = await getAuthProviders({}, {});
    return ok(res, providers);
  }

  if (req.method === 'POST') {
    if (!canCreateAuthProvider(req.auth)) {
      return unauthorized(res);
    }

    const {
      name,
      clientId,
      clientSecret,
      authorizationEndpoint,
      tokenEndpoint,
      userinfoEndpoint,
      idClaim,
      usernameClaim,
      displayNameClaim,
      logoUrlClaim,
      teamNamesClaim,
      scope,
      enableCsrfProtection,
      passAccessTokenViaGetParameter,
    } = req.body;

    const data: any = {
      id: uuid(),
      name,
      clientId,
      clientSecret,
      authorizationEndpoint,
      tokenEndpoint,
      userinfoEndpoint,
      idClaim,
      usernameClaim,
      displayNameClaim,
      logoUrlClaim,
      teamNamesClaim,
      scope: scope || 'openid profile',
      enableCsrfProtection,
      passAccessTokenViaGetParameter,
      createdAt: new Date(),
      updatedAt: null,
    };

    const authProvider = await createAuthProvider(data);
    return ok(res, authProvider);
  }

  return methodNotAllowed(res);
};
