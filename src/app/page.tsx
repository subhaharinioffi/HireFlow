import Link from 'next/link'
import { 
  Upload, 
  FileText, 
  Send, 
  ShieldCheck, 
  Activity, 
  Key, 
  ArrowRight,
  Database,
  Search,
  CheckCircle,
  FileSpreadsheet,
  Lock
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div style={{ background: '#0B0F19', color: '#F9FAFB', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header / Navbar */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: 'rgba(11, 15, 25, 0.8)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <div className="container" style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em' }}>
              Hire<span style={{ color: 'var(--color-accent)' }}>Flow</span>
            </span>
          </div>
          
          <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="landing-nav">
            <a href="#features" style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Features</a>
            <a href="#workflow" style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Workflow</a>
            <a href="#security" style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Security</a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Sign In
            </Link>
            <Link href="/signup" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '80px 0 60px', position: 'relative', overflow: 'hidden' }}>
        {/* Glow effects */}
        <div style={{ position: 'absolute', top: '-10%', left: '15%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: '0', right: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.04) 0%, transparent 70%)', zIndex: 1 }} />

        <div className="container d-lg-grid-cols-2" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--color-accent-bg)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '9999px', fontSize: '12px', color: 'var(--color-accent)', fontWeight: '600', marginBottom: '20px' }}>
              <span>Version 1.0 Release</span>
              <ArrowRight size={12} />
            </div>
            <h1 style={{ fontSize: '46px', fontWeight: '800', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-0.03em' }}>
              Automate HR Documents. <br />
              <span style={{ background: 'linear-gradient(90deg, var(--color-accent) 0%, #60A5FA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Deliver Every Offer with Confidence.
              </span>
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '32px' }}>
              HireFlow streamlines human resources operations. Upload candidate spreadsheets, dynamically compile certificates and offer letters as secure PDFs, and automate email dispatch through encrypted server channels.
            </p>
            <div style={{ display: 'flex', gap: '14px' }}>
              <Link href="/signup" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '14px', gap: '8px' }}>
                Get Started <ArrowRight size={16} />
              </Link>
              <a href="#workflow" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '14px' }}>
                View Workflow
              </a>
            </div>
          </div>

          {/* Abstract visual preview of dashboard */}
          <div style={{ position: 'relative' }}>
            <div style={{ background: 'rgba(17, 24, 39, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--border-radius-lg)', padding: '24px', boxShadow: 'var(--shadow-lg)', position: 'relative', zIndex: 5 }}>
              
              {/* Header mockup */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '3px 12px', fontSize: '10px', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                  https://hireflow.com/dashboard
                </div>
              </div>

              {/* Graphical representation of layout */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', padding: '12px' }}>
                  <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Candidates Enrolled</div>
                  <div style={{ fontSize: '18px', fontWeight: '700' }}>148</div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ width: '70%', height: '100%', background: 'var(--color-accent)' }} />
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', padding: '12px' }}>
                  <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Approval Pending</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-warning)' }}>12</div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ width: '30%', height: '100%', background: 'var(--color-warning)' }} />
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', padding: '12px' }}>
                  <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Documents Sent</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-success)' }}>136</div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ width: '92%', height: '100%', background: 'var(--color-success)' }} />
                  </div>
                </div>
              </div>

              {/* Graphic list mockup */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[1, 2, 3].map((x) => (
                  <div key={x} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={12} style={{ color: 'var(--color-accent)' }} />
                      </div>
                      <div style={{ width: '80px', height: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <div style={{ width: '50px', height: '14px', background: x === 3 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }} />
                      <div style={{ width: '40px', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Background glowing frame */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', right: '-10px', bottom: '-10px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 'var(--border-radius-lg)', zIndex: 3 }} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.005)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Powerful Operations Engine</h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-muted)' }}>Enterprise document issuance built for speed, compliance, and auditing</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            
            <div className="card">
              <div style={{ width: '40px', height: '40px', background: 'rgba(59,130,246,0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', marginBottom: '16px' }}>
                <FileSpreadsheet size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Excel spreadsheet parsing</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                Seamlessly upload large candidate spreadsheets. Our system parses columns and reports cell-level validation errors before executing data commits.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '40px', height: '40px', background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', marginBottom: '16px' }}>
                <FileText size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Dynamic PDF compiling</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                Automatically replace layout placeholders with candidate parameters, rendering company logos, signatures, and custom styling.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '40px', height: '40px', background: 'rgba(59,130,246,0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', marginBottom: '16px' }}>
                <Send size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Secure SMTP delivery</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                Nodemailer integrations deliver signed PDFs directly to candidates from protected backend servers. Credentials are never exposed on client apps.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '40px', height: '40px', background: 'rgba(245,158,11,0.1)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', marginBottom: '16px' }}>
                <ShieldCheck size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Clear approval controls</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                Establish clear HR checklines. Executives compile candidate drafts, while Managers and Administrators approve and initiate emails.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.03)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--color-border)' }}>
                <Activity size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Security audit trails</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                Every data alteration, approval, PDF compilation, and email dispatch logs an unalterable system audit record detailing operator name and date.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '40px', height: '40px', background: 'rgba(59,130,246,0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', marginBottom: '16px' }}>
                <Search size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Verification QR lookup</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                Issued certificates embed a unique ID and QR code. Public users scan codes to view a secure verification page confirming authenticity.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" style={{ padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Platform Operational Flow</h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-muted)' }}>From raw spreadsheet records to dispatched and verified credentials</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', position: 'relative' }}>
            {[
              { step: '01', title: 'Excel Import', desc: 'Batch parse and validate candidate spreadsheets' },
              { step: '02', title: 'Data Check', desc: 'Automatic validations capture syntax and range errors' },
              { step: '03', title: 'HR Approval', desc: 'Managers approve templates and candidate records' },
              { step: '04', title: 'PDF Compile', desc: 'Securely generate documents with custom styling and QR codes' },
              { step: '05', title: 'Secure Dispatch', desc: 'SMTP servers email PDF attachments to candidates' },
              { step: '06', title: 'Track & Verify', desc: 'Log transmission responses and authenticate QR scans' }
            ].map((w, idx) => (
              <div key={idx} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-accent)', opacity: 0.8 }}>{w.step}</div>
                <h3 style={{ fontSize: '14px', fontWeight: '700' }}>{w.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" style={{ padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.04)', background: 'linear-gradient(180deg, #0B0F19 0%, #070B14 100%)' }}>
        <div className="container d-lg-grid-cols-2" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', alignItems: 'center' }}>
          
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>Compliance-First Security</h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
              HireFlow is engineered from the ground up for strict data confidentiality. We implement server-only SMTP dispatch and database-level RLS policies to safeguard candidates personal and compensation details.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Lock size={20} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Supabase Row Level Security</h4>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>RLS rules block unauthenticated read/write operations, restricting executives to drafts and templates to admin-only controls.</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <Database size={20} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Protected Document Storage</h4>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Candidate PDF offer letters are stored inside private buckets. Users can only download or inspect documents using short-lived signed URLs.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Key size={20} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Encrypted Credentials</h4>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>SMTP host passwords and database keys are managed using production environment values and never exposed inside web client code.</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-lg)', padding: '36px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>Data Safety Assurances</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', color: 'var(--color-text-secondary)', listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓</span> Public QR verification routes hide candidate compensation and emails
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓</span> Prevents duplicate PDF generation unless regenerations are confirmed
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓</span> Verification function RPC operates under strict Security Definer clearances
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓</span> Complete history logging captures credentials deletion and user auth audits
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 0', background: '#070B14' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '24px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>HireFlow</div>
            <p style={{ maxWidth: '280px', lineHeight: '1.4' }}>Enterprise HR document compilers and secure SMTP dispatchers.</p>
          </div>

          <div style={{ display: 'flex', gap: '40px' }}>
            <div>
              <div style={{ fontWeight: '600', color: '#fff', marginBottom: '10px' }}>Security</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><a href="#security" style={{ color: 'var(--color-text-muted)' }}>Encryption</a></li>
                <li><a href="#security" style={{ color: 'var(--color-text-muted)' }}>RLS Policies</a></li>
              </ul>
            </div>
            <div>
              <div style={{ fontWeight: '600', color: '#fff', marginBottom: '10px' }}>Legal</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><Link href="/" style={{ color: 'var(--color-text-muted)' }}>Privacy Policy</Link></li>
                <li><Link href="/" style={{ color: 'var(--color-text-muted)' }}>Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="container" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.03)', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)' }}>
          &copy; {new Date().getFullYear()} HireFlow Corporation. All Rights Reserved. Protected by industry-standard cryptographical layers.
        </div>
      </footer>
    </div>
  )
}
