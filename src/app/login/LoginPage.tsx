'use client';
import { useApi, useAuthMethods } from 'components/hooks';
import * as reactQuery from '@tanstack/react-query';
import { setClientAuthToken } from 'lib/client';
import { useRouter } from 'next/navigation';
import { setUser } from 'store/app';
import LoginForm from './LoginForm';
import ThirdPartyProviders from './ThirdPartyProviders';
import styles from './LoginPage.module.css';
import { useEffect } from 'react';
import { useApi as nextUseApi } from 'next-basics';

export function LoginPage(props: { token?: string }) {
  if (process.env.loginDisabled) {
    return null;
  }

  const { get } = nextUseApi(
    {
      authorization: `Bearer ${props.token}`,
    },
    process.env.basePath,
  );

  const router = useRouter();

  const providers = useAuthMethods();

  const { mutate, error, isPending } = reactQuery.useMutation({
    mutationFn: () => get('/me'),
  });

  useEffect(() => {
    if (props.token) {
      let data: any;
      mutate(data, {
        async onSuccess(user) {
          setClientAuthToken(props.token);
          setUser(user);
          router.push('/dashboard');
        },
      });
    }
  }, [props.token]);

  if (props.token) return (<div className={styles.page}>
    <h1>Logging you in…</h1></div>);

  return (
    <div className={styles.page}>
      <LoginForm />
      <h3>Or login with</h3>
      {providers.isLoading || <ThirdPartyProviders providers={providers.data.data} />}
    </div>
  );
}

export default LoginPage;
