/** Localização atual simulada do passageiro. */
export const CURRENT_LOCATION = {
  id: 'current',
  title: 'Rua Augusta, 1508',
  subtitle: 'Consolação, São Paulo - SP',
  lat: -23.55853,
  lng: -46.65967,
};

export const SAVED_PLACES = [
  {
    id: 'home',
    label: 'Casa',
    icon: 'home',
    title: 'Rua Harmonia, 427',
    subtitle: 'Vila Madalena, São Paulo - SP',
    lat: -23.55476,
    lng: -46.68932,
  },
  {
    id: 'work',
    label: 'Trabalho',
    icon: 'briefcase',
    title: 'Av. Brigadeiro Faria Lima, 3477',
    subtitle: 'Itaim Bibi, São Paulo - SP',
    lat: -23.58693,
    lng: -46.68222,
  },
];

export const PLACES = [
  { id: 'masp', title: 'MASP', subtitle: 'Av. Paulista, 1578, Bela Vista, São Paulo - SP', lat: -23.56141, lng: -46.65588, keywords: 'museu arte paulista' },
  { id: 'congonhas', title: 'Aeroporto de Congonhas (CGH)', subtitle: 'Av. Washington Luís, s/n, Vila Congonhas, São Paulo - SP', lat: -23.62611, lng: -46.65639, keywords: 'aeroporto cgh voo' },
  { id: 'guarulhos', title: 'Aeroporto Internacional de Guarulhos (GRU)', subtitle: 'Rod. Hélio Smidt, s/n, Cumbica, Guarulhos - SP', lat: -23.43556, lng: -46.47306, keywords: 'aeroporto gru cumbica voo' },
  { id: 'ibirapuera-park', title: 'Parque Ibirapuera', subtitle: 'Av. Pedro Álvares Cabral, Vila Mariana, São Paulo - SP', lat: -23.58737, lng: -46.65762, keywords: 'parque' },
  { id: 'ibirapuera-shop', title: 'Shopping Ibirapuera', subtitle: 'Av. Ibirapuera, 3103, Indianópolis, São Paulo - SP', lat: -23.61005, lng: -46.66682, keywords: 'shopping' },
  { id: 'jk', title: 'Shopping JK Iguatemi', subtitle: 'Av. Pres. Juscelino Kubitschek, 2041, Vila Olímpia, São Paulo - SP', lat: -23.59164, lng: -46.68896, keywords: 'shopping' },
  { id: 'eldorado', title: 'Shopping Eldorado', subtitle: 'Av. Rebouças, 3970, Pinheiros, São Paulo - SP', lat: -23.57256, lng: -46.69608, keywords: 'shopping' },
  { id: 'mercadao', title: 'Mercado Municipal de São Paulo', subtitle: 'R. da Cantareira, 306, Centro Histórico, São Paulo - SP', lat: -23.54166, lng: -46.62969, keywords: 'mercadao centro' },
  { id: 'pinacoteca', title: 'Pinacoteca de São Paulo', subtitle: 'Praça da Luz, 2, Luz, São Paulo - SP', lat: -23.53425, lng: -46.63393, keywords: 'museu' },
  { id: 'theatro', title: 'Theatro Municipal', subtitle: 'Praça Ramos de Azevedo, s/n, República, São Paulo - SP', lat: -23.54524, lng: -46.63876, keywords: 'teatro centro' },
  { id: 'allianz', title: 'Allianz Parque', subtitle: 'Av. Francisco Matarazzo, 1705, Água Branca, São Paulo - SP', lat: -23.52747, lng: -46.67852, keywords: 'estadio show palmeiras' },
  { id: 'tiete', title: 'Terminal Rodoviário Tietê', subtitle: 'Av. Cruzeiro do Sul, 1800, Santana, São Paulo - SP', lat: -23.51627, lng: -46.62514, keywords: 'rodoviaria onibus' },
  { id: 'sirio', title: 'Hospital Sírio-Libanês', subtitle: 'R. Dona Adma Jafet, 115, Bela Vista, São Paulo - SP', lat: -23.55741, lng: -46.65335, keywords: 'hospital' },
  { id: 'einstein', title: 'Hospital Israelita Albert Einstein', subtitle: 'Av. Albert Einstein, 627, Morumbi, São Paulo - SP', lat: -23.59977, lng: -46.71496, keywords: 'hospital' },
  { id: 'beco', title: 'Beco do Batman', subtitle: 'R. Gonçalo Afonso, Vila Madalena, São Paulo - SP', lat: -23.55601, lng: -46.68574, keywords: 'grafite' },
  { id: 'liberdade', title: 'Praça da Liberdade', subtitle: 'Praça da Liberdade, Liberdade, São Paulo - SP', lat: -23.55534, lng: -46.63555, keywords: 'feira japones metro' },
  { id: 'paulista-shop', title: 'Shopping Pátio Paulista', subtitle: 'R. Treze de Maio, 1947, Bela Vista, São Paulo - SP', lat: -23.56967, lng: -46.64543, keywords: 'shopping' },
  { id: 'morumbi-stadium', title: 'Estádio do Morumbi', subtitle: 'Praça Roberto Gomes Pedrosa, 1, Morumbi, São Paulo - SP', lat: -23.60014, lng: -46.72024, keywords: 'estadio show' },
];

/** Destinos recentes exibidos na tela inicial e na busca. */
export const RECENT_PLACE_IDS = ['masp', 'congonhas', 'jk', 'mercadao'];

const ALL = [...SAVED_PLACES, ...PLACES];

export const findPlace = (id) => ALL.find((place) => place.id === id);

export const recentPlaces = () => RECENT_PLACE_IDS.map(findPlace);

export const searchablePlaces = () => ALL;
