import { useState } from 'react';
import ActionSheet from '../components/ActionSheet';
import Avatar from '../components/Avatar';
import BottomNav from '../components/BottomNav';
import Button from '../components/Button';
import Icon from '../components/Icon';
import ListItem from '../components/ListItem';
import PaymentSheet from '../components/PaymentSheet';
import { useApp } from '../state/AppProvider';
import { USER } from '../data/user';
import { INBOX } from '../data/activity';
import { formatRating } from '../lib/format';
import './TabScreens.css';

const HELP_TOPICS = ['Problemas com uma viagem', 'Conta e pagamento', 'Guia de uso do app', 'Acessibilidade'];
const SAFETY_STEPS = [
  { id: 'contacts', title: 'Adicionar contatos de confiança', subtitle: 'Compartilhe viagens com quem você confia' },
  { id: 'pin', title: 'Usar PIN em todas as viagens', subtitle: 'Confirme que entrou no carro certo' },
  { id: 'audio', title: 'Ativar gravação de áudio', subtitle: 'Grave áudio durante as viagens' },
];
const REFERRAL = 'JULIANAR25';

export default function AccountScreen() {
  const { resetTo, paymentId, setPaymentId, showToast } = useApp();
  const [sheet, setSheet] = useState(null);
  const [safety, setSafety] = useState(['pin']);
  const [settings, setSettings] = useState({ push: true, email: false, location: true });

  const toggleSetting = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }));
  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(REFERRAL);
    } catch {
      /* área de transferência indisponível — o código continua visível na tela */
    }
    showToast(`Código ${REFERRAL} copiado`);
  };

  return (
    <div className="screen screen--page tab">
      <div className="scroll tab__scroll">
        <div className="account__head">
          <div>
            <h1 className="t-display">{USER.fullName}</h1>
            <span className="account__rating">
              <Icon name="star" size={14} />
              {formatRating(USER.rating)}
            </span>
          </div>
          <Avatar person={USER.avatar} size={64} />
        </div>

        <div className="account__tiles">
          <button type="button" className="account__tile" onClick={() => setSheet('help')}>
            <Icon name="help" size={26} />
            Ajuda
          </button>
          <button type="button" className="account__tile" onClick={() => setSheet('wallet')}>
            <Icon name="wallet" size={26} />
            Carteira
          </button>
          <button type="button" className="account__tile" onClick={() => resetTo('activity')}>
            <Icon name="receipt" size={26} />
            Atividade
          </button>
        </div>

        <button type="button" className="account__card" onClick={() => setSheet('safety')}>
          <span>
            <strong>Verificação de segurança</strong>
            <span>Aprimore a segurança das suas viagens</span>
          </span>
          <span className="ring" style={{ '--p': safety.length / SAFETY_STEPS.length }}>
            {safety.length}/{SAFETY_STEPS.length}
          </span>
        </button>

        <div className="account__list">
          <ListItem icon="mail" title="Mensagens" subtitle={`${INBOX.length} novas`} chevron onClick={() => setSheet('inbox')} />
          <ListItem icon="users" title="Família" subtitle="Gerencie viagens de quem você ama" chevron onClick={() => setSheet('family')} />
          <ListItem icon="gift" title="Indique e ganhe" subtitle="R$ 10 de desconto para cada amigo" chevron onClick={() => setSheet('referral')} />
          <ListItem icon="settings" title="Configurações" chevron onClick={() => setSheet('settings')} />
          <ListItem icon="lock" title="Privacidade" subtitle="Controle seus dados" chevron last onClick={() => setSheet('privacy')} />
        </div>
        <p className="account__version">v4.512.10002 · protótipo de interface</p>
      </div>

      <BottomNav active="account" />

      <ActionSheet open={sheet === 'help'} onClose={() => setSheet(null)} title="Como podemos ajudar?">
        {HELP_TOPICS.map((topic, i) => (
          <ListItem
            key={topic}
            icon="help"
            title={topic}
            chevron
            last={i === HELP_TOPICS.length - 1}
            onClick={() => {
              setSheet(null);
              showToast(`Abrimos um chamado sobre “${topic}”. Responderemos em até 24 h.`);
            }}
          />
        ))}
      </ActionSheet>

      <PaymentSheet open={sheet === 'wallet'} onClose={() => setSheet(null)} value={paymentId} onChange={setPaymentId} />

      <ActionSheet open={sheet === 'safety'} onClose={() => setSheet(null)} title="Verificação de segurança" subtitle="Complete as etapas para viajar com mais tranquilidade.">
        {SAFETY_STEPS.map((step, i) => {
          const on = safety.includes(step.id);
          return (
            <ListItem
              key={step.id}
              icon="shield"
              title={step.title}
              subtitle={step.subtitle}
              last={i === SAFETY_STEPS.length - 1}
              trailing={<span className="toggle" role="switch" aria-checked={on} />}
              onClick={() => setSafety((s) => (on ? s.filter((x) => x !== step.id) : [...s, step.id]))}
            />
          );
        })}
      </ActionSheet>

      <ActionSheet open={sheet === 'inbox'} onClose={() => setSheet(null)} title="Mensagens">
        {INBOX.map((m, i) => (
          <ListItem key={m.id} icon="bell" title={m.title} subtitle={m.body} trailing={<span className="t-small t-tertiary">{m.when}</span>} last={i === INBOX.length - 1} />
        ))}
      </ActionSheet>

      <ActionSheet
        open={sheet === 'family'}
        onClose={() => setSheet(null)}
        title="Perfil Família"
        subtitle="Convide até 10 pessoas para viajar usando sua forma de pagamento. Você acompanha cada viagem em tempo real."
        footer={
          <Button
            onClick={() => {
              setSheet(null);
              showToast('Convite enviado. Ele expira em 7 dias.');
            }}
          >
            Convidar familiar
          </Button>
        }
      />

      <ActionSheet
        open={sheet === 'referral'}
        onClose={() => setSheet(null)}
        title="Indique e ganhe R$ 10"
        subtitle="Seus amigos ganham R$ 10 na primeira viagem e você ganha R$ 10 quando eles viajarem."
        footer={
          <Button icon="doc" onClick={copyReferral}>
            Copiar código
          </Button>
        }
      >
        <div className="referral-code">{REFERRAL}</div>
      </ActionSheet>

      <ActionSheet open={sheet === 'settings'} onClose={() => setSheet(null)} title="Configurações">
        {[
          ['push', 'Notificações push', 'Status da viagem e mensagens do motorista'],
          ['email', 'Ofertas por e-mail', 'Promoções e novidades'],
          ['location', 'Localização precisa', 'Melhora a precisão do ponto de partida'],
        ].map(([key, title, subtitle], i) => (
          <ListItem
            key={key}
            icon={key === 'push' ? 'bell' : key === 'email' ? 'mail' : 'locate'}
            title={title}
            subtitle={subtitle}
            last={i === 2}
            trailing={<span className="toggle" role="switch" aria-checked={settings[key]} />}
            onClick={() => toggleSetting(key)}
          />
        ))}
      </ActionSheet>

      <ActionSheet
        open={sheet === 'privacy'}
        onClose={() => setSheet(null)}
        title="Central de privacidade"
        subtitle="Veja e baixe uma cópia dos seus dados ou solicite a exclusão da conta."
        footer={
          <Button
            variant="secondary"
            onClick={() => {
              setSheet(null);
              showToast('Você receberá um e-mail com seus dados em até 30 dias.');
            }}
          >
            Solicitar cópia dos meus dados
          </Button>
        }
      />
    </div>
  );
}
