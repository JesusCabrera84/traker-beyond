# Estilos CSS del Proyecto

## Estructura de Archivos

- `base.css` - Estilos base y configuración de Tailwind CSS
- `components.css` - Estilos específicos de componentes
- `layout.css` - Estilos de layout y estructura
- `utilities.css` - Clases de utilidad personalizadas
- `login-page.css` - Estilos para la página de login con video de fondo
- `index.css` - Archivo principal que importa todos los demás

## Página de Login

### Características

La página principal (`/`) ahora es una página de login con:

- **Video de fondo**: `static/vid/map-back.mp4` ocupando toda la pantalla
- **Markers sobrepuestos**: Imágenes de GPS aleatorias sobre el video
- **Overlay de login**: Formulario centrado con efecto de cristal
- **Diseño dinámico**: Markers cambian de posición en cada carga

### Clases Disponibles

#### Video de Fondo
- `.background-video` - Video que ocupa toda la pantalla
  - `position: fixed`
  - `object-fit: cover`
  - `z-index: -1`

#### Markers Sobrepostos
- `.overlay-marker` - Imágenes de GPS sobre el video
  - `position: fixed`
  - `pointer-events: none` (no seleccionables)
  - `user-select: none` (no seleccionables)
  - `z-index: 1`
  - Efecto de sombra y hover

#### Overlay de Login
- `.login-overlay` - Contenedor del formulario de login
  - Centrado en la pantalla
  - Efecto de cristal con `backdrop-filter: blur(15px)`
  - Sombra elegante
  - Borde sutil

### Estructura HTML

```html
<!-- Video de fondo -->
<video class="background-video" autoplay muted loop playsinline>
  <source src="/vid/map-back.mp4" type="video/mp4" />
</video>

<!-- Markers sobrepuestos -->
<img src="/img/marker-blue.png" class="overlay-marker" />
<img src="/img/marker-red.png" class="overlay-marker" />

<!-- Overlay de login -->
<div class="login-overlay">
  <h1>Bienvenido</h1>
  <!-- Formulario de login aquí -->
</div>
```

### Características de los Markers

#### Posicionamiento Aleatorio
- **Cantidad**: 3-6 markers por carga
- **Posición**: 10% a 90% del ancho y alto de la pantalla
- **Rotación**: 0° a 360° aleatoria
- **Escala**: 0.8x a 1.2x aleatoria
- **Opacidad**: 0.7 a 1.0 aleatoria

#### Imágenes Disponibles
- `static/img/marker-blue.png` - Marker azul
- `static/img/marker-red.png` - Marker rojo

#### Interactividad
- **No seleccionables**: `pointer-events: none`
- **No arrastrables**: `draggable="false"`
- **Sin menú contextual**: `on:contextmenu|preventDefault`
- **Efecto hover**: Escala y sombra mejorada

### Efectos Visuales

- **Overlay oscuro**: `body::before` con `rgba(0, 0, 0, 0.3)`
- **Blur en overlay**: `backdrop-filter: blur(15px)`
- **Sombras**: `box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2)`
- **Bordes**: `border: 1px solid rgba(255, 255, 255, 0.2)`
- **Sombra en markers**: `drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))`

## Componentes

### Header (para otras páginas)
- `header-container` - Contenedor principal del header
- `header-button` - Botones del header
- `header-button-active` - Botón activo
- `header-button-inactive` - Botón inactivo

### Loading/Error
- `loading-spinner` - Spinner de carga
- `error-message` - Mensajes de error
- `success-message` - Mensajes de éxito

## Utilidades

### Efectos
- `glass-effect` - Efecto de cristal con blur
- `shadow-soft` - Sombra suave
- `shadow-strong` - Sombra fuerte

### Animaciones
- `fade-in` - Animación de aparición
- `slide-up` - Animación de deslizamiento hacia arriba

### Texto
- `text-gradient` - Texto con gradiente
- `text-shadow` - Sombra de texto
- `text-glow` - Brillo de texto

### Colores
- `bg-gradient-primary` - Gradiente primario
- `bg-gradient-secondary` - Gradiente secundario
- `text-primary` - Color de texto primario
- `text-secondary` - Color de texto secundario

## Archivos Eliminados

- `map-markers.css` - Ya no se usa (eliminado)
- `MapStyleSelector.svelte` - Componente eliminado
- Dependencias de MapLibre GL - Removidas de la página principal 