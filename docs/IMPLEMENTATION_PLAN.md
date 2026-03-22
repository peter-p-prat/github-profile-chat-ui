# Implementation Plan — GitHub Profile Chat UI

Orden de construccion bottom-up: datos y tipos primero, luego infraestructura React, luego UI por paneles, luego integracion de layout y pulido final.

---

## Etapa 0 — Setup del proyecto (~15 min)

**Objetivo:** proyecto corriendo en el browser sin errores.

### Pasos

1. Scaffold con Vite:
   ```bash
   npm create vite@latest . -- --template react-ts
   ```

2. Reemplazar archivos de configuracion con las versiones del proyecto de referencia:
   - `package.json` — dependencias (React 19, Tailwind 4, React Query 5, React Router 7, Zod 4, React Compiler)
   - `vite.config.ts` — plugins: `@vitejs/plugin-react` con Oxc transform + React Compiler
   - `tsconfig.json` + `tsconfig.app.json` — strict mode, paths
   - `eslint.config.js` — reglas estrictas de TypeScript
   - `.prettierrc` — formato consistente
   - `tailwind.config.ts` (si aplica en Tailwind 4)

3. Instalar dependencias:
   ```bash
   npm install
   ```

4. Limpiar el scaffold de Vite (eliminar `App.css`, contenido de `App.tsx`, assets de ejemplo).

### Verificacion

```bash
npm run dev
```
El browser muestra la pagina en blanco sin errores en consola. TypeScript compila sin errores.

---

## Etapa 1 — Datos mock y schemas (~20 min)

**Objetivo:** capa de datos completamente funcional, independiente de React.

### Archivos a crear

**`src/api/github.schemas.ts`**

Zod schemas para:
- `GithubProfileSchema` — login, name, avatarUrl, bio, publicRepos, followers, following
- `ContributionDaySchema` — date (string ISO), count (number), level (0–4)
- `ContributionsSchema` — array de `ContributionDaySchema` con ~365 entradas

**`src/api/github.types.ts`**

Tipos inferidos:
```typescript
export type GithubProfile = z.infer<typeof GithubProfileSchema>;
export type ContributionDay = z.infer<typeof ContributionDaySchema>;
export type Contributions = z.infer<typeof ContributionsSchema>;
```

**`src/api/github.keys.ts`**

Query key factory:
```typescript
export const githubKeys = {
  all: ['github'] as const,
  profile: () => [...githubKeys.all, 'profile'] as const,
  contributions: () => [...githubKeys.all, 'contributions'] as const,
};
```

**`src/api/github.ts`**

- Datos mock del perfil (usuario real o ficticio con datos verosimiles)
- Datos mock de contribuciones: 52 semanas x 7 dias con actividad variada (picos, rachas, fines de semana con menos actividad)
- `fetchProfile(): Promise<GithubProfile>` — delay de 800ms, valida con schema
- `fetchContributions(): Promise<Contributions>` — delay de 600ms, valida con schema

**`src/api/chat.ts`**

- `simulateResponse(question: string, contributions: Contributions): Promise<string>` — delay de 1.2–2s
- Mapeo keyword → respuesta contextual:
  - "active" / "last 3 months" → calcula contribuciones de los ultimos 90 dias
  - "busiest day" → encuentra el dia de la semana con mas contribuciones
  - "weekend" → calcula ratio de contribuciones en sabado/domingo
  - "streak" → calcula la racha mas larga de dias consecutivos
  - fallback → respuesta generica sobre el perfil

### Verificacion

Desde la consola del browser (o un archivo temporal `src/test.ts`):
```typescript
import { fetchProfile, fetchContributions } from './api/github';
fetchProfile().then(console.log);
fetchContributions().then(console.log);
```
Los datos aparecen con la estructura correcta despues del delay.

---

## Etapa 2 — Infraestructura React (~15 min)

**Objetivo:** providers configurados, custom hooks funcionales, estilos base del tema.

### Archivos a crear

