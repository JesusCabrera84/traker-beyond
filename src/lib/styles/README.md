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
- **Círculos animados**: Grupos de círculos que aparecen, se animan y desaparecen
- **Overlay de login**: Formulario centrado con efecto de cristal
- **Diseño dinámico**: Elementos cambian de posición en cada carga

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

#### Círculos Animados
- `.animated-circle` - Círculos que aparecen y desaparecen
  - `position: fixed`
  - `pointer-events: none` (no seleccionables)
  - `user-select: none` (no seleccionables)
  - `z-index: 2`
  - Animación de 8 segundos
  - Efecto de brillo mejorado

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

<!-- Círculos animados -->
<div class="animated-circle"></div>

<!-- Overlay de login -->
<div class="login-overlay">
  <h1>Bienvenido</h1>
  <!-- Formulario de login aquí -->
</div>
```

### Características de los Markers

#### Posicionamiento Aleatorio
- **Cantidad**: 6-10 markers por carga
- **Posición**: 10% a 90% del ancho y alto de la pantalla
- **Opacidad**: 0.5 a 0.8 aleatoria

#### Imágenes Disponibles
- `static/img/marker-blue.png` - Marker azul
- `static/img/marker-red-1.png` - Marker rojo
- `static/img/marker-green.png` - Marker verde
- `static/img/marker-orange.png` - Marker naranja

#### Interactividad
- **No seleccionables**: `pointer-events: none`
- **No arrastrables**: `draggable="false"`
- **Sin menú contextual**: `on:contextmenu|preventDefault`
- **Efecto hover**: Escala y sombra mejorada

### Características de los Círculos Animados

#### Generación en Grupos
- **Frecuencia**: Cada 3-6 segundos
- **Cantidad por grupo**: 3-8 círculos
- **Delay entre círculos**: 200ms (efecto escalonado)
- **Posición**: 5% a 95% del ancho y alto de la pantalla
- **Tamaño**: 10px a 100px aleatorio
- **Colores**: Rojo, verde, azul, amarillo, magenta, cian

#### Animación Mejorada
- **Duración**: 8 segundos
- **Secuencia**: 
  - 0%: Aparece (escala 0, opacidad 0)
  - 15%: Escala completa (escala 1, opacidad 1)
  - 70%: Escala expandida (escala 1.3, opacidad 0.9)
  - 100%: Desaparece (escala 0, opacidad 0)
- **Efecto**: Brillo mejorado con `box-shadow`
- **Desaparición**: Automática después de la animación

#### Colores Disponibles
- `rgba(255, 107, 107, 0.8)` - Rojo
- `rgba(107, 255, 107, 0.8)` - Verde
- `rgba(107, 107, 255, 0.8)` - Azul
- `rgba(255, 255, 107, 0.8)` - Amarillo
- `rgba(255, 107, 255, 0.8)` - Magenta
- `rgba(107, 255, 255, 0.8)` - Cian

#### Efecto de Degradado
- **Tipo**: Degradado radial (`radial-gradient`)
- **Centro**: Transparente (0% a 30%)
- **Borde**: Color sólido (100%)
- **Efecto**: Apariencia de "halo" o "aura"
- **Blend Mode**: `screen` para mejor integración visual

### Efectos Visuales

- **Overlay oscuro**: `body::before` con `rgba(0, 0, 0, 0.3)`
- **Blur en overlay**: `backdrop-filter: blur(15px)`
- **Sombras**: `box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2)`
- **Bordes**: `border: 1px solid rgba(255, 255, 255, 0.2)`
- **Sombra en markers**: `drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))`
- **Brillo en círculos**: `box-shadow: 0 0 40px rgba(255, 255, 255, 0.5)`
- **Degradado radial**: `radial-gradient(circle, transparent 0%, transparent 30%, color 100%)`
- **Blend mode**: `mix-blend-mode: screen`

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
- `circleAnimation` - Animación de círculos mejorada

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