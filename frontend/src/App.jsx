import { useCallback, useEffect, useState } from 'react';
import {
  ArrowDownRight, ArrowRight, Bell, CalendarDays, Check, ChevronDown, CircleHelp,
  Clock3, Compass, FileText, LayoutDashboard, LogOut, Plus, Search, ShieldCheck,
  Sparkles, Users, X
} from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const roles = ['student', 'staff', 'admin'];

async function api(path, { token, ...options } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new Error('Can’t reach the backend. Start the backend server and try again.');
  }
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status}).`);
  return body;
}

function dateLabel(date, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!date) return 'Date to be announced';
  return new Intl.DateTimeFormat(undefined, options).format(new Date(`${date}T12:00:00`));
}

function initials(name = '') {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase();
}

function App() {
  const [session, setSession] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('club-event-session'));
      return saved?.token && saved?.user?.role ? saved : null;
    } catch { return null; }
  });
  const [notice, setNotice] = useState('');
  const [page, setPage] = useState('home');
  const [collapsed, setCollapsed] = useState(false);

  const logout = () => {
    localStorage.removeItem('club-event-session');
    setSession(null);
    setPage('home');
  };

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3500);
  };

  if (!session) return <AuthScreen onLogin={(next) => {
    localStorage.setItem('club-event-session', JSON.stringify(next));
    setSession(next);
  }} />;

  const menus = {
    student: [
      { id: 'home', title: 'Overview', icon: LayoutDashboard },
      { id: 'events', title: 'Discover events', icon: Compass },
      { id: 'applications', title: 'My applications', icon: CalendarDays },
      { id: 'od', title: 'On-duty requests', icon: FileText }
    ],
    staff: [
      { id: 'home', title: 'Overview', icon: LayoutDashboard },
      { id: 'od', title: 'OD applications', icon: FileText },
      { id: 'students', title: 'Students', icon: Users }
    ],
    admin: [
      { id: 'home', title: 'Overview', icon: LayoutDashboard },
      { id: 'events', title: 'Event management', icon: CalendarDays },
      { id: 'records', title: 'All records', icon: LayoutDashboard }
    ]
  };
  const pageTitles = {
    home: 'Overview',
    events: session.user.role === 'admin' ? 'Event management' : 'Discover events',
    applications: 'My applications',
    od: session.user.role === 'staff' ? 'OD applications' : 'On-duty requests',
    students: 'Students',
    records: 'All records'
  };
  const activePage = menus[session.user.role]?.some((item) => item.id === page) ? page : 'home';

  return (
    <div className={`app-shell ${collapsed ? 'is-collapsed' : ''}`}>
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setPage('home'); }}>
          <span className="brand-mark"><Sparkles size={19} strokeWidth={2.2} /></span>
          <span className="brand-name">gather<span>.</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {menus[session.user.role]?.map(({ id, title, icon: Icon }) => (
            <button key={id} className={`nav-item ${activePage === id ? 'selected' : ''}`} onClick={() => setPage(id)}>
              <Icon size={18} strokeWidth={1.8} /><span>{title}</span>
              {id === 'od' && session.user.role === 'staff' && <i className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon"><CircleHelp size={17} /></span>
            <div><strong>Need a hand?</strong><span>Make campus happen.</span></div>
            <ArrowDownRight size={16} />
          </div>
          <button className="profile-switch" onClick={logout}>
            <span className="avatar">{initials(session.user.fullName)}</span>
            <span className="profile-copy"><strong>{session.user.fullName}</strong><span>{session.user.role} account</span></span>
            <LogOut size={16} className="logout-icon" />
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{pageTitles[activePage]}</strong></div>
          <div className="topbar-actions">
            <span className="today-label"><CalendarDays size={15} />{new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</span>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button>
            <button className="top-avatar" aria-label="Sign out" title="Sign out" onClick={logout}>{initials(session.user.fullName)}</button>
          </div>
        </header>
        <div className="content-wrap">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="live-dot" />YOUR CAMPUS, IN GOOD COMPANY</div>
              <h1>{pageTitles[activePage]}<span className="heading-period">.</span></h1>
              <p className="page-intro">{activePage === 'home'
                ? `Good to see you, ${session.user.fullName?.split(' ')[0] || 'there'}. Here's what's happening around campus.`
                : roleIntro(session.user.role, activePage)}</p>
            </div>
            <button className={`collapse-button ${collapsed ? 'flipped' : ''}`} onClick={() => setCollapsed(!collapsed)} aria-label="Collapse sidebar"><ChevronDown size={17} /></button>
          </section>
          {activePage === 'home' && <Overview session={session} setPage={setPage} />}
          {activePage === 'events' && (session.user.role === 'admin'
            ? <AdminEvents session={session} notify={showNotice} />
            : <DiscoverEvents session={session} notify={showNotice} />)}
          {activePage === 'applications' && <StudentApplications session={session} notify={showNotice} />}
          {activePage === 'od' && (session.user.role === 'staff'
            ? <StaffOD session={session} notify={showNotice} />
            : <StudentOD session={session} notify={showNotice} />)}
          {activePage === 'students' && <StudentsPage session={session} />}
          {activePage === 'records' && <RecordsPage session={session} />}
        </div>
        <footer className="app-footer"><span>MADE FOR THE MOMENTS BETWEEN CLASSES</span><span>GATHER <b>·</b> CAMPUS EVENTS</span></footer>
      </main>
      {notice && <div className="toast"><Check size={17} />{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15} /></button></div>}
    </div>
  );
}

function roleIntro(role, page) {
  if (role === 'student' && page === 'events') return 'Find your people. Your next favorite campus moment is waiting.';
  if (role === 'student' && page === 'applications') return 'Keep track of events you have signed up for.';
  if (role === 'student') return 'Request on-duty status and keep up with your approvals.';
  if (role === 'staff') return 'Review requests and help students make it to the moments that matter.';
  if (role === 'admin') return 'Keep the campus calendar full of things worth showing up for.';
  return 'A little campus magic, organized.';
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', department: '', year: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    let active = true;
    api('/health')
      .then(() => { if (active) setApiStatus('connected'); })
      .catch(() => { if (active) setApiStatus('offline'); });
    return () => { active = false; };
  }, []);

  const update = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'register') {
        await api(`/auth/register/${role}`, {
          method: 'POST',
          body: JSON.stringify({
            fullName: form.fullName,
            email: form.email,
            password: form.password,
            ...(role === 'student' ? { department: form.department, year: form.year } : { department: form.department })
          })
        });
        setMode('login');
        setError('Account created. Sign in to continue.');
      } else {
        const result = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ role, email: form.email, password: form.password })
        });
        onLogin(result);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <a className="brand auth-brand" href="#"><span className="brand-mark"><Sparkles size={19} /></span><span className="brand-name">gather<span>.</span></span></a>
        <div className="showcase-copy">
          <div className="eyebrow"><span className="live-dot" />A CAMPUS THAT COMES TOGETHER</div>
          <h1>Make room<br />for <em>something</em><br />good.</h1>
          <p>Find your next thing. Meet your kind of people. Make the everyday a little more memorable.</p>
        </div>
        <div className="showcase-bottom">
          <div className="avatar-stack"><span className="stack-one">A</span><span className="stack-two">J</span><span className="stack-three">M</span><span className="stack-plus">+</span></div>
          <span>Good things happen<br /><strong>when we gather.</strong></span>
          <div className="showcase-arrow"><ArrowDownRight size={19} /></div>
        </div>
        <span className="showcase-index">01 — CAMPUS LIFE, TOGETHER</span>
      </section>
      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="form-topline"><span>WELCOME TO GATHER</span><span>01 <i /> 03</span></div>
          <h2>{mode === 'login' ? 'Come on in.' : 'Let’s get you in.'}</h2>
          <p className="auth-subtitle">{mode === 'login' ? 'Your campus life is waiting.' : 'Create your campus account.'}</p>
          <div className={`api-connection api-${apiStatus}`} role="status">
            <span />
            {apiStatus === 'checking' ? 'Connecting to the backend…' : apiStatus === 'connected' ? 'Backend connected' : 'Backend unavailable — start the API server'}
          </div>
          <form onSubmit={submit} className="auth-form">
            <label className="field-label">I’M SIGNING IN AS</label>
            <div className="role-picker">
              {roles.map((item) => <button type="button" key={item} className={role === item ? 'role-active' : ''} onClick={() => setRole(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}
            </div>
            {mode === 'register' && role === 'admin' ? <p className="form-message">Admin accounts are created by the system administrator. Sign in with your provisioned account.</p> : <>
            {mode === 'register' && <>
              <label className="field-label" htmlFor="fullName">FULL NAME</label>
              <input id="fullName" autoComplete="name" value={form.fullName} onChange={update('fullName')} placeholder="Your name" required />
            </>}
            <label className="field-label" htmlFor="email">EMAIL ADDRESS</label>
            <input id="email" type="email" autoComplete="email" value={form.email} onChange={update('email')} placeholder="you@campus.edu" required />
            {mode === 'register' && <>
              <label className="field-label" htmlFor="department">DEPARTMENT</label>
              <input id="department" value={form.department} onChange={update('department')} placeholder="e.g. Computer Science" required />
              {role === 'student' && <>
                <label className="field-label" htmlFor="year">YEAR OF STUDY</label>
                <input id="year" value={form.year} onChange={update('year')} placeholder="e.g. 2nd year" required />
              </>}
            </>}
            <label className="field-label" htmlFor="password">PASSWORD</label>
            <input id="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength="8" value={form.password} onChange={update('password')} placeholder="At least 8 characters" required />
            {error && <p className={`form-message ${error.startsWith('Account created') ? 'success-message' : ''}`}>{error}</p>}
            <button className="primary-button auth-submit" disabled={busy}>{busy ? 'One moment…' : mode === 'login' ? 'Sign in' : 'Create account'}<ArrowRight size={17} /></button>
            </>}
          </form>
          <p className="auth-toggle">{mode === 'login' ? 'New around here?' : 'Already have an account?'} <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'Create an account' : 'Sign in instead'}</button></p>
        </div>
        <div className="auth-legal"><span>THOUGHTFULLY MADE FOR CAMPUS LIFE</span><span>PRIVACY &nbsp;·&nbsp; SUPPORT</span></div>
      </section>
    </main>
  );
}

function Overview({ session, setPage }) {
  const [data, setData] = useState({ events: [], applications: [], students: [], records: null });
  const [error, setError] = useState('');
  useEffect(() => {
    const token = session.token;
    const load = async () => {
      try {
        if (session.user.role === 'student') {
          const [eventData, appData, odData] = await Promise.all([
            api('/students/events', { token }),
            api('/students/applications', { token }),
            api('/students/od', { token })
          ]);
          setData({ events: eventData.events, applications: appData.applications, od: odData.applications });
        } else if (session.user.role === 'staff') {
          const [odData, studentData] = await Promise.all([
            api('/staff/od-applications', { token }),
            api('/staff/students', { token })
          ]);
          setData({ od: odData.applications, students: studentData.students });
        } else {
          setData({ records: await api('/admin/records', { token }) });
        }
      } catch (requestError) { setError(requestError.message); }
    };
    load();
  }, [session]);

  const name = session.user.fullName?.split(' ')[0] || 'there';
  return (
    <>
      <section className="hero-card">
        <div className="hero-content">
          <span className="hero-kicker"><Sparkles size={13} /> THE GOOD STUFF STARTS HERE</span>
          <h2>{session.user.role === 'admin' ? <>A campus full<br />of <em>possibility.</em></> : <>Life happens<br />when we <em>show up.</em></>}</h2>
          <p>{session.user.role === 'admin' ? 'Give students something to look forward to. Your next great event is a few clicks away.' : 'The best campus memories don’t make themselves. Find an event that feels like you.'}</p>
          <button className="hero-cta" onClick={() => setPage(session.user.role === 'student' ? 'events' : session.user.role === 'staff' ? 'od' : 'events')}>
            {session.user.role === 'student' ? 'Find your next event' : session.user.role === 'staff' ? 'Review OD requests' : 'Create an event'}<ArrowRight size={16} />
          </button>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-sun" /><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          <div className="art-ticket"><span>GOOD TIMES</span><strong>GET<br />TOGETHER</strong><i>★ &nbsp;★ &nbsp;★</i><small>YOUR PEOPLE ARE HERE</small></div>
          <div className="art-stamp">CAMPUS<br />CULTURE <ArrowDownRight size={14} /></div>
        </div>
        <div className="hero-index">GATHER / 001</div>
      </section>
      {error && <div className="inline-error">{error}</div>}
      <div className="section-heading">
        <div><span className="eyebrow">A LITTLE LOOK AROUND</span><h2>{session.user.role === 'student' ? `Your campus, ${name}.` : 'The bigger picture.'}</h2></div>
        <span className="section-note">A good place to start <ArrowDownRight size={15} /></span>
      </div>
      {session.user.role === 'student' && <div className="stats-grid">
        <StatCard label="UPCOMING EVENTS" value={data.events?.length ?? '—'} icon={CalendarDays} note="Open to discover" />
        <StatCard label="YOUR SIGN-UPS" value={data.applications?.length ?? '—'} icon={Check} note="Events you’re part of" tint="lavender" />
        <StatCard label="ON-DUTY STATUS" value={data.od?.filter((item) => item.odStatus === 'pending').length ?? '—'} icon={Clock3} note="Requests awaiting review" tint="peach" />
      </div>}
      {session.user.role === 'staff' && <div className="stats-grid">
        <StatCard label="NEEDS YOUR REVIEW" value={data.od?.length ?? '—'} icon={Clock3} note="Pending OD requests" tint="peach" />
        <StatCard label="STUDENTS" value={data.students?.length ?? '—'} icon={Users} note="In the community" tint="lavender" />
        <StatCard label="YOUR ROLE" value="Staff" icon={ShieldCheck} note="Campus support" />
      </div>}
      {session.user.role === 'admin' && <div className="stats-grid">
        <StatCard label="TOTAL EVENTS" value={data.records?.events?.length ?? '—'} icon={CalendarDays} note="On the campus calendar" />
        <StatCard label="STUDENTS" value={data.records?.students?.length ?? '—'} icon={Users} note="In the community" tint="lavender" />
        <StatCard label="OD REQUESTS" value={data.records?.applications?.filter((item) => item.odStatus === 'pending').length ?? '—'} icon={FileText} note="Currently pending" tint="peach" />
      </div>}
      <section className="next-step-card">
        <div className="next-icon"><Sparkles size={19} /></div>
        <div><span className="eyebrow">YOUR NEXT LITTLE ADVENTURE</span><h3>{session.user.role === 'student' ? 'There’s more out there than your timetable.' : session.user.role === 'staff' ? 'A quick review can make someone’s week.' : 'The best events start with one good idea.'}</h3></div>
        <button className="text-button" onClick={() => setPage(session.user.role === 'student' ? 'events' : session.user.role === 'staff' ? 'od' : 'events')}>Let’s go <ArrowRight size={16} /></button>
      </section>
    </>
  );
}

function StatCard({ label, value, icon: Icon, note, tint = '' }) {
  return <article className={`stat-card ${tint}`}><div className="stat-top"><span>{label}</span><Icon size={17} /></div><strong>{value}</strong><small>{note}</small></article>;
}

function DiscoverEvents({ session, notify }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async (term = '') => {
    setLoading(true);
    try {
      const data = await api(`/students/events${term ? `?search=${encodeURIComponent(term)}` : ''}`, { token: session.token });
      setEvents(data.events);
      setError('');
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [session.token]);
  useEffect(() => { load(); }, [load]);
  const submitSearch = (event) => { event.preventDefault(); load(search.trim()); };
  const apply = async (eventId) => {
    try { await api(`/students/events/${eventId}/apply`, { method: 'POST', token: session.token }); notify('You’re on the list. See you there!'); }
    catch (requestError) { notify(requestError.message); }
  };
  return (
    <>
      <div className="toolbar">
        <form className="search-box" onSubmit={submitSearch}><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find an event, place, or feeling…" /><button type="submit">Search</button></form>
        <span className="result-count">{events.length} {events.length === 1 ? 'good thing' : 'good things'} to find</span>
      </div>
      {error && <div className="inline-error">{error}</div>}
      {loading ? <Loading /> : events.length ? <div className="event-grid">{events.map((event, index) => <EventCard key={event.eventId} event={event} index={index} action={<button className="small-action" onClick={() => apply(event.eventId)}>Count me in <ArrowRight size={14} /></button>} />)}</div> : <EmptyState title="Nothing on the calendar just yet." note="Try another search, or check back soon for something good." />}
    </>
  );
}

function EventCard({ event, index, action }) {
  const palette = ['coral', 'sage', 'lavender', 'butter'];
  return <article className="event-card">
    <div className={`event-poster ${palette[index % palette.length]}`}>
      <span className="poster-date">{dateLabel(event.eventDate, { month: 'short', day: 'numeric' })}</span>
      <span className="poster-sparkle">✳</span>
      <span className="poster-tag">{event.organizer || 'CAMPUS EVENT'}</span>
      <strong>{event.title}</strong>
      <span className="poster-count">GOOD THINGS AHEAD&nbsp; · &nbsp;{String(event.eventId).padStart(3, '0')}</span>
    </div>
    <div className="event-details">
      <div className="event-heading"><div><h3>{event.title}</h3><span>{event.organizer}</span></div><span className="event-capacity">{event.capacity ? `${event.capacity} spots` : 'Everyone welcome'}</span></div>
      <p>{event.description}</p>
      <div className="event-meta"><span><CalendarDays size={14} />{dateLabel(event.eventDate)}</span><span><Compass size={14} />{event.venue}</span></div>
      {action && <div className="event-action">{action}</div>}
    </div>
  </article>;
}

function StudentApplications({ session, notify }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [reporting, setReporting] = useState(null);
  const [reportText, setReportText] = useState('');
  const load = useCallback(async () => {
    try { setItems((await api('/students/applications', { token: session.token })).applications); }
    catch (requestError) { setError(requestError.message); }
  }, [session.token]);
  useEffect(() => { load(); }, [load]);
  const submitReport = async (event) => {
    event.preventDefault();
    try {
      await api(`/students/applications/${reporting}/report`, { method: 'POST', token: session.token, body: JSON.stringify({ reportText }) });
      setReporting(null); setReportText(''); notify('Your report has been submitted.'); load();
    } catch (requestError) { notify(requestError.message); }
  };
  if (error) return <div className="inline-error">{error}</div>;
  if (!items.length) return <EmptyState title="Your next event is out there." note="Sign up for something that catches your eye and it’ll show up here." />;
  return <div className="application-list">{items.map((item) => <article className="application-row" key={item.applicationId}>
    <span className="app-calendar-icon"><CalendarDays size={19} /></span>
    <div className="application-main"><h3>{item.event?.title || 'Campus event'}</h3><span>{dateLabel(item.event?.eventDate)} · {item.event?.venue}</span></div>
    <StatusPill value={item.odStatus === 'not_requested' ? 'Registered' : item.odStatus} />
    <button className="small-action muted-action" onClick={() => { setReporting(item.applicationId); setReportText(item.reportText || ''); }}>Submit report <ArrowRight size={14} /></button>
    {reporting === item.applicationId && <form className="report-form" onSubmit={submitReport}><label className="field-label">HOW DID IT GO?</label><textarea value={reportText} onChange={(event) => setReportText(event.target.value)} placeholder="Share a little recap…" required /><div className="form-actions"><button type="button" className="plain-button" onClick={() => setReporting(null)}>Cancel</button><button className="primary-button compact-button">Send report</button></div></form>}
  </article>)}</div>;
}

function StudentOD({ session, notify }) {
  const [items, setItems] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try {
      const [od, apps] = await Promise.all([
        api('/students/od', { token: session.token }),
        api('/students/applications', { token: session.token })
      ]);
      setItems(od.applications);
      setApplications(apps.applications.filter((application) => ['not_requested', 'rejected'].includes(application.odStatus)));
      setError('');
    } catch (requestError) { setError(requestError.message); }
  }, [session.token]);
  useEffect(() => { load(); }, [load]);
  const submit = async (event) => {
    event.preventDefault();
    try {
      await api(`/students/applications/${selected}/od`, { method: 'POST', token: session.token, body: JSON.stringify({ reason }) });
      setReason(''); setSelected(''); notify('Your OD request is on its way.'); load();
    } catch (requestError) { notify(requestError.message); }
  };
  return <>
    {error && <div className="inline-error">{error}</div>}
    <section className="content-section"><div className="section-heading"><div><span className="eyebrow">A LITTLE PAPERWORK</span><h2>Request on-duty</h2></div><span className="section-note">Only takes a moment <ArrowDownRight size={15} /></span></div>
      {applications.length ? <form className="od-form" onSubmit={submit}><div className="form-control"><label className="field-label" htmlFor="odEvent">EVENT</label><select id="odEvent" value={selected} onChange={(event) => setSelected(event.target.value)} required><option value="">Choose your event</option>{applications.map((item) => <option key={item.applicationId} value={item.applicationId}>{item.event?.title}</option>)}</select></div><div className="form-control"><label className="field-label" htmlFor="odReason">WHY ARE YOU ATTENDING?</label><input id="odReason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="A short reason for your request" required /></div><button className="primary-button compact-button">Send request <ArrowRight size={15} /></button></form> : <p className="muted-copy">Apply for an event first, then you can request on-duty status here.</p>}
    </section>
    <section className="content-section"><div className="section-heading"><div><span className="eyebrow">KEEPING YOU IN THE LOOP</span><h2>Your request history</h2></div></div>
      {items.length ? <div className="application-list">{items.map((item) => <article className="application-row" key={item.applicationId}><span className="app-calendar-icon"><FileText size={18} /></span><div className="application-main"><h3>{item.event?.title}</h3><span>{item.odReason || 'On-duty request'} · Submitted {dateLabel(item.createdAt?.slice(0, 10))}</span></div><StatusPill value={item.odStatus} /></article>)}</div> : <EmptyState title="Nothing to report." note="Your on-duty requests and their status will appear here." compact />}</section>
  </>;
}

function StaffOD({ session, notify }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');
  const load = useCallback(async (nextStatus = status) => {
    try {
      setItems((await api(`/staff/od-applications?status=${nextStatus}`, { token: session.token })).applications);
      setError('');
    } catch (requestError) { setError(requestError.message); }
  }, [session.token, status]);
  useEffect(() => { load(status); }, [load, status]);
  const review = async (item, nextStatus) => {
    try {
      await api(`/staff/od-applications/${item.applicationId}`, { method: 'PATCH', token: session.token, body: JSON.stringify({ status: nextStatus }) });
      notify(`Request ${nextStatus}.`); load(status);
    } catch (requestError) { notify(requestError.message); }
  };
  return <>
    <div className="toolbar"><div className="filter-tabs">{['pending', 'approved', 'rejected'].map((item) => <button key={item} className={status === item ? 'filter-active' : ''} onClick={() => setStatus(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div><span className="result-count">{items.length} {items.length === 1 ? 'request' : 'requests'}</span></div>
    {error && <div className="inline-error">{error}</div>}
    {items.length ? <div className="application-list">{items.map((item) => <article className="application-row staff-row" key={item.applicationId}>
      <span className="avatar student-avatar">{initials(item.student?.fullName)}</span>
      <div className="application-main"><h3>{item.student?.fullName} <span className="inline-subtle">· {item.student?.department}</span></h3><span>{item.event?.title} · {dateLabel(item.event?.eventDate)}</span><p className="reason-text">“{item.odReason}”</p></div>
      <StatusPill value={item.odStatus} />
      {status === 'pending' && <div className="review-actions"><button className="approve-button" onClick={() => review(item, 'approved')} aria-label="Approve request"><Check size={17} /></button><button className="reject-button" onClick={() => review(item, 'rejected')} aria-label="Reject request"><X size={17} /></button></div>}
    </article>)}</div> : <EmptyState title={`No ${status} requests.`} note="When there’s something to review, it’ll be right here." />}
  </>;
}

function StudentsPage({ session }) {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const load = useCallback(async (term = '') => {
    try {
      const data = await api(`/staff/students${term ? `?search=${encodeURIComponent(term)}` : ''}`, { token: session.token });
      setStudents(data.students); setError('');
    } catch (requestError) { setError(requestError.message); }
  }, [session.token]);
  useEffect(() => { load(); }, [load]);
  return <>
    <div className="toolbar"><form className="search-box" onSubmit={(event) => { event.preventDefault(); load(search.trim()); }}><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students…" /><button>Search</button></form><span className="result-count">{students.length} students</span></div>
    {error && <div className="inline-error">{error}</div>}
    {students.length ? <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>DEPARTMENT</th><th>YEAR</th><th>EMAIL</th></tr></thead><tbody>{students.map((student) => <tr key={student.studentId}><td><span className="table-person"><span className="avatar student-avatar">{initials(student.fullName)}</span><strong>{student.fullName}</strong></span></td><td>{student.department}</td><td>{student.year}</td><td>{student.email}</td></tr>)}</tbody></table></div> : <EmptyState title="No students found." note="Try another name or department." />}
  </>;
}

function AdminEvents({ session, notify }) {
  const [events, setEvents] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', venue: '', eventDate: '', startTime: '', endTime: '', organizer: '', capacity: '' });
  const load = useCallback(async () => {
    try { setEvents((await api('/admin/records', { token: session.token })).events); setError(''); }
    catch (requestError) { setError(requestError.message); }
  }, [session.token]);
  useEffect(() => { load(); }, [load]);
  const openNew = () => { setEditing(null); setForm({ title: '', description: '', venue: '', eventDate: '', startTime: '', endTime: '', organizer: '', capacity: '' }); setFormOpen(true); };
  const openEdit = (event) => { setEditing(event.eventId); setForm({ title: event.title, description: event.description, venue: event.venue, eventDate: event.eventDate, startTime: event.startTime || '', endTime: event.endTime || '', organizer: event.organizer, capacity: event.capacity || '' }); setFormOpen(true); };
  const change = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));
  const saveEvent = async (event) => {
    event.preventDefault();
    const payload = { ...form, capacity: form.capacity ? Number(form.capacity) : null, startTime: form.startTime || null, endTime: form.endTime || null };
    try {
      await api(editing ? `/admin/events/${editing}` : '/admin/events', { method: editing ? 'PATCH' : 'POST', token: session.token, body: JSON.stringify(payload) });
      setFormOpen(false); notify(editing ? 'Event updated.' : 'Event added to the calendar.'); load();
    } catch (requestError) { setError(requestError.message); }
  };
  const removeEvent = async (event) => {
    if (!window.confirm(`Delete "${event.title}" and its applications?`)) return;
    try { await api(`/admin/events/${event.eventId}`, { method: 'DELETE', token: session.token }); notify('Event deleted.'); load(); }
    catch (requestError) { setError(requestError.message); }
  };
  return <>
    <div className="toolbar"><span className="result-count">{events.length} events on the calendar</span><button className="primary-button compact-button" onClick={openNew}><Plus size={16} /> Add an event</button></div>
    {error && <div className="inline-error">{error}</div>}
    {formOpen && <form className="event-editor" onSubmit={saveEvent}><div className="editor-heading"><div><span className="eyebrow">{editing ? 'MAKING IT EVEN BETTER' : 'SOMETHING GOOD IS HAPPENING'}</span><h3>{editing ? 'Edit event' : 'Add a new event'}</h3></div><button type="button" className="icon-button" onClick={() => setFormOpen(false)} aria-label="Close"><X size={17} /></button></div>
      <div className="editor-grid"><Field label="EVENT NAME" value={form.title} onChange={change('title')} required /><Field label="ORGANIZER" value={form.organizer} onChange={change('organizer')} required /><Field label="DATE" type="date" value={form.eventDate} onChange={change('eventDate')} required /><Field label="VENUE" value={form.venue} onChange={change('venue')} required /><Field label="START TIME" type="time" value={form.startTime} onChange={change('startTime')} /><Field label="END TIME" type="time" value={form.endTime} onChange={change('endTime')} /><Field label="CAPACITY" type="number" value={form.capacity} onChange={change('capacity')} min="1" /></div>
      <label className="field-label" htmlFor="eventDescription">ABOUT THIS EVENT</label><textarea id="eventDescription" value={form.description} onChange={change('description')} placeholder="Give people a reason to show up…" required />
      <div className="form-actions"><button type="button" className="plain-button" onClick={() => setFormOpen(false)}>Cancel</button><button className="primary-button compact-button">{editing ? 'Save changes' : 'Add event'} <ArrowRight size={15} /></button></div>
    </form>}
    {events.length ? <div className="admin-event-list">{events.map((event) => <div className="admin-event-row" key={event.eventId}><span className="admin-date">{dateLabel(event.eventDate, { month: 'short', day: 'numeric' })}</span><div className="admin-event-copy"><h3>{event.title}</h3><span>{event.venue} · {event.organizer}</span></div><div className="admin-event-actions"><button className="plain-button" onClick={() => openEdit(event)}>Edit</button><button className="plain-button danger-text" onClick={() => removeEvent(event)}>Delete</button></div></div>)}</div> : !formOpen && <EmptyState title="The calendar is yours to fill." note="Add your first event and give the campus something to look forward to." />}
  </>;
}

function Field({ label, ...props }) {
  const id = `field-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return <div className="form-control"><label className="field-label" htmlFor={id}>{label}</label><input id={id} {...props} /></div>;
}

