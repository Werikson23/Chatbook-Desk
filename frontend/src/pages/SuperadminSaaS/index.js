import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles(() => ({
  root: {
    flex: 1,
    background: "#f5f5f7",
    height: "100%",
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },
  appContainer: { display: "flex", flex: 1, minHeight: 0, height: "100%" },
  sidebar: {
    width: 260,
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(20px)",
    borderRight: "1px solid #d2d2d7",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
  },
  brand: { display: "flex", alignItems: "center", gap: 12, marginBottom: 40, padding: "0 8px" },
  brandLogo: { width: 32, height: 32, borderRadius: 10, background: "#1d1d1f", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 },
  navGroup: { marginBottom: 24 },
  navLabel: { fontSize: 11, fontWeight: 700, color: "#86868b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, paddingLeft: 8 },
  navItem: {
    display: "flex",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
    color: "#1d1d1f",
    marginBottom: 4,
    cursor: "pointer",
    transition: "0.2s",
    "&:hover": { background: "rgba(0,0,0,0.04)" },
  },
  navItemActive: { background: "#007aff", color: "#fff" },
  navIcon: { width: 20, marginRight: 12, textAlign: "center", color: "#86868b" },
  navIconActive: { color: "#fff" },
  storageBox: { marginTop: "auto", padding: 16, background: "rgba(0,122,255,0.05)", borderRadius: 16 },
  usageBar: { height: 6, background: "#eee", borderRadius: 3, marginTop: 8, overflow: "hidden" },
  usageFill: { height: "100%", background: "#007aff" },
  main: { flex: 1, overflowY: "auto", padding: 40 },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 },
  h1: { fontSize: 32, fontWeight: 700, letterSpacing: -1, margin: 0 },
  btn: { padding: "10px 20px", borderRadius: 8, border: "1px solid #d2d2d7", background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  btnPrimary: { background: "#007aff", color: "#fff", border: "none" },
  stats: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 32 },
  statCard: { background: "#fff", border: "1px solid #d2d2d7", borderRadius: 24, padding: 24, transition: "0.3s", cursor: "pointer", "&:hover": { transform: "translateY(-5px)", boxShadow: "0 20px 40px rgba(0,0,0,0.05)" } },
  statLabel: { fontSize: 13, color: "#86868b", fontWeight: 600 },
  statValue: { fontSize: 28, fontWeight: 700, margin: "8px 0", display: "block" },
  miniLine: { height: 40, marginTop: 10, borderRadius: 6, background: "linear-gradient(90deg,#d1e7ff,#b6f0c8)" },
  sectionCard: { background: "#fff", border: "1px solid #d2d2d7", borderRadius: 24, padding: 24, marginBottom: 32 },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 16px", color: "#86868b", fontSize: 12, fontWeight: 600, borderBottom: "1px solid #d2d2d7", textTransform: "uppercase" },
  td: { padding: 16, borderBottom: "1px solid rgba(0,0,0,0.02)", fontSize: 14 },
  badge: { padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700 },
  badgeActive: { background: "#e5f8eb", color: "#34c759" },
  badgeTrial: { background: "#e5f0ff", color: "#007aff" },
  plansGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 },
  planCard: { background: "#fff", border: "1px solid #d2d2d7", borderRadius: 24, padding: 30, transition: "0.2s", "&:hover": { boxShadow: "0 14px 30px rgba(0,0,0,0.05)" } },
  featured: { border: "2px solid #007aff" },
}));

