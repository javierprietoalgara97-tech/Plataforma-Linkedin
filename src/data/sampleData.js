function id() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}

export const defaultCategories = [
  { id: id(), nombre: 'Casos de uso IA', color: '#3b82f6' },
  { id: id(), nombre: 'Opinión / Reflexión', color: '#8b5cf6' },
  { id: id(), nombre: 'Herramientas y Novedades', color: '#10b981' },
  { id: id(), nombre: 'Tendencias del Sector', color: '#f59e0b' },
  { id: id(), nombre: 'Historia / Experiencia personal', color: '#ef4444' },
];

export function buildSamplePosts(categories) {
  const cat = (nombre) => categories.find(c => c.nombre === nombre)?.id || categories[0].id;

  const now = new Date();
  const d = (daysOffset) => {
    const date = new Date(now);
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  };

  return [
    {
      id: id(),
      contenido: `¿Sabes cuánto tiempo pierden tus empleados buscando información interna?\n\nEn la mayoría de empresas que analizo como consultor IA, la respuesta me sorprende: entre 1,5 y 2 horas diarias por persona.\n\nEso son 10 horas a la semana. 40 al mes. Por persona.\n\nLa solución no es contratar más gente. Es implementar un asistente IA entrenado con vuestros documentos internos.\n\nEn 3 semanas hemos ayudado a una empresa de 50 personas a recuperar esas horas. El ROI fue inmediato.\n\n¿Quieres saber cómo lo hicimos? Cuéntame en comentarios qué problema de eficiencia tienes en tu empresa.`,
      categoria: cat('Casos de uso IA'),
      estado: 'publicado',
      fechaProgramada: d(-14),
      esHistorico: false,
      metricas: { impresiones: 4820, reacciones: 134, comentarios: 28, compartidos: 19, verMas: 312 },
      actualizadoEn: new Date().toISOString(),
    },
    {
      id: id(),
      contenido: `La IA no va a quitarte el trabajo.\n\nTe lo va a quitar alguien que sabe usarla mejor que tú.\n\nSé que esta frase incomoda. Pero es la realidad que vivo cada semana trabajando con empresas.\n\nLa brecha entre quienes integran IA en su día a día y quienes la evitan por miedo se está ensanchando a una velocidad brutal.\n\nNo hace falta convertirse en ingeniero. Hace falta curiosidad y 30 minutos al día.\n\n¿Qué herramienta de IA has incorporado tú este mes?`,
      categoria: cat('Opinión / Reflexión'),
      estado: 'publicado',
      fechaProgramada: d(-11),
      esHistorico: false,
      metricas: { impresiones: 7340, reacciones: 289, comentarios: 67, compartidos: 43, verMas: 521 },
      actualizadoEn: new Date().toISOString(),
    },
    {
      id: id(),
      contenido: `Claude 3.5 acaba de cambiar cómo trabajo con documentos largos.\n\nVentana de contexto de 200.000 tokens. Eso equivale a un libro entero.\n\nCaso real de esta semana: un cliente me mandó 180 páginas de contratos para analizar cláusulas de riesgo. Antes: 3 días de trabajo. Ahora: 40 minutos con el prompt adecuado.\n\nLas 3 cosas que he aprendido para sacarle partido:\n\n1/ El contexto largo no perdona los prompts vagos. Sé específico.\n2/ Pide siempre que cite el número de página. Verifica.\n3/ Divide el análisis por secciones, no lo hagas todo de golpe.\n\n¿Qué modelo estás usando tú para documentos largos?`,
      categoria: cat('Herramientas y Novedades'),
      estado: 'publicado',
      fechaProgramada: d(-7),
      esHistorico: false,
      metricas: { impresiones: 5110, reacciones: 178, comentarios: 41, compartidos: 31, verMas: 398 },
      actualizadoEn: new Date().toISOString(),
    },
    {
      id: id(),
      contenido: `En 2025 el 70% de las empresas del Ibex 35 tendrán algún proyecto de IA en producción.\n\nEn 2023 era el 12%.\n\nEste salto brutal tiene una consecuencia directa: la demanda de consultores que sepan implementar (no solo hablar de) IA está explotando.\n\nPero hay un problema. La mayoría de consultores hablan de herramientas. Pocos hablan de procesos, cambio organizacional y gestión del riesgo.\n\nAhí está la oportunidad real.\n\n¿Estás posicionándote para este mercado o sigues esperando a ver qué pasa?`,
      categoria: cat('Tendencias del Sector'),
      estado: 'publicado',
      fechaProgramada: d(-4),
      esHistorico: false,
      metricas: { impresiones: 3980, reacciones: 112, comentarios: 19, compartidos: 14, verMas: 267 },
      actualizadoEn: new Date().toISOString(),
    },
    {
      id: id(),
      contenido: `Mi primer proyecto de IA fracasó estrepitosamente.\n\nEra 2022. Un cliente quería automatizar la atención al cliente con un chatbot. Invertimos 3 meses y 40.000€.\n\nA los 2 meses de lanzarlo, lo apagaron.\n\nLo que aprendí de ese fracaso me ha convertido en mejor consultor:\n\n→ La tecnología era correcta. El problema era el proceso previo.\n→ Nadie había mapeado los flujos reales de consultas.\n→ El equipo de soporte no se involucró en el diseño.\n\nAhora empiezo cada proyecto con 2 semanas de diagnóstico. Sin excepción.\n\nEl fracaso más caro que puedes tener en IA es el que no te enseña nada.`,
      categoria: cat('Historia / Experiencia personal'),
      estado: 'publicado',
      fechaProgramada: d(-2),
      esHistorico: false,
      metricas: { impresiones: 9120, reacciones: 412, comentarios: 89, compartidos: 67, verMas: 734 },
      actualizadoEn: new Date().toISOString(),
    },
    {
      id: id(),
      contenido: `Los agentes de IA están cambiando el trabajo del conocimiento más rápido de lo que pensamos.\n\nEsta semana he probado 4 frameworks de agentes con clientes reales. Mis conclusiones...`,
      categoria: cat('Tendencias del Sector'),
      estado: 'programado',
      fechaProgramada: d(1),
      esHistorico: false,
      metricas: null,
      actualizadoEn: new Date().toISOString(),
    },
    {
      id: id(),
      contenido: `3 errores que cometen las empresas al implementar su primer chatbot de IA:\n\nError #1: Empezar por la tecnología, no por el problema\nError #2: No involucrar al equipo que lo va a usar\nError #3: Medir solo satisfacción, no eficiencia real\n\nCada uno de estos errores puede hundir un proyecto perfectamente viable.`,
      categoria: cat('Casos de uso IA'),
      estado: 'programado',
      fechaProgramada: d(3),
      esHistorico: false,
      metricas: null,
      actualizadoEn: new Date().toISOString(),
    },
    {
      id: id(),
      contenido: `Borrador: reflexión sobre el futuro de la consultoría IA en España y cómo posicionarse...`,
      categoria: cat('Opinión / Reflexión'),
      estado: 'borrador',
      fechaProgramada: null,
      esHistorico: false,
      metricas: null,
      actualizadoEn: new Date().toISOString(),
    },
  ];
}

