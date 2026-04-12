"use client";
import { useState, useCallback, useEffect } from "react";

// ── Embed STC Forward fonts as base64 ────────────────────────────────────────
const FONT_MED_B64 = "/fonts/STCForward-Medium.ttf";
const FONT_REG_B64 = "/fonts/STCForward-Regular.ttf";
const TEMPLATE_BG = "/background.png";

// ── Inject @font-face + global styles via a style tag ────────────────────────
const injectStyles = () => {
  const style = document.createElement("style");
  style.textContent = `
    @font-face {
      font-family: 'STCForward';
      src: url('${FONT_REG_B64}') format('truetype');
      font-weight: 400;
      font-style: normal;
    }
      @font-face {
      font-family: 'STCForward';
      src: url('${FONT_MED_B64}') format('truetype');
      font-weight: 500;
      font-style: normal;
    }


    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0d0d1a; min-height: 100vh; }

    :root {
      --purple: #4F008B;
      --red: #FF375E;
      --white: #ffffff;
      --sidebar-bg: #111120;
      --border: #252538;
      --input-bg: #0a0a16;
      --muted: #6b6b88;
      --accent: #7c3aed;
      --font: 'STCForward', 'Source Sans 3', sans-serif;
    }

    .app {
      display: grid;
      grid-template-columns: 370px 1fr;
      min-height: 100vh;
      font-family: var(--font);
    }

    /* ── Sidebar ── */
    .sidebar {
      background: var(--sidebar-bg);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow-y: auto;
      position: sticky;
      top: 0;
    }
    .sidebar-header {
      padding: 24px 24px 18px;
      border-bottom: 1px solid var(--border);
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .brand-pill {
      background: var(--red);
      color: white;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      padding: 3px 8px;
      border-radius: 3px;
      font-family: var(--font);
    }
    .brand-subtitle {
      font-size: 11px;
      color: var(--muted);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-family: var(--font);
    }
    .sidebar-heading {
      font-size: 20px;
      font-weight: 700;
      color: var(--white);
      line-height: 1.2;
      font-family: var(--font);
    }
    .sidebar-body {
      padding: 22px 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      flex: 1;
    }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--muted);
      font-family: var(--font);
    }
    .field-input, .field-textarea {
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--white);
      font-family: var(--font);
      font-size: 14px;
      font-weight: 400;
      padding: 10px 13px;
      outline: none;
      transition: border-color 0.18s, box-shadow 0.18s;
      width: 100%;
      resize: none;
    }
    .field-input:focus, .field-textarea:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
    }
    .field-textarea { min-height: 150px; line-height: 1.6; }
    .hint { font-size: 11px; color: var(--muted); line-height: 1.4; font-family: var(--font); }
    .char-count { font-size: 11px; color: var(--muted); text-align: right; font-family: var(--font); }
    .char-count.warn { color: #f97316; }
    .divider { height: 1px; background: var(--border); }

    /* Bullets */
    .bullets-header { display: flex; justify-content: space-between; align-items: center; }
    .bullet-list { display: flex; flex-direction: column; gap: 8px; }
    .bullet-row { display: flex; gap: 8px; align-items: center; }
    .bullet-input {
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--white);
      font-family: var(--font);
      font-size: 13px;
      font-weight: 400;
      padding: 8px 10px;
      outline: none;
      flex: 1;
      transition: border-color 0.18s;
    }
    .bullet-input:focus { border-color: var(--accent); }
    .btn-icon {
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 5px;
      color: var(--muted);
      cursor: pointer;
      font-size: 14px;
      padding: 6px 9px;
      transition: all 0.15s;
      flex-shrink: 0;
    }
    .btn-icon:hover { border-color: var(--red); color: var(--red); }
    .btn-add {
      background: transparent;
      border: 1px dashed var(--border);
      border-radius: 6px;
      color: var(--muted);
      cursor: pointer;
      font-family: var(--font);
      font-size: 12px;
      padding: 8px;
      text-align: center;
      transition: all 0.15s;
      width: 100%;
      margin-top: 4px;
    }
    .btn-add:hover { border-color: var(--accent); color: var(--accent); }
    .btn-download {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 12px;
      border-radius: 7px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--muted);
      font-family: var(--font);
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-download:hover { border-color: var(--purple); color: #a855f7; }
    .btn-download:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-download.success { border-color: #22c55e; color: #22c55e; }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(124,58,237,0.3);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    /* ── Preview ── */
    .preview-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 32px;
      background: #08080f;
      min-height: 100vh;
      gap: 16px;
    }
    .preview-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 540px;
    }
    .preview-tag {
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #2e2e48;
      font-family: var(--font);
    }
    .canvas-wrapper {
      width: 100%;
      max-width: 540px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05);
    }

    /* ── Email template ── */
    .email-tpl {
      position: relative;
      width: 100%;
      font-family: var(--font);
    }
    .tpl-body {
      background: var(--purple);
      padding: 0 30px 36px;
      font-family: var(--font);
    }
    .tpl-esi {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 0 20px;
      height: 32px;          /* explicit, even */
      box-sizing: content-box;

    }
    .tpl-esi-dot {
      flex-shrink: 0;
      display: block;
    }

    .tpl-esi-label {
      font-size: 14px;       /* was 13px — 13 is odd, causes half-pixel line box */
      line-height: 16px;     /* even, and matches dot vertical rhythm */
      font-weight: 500;
      color: #9743D4;
      letter-spacing: 0.05em;
      font-family: var(--font);
      display: inline-flex;
      align-items: center;
      height: 16px;
    }
    .tpl-title {
      font-size: clamp(17px, 3.2vw, 24px);
      font-weight: 700;
      color: var(--white);
      line-height: 1.2;
      margin-bottom: 4px;
      word-break: break-word;
      font-family: var(--font);
    }
    .tpl-subtitle {
      font-size: clamp(13px, 2.4vw, 18px);
      font-weight: 400;
      color: var(--white);
      opacity: 0.88;
      line-height: 1.3;
      margin-bottom: 20px;
      font-family: var(--font);
    }
    .tpl-title-only {
      margin-bottom: 20px;
    }
    .tpl-salutation {
      font-size: clamp(12px, 1.9vw, 14px);
      font-weight: 700;
      color: var(--white);
      margin-bottom: 12px;
      font-family: var(--font);
    }
    .tpl-para {
      font-size: clamp(11px, 1.75vw, 13px);
      font-weight: 400;
      color: var(--white);
      line-height: 1.7;
      margin-bottom: 14px;
      word-break: break-word;
      overflow-wrap: break-word;
      font-family: var(--font);
    }
    .tpl-section-title {
      font-size: clamp(12px, 1.9vw, 14px);
      font-weight: 700;
      color: var(--white);
      margin-bottom: 10px;
      font-family: var(--font);
    }
    .tpl-bullets { margin-bottom: 14px; display: flex; flex-direction: column; gap: 9px; }
    .tpl-bullet { display: flex; gap: 10px; align-items: flex-start; }
    .tpl-bullet-dot {
      width: 9px; height: 9px;
      background: var(--red);
      border-radius: 1px;
      flex-shrink: 0;
      margin-top: 4px;
    }
    .tpl-bullet-text {
      font-size: clamp(11px, 1.75vw, 13px);
      font-weight: 400;
      color: var(--white);
      line-height: 1.6;
      word-break: break-word;
      font-family: var(--font);
    }
    .tpl-regards {
      font-size: clamp(12px, 1.9vw, 14px);
      font-weight: 400;
      color: #FF375E;
      margin-top: 4px;
      font-family: var(--font);
    }

    /* font-loaded state — subtle fade in */
    .font-ready .email-tpl { opacity: 1; transition: opacity 0.3s; }
    .font-loading .email-tpl { opacity: 0.7; }
  `;
  document.head.appendChild(style);
};


