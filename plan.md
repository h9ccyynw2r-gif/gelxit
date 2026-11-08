# Rediseño de GELXIT

## Enfoque de implementación

Se conserva la aplicación estática existente y su integración con Supabase. El trabajo prioriza un rediseño visual integral de las pantallas ya funcionales: autenticación, onboarding, feed/Xit, explorar, creación, inbox/chat, círculos, perfil, edición, historias, live y panel de dueño. No se cambian tablas, endpoints ni nombres de IDs usados por `app.js`.

## Dirección de diseño

- **Estilos explorados:** editorial nocturno (0.06), brutalismo social suave (0.08), interfaz de estudio de comunidad (0.86).
- **Movimiento:** interfaz de estudio de comunidad; una red social con ritmo editorial, superficies de tinta y acentos ácido-lima.
- **Principios:** jerarquía fuerte, densidad controlada, contenido protagonista y componentes con carácter propio.
- **Color:** negro tinta y carbón para concentración; crema para lectura; verde lima como firma accionable; violeta como señal de profundidad, identidad y estados especiales.
- **Layout:** composición vertical tipo feed, con cabeceras compactas, módulos horizontales de descubrimiento y superficies asimétricas; en pantallas grandes el producto se presenta como un lienzo centrado, no como una plantilla estirada.
- **Firma visual:** marca Xit en forma de pulso/lima, etiquetas editoriales, bordes finos y barras de actividad.
- **Interacción:** cada acción tiene estados hover, active, focus y disabled; las transiciones son cortas y naturales.
- **Animación:** entradas con desplazamiento mínimo, elevación sutil en botones y feedback inmediato en toasts, sin glow excesivo.
- **Tipografía:** familia display `Space Grotesk` para títulos y marca; `DM Sans` para lectura y controles.
- **Esencia:** GELXIT es el lugar donde las ideas, Xits y comunidades encuentran su momento de mayor energía. Personalidad: directa, curiosa, eléctrica.
- **Voz:** CTAs concretos y humanos; ejemplos: “Armar mi feed” y “Haz que pegue”.
- **Marca:** wordmark en mayúsculas bajas con una “x” partida como símbolo de conexión; color propio `#C7F36B`.

## Estructura existente

- `index.html`: shell de pantallas, navegación, overlays y elementos de entrada.
- `app.css`: sistema visual y layout responsive.
- `app.js`: autenticación, Supabase, feed, Xits, uploads, círculos, perfiles, chat, historias, lives y administración.
- `supabase.sql`: cambios de esquema y políticas para funciones v2.
- `assets/logo.jpg`: activo de marca existente, reutilizado.

## Alcance de esta iteración

1. Sustituir el sistema visual genérico por tokens de GELXIT.
2. Rediseñar navegación, botones, chips, formularios, tarjetas, feed, perfiles, chat y overlays.
3. Mejorar responsive y legibilidad en móvil y escritorio.
4. Mantener todos los IDs, handlers y flujos de datos existentes.
5. Ejecutar validaciones estáticas y levantar una vista local para comprobar que los archivos sirven correctamente.
