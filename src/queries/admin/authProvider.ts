import { OAuthProvider, Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import { FilterResult } from '../../lib/types';

async function findAuthProvider(
  criteria: Prisma.OAuthProviderFindUniqueArgs,
): Promise<OAuthProvider | null> {
  return prisma.client.oAuthProvider.findUnique(criteria);
}

export async function getAuthProvider(providerId: string) {
  return findAuthProvider({
    where: {
      id: providerId,
    },
  });
}

export async function getAuthProviders(
  criteria: Prisma.OAuthProviderFindManyArgs,
  filters: {},
): Promise<FilterResult<OAuthProvider[]>> {
  return prisma.pagedQuery('oAuthProvider', { ...criteria }, filters);
}

export async function createAuthProvider(
  data: Prisma.OAuthProviderCreateInput | Prisma.OAuthProviderUncheckedCreateInput,
): Promise<OAuthProvider> {
  return prisma.client.oAuthProvider.create({ data });
}

export async function updateAuthProvider(
  providerId: string,
  data: Prisma.OAuthProviderUpdateInput | Prisma.OAuthProviderUncheckedUpdateInput,
): Promise<OAuthProvider> {
  return prisma.client.oAuthProvider.update({
    where: {
      id: providerId,
    },
    data,
  });
}

export async function deleteAuthProvider(providerId: string) {
  return prisma.client.oAuthProvider.delete({
    where: {
      id: providerId,
    },
  });
}
