export const PAYMENT_METHODS = [
  { id: 'pix', type: 'pix', label: 'Pix', detail: 'Aprovação imediata' },
  { id: 'visa', type: 'card', label: 'Visa •••• 4821', short: '•••• 4821', detail: 'Crédito · vence em 08/29' },
  { id: 'master', type: 'card', label: 'Mastercard •••• 7310', short: '•••• 7310', detail: 'Crédito · vence em 03/28' },
  { id: 'cash', type: 'cash', label: 'Dinheiro', detail: 'Pague diretamente ao motorista' },
];

export const findPayment = (id) => PAYMENT_METHODS.find((p) => p.id === id) ?? PAYMENT_METHODS[0];
