function irAlEnlace(identificador, imagen) {
  let url = 'descargar.html?id=' + encodeURIComponent(identificador);
  if (imagen) {
    url += '&img=' + encodeURIComponent(imagen);
  }
  window.open(url, '_blank');
}

function configurarBuscador(inputId, btnId, gridId, noResultsId) {
  const searchInput = document.getElementById(inputId);
  const btnBuscar = document.getElementById(btnId); 
  const grid = document.getElementById(gridId);
  const noResults = document.getElementById(noResultsId);

  if (!searchInput || !grid) return;


  const sugerenciasBox = document.createElement('div');
  sugerenciasBox.className = 'sugerencias-box';
  searchInput.parentNode.appendChild(sugerenciasBox);


  function aplicarFiltro(terminoBusqueda) {
    const term = terminoBusqueda.toLowerCase().trim();
    const cards = grid.querySelectorAll('.card');
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

 
    if (noResults) {
      noResults.style.display = hasResults ? 'none' : 'block';
    }
  }

 
  searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase().trim();
    const cards = grid.querySelectorAll('.card');
    
    sugerenciasBox.innerHTML = ''; 
    
    if (term === '') {
      sugerenciasBox.style.display = 'none';
     
      aplicarFiltro('');
      return;
    }

    let coincidenciasGuardadas = 0;

    cards.forEach(card => {
      const name = (card.getAttribute('data-name') || '');
      const nameLower = name.toLowerCase();
      
      if (nameLower.includes(term)) {
        if (coincidenciasGuardadas < 5) {
          const divSugerencia = document.createElement('div');
          divSugerencia.className = 'sugerencia-item';
          
          const regex = new RegExp(`(${term})`, "gi");
          divSugerencia.innerHTML = name.replace(regex, "<strong style='color:#ef4444;'>$1</strong>");
          
        
          divSugerencia.addEventListener('click', () => {
            searchInput.value = name; 
            sugerenciasBox.style.display = 'none'; 
            aplicarFiltro(name); 
          });
          
          sugerenciasBox.appendChild(divSugerencia);
          coincidenciasGuardadas++;
        }
      }
    });
    
    sugerenciasBox.style.display = coincidenciasGuardadas > 0 ? 'block' : 'none';
  });


  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sugerenciasBox.style.display = 'none'; 
      aplicarFiltro(searchInput.value); 
    }
  });


  if (btnBuscar) {
    btnBuscar.addEventListener('click', () => {
      sugerenciasBox.style.display = 'none'; 
      aplicarFiltro(searchInput.value); 
    });
  }
 
  document.addEventListener('click', (e) => {
    if (e.target !== searchInput && e.target !== sugerenciasBox) {
      sugerenciasBox.style.display = 'none';
    }
  });
}


const btnSubir = document.getElementById("btnSubir");

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    btnSubir.style.display = "flex"; 
  } else {
    btnSubir.style.display = "none";  
  }
});

function subirArriba() {
  window.scrollTo({
    top: 0,
    behavior: "smooth" 
  });
}


document.addEventListener('DOMContentLoaded', () => {
  
  configurarBuscador('searchProgramas', 'btnSearchProgramas', 'programas-grid', 'noResultsProgramas');
  configurarBuscador('searchJuegos', 'btnSearchJuegos', 'juegos-grid', 'noResultsJuegos');
  configurarBuscador('searchWindows', 'btnSearchWindows', 'windows-grid', 'noResultsWindows');
});