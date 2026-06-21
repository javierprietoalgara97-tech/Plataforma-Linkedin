import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import storage from '../../services/storage';

export function Configuracion() {
  const { settings, updateSettings } = useApp();
  const [form, setForm] = useState({
    ...settings,
    perfil: { ...settings.perfil },
  });
  const [testAnth, setTestAnth] = useState('');
  const [testSupa, setTestSupa] = useState('');
  const [saved, setSaved] = useState(false);

  function setField(path, value) {
    const parts = path.split('.');
    setForm(f => {
      const copy = { ...f, perfil: { ...f.perfil } };
      if (parts.length === 2) copy[parts[0]][parts[1]] = value;
      else copy[parts[0]] = value;
      return copy;
    });
  }

  function handleSave() {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function testAnthropic() {
    setTestAnth('Probando...');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': form.anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Di ok' }],
        }),
      });
      setTestAnth(res.ok ? '✅ Conexión correcta' : `❌ Error ${res.status}`);
    } catch (e) {
      setTestAnth(`❌ ${e.message}`);
    }
  }

  async function testSupabase() {
    setTestSupa('Probando...');
    try {
      const res = await fetch(`${form.supabaseUrl}/rest/v1/articles?select=id&limit=1`, {
        headers: { apikey: form.supabaseAnonKey, Authorization: `Bearer ${form.supabaseAnonKey}` },
      });
      setTestSupa(res.ok ? '✅ Conexión correcta' : `❌ Error ${res.status}`);
    } catch (e) {
      setTestSupa(`❌ ${e.message}`);
    }
  }

  function exportData() {
    const data = storage.getAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkedin-studio-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function resetData() {
    if (!window.confirm('¿Resetear todos los datos al estado inicial? Perderás tus posts y configuración.')) return;
    storage.remove('initialized');
    window.location.reload();
  }

  const Section = ({ title, children }) => (
    <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
      <h2 className="font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  );

  const Field = ({ label, desc, children }) => (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );

  const Input = ({ path, type = 'text', placeholder }) => (
    <input
      type={type}
      value={path.includes('.') ? form.perfil[path.split('.')[1]] : form[path]}
      onChange={e => setField(path, e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Configuración</h1>
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg"
        >
          {saved ? '¡Guardado!' : 'Guardar cambios'}
        </button>
      </div>

      <Section title="Perfil">
        <Field label="Nombre completo">
          <Input path="perfil.nombre" placeholder="Tu nombre" />
        </Field>
        <Field label="Titular de LinkedIn">
          <Input path="perfil.titular" placeholder="Consultor de Inteligencia Artificial" />
        </Field>
        <Field label="URL de foto de perfil" desc="Pega la URL de tu foto (opcional)">
          <Input path="perfil.foto" placeholder="https://..." />
        </Field>
        <Field label="Nicho" desc="Describe tu especialidad para que Claude genere contenido relevante">
          <Input path="perfil.nicho" placeholder="consultoría de inteligencia artificial para empresas" />
        </Field>
        <Field label="Tono de comunicación">
          <select
            value={form.perfil.tono}
            onChange={e => setField('perfil.tono', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="profesional pero cercano">Profesional pero cercano</option>
            <option value="muy profesional y formal">Muy profesional y formal</option>
            <option value="cercano e informal">Cercano e informal</option>
            <option value="directo y contundente">Directo y contundente</option>
            <option value="inspiracional y motivador">Inspiracional y motivador</option>
          </select>
        </Field>
      </Section>

      <Section title="Integraciones">
        <Field
          label="Anthropic API Key"
          desc="Necesaria para el Chat IA. Crea una en console.anthropic.com"
        >
          <div className="flex gap-2">
            <input
              type="password"
              value={form.anthropicApiKey}
              onChange={e => setField('anthropicApiKey', e.target.value)}
              placeholder="sk-ant-..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={testAnthropic} className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              Probar
            </button>
          </div>
          {testAnth && <p className="text-xs mt-1.5 text-gray-600">{testAnth}</p>}
        </Field>

        <Field
          label="Supabase URL"
          desc="URL de tu proyecto Supabase (para recibir noticias del pipeline n8n)"
        >
          <Input path="supabaseUrl" placeholder="https://xxxx.supabase.co" />
        </Field>

        <Field label="Supabase Anon Key">
          <div className="flex gap-2">
            <input
              type="password"
              value={form.supabaseAnonKey}
              onChange={e => setField('supabaseAnonKey', e.target.value)}
              placeholder="eyJh..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={testSupabase} className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              Probar
            </button>
          </div>
          {testSupa && <p className="text-xs mt-1.5 text-gray-600">{testSupa}</p>}
        </Field>
      </Section>

      <Section title="Datos">
        <div className="flex gap-3">
          <button onClick={exportData}
            className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm py-2 rounded-lg">
            Exportar todos mis datos (JSON)
          </button>
          <button onClick={resetData}
            className="border border-red-200 hover:bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">
            Resetear datos
          </button>
        </div>
        <p className="text-xs text-gray-400">Los datos se guardan en tu navegador. Exporta regularmente como copia de seguridad.</p>
      </Section>
    </div>
  );
}
