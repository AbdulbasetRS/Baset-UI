/* Baset UI — documentation helpers for components/datatable.html (NOT part of the library; do not ship it).
 * Provides sample data and a tiny in-page "fake API" so the server-side demos work offline. */
(() => {
  'use strict';
  const first = ['Liam', 'Sara', 'Omar', 'Layla', 'Noah', 'Mona', 'Yusuf', 'Hana', 'Adam', 'Rana', 'Ivy', 'Karim', 'Nora', 'Sam', 'Aya', 'Tarek', 'Mia', 'Ziad', 'Dina', 'Ali'];
  const last = ['Tanaka', 'Farouk', 'Hassan', 'Silva', 'Mansour', 'Attar', 'Brooks', 'Costa', 'Shami', 'Ibrahim'];
  const roles = ['Frontend Developer', 'Backend Developer', 'UI Designer', 'QA Engineer', 'Product Manager', 'Support Agent', 'Data Analyst', 'DevOps Engineer'];
  const depts = ['Engineering', 'Design', 'Product', 'Support', 'Marketing', 'Operations'];
  const countries = ['Egypt', 'Jordan', 'France', 'Japan', 'Brazil', 'India', 'Kenya', 'Germany'];
  const arFirst = ['ليام', 'سارة', 'عمر', 'ليلى', 'نوح', 'منى', 'يوسف', 'هناء', 'آدم', 'رنا'];
  const arLast = ['العطار', 'الشامي', 'منصور', 'السيد', 'فاروق'];
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  /* Extra profile fields use their own index-based generator so the original sample values never change. */
  const base = (() => { try { return new URL('../images/avatars/', document.currentScript.src).href; } catch (e) { return '../assets/images/avatars/'; } })();
  const cities = ['Cairo', 'Amman', 'Paris', 'Tokyo', 'São Paulo', 'Mumbai', 'Nairobi', 'Berlin'];
  const bios = ['Loves clean interfaces and accessible components.', 'Ships reliable APIs and writes useful docs.', 'Turns rough ideas into polished design systems.', 'Hunts edge cases before users do.', 'Keeps roadmaps honest and teams aligned.', 'Solves tickets fast and keeps customers happy.', 'Finds the story hidden inside the numbers.', 'Automates deployments so releases feel boring.'];
  const extra = (i) => ({ avatar: base + 'avatar-' + String((i % 12) + 1).padStart(2, '0') + '.svg', phone: '+20 10' + String(10000000 + ((i * 7919) % 89999999)).slice(0, 8), city: cities[(i * 5) % cities.length], description: bios[(i * 3) % bios.length] + ' Member of the team since ' + (2019 + (i % 6)) + '.' });
  const users = Array.from({ length: 96 }, (_, i) => {
    const f = i % 7 === 3 ? pick(arFirst) : first[i % first.length]; const l = i % 7 === 3 ? pick(arLast) : last[(i * 3) % last.length]; const d = new Date(2022, 0, 1 + Math.floor(rnd() * 1000));
    return { id: i + 1, name: `${f} ${l}`, email: `user${i + 1}@baset.dev`, role: pick(roles), department: pick(depts), country: pick(countries), salary: 2000 + Math.floor(rnd() * 90) * 100, joined: d.toISOString().slice(0, 10), active: rnd() > 0.3, status: pick(['active', 'active', 'away', 'offline']), score: Math.round(rnd() * 100), ...extra(i) };
  });
  const money = (v) => '$' + Number(v).toLocaleString('en-US');
  const badge = (s) => `<span class="bui-badge bui-badge-${s === 'active' ? 'success' : s === 'away' ? 'warning' : 'secondary'}">${s}</span>`;

  /* A fake Laravel-style API: GET ?page=&per_page=&search=&sort=-name,email&filter[role]=... → { data, meta:{ total, filtered } } */
  function fakeApi(rows, latency = 250) {
    return async (url, init) => {
      const u = new URL(url, location.href); const q = u.searchParams; let list = rows.slice(); await new Promise((r) => setTimeout(r, latency));
      if (q.get('fail')) return { ok: false, status: 500 };
      const s = (q.get('search') || '').toLowerCase(); if (s) list = list.filter((r) => Object.values(r).join(' ').toLowerCase().includes(s));
      for (const [k, v] of q.entries()) { const m = k.match(/^filter\[(\w+)\]$/); if (m) list = list.filter((r) => String(r[m[1]]) === v); }
      const sort = (q.get('sort') || '').split(',').filter(Boolean);
      list.sort((a, b) => { for (const f of sort) { const d = f[0] === '-' ? -1 : 1; const k = f.replace(/^-/, ''); if (a[k] < b[k]) return -d; if (a[k] > b[k]) return d; } return 0; });
      const pp = q.get('per_page'); const per = pp === '0' ? list.length || 1 : Number(pp) || 10; const page = Number(q.get('page')) || 1; const total = list.length;
      return { ok: true, json: async () => ({ data: list.slice((page - 1) * per, page * per), meta: { total, current_page: page, per_page: per } }) };
    };
  }
  window.BUIDocs = { users, money, badge, fakeApi, arUsers: users.filter((u) => /[؀-ۿ]/.test(u.name)) };
})();
