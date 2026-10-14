# Donde todo florece — Michelle & Arian

Dedicatoria interactiva con una dirección visual nocturna, tipografía editorial, tonos marfil y dorado y cinco capítulos. HTML, CSS y JavaScript sin dependencias de ejecución ni compilación. Compatible con GitHub Pages y con abrir `index.html` directamente.

## La experiencia

- **Universo:** miles de partículas con proyección de profundidad, perspectiva al mover el cursor, rotación al arrastrar, zoom con la rueda y transformaciones entre galaxia, órbita y latido.
- **Constelación:** cinco dedicatorias; las conexiones se iluminan al descubrir sus estrellas y el progreso se conserva en el navegador.
- **Gerberas:** flores dibujadas con tres capas de pétalos y un disco central con cientos de detalles en espiral. Cuatro paletas, crecimiento gradual, balanceo, siembra por clic o toque, creación de ramos y exportación de una imagen PNG de 1600 × 1000 píxeles.
- **Tiempo:** contador desde el 9 de julio de 2026 a medianoche en Colombia. La fecha actual se muestra en la zona America/Bogota.
- **Carta:** papel, sello y revelado progresivo por párrafos; se puede mostrar la carta completa inmediatamente.

El ambiente sonoro se genera con Web Audio: acordes suaves y notas que acompañan las interacciones. Solo se reproduce al activarlo y se silencia cuando la pestaña queda oculta.

## Verlo y publicarlo

Abre `index.html` o usa Live Server en Visual Studio Code.

Para GitHub Pages, sube los archivos a un repositorio y selecciona **Settings → Pages → Deploy from a branch → main → / (root)**. Incluye `.nojekyll` y la carpeta `assets` con la canci?n. No necesita Sites, servidor, claves, cuentas ni instalación de paquetes.

## Personalizar

En `app.js`, `CONFIG` contiene la fecha, la carta y las dedicatorias. La carta es una propuesta editable; no contiene recuerdos específicos inventados. Los nombres y los textos de portada están en `index.html`; los estilos están en `style.css`.

Las fuentes se cargan desde Google Fonts y tienen alternativas locales. Todos los gráficos y sonidos se generan en el navegador. El ramo y las estrellas visitadas se guardan en `localStorage`; si no está disponible la experiencia funciona durante la visita. El botón **Empezar de nuevo** limpia el jardín guardado. Los enlaces con `#universo`, `#constelacion`, `#jardin`, `#tiempo` y `#carta` permiten abrir un capítulo directamente.

Se respeta `prefers-reduced-motion`; también hay un botón para pausar el movimiento. Los mensajes, la navegación y los controles tienen acceso por teclado. El botón de ramo permite crear flores sin usar el lienzo.

## Referencias investigadas

- [Gerbera jamesonii — NC State Extension](https://plants.ces.ncsu.edu/plants/gerbera-jamesonii/): forma radial, centro de floretes y tallos florales sin hojas.
- [Phyllotactic patterning of gerbera flower heads](https://pmc.ncbi.nlm.nih.gov/articles/PMC8020676/): distribución de los floretes en las cabezas florales.
- [Interactive Particles — Codrops](https://tympanus.net/Tutorials/InteractiveParticles/): referencia de interacción con partículas.
- [Morphing Background Shapes — Codrops](https://tympanus.net/Development/MorphingBackgroundShapes/): referencia de transformación fluida.

La implementación y los dibujos son propios; no se incorporaron código ni fotografías de estas referencias.

## Verificación

Sintaxis de JavaScript y simulaciones de navegación, descubrimiento de estrellas, persistencia y límite de flores, reinicio, carta completa, transformación y cambio de tamaño. Se comprobaron escenarios de escritorio, celular, movimiento reducido y almacenamiento bloqueado. Estas simulaciones no sustituyen una revisión visual: no había un navegador conectado disponible en el entorno de desarrollo.
