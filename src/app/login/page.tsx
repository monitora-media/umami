import { Metadata } from 'next';
import LoginPage from './LoginPage';
import { useApi } from 'components/hooks';

export default async function ({searchParams}) {
  return <LoginPage token={searchParams['token']} />;
}

export const metadata: Metadata = {
  title: 'Login',
};