function RecordsPage({ session }) {
  const [records, setRecords] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api('/admin/records', { token: session.token }).then(setRecords).catch((requestError) => setError(requestError.message));
  }, [session.token]);
  if (error) return <div className="inline-error">{error}</div>;
  if (!records) return <Loading />;
  const sections = [
    { title: 'Students', key: 'students', columns: ['fullName', 'email', 'department', 'year'] },
    { title: 'Staff', key: 'staff', columns: ['fullName', 'email', 'department'] },
    { title: 'Administrators', key: 'admins', columns: ['fullName', 'email'] },
    { title: 'Events', key: 'events', columns: ['title', 'eventDate', 'venue', 'organizer'] },
    { title: 'Event & OD applications', key: 'applications', columns: ['applicationId', 'studentId', 'eventId', 'applicationStatus', 'odStatus'] }
  ];
  return <div className="records-stack">{sections.map((section) => <section key={section.key} className="record-section"><div className="record-title"><h2>{section.title}</h2><span>{records[section.key].length} records</span></div><div className="table-wrap"><table><thead><tr>{section.columns.map((column) => <th key={column}>{column.replace(/[A-Z]/g, (letter) => ` ${letter}`).toUpperCase()}</th>)}</tr></thead><tbody>{records[section.key].slice(0, 8).map((row, index) => <tr key={row.studentId || row.staffId || row.adminId || row.eventId || row.applicationId || index}>{section.columns.map((column) => <td key={column}>{row[column] ?? '—'}</td>)}</tr>)}</tbody></table>{records[section.key].length > 8 && <p className="table-note">Showing the first 8 records. Manage events in Event management.</p>}</div></section>)}</div>;
}

function StatusPill({ value }) {
  const normalized = value?.toLowerCase() || 'unknown';
  const labels = { not_requested: 'Registered', pending: 'Pending', approved: 'Approved', rejected: 'Needs update', applied: 'Applied', cancelled: 'Cancelled' };
  return <span className={`status-pill status-${normalized}`}>{labels[normalized] || value}</span>;
}

function EmptyState({ title, note, compact = false }) {
  return <div className={`empty-state ${compact ? 'empty-compact' : ''}`}><span className="empty-icon"><Sparkles size={19} /></span><h3>{title}</h3><p>{note}</p></div>;
}

function Loading() {
  return <div className="loading-state"><span className="loading-spinner" />Just a little moment…</div>;
}

export default App;
