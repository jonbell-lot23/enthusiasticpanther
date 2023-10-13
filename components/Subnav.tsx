// Subnav.tsx
import Link from "next/link";
import styles from "../styles/Subnav.module.css";

interface SubnavProps {
  showId: number | string;
}

const Subnav: React.FC<SubnavProps> = ({ showId }) => {
  return (
    <div className={styles.subnavContainer}>
      <Link href={`/show/${showId}`}>
        <a className={styles.subnavItem}>Summary</a>
      </Link>
      <Link href={`/histogram/${showId}/`}>
        <a className={styles.subnavItem}>Histogram</a>
      </Link>
    </div>
  );
};

export default Subnav;
