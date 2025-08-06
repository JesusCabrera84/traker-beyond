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
- **Overlay con degradado**: Capa de colores morado, rojo y azul con opacidad 0.2
- **Círculos animados**: Grupos de círculos que aparecen, se animan y desaparecen
- **Overlay de login**: Formulario centrado con efecto de cristal
- **Diseño dinámico**: Elementos cambian de posición en cada carga

### Clases Disponibles

#### Video de Fondo
- `.background-video` - Video que ocupa toda la pantalla
  - `position: fixed`
  - `object-fit: cover`
  - `z-index: -1`

#### Overlay con Degradado
- `.gradient-overlay` - Capa de colores sobre el video
  - `position: fixed`
  - `width: 100%` y `height: 100%`
  - `z-index: 0`
  - `pointer-events: none` (no interactivo)
  - Degradado lineal de 45° con morado, rojo y azul
  - Opacidad de 0.2 para cada color

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

### Características del Overlay de Login

#### Formulario Principal
- **Campos de entrada**: Email y contraseña con validación
- **Botón de login**: Con gradiente y efectos hover
- **Validación**: Campos requeridos y formato de email
- **Accesibilidad**: Labels asociados y navegación por teclado

#### Campos de Entrada
- `.form-input` - Estilo para inputs de email y contraseña
  - `border: 2px solid #e1e5e9` - Borde sutil
  - `border-radius: 8px` - Esquinas redondeadas
  - `transition: all 0.3s ease` - Animaciones suaves
  - `background: rgba(255, 255, 255, 0.9)` - Fondo semi-transparente
  - Focus: Borde azul con sombra y fondo sólido

#### Botón de Login
- `.login-button` - Botón principal de inicio de sesión
  - `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)` - Gradiente azul-morado
  - `transform: translateY(-2px)` - Efecto de elevación en hover
  - `box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3)` - Sombra con color

#### Separador Visual
- `.separator` - Línea divisoria con texto
  - Línea horizontal con texto centrado
  - Fondo blanco para el texto
  - `color: #666` - Texto gris

#### Botones de Redes Sociales
- `.social-buttons` - Contenedor de botones sociales
  - `display: flex` - Layout horizontal
  - `gap: 1rem` - Espaciado entre botones
  - `justify-content: center` - Centrado

- `.social-button` - Estilo base para botones sociales
  - `border: 2px solid #e1e5e9` - Borde sutil
  - `display: flex` - Layout para icono y texto
  - `gap: 0.5rem` - Espacio entre icono y texto
  - `min-width: 100px` - Ancho mínimo
  - Hover: Elevación y cambio de color

#### Iconos de Redes Sociales
- `.social-icon` - SVG icons de 20x20px
- **Google**: Colores oficiales (azul, verde, amarillo, rojo)
- **Facebook**: Color oficial #1877F2
- **X (Twitter)**: Color negro

#### Colores de Hover por Red Social
- `.google-button:hover` - Borde y texto azul (#4285F4)
- `.facebook-button:hover` - Borde y texto azul (#1877F2)
- `.twitter-button:hover` - Borde y texto negro (#000000)

#### Enlaces Adicionales
- `.login-links` - Contenedor de enlaces
  - `display: flex` - Layout horizontal
  - `justify-content: space-between` - Distribución
  - `gap: 1rem` - Espaciado

- `.link` - Estilo para enlaces
  - `color: #667eea` - Color azul
  - `text-decoration: none` - Sin subrayado
  - Hover: Subrayado y color más oscuro

#### Responsive Design
- **Mobile (< 480px)**:
  - `.login-overlay`: `min-width: 320px`, `padding: 2rem`
  - `.social-buttons`: `flex-direction: column`
  - `.login-links`: `flex-direction: column`, `text-align: center`

### Estructura HTML del Formulario

```html
<div class="login-overlay">
  <h1>Bienvenido</h1>
  
  <!-- Formulario de login -->
  <form class="login-form">
    <div class="form-group">
      <label for="email">Correo electrónico</label>
      <input type="email" id="email" class="form-input" required />
    </div>
    
    <div class="form-group">
      <label for="password">Contraseña</label>
      <input type="password" id="password" class="form-input" required />
    </div>
    
    <button type="submit" class="login-button">
      Iniciar Sesión
    </button>
  </form>
  
  <!-- Separador -->
  <div class="separator">
    <span>o continúa con</span>
  </div>
  
  <!-- Botones de redes sociales -->
  <div class="social-buttons">
    <button class="social-button google-button">
      <svg class="social-icon">...</svg>
      Google
    </button>
    
    <button class="social-button facebook-button">
      <svg class="social-icon">...</svg>
      Facebook
    </button>
    
    <button class="social-button twitter-button">
      <svg class="social-icon">...</svg>
      X
    </button>
  </div>
  
  <!-- Enlaces adicionales -->
  <div class="login-links">
    <a href="#" class="link">¿Olvidaste tu contraseña?</a>
    <a href="#" class="link">Crear cuenta</a>
  </div>
</div>
```

### Funcionalidad JavaScript

#### Variables Reactivas
- `email` - Campo de correo electrónico
- `password` - Campo de contraseña
- `circles` - Array de círculos animados

#### Funciones Principales
- `handleLogin()` - Maneja el envío del formulario
- `handleSocialLogin(provider)` - Maneja login con redes sociales
- `handleKeyPress(event)` - Maneja tecla Enter
- `startCircleGeneration()` - Inicia generación de círculos
- `createRandomCircle()` - Crea círculo aleatorio

#### Flujo de Autenticación
1. **Verificación inicial**: `onMount` verifica si ya está logueado
2. **Login manual**: `handleLogin()` simula autenticación
3. **Login social**: `handleSocialLogin()` maneja redes sociales
4. **Redirección**: `goto('/tracking')` después del login exitoso
5. **Almacenamiento**: `localStorage` guarda estado de autenticación

#### Simulación de Autenticación
- **Login manual**: Cualquier email/contraseña válidos
- **Login social**: Simula OAuth con proveedores
- **Persistencia**: `localStorage.setItem('isLoggedIn', 'true')`
- **Proveedor**: `localStorage.setItem('loginProvider', provider)`

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
- **Overlay de colores**: Degradado morado-rojo-azul con opacidad 0.2
- **Blur en overlay**: `backdrop-filter: blur(15px)`
- **Sombras**: `box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2)`
- **Bordes**: `border: 1px solid rgba(255, 255, 255, 0.2)`
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
- Markers sobrepuestos - Eliminados completamente 