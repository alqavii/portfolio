import Image from "next/image";
import { EB_Garamond, Inter } from "next/font/google";
import { projects } from "@/lib/projects";
import "./home.css";

const serif = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const EMAIL = "alqavihasan@gmail.com";

export default function Home() {
  const visible = projects.filter((p) => p.visible);

  return (
    <div className={`home ${serif.variable} ${sans.variable}`}>
      <main className="page">
        <header className="intro">
          <h1 className="name">AlQavi Hasan</h1>
          <p className="tagline">
            Chem Eng @ Sheffield · physical oil markets · seeking commodities
            trading internships
          </p>
          <div className="contact">
            <ul className="links">
              <li>
                <a href="/cv.pdf" target="_blank" rel="noopener noreferrer">
                  CV
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/alqavi"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`}>Email</a>
              </li>
            </ul>
            <span className="email">{EMAIL}</span>
          </div>
        </header>

        <section aria-labelledby="projects-heading">
          <h2 id="projects-heading" className="visually-hidden">
            Projects
          </h2>
          <ul className="grid">
            {visible.map((p, i) => (
              <li key={p.title}>
                <a
                  className="card"
                  href={p.href}
                  {...(p.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <Image
                    className="thumb"
                    src={p.thumbnail}
                    alt={`${p.title} thumbnail`}
                    width={1200}
                    height={750}
                    sizes="(max-width: 639px) 100vw, (max-width: 959px) 50vw, 360px"
                    priority={i < 3}
                  />
                  <h3 className="card-title">
                    {p.title}
                    {p.external && (
                      <span className="visually-hidden"> (opens in a new tab)</span>
                    )}
                  </h3>
                  <p className="card-desc">{p.description}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="footer">
        <p>Last updated October 2026</p>
      </footer>
    </div>
  );
}
