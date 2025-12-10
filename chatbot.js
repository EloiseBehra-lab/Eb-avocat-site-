// chatbot.js – Assistant de pré-qualification EB Avocat
// Adapté aux domaines : droit pénal, droit de la famille, droit des mineurs
// + gestion spécifique des urgences pénales en dehors des horaires du cabinet.

const ebState = {
  step: 0,
  data: {
    type: null,
    domainDetail: null,
    urgence: null,
    resume: null,
    nom: null,
    contactMode: null,
    telephone: null,
    email: null
  }
};

const ebWindow = document.getElementById('eb-chatbot-window');
const ebToggle = document.getElementById('eb-chatbot-toggle');
const ebClose = document.getElementById('eb-chatbot-close');
const ebMessages = document.getElementById('eb-chatbot-messages');
const ebInput = document.getElementById('eb-chatbot-input');
const ebSend = document.getElementById('eb-chatbot-send');

function ebIsOutsideOfficeHours() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  return (day === 0 || day === 6 || hour < 9 || hour >= 18);
}

if (ebToggle) {
  ebToggle.addEventListener('click', () => {
    ebWindow.style.display = 'flex';
    ebToggle.style.display = 'none';
    ebStartConversation();
  });
}

if (ebClose) {
  ebClose.addEventListener('click', () => {
    ebWindow.style.display = 'none';
    ebToggle.style.display = 'inline-flex';
  });
}

if (ebSend) {
  ebSend.addEventListener('click', () => {
    const text = ebInput.value.trim();
    if (!text) return;
    ebAddMessage(text, 'user');
    ebHandleUserInput(text);
    ebInput.value = '';
  });
}

if (ebInput) {
  ebInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      ebSend.click();
    }
  });
}

function ebAddMessage(text, author = 'bot') {
  const msg = document.createElement('div');
  msg.classList.add('eb-message', author);
  msg.innerText = text;
  ebMessages.appendChild(msg);
  ebMessages.scrollTop = ebMessages.scrollHeight;
}

function ebAddOptions(options) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('eb-option-buttons');

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('eb-option-button');
    btn.innerText = opt.label;
    btn.addEventListener('click', () => {
      ebAddMessage(opt.label, 'user');
      opt.onClick();
    });
    wrapper.appendChild(btn);
  });

  ebMessages.appendChild(wrapper);
  ebMessages.scrollTop = ebMessages.scrollHeight;
}

function ebStartConversation() {
  ebMessages.innerHTML = '';
  ebState.step = 0;
  ebAddMessage("Bonjour, je suis l’assistant du cabinet EB Avocat – Maître Éloïse BEHRA à Liévin.");
  ebAddMessage("Je ne donne pas de conseils juridiques, mais je vous aide à transmettre les informations essentielles pour que le cabinet vous rappelle rapidement.");
  setTimeout(() => ebAskType(), 600);
}

function ebAskType() {
  ebState.step = 1;
  ebAddMessage("Pour commencer, votre demande concerne :");
  ebAddOptions([
    { label: "Droit pénal (mis en cause ou victime)", onClick: () => ebSelectType("Droit pénal") },
    { label: "Droit de la famille", onClick: () => ebSelectType("Droit de la famille") },
    { label: "Droit des mineurs", onClick: () => ebSelectType("Droit des mineurs") },
    { label: "Autre / je ne sais pas", onClick: () => ebSelectType("Autre") }
  ]);
}

function ebSelectType(type) {
  ebState.data.type = type;
  ebAskDomainDetail();
}

function ebAskDomainDetail() {
  const type = ebState.data.type;
  ebState.step = 2;

  if (type === "Droit pénal") {
    ebAddMessage("Votre situation en droit pénal concerne :");
    ebAddOptions([
      { label: "Mis(e) en cause / prévenu(e)", onClick: () => ebSelectDomainDetail("Mis(e) en cause") },
      { label: "Victime", onClick: () => ebSelectDomainDetail("Victime") },
      { label: "Aménagement / exécution de peine", onClick: () => ebSelectDomainDetail("Exécution de peine") },
      { label: "Autre (pénal)", onClick: () => ebSelectDomainDetail("Autre pénal") }
    ]);

  } else if (type === "Droit de la famille") {
    ebAddMessage("Votre dossier concerne :");
    ebAddOptions([
      { label: "Divorce / séparation", onClick: () => ebSelectDomainDetail("Divorce / séparation") },
      { label: "Enfants / résidence / pension", onClick: () => ebSelectDomainDetail("Enfants / pension") },
      { label: "Violences intrafamiliales", onClick: () => ebSelectDomainDetail("Violences intrafamiliales") },
      { label: "Autre (famille)", onClick: () => ebSelectDomainDetail("Autre famille") }
    ]);

  } else if (type === "Droit des mineurs") {
    ebAddMessage("Votre demande concerne :");
    ebAddOptions([
      { label: "Assistance éducative", onClick: () => ebSelectDomainDetail("Assistance éducative") },
      { label: "Mineur victime", onClick: () => ebSelectDomainDetail("Mineur victime") },
      { label: "Mineur mis en cause", onClick: () => ebSelectDomainDetail("Mineur mis en cause") },
      { label: "Autre (mineurs)", onClick: () => ebSelectDomainDetail("Autre mineurs") }
    ]);

  } else {
    ebAddMessage("Merci, nous allons continuer avec une description générale.");
    ebSelectDomainDetail("Non précisé");
  }
}