**`src/lib/queryClient.ts`**

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
});
```

**`src/hooks/useGithubProfile.ts`**

```typescript
export function useGithubProfile() {
  return useQuery({
    queryKey: githubKeys.profile(),
    queryFn: fetchProfile,
  });
}
```

**`src/hooks/useContributions.ts`**

```typescript
export function useContributions() {
  return useQuery({
    queryKey: githubKeys.contributions(),
    queryFn: fetchContributions,
  });
}
```

**`src/hooks/useChat.ts`**

Estado:
- `messages: Message[]` — array de `{ id, role: 'user' | 'assistant', content, timestamp }`
- `isTyping: boolean` — true mientras el asistente "escribe"

Handler:
- `sendMessage(content: string)` — agrega mensaje del usuario, activa `isTyping`, llama `simulateResponse`, agrega respuesta, desactiva `isTyping`

**`src/main.tsx`**

```tsx
<StrictMode>
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
</StrictMode>
```

**`src/index.css`**

- Variables CSS en `:root`: colores del tema (background, surface, text, accent, border)
- Override de variables en `@media (prefers-color-scheme: dark)`
- Keyframes: `slideInUp`, `fadeIn`, `bounce`
- Clases de animacion para uso en componentes

### Verificacion

Los hooks devuelven `{ data, isLoading, isError }` con los valores correctos. `useChat` actualiza `messages` e `isTyping` correctamente al llamar `sendMessage`.

---

## Etapa 3 — Profile Panel (~30 min)

**Objetivo:** panel izquierdo completamente funcional con skeleton loading y contribution chart.

### Archivos a crear

**`src/components/ui/Skeleton.tsx`**

Componente generico con props `width`, `height`, `className`. Animacion `pulse` via Tailwind.

**`src/components/ui/Spinner.tsx`**

SVG spinner animado. Usado en estados de carga de botones.

**`src/components/profile/ProfileCard.tsx`**

Consume `useGithubProfile()`. Muestra:
- Estado loading: skeletons para avatar (circulo), nombre (linea ancha), bio (2 lineas), stats (3 numeros)
- Estado error: mensaje de error con boton de retry
- Estado success: avatar con `loading="lazy"`, nombre, username (@login), bio, stats (repos / followers / following) con separadores verticales

**`src/components/profile/ContributionChart.tsx`**

Consume `useContributions()`. Estructura:
- Titulo "Contribution activity"
- Labels de meses (calculados a partir de las fechas del mock)
- Labels de dias de la semana (Mon, Wed, Fri)
- Grid CSS 53 columnas: cada celda es un div con `data-level={0|1|2|3|4}` y color via variable CSS
- Animacion de entrada: cada columna con `animation-delay` progresivo (stagger)
- Hover: muestra `ContributionTooltip`

**`src/components/profile/ContributionTooltip.tsx`**

Tooltip posicionado absolutamente sobre la celda en hover. Muestra:
- Fecha formateada (ej: "March 15, 2024")
- Conteo (ej: "5 contributions" o "No contributions")

### Verificacion

- En carga inicial: skeletons visibles durante ~800ms
- Transicion suave de skeleton a datos reales
- El chart muestra 52–53 columnas con colores correctos segun el nivel
- Hover sobre celdas muestra tooltip con fecha y count correctos
- En dark mode: colores del chart se adaptan correctamente

---

## Etapa 4 — Chat Panel (~30 min)

**Objetivo:** flujo completo de chat funcional con animaciones.

### Archivos a crear

**`src/components/chat/MessageBubble.tsx`**

Props: `message: Message`. Render:
- role `user`: burbuja a la derecha, color de acento, texto blanco
- role `assistant`: burbuja a la izquierda, color neutro, texto primario
- Animacion de entrada: `slideInUp` + `fadeIn` al montarse
- Timestamp formateado (hora:minuto)

**`src/components/chat/TypingIndicator.tsx`**

3 puntos (`span`) con clase `bounce` y `animation-delay` escalonado (0ms, 150ms, 300ms). Mismo estilo de burbuja que los mensajes del asistente.

**`src/components/chat/MessageList.tsx`**

Props: `messages: Message[]`, `isTyping: boolean`. Funcionalidad:
- `useEffect` con `ref.current.scrollIntoView({ behavior: 'smooth' })` cuando `messages` cambia
- Render de `MessageBubble` por cada mensaje
- Render de `TypingIndicator` cuando `isTyping === true`

**`src/components/chat/ChatInput.tsx`**

Props: `onSend: (content: string) => void`, `disabled: boolean`. Funcionalidad:
- Input de texto controlado
- Submit con Enter o boton
- `disabled` cuando `isTyping === true`
- Focus visible con outline del color de acento
- Boton con icono de envio (SVG inline)

**`src/components/chat/ChatPanel.tsx`**

Consume `useContributions()` y `useChat()`. Estructura:
- Header: titulo "Ask about this profile"
- `MessageList` con messages e isTyping
- Empty state (cuando `messages.length === 0`): texto introductorio + 4 sugerencias de preguntas clickeables
- `ChatInput` con `onSend={sendMessage}` y `disabled={isTyping}`

### Verificacion

Flujo completo:
1. Usuario escribe mensaje y presiona Enter
2. Mensaje del usuario aparece inmediatamente con animacion
3. Typing indicator aparece (~100ms despues)
4. Despues de 1.2–2s, la respuesta aparece con animacion
5. Typing indicator desaparece
6. El scroll del chat sigue al ultimo mensaje
7. El input esta deshabilitado durante el typing

---

## Etapa 5 — Layout y routing (~15 min)

**Objetivo:** la app completa integrada con layout responsivo.

### Archivos a crear/modificar

**`src/RootLayout.tsx`**

Estructura:
```
<main class="layout">
  <aside class="profile-panel">  <!-- ~35% width en desktop -->
    <ProfileCard />
    <ContributionChart />
  </aside>
  <section class="chat-panel">  <!-- ~65% width en desktop -->
    <ChatPanel />
  </section>
