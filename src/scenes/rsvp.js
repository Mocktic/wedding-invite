// Scene 5 — the thread ties the gathbandhan knot and unfolds into a handmade-paper card.
// Sending it flips the card, throws petals and lights the sky with fireworks.
import gsap from 'gsap';
import { h, s } from '../lib/dom.js';
import { thread } from '../lib/thread.js';
import { brushText } from '../lib/brushText.js';
import { overlayVideo, playVideo } from '../lib/overlayVideo.js';
import { validateRsvp, submitRsvp, MESSAGE_LIMIT } from '../lib/rsvp.js';

// A knot: down, a loop to the left, a loop to the right, crossing back through the centre.
const KNOT = [
  'M195,-6 C195,30 196,52 195,70',
  'C194,96 120,92 118,124 C116,156 170,160 195,132',
  'C220,104 274,92 272,124 C270,156 196,152 195,180',
  'C194,200 195,214 195,232',
].join(' ');

export function rsvp(app, ctx) {
  const { config } = ctx;
  const { bride, groom } = config.couple;

  const knotSvg = s('svg', { class: 'rsvp__knot', viewBox: '0 0 390 240', 'aria-hidden': 'true' });
  const knot = thread(knotSvg, KNOT, { width: 3 });
  const seal = s('circle', { cx: 195, cy: 232, r: 8, class: 'rsvp__seal' });
  knotSvg.append(seal);

  const nameInput = h('input', { id: 'rsvp-name', name: 'name', type: 'text', autocomplete: 'name', required: true, maxlength: 80, placeholder: 'Your name' });
  const nameError = h('p', { class: 'field__error', id: 'rsvp-name-error', 'aria-live': 'polite' });
  const message = h('textarea', { id: 'rsvp-message', name: 'message', rows: 4, maxlength: MESSAGE_LIMIT, placeholder: 'A wish, a memory, a blessing…' });
  const submit = h('button', { class: 'button', type: 'submit' }, h('span', {}, 'Send your blessings'));
  const form = h('form', { class: 'card__face card__front', novalidate: true },
    h('p', { class: 'card__eyebrow eyebrow' }, 'Kindly reply'),
    h('div', { class: 'field' },
      h('label', { for: 'rsvp-name' }, 'Name'),
      nameInput,
      nameError),
    h('div', { class: 'field' },
      h('label', { for: 'rsvp-message' }, 'Message ', h('span', { class: 'field__optional' }, '(optional)')),
      message),
    submit,
  );

  const city = ctx.invite.headline.venue.city;
  const seeYou = city && city !== 'home' ? `See you in ${city}` : 'See you soon';
  const thanksSvg = s('svg', { class: 'card__thanks-svg', viewBox: '0 0 320 120', 'aria-hidden': 'true' });
  const thanksLine = h('p', { class: 'card__thanks-line' });
  const back = h('div', { class: 'card__face card__back', 'aria-live': 'polite' },
    thanksSvg,
    thanksLine,
    h('p', { class: 'eyebrow card__see-you' }, seeYou),
  );
  const card = h('div', { class: 'card' }, form, back);

  const fireworks = overlayVideo('fireworks', { blend: 'screen', loop: true, className: 'rsvp__fireworks' });
  const sparks = overlayVideo('sparks', { blend: 'screen', loop: true, className: 'rsvp__sparks' });

  const section = h('section', { class: 'rsvp', id: 'rsvp', 'aria-label': 'RSVP' },
    fireworks,
    knotSvg,
    h('header', { class: 'rsvp__header' },
      h('h2', { class: 'script rsvp__title' }, 'Will you bless us?'),
      h('p', { class: 'rsvp__lede' }, `Let ${bride} & ${groom} know you're coming, and leave them a note if you like.`)),
    card,
    sparks,
    h('footer', { class: 'footer' },
      h('p', { class: 'script footer__love' }, 'With love,'),
      h('p', { class: 'footer__families' }, 'the Families'),
      h('p', { class: 'footer__hashtag' }, config.couple.hashtag),
      h('p', { class: 'footer__mantra', lang: 'hi' }, '॥ शुभमस्तु ॥')),
  );
  app.append(section);

  if (ctx.reduced) {
    gsap.set(knot.reveal, { drawSVG: '100%' });
  } else {
    const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 80%', end: 'top 15%', scrub: 0.6 } });
    knot.draw(tl, 0, 1);
    tl.fromTo(seal, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.15, ease: 'back.out(4)' }, 0.95);
    gsap.from([section.querySelector('.rsvp__header'), card], {
      autoAlpha: 0, y: 40, duration: 1, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 92%' },
    });
  }

  const showError = (msg) => {
    nameError.textContent = msg || '';
    nameInput.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg) {
      nameInput.setAttribute('aria-describedby', nameError.id);
      gsap.fromTo(nameInput, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    }
  };
  nameInput.addEventListener('input', () => nameError.textContent && showError(''));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = { name: nameInput.value, message: message.value, invite: ctx.invite.name };
    const errors = validateRsvp(data);
    if (errors.name) { showError(errors.name); nameInput.focus(); return; }
    submit.disabled = true;
    submit.classList.add('is-sending');
    try {
      const entry = await submitRsvp(data, config.rsvp.endpoint);
      celebrate(entry.name.split(' ')[0]);
    } catch (err) {
      console.error(err);
      showError('Something went wrong, please try again.');
      submit.disabled = false;
      submit.classList.remove('is-sending');
    }
  });

  function celebrate(firstName) {
    const thanks = brushText(thanksSvg, { text: `Thank you, ${firstName}`, x: 160, y: 78, size: 44, className: 'card__thanks' });
    thanksLine.textContent = `Your blessings are on their way to ${bride} & ${groom}.`;
    const r = card.getBoundingClientRect();
    const tl = gsap.timeline();
    tl.to(card, { rotateY: 180, duration: 1.1, ease: 'power3.inOut' }, 0)
      .call(() => {
        ctx.petals.burst(r.left + r.width * 0.3, r.top + r.height * 0.3, 40, 1.2);
        ctx.petals.burst(r.left + r.width * 0.7, r.top + r.height * 0.3, 40, 1.2);
        ctx.petals.shower(60, 3000);
      }, null, 0.4);
    thanks.paint(tl, 0.9, 1.2);
    tl.fromTo([thanksLine, back.querySelector('.card__see-you')], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: 0.2, duration: 0.6 }, 1.6);
    if (!ctx.reduced) {
      playVideo(fireworks);
      playVideo(sparks);
      tl.to([fireworks, sparks], { autoAlpha: 1, duration: 0.8 }, 0.3)
        .to(sparks, { autoAlpha: 0, duration: 1.5, onComplete: () => sparks.pause() }, 6)
        .to(fireworks, { autoAlpha: 0, duration: 2, onComplete: () => fireworks.pause() }, 12);
    }
    back.focus?.();
  }
}
