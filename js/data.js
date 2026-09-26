/* Virion Tec — Datos por defecto
   Todo esto se puede editar desde el Panel Administrador (admin.html).
   Se guarda en localStorage bajo la clave "viriontec_data". */

const DEFAULT_DATA = {
  contenido: {
    imagenEquipo: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85",
    videoPortada: "https://videos.pexels.com/video-files/4974708/4974708-hd_1920_1080_25fps.mp4"
  },
  contacto: {
    whatsapp: "51923976503",
    correo: "virion.technology23@gmail.com",
    zona: "Todo Lima Metropolitana"
  },

  distritos: [
    "Cercado de Lima", "Ate", "Barranco", "Breña", "Comas", "Chorrillos",
    "El Agustino", "Independencia", "Jesús María", "La Molina", "La Victoria",
    "Lince", "Los Olivos", "Magdalena del Mar", "Miraflores", "Pueblo Libre",
    "Puente Piedra", "Rímac", "San Borja", "San Isidro", "San Juan de Lurigancho",
    "San Juan de Miraflores", "San Luis", "San Martín de Porres", "San Miguel",
    "Santa Anita", "Santiago de Surco", "Surquillo", "Villa El Salvador",
    "Villa María del Triunfo", "Callao"
  ],

  combos: [
    {
      id: "combo-seguro",
      nombre: "Mi primera cámara",
      color: "green",
      precio: "S/ 250",
      descripcion: "Seguridad práctica para un pequeño negocio o casa: instala tu cámara y aprende a usarla desde el celular.",
      img: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=900&q=85",
      incluye: ["1 cámara Ezviz H6c Pro", "Memoria SD de 64 GB", "Cableado, canaleta y enchufe (hasta 3 m)", "Instalación", "Capacitación de uso"],
      requisitos: ["Pequeño negocio o vivienda", "Instalación a no más de 2,5 m de altura", "Contar con WiFi estable de al menos 20 Mbps"],
      activo: true, publico: true
    },
    {
      id: "combo-vende",
      nombre: "Vende Digital",
      color: "pink",
      precio: "Desde S/ 280",
      descripcion: "Creación de tu logo + menú o catálogo virtual con QR + 5 publicaciones para tus redes.",
      img: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=85",
      incluye: ["Diseño inicial de identidad visual", "Catálogo virtual con código QR", "5 diseños para redes sociales"],
      requisitos: ["Tener nombre y datos básicos del negocio", "Entregar fotos y precios de los productos", "Contar con WhatsApp para recibir pedidos"],
      activo: true, publico: true
    },
    {
      id: "combo-apertura",
      nombre: "Apertura Total",
      color: "blue",
      precio: "Desde S/ 690",
      descripcion: "Sistema de caja (POS) + 2 cámaras + diseño de tus redes + capacitación para cuidar tus costos.",
      img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=85",
      incluye: ["Configuración inicial de sistema POS", "Instalación de 2 cámaras", "Diseño básico para redes", "Capacitación de uso"],
      requisitos: ["Contar con internet estable en el local", "Tener una lista de productos y precios", "Coordinar una visita técnica"],
      activo: true, publico: true
    }
  ],

  catalogo: {
    tecnologia: {
      titulo: "Tecnología y Seguridad",
      color: "green",
      frase: "Protege tu inversión y moderniza tu local sin gastar una fortuna.",
      items: [
        "Cámaras CCTV económicas: vigila tu local, caja y personal desde el celular con cámaras WiFi o cableadas.",
        "Sistema de caja y ventas (POS): cobra rápido, emite boletas y conoce tus ventas del día sin cuaderno ni calculadora.",
        "WiFi sin cortes: mejora la conexión para tus clientes y evita que se cuelguen los sistemas de cobro.",
        "Mantenimiento de computadoras: reparamos, limpiamos y actualizamos PCs y laptops para que no detengan tus ventas.",
        "Página web o catálogo virtual: muestra tus productos y recibe pedidos fácilmente por WhatsApp.",
        "Rescate y protección de información: respaldamos tus ventas y documentos frente a virus o fallas."
      ]
    },
    diseno: {
      titulo: "Diseño y Redes",
      color: "pink",
      frase: "Hacemos que tu negocio se vea profesional y atraiga clientes de tu zona.",
      items: [
        "Manejo de Facebook, Instagram y TikTok: videos y publicaciones para atraer clientes de tu zona.",
        "Paquete Mi Primer Logo: logo y colores para que tu emprendimiento se convierta en una marca reconocible.",
        "Carteles, volantes y promociones: diseños para imprimir o compartir por WhatsApp y anunciar tus ofertas.",
        "Cartas y menús QR: carta física y código QR para que los clientes de tu restaurante o cafetería pidan más fácilmente.",
        "Fotos y videos de productos: contenido atractivo tomado en tu local para mostrar lo mejor de tus productos."
      ]
    },
    orden: {
      titulo: "Orden y Crecimiento",
      color: "blue",
      frase: "Te ayudamos a ordenar tus cuentas, cuidar tu mercadería y dejar de perder dinero.",
      items: [
        "Control de costos para comida: calcula cuánto cuesta cada plato y define precios que dejen ganancia.",
        "Organización de inventarios: registra existencias y compras para reducir pérdidas, vencimientos y faltantes.",
        "Capacitación express: enseña a tu equipo a usar la caja, atender mejor y cuidar los equipos.",
        "Automatización básica: usa herramientas gratuitas o económicas para dejar tareas manuales y ganar tiempo.",
        "Guía para abrir tu primer local: prepara internet, cobros y operación antes del día de inauguración."
      ]
    }
  },

  pilares: {
    tecnologia: {
      titulo: "Tecnología y Seguridad",
      color: "green",
      logo: "assets/logos/cubo-tecnologia.png",
      resumen: "Cuidamos tu local, tu caja y tu información como si fueran nuestros.",
      imagenes: [
        "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=700&q=80",
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=700&q=80",
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=700&q=80"
      ]
    },
    diseno: {
      titulo: "Diseño y Redes",
      color: "pink",
      logo: "assets/logos/cubo-diseno.png",
      resumen: "Le damos cara profesional a tu marca para que la gente de tu zona te elija.",
      imagenes: [
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=700&q=80",
        "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=700&q=80",
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=700&q=80"
      ]
    },
    orden: {
      titulo: "Orden y Crecimiento",
      color: "blue",
      logo: "assets/logos/cubo-orden.png",
      resumen: "Ordenamos tus números y tu mercadería para que ganes de verdad.",
      imagenes: [
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=700&q=80",
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=700&q=80",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=700&q=80"
      ]
    }
  }
};