</main>
```

**`src/main.tsx`** (modificar)

Definir router con una ruta `/` que renderiza `RootLayout`.

**`src/index.css`** (modificar)

Estilos del layout:
- Desktop (>768px): `display: grid; grid-template-columns: 35% 65%`
- Mobile (<768px): `display: flex; flex-direction: column` con chat primero

### Verificacion

En tres breakpoints:
- 375px (mobile): paneles en columna, chat primero
- 768px (tablet): layout de dos paneles comienza
- 1280px (desktop): proporcion 35/65 correcta, sin overflow horizontal

---

## Etapa 6 — Pulido (~30 min)

**Objetivo:** elevar la calidad visual y cubrir los criterios de evaluacion de detalle.

### Items

**Animaciones**
- Verificar que `slideInUp` + `fadeIn` en mensajes se siente natural (duracion ~300ms, easing `ease-out`)
- Stagger del contribution chart: delay de ~20ms por columna (max ~1s total)
- Transicion de hover en celdas del chart: `transition: opacity 150ms`

**Estados de hover y focus**
- Celdas del contribution chart: `opacity: 0.8` en hover
- Sugerencias de preguntas en empty state: hover con color de acento
- ChatInput: `outline` visible en focus (accesibilidad)
- Boton de envio: estado hover y active

**Empty states**
- Chat sin mensajes: mensaje introductorio ("Ask me anything about this GitHub profile") + 4 sugerencias clickeables pre-definidas
- Estado de error en perfil: icono + mensaje + boton "Try again"

**Consistencia visual**
- Revisar spacing (Tailwind scale: 4, 6, 8, 12, 16)
- Revisar tipografia: size, weight, color, line-height en todos los elementos
- Verificar que los colores en dark mode tienen suficiente contraste (WCAG AA)

**Contribution chart — detalles**
- Labels de meses correctamente alineados con las columnas
- Labels de dias (Mon, Wed, Fri) a la izquierda
- Leyenda de "Less / More" con escala de colores en el footer del chart

### Verificacion

Checklist de evaluacion del challenge:
- [ ] Aspecto pulido e intencional
- [ ] Jerarquia visual clara (tipografia, spacing, color)
- [ ] Skeleton loading → transicion suave a datos
- [ ] Typing indicator animado
- [ ] Contribution chart con tooltip en hover
- [ ] Animaciones de entrada en mensajes
- [ ] Focus visible en input
- [ ] Empty state con sugerencias clickeables
- [ ] Dark mode funcional
- [ ] Layout responsivo (375px, 768px, 1280px)
- [ ] Sin `any` en TypeScript
- [ ] Sin errores en consola

---

## Etapa 7 — README (~10 min)

**Objetivo:** documentacion legible por un evaluador externo sin contexto previo.

### Contenido

1. Descripcion del proyecto (1 parrafo)
2. Como correr: `npm install && npm run dev`
3. Stack y decisiones clave (resumen ejecutivo — 5–7 items)
4. Tradeoffs conscientes
5. Que mejoraria con mas tiempo

Ver `README.md` en la raiz del proyecto.

---

## Orden de construccion resumido

```
Etapa 0: Setup
    |
Etapa 1: Mock data + Zod schemas
    |
Etapa 2: QueryClient + Custom hooks + CSS vars
    |
Etapa 3: Profile Panel (ProfileCard + ContributionChart)
    |
Etapa 4: Chat Panel (MessageBubble + TypingIndicator + ChatInput)
    |
Etapa 5: RootLayout + Router
    |
Etapa 6: Pulido (animaciones, hover, empty states, dark mode)
    |
Etapa 7: README
```

Cada etapa produce un incremento funcional verificable. Si el tiempo se acorta, las etapas 6 y 7 son las que se pueden recortar — las etapas 0–5 son el nucleo del challenge.