export default function SuperadminSaaS() {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const isSuper = !!user?.super;

  if (!isSuper) {
    return (
      <div style={{ padding: 24 }}>Sem permissão para Superadmin.</div>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.appContainer}>
        <aside className={classes.sidebar}>
          <div className={classes.brand}>
            <div className={classes.brandLogo}>A</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Aura <span style={{ fontWeight: 400, color: "#86868b" }}>Cloud</span></h2>
          </div>
          <div className={classes.navGroup}>
            <p className={classes.navLabel}>Administração</p>
            <div className={`${classes.navItem} ${classes.navItemActive}`}><span className={`${classes.navIcon} ${classes.navIconActive}`}>▦</span>Dashboard</div>
            <div className={classes.navItem}><span className={classes.navIcon}>🏢</span>Empresas (Tenants)</div>
            <div className={classes.navItem}><span className={classes.navIcon}>💳</span>Assinaturas</div>
            <div className={classes.navItem}><span className={classes.navIcon}>▤</span>Planos & Preços</div>
          </div>
          <div className={classes.navGroup}>
            <p className={classes.navLabel}>Sistema</p>
            <div className={classes.navItem}><span className={classes.navIcon}>📈</span>MRR Analytics</div>
            <div className={classes.navItem}><span className={classes.navIcon}>🎟</span>Cupons & Promoções</div>
            <div className={classes.navItem} onClick={() => history.push("/settings")}><span className={classes.navIcon}>⚙</span>Configurações Globais</div>
          </div>
          <div className={classes.storageBox}>
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Storage Global</p>
            <div className={classes.usageBar}><div className={classes.usageFill} style={{ width: "65%" }} /></div>
            <p style={{ fontSize: 10, color: "#86868b", marginTop: 6 }}>1.2TB de 2.0TB usados</p>
          </div>
        </aside>

        <main className={classes.main}>
          <header className={classes.topBar}>
            <div>
              <p style={{ color: "#86868b", fontWeight: 500, margin: 0 }}>Bem-vindo, Super Admin</p>
              <h1 className={classes.h1}>Painel de Controle Cloud</h1>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button className={`${classes.btn} ${classes.btnPrimary}`}>+ Nova Empresa</button>
              <button className={classes.btn}>🔔</button>
            </div>
          </header>

          <section className={classes.stats}>
            <div className={classes.statCard}><span className={classes.statLabel}>MRR (Receita Mensal)</span><span className={classes.statValue}>R$ 142.400</span><span style={{ fontSize: 12, color: "#34c759", fontWeight: 700 }}>▲ 12.5%</span><div className={classes.miniLine} /></div>
            <div className={classes.statCard}><span className={classes.statLabel}>Empresas Ativas</span><span className={classes.statValue}>842</span><span style={{ fontSize: 12, color: "#34c759", fontWeight: 700 }}>▲ 48 este mês</span><div className={classes.miniLine} /></div>
            <div className={classes.statCard}><span className={classes.statLabel}>Churn Rate (Cancelamento)</span><span className={classes.statValue}>1.2%</span><span style={{ fontSize: 12, color: "#34c759", fontWeight: 700 }}>Saudável</span><div className={classes.miniLine} /></div>
            <div className={classes.statCard}><span className={classes.statLabel}>Ticket Médio (ARPU)</span><span className={classes.statValue}>R$ 169,00</span><span style={{ fontSize: 12, color: "#86868b", fontWeight: 700 }}>Estável</span><div className={classes.miniLine} /></div>
          </section>

          <section className={classes.sectionCard}>
            <div className={classes.sectionHeader}>
              <h3 style={{ margin: 0 }}>Gerenciar Empresas</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" placeholder="Buscar empresa..." style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #d2d2d7", fontSize: 13 }} />
                <button className={classes.btn}>Filtros Avançados</button>
              </div>
            </div>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th className={classes.th}>Empresa</th>
                  <th className={classes.th}>Plano</th>
                  <th className={classes.th}>Status</th>
                  <th className={classes.th}>Uso (Agentes)</th>
                  <th className={classes.th}>Faturamento</th>
                  <th className={classes.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={classes.td}><strong>BlueTech Solutions</strong><div style={{ fontSize: 11, color: "#86868b" }}>bluetech.aura.com</div></td>
                  <td className={classes.td}><strong>Enterprise Pro</strong></td>
                  <td className={classes.td}><span className={`${classes.badge} ${classes.badgeActive}`}>Ativo</span></td>
                  <td className={classes.td}>18/20</td>
                  <td className={classes.td}>R$ 1.490,00/mês</td>
                  <td className={classes.td}><button className={classes.btn}>Gerenciar</button></td>
                </tr>
                <tr>
                  <td className={classes.td}><strong>Café Digital</strong><div style={{ fontSize: 11, color: "#86868b" }}>cafedigital.aura.com</div></td>
                  <td className={classes.td}><strong>Starter</strong></td>
                  <td className={classes.td}><span className={`${classes.badge} ${classes.badgeTrial}`}>Trial (2 dias)</span></td>
                  <td className={classes.td}>2/3</td>
                  <td className={classes.td}>R$ 0,00</td>
                  <td className={classes.td}><button className={classes.btn}>Gerenciar</button></td>
                </tr>
              </tbody>
            </table>
          </section>

          <h3 style={{ marginBottom: 16 }}>Configuração de Planos</h3>
          <section className={classes.plansGrid}>
            <div className={classes.planCard}>
              <span className={classes.badge} style={{ background: "#eee" }}>STARTER</span>
              <div style={{ fontSize: 32, fontWeight: 800, margin: "15px 0" }}>R$ 99 <span style={{ fontSize: 14, color: "#86868b" }}>/mês</span></div>
              <button className={classes.btn} style={{ width: "100%" }}>Editar Plano</button>
            </div>
            <div className={`${classes.planCard} ${classes.featured}`}>
              <span className={classes.badge} style={{ background: "#007aff", color: "#fff" }}>BUSINESS</span>
              <div style={{ fontSize: 32, fontWeight: 800, margin: "15px 0" }}>R$ 299 <span style={{ fontSize: 14, color: "#86868b" }}>/mês</span></div>
              <button className={`${classes.btn} ${classes.btnPrimary}`} style={{ width: "100%" }}>Editar Plano</button>
            </div>
            <div className={classes.planCard}>
              <span className={classes.badge} style={{ background: "#1d1d1f", color: "#fff" }}>ENTERPRISE</span>
              <div style={{ fontSize: 32, fontWeight: 800, margin: "15px 0" }}>Sob Consulta</div>
              <button className={classes.btn} style={{ width: "100%" }}>Editar Plano</button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

