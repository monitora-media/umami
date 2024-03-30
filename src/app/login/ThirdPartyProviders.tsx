import { useEffect } from 'react';
import styles from './ThirdPartyProviders.module.css'
import { Button } from 'react-basics';

export default function ThirdPartyProviders({providers}: {providers: Array<{name: string; authorizationUrl: string}>}) {
    useEffect(() => {
        console.log(providers)
    }, [providers])
    return (
        <div className={styles.providers}>
            <ul className={styles.providersList}>
                {providers.map(provider => (
                    <li key={provider.name} className={styles.providersItem}>
                        <Button onClick={() => {
                            window.location.href = provider.authorizationUrl
                        }} >{provider.name}</Button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
