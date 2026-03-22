# Architecture — GitHub Profile Chat UI

## Stack tecnologico

| Tecnologia | Version | Justificacion |
|---|---|---|
| React | 19 | Requerido por el challenge. Concurrent features, Server Components disponibles si se necesitan en el futuro |
| TypeScript | 5.x | Requerido por el challenge. Tipos estrictos, inferencia automatica via Zod |
| Vite | 8 | Build tool mas rapido del ecosistema. HMR instantaneo, cold start en ~300ms |
| Tailwind CSS | 4 | Utilidades CSS sin runtime JS. Dark mode via `prefers-color-scheme` sin configuracion extra. Purge automatico en produccion |
| TanStack React Query | 5 | Manejo de estado asincrono con loading/error/stale states integrados. Simula correctamente el comportamiento de una API real incluso con datos mockeados (cache, refetch, deduplication) |
| React Router | 7 | Navegacion SPA. Code splitting via `lazy()` preparado para cuando el proyecto escale |
| Zod | 4 | Validacion de schemas en runtime. Tipos TypeScript inferidos automaticamente — el schema es la unica fuente de verdad |
| React Compiler (Babel plugin) | latest | Memoizacion automatica. Elimina la necesidad de `useMemo`/`useCallback` manual |
| `@vitejs/plugin-react` (Oxc transform) | latest | Compilacion JSX mas rapida que Babel standard |

### Por que no se usa una libreria de componentes (MUI, shadcn, etc.)

El challenge evalua UI polish y atencion al detalle. Usar una libreria de componentes oculta las decisiones de diseno. Tailwind + componentes propios demuestra criterio visual y dominio de CSS sin depender de estilos externos que habria que sobreescribir.

### Por que React Query si los datos son mockeados

Los datos mockeados con delay simulado (1.2–2s) se comportan exactamente igual que una API real desde la perspectiva del componente. React Query gestiona los estados de loading/error/success, el cache con `staleTime`, y el refetch automatico. Si el evaluador quisiera conectar una API real, solo cambia la funcion de fetch — sin tocar ningun componente.

---

## Arquitectura: Type-First

### Justificacion

El proyecto tiene un solo dominio: GitHub profile + chat. Una arquitectura feature-first (`features/profile/`, `features/chat/`) seria sobreingenieria para esta escala y crearia carpetas con 2–3 archivos cada una. Type-first agrupa por responsabilidad tecnica (api, hooks, components), es mas simple y mas facil de navegar para un evaluador externo.

### Estructura de carpetas

```
src/
├── api/
│   ├── github.schemas.ts      # Zod schemas: GithubProfile, ContributionDay
│   ├── github.types.ts        # Tipos inferidos: z.infer<typeof GithubProfileSchema>
│   ├── github.keys.ts         # Query key factory: githubKeys.profile(), .contributions()
│   ├── github.ts              # fetchProfile(), fetchContributions() con delay simulado
│   └── chat.ts                # simulateResponse(question, contributions) → respuesta contextual
├── hooks/
│   ├── useGithubProfile.ts    # useQuery → fetchProfile
│   ├── useContributions.ts    # useQuery → fetchContributions
│   └── useChat.ts             # estado de mensajes, cola, sendMessage() con delay
├── components/
│   ├── profile/
│   │   ├── ProfileCard.tsx        # Avatar, nombre, bio, stats con skeleton loading
│   │   ├── ContributionChart.tsx  # CSS Grid 53x7, color por level 0–4
│   │   └── ContributionTooltip.tsx # Tooltip con fecha y count en hover
│   ├── chat/
│   │   ├── MessageBubble.tsx      # user (derecha, accent) / assistant (izquierda, neutro)
│   │   ├── TypingIndicator.tsx    # 3 puntos con bounce escalonado
│   │   ├── MessageList.tsx        # Scroll automatico al ultimo mensaje
│   │   ├── ChatInput.tsx          # Input + boton, disabled durante typing
│   │   └── ChatPanel.tsx          # Orquesta subcomponentes, consume useChat
│   └── ui/
│       ├── Skeleton.tsx           # Placeholder animado reutilizable
│       └── Spinner.tsx            # Indicador de carga reutilizable
├── lib/
│   └── queryClient.ts         # Singleton QueryClient: staleTime 60s, retry 1
├── RootLayout.tsx             # Layout 2 paneles (profile | chat)
├── main.tsx                   # Providers: StrictMode → QueryClientProvider → RouterProvider
└── index.css                  # Variables del tema, dark mode, keyframes
```

---

## Patrones de diseno

### Zod-first

Los schemas Zod en `api/*.schemas.ts` son la unica fuente de verdad para los tipos del dominio. Los tipos TypeScript se infieren con `z.infer<>` — nunca se definen a mano interfaces que puedan desincronizarse con la validacion en runtime.

