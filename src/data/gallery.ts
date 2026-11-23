export const galleryCategories = [
  {
    id: 'christmas',
    label: { es: 'Navidad', en: 'Christmas' },
    cover: '/1.jpg',
  },
  {
    id: 'markets',
    label: { es: 'Mercados', en: 'Food Hampers' },
    cover: '/9.jpg',
  },
  {
    id: 'community',
    label: { es: 'Comunidad', en: 'Community' },
    cover: '/14.jpg',
  },
] as const;

export type GalleryCategoryId = (typeof galleryCategories)[number]['id'];

export const galleryPhotos: {
  src: string;
  category: GalleryCategoryId;
  caption: { es: string; en: string };
}[] = [
  {
    src: '/1.jpg',
    category: 'christmas',
    caption: {
      es: 'Voluntarios compartiendo una jornada navideña con la comunidad.',
      en: 'Volunteers sharing a Christmas celebration with the community.',
    },
  },
  {
    src: '/2.jpg',
    category: 'christmas',
    caption: {
      es: 'Entrega de regalos y apoyo a familias de Guarne.',
      en: 'Delivering gifts and support to families in Guarne.',
    },
  },
  {
    src: '/3.jpg',
    category: 'christmas',
    caption: {
      es: 'Niños y familias disfrutando juntos de la actividad.',
      en: 'Children and families enjoying the activity together.',
    },
  },
  {
    src: '/4.jpg',
    category: 'christmas',
    caption: {
      es: 'Celebración comunitaria junto a las familias beneficiarias.',
      en: 'A community celebration with the families we support.',
    },
  },
  {
    src: '/5.jpg',
    category: 'christmas',
    caption: {
      es: 'Un momento especial durante la jornada navideña.',
      en: 'A special moment during the Christmas event.',
    },
  },
  {
    src: '/6.jpg',
    category: 'christmas',
    caption: {
      es: 'Acompañamiento a personas con discapacidad en Guarne.',
      en: 'Supporting people with disabilities in Guarne.',
    },
  },
  {
    src: '/7.jpg',
    category: 'markets',
    caption: {
      es: 'Voluntarios y beneficiarios reunidos en comunidad.',
      en: 'Volunteers and community members coming together.',
    },
  },
  {
    src: '/8.jpg',
    category: 'markets',
    caption: {
      es: 'Jornada de integración en el Oriente Antioqueño.',
      en: 'A community gathering in Eastern Antioquia.',
    },
  },
  {
    src: '/9.jpg',
    category: 'markets',
    caption: {
      es: 'Entrega de un mercado familiar a una persona de la comunidad.',
      en: 'A grocery hamper being delivered to a community member.',
    },
  },
  {
    src: '/10.jpg',
    category: 'markets',
    caption: {
      es: 'Encuentro y taller comunitario sobre salud y apoyo.',
      en: 'A community workshop on health and support.',
    },
  },
  {
    src: '/11.jpg',
    category: 'markets',
    caption: {
      es: 'Insumos y víveres preparados para su entrega.',
      en: 'Supplies and groceries ready to be delivered.',
    },
  },
  {
    src: '/12.jpg',
    category: 'community',
    caption: {
      es: 'Preparación de mercados para familias que los necesitan.',
      en: 'Preparing grocery hampers for families in need.',
    },
  },
  {
    src: '/13.jpg',
    category: 'community',
    caption: {
      es: 'Acompañamiento y apoyo a una paciente con cáncer.',
      en: 'Providing support and companionship to a cancer patient.',
    },
  },
  {
    src: '/14.jpg',
    category: 'community',
    caption: {
      es: 'Caminata comunitaria para promover la salud y el bienestar.',
      en: 'A community walk promoting health and well-being.',
    },
  },
  {
    src: '/15.jpg',
    category: 'community',
    caption: {
      es: 'Entrega de ayudas humanitarias en una zona rural.',
      en: 'Delivering humanitarian aid in a rural area.',
    },
  },
];
