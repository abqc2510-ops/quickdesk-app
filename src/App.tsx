import { useState, useEffect, useCallback } from "react";

/* ── Breakpoint hook ────────────────────────────────────────────── */
function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return mobile;
}

type Screen =
  | "login"
  | "dashboard"
  | "chat"
  | "faqs"
  | "complaints"
  | "tracking"
  | "history"
  | "profile";

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [authed, setAuthed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const navigate = useCallback((s: Screen) => {
    setScreen(s);
    setDrawerOpen(false);
    window.scrollTo(0, 0);
  }, []);

  if (!authed)
    return <LoginScreen onLogin={() => { setAuthed(true); setScreen("dashboard"); }} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F1F5F9", fontFamily: "'Inter', sans-serif" }}>
      {/* Desktop sidebar */}
      {!isMobile && <Sidebar active={screen} onNav={navigate} />}

      {/* Mobile drawer overlay */}
      {isMobile && drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.5)",
            zIndex: 40, backdropFilter: "blur(2px)",
          }}
        />
      )}
      {isMobile && (
        <div style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: 260,
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 50,
        }}>
          <Sidebar active={screen} onNav={navigate} />
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}>
        {/* Mobile top bar */}
        {isMobile && (
          <header style={{
            height: 56, backgroundColor: "#0F172A", display: "flex",
            alignItems: "center", justifyContent: "space-between",
            padding: "0 16px", position: "sticky", top: 0, zIndex: 30, flexShrink: 0,
          }}>
            <button
              onClick={() => setDrawerOpen(true)}
              style={{ width: 36, height: 36, border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center", gap: 5, padding: 4 }}
            >
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 22, height: 2, backgroundColor: "#94A3B8", borderRadius: 2 }} />
              ))}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LogoMark size={17} />
              </div>
              <span style={{ color: "#fff", fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 16 }}>QuickDesk</span>
            </div>
            <Avatar name="Sarah Chen" size={32} />
          </header>
        )}

        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minWidth: 0, paddingBottom: isMobile ? 72 : 0 }}>
          {screen === "dashboard" && <Dashboard onNav={navigate} isMobile={isMobile} />}
          {screen === "chat" && <ChatScreen isMobile={isMobile} />}
          {screen === "faqs" && <FAQScreen isMobile={isMobile} />}
          {screen === "complaints" && <ComplaintsScreen isMobile={isMobile} />}
          {screen === "tracking" && <TrackingScreen isMobile={isMobile} />}
          {screen === "history" && <HistoryScreen isMobile={isMobile} />}
          {screen === "profile" && <ProfileScreen isMobile={isMobile} />}
        </main>

        {/* Mobile bottom nav */}
        {isMobile && (
          <nav style={{
            position: "fixed", bottom: 0, left: 0, right: 0, height: 64,
            backgroundColor: "#fff", borderTop: "1px solid #E2E8F0",
            display: "flex", zIndex: 30,
            boxShadow: "0 -4px 20px rgba(15,23,42,0.08)",
          }}>
            {BOTTOM_NAV.map(item => {
              const active = screen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  style={{
                    flex: 1, border: "none", background: "none", cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: 3, padding: "6px 0",
                    color: active ? "#2563EB" : "#94A3B8",
                  }}
                >
                  <span style={{ color: active ? "#2563EB" : "#94A3B8" }}>{item.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, fontFamily: "'Inter', sans-serif" }}>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}

/* ── SIDEBAR ──────────────────────────────────────────────────────── */

const NAV_ITEMS: { id: Screen; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <IconGrid /> },
  { id: "chat", label: "AI Chat", icon: <IconChat /> },
  { id: "faqs", label: "FAQs", icon: <IconFAQ /> },
  { id: "complaints", label: "Complaints", icon: <IconAlert /> },
  { id: "tracking", label: "Tracking", icon: <IconTracking /> },
  { id: "history", label: "History", icon: <IconHistory /> },
  { id: "profile", label: "Profile", icon: <IconProfile /> },
];

const BOTTOM_NAV = [
  { id: "dashboard" as Screen, label: "Home", icon: <IconGrid /> },
  { id: "chat" as Screen, label: "Chat", icon: <IconChat /> },
  { id: "faqs" as Screen, label: "FAQs", icon: <IconFAQ /> },
  { id: "tracking" as Screen, label: "Tickets", icon: <IconTracking /> },
  { id: "profile" as Screen, label: "Profile", icon: <IconProfile /> },
];

function Sidebar({ active, onNav }: { active: Screen; onNav: (s: Screen) => void }) {
  return (
    <aside style={{
      width: 240, flexShrink: 0, backgroundColor: "#0F172A",
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0, overflowY: "auto",
    }}>
      <div style={{ padding: "28px 24px 32px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(37,99,235,0.45)" }}>
            <LogoMark size={22} />
          </div>
          <div>
            <div style={{ color: "#fff", fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 16 }}>QuickDesk</div>
            <div style={{ color: "#475569", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>Support AI</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                marginBottom: 2, backgroundColor: isActive ? "#2563EB" : "transparent",
                color: isActive ? "#fff" : "#94A3B8",
                fontFamily: "'Inter', sans-serif", fontWeight: isActive ? 600 : 400,
                fontSize: 14, textAlign: "left",
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
              {item.label}
              {item.id === "tracking" && (
                <span style={{ marginLeft: "auto", backgroundColor: "#F97316", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 6px" }}>3</span>
              )}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name="Sarah Chen" size={32} />
          <div>
            <div style={{ color: "#E2E8F0", fontSize: 13, fontWeight: 600 }}>Sarah Chen</div>
            <div style={{ color: "#475569", fontSize: 11 }}>sarah@acme.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ── LOGIN ────────────────────────────────────────────────────────── */

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isMobile = useIsMobile();

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", flexDirection: isMobile ? "column" : "row" }}>
      {/* Brand panel */}
      <div style={{
        width: isMobile ? "100%" : "45%",
        backgroundColor: "#0F172A",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: isMobile ? "48px 24px 40px" : "80px 72px",
        position: "relative", overflow: "hidden",
        minHeight: isMobile ? "auto" : "100vh",
      }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", backgroundColor: "rgba(37,99,235,0.12)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", backgroundColor: "rgba(37,99,235,0.08)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: isMobile ? 28 : 56 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(37,99,235,0.5)" }}>
              <LogoMark size={28} />
            </div>
            <span style={{ color: "#fff", fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 22 }}>QuickDesk</span>
          </div>
          <h1 style={{ color: "#fff", fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: isMobile ? 28 : 38, lineHeight: 1.2, margin: "0 0 16px" }}>
            Support that's<br /><span style={{ color: "#60A5FA" }}>always on.</span>
          </h1>
          {!isMobile && (
            <>
              <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, margin: "0 0 40px", maxWidth: 380 }}>
                AI-powered customer support at your fingertips. Resolve tickets faster, answer FAQs instantly, and never miss a customer concern.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {["Instant AI responses 24/7", "Smart complaint tracking", "Unified support history"].map(feat => (
                  <div key={feat} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <span style={{ color: "#CBD5E1", fontSize: 14 }}>{feat}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Form panel */}
      <div style={{
        flex: 1, backgroundColor: isMobile ? "#F1F5F9" : "#F1F5F9",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "32px 20px 40px" : "40px",
      }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <div style={{ display: "flex", backgroundColor: "#E2E8F0", borderRadius: 12, padding: 4, marginBottom: 32 }}>
            {(["login", "signup"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: "10px 0", borderRadius: 9, border: "none", cursor: "pointer",
                fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 14,
                backgroundColor: tab === t ? "#fff" : "transparent",
                color: tab === t ? "#0F172A" : "#64748B",
                boxShadow: tab === t ? "0 1px 4px rgba(15,23,42,0.1)" : "none",
              }}>
                {t === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: isMobile ? 22 : 26, color: "#0F172A", margin: "0 0 6px" }}>
            {tab === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p style={{ color: "#64748B", fontSize: 14, margin: "0 0 24px" }}>
            {tab === "login" ? "Sign in to your QuickDesk account" : "Get started with QuickDesk today"}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {tab === "signup" && <FormField label="Full Name" placeholder="Sarah Chen" type="text" />}
            <div>
              <label style={labelStyle}>Email address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="sarah@acme.com" type="email" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password" style={inputStyle} />
            </div>
            {tab === "login" && (
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 13, color: "#2563EB", fontWeight: 600, cursor: "pointer" }}>Forgot password?</span>
              </div>
            )}
            <button onClick={onLogin} style={primaryBtnStyle}>{tab === "login" ? "Sign In" : "Create Account"}</button>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "2px 0" }}>
              <div style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
              <span style={{ fontSize: 12, color: "#94A3B8" }}>or continue with</span>
              <div style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
            </div>
            <button style={{ ...outlineBtnStyle, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── DASHBOARD ────────────────────────────────────────────────────── */

function Dashboard({ onNav, isMobile }: { onNav: (s: Screen) => void; isMobile: boolean }) {
  const p = isMobile ? "20px 16px" : "40px 48px";
  return (
    <div style={{ padding: p }}>
      <PageHeader
        title={isMobile ? "Good morning, Sarah 👋" : "Good morning, Sarah 👋"}
        subtitle="Here's what's happening with your support queue today."
        isMobile={isMobile}
      />
      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: isMobile ? 12 : 20, marginBottom: 28,
      }}>
        <StatCard label="Open Tickets" value="12" delta="+3 today" color="#2563EB" isMobile={isMobile} />
        <StatCard label="Resolved" value="28" delta="+7 vs yesterday" color="#22C55E" isMobile={isMobile} />
        <StatCard label="Avg Response" value="1.4m" delta="−12s vs avg" color="#8B5CF6" isMobile={isMobile} />
        <StatCard label="CSAT Score" value="94%" delta="+2% this week" color="#F97316" isMobile={isMobile} />
      </div>

      {/* Quick actions */}
      <SectionTitle isMobile={isMobile}>Quick Actions</SectionTitle>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: isMobile ? 10 : 16, marginBottom: 28,
      }}>
        {[
          { label: "AI Chat", desc: "Start a conversation", screen: "chat" as Screen, icon: <IconChat size={isMobile ? 22 : 28} color="#2563EB" />, bg: "#EFF6FF" },
          { label: "Browse FAQs", desc: "Find quick answers", screen: "faqs" as Screen, icon: <IconFAQ size={isMobile ? 22 : 28} color="#8B5CF6" />, bg: "#F5F3FF" },
          { label: "File Complaint", desc: "Report an issue", screen: "complaints" as Screen, icon: <IconAlert size={isMobile ? 22 : 28} color="#F97316" />, bg: "#FFF7ED" },
          { label: "Chat History", desc: "View past sessions", screen: "history" as Screen, icon: <IconHistory size={isMobile ? 22 : 28} color="#22C55E" />, bg: "#F0FDF4" },
        ].map(item => (
          <button key={item.label} onClick={() => onNav(item.screen)} style={{
            backgroundColor: "#fff", borderRadius: 14, padding: isMobile ? "16px 14px" : "24px 20px",
            border: "1px solid #E2E8F0", cursor: "pointer", textAlign: "left",
            boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
          }}>
            <div style={{ width: isMobile ? 38 : 48, height: isMobile ? 38 : 48, borderRadius: 10, backgroundColor: item.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: isMobile ? 10 : 14 }}>
              {item.icon}
            </div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: isMobile ? 13 : 15, color: "#0F172A", marginBottom: 2 }}>{item.label}</div>
            {!isMobile && <div style={{ fontSize: 13, color: "#64748B" }}>{item.desc}</div>}
          </button>
        ))}
      </div>

      {/* Activity + sidebar widgets */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 380px", gap: isMobile ? 16 : 24 }}>
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3 style={cardTitleStyle}>Recent Activity</h3>
            <span style={linkStyle}>View all →</span>
          </div>
          {[
            { title: "Billing Issue #4821", time: "2 min ago", status: "open", desc: "Double charge on September invoice" },
            { title: "Password Reset #4818", time: "1 hr ago", status: "resolved", desc: "Account access restored successfully" },
            { title: "Shipping Delay #4815", time: "3 hr ago", status: "in_progress", desc: "Order #87423 delayed by 2 days" },
            { title: "Refund Request #4810", time: "Yesterday", status: "resolved", desc: "Full refund processed" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: i < 3 ? "1px solid #F1F5F9" : "none" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 6, flexShrink: 0, backgroundColor: item.status === "open" ? "#F97316" : item.status === "in_progress" ? "#2563EB" : "#22C55E" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
                  <span style={{ fontSize: 11, color: "#94A3B8", flexShrink: 0 }}>{item.time}</span>
                </div>
                {!isMobile && <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{item.desc}</div>}
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 12 : 20 }}>
          <div style={cardStyle}>
            <h3 style={{ ...cardTitleStyle, marginBottom: 14 }}>AI Suggestions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Reply to 3 unanswered tickets", "Update FAQ: Returns & Refunds", "Follow up on #4815 delay"].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", backgroundColor: "#EFF6FF", borderRadius: 10, border: "1px solid #DBEAFE" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#2563EB", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#1D4ED8" }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={cardStyle}>
            <h3 style={{ ...cardTitleStyle, marginBottom: 14 }}>Queue Summary</h3>
            {[{ label: "Pending", count: 5, color: "#F97316" }, { label: "In Progress", count: 4, color: "#2563EB" }, { label: "Resolved", count: 28, color: "#22C55E" }].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: row.color }} />
                  <span style={{ fontSize: 13, color: "#334155" }}>{row.label}</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── AI CHAT ──────────────────────────────────────────────────────── */

const CHAT_MESSAGES = [
  { from: "user", text: "Hi! I was charged twice for my September subscription.", time: "9:41 AM" },
  { from: "ai", text: "I'm sorry to hear that, Sarah! I can look into this billing issue right away. Could you confirm the last 4 digits of the card that was charged?", time: "9:41 AM" },
  { from: "user", text: "It's card ending in 4242.", time: "9:42 AM" },
  { from: "ai", text: "Thank you! I can see two charges of $49.00 on September 3rd and 4th. This looks like a duplicate charge. I've flagged this for our billing team and will initiate a full refund of $49.00. You should see it within 3–5 business days.", time: "9:42 AM" },
  { from: "user", text: "That's great, thank you! Will I get a confirmation email?", time: "9:43 AM" },
  { from: "ai", text: "Absolutely! A confirmation email will be sent to sarah@acme.com within the next few minutes with the refund reference number.", time: "9:43 AM" },
];

function ChatScreen({ isMobile }: { isMobile: boolean }) {
  const [input, setInput] = useState("");
  const [showList, setShowList] = useState(!isMobile);

  useEffect(() => { setShowList(!isMobile); }, [isMobile]);

  return (
    <div style={{ display: "flex", height: isMobile ? "calc(100vh - 56px - 64px)" : "100vh", overflow: "hidden" }}>
      {/* Conversation list — hidden on mobile unless toggled */}
      {(!isMobile || showList) && (
        <div style={{
          width: isMobile ? "100%" : 300,
          borderRight: "1px solid #E2E8F0", backgroundColor: "#fff",
          display: "flex", flexDirection: "column",
          position: isMobile ? "absolute" : "relative",
          inset: isMobile ? 0 : "auto", zIndex: isMobile ? 20 : "auto",
        }}>
          {isMobile && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #F1F5F9" }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 16, color: "#0F172A" }}>Conversations</span>
              <button onClick={() => setShowList(false)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20, color: "#64748B" }}>×</button>
            </div>
          )}
          {!isMobile && (
            <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid #F1F5F9" }}>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 18, color: "#0F172A", margin: "0 0 12px" }}>Conversations</h2>
              <button style={{ ...primaryBtnStyle, fontSize: 13, padding: "8px 16px", height: "auto" }}>+ New Chat</button>
            </div>
          )}
          {isMobile && <div style={{ padding: "8px 16px 12px" }}><button style={{ ...primaryBtnStyle, fontSize: 13, padding: "8px 16px", height: "auto" }}>+ New Chat</button></div>}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {[
              { title: "Billing double charge", time: "Now", active: true },
              { title: "Password reset help", time: "1 hr ago", active: false },
              { title: "Shipping delay inquiry", time: "Yesterday", active: false },
              { title: "Refund for order #8742", time: "2 days ago", active: false },
            ].map((c, i) => (
              <div key={i} onClick={() => isMobile && setShowList(false)} style={{
                padding: "12px", borderRadius: 10, marginBottom: 2, cursor: "pointer",
                backgroundColor: c.active ? "#EFF6FF" : "transparent",
                border: c.active ? "1px solid #DBEAFE" : "1px solid transparent",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: c.active ? "#1D4ED8" : "#0F172A" }}>{c.title}</span>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>{c.time}</span>
                </div>
                <div style={{ fontSize: 12, color: "#94A3B8" }}>AI Assistant</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#F8FAFC", minWidth: 0 }}>
        <div style={{ padding: isMobile ? "12px 16px" : "20px 32px", borderBottom: "1px solid #E2E8F0", backgroundColor: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
          {isMobile && !showList && (
            <button onClick={() => setShowList(true)} style={{ border: "none", background: "none", cursor: "pointer", color: "#64748B", padding: "4px 8px 4px 0", fontSize: 14, fontWeight: 600 }}>← All</button>
          )}
          <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LogoMark size={19} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 14, color: "#0F172A" }}>QuickDesk AI</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#22C55E" }} />
              <span style={{ fontSize: 11, color: "#22C55E", fontWeight: 500 }}>Online</span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px" : "28px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
          {CHAT_MESSAGES.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start", gap: 10, alignItems: "flex-end" }}>
              {msg.from === "ai" && (
                <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <LogoMark size={17} />
                </div>
              )}
              <div style={{ maxWidth: isMobile ? "82%" : 500 }}>
                <div style={{
                  padding: isMobile ? "10px 13px" : "12px 16px",
                  borderRadius: msg.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  backgroundColor: msg.from === "user" ? "#2563EB" : "#fff",
                  color: msg.from === "user" ? "#fff" : "#0F172A",
                  fontSize: isMobile ? 13 : 14, lineHeight: 1.6,
                  boxShadow: "0 1px 4px rgba(15,23,42,0.08)",
                  border: msg.from === "ai" ? "1px solid #E2E8F0" : "none",
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 3, textAlign: msg.from === "user" ? "right" : "left" }}>{msg.time}</div>
              </div>
              {msg.from === "user" && <Avatar name="Sarah Chen" size={30} />}
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LogoMark size={17} />
            </div>
            <div style={{ padding: "10px 14px", backgroundColor: "#fff", borderRadius: "16px 16px 16px 4px", border: "1px solid #E2E8F0", display: "flex", gap: 4, alignItems: "center" }}>
              {[0, 1, 2].map(d => <div key={d} style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#94A3B8" }} />)}
            </div>
          </div>
        </div>

        <div style={{ padding: isMobile ? "10px 12px" : "16px 32px", borderTop: "1px solid #E2E8F0", backgroundColor: "#fff" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type your message…" style={{ ...inputStyle, flex: 1 }} />
            <button style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: "#2563EB", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── FAQ ──────────────────────────────────────────────────────────── */

const FAQ_DATA = [
  {
    category: "Billing & Payments", color: "#2563EB",
    items: [
      { q: "How do I update my payment method?", a: "Go to Profile → Billing → Update Payment. Changes take effect on your next billing cycle." },
      { q: "When will I be charged?", a: "Billing occurs on the same date each month as your subscription start date." },
      { q: "Can I get a refund?", a: "Yes, refunds are available within 14 days of purchase. Contact support or use the AI Chat." },
    ],
  },
  {
    category: "Account & Access", color: "#8B5CF6",
    items: [
      { q: "How do I reset my password?", a: "Click 'Forgot password' on the login screen. A reset link will be emailed to you within 2 minutes." },
      { q: "Can I have multiple users?", a: "Yes, Enterprise plans support up to 25 team members. Upgrade in Profile → Plan." },
      { q: "How do I enable two-factor authentication?", a: "Go to Profile → Security → Enable 2FA. We support authenticator apps and SMS." },
    ],
  },
  {
    category: "Shipping & Orders", color: "#22C55E",
    items: [
      { q: "How do I track my order?", a: "Use the Tracking page or enter your order number in AI Chat. Real-time updates are shown." },
      { q: "What if my order is delayed?", a: "File a complaint and our team will contact the carrier and provide a resolution within 24 hours." },
    ],
  },
];

function FAQScreen({ isMobile }: { isMobile: boolean }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const p = isMobile ? "20px 16px" : "40px 48px";
  const filtered = FAQ_DATA.map(cat => ({ ...cat, items: cat.items.filter(item => !search || item.q.toLowerCase().includes(search.toLowerCase())) })).filter(cat => cat.items.length > 0);

  return (
    <div style={{ padding: p }}>
      <PageHeader title="Frequently Asked Questions" subtitle="Find quick answers, or ask our AI for help." isMobile={isMobile} />
      <div style={{ position: "relative", marginBottom: 28, maxWidth: 560 }}>
        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions…" style={{ ...inputStyle, paddingLeft: 42 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {filtered.map(cat => (
          <div key={cat.category}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 4, height: 18, backgroundColor: cat.color, borderRadius: 2 }} />
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 15, color: "#0F172A", margin: 0 }}>{cat.category}</h3>
              <span style={{ fontSize: 11, color: "#94A3B8", backgroundColor: "#F1F5F9", padding: "2px 7px", borderRadius: 10 }}>{cat.items.length}</span>
            </div>
            <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
              {cat.items.map((item, i) => (
                <div key={i} style={{ borderBottom: i < cat.items.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                  <button onClick={() => setOpen(open === `${cat.category}-${i}` ? null : `${cat.category}-${i}`)} style={{ width: "100%", padding: isMobile ? "14px 16px" : "18px 24px", border: "none", background: "none", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <span style={{ fontWeight: 600, fontSize: isMobile ? 13 : 14, color: "#0F172A" }}>{item.q}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open === `${cat.category}-${i}` ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {open === `${cat.category}-${i}` && (
                    <div style={{ padding: isMobile ? "0 16px 14px" : "0 24px 18px", fontSize: 13, color: "#475569", lineHeight: 1.7, borderTop: "1px solid #F1F5F9", paddingTop: 12 }}>{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── FILE COMPLAINT ───────────────────────────────────────────────── */

function ComplaintsScreen({ isMobile }: { isMobile: boolean }) {
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("medium");
  const [submitted, setSubmitted] = useState(false);
  const p = isMobile ? "20px 16px" : "40px 48px";

  if (submitted) {
    return (
      <div style={{ padding: p, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: "0 8px" }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", backgroundColor: "#F0FDF4", border: "3px solid #22C55E", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: isMobile ? 20 : 24, color: "#0F172A", marginBottom: 10 }}>Complaint Filed!</h2>
          <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.6, marginBottom: 6 }}>Reference ID: <strong style={{ color: "#2563EB" }}>#4822</strong></p>
          <p style={{ color: "#94A3B8", fontSize: 13, marginBottom: 24 }}>Our team will respond within 24 hours.</p>
          <button onClick={() => setSubmitted(false)} style={outlineBtnStyle}>File Another</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: p }}>
      <PageHeader title="File a Complaint" subtitle="Submit your concern and our team will respond within 24 hours." isMobile={isMobile} />
      <div style={{ maxWidth: isMobile ? "100%" : 720 }}>
        <div style={cardStyle}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Category *</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Select category…</option>
                <option value="billing">Billing & Payment</option>
                <option value="shipping">Shipping & Delivery</option>
                <option value="product">Product Quality</option>
                <option value="service">Customer Service</option>
                <option value="technical">Technical Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                {[{ val: "low", label: "Low", color: "#22C55E" }, { val: "medium", label: "Medium", color: "#F97316" }, { val: "high", label: "High", color: "#EF4444" }].map(pp => (
                  <button key={pp.val} onClick={() => setPriority(pp.val)} style={{
                    flex: 1, padding: "10px 0", borderRadius: 9,
                    border: `1.5px solid ${priority === pp.val ? pp.color : "#E2E8F0"}`,
                    backgroundColor: priority === pp.val ? `${pp.color}18` : "#fff",
                    color: priority === pp.val ? pp.color : "#64748B",
                    fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                  }}>{pp.label}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Subject *</label>
            <input placeholder="Brief summary of your issue" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Description *</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Please describe your issue in detail. Include any relevant order numbers, dates, or reference IDs." rows={isMobile ? 4 : 5} style={{ ...inputStyle, height: "auto", resize: "vertical", lineHeight: 1.6 }} />
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 3, textAlign: "right" }}>{desc.length}/1000</div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Attachments (optional)</label>
            <div style={{ border: "2px dashed #CBD5E1", borderRadius: 12, padding: isMobile ? "20px 16px" : "28px", textAlign: "center", backgroundColor: "#F8FAFC" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 8px", display: "block" }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#475569", marginBottom: 3 }}>Drop files here or click to browse</div>
              <div style={{ fontSize: 11, color: "#94A3B8" }}>PNG, JPG, PDF up to 10MB</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12 }}>
            <button onClick={() => setSubmitted(true)} style={{ ...primaryBtnStyle, flex: 1 }}>Submit Complaint</button>
            <button style={{ ...outlineBtnStyle, flex: 1 }}>Save as Draft</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── TRACKING ─────────────────────────────────────────────────────── */

const TICKETS = [
  { id: "#4822", subject: "Duplicate billing on September invoice", category: "Billing", priority: "high", status: "open", date: "Sep 6, 2026", agent: "AI + Team" },
  { id: "#4818", subject: "Cannot login after password change", category: "Account", priority: "medium", status: "resolved", date: "Sep 5, 2026", agent: "AI" },
  { id: "#4815", subject: "Order #87423 delayed — 2 days", category: "Shipping", priority: "high", status: "in_progress", date: "Sep 4, 2026", agent: "Support" },
  { id: "#4810", subject: "Refund for returned product #8741", category: "Billing", priority: "low", status: "resolved", date: "Sep 2, 2026", agent: "AI" },
  { id: "#4799", subject: "Two-factor auth conflict", category: "Account", priority: "medium", status: "resolved", date: "Aug 30, 2026", agent: "Team" },
  { id: "#4790", subject: "Wrong size delivered for order #8699", category: "Product", priority: "medium", status: "open", date: "Aug 28, 2026", agent: "Support" },
];

function TrackingScreen({ isMobile }: { isMobile: boolean }) {
  const [filter, setFilter] = useState("all");
  const p = isMobile ? "20px 16px" : "40px 48px";
  const filtered = filter === "all" ? TICKETS : TICKETS.filter(t => t.status === filter);

  return (
    <div style={{ padding: p }}>
      <PageHeader title="Complaint Tracking" subtitle="Monitor the status of all your submitted tickets." isMobile={isMobile} />
      {/* Filter pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { val: "all", label: "All", count: TICKETS.length },
          { val: "open", label: "Open", count: TICKETS.filter(t => t.status === "open").length },
          { val: "in_progress", label: "In Progress", count: TICKETS.filter(t => t.status === "in_progress").length },
          { val: "resolved", label: "Resolved", count: TICKETS.filter(t => t.status === "resolved").length },
        ].map(tab => (
          <button key={tab.val} onClick={() => setFilter(tab.val)} style={{
            padding: isMobile ? "7px 14px" : "8px 18px", borderRadius: 20, border: "1.5px solid",
            borderColor: filter === tab.val ? "#2563EB" : "#E2E8F0",
            backgroundColor: filter === tab.val ? "#EFF6FF" : "#fff",
            color: filter === tab.val ? "#2563EB" : "#64748B",
            fontWeight: 600, fontSize: isMobile ? 12 : 13, cursor: "pointer",
            fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 5,
          }}>
            {tab.label}
            <span style={{ backgroundColor: filter === tab.val ? "#2563EB" : "#E2E8F0", color: filter === tab.val ? "#fff" : "#64748B", borderRadius: 10, fontSize: 10, padding: "1px 5px", fontWeight: 700 }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Desktop table / Mobile cards */}
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(t => (
            <div key={t.id} style={{ ...cardStyle, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#2563EB" }}>{t.id}</span>
                <StatusBadge status={t.status} />
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#0F172A", marginBottom: 6, lineHeight: 1.4 }}>{t.subject}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#64748B", backgroundColor: "#F1F5F9", padding: "2px 8px", borderRadius: 6 }}>{t.category}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, borderRadius: 6, padding: "2px 8px", textTransform: "uppercase",
                  backgroundColor: t.priority === "high" ? "#FEF2F2" : t.priority === "medium" ? "#FFF7ED" : "#F0FDF4",
                  color: t.priority === "high" ? "#EF4444" : t.priority === "medium" ? "#F97316" : "#22C55E",
                }}>{t.priority}</span>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>{t.date}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={cardStyle}>
          <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 110px 90px 110px 110px", padding: "10px 20px", borderBottom: "2px solid #F1F5F9", fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.07em", textTransform: "uppercase" }}>
            <span>ID</span><span>Subject</span><span>Category</span><span>Priority</span><span>Status</span><span>Date</span>
          </div>
          {filtered.map((t, i) => (
            <div key={t.id} style={{ display: "grid", gridTemplateColumns: "110px 1fr 110px 90px 110px 110px", padding: "15px 20px", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none", alignItems: "center", cursor: "pointer" }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#2563EB" }}>{t.id}</span>
              <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 500, paddingRight: 16 }}>{t.subject}</span>
              <span style={{ fontSize: 12, color: "#64748B", backgroundColor: "#F1F5F9", padding: "2px 8px", borderRadius: 6, width: "fit-content" }}>{t.category}</span>
              <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 6, padding: "3px 8px", textTransform: "uppercase", backgroundColor: t.priority === "high" ? "#FEF2F2" : t.priority === "medium" ? "#FFF7ED" : "#F0FDF4", color: t.priority === "high" ? "#EF4444" : t.priority === "medium" ? "#F97316" : "#22C55E" }}>{t.priority}</span>
              <StatusBadge status={t.status} />
              <span style={{ fontSize: 12, color: "#64748B" }}>{t.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── HISTORY ──────────────────────────────────────────────────────── */

const HISTORY_DATA = [
  { id: "c-091", title: "Billing issue double charge", msgs: 6, date: "Sep 6, 2026", time: "9:41 AM", duration: "8 min", resolved: true },
  { id: "c-088", title: "Password reset assistance", msgs: 4, date: "Sep 5, 2026", time: "3:22 PM", duration: "5 min", resolved: true },
  { id: "c-085", title: "Shipping delay for order #87423", msgs: 9, date: "Sep 4, 2026", time: "11:08 AM", duration: "14 min", resolved: false },
  { id: "c-081", title: "Refund request for returned item", msgs: 5, date: "Sep 2, 2026", time: "2:55 PM", duration: "7 min", resolved: true },
  { id: "c-076", title: "Two-factor authentication help", msgs: 7, date: "Aug 30, 2026", time: "10:00 AM", duration: "11 min", resolved: true },
];

function HistoryScreen({ isMobile }: { isMobile: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const p = isMobile ? "20px 16px" : "40px 48px";

  return (
    <div style={{ padding: p }}>
      <PageHeader title="Chat History" subtitle="Browse and revisit your previous support conversations." isMobile={isMobile} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {HISTORY_DATA.map(conv => (
          <div key={conv.id}>
            <div onClick={() => setSelected(selected === conv.id ? null : conv.id)} style={{
              ...cardStyle, cursor: "pointer", padding: isMobile ? "14px" : "20px",
              border: selected === conv.id ? "1.5px solid #2563EB" : "1px solid #E2E8F0",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 16 }}>
                <div style={{ width: isMobile ? 38 : 44, height: isMobile ? 38 : 44, borderRadius: 11, backgroundColor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <IconChat size={isMobile ? 19 : 22} color="#2563EB" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: isMobile ? 13 : 15, color: "#0F172A", fontFamily: "'Poppins', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, backgroundColor: conv.resolved ? "#F0FDF4" : "#FFF7ED", color: conv.resolved ? "#22C55E" : "#F97316", flexShrink: 0 }}>{conv.resolved ? "Resolved" : "Open"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#94A3B8", flexWrap: "wrap" }}>
                    <span>{conv.date}</span>
                    <span>{conv.msgs} messages</span>
                    <span>{conv.duration}</span>
                  </div>
                </div>
              </div>
            </div>

            {selected === conv.id && (
              <div style={{ ...cardStyle, borderTop: "none", borderRadius: "0 0 16px 16px", marginTop: -8, paddingTop: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 280, overflowY: "auto" }}>
                  {CHAT_MESSAGES.slice(0, 3).map((msg, i) => (
                    <div key={i} style={{ padding: "10px 14px", borderRadius: 12, backgroundColor: msg.from === "user" ? "#EFF6FF" : "#F8FAFC", border: "1px solid", borderColor: msg.from === "user" ? "#DBEAFE" : "#E2E8F0" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: msg.from === "user" ? "#2563EB" : "#64748B", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{msg.from === "user" ? "You" : "QuickDesk AI"}</div>
                      <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.5 }}>{msg.text}</div>
                    </div>
                  ))}
                </div>
                <button style={{ ...primaryBtnStyle, marginTop: 14 }}>Continue Conversation</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── PROFILE ──────────────────────────────────────────────────────── */

function ProfileScreen({ isMobile }: { isMobile: boolean }) {
  const [notif, setNotif] = useState({ email: true, sms: false, push: true, updates: true });
  const p = isMobile ? "20px 16px" : "40px 48px";

  return (
    <div style={{ padding: p }}>
      <PageHeader title="Profile & Settings" subtitle="Manage your account information and preferences." isMobile={isMobile} />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 16 : 24 }}>
        <div>
          <div style={{ ...cardStyle, marginBottom: isMobile ? 16 : 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #F1F5F9" }}>
              <div style={{ position: "relative" }}>
                <Avatar name="Sarah Chen" size={isMobile ? 56 : 72} />
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: "50%", backgroundColor: "#2563EB", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: isMobile ? 17 : 20, color: "#0F172A" }}>Sarah Chen</div>
                <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>sarah@acme.com</div>
                <div style={{ fontSize: 12, color: "#22C55E", fontWeight: 600, marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#22C55E" }} /> Verified Account
                </div>
              </div>
            </div>
            {[["Full Name", "Sarah Chen"], ["Email", "sarah@acme.com"], ["Phone", "+1 (555) 012-3456"], ["Company", "Acme Corp"], ["Member since", "March 2025"]].map(([l, v]) => (
              <FormFieldStatic key={l} label={l} value={v} />
            ))}
            <button style={{ ...primaryBtnStyle, marginTop: 18 }}>Edit Profile</button>
          </div>

          <div style={cardStyle}>
            <h3 style={{ ...cardTitleStyle, marginBottom: 14 }}>Security</h3>
            {[{ label: "Change Password", sub: "Last changed 30 days ago" }, { label: "Two-Factor Auth", sub: "Enabled via authenticator app" }, { label: "Active Sessions", sub: "2 devices logged in" }].map((item, i) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < 2 ? "1px solid #F1F5F9" : "none", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{item.sub}</div>
                </div>
                <button style={{ ...outlineBtnStyle, fontSize: 12, padding: "6px 12px", height: "auto", width: "auto", flexShrink: 0 }}>Manage</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ ...cardStyle, marginBottom: isMobile ? 16 : 20 }}>
            <h3 style={{ ...cardTitleStyle, marginBottom: 16 }}>Notification Preferences</h3>
            {[{ key: "email" as const, label: "Email Notifications", sub: "Ticket updates via email" }, { key: "sms" as const, label: "SMS Alerts", sub: "Text for urgent updates" }, { key: "push" as const, label: "Push Notifications", sub: "Browser notifications" }, { key: "updates" as const, label: "Product Updates", sub: "New features and tips" }].map((item, i, arr) => (
              <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < arr.length - 1 ? "1px solid #F1F5F9" : "none", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{item.sub}</div>
                </div>
                <Toggle on={notif[item.key]} onChange={v => setNotif(n => ({ ...n, [item.key]: v }))} />
              </div>
            ))}
          </div>

          <div style={{ ...cardStyle, marginBottom: isMobile ? 16 : 20 }}>
            <h3 style={{ ...cardTitleStyle, marginBottom: 14 }}>Plan & Billing</h3>
            <div style={{ padding: "14px", borderRadius: 12, backgroundColor: "#EFF6FF", border: "1.5px solid #DBEAFE", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1D4ED8", fontFamily: "'Poppins', sans-serif" }}>Professional Plan</div>
                <div style={{ fontSize: 12, color: "#3B82F6", marginTop: 2 }}>$49/mo · Renews Oct 1, 2026</div>
              </div>
              <span style={{ backgroundColor: "#2563EB", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>ACTIVE</span>
            </div>
            <button style={{ ...outlineBtnStyle, width: "100%" }}>Manage Subscription</button>
          </div>

          <div style={cardStyle}>
            <h3 style={{ ...cardTitleStyle, marginBottom: 14 }}>Danger Zone</h3>
            <div style={{ padding: "14px", backgroundColor: "#FEF2F2", borderRadius: 10, border: "1px solid #FECACA" }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#DC2626", marginBottom: 3 }}>Delete Account</div>
              <div style={{ fontSize: 12, color: "#EF4444", marginBottom: 10 }}>This action is permanent and cannot be undone.</div>
              <button style={{ border: "1.5px solid #EF4444", backgroundColor: "transparent", color: "#EF4444", borderRadius: 9, padding: "7px 14px", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>Delete my account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SHARED COMPONENTS ────────────────────────────────────────────── */

function PageHeader({ title, subtitle, isMobile }: { title: string; subtitle: string; isMobile: boolean }) {
  return (
    <div style={{ marginBottom: isMobile ? 20 : 32 }}>
      <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: isMobile ? 22 : 28, color: "#0F172A", margin: "0 0 5px", lineHeight: 1.2 }}>{title}</h1>
      <p style={{ fontSize: isMobile ? 13 : 15, color: "#64748B", margin: 0 }}>{subtitle}</p>
    </div>
  );
}

function SectionTitle({ children, isMobile }: { children: React.ReactNode; isMobile?: boolean }) {
  return <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: isMobile ? 14 : 16, color: "#0F172A", margin: "0 0 10px" }}>{children}</h2>;
}

function StatCard({ label, value, delta, color, isMobile }: { label: string; value: string; delta: string; color: string; isMobile?: boolean }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: isMobile ? 24 : 30, color, lineHeight: 1.1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#22C55E", fontWeight: 500 }}>{delta}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    open: { label: "Open", bg: "#FFF7ED", color: "#F97316" },
    in_progress: { label: "In Progress", bg: "#EFF6FF", color: "#2563EB" },
    resolved: { label: "Resolved", bg: "#F0FDF4", color: "#22C55E" },
  };
  const s = map[status] || map.open;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, backgroundColor: s.bg, color: s.color, whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif", letterSpacing: "0.04em" }}>{s.label}</span>
  );
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", backgroundColor: "#2563EB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: size * 0.36, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} style={{ width: 42, height: 23, borderRadius: 12, border: "none", cursor: "pointer", backgroundColor: on ? "#2563EB" : "#CBD5E1", position: "relative", transition: "background-color 0.2s", flexShrink: 0 }}>
      <div style={{ width: 17, height: 17, borderRadius: "50%", backgroundColor: "#fff", position: "absolute", top: 3, left: on ? 22 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

function FormField({ label, placeholder, type }: { label: string; placeholder: string; type: string }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input placeholder={placeholder} type={type} style={inputStyle} />
    </div>
  );
}

function FormFieldStatic({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #F8FAFC", gap: 12 }}>
      <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}

/* ── LOGO ─────────────────────────────────────────────────────────── */

function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <path d="M3 3h20v14a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M9 11 a4 4 0 0 1 8 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <rect x="7" y="11" width="2.5" height="4" rx="1.2" fill="white" />
      <rect x="16.5" y="11" width="2.5" height="4" rx="1.2" fill="white" />
    </svg>
  );
}

/* ── ICONS ────────────────────────────────────────────────────────── */
function IconGrid() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>; }
function IconChat({ size = 18, color = "currentColor" }: { size?: number; color?: string }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>; }
function IconFAQ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>; }
function IconAlert({ size = 18, color = "currentColor" }: { size?: number; color?: string }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>; }
function IconTracking({ size = 18, color = "currentColor" }: { size?: number; color?: string }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>; }
function IconHistory({ size = 18, color = "currentColor" }: { size?: number; color?: string }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14" /><path d="M3.05 11a9 9 0 1 0 .5-4.5" /><polyline points="3 3 3 9 9 9" /></svg>; }
function IconProfile({ size = 18, color = "currentColor" }: { size?: number; color?: string }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>; }

/* ── SHARED STYLES ────────────────────────────────────────────────── */

const inputStyle: React.CSSProperties = {
  width: "100%", height: 46, padding: "0 14px", borderRadius: 10,
  border: "1.5px solid #E2E8F0", backgroundColor: "#fff",
  fontSize: 14, color: "#0F172A", outline: "none",
  fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
};

const primaryBtnStyle: React.CSSProperties = {
  width: "100%", height: 48, borderRadius: 12,
  backgroundColor: "#2563EB", border: "none",
  color: "#fff", fontFamily: "'Poppins', sans-serif",
  fontWeight: 600, fontSize: 15, cursor: "pointer",
  boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
};

const outlineBtnStyle: React.CSSProperties = {
  width: "100%", height: 48, borderRadius: 12,
  backgroundColor: "transparent", border: "1.5px solid #2563EB",
  color: "#2563EB", fontFamily: "'Poppins', sans-serif",
  fontWeight: 600, fontSize: 15, cursor: "pointer",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff", borderRadius: 16, padding: "20px",
  border: "1px solid #E2E8F0", boxShadow: "0 1px 6px rgba(15,23,42,0.06)",
};

const cardTitleStyle: React.CSSProperties = {
  fontFamily: "'Poppins', sans-serif", fontWeight: 700,
  fontSize: 16, color: "#0F172A", margin: 0,
};

const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: "#374151",
  display: "block", marginBottom: 6,
};

const linkStyle: React.CSSProperties = {
  fontSize: 13, color: "#2563EB", fontWeight: 600, cursor: "pointer",
};
