document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const contenidoDiv = document.querySelector('.contenido');
  const contentLinks = document.querySelectorAll('.content-link');

  function setupNavbar() {
    if (!menuToggle || !navLinks) return;
    const focusableLinks = () => Array.from(navLinks.querySelectorAll('a, button'));
    const isOpen = () => menuToggle.getAttribute('aria-expanded') === 'true';

    function openMenu() {
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.classList.add('open');
      navLinks.classList.add('show');
      document.body.classList.add('no-scroll');
      menuToggle.setAttribute('aria-label', 'Cerrar menú');
      const first = focusableLinks()[0];
      if (first) first.focus();
    }

    function closeMenu() {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.classList.remove('open');
      navLinks.classList.remove('show');
      document.body.classList.remove('no-scroll');
      menuToggle.setAttribute('aria-label', 'Abrir menú');
      menuToggle.focus();
    }

    menuToggle.addEventListener('click', () => {
      isOpen() ? closeMenu() : openMenu();
    });

    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (isOpen() && window.innerWidth <= 768) closeMenu();
      });
    });

    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !menuToggle.contains(e.target) && isOpen()) {
        closeMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && isOpen()) closeMenu();
    });
  }

  function setupContentLoading() {
    if (!contenidoDiv || contentLinks.length === 0) return;

    function cargarContenido(url) {
      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error('Error al cargar el contenido');
          return response.text();
        })
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const pageContent = doc.querySelector('.contenido')?.innerHTML || '<p>Error: no se encontró contenido.</p>';
          contenidoDiv.innerHTML = pageContent;
          setupCarbonoCalculator();
          setupTimeOfDeathCalculator();
        })
        .catch(() => {
          contenidoDiv.innerHTML = '<p>Error al cargar el contenido. Verifica que la página exista.</p>';
        });
    }

    contentLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const url = this.getAttribute('href');
        if (url) cargarContenido(url);
      });
    });
  }

  function setupCarbonoCalculator() {
    const carbonoForm = document.getElementById('carbonoForm');
    const resultBox = document.getElementById('resultCarbono');
    if (!carbonoForm || !resultBox) return;

    const percentageInput = document.getElementById('percentage');

    carbonoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const percentage = parseFloat(percentageInput.value);
      if (isNaN(percentage) || percentage <= 0 || percentage > 100) return;
      const k = Math.log(2) / 5730;
      const t = Math.log(percentage / 100) / (-k);
      const roundedAge = Math.round(t);
      document.getElementById('age').textContent = roundedAge.toLocaleString();
      document.getElementById('kValue').textContent = k.toExponential(6);
      document.getElementById('percentageValue').textContent = percentage.toFixed(2);
      document.getElementById('tValue').textContent = t.toFixed(2);
      document.getElementById('roundedAge').textContent = roundedAge.toLocaleString();
      resultBox.style.display = 'block';
    });
  }

  function setupTimeOfDeathCalculator() {
  const timeOfDeathForm = document.getElementById('timeOfDeathForm') || document.getElementById('calculateDeathBtn');
  const temp1Input = document.getElementById('temp1');
  const temp2Input = document.getElementById('temp2');
  const roomTempInput = document.getElementById('roomTemp');
  const bodyTempInput = document.getElementById('bodyTemp');
  const resultBox = document.getElementById('result');

  if (!timeOfDeathForm || !temp1Input) return;

  timeOfDeathForm.addEventListener('click', (e) => {
    e.preventDefault();
    const temp1 = parseFloat(temp1Input.value);
    const temp2 = parseFloat(temp2Input.value);
    const roomTemp = parseFloat(roomTempInput.value);
    const bodyTemp = parseFloat(bodyTempInput.value);
    if ([temp1, temp2, roomTemp, bodyTemp].some(isNaN)) return;

    const k = -Math.log((temp2 - roomTemp) / (temp1 - roomTemp));
    const timeSinceDeath = -Math.log((temp1 - roomTemp) / (bodyTemp - roomTemp)) / k;
    const hours = Math.floor(timeSinceDeath);
    const minutes = Math.round((timeSinceDeath - hours) * 60);

    const firstMeasurement = new Date();
    firstMeasurement.setHours(21, 18, 0, 0);
    const timeOfDeath = new Date(firstMeasurement.getTime() - timeSinceDeath * 3600000);

    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    document.getElementById('timeOfDeath').textContent = timeOfDeath.toLocaleTimeString('es-ES', options);
    document.getElementById('timeElapsed').textContent = `${hours} horas y ${minutes} minutos`;
    resultBox.style.display = 'block';
  });
}


  function initCalculators() {
    setupCarbonoCalculator();
    setupTimeOfDeathCalculator();
  }

  setupNavbar();
  setupContentLoading();
  initCalculators();
});