type EmailTemplateProps = {
  esiText?: string;
  title?: string;
  content?: string;
  bullets?: string[];
  sectionTitle?: string;
  closingContent?: string;
};


// ── Email Template Preview ────────────────────────────────────────────────────
function EmailTemplate({
  esiText = "ESI",
  title = "",
  content = "",
  bullets = [],
  sectionTitle = "",
  closingContent = ""
}: EmailTemplateProps) {
  const titleLines = title.split("\n");
  const mainTitle = titleLines[0] || "Email Announcement Title";
  const subTitle = titleLines.slice(1).join(" ").trim();

  // explicitly type `b` as string
  const activeBullets = bullets.filter((b: string) => b.trim());

  return (
    <div className="email-tpl">
      {/* Header image — top portion of the template background */}
      <div style={{ position: "relative", width: "100%", paddingBottom: "50%", overflow: "hidden" }}>
        <img
          src={TEMPLATE_BG}
          alt=""
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "auto", display: "block" }}
        />
      </div>

      {/* Purple body */}
      <div className="tpl-body">
        {/* ESI label */}
        <div className="tpl-esi">
          <svg width="10" height="10" className="tpl-esi-dot" xmlns="http://www.w3.org/2000/svg">
            <rect width="10" height="10" rx="1" fill="#FF375E" />
          </svg>
          {/* <div className="tpl-esi-dot" /> */}
          <span className="tpl-esi-label">{esiText || "ESI"}</span>
        </div>

        {/* Title */}
        <div className={subTitle ? "" : "tpl-title-only"}>
          <div className="tpl-title">{mainTitle}</div>
          {subTitle && <div className="tpl-subtitle">{subTitle}</div>}
        </div>

        {/* Salutation — fixed */}
        <div className="tpl-salutation">Dear Team,</div>

        {/* User content */}
        {content.trim() ? (
          <div
            className="tpl-para"
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br/>") }}
          />
        ) : (
          <div className="tpl-para" style={{ opacity: 0.4 }}>
            Your announcement content will appear here…
          </div>
        )}

        {/* Bullet points — only shown if any are filled */}
        {activeBullets.length > 0 && (
          <>
            <div className="tpl-section-title">{sectionTitle || "What's changing"}</div>
            <div className="tpl-bullets">
              {activeBullets.map((b, i) => (
                <div key={i} className="tpl-bullet">
                  <div className="tpl-bullet-dot" />
                  <span className="tpl-bullet-text">{b}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Closing content */}
        {closingContent.trim() && (
          <div
            className="tpl-para"
            dangerouslySetInnerHTML={{ __html: closingContent.replace(/\n/g, "<br/>") }}
          />
        )}

        {/* Best regards — fixed */}
        <div className="tpl-regards">Best regards,</div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [esiText, setEsiText] = useState("ESI");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [bullets, setBullets] = useState([""]);
  const [sectionTitle, setSectionTitle] = useState("What's changing");
  const [closingContent, setClosingContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { injectStyles(); }, []);

  const addBullet = () => setBullets(b => [...b, ""]);
  const removeBullet = (i: number) => setBullets(b => b.filter((_, idx) => idx !== i));
  const updateBullet = (i: number, val: string) => setBullets(b => b.map((v, idx) => idx === i ? val : v));

  const handleDownload = useCallback(async () => {
    setLoading(true);
    setSuccess(false);

    try {
      if (!window.html2canvas) {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
          s.onload = res; s.onerror = rej;
          document.head.appendChild(s);
        });
      }

      const EXPORT_W = 600;
      const activeBullets = bullets.filter(b => b.trim());
      const titleLines = (title || "Email Announcement Title").split("\n");
      const mainTitle = titleLines[0] || "Email Announcement Title";
      const subTitle = titleLines.slice(1).join(" ").trim();
      const imgH = Math.round(EXPORT_W * 0.50);
      const secTitle = sectionTitle || "What's changing";

      // Build off-screen render node with fully inline styles + embedded fonts
      const container = document.createElement("div");
      container.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${EXPORT_W}px;overflow:hidden;`;
      document.body.appendChild(container);

      container.innerHTML = `
        <style>
          @font-face {
            font-family: 'STCForward';
            src: url('${FONT_REG_B64}') format('truetype');
            font-weight: 400;
          }
          @font-face {
            font-family: 'STCForward';
            src: url('${FONT_MED_B64}') format('truetype');
            font-weight: 500;
          }
        </style>
        <div style="width:${EXPORT_W}px;font-family:'STCForward',sans-serif;">
          <!-- Header image -->
          <div style="position:relative;width:100%;height:${imgH}px;overflow:hidden;">
            <img src="${TEMPLATE_BG}" style="position:absolute;top:0;left:0;width:100%;height:auto;display:block;" />
          </div>
          <!-- Purple body -->
          <div style="background:#4F008B;padding:0 44px 48px;font-family:'STCForward',sans-serif;">
            <!-- ESI -->
            <div style="display:flex;align-items:center;gap:10px;padding:20px 0 24px;">
              <div style="width:10px;height:10px;background:#FF375E;border-radius:1px;flex-shrink:0;"></div>
              <span style="font-size:15px;font-weight:500;color:#9F4ADC;line-height:10;font-family:'STCForward',sans-serif;">${esiText}</span>
            </div>
            <!-- Title block -->
            <div style="margin-bottom:${subTitle ? "0" : "22px"};">
              <div style="font-size:28px;font-weight:700;color:#fff;line-height:1.18;margin-bottom:${subTitle ? "5px" : "22px"};word-break:break-word;font-family:'STCForward',sans-serif;">
                ${mainTitle}
              </div>
              ${subTitle ? `<div style="font-size:21px;font-weight:400;color:#fff;opacity:0.9;line-height:1.3;margin-bottom:22px;font-family:'STCForward',sans-serif;">${subTitle}</div>` : ""}
            </div>
            <!-- Salutation -->
            <div style="font-size:16px;font-weight:700;color:#fff;margin-bottom:14px;font-family:'STCForward',sans-serif;">Dear Team,</div>
            <!-- Content -->
            ${content.trim() ? `
            <div style="font-size:15px;font-weight:400;color:#fff;line-height:1.7;margin-bottom:18px;word-break:break-word;font-family:'STCForward',sans-serif;">
              ${content.replace(/\n/g, "<br/>")}
            </div>
            ` : ""}
            <!-- Bullets -->
            ${activeBullets.length > 0 ? `
            <div style="font-size:16px;font-weight:700;color:#fff;margin-bottom:12px;font-family:'STCForward',sans-serif;">${secTitle}</div>
            <div style="margin-bottom:18px;display:flex;flex-direction:column;gap:11px;">
              ${activeBullets.map(b => `
                <div style="display:flex;gap:13px;align-items:center;">
                  <div style="width:10px;height:10px;background:#FF375E;border-radius:1px;flex-shrink:0;"></div>
                  <span style="font-size:15px;font-weight:400;color:#fff;line-height:1.25;word-break:break-word;font-family:'STCForward',sans-serif;">${b}</span>
                </div>
              `).join("")}
            </div>
            ` : ""}
            <!-- Closing content -->
            ${closingContent.trim() ? `
            <div style="font-size:15px;font-weight:400;color:#fff;line-height:1.7;margin-bottom:18px;word-break:break-word;font-family:'STCForward',sans-serif;">
              ${closingContent.replace(/\n/g, "<br/>")}
            </div>
            ` : ""}
            <!-- Best regards -->
            <div style="font-size:15px;font-weight:400;color:#FF375E;font-family:'STCForward',sans-serif;">Best regards,</div>
          </div>
        </div>
      `;

      // Wait for fonts to load inside the shadow node
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 700));

      const el = container.querySelector("div:not(style)") || container.children[1];
      const canvas = await window.html2canvas(el as HTMLElement, {
        scale: 2,
        allowTaint: true,
        backgroundColor: null,
        width: EXPORT_W,
        logging: false,
        onclone: (doc: Document) => {

          const s = doc.createElement("style");
          s.textContent = `
            @font-face { font-family:'STCForward'; src:url('${FONT_REG_B64}') format('truetype'); font-weight:400; }
            @font-face { font-family:'STCForward'; src:url('${FONT_MED_B64}') format('truetype'); font-weight:500; }
          `;
          doc.head.appendChild(s);
        },
      } as any); // <-- cast options as any

      document.body.removeChild(container);

      const link = document.createElement("a");
      const slug = (mainTitle).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
      link.download = `${slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Export failed — please try again.");
    } finally {
      setLoading(false);
    }
  }, [esiText, title, content, bullets, sectionTitle, closingContent]);

  const activeBulletCount = bullets.filter(b => b.trim()).length;

  return (
    <div className="app">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-row">
            <span className="brand-pill">sccc by stc</span>
            <span className="brand-subtitle">by ESI · Announcement Studio</span>
          </div>
          <div className="sidebar-heading">Announcement<br />Generator</div>
        </div>

        <div className="sidebar-body">

          <div className="field">
            <label className="field-label">'From' Label</label>
            <input
              className="bullet-input"
              type="text"
              placeholder="ESI"
              value={esiText}
              onChange={e => setEsiText(e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="field">
            <label className="field-label">Email Title</label>
            <textarea
              className="field-textarea"
              style={{ minHeight: 76 }}
              placeholder={"Automated Virtual Credit Allocation\nFaster, Smarter Order-to-Cash"}
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
            />
            <span className="hint">First line = bold headline · Press Enter for a lighter subtitle line</span>
          </div>

          <div className="field">
            <label className="field-label">Email Content</label>
            <textarea
              className="field-textarea"
              placeholder={"We're excited to introduce a major enhancement to our Order-to-Cash process.\n\nVirtual Credit Allocation is now fully automated..."}
              value={content}
              onChange={e => setContent(e.target.value)}
              maxLength={800}
            />
            <span className={`char-count${content.length > 680 ? " warn" : ""}`}>{content.length} / 800</span>
          </div>

          <div className="divider" />

          <div className="field">
            <div className="bullets-header">
              <label className="field-label">Bullet Points</label>
              {activeBulletCount > 0 && (
                <span className="hint">{activeBulletCount} point{activeBulletCount !== 1 ? "s" : ""}</span>
              )}
            </div>
            <div className="field" style={{ gap: 4 }}>
              <label className="field-label" style={{ fontSize: 10 }}>Section heading</label>
              <input
                className="bullet-input"
                type="text"
                placeholder="What's changing"
                value={sectionTitle}
                onChange={e => setSectionTitle(e.target.value)}
                maxLength={80}
              />
            </div>
            <div className="bullet-list">
              {bullets.map((b, i) => (
                <div key={i} className="bullet-row">
                  <input
                    className="bullet-input"
                    type="text"
                    placeholder={`Bullet point ${i + 1}…`}
                    value={b}
                    onChange={e => updateBullet(i, e.target.value)}
                    maxLength={150}
                  />
                  {bullets.length > 1 && (
                    <button className="btn-icon" onClick={() => removeBullet(i)}>×</button>
                  )}
                </div>
              ))}
            </div>
            <button className="btn-add" onClick={addBullet}>+ Add bullet point</button>
          </div>

          <div className="field">
            <label className="field-label">Closing Content</label>
            <textarea
              className="field-textarea"
              style={{ minHeight: 100 }}
              placeholder={"This transformation not only streamlines credit allocation, but also enhances accuracy, visibility, and overall operational efficiency.\n\nThank you for your continued support."}
              value={closingContent}
              onChange={e => setClosingContent(e.target.value)}
              maxLength={600}
            />
            <span className={`char-count${closingContent.length > 510 ? " warn" : ""}`}>{closingContent.length} / 600</span>
          </div>

          <div style={{ flex: 1 }} />

          <div className="divider" />

          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
              <span style={{ fontSize: 11, color: "#3a3a58", fontFamily: "var(--font)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                STC Forward font active
              </span>
            </div>
            <button
              className={`btn-download${success ? " success" : ""}`}
              onClick={handleDownload}
              disabled={loading}
            >
              {loading ? <><div className="spinner" /> Exporting…</> :
                success ? <>✓ Downloaded!</> :
                  <>↓ Download PNG (2× hi-res)</>}
            </button>
          </div>

        </div>
      </aside>

      {/* ── Preview ── */}
      <main className="preview-area">
        <div className="preview-meta">
          <span className="preview-tag">Live Preview · STC Forward font</span>
          <span className="preview-tag">Export · 1200 × auto · PNG</span>
        </div>

        <div className="canvas-wrapper">
          <EmailTemplate esiText={esiText} title={title} content={content} bullets={bullets} sectionTitle={sectionTitle} closingContent={closingContent} />
        </div>

        <div className="preview-meta" style={{ justifyContent: "center" }}>
          <span className="preview-tag" style={{ opacity: 0.5 }}>Updates live as you type</span>
        </div>
      </main>
    </div>
  );
}
