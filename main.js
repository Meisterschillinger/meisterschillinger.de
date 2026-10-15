/* ══════════════════════════════════════════════════════════════════════
   Björn Schillinger — Signatur DIE FUGE
   Grundsatz: jedes Element ist ohne JS fertig und lesbar. Die Maske für den
   Fugen-Reveal wird ERST gesetzt, wenn der Block in die Nähe kommt (Lipp) —
   sonst bleibt alles unter der Fold für immer verdeckt.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var ruhe = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 🔴 Apple §14: reduzierte Bewegung heisst gedaempft, nicht leer. Das Hero-Video
  //    wird angehalten; sein Poster bleibt als vollwertiges Standbild stehen.
  if (ruhe) {
    document.querySelectorAll('video').forEach(function (v) {
      v.removeAttribute('autoplay'); v.pause(); v.currentTime = 0;
    });
  }
  var istMobil = function () { return matchMedia('(max-width: 900px)').matches; };  // Funktion, nicht Konstante

  /* ── Intro: die Fuge öffnet sich ────────────────────────────────── */
  var intro = document.getElementById('intro');
  if (intro) {
    if (ruhe || sessionStorage.getItem('bs-intro')) { intro.classList.add('vorbei'); intro.setAttribute('aria-hidden', 'true'); }
    else {
      try { sessionStorage.setItem('bs-intro', '1'); } catch (e) {}
      setTimeout(function () { intro.classList.add('vorbei'); intro.setAttribute('aria-hidden', 'true'); }, 1250);
    }
  }

  /* ── Hero: Blenden fahren auseinander ───────────────────────────── */
  var hero = document.querySelector('.hero');
  if (hero) {
    var start = function () {
      hero.classList.add('zuendet');
      setTimeout(function () { hero.classList.add('auf'); }, ruhe ? 0 : 340);
    };
    if (ruhe) { hero.classList.add('auf'); }
    else if (intro && !intro.classList.contains('vorbei')) setTimeout(start, 1050);
    else setTimeout(start, 120);
  }

  /* ── Fugen-Reveal ───────────────────────────────────────────────── */
  var ziele = document.querySelectorAll('[data-fugt]');
  if (ziele.length && !ruhe && 'IntersectionObserver' in window) {
    var vorbereiten = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        vorbereiten.unobserve(el);
        el.classList.add('fugt');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { el.classList.add('offen'); });
        });
        setTimeout(function () { el.classList.add('offen'); }, 900);   // Sicherheitsnetz
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    ziele.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      vorbereiten.observe(el);
    });
    setTimeout(function () {   // harte Reißleine
      ziele.forEach(function (el) { el.classList.add('fugt', 'offen'); });
    }, 4500);
  }

  /* ── Die Fronten öffnen sich ────────────────────────────────────── */
  var fronten = document.querySelectorAll('.front');
  if (fronten.length) {
    if (ruhe) fronten.forEach(function (f) { f.classList.add('auf'); });
    else if ('IntersectionObserver' in window) {
      var fo = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          fo.unobserve(e.target);
          var i = +(e.target.dataset.i || 0);
          setTimeout(function () { e.target.classList.add('auf'); }, (i % 3) * 150);
        });
      }, { threshold: 0.28 });
      fronten.forEach(function (f) { fo.observe(f); });
      setTimeout(function () { fronten.forEach(function (f) { f.classList.add('auf'); }); }, 6000);
    } else fronten.forEach(function (f) { f.classList.add('auf'); });
  }

  /* ── Scroll-getriebenes ─────────────────────────────────────────── */
  /* ── Die Hero-Fuge oeffnet sich beim LADEN ──────────────────────
     🔴 Noah, 23.09.2026: „Bei ‚Gebaut fuer genau diesen Raum' geht die Sektion
        auseinander, aber die verschwindet ja dann, wenn man drueber scrollt."
     Gemessen: der Fortschritt lief ueber scrollY / (Hero-Hoehe x 1,5) und war erst
     bei 1201 px voll — der Hero (801 px) ist bei 1440 x 900 aber schon ab 801 px
     komplett aus dem Bild. Man sah hoechstens zwei Drittel, und das auch nur,
     waehrend der Hero nach oben hinauslief.
     Ein Hero ist beim Laden VOLLSTAENDIG sichtbar — dort gibt es gar keinen
     Scrollweg. Also laeuft die Signatur jetzt dort, wo man sie sieht: 1,6 s nach
     der Hero-Zuendung, einmal ganz durch, danach bleibt sie offen. */
  var zeiger = document.querySelector('.hero-signatur');
  var zeigerWert = zeiger && zeiger.querySelector('b');
  if (zeiger) {
    var setzeFuge = function (v) {
      zeiger.style.setProperty('--f', v.toFixed(3));
      if (zeigerWert) zeigerWert.textContent = (v * 4).toFixed(1).replace('.', ',');
    };
    if (ruhe) { setzeFuge(1); zeiger.classList.add('offen'); }
    else {
      var t0 = null, DAUER = 1600;
      var lauf = function (t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / DAUER);
        setzeFuge(1 - Math.pow(1 - p, 3));          // ease-out, Apple §4
        if (p < 1) requestAnimationFrame(lauf); else zeiger.classList.add('offen');
      };
      setzeFuge(0);
      setTimeout(function () { requestAnimationFrame(lauf); },
                 (intro && !intro.classList.contains('vorbei')) ? 1500 : 620);
    }
  }
  var korpus = document.querySelector('.korpus-buehne');
  var faecher = korpus ? korpus.querySelectorAll('.fach') : [];
  var fachLichter = korpus ? korpus.querySelectorAll('.fach-licht') : [];
  var gewinnZahl = document.querySelector('.gewinn .zahl');
  var weg = document.querySelector('.weg');
  var wegGlut = weg ? weg.querySelector('.glut') : null;
  var wegPunkte = weg ? weg.querySelectorAll('li') : [];
  var satz = document.querySelector('.statement p');
  var worte = [];

  /* Wörter NUR über Textknoten teilen — innerHTML.split zerreißt Attribute (Illenseer) */
  if (satz && !satz.dataset.geteilt) {
    var raus = [];
    Array.prototype.forEach.call(satz.childNodes, function (k) {
      if (k.nodeType !== 3) { raus.push(k.cloneNode(true)); return; }
      k.nodeValue.split(/(\s+)/).forEach(function (t) {
        if (!t.trim()) { raus.push(document.createTextNode(t)); return; }
        var s = document.createElement('span'); s.className = 'w'; s.textContent = t; raus.push(s);
      });
    });
    satz.innerHTML = ''; raus.forEach(function (n) { satz.appendChild(n); });
    satz.dataset.geteilt = '1';
    worte = satz.querySelectorAll('.w');          // 🔴 erst NACH dem Teilen lesen
    if (ruhe) worte.forEach(function (w) { w.classList.add('hell'); });
  }

  function anteil(el, vorlauf) {
    var r = el.getBoundingClientRect(), h = innerHeight;
    // 🔴 Noah, 22.09.2026: „das letzte Teil der Animation sieht man gar nicht mehr
    //    durchlaufen, weil es dann schon weg ist." Die alte Rechnung
    //    (von - top) / (height + von - h*0.2) erreichte 100 % erst, wenn das Element
    //    rund 220 px ÜBER dem Fensterrand stand — der Schlussschritt lief, während
    //    man ihn nicht mehr sehen konnte.
    //    Jetzt ist der Weg zu Ende, sobald das Element VOLLSTÄNDIG im Bild steht
    //    (Unterkante am unteren Rand); bei sehr hohen Blöcken greift die Oberkante
    //    bei 15 % der Fensterhöhe als zweite Grenze.
    var start = h * (vorlauf === undefined ? 0.88 : vorlauf);
    var endeTop = Math.max(h * 0.15, h - r.height - 24);
    var weg = Math.max(1, start - endeTop);
    return Math.max(0, Math.min(1, (start - r.top) / weg));
  }

  function malen() {
    if (korpus) {
      var p = anteil(korpus, 0.82);
      faecher.forEach(function (f, i) {
        var an = p > (i + 0.6) / (faecher.length + 1.2);
        f.style.opacity = an ? '1' : '0.3';
        f.style.filter = an ? 'none' : 'saturate(.2)';
      });
      fachLichter.forEach(function (l, i) {
        l.style.opacity = p > (i + 0.6) / (fachLichter.length + 1.2) ? '1' : '0';
      });
      if (gewinnZahl) {
        var ziel = +(gewinnZahl.dataset.ziel || 0);
        gewinnZahl.textContent = (ziel * p).toFixed(1).replace('.', ',');
      }
    }
    if (weg) {
      // 🔴 Noah, 22.09.2026: „da läuft es auch wieder nicht komplett clean durch …
      //    die Sektion ist schon fast am Ende." Dieselbe Rechnung wie beim Fülltext
      //    (Skill `scroll-text`): gemessen am Element selbst, Start bei 78 % der
      //    Fensterhöhe, VOLL bei 32 % — also während die Liste noch ganz im Bild steht,
      //    nicht erst wenn sie oben hinausläuft.
      var wr = weg.getBoundingClientRect(), wh = innerHeight;
      var wp = Math.max(0, Math.min(1, (wh * 0.78 - wr.top) / (wh * 0.46)));
      if (wegGlut) wegGlut.style.setProperty('--p', (wp * 100).toFixed(1) + '%');
      wegPunkte.forEach(function (li, i) {
        li.classList.toggle('hier', wp >= i / wegPunkte.length);
      });
    }
    if (worte.length) {
      // 🔴 Skill `scroll-text` (Noah, 22.09.2026 abgenommen): gemessen wird das
      //    TEXTELEMENT, nie die Sektion — die beginnt 150–300 px darüber, dadurch
      //    läuft das erste Drittel der Füllung außerhalb des Bilds. Start bei 78 %
      //    der Fensterhöhe, voll bei 32 %: der Satz füllt sich durch die Bildmitte,
      //    halb gefüllt = zentriert.
      var sr = satz.getBoundingClientRect(), sh = innerHeight;
      var sp = Math.max(0, Math.min(1, (sh * 0.78 - sr.top) / (sh * 0.46)));
      // 🔴 Kein +1: das zog die Fuellung um ein Wort vor und ergab bei 400 px
      //    Oberkante 88 % statt der verlangten 60-80 % (Skill `scroll-text`).
      var bis = Math.round(sp * worte.length);
      // 🔴 Nur VORWÄRTS: ein Wort, das einmal hell ist, bleibt hell. NN/G nennt das
      //    Zurückspringen beim Hochscrollen ausdrücklich als Frustfaktor („I hate
      //    that it has to load every single section"). Nur die Leuchtmarke wandert.
      worte.forEach(function (w, i) {
        if (i < bis) w.classList.add('hell');
        w.classList.toggle('jetzt', i === bis - 1 && bis < worte.length);
      });
    }
  }
  if (!ruhe) {
    var warte = false;
    addEventListener('scroll', function () {
      if (warte) return; warte = true;
      requestAnimationFrame(function () { malen(); warte = false; });
    }, { passive: true });
    addEventListener('resize', malen, { passive: true });
    malen();
    setTimeout(malen, 400);
  } else if (worte.length) worte.forEach(function (w) { w.classList.add('hell'); });

  /* ── Cursor: Lichtpunkt ─────────────────────────────────────────── */
  if (!ruhe && matchMedia('(hover: hover)').matches) {
    var punkt = document.createElement('div');
    punkt.className = 'lichtpunkt'; punkt.setAttribute('aria-hidden', 'true');
    document.body.appendChild(punkt);
    var zx = 0, zy = 0, x = 0, y = 0;
    addEventListener('mousemove', function (e) {
      zx = e.clientX; zy = e.clientY; punkt.classList.add('an');
      var t = e.target.closest('a,button,summary,.front');
      punkt.classList.toggle('gross', !!t);
    }, { passive: true });
    addEventListener('mouseleave', function () { punkt.classList.remove('an'); });
    (function lauf() {
      x += (zx - x) * 0.22; y += (zy - y) * 0.22;
      punkt.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      requestAnimationFrame(lauf);
    })();
  }

  /* ── Mobilmenü ──────────────────────────────────────────────────── */
  var burger = document.querySelector('.burger');
  var mobil = document.querySelector('.mobilmenu');
  if (burger && mobil) {
    burger.addEventListener('click', function () {
      var offen = mobil.classList.toggle('offen');
      burger.setAttribute('aria-expanded', offen ? 'true' : 'false');
      document.body.style.overflow = offen ? 'hidden' : '';
    });
    mobil.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        mobil.classList.remove('offen');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── Anfrageformular ────────────────────────────────────────────────
     Das Formular geht per normalem POST an den Formular-Dienst der HandwerksManufaktur
     (Cloudflare Worker), der die Anfrage als Mail an Björns Postfach schickt und danach
     auf /kontakt zurückleitet: ?gesendet=1 (Danke) oder ?fehler=1 (Telefon + Mail).
     🔴 Bei einem Fehler steht die Telefonnummer in der Meldung. Ein Formular,
        das schweigend nicht funktioniert, kostet den Auftrag.                */
  var q = new URLSearchParams(location.search);
  document.querySelectorAll('.anfrage-form form').forEach(function (f) {
    var hinweis = f.querySelector('.form-hinweis');
    var knopf = f.querySelector('button[type="submit"]');
    var TEL = '089 81888641';

    function sage(text, art) {
      if (!hinweis) return;
      hinweis.textContent = text;
      hinweis.className = 'form-hinweis ' + (art || '');
    }

    f.addEventListener('submit', function (e) {
      var name = f.querySelector('[name="name"]');
      var mail = f.querySelector('[name="mail"]');
      var nachricht = f.querySelector('[name="nachricht"]');
      var ok = f.querySelector('[name="einwilligung"]');

      if (!name.value.trim()) {
        e.preventDefault(); sage('Bitte tragen Sie noch Ihren Namen ein.', 'fehler'); name.focus(); return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim())) {
        e.preventDefault(); sage('Bitte tragen Sie eine gültige E-Mail-Adresse ein, damit ich antworten kann.', 'fehler'); mail.focus(); return;
      }
      if (!nachricht.value.trim()) {
        e.preventDefault(); sage('Bitte schreiben Sie kurz, worum es geht.', 'fehler'); nachricht.focus(); return;
      }
      if (ok && !ok.checked) {
        e.preventDefault(); sage('Bitte bestätigen Sie noch die Zeile zum Datenschutz.', 'fehler'); ok.focus(); return;
      }
      if (knopf) { knopf.disabled = true; knopf.textContent = 'Wird gesendet …'; }
      sage('');
    });

    /* Rückmeldung des Formular-Dienstes (Rücksprung mit Parameter) */
    if (location.hash === '#anfrage' && (q.has('gesendet') || q.has('fehler'))) {
      if (q.has('gesendet')) {
        f.reset();
        sage('Danke, Ihre Anfrage ist raus. Ich melde mich — meist am selben oder nächsten Werktag.', 'gut');
      } else {
        sage('Das Absenden hat gerade nicht funktioniert. Rufen Sie mich einfach an: '
           + TEL + ' — oder schreiben an info@meisterschillinger.de.', 'fehler');
      }
      history.replaceState(null, '', location.pathname + location.hash);
    }
  });

  /* ── Seitenaufrufe zählen — ohne Cookies, ohne Speicher im Browser, ohne IP und ohne Kennung.
     Eigener Zähler der HandwerksManufaktur (Worker seiten-zaehler); gezählt wird nur: Seite, Zeitpunkt,
     Herkunfts-Website, Handy/Computer, Land. Beschrieben in der Datenschutzerklärung. */
  if (/(^|\.)meisterschillinger\.de$/.test(location.hostname)) {
    var r = 'direkt';
    try {
      if (q.get('utm_source')) r = 'utm:' + q.get('utm_source');
      else if (document.referrer) { var h = new URL(document.referrer).hostname.replace(/^www\./, ''); if (h && h !== location.hostname) r = h; }
    } catch (e) {}
    var d = JSON.stringify({ t: 'v', s: location.hostname, p: location.pathname, g: innerWidth < 768 ? 'm' : 'd',
      id: Math.random().toString(36).slice(2, 12), r: r });
    var Z = 'https://seiten-zaehler.handwerksmanufaktur.workers.dev/z';
    try { if (!(navigator.sendBeacon && navigator.sendBeacon(Z, new Blob([d], { type: 'text/plain' })))) fetch(Z, { method: 'POST', body: d, keepalive: true, mode: 'no-cors' }); } catch (e) {}
  }
})();

