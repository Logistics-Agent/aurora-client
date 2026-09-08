"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Globe2, Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import styles from "../login/components/login.module.css";

const LoginEarth = dynamic(() => import("../login/components/login-earth"), {
  ssr: false,
  loading: () => <p className={styles.loading}>Preparing the globe…</p>,
});

export function AuthFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { setTheme } = useTheme();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Aurora home">
          <Globe2 size={25} /> AURORA
        </Link>
        <div className={styles.themes} role="group" aria-label="Appearance">
          <button type="button" onClick={() => setTheme("light")} aria-label="Use light theme">
            <Sun size={16} />
            <span>Light</span>
          </button>
          <button type="button" onClick={() => setTheme("dark")} aria-label="Use dark theme">
            <Moon size={16} />
            <span>Dark</span>
          </button>
        </div>
      </header>

      <section className={styles.form} aria-labelledby="auth-heading">
        <p className={styles.eyebrow}>LOGISTICS AI CONTROL TOWER</p>
        <h1 id="auth-heading">{title}</h1>
        <p className={styles.description}>{description}</p>
        <div className={styles.fields}>{children}</div>
      </section>

      <section className={styles.earth} aria-label="Illustrative global logistics network">
        <LoginEarth />
      </section>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} Aurora</span>
        <span>Global perspective. Operational clarity.</span>
      </footer>
    </main>
  );
}
