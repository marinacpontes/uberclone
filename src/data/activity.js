function daysAgo(days, hours, minutes) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export const PAST_TRIPS = [
  { id: 'past-1', vehicleId: 'uberx', placeId: 'ibirapuera-park', date: daysAgo(2, 19, 42), price: 21.37, status: 'completed' },
  { id: 'past-2', vehicleId: 'comfort', placeId: 'congonhas', date: daysAgo(5, 6, 15), price: 38.9, status: 'completed' },
  { id: 'past-3', vehicleId: 'moto', placeId: 'work', date: daysAgo(8, 8, 31), price: 9.84, status: 'completed' },
  { id: 'past-4', vehicleId: 'uberx', placeId: 'home', date: daysAgo(13, 23, 8), price: 0, status: 'canceled' },
  { id: 'past-5', vehicleId: 'black', placeId: 'theatro', date: daysAgo(19, 20, 2), price: 52.6, status: 'completed' },
];

export const INBOX = [
  { id: 'm1', title: 'Seu recibo de viagem', body: 'Viagem para Parque Ibirapuera · R$ 21,37 pago com Pix.', when: 'Há 2 dias' },
  { id: 'm2', title: '15% off em viagens de Moto', body: 'Válido até domingo em viagens de até R$ 25 na cidade de São Paulo.', when: 'Há 3 dias' },
  { id: 'm3', title: 'Confirmamos seu novo cartão', body: 'O cartão Mastercard •••• 7310 foi adicionado à sua conta.', when: 'Há 1 semana' },
];
