import { useEffect } from 'react';
import styles from './ThirdPartyProviders.module.css';
import { Button, Flexbox } from 'react-basics';
import LinkButton from 'components/common/LinkButton';
import Favicon from 'components/common/Favicon';

export default function ThirdPartyProviders({
  providers,
}: {
  providers: Array<{ name: string; authorizationUrl: string }>;
}) {
  useEffect(() => {
    console.log(providers);
  }, [providers]);
  return (
    <div className={styles.providers}>
      <ul className={styles.providersList}>
        {providers.map(provider => (
          <li key={provider.name} className={styles.providersItem}>
            <LinkButton href={provider.authorizationUrl}>
              <Flexbox gap={10} alignItems='center'>
                <Favicon height={30} domain={new URL(provider.authorizationUrl).hostname} />
                {provider.name}
              </Flexbox>
            </LinkButton>
          </li>
        ))}
      </ul>
    </div>
  );
}
