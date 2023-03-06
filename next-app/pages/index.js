import styles from "../styles/Home.module.css";
import { useWallet } from '../context/Provider';

const IndexPage = () => {
  const { isAuthenticated, connectWallet, disconnectWallet, signInWithEthereum, getInformation, account } = useWallet();
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Next.js chrome extension +<a href="https://login.xyz/"> Ethereum sign-in</a>
        </h1>
        <button onClick={isAuthenticated ? disconnectWallet : connectWallet} id="wallet-connect">
          {isAuthenticated ? `Disconnect Wallet: ${account}` : "Connect Wallet"}
        </button>
        {isAuthenticated ? (
         <div>
          <button onClick={signInWithEthereum} id="wallet-connect">
          Sign in with Ethereum
          </button>
          <button onClick={getInformation} id="wallet-connect">
          getInformation
          </button>
         </div>
        ) : 
        <p className={styles.description}>
          Log in first
        </p>}
      </main>

      <footer className={styles.footer}>
      </footer>
    </div>
  );
};

export default IndexPage;
