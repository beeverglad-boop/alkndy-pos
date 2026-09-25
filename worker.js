export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/pos-auth') {
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
      }
      const body = await request.json().catch(() => ({}));
      if (body.action !== 'verify-manager') {
        return Response.json({ error: 'Unsupported action' }, { status: 400 });
      }
      const expected = String(env.POS_MANAGER_AUTH || '');
      const ok = expected.length > 0 && String(body.password || '') === expected;
      return Response.json({ ok });
    }
    return env.ASSETS.fetch(request);
  }
};
