import type { GeneratedWebsite } from "@/src/lib/types/ai-website";

export type DemoCampaignStatus =
  | "new_lead"
  | "analyzed"
  | "website_generated"
  | "pending_approval"
  | "approved"
  | "contacted"
  | "responded"
  | "client";

export type DemoBusinessCase = {
  leadId: string;
  demoSlug: string;
  businessName: string;
  city: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  websiteUrl: string;
  websiteQualityScore: number;
  opportunityScore: number;
  mainProblemDetected: string;
  detectedProblems: string[];
  recommendations: string[];
  campaignStatus: DemoCampaignStatus;
  suggestedMessage: {
    channel: "email" | "whatsapp" | "instagram_dm" | "call_script";
    subject: string;
    body: string;
  };
  generatedWebsite: GeneratedWebsite;
};

const makeSections = (sections: GeneratedWebsite["website"]["sections"]) => sections;

export const demoBusinessCases: DemoBusinessCase[] = [
  {
    leadId: "mock-il-sole",
    demoSlug: "il-sole-demo",
    businessName: "Restaurante Il Sole",
    city: "Alicante",
    category: "restaurant",
    description: "Restaurante italiano mediterraneo con horno de lena y terraza.",
    address: "Av. Costa 18, Alicante",
    phone: "+34 965 110 220",
    email: "reservas@ilsole.es",
    whatsapp: "+34 611 210 220",
    websiteUrl: "https://ilsole-alicante.es",
    websiteQualityScore: 54,
    opportunityScore: 82,
    mainProblemDetected: "No hay reserva online visible desde móvil.",
    detectedProblems: [
      "Carta en PDF difícil de leer",
      "Sin botón fijo de reserva",
      "Pocas reseñas destacadas",
    ],
    recommendations: [
      "Sistema de reservas en hero y menú",
      "Galería de platos con fotos profesionales",
      "Bloque de testimonios con valoración",
    ],
    campaignStatus: "website_generated",
    suggestedMessage: {
      channel: "whatsapp",
      subject: "",
      body: "Hola equipo de Il Sole. Hemos preparado una demo visual enfocada en aumentar reservas desde móvil y WhatsApp. Incluye carta clara, CTA de reserva y reseñas destacadas. Si os parece, os la enseño en 10 minutos esta semana.",
    },
    generatedWebsite: {
      id: "il-sole-demo",
      leadId: "mock-il-sole",
      businessProfile: {
        businessName: "Restaurante Il Sole",
        businessType: "restaurant",
        city: "Alicante",
        category: "Italiano mediterraneo",
        targetCustomer: "Parejas y familias que buscan cena con experiencia.",
        mainGoal: "get_reservations",
        tone: "Cercano, apetecible y elegante",
        visualStyle: "mediterranean",
        colorPalette: { primary: "#B91C1C", secondary: "#F59E0B", background: "#FFF7ED", text: "#1F2937", accent: "#15803D" },
        fontStyle: "Serif moderno + sans legible",
        imageStyle: "Fotografia gastronomica calida",
      },
      website: {
        hero: {
          variant: "split-image",
          eyebrow: "Sabor mediterraneo en Alicante",
          title: "La mesa italiana que siempre apetece",
          subtitle: "Pasta fresca, horno de lena y reservas en 20 segundos.",
          primaryCTA: "Reservar mesa",
          secondaryCTA: "Ver carta",
          backgroundImagePrompt: "Mesa italiana elegante con pasta artesanal, luz dorada y ambiente mediterraneo",
        },
        sections: makeSections([
          { type: "menu", variant: "cards", title: "Carta destacada", subtitle: "Nuestros platos mas pedidos", items: [{ name: "Lasaña de la casa", price: "15 EUR" }, { name: "Risotto funghi", price: "17 EUR" }], cta: "Ver carta completa", order: 1, imagePrompt: "Platos italianos premium sobre mesa de madera", imageAlt: "Carta destacada Il Sole" },
          { type: "gallery", variant: "masonry", title: "Ambiente y cocina", subtitle: "Una experiencia para repetir", items: [{ caption: "Terraza nocturna" }, { caption: "Horno en directo" }], cta: "Ver galeria", order: 2, imagePrompt: "Interior de restaurante mediterraneo con luz tenue", imageAlt: "Galeria restaurante" },
          { type: "reviews", variant: "cards", title: "Opiniones reales", subtitle: "Clientes que vuelven", items: [{ author: "Marta", text: "Servicio excelente y comida top." }], cta: "Leer mas reseñas", order: 3 },
          { type: "booking", variant: "inline-form", title: "Reserva online", subtitle: "Confirma tu mesa sin llamadas", items: [{ field: "fecha" }, { field: "hora" }], cta: "Confirmar reserva", order: 4 },
          { type: "location", variant: "map-card", title: "Estamos en el centro", subtitle: "Facil de llegar y aparcar", items: [{ mapLabel: "Av. Costa 18, Alicante" }], cta: "Cómo llegar", order: 5 },
          { type: "final_cta", variant: "banner", title: "¿Cenamos hoy?", subtitle: "Te guardamos la mejor mesa.", items: [], cta: "Reservar ahora", order: 6 },
        ]),
        seo: { title: "Il Sole Alicante | Restaurante italiano", description: "Reserva en Il Sole: cocina italiana mediterranea en Alicante.", keywords: ["restaurante italiano alicante", "reservar mesa alicante"] },
        contact: { phone: "+34 965 110 220", email: "reservas@ilsole.es", whatsapp: "+34 611 210 220", address: "Av. Costa 18, Alicante" },
        confidence: {
          reasoning: "El negocio depende de reservas de alta intención local.",
          salesAngle: "Mostrar calidad culinaria y reducir fricción de reserva.",
          detectedProblems: ["Sin reserva inmediata", "Carta poco usable"],
          recommendedFeatures: ["Reserva one-click", "Reseñas visibles", "Galería emocional"],
        },
      },
    },
  },
  {
    leadId: "mock-sonrisa",
    demoSlug: "clinica-sonrisa-demo",
    businessName: "Clínica Dental Sonrisa",
    city: "Valencia",
    category: "clinic",
    description: "Clínica dental familiar con ortodoncia, implantes y estética.",
    address: "C/ Colón 77, Valencia",
    phone: "+34 960 700 901",
    email: "info@clinicasonrisa.es",
    whatsapp: "+34 622 700 901",
    websiteUrl: "https://clinicasonrisa.es",
    websiteQualityScore: 61,
    opportunityScore: 86,
    mainProblemDetected: "No transmite confianza médica en la primera pantalla.",
    detectedProblems: ["Sin perfiles del equipo", "Citas poco visibles", "FAQ inexistente"],
    recommendations: ["Hero centrado en confianza", "Bloque de especialistas", "Formulario de cita rápida"],
    campaignStatus: "analyzed",
    suggestedMessage: {
      channel: "email",
      subject: "Demo para captar más citas en Clínica Dental Sonrisa",
      body: "Hola, hemos preparado una demo visual para Clínica Dental Sonrisa enfocada en captar más citas y reforzar confianza: equipo médico visible, tratamientos claros y solicitud de cita rápida. ¿Os encaja revisarla juntos esta semana?",
    },
    generatedWebsite: {
      id: "clinica-sonrisa-demo",
      leadId: "mock-sonrisa",
      businessProfile: {
        businessName: "Clínica Dental Sonrisa",
        businessType: "clinic",
        city: "Valencia",
        category: "Odontología",
        targetCustomer: "Familias y profesionales que priorizan confianza.",
        mainGoal: "get_appointments",
        tone: "Profesional y tranquilizador",
        visualStyle: "clean_medical",
        colorPalette: { primary: "#2563EB", secondary: "#14B8A6", background: "#F8FAFC", text: "#0F172A", accent: "#8B5CF6" },
        fontStyle: "Sans geométrica limpia",
        imageStyle: "Clínica luminosa y natural",
      },
      website: {
        hero: {
          variant: "trust-focused",
          eyebrow: "Odontología avanzada en Valencia",
          title: "Tu sonrisa en manos expertas",
          subtitle: "Pide cita en 1 minuto con un equipo cercano y especializado.",
          primaryCTA: "Pedir cita",
          secondaryCTA: "Ver tratamientos",
          backgroundImagePrompt: "Clinica dental moderna, equipo profesional sonriendo, ambiente higienico y luminoso",
        },
        sections: makeSections([
          { type: "services", variant: "icon-grid", title: "Tratamientos", subtitle: "Desde prevención hasta estética avanzada", items: [{ name: "Implantes" }, { name: "Ortodoncia invisible" }], cta: "Ver todos", order: 1 },
          { type: "team", variant: "medical-profiles", title: "Equipo especialista", subtitle: "Profesionales con experiencia clínica", items: [{ name: "Dra. Lucía Pérez" }, { name: "Dr. Álvaro Ruiz" }], cta: "Conocer equipo", order: 2 },
          { type: "trust_badges", variant: "certifications", title: "Confianza y seguridad", subtitle: "Tecnología y protocolos clínicos", items: [{ badge: "Radiología digital" }, { badge: "Protocolos esterilización" }], cta: "Ver garantías", order: 3 },
          { type: "booking", variant: "inline-form", title: "Solicita tu cita", subtitle: "Respuesta en menos de 1 hora laboral", items: [{ field: "nombre" }, { field: "telefono" }], cta: "Enviar solicitud", order: 4 },
          { type: "faq", variant: "accordion", title: "Preguntas frecuentes", subtitle: "Información clara antes de tu visita", items: [{ q: "¿Primera visita?" }], cta: "Ver más FAQ", order: 5 },
          { type: "final_cta", variant: "clean-banner", title: "Empieza hoy tu tratamiento", subtitle: "Agenda una valoración personalizada.", items: [], cta: "Reservar cita", order: 6 },
        ]),
        seo: { title: "Clínica Dental Sonrisa Valencia", description: "Pide cita dental en Valencia con equipo especialista.", keywords: ["clinica dental valencia", "cita dentista valencia"] },
        contact: { phone: "+34 960 700 901", email: "info@clinicasonrisa.es", whatsapp: "+34 622 700 901", address: "C/ Colón 77, Valencia" },
        confidence: {
          reasoning: "La conversión se desbloquea con autoridad y facilidad de cita.",
          salesAngle: "Combinar confianza clínica con solicitud rápida.",
          detectedProblems: ["Falta de prueba social médica", "Cita poco visible"],
          recommendedFeatures: ["Equipo visible", "Trust badges", "Formulario corto"],
        },
      },
    },
  },
  {
    leadId: "mock-don-carlo",
    demoSlug: "barberia-don-carlo-demo",
    businessName: "Barbería Don Carlo",
    city: "Murcia",
    category: "barbershop",
    description: "Barbería clásica con arreglos de barba y estilo vintage.",
    address: "Plaza Mayor 5, Murcia",
    phone: "+34 968 401 229",
    email: "hola@doncarlobarberia.es",
    whatsapp: "+34 655 401 229",
    websiteUrl: "https://doncarlobarberia.es",
    websiteQualityScore: 49,
    opportunityScore: 79,
    mainProblemDetected: "No hay antes/después ni precios claros.",
    detectedProblems: ["Sin portfolio", "Reserva por llamada solamente", "Marca visual inconsistente"],
    recommendations: ["Antes y después", "Precios visibles", "Reserva por WhatsApp"],
    campaignStatus: "contacted",
    suggestedMessage: {
      channel: "instagram_dm",
      subject: "",
      body: "¡Buenas, equipo Don Carlo! Hemos montado una demo estilo vintage para que podáis mostrar cortes, precios y reserva por WhatsApp desde Instagram. Si queréis, os la enseño en 5 minutos.",
    },
    generatedWebsite: {
      id: "barberia-don-carlo-demo",
      leadId: "mock-don-carlo",
      businessProfile: {
        businessName: "Barbería Don Carlo",
        businessType: "barbershop",
        city: "Murcia",
        category: "Barbería vintage",
        targetCustomer: "Hombres de 20-50 que valoran imagen y detalle.",
        mainGoal: "get_whatsapp_messages",
        tone: "Masculino, directo y premium",
        visualStyle: "vintage",
        colorPalette: { primary: "#111827", secondary: "#D97706", background: "#0B0F19", text: "#F8FAFC", accent: "#B91C1C" },
        fontStyle: "Display serif + sans condensada",
        imageStyle: "Retratos con contraste alto",
      },
      website: {
        hero: {
          variant: "full-bleed",
          eyebrow: "Estilo clásico desde 2009",
          title: "Cortes con carácter",
          subtitle: "Reserva por WhatsApp y sal con tu mejor versión.",
          primaryCTA: "Reservar por WhatsApp",
          secondaryCTA: "Ver precios",
          backgroundImagePrompt: "Barberia vintage oscura con sillones de cuero y barber trabajando",
        },
        sections: makeSections([
          { type: "services", variant: "dark-list", title: "Servicios", subtitle: "Corte, barba y rituales premium", items: [{ name: "Corte clásico", price: "18 EUR" }, { name: "Barba premium", price: "14 EUR" }], cta: "Ver todos", order: 1 },
          { type: "pricing", variant: "compact-dark", title: "Tarifas claras", subtitle: "Sin sorpresas", items: [{ plan: "Corte + barba", price: "29 EUR" }], cta: "Elegir servicio", order: 2 },
          { type: "before_after", variant: "split-dark", title: "Antes / después", subtitle: "Resultados reales", items: [{ before: "Perfil sin definición", after: "Línea limpia y degradado preciso" }], cta: "Ver cambios", order: 3, imagePrompt: "Antes y despues de corte masculino degradado en barberia vintage", imageAlt: "Antes y después Don Carlo" },
          { type: "gallery", variant: "dark-grid", title: "Trabajos recientes", subtitle: "Inspiración para tu próximo look", items: [{ caption: "Fade clásico" }, { caption: "Barba definida" }], cta: "Más looks", order: 4, imagePrompt: "Galeria de cortes masculinos premium en ambiente oscuro", imageAlt: "Galería barbería" },
          { type: "booking", variant: "whatsapp-booking-dark", title: "Reserva inmediata", subtitle: "Confirma horario por WhatsApp", items: [{ field: "servicio" }, { field: "hora" }], cta: "Abrir WhatsApp", order: 5 },
          { type: "final_cta", variant: "dark-banner", title: "Tu próximo corte te espera", subtitle: "Envíanos un WhatsApp y listo.", items: [], cta: "Reservar ahora", order: 6 },
        ]),
        seo: { title: "Barbería Don Carlo Murcia", description: "Reserva tu corte y barba por WhatsApp en Don Carlo.", keywords: ["barberia murcia", "corte hombre murcia"] },
        contact: { phone: "+34 968 401 229", email: "hola@doncarlobarberia.es", whatsapp: "+34 655 401 229", address: "Plaza Mayor 5, Murcia" },
        confidence: {
          reasoning: "El negocio convierte con imagen y disponibilidad inmediata.",
          salesAngle: "Visual potente + reserva sin fricción.",
          detectedProblems: ["Sin portfolio visual", "No WhatsApp destacado"],
          recommendedFeatures: ["Before/after", "Tarifas visibles", "CTA persistente"],
        },
      },
    },
  },
  {
    leadId: "mock-marta",
    demoSlug: "peluqueria-marta-demo",
    businessName: "Peluquería Marta",
    city: "Elche",
    category: "beauty",
    description: "Peluquería femenina con color, tratamiento y peinado para eventos.",
    address: "C/ Reina 21, Elche",
    phone: "+34 966 455 882",
    email: "citas@peluqueriamarta.es",
    whatsapp: "+34 666 455 882",
    websiteUrl: "https://peluqueriamarta.es",
    websiteQualityScore: 57,
    opportunityScore: 74,
    mainProblemDetected: "No muestra resultados ni packs de servicios.",
    detectedProblems: ["Sin precios orientativos", "Sin reservas online", "Falta identidad visual"],
    recommendations: ["Catálogo de servicios", "Galería resultados", "CTA cita visible"],
    campaignStatus: "new_lead",
    suggestedMessage: { channel: "whatsapp", subject: "", body: "Hola Marta, hemos diseñado una demo para mostrar servicios, resultados y citas por WhatsApp en un estilo más premium. ¿Te apetece verla?" },
    generatedWebsite: {
      id: "peluqueria-marta-demo",
      leadId: "mock-marta",
      businessProfile: {
        businessName: "Peluquería Marta",
        businessType: "beauty",
        city: "Elche",
        category: "Peluquería y color",
        targetCustomer: "Mujeres que buscan imagen cuidada y asesoría.",
        mainGoal: "get_appointments",
        tone: "Elegante y cercano",
        visualStyle: "luxury",
        colorPalette: { primary: "#BE185D", secondary: "#F9A8D4", background: "#FFF1F2", text: "#3F3F46", accent: "#7C3AED" },
        fontStyle: "Sans elegante",
        imageStyle: "Beauty editorial suave",
      },
      website: {
        hero: { variant: "beauty-soft", eyebrow: "Color y estilo en Elche", title: "Tu look, en manos expertas", subtitle: "Reserva tu cita para color, corte o evento.", primaryCTA: "Reservar cita", secondaryCTA: "Ver servicios", backgroundImagePrompt: "Peluqueria femenina elegante con estilista y cliente sonriendo" },
        sections: makeSections([
          { type: "services", variant: "cards", title: "Servicios estrella", subtitle: "Resultados que se notan", items: [{ name: "Color premium" }, { name: "Balayage" }], cta: "Solicitar asesoría", order: 1 },
          { type: "gallery", variant: "beauty-grid", title: "Resultados", subtitle: "Antes y después reales", items: [{ caption: "Rubio natural" }, { caption: "Peinado evento" }], cta: "Ver galería", order: 2 },
          { type: "offers", variant: "pastel", title: "Packs mensuales", subtitle: "Ahorra con planes de cuidado", items: [{ name: "Pack color + hidratación" }], cta: "Ver ofertas", order: 3 },
          { type: "reviews", variant: "soft-cards", title: "Opiniones", subtitle: "Clientas satisfechas", items: [{ author: "Paula", text: "Me encanta el resultado siempre." }], cta: "Leer más", order: 4 },
          { type: "booking", variant: "inline-form", title: "Reserva tu cita", subtitle: "Te confirmamos por WhatsApp", items: [{ field: "servicio" }], cta: "Reservar", order: 5 },
          { type: "final_cta", variant: "gradient", title: "¿Lista para tu próximo cambio?", subtitle: "Agenda hoy y asegura tu horario.", items: [], cta: "Pedir cita", order: 6 },
        ]),
        seo: { title: "Peluquería Marta Elche", description: "Color, corte y peinados con cita rápida en Elche.", keywords: ["peluqueria elche", "citas peluqueria"] },
        contact: { phone: "+34 966 455 882", email: "citas@peluqueriamarta.es", whatsapp: "+34 666 455 882", address: "C/ Reina 21, Elche" },
        confidence: { reasoning: "La decisión es visual y emocional.", salesAngle: "Enseñar resultados y facilitar cita inmediata.", detectedProblems: ["Sin galería clara"], recommendedFeatures: ["Galería destacada", "Packs", "CTA visible"] },
      },
    },
  },
  {
    leadId: "mock-costa-blanca",
    demoSlug: "inmobiliaria-costa-blanca-demo",
    businessName: "Inmobiliaria Costa Blanca",
    city: "Benidorm",
    category: "real_estate",
    description: "Compra, venta y alquiler vacacional en costa mediterránea.",
    address: "Av. Mediterráneo 40, Benidorm",
    phone: "+34 965 880 341",
    email: "ventas@costablancaimmo.es",
    whatsapp: "+34 644 880 341",
    websiteUrl: "https://costablancaimmo.es",
    websiteQualityScore: 59,
    opportunityScore: 88,
    mainProblemDetected: "No captura leads cualificados en fichas.",
    detectedProblems: ["Propiedades poco filtrables", "Sin formulario de valoración", "Copy genérico"],
    recommendations: ["Buscador por intención", "Lead form por propiedad", "Prueba social local"],
    campaignStatus: "pending_approval",
    suggestedMessage: { channel: "email", subject: "Demo para mejorar captación de compradores y propietarios", body: "Hola equipo de Costa Blanca, hemos preparado una demo orientada a captar leads cualificados con buscador claro, fichas más comerciales y formularios de valoración. ¿La revisamos esta semana?" },
    generatedWebsite: {
      id: "inmobiliaria-costa-blanca-demo",
      leadId: "mock-costa-blanca",
      businessProfile: {
        businessName: "Inmobiliaria Costa Blanca",
        businessType: "real_estate",
        city: "Benidorm",
        category: "Inmobiliaria residencial",
        targetCustomer: "Compradores nacionales e internacionales.",
        mainGoal: "capture_leads",
        tone: "Profesional y consultivo",
        visualStyle: "corporate",
        colorPalette: { primary: "#0F4C81", secondary: "#38BDF8", background: "#F8FAFC", text: "#0F172A", accent: "#F97316" },
        fontStyle: "Sans corporativa",
        imageStyle: "Arquitectura luminosa de costa",
      },
      website: {
        hero: { variant: "property-search", eyebrow: "Especialistas en Benidorm", title: "Encuentra tu próxima vivienda", subtitle: "Compra, vende o invierte con asesoría local.", primaryCTA: "Ver propiedades", secondaryCTA: "Valorar mi vivienda", backgroundImagePrompt: "Vivienda mediterranea moderna frente al mar con luz natural" },
        sections: makeSections([
          { type: "properties", variant: "grid", title: "Propiedades destacadas", subtitle: "Seleccionadas por demanda", items: [{ ref: "CB-102", price: "289.000 EUR" }], cta: "Ver más inmuebles", order: 1, imagePrompt: "Fachada de vivienda moderna en costa blanca", imageAlt: "Propiedad destacada" },
          { type: "services", variant: "cards", title: "Servicios", subtitle: "Acompañamiento integral", items: [{ name: "Compra segura" }, { name: "Venta express" }], cta: "Conocer servicios", order: 2 },
          { type: "reviews", variant: "cards", title: "Clientes satisfechos", subtitle: "Resultados con transparencia", items: [{ author: "Carlos y Ana", text: "Vendimos en 6 semanas." }], cta: "Ver casos", order: 3 },
          { type: "faq", variant: "accordion", title: "Dudas frecuentes", subtitle: "Te guiamos en cada paso", items: [{ q: "¿Qué gastos tiene la compra?" }], cta: "Más respuestas", order: 4 },
          { type: "lead_capture_form", variant: "valuation-form", title: "¿Quieres vender?", subtitle: "Recibe valoración orientativa", items: [{ field: "zona" }, { field: "m2" }], cta: "Solicitar valoración", order: 5 },
          { type: "final_cta", variant: "corporate-banner", title: "Hablemos de tu operación", subtitle: "Un asesor local te contacta hoy.", items: [], cta: "Hablar con un asesor", order: 6 },
        ]),
        seo: { title: "Inmobiliaria Costa Blanca Benidorm", description: "Compra y venta de viviendas en Benidorm.", keywords: ["inmobiliaria benidorm", "viviendas costa blanca"] },
        contact: { phone: "+34 965 880 341", email: "ventas@costablancaimmo.es", whatsapp: "+34 644 880 341", address: "Av. Mediterráneo 40, Benidorm" },
        confidence: { reasoning: "Necesitan capturar lead cualificado en cada ficha.", salesAngle: "Filtrado claro + valoración para propietarios.", detectedProblems: ["Fuga de leads"], recommendedFeatures: ["Lead form por propiedad", "Buscador claro"] },
      },
    },
  },
  {
    leadId: "mock-english-plus",
    demoSlug: "academia-english-plus-demo",
    businessName: "Academia English Plus",
    city: "Castellón",
    category: "academy",
    description: "Academia de inglés para niños, teens y adultos.",
    address: "C/ San Vicente 13, Castellón",
    phone: "+34 964 320 114",
    email: "hola@englishplus.es",
    whatsapp: "+34 600 320 114",
    websiteUrl: "https://englishplus.es",
    websiteQualityScore: 63,
    opportunityScore: 77,
    mainProblemDetected: "No convierte tráfico en pruebas de nivel.",
    detectedProblems: ["Sin itinerario por nivel", "No muestra metodología", "CTA débil"],
    recommendations: ["Proceso de inscripción", "Lead form para prueba", "Precios por programa"],
    campaignStatus: "approved",
    suggestedMessage: { channel: "email", subject: "Demo para captar más matrículas en English Plus", body: "Hola, hemos preparado una propuesta para English Plus centrada en captación de pruebas de nivel y matrículas: estructura por edades, metodología clara y formulario directo. ¿Os la enseño?" },
    generatedWebsite: {
      id: "academia-english-plus-demo",
      leadId: "mock-english-plus",
      businessProfile: {
        businessName: "Academia English Plus",
        businessType: "academy",
        city: "Castellón",
        category: "Academia de inglés",
        targetCustomer: "Padres y adultos que quieren progresar rápido.",
        mainGoal: "capture_leads",
        tone: "Didáctico y motivador",
        visualStyle: "playful",
        colorPalette: { primary: "#2563EB", secondary: "#F59E0B", background: "#F0F9FF", text: "#1E293B", accent: "#10B981" },
        fontStyle: "Sans friendly",
        imageStyle: "Aulas dinámicas y personas aprendiendo",
      },
      website: {
        hero: { variant: "education", eyebrow: "Aprende inglés con método", title: "Resultados reales en cada nivel", subtitle: "Prueba de nivel gratis y plan personalizado.", primaryCTA: "Solicitar prueba", secondaryCTA: "Ver cursos", backgroundImagePrompt: "Academia de idiomas moderna con alumnos practicando inglés" },
        sections: makeSections([
          { type: "services", variant: "program-grid", title: "Programas", subtitle: "Niños, teens y adultos", items: [{ name: "Kids" }, { name: "B1-B2 adultos" }], cta: "Elegir programa", order: 1 },
          { type: "process", variant: "steps", title: "Cómo funciona", subtitle: "Diagnóstico, plan y seguimiento", items: [{ step: "Prueba de nivel" }, { step: "Plan mensual" }], cta: "Ver proceso", order: 2 },
          { type: "pricing", variant: "tiers", title: "Precios", subtitle: "Cuotas claras por programa", items: [{ plan: "Adultos 2 días", price: "79 EUR/mes" }], cta: "Comparar planes", order: 3 },
          { type: "faq", variant: "accordion", title: "Preguntas frecuentes", subtitle: "Todo sobre horarios y niveles", items: [{ q: "¿Hay clases online?" }], cta: "Resolver dudas", order: 4 },
          { type: "lead_capture_form", variant: "trial-form", title: "Pide prueba gratuita", subtitle: "Te llamamos en el día", items: [{ field: "edad" }, { field: "nivel actual" }], cta: "Quiero mi prueba", order: 5 },
          { type: "final_cta", variant: "color-banner", title: "Empieza esta semana", subtitle: "Reserva tu plaza hoy.", items: [], cta: "Solicitar plaza", order: 6 },
        ]),
        seo: { title: "Academia English Plus Castellón", description: "Cursos de inglés con prueba de nivel gratis.", keywords: ["academia ingles castellon", "prueba nivel ingles"] },
        contact: { phone: "+34 964 320 114", email: "hola@englishplus.es", whatsapp: "+34 600 320 114", address: "C/ San Vicente 13, Castellón" },
        confidence: { reasoning: "La lead magnet ideal es la prueba de nivel.", salesAngle: "Estructura clara + prueba gratuita.", detectedProblems: ["Sin captación activa"], recommendedFeatures: ["Trial form", "Proceso visible"] },
      },
    },
  },
  {
    leadId: "mock-motor",
    demoSlug: "talleres-del-motor-demo",
    businessName: "Talleres del Motor",
    city: "Albacete",
    category: "automotive",
    description: "Taller multimarca de mecánica rápida y mantenimiento.",
    address: "Polígono Campollano 9, Albacete",
    phone: "+34 967 550 098",
    email: "citas@talleresdelmotor.es",
    whatsapp: "+34 688 550 098",
    websiteUrl: "https://talleresdelmotor.es",
    websiteQualityScore: 52,
    opportunityScore: 80,
    mainProblemDetected: "No hay solicitud de cita online ni urgencias visibles.",
    detectedProblems: ["Servicios poco ordenados", "Sin transparencia de procesos", "Contacto escondido"],
    recommendations: ["Bloque de servicios por tipo", "Proceso en 3 pasos", "CTA de cita y urgencias"],
    campaignStatus: "responded",
    suggestedMessage: { channel: "call_script", subject: "Guion breve propuesta web", body: "Hola, os llamo porque hemos preparado una demo para Talleres del Motor enfocada en captar más citas de mantenimiento y averías urgentes desde móvil. ¿Os viene bien verla hoy o mañana?" },
    generatedWebsite: {
      id: "talleres-del-motor-demo",
      leadId: "mock-motor",
      businessProfile: {
        businessName: "Talleres del Motor",
        businessType: "automotive",
        city: "Albacete",
        category: "Taller multimarca",
        targetCustomer: "Conductores que buscan rapidez y confianza.",
        mainGoal: "get_calls",
        tone: "Directo y técnico",
        visualStyle: "industrial",
        colorPalette: { primary: "#1E293B", secondary: "#F97316", background: "#F8FAFC", text: "#0F172A", accent: "#0EA5E9" },
        fontStyle: "Sans robusta",
        imageStyle: "Taller real con mecánicos en acción",
      },
      website: {
        hero: { variant: "service-hero", eyebrow: "Mecánica rápida en Albacete", title: "Tu coche listo cuando lo necesitas", subtitle: "Pide cita online o llámanos para urgencias.", primaryCTA: "Llamar ahora", secondaryCTA: "Solicitar cita", backgroundImagePrompt: "Taller mecánico moderno con coche en elevador y mecánico trabajando" },
        sections: makeSections([
          { type: "services", variant: "icon-list", title: "Servicios", subtitle: "Mantenimiento y reparación multimarca", items: [{ name: "Cambio aceite" }, { name: "Frenos" }], cta: "Ver servicio", order: 1 },
          { type: "process", variant: "steps-industrial", title: "Proceso", subtitle: "Diagnóstico, presupuesto y entrega", items: [{ step: "Recepción y revisión" }, { step: "Presupuesto claro" }, { step: "Entrega" }], cta: "Cómo trabajamos", order: 2 },
          { type: "offers", variant: "promo-cards", title: "Promociones", subtitle: "Ahorra en mantenimiento", items: [{ offer: "Revisión pre-ITV -20%" }], cta: "Aprovechar oferta", order: 3 },
          { type: "reviews", variant: "compact", title: "Clientes", subtitle: "Puntuación media 4.8", items: [{ author: "Javier", text: "Rápidos y honestos." }], cta: "Ver reseñas", order: 4 },
          { type: "contact", variant: "dual-cta", title: "Contacto rápido", subtitle: "Llama o escribe por WhatsApp", items: [{ channel: "telefono" }, { channel: "whatsapp" }], cta: "Contactar", order: 5 },
          { type: "final_cta", variant: "industrial-band", title: "No dejes la avería para mañana", subtitle: "Te damos cita hoy mismo.", items: [], cta: "Pedir cita", order: 6 },
        ]),
        seo: { title: "Talleres del Motor Albacete", description: "Citas de taller y mecánica rápida en Albacete.", keywords: ["taller albacete", "cita taller"] },
        contact: { phone: "+34 967 550 098", email: "citas@talleresdelmotor.es", whatsapp: "+34 688 550 098", address: "Polígono Campollano 9, Albacete" },
        confidence: { reasoning: "El usuario busca solución inmediata.", salesAngle: "Urgencia + confianza técnica.", detectedProblems: ["Sin CTA inmediata"], recommendedFeatures: ["Llamada visible", "Proceso claro"] },
      },
    },
  },
  {
    leadId: "mock-mar-azul",
    demoSlug: "hotel-mar-azul-demo",
    businessName: "Hotel Boutique Mar Azul",
    city: "Altea",
    category: "hotel",
    description: "Hotel boutique frente al mar con experiencia premium.",
    address: "Paseo Marítimo 3, Altea",
    phone: "+34 966 780 771",
    email: "booking@hotelmarazul.es",
    whatsapp: "+34 622 780 771",
    websiteUrl: "https://hotelmarazul.es",
    websiteQualityScore: 66,
    opportunityScore: 83,
    mainProblemDetected: "Motor de reservas poco visible en móvil.",
    detectedProblems: ["Fotos no venden experiencia", "No segmenta habitaciones", "Sin ofertas directas"],
    recommendations: ["Hero emocional", "Habitaciones por tipo", "Oferta reserva directa"],
    campaignStatus: "client",
    suggestedMessage: { channel: "email", subject: "Propuesta visual para aumentar reservas directas", body: "Hola equipo Mar Azul, hemos preparado una demo enfocada en reservas directas: hero emocional, habitaciones mejor presentadas y ofertas para reducir dependencia de OTAs. ¿La revisamos?" },
    generatedWebsite: {
      id: "hotel-mar-azul-demo",
      leadId: "mock-mar-azul",
      businessProfile: {
        businessName: "Hotel Boutique Mar Azul",
        businessType: "hotel",
        city: "Altea",
        category: "Hotel boutique",
        targetCustomer: "Parejas y viajeros premium de escapada.",
        mainGoal: "get_reservations",
        tone: "Exclusivo y relajado",
        visualStyle: "premium_dark",
        colorPalette: { primary: "#1D4ED8", secondary: "#38BDF8", background: "#0B1020", text: "#E2E8F0", accent: "#F59E0B" },
        fontStyle: "Serif elegante",
        imageStyle: "Litoral premium al atardecer",
      },
      website: {
        hero: { variant: "luxury-hotel", eyebrow: "Boutique frente al mar", title: "Escápate a Mar Azul", subtitle: "Reserva directa con ventajas exclusivas.", primaryCTA: "Reservar habitación", secondaryCTA: "Ver habitaciones", backgroundImagePrompt: "Hotel boutique frente al mar al atardecer con piscina infinita" },
        sections: makeSections([
          { type: "gallery", variant: "lux-grid", title: "El hotel", subtitle: "Espacios para desconectar", items: [{ caption: "Suite mar" }, { caption: "Rooftop" }], cta: "Ver galería", order: 1 },
          { type: "catalog", variant: "room-cards", title: "Habitaciones", subtitle: "Elige tu experiencia", items: [{ room: "Suite Vista Mar", from: "189 EUR" }], cta: "Comparar habitaciones", order: 2 },
          { type: "offers", variant: "hotel-offers", title: "Ofertas directas", subtitle: "Beneficios por reservar en web", items: [{ offer: "Desayuno incluido" }], cta: "Ver ofertas", order: 3 },
          { type: "reviews", variant: "lux", title: "Huéspedes felices", subtitle: "Valoración media 4.9", items: [{ author: "Andrea", text: "Experiencia impecable." }], cta: "Más opiniones", order: 4 },
          { type: "booking", variant: "date-picker", title: "Reserva directa", subtitle: "Mejor tarifa garantizada", items: [{ field: "entrada" }, { field: "salida" }], cta: "Comprobar disponibilidad", order: 5 },
          { type: "final_cta", variant: "dark-lux", title: "Tu escapada empieza aquí", subtitle: "Últimas habitaciones para este fin de semana.", items: [], cta: "Reservar ahora", order: 6 },
        ]),
        seo: { title: "Hotel Boutique Mar Azul Altea", description: "Reserva directa frente al mar en Altea.", keywords: ["hotel altea", "reserva hotel boutique"] },
        contact: { phone: "+34 966 780 771", email: "booking@hotelmarazul.es", whatsapp: "+34 622 780 771", address: "Paseo Marítimo 3, Altea" },
        confidence: { reasoning: "El foco es maximizar reserva directa.", salesAngle: "Experiencia premium + beneficios exclusivos.", detectedProblems: ["Motor oculto"], recommendedFeatures: ["Booking visible", "Oferta directa"] },
      },
    },
  },
  {
    leadId: "mock-green-life",
    demoSlug: "green-life-demo",
    businessName: "Tienda Natural Green Life",
    city: "Granada",
    category: "shop",
    description: "Tienda ecológica de alimentación y bienestar natural.",
    address: "C/ Recogidas 29, Granada",
    phone: "+34 958 401 663",
    email: "hola@greenlife.es",
    whatsapp: "+34 677 401 663",
    websiteUrl: "https://greenlife-natural.es",
    websiteQualityScore: 58,
    opportunityScore: 81,
    mainProblemDetected: "Catálogo poco usable y sin productos destacados.",
    detectedProblems: ["Sin fichas optimizadas", "Sin packs recomendados", "Checkout confuso"],
    recommendations: ["Catálogo por objetivo", "Featured products", "CTA de compra claro"],
    campaignStatus: "website_generated",
    suggestedMessage: { channel: "instagram_dm", subject: "", body: "Hola Green Life, hemos preparado una demo de tienda más limpia para destacar productos, packs y compras rápidas desde móvil. ¿Queréis verla?" },
    generatedWebsite: {
      id: "green-life-demo",
      leadId: "mock-green-life",
      businessProfile: {
        businessName: "Tienda Natural Green Life",
        businessType: "shop",
        city: "Granada",
        category: "Ecommerce natural",
        targetCustomer: "Personas que cuidan su alimentación y bienestar.",
        mainGoal: "sell_products",
        tone: "Natural y cercano",
        visualStyle: "natural",
        colorPalette: { primary: "#166534", secondary: "#4ADE80", background: "#F7FEE7", text: "#14532D", accent: "#EAB308" },
        fontStyle: "Sans orgánica",
        imageStyle: "Producto natural con luz suave",
      },
      website: {
        hero: { variant: "shop-hero", eyebrow: "Bienestar natural en casa", title: "Productos ecológicos seleccionados", subtitle: "Compra fácil y recibe en 24/48h.", primaryCTA: "Ver catálogo", secondaryCTA: "Top ventas", backgroundImagePrompt: "Tienda natural con productos ecologicos en estanterias de madera" },
        sections: makeSections([
          { type: "featured_products", variant: "product-cards", title: "Más vendidos", subtitle: "Favoritos de la comunidad", items: [{ name: "Kombucha bio", price: "3,90 EUR" }], cta: "Comprar ahora", order: 1, imagePrompt: "Producto natural premium en fondo limpio", imageAlt: "Producto destacado" },
          { type: "catalog", variant: "filters", title: "Catálogo", subtitle: "Encuentra por necesidad", items: [{ category: "Detox" }, { category: "Energía" }], cta: "Explorar catálogo", order: 2 },
          { type: "offers", variant: "eco-badges", title: "Ofertas y packs", subtitle: "Ahorra en tus rutinas", items: [{ offer: "Pack desayuno bio -15%" }], cta: "Ver packs", order: 3 },
          { type: "reviews", variant: "compact", title: "Opiniones", subtitle: "Compradores satisfechos", items: [{ author: "Lidia", text: "Entrega rápida y calidad top." }], cta: "Más reseñas", order: 4 },
          { type: "contact", variant: "support", title: "Asesoría natural", subtitle: "Te ayudamos a elegir", items: [{ channel: "whatsapp" }], cta: "Hablar con asesor", order: 5 },
          { type: "final_cta", variant: "green-banner", title: "Empieza hoy tu rutina saludable", subtitle: "Envío rápido en toda la península.", items: [], cta: "Ir a la tienda", order: 6 },
        ]),
        seo: { title: "Green Life Granada | Tienda natural", description: "Compra productos naturales y ecológicos online.", keywords: ["tienda natural granada", "productos ecologicos online"] },
        contact: { phone: "+34 958 401 663", email: "hola@greenlife.es", whatsapp: "+34 677 401 663", address: "C/ Recogidas 29, Granada" },
        confidence: { reasoning: "La venta depende de descubrimiento y confianza rápida.", salesAngle: "Mostrar productos estrella y reducir pasos de compra.", detectedProblems: ["Descubrimiento deficiente"], recommendedFeatures: ["Featured products", "Filtros claros"] },
      },
    },
  },
];

export const demoBusinessCasesByLeadId = demoBusinessCases.reduce<Record<string, DemoBusinessCase>>(
  (acc, item) => {
    acc[item.leadId] = item;
    return acc;
  },
  {},
);

export const demoBusinessCasesByDemoSlug = demoBusinessCases.reduce<Record<string, DemoBusinessCase>>(
  (acc, item) => {
    acc[item.demoSlug] = item;
    return acc;
  },
  {},
);

export const demoBusinessCasesByWebsiteId = demoBusinessCases.reduce<Record<string, DemoBusinessCase>>(
  (acc, item) => {
    acc[item.generatedWebsite.id] = item;
    return acc;
  },
  {},
);

export function getDemoBusinessCaseByLeadId(leadId: string) {
  return demoBusinessCasesByLeadId[leadId] ?? null;
}

export function getDemoBusinessCaseByDemoIdOrSlug(value: string) {
  return demoBusinessCasesByDemoSlug[value] ?? demoBusinessCasesByWebsiteId[value] ?? null;
}