/* ══════════════════════════════════════════════════════════════════════
   Foto-Ansicht (Lightbox) — Noah, 13.10.2026 (Kundentermin): „Fotos sollen beim
   Draufklicken groß werden." Alle Foto-Inhalte in <main>: Galerien, Intro-Bilder,
   Referenzen, Porträt. Nicht: Hero-Hintergründe, Logo, Bilder in Links (Karten).
   Klick/Enter/Leertaste öffnet die 1800er Fassung; Schließen per Klick daneben,
   X-Knopf oder Esc; Pfeiltasten und Wischen blättern innerhalb der Galerie;
   der Fokus kehrt aufs Bild zurück; die Seite dahinter scrollt nicht.
   Ohne JavaScript bleibt jedes Foto ein ganz normales Bild.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var alle = Array.prototype.slice.call(document.querySelectorAll('main img')).filter(function (im) {
    if (im.closest('a, button, [aria-hidden="true"], .hero, .hero-film, header, footer, nav')) return false;
    if (im.hasAttribute('data-nozoom') || !(im.getAttribute('alt') || '').trim()) return false;
    return (parseInt(im.getAttribute('width'), 10) || 0) >= 400;
  });
  if (!alle.length) return;

  /* Die 1800er Fassung steht neben jeder optimierten Datei: img-NAME(-900)-BREITE.webp → NAME.jpg */
  function gross(im) {
    var s = im.getAttribute('src') || '', m;
    if ((m = s.match(/assets\/opt\/img-(.+?)(?:-900)?-\d+\.webp$/))) return 'assets/img/' + m[1] + '.jpg';
    if ((m = s.match(/^(assets\/img\/.+?)(?:@900)?\.(jpg|png)$/))) return m[1] + '.' + m[2];
    return im.currentSrc || s;
  }
  function beschriftung(im) {
    return (im.getAttribute('alt') || '').replace(/\s+—\s+(Björn Schillinger|Möbel nach Maß von Björn)[^—]*$/, '');
  }
  function gruppeVon(im) {
    var g = im.closest('.galerie, section') || document.body;
    return alle.filter(function (x) { return g.contains(x); });
  }

  alle.forEach(function (im) {
    im.classList.add('zoombar');
    im.setAttribute('tabindex', '0');
    im.setAttribute('role', 'button');
    im.setAttribute('aria-haspopup', 'dialog');
    im.setAttribute('aria-label', 'Foto vergrößern: ' + beschriftung(im));
  });

  var box, bild, titel, zaehler, knopfZu, knopfVor, knopfZurueck;
  var liste = [], nr = 0, opener = null, x0 = null;

  function bauen() {
    box = document.createElement('div');
    box.className = 'lb';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Fotoansicht');
    box.hidden = true;
    box.innerHTML =
      '<div class="lb-buehne"><img class="lb-bild" alt="" decoding="async"></div>' +
      '<p class="lb-unter"><span class="lb-titel"></span><span class="lb-zahl"></span></p>' +
      '<button type="button" class="lb-knopf lb-zu" aria-label="Schließen"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button>' +
      '<button type="button" class="lb-knopf lb-zurueck" aria-label="Vorheriges Foto"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<button type="button" class="lb-knopf lb-vor" aria-label="Nächstes Foto"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>';
    document.body.appendChild(box);
    bild = box.querySelector('.lb-bild');
    titel = box.querySelector('.lb-titel');
    zaehler = box.querySelector('.lb-zahl');
    knopfZu = box.querySelector('.lb-zu');
    knopfVor = box.querySelector('.lb-vor');
    knopfZurueck = box.querySelector('.lb-zurueck');

    knopfZu.addEventListener('click', zu);
    knopfVor.addEventListener('click', function () { weiter(1); });
    knopfZurueck.addEventListener('click', function () { weiter(-1); });
    /* Klick daneben schließt — auf Foto, Knöpfe und Beschriftung nicht */
    box.addEventListener('click', function (e) {
      var c = e.target.classList;
      if (e.target === box || c.contains('lb-buehne') || c.contains('lb-unter')) zu();
    });
    box.addEventListener('touchstart', function (e) { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) weiter(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  function zeige() {
    var im = liste[nr];
    bild.classList.remove('da');
    bild.alt = im.getAttribute('alt') || '';
    bild.onload = function () { bild.classList.add('da'); };
    bild.onerror = function () { bild.onerror = null; bild.src = im.currentSrc || im.src; };
    bild.src = gross(im);
    titel.textContent = beschriftung(im);
    zaehler.textContent = liste.length > 1 ? (nr + 1) + ' / ' + liste.length : '';
    knopfVor.hidden = knopfZurueck.hidden = liste.length < 2;
    /* Nachbarn vorladen */
    [1, -1].forEach(function (d) {
      if (liste.length > 1) { var n = liste[(nr + d + liste.length) % liste.length]; new Image().src = gross(n); }
    });
  }

  function weiter(d) {
    if (liste.length < 2) return;
    nr = (nr + d + liste.length) % liste.length;
    zeige();
  }

  function auf(im) {
    if (!box) bauen();
    opener = im;
    liste = gruppeVon(im);
    nr = Math.max(0, liste.indexOf(im));
    zeige();
    box.hidden = false;
    document.documentElement.classList.add('lb-offen');
    requestAnimationFrame(function () { box.classList.add('offen'); });
    knopfZu.focus({ preventScroll: true });
  }

  function zu() {
    if (!box || box.hidden) return;
    box.classList.remove('offen');
    box.hidden = true;
    document.documentElement.classList.remove('lb-offen');
    bild.removeAttribute('src');
    /* Der Fokus kehrt auf das Bild zurück, das gerade offen war */
    var ziel = liste[nr] || opener;
    if (ziel) ziel.focus({ preventScroll: false });
  }

  document.addEventListener('click', function (e) {
    var im = e.target.closest && e.target.closest('img.zoombar');
    if (!im) {
      var fig = e.target.closest && e.target.closest('figure');
      if (fig && !e.target.closest('a, button')) im = fig.querySelector('img.zoombar');
    }
    if (im) { e.preventDefault(); auf(im); }
  });

  document.addEventListener('keydown', function (e) {
    if (box && !box.hidden) {
      if (e.key === 'Escape') { e.preventDefault(); zu(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); weiter(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); weiter(-1); }
      else if (e.key === 'Tab') {
        /* Fokus bleibt im Dialog */
        var knoepfe = Array.prototype.filter.call(box.querySelectorAll('button'), function (b) { return !b.hidden; });
        var i = knoepfe.indexOf(document.activeElement);
        e.preventDefault();
        knoepfe[(i + (e.shiftKey ? -1 : 1) + knoepfe.length) % knoepfe.length].focus();
      }
      return;
    }
    var im = e.target && e.target.classList && e.target.classList.contains('zoombar') ? e.target : null;
    if (im && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); auf(im); }
  });
})();