function ebSelectDomainDetail(detail) {
  ebState.data.domainDetail = detail;
  ebAskUrgence();
}

function ebAskUrgence() {
  ebState.step = 3;
  ebAddMessage("Quel est le niveau d’urgence ?");
  ebAddOptions([
    { label: "Urgence (48h – pénal, convocation, garde à vue…)", onClick: () => ebSelectUrgence("Urgence 48h") },
    { label: "Cette semaine", onClick: () => ebSelectUrgence("Cette semaine") },
    { label: "Pas urgent", onClick: () => ebSelectUrgence("Pas urgent") }
  ]);
}

function ebSelectUrgence(urgence) {
  ebState.data.urgence = urgence;

  if (ebState.data.type === "Droit pénal" && urgence === "Urgence 48h") {
    if (ebIsOutsideOfficeHours()) {
      ebAddMessage(
        "⚠️ Vous signalez une urgence pénale en dehors des horaires du cabinet (9h–18h, lundi–vendredi).\n" +
        "Si une garde à vue, un défèrement ou une audience est en cours, appelez immédiatement le cabinet au 06 34 53 32 46."
      );
    } else {
      ebAddMessage("Le cabinet traite rapidement les urgences pénales (garde à vue, convocation…).");
    }
  }

  ebAskResume();
}

function ebAskResume() {
  ebState.step = 4;
  ebAddMessage("Pouvez-vous résumer brièvement votre situation ?");
}

function ebHandleUserInput(text) {
  switch (ebState.step) {
    case 4:
      ebState.data.resume = text;
      ebAskName();
      break;
    case 5:
      ebState.data.nom = text;
      ebAskContactMode();
      break;
    case 7:
      if (ebState.data.contactMode === 'Téléphone') {
        ebState.data.telephone = text;
        ebAskEmailOptional();
      } else {
        ebState.data.email = text;
        ebConfirmAndGenerateEmail();
      }
      break;
    case 8:
      if (!text.toLowerCase().startsWith("non")) {
        ebState.data.email = text;
      }
      ebConfirmAndGenerateEmail();
      break;
  }
}

function ebAskName() {
  ebState.step = 5;
  ebAddMessage("À quel nom dois-je transmettre votre demande ?");
}

function ebAskContactMode() {
  ebState.step = 6;
  ebAddMessage("Comment souhaitez-vous être recontacté(e) ?");
  ebAddOptions([
    { label: "Téléphone", onClick: () => ebSelectContactMode("Téléphone") },
    { label: "Email", onClick: () => ebSelectContactMode("Email") }
  ]);
}

function ebSelectContactMode(mode) {
  ebState.data.contactMode = mode;
  ebAskContactDetails();
}

function ebAskContactDetails() {
  ebState.step = 7;
  if (ebState.data.contactMode === "Téléphone") {
    ebAddMessage("Quel est votre numéro de téléphone ?");
  } else {
    ebAddMessage("Quelle est votre adresse email ?");
  }
}

function ebAskEmailOptional() {
  ebState.step = 8;
  ebAddMessage("Souhaitez-vous ajouter un email ? (facultatif, sinon écrivez « non »)");
}

function ebConfirmAndGenerateEmail() {
  const d = ebState.data;
  ebState.step = 99;

  ebAddMessage("Voici le récapitulatif :");
  ebAddMessage(
    `Type : ${d.type}\n` +
    `Détail : ${d.domainDetail}\n` +
    `Urgence : ${d.urgence}\n` +
    `Nom : ${d.nom}\n` +
    `Téléphone : ${d.telephone || "Non renseigné"}\n` +
    `Email : ${d.email || "Non renseigné"}\n` +
    `Résumé : ${d.resume}`
  );

  ebAddMessage("Vous pouvez maintenant transmettre ces informations au cabinet :");

  ebAddOptions([
    { label: "📧 Préparer l’e-mail", onClick: () => ebOpenMail() },
    { label: "📅 Prendre rendez-vous (Calendly)", onClick: () => ebOpenCalendly() }
  ]);
}

function ebOpenMail() {
  const d = ebState.data;
  const to = "eloisebehra.avocat@gmail.com";

  const subject = encodeURIComponent(
    `Demande de contact – ${d.type} – ${d.urgence}`
  );

  const body = encodeURIComponent(
    [
      "Bonjour Maître,",
      "",
      "Je vous contacte via l’assistant en ligne.",
      "",
      `Nom : ${d.nom}`,
      `Téléphone : ${d.telephone || "Non renseigné"}`,
      `Email : ${d.email || "Non renseigné"}`,
      "",
      `Type : ${d.type}`,
      `Détail : ${d.domainDetail}`,
      `Urgence : ${d.urgence}`,
      "",
      "Résumé :",
      d.resume,
      "",
      "Cordialement,"
    ].join("\n")
  );

  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
}

function ebOpenCalendly() {
  window.open("https://calendly.com/eloisebehra-avocat/30min", "_blank");
}
