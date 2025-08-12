import React from 'react';

type AuthState = { token: string | null };

const api = async (path: string, opts: RequestInit = {}, token?: string | null) => {
  const res = await fetch(path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as any).error || 'Request failed');
  return json;
};

export const App: React.FC = () => {
  const [auth, setAuth] = React.useState<AuthState>({ token: null });
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    // Accept token via query param after OAuth
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    if (token) {
      setAuth({ token });
      url.searchParams.delete('token');
      window.history.replaceState({}, '', url.toString());
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <div>
      <header className="header">
        <div className="brand">WooCommerce MCP</div>
        <nav>{auth.token ? <button className="btn" onClick={() => setAuth({ token: null })}>Logout</button> : null}</nav>
      </header>
      <main className="wrap">
        {!auth.token ? <Login setAuth={setAuth} /> : <Dashboard token={auth.token} />}
      </main>
    </div>
  );
};

const Login: React.FC<{ setAuth: (s: AuthState) => void }> = () => {
  return (
    <section className="card" style={{ maxWidth: 600, margin: '10vh auto', textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>WooCommerce MCP</div>
      <div style={{ color: 'var(--muted)', marginBottom: 18 }}>Sign in to continue</div>
      <a className="btn primary" href="/oauth/login" style={{ display: 'inline-block', width: '100%', fontSize: 18 }}>
        Login with WordPress
      </a>
    </section>
  );
};

const Dashboard: React.FC<{ token: string }> = ({ token }) => {
  return (
    <div className="appgrid">
      <AIConsole token={token} />
      <OrdersPanel token={token} />
      <ContentPanel token={token} />
    </div>
  );
};

const AIConsole: React.FC<{ token: string }> = ({ token }) => {
  const [lines, setLines] = React.useState<string[]>([]);
  const [input, setInput] = React.useState('');
  const send = async () => {
    const cmd = input.trim();
    if (!cmd) return;
    setLines((l) => [...l, `You: ${cmd}`]);
    setInput('');
    try {
      const res = await api('/process-command', { method: 'POST', body: JSON.stringify({ command: cmd }) }, token);
      setLines((l) => [...l, `AI: ${(res as any).message || (res as any).aiResponse?.message || 'Done'}`]);
    } catch (e: any) {
      setLines((l) => [...l, 'Error: ' + e.message]);
    }
  };
  return (
    <section className="card" style={{ gridColumn: '1/-1' }}>
      <h2>AI Command Console</h2>
      <div className="chatbox">{lines.map((l, i) => (<div key={i}>{l}</div>))}</div>
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="#87 mark this order as refunded" />
        <button className="btn primary" onClick={send}>Send</button>
      </div>
    </section>
  );
};

const OrdersPanel: React.FC<{ token: string }> = ({ token }) => {
  const [orderId, setOrderId] = React.useState('');
  const [result, setResult] = React.useState<any>(null);
  const getOrder = async () => setResult(await api(`/orders/${encodeURIComponent(orderId)}`, {}, token));
  const complete = async () => setResult(await api(`/orders/${encodeURIComponent(orderId)}/complete`, { method: 'POST', body: JSON.stringify({ note: 'Completed via UI' }) }, token));
  const refund = async () => setResult(await api('/execute/update_order_status', { method: 'POST', body: JSON.stringify({ orderId, status: 'refunded', note: 'Refunded via UI' }) }, token));
  const cancel = async () => setResult(await api('/execute/update_order_status', { method: 'POST', body: JSON.stringify({ orderId, status: 'cancelled', note: 'Cancelled via UI' }) }, token));
  return (
    <section className="card">
      <h3>Order Tools</h3>
      <label>Order ID</label>
      <input value={orderId} onChange={(e) => setOrderId(e.target.value)} />
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <button className="btn" onClick={getOrder}>Get</button>
        <button className="btn" onClick={complete}>Complete</button>
        <button className="btn" onClick={refund}>Refund</button>
        <button className="btn" onClick={cancel}>Cancel</button>
      </div>
      <pre className="pre">{result ? JSON.stringify(result, null, 2) : ''}</pre>
    </section>
  );
};

const ContentPanel: React.FC<{ token: string }> = ({ token }) => {
  const [type, setType] = React.useState('blog post');
  const [context, setContext] = React.useState('');
  const [generated, setGenerated] = React.useState('');
  const [title, setTitle] = React.useState('');
  const generate = async () => {
    const res = await api('/generate-content', { method: 'POST', body: JSON.stringify({ contentType: type, context }) }, token);
    setGenerated((res as any).content || '');
  };
  const publish = async () => {
    await api('/execute/create_post', { method: 'POST', body: JSON.stringify({ title: title || 'AI Post', content: generated, status: 'draft' }) }, token);
    alert('Post created as draft');
  };
  return (
    <section className="card">
      <h3>Content Generation</h3>
      <label>Content Type</label>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option>blog post</option>
        <option>product description</option>
        <option>meta description</option>
      </select>
      <label>Context</label>
      <textarea rows={5} value={context} onChange={(e) => setContext(e.target.value)} />
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <button className="btn primary" onClick={generate}>Generate</button>
      </div>
      <label>Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <pre className="pre">{generated}</pre>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn" onClick={publish} disabled={!generated}>Publish as Draft</button>
      </div>
    </section>
  );
};


