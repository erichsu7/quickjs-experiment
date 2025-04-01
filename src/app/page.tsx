"use client"

import styles from "./page.module.css";
import { useState } from 'react'

export default function Home() {
  const [code, setCode] = useState('')

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <input name="code" type="text" value={code} onChange={e => setCode(e.target.value)} />
        <button>Run code</button>
      </main>
    </div>
  );
}