export const sampleNews = [
  {
    id: id(),
    titulo_es: 'OpenAI lanza GPT-5 con capacidades de razonamiento avanzado',
    resumen_es: 'OpenAI ha presentado GPT-5, su modelo más potente hasta la fecha, con mejoras significativas en razonamiento matemático y científico. El modelo supera a sus predecesores en benchmarks clave y estará disponible para desarrolladores a partir del próximo mes.',
    titulo_en: 'OpenAI launches GPT-5 with advanced reasoning capabilities',
    url_original: 'https://alphasignal.ai',
    categoria: 'Models & Research',
    fecha: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: id(),
    titulo_es: 'Google DeepMind presenta AlphaCode 3 para programación autónoma',
    resumen_es: 'La nueva versión de AlphaCode puede resolver problemas de programación competitiva con un rendimiento superior al 85% de los programadores humanos. DeepMind destaca su capacidad para escribir código complejo en múltiples lenguajes.',
    titulo_en: 'Google DeepMind presents AlphaCode 3 for autonomous programming',
    url_original: 'https://alphasignal.ai',
    categoria: 'Models & Research',
    fecha: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: id(),
    titulo_es: 'Anthropic recauda 2.000 millones adicionales para seguridad en IA',
    resumen_es: 'La empresa detrás de Claude ha cerrado una nueva ronda de financiación valorada en 2.000 millones de dólares, destinada principalmente a investigación en seguridad y alineamiento de modelos de inteligencia artificial.',
    titulo_en: 'Anthropic raises additional $2B for AI safety',
    url_original: 'https://alphasignal.ai',
    categoria: 'Business',
    fecha: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: id(),
    titulo_es: 'Mistral AI lanza nuevo modelo open source que compite con GPT-4',
    resumen_es: 'La startup francesa ha publicado Mistral Large 2, un modelo de código abierto que según sus benchmarks supera a GPT-4 en tareas de razonamiento y código, manteniendo su enfoque en eficiencia computacional.',
    titulo_en: 'Mistral AI launches new open source model competing with GPT-4',
    url_original: 'https://alphasignal.ai',
    categoria: 'Open Source',
    fecha: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: id(),
    titulo_es: 'Microsoft integra agentes IA autónomos en Microsoft 365',
    resumen_es: 'Microsoft ha anunciado la incorporación de agentes IA capaces de ejecutar tareas complejas de forma autónoma en toda la suite de Office, desde gestión de correos hasta análisis de datos en Excel.',
    titulo_en: 'Microsoft integrates autonomous AI agents into Microsoft 365',
    url_original: 'https://alphasignal.ai',
    categoria: 'Tools',
    fecha: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: id(),
    titulo_es: 'Nuevo estudio revela que el 68% de los trabajadores ya usa IA en su trabajo diario',
    resumen_es: 'Una investigación de McKinsey con más de 10.000 trabajadores en 15 países muestra una adopción masiva de herramientas de IA en el entorno laboral, especialmente en sectores como finanzas, legal y consultoría.',
    titulo_en: 'New study reveals 68% of workers already use AI in daily work',
    url_original: 'https://alphasignal.ai',
    categoria: 'Business',
    fecha: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: id(),
    titulo_es: 'LangChain lanza plataforma de observabilidad para agentes IA en producción',
    resumen_es: 'LangSmith, la herramienta de monitorización de LangChain, añade nuevas funcionalidades para rastrear el comportamiento de agentes autónomos en entornos de producción, incluyendo detección de alucinaciones en tiempo real.',
    titulo_en: 'LangChain launches observability platform for AI agents in production',
    url_original: 'https://alphasignal.ai',
    categoria: 'Tools',
    fecha: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: id(),
    titulo_es: 'Meta publica Llama 4 con contexto de 1 millón de tokens',
    resumen_es: 'La nueva versión de Llama amplía dramáticamente su ventana de contexto y mejora sus capacidades multimodales. Meta mantiene su compromiso con el código abierto y permite uso comercial sin restricciones.',
    titulo_en: 'Meta publishes Llama 4 with 1 million token context',
    url_original: 'https://alphasignal.ai',
    categoria: 'Open Source',
    fecha: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: id(),
    titulo_es: 'Investigadores de Stanford desarrollan IA que detecta enfermedades raras en imágenes médicas',
    resumen_es: 'Un equipo de Stanford ha publicado un modelo especializado en diagnóstico de enfermedades raras a partir de imágenes de resonancia magnética, alcanzando una precisión del 94% en condiciones que los médicos tardan años en diagnosticar.',
    titulo_en: 'Stanford researchers develop AI that detects rare diseases in medical images',
    url_original: 'https://alphasignal.ai',
    categoria: 'Models & Research',
    fecha: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: id(),
    titulo_es: 'El Parlamento Europeo aprueba el reglamento de implementación de la AI Act',
    resumen_es: 'La UE ha aprobado el reglamento de implementación que define las obligaciones técnicas para sistemas de IA de alto riesgo. Las empresas tienen hasta 2026 para cumplir con los requisitos de transparencia y auditoría.',
    titulo_en: 'European Parliament approves AI Act implementation regulation',
    url_original: 'https://alphasignal.ai',
    categoria: 'Business',
    fecha: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
];

export const defaultSettings = {
  anthropicApiKey: '',
  supabaseUrl: '',
  supabaseAnonKey: '',
  perfil: {
    nombre: 'Tu Nombre',
    titular: 'Consultor de Inteligencia Artificial',
    foto: '',
    nicho: 'consultoría de inteligencia artificial para empresas',
    tono: 'profesional pero cercano',
  },
};