```typescript
// api/github.schemas.ts
export const GithubProfileSchema = z.object({
  login: z.string(),
  name: z.string(),
  avatarUrl: z.string().url(),
  bio: z.string().nullable(),
  publicRepos: z.number().int().nonnegative(),
  followers: z.number().int().nonnegative(),
  following: z.number().int().nonnegative(),
});

// api/github.types.ts
export type GithubProfile = z.infer<typeof GithubProfileSchema>;
```

### Query key factory

Las cache keys de React Query se centralizan en `*.keys.ts`. Elimina strings sueltos duplicados y facilita la invalidacion selectiva del cache.

```typescript
// api/github.keys.ts
export const githubKeys = {
  all: ['github'] as const,
  profile: () => [...githubKeys.all, 'profile'] as const,
  contributions: () => [...githubKeys.all, 'contributions'] as const,
};
```

### Custom hooks como capa de estado

Los custom hooks en `hooks/` contienen toda la logica de estado y efectos. Los componentes solo reciben datos y handlers — sin fetch directo ni logica de negocio.

```typescript
// hooks/useGithubProfile.ts
export function useGithubProfile() {
  return useQuery({
    queryKey: githubKeys.profile(),
    queryFn: fetchProfile,
    staleTime: 60_000,
  });
}
```

### Separacion estricta de capas

```
api/ → hooks/ → components/
```

- `api/` no importa de `hooks/` ni de `components/`
- `hooks/` importa de `api/`, no de `components/`
- `components/` importa de `hooks/` y de otros `components/ui/`

---

## Decisiones de UX/UI

### Layout

Dos paneles en desktop (profile izquierda ~35%, chat derecha ~65%). En mobile, stacked verticalmente con el chat primero para priorizar la interaccion. Breakpoint en 768px.

### Contribution chart

CSS Grid nativo con 53 columnas (semanas) x 7 filas (dias). Sin libreria de charts. Cada celda es un `div` con color basado en el nivel de actividad (0–4):

| Nivel | Contribuciones | Color (light) | Color (dark) |
|---|---|---|---|
| 0 | 0 | `#ebedf0` | `#161b22` |
| 1 | 1–3 | `#9be9a8` | `#0e4429` |
| 2 | 4–6 | `#40c463` | `#006d32` |
| 3 | 7–9 | `#30a14e` | `#26a641` |
| 4 | 10+ | `#216e39` | `#39d353` |

Tooltip en hover con fecha y count. Animacion de entrada con stagger por columna (fadeIn con delay progresivo).

### Chat

- Mensajes del usuario: alineados a la derecha, color de acento
- Mensajes del asistente: alineados a la izquierda, color neutro
- Typing indicator: 3 puntos con animacion bounce escalonada
- Delay simulado de 1.2–2s antes de la respuesta (imita AI thinking)
- Scroll automatico al ultimo mensaje
- Input deshabilitado mientras el asistente esta "escribiendo"
- Empty state con sugerencias de preguntas clickeables

### Dark mode

CSS variables en `:root` y `@media (prefers-color-scheme: dark)`. Sin JavaScript para el toggle — respeta la preferencia del sistema operativo. Los colores del contribution chart tienen variantes para ambos modos.

### Animaciones

Implementadas con CSS keyframes en `index.css`. Sin libreria de animacion (Framer Motion, etc.) para mantener el bundle pequeno y el control total sobre el timing.

- `slideInUp` + `fadeIn`: entrada de mensajes en el chat
- `bounce`: typing indicator (3 puntos con delay escalonado)
- `fadeIn` con `animation-delay` progresivo: columnas del contribution chart
- Transiciones de `opacity` y `transform` en hover states

---

## Flujo de datos

```
Mock data (github.ts)
        |
        v
fetchProfile() / fetchContributions()   [delay simulado]
        |
        v
useGithubProfile() / useContributions() [React Query: loading/error/data]
        |
        v
ProfileCard / ContributionChart         [render condicional segun estado]


User input (ChatInput)
        |
        v
useChat.sendMessage()                   [agrega mensaje, inicia delay]
        |
        v
simulateResponse()                      [mapeo keyword → respuesta contextual]
        |
        v
useChat.messages                        [estado actualizado]
        |
        v
MessageList / MessageBubble             [render de conversacion]
```

---

## Criterios de evaluacion y como se abordan

| Criterio | Enfoque |
|---|---|
| Visual quality & attention to detail | Tailwind para consistencia, dark mode nativo, contribution chart fiel al original de GitHub |
| Creativity | Typing indicator animado, sugerencias de preguntas, stagger en chart, respuestas contextuales basadas en datos reales del mock |
| TypeScript and React best practices | Zod-first, query key factory, custom hooks, sin `any`, React Compiler para memoizacion automatica |
| Code structure and scalability | Type-first architecture, separacion estricta de capas, facil de extender a una API real |
| Animations and interactivity | CSS keyframes propios para mensajes, typing indicator, chart hover + tooltip, skeleton loading |
