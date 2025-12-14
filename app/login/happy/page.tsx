import Link from "next/link";
import styles from "../page.module.css";
import JumpGame from "../components/JumpGame";

export default function HappyPage() {
  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h2>Mutlu Oyunu</h2>
        <p>Kunduzu zıplatıp yukarı çıkarmaya çalışın — ekrandaki çim blokları kullanın.</p>

        {/* Game component: uses images from /public/games/ (place your images here)
            Default placeholders: `/public/games/grass.svg` and `/public/games/beaver.svg` */}
        <div style={{ marginTop: 12 }}>
          <JumpGame grassSrc="/games/grass.png" beaverSrc="/games/beaver.png" />
        </div>

        <div style={{ marginTop: 12, textAlign: "center" }}>
          <Link href="/login">
            <button className={styles.guestButton}>Geri dön</button>
          </Link>
        </div>
      </div>
    </main>
  );
}
