function irAlEnlace(identificador) {
  let categoria = 'programas'; 
  
  const enlaceClickeado = document.querySelector(`a[onclick*="${identificador}"]`);
  
  if (enlaceClickeado) {

    const tarjeta = enlaceClickeado.closest('.card');
    
    if (tarjeta) {

      const contenedorPadre = tarjeta.parentElement ? tarjeta.parentElement.id : '';
      
      if (contenedorPadre === 'juegos-grid') {
        categoria = 'juegos';
      } else if (contenedorPadre === 'windows-grid') {
        categoria = 'windows';
      } else if (tarjeta.closest('#contenido-pack-de-optimizacion')) {
        categoria = 'packs';
      }
    }
  }


  window.open('descargar.html?id=' + encodeURIComponent(identificador) + '&cat=' + categoria, '_blank');
}


const searchProgramas = document.getElementById('searchProgramas');
const programasGrid = document.getElementById('programas-grid');
const noResultsProgramas = document.getElementById('noResultsProgramas');

function filtrarProgramas() {
  if (!searchProgramas || !programasGrid) return;
  const term = searchProgramas.value.toLowerCase().trim();
  const cards = programasGrid.querySelectorAll('.card');
  let hasResults = false;
  
  cards.forEach(card => {
    const name = (card.getAttribute('data-name') || '').toLowerCase();
    if (term === '' || name.includes(term)) {
      card.style.display = 'flex';
      hasResults = true;
    } else {
      card.style.display = 'none';
    }
  });
  
  if (noResultsProgramas) {
    noResultsProgramas.style.display = hasResults ? 'none' : 'block';
  }
}

if (searchProgramas) {
  searchProgramas.addEventListener('input', filtrarProgramas);
}


const searchJuegos = document.getElementById('searchJuegos');
const juegosGrid = document.getElementById('juegos-grid');
const noResultsJuegos = document.getElementById('noResultsJuegos');

function filtrarJuegos() {
  if (!searchJuegos || !juegosGrid) return;
  const term = searchJuegos.value.toLowerCase().trim();
  const cards = juegosGrid.querySelectorAll('.card');
  let hasResults = false;
  
  cards.forEach(card => {
    const name = (card.getAttribute('data-name') || '').toLowerCase();
    if (term === '' || name.includes(term)) {
      card.style.display = 'flex';
      hasResults = true;
    } else {
      card.style.display = 'none';
    }
  });
  
  if (noResultsJuegos) {
    noResultsJuegos.style.display = hasResults ? 'none' : 'block';
  }
}

if (searchJuegos) {
  searchJuegos.addEventListener('input', filtrarJuegos);
}


const searchWindows = document.getElementById('searchWindows');
const windowsGrid = document.getElementById('windows-grid');
const noResultsWindows = document.getElementById('noResultsWindows');

function filtrarWindows() {
  if (!searchWindows || !windowsGrid) return;
  const term = searchWindows.value.toLowerCase().trim();
  const cards = windowsGrid.querySelectorAll('.card');
  let hasResults = false;
  
  cards.forEach(card => {
    const name = (card.getAttribute('data-name') || '').toLowerCase();
    if (term === '' || name.includes(term)) {
      card.style.display = 'flex';
      hasResults = true;
    } else {
      card.style.display = 'none';
    }
  });
  
  if (noResultsWindows) {
    noResultsWindows.style.display = hasResults ? 'none' : 'block';
  }
}

if (searchWindows) {
  searchWindows.addEventListener('input', filtrarWindows);
}

filtrarProgramas();
filtrarJuegos();
filtrarWindows();