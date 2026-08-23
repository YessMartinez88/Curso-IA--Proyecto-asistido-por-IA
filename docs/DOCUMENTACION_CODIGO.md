# Catálogo de código comentado — Asistencia Instituto

Este documento complementa los comentarios JSDoc en español añadidos a los archivos propios del proyecto. La documentación describe el propósito de cada módulo y de cada función nombrada sin modificar la lógica, diseño ni comportamiento de la aplicación.

| Cobertura | Cantidad |
|---|---:|
| Archivos propios documentados | 110 |
| Funciones o métodos nombrados identificados | 288 |

## Inventario

| Archivo | Propósito | Funciones documentadas |
|---|---|---|
| `app/_layout.tsx` | Pantalla o ruta contextual de la aplicación móvil. | `RootLayout` |
| `app/(tabs)/_layout.tsx` | Pantalla principal de una pestaña del flujo móvil por rol. | `TabLayout` |
| `app/(tabs)/agenda.tsx` | Pantalla principal de una pestaña del flujo móvil por rol. | `AdministrativeCommissionRow`, `AgendaScreen`, `DayGroup`, `FortnightHeader`, `isScheduledDay` |
| `app/(tabs)/asistencia.tsx` | Pantalla principal de una pestaña del flujo móvil por rol. | `ActionButton`, `AttendanceScreen`, `CommissionPicker`, `Empty`, `InfoLine`, `MessageBox`, `RecordRow`, `registerDemoAttendance`, `SessionStatus` |
| `app/(tabs)/index.tsx` | Pantalla principal de una pestaña del flujo móvil por rol. | `HomeScreen`, `RoleHome`, `Stat`, `StudentClassCard`, `StudentHome` |
| `app/(tabs)/perfil.tsx` | Pantalla principal de una pestaña del flujo móvil por rol. | `ProfileScreen`, `Setting` |
| `app/academico-detalle.tsx` | Pantalla o ruta contextual de la aplicación móvil. | `AcademicDetailScreen`, `Section` |
| `app/academico.tsx` | Pantalla o ruta contextual de la aplicación móvil. | `AcademicHeader`, `AcademicItemRow`, `AcademicScreen`, `GradeRow` |
| `app/actividad-nueva.tsx` | Pantalla o ruta contextual de la aplicación móvil. | `Field`, `NewActivityScreen`, `pickAttachment`, `publish` |
| `app/actividad-revision.tsx` | Pantalla o ruta contextual de la aplicación móvil. | `ActivityReviewScreen`, `SubmissionCard`, `submitGrade` |
| `app/actividades-docente.tsx` | Pantalla o ruta contextual de la aplicación móvil. | `TeacherActivitiesScreen` |
| `app/clase-detalle.tsx` | Pantalla o ruta contextual de la aplicación móvil. | `ClassDetailScreen`, `OverviewCard`, `SummaryChip` |
| `app/comision.tsx` | Pantalla o ruta contextual de la aplicación móvil. | `ActivatedPanel`, `addStudent`, `CommissionEnrollmentManager`, `CommissionFormFields`, `CommissionScreen`, `deactivateStudent`, `FormField`, `fromCommission`, `handleActivate`, `handleAddEnrollment`, `handleDeactivateEnrollment`, `handleReview`, `handleSaveDraft`, `persistDraft`, `ReviewPanel`, `updateField` |
| `app/dev/theme-lab.tsx` | Pantalla o ruta contextual de la aplicación móvil. | `build`, `ColorSwatch`, `ThemeLabScreen` |
| `app/historial.tsx` | Pantalla o ruta contextual de la aplicación móvil. | `HistoryScreen`, `openJustification`, `RecordDetail` |
| `app/index.tsx` | Pantalla o ruta contextual de la aplicación móvil. | `Index` |
| `app/justificacion.tsx` | Pantalla o ruta contextual de la aplicación móvil. | `JustificationScreen`, `pickAttachment`, `submit` |
| `app/justificaciones-revision.tsx` | Pantalla o ruta contextual de la aplicación móvil. | `JustificationReviewScreen`, `openAttachment`, `ReviewCard` |
| `app/login.tsx` | Pantalla o ruta contextual de la aplicación móvil. | `enterDemo`, `LoginScreen` |
| `app/oauth/callback.tsx` | Pantalla o ruta contextual de la aplicación móvil. | `handleCallback`, `OAuthCallback` |
| `app/scan-qr.tsx` | Pantalla o ruta contextual de la aplicación móvil. | `onBarcodeScanned`, `ScanQrScreen` |
| `components/external-link.tsx` | Componente reutilizable de interfaz para la aplicación móvil. | `ExternalLink` |
| `components/haptic-tab.tsx` | Componente reutilizable de interfaz para la aplicación móvil. | `HapticTab` |
| `components/hello-wave.tsx` | Componente reutilizable de interfaz para la aplicación móvil. | `HelloWave` |
| `components/parallax-scroll-view.tsx` | Componente reutilizable de interfaz para la aplicación móvil. | `ParallaxScrollView` |
| `components/role-selector.tsx` | Componente reutilizable de interfaz para la aplicación móvil. | `RoleSelector` |
| `components/screen-container.tsx` | Componente reutilizable de interfaz para la aplicación móvil. | `ScreenContainer` |
| `components/themed-view.tsx` | Componente reutilizable de interfaz para la aplicación móvil. | `ThemedView` |
| `components/ui/collapsible.tsx` | Componente reutilizable de interfaz para la aplicación móvil. | `Collapsible` |
| `components/ui/icon-symbol.ios.tsx` | Componente reutilizable de interfaz para la aplicación móvil. | `IconSymbol` |
| `components/ui/icon-symbol.tsx` | Componente reutilizable de interfaz para la aplicación móvil. | `IconSymbol` |
| `constants/brand.ts` | Constantes y configuraciones compartidas del dominio de la aplicación. | `getRoleActionRoute` |
| `constants/const.ts` | Constantes y configuraciones compartidas del dominio de la aplicación. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `constants/oauth.ts` | Constantes y configuraciones compartidas del dominio de la aplicación. | `encodeState`, `getApiBaseUrl`, `getLoginUrl`, `getRedirectUri`, `startOAuthLogin` |
| `constants/theme.ts` | Constantes y configuraciones compartidas del dominio de la aplicación. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `drizzle/relations.ts` | Definición declarativa del modelo de datos y sus relaciones. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `drizzle/schema.ts` | Definición declarativa del modelo de datos y sus relaciones. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `hooks/use-auth.ts` | Hook reutilizable para encapsular estado o comportamiento de interfaz. | `useAuth` |
| `hooks/use-color-scheme.ts` | Hook reutilizable para encapsular estado o comportamiento de interfaz. | `useColorScheme` |
| `hooks/use-color-scheme.web.ts` | Hook reutilizable para encapsular estado o comportamiento de interfaz. | `useColorScheme` |
| `hooks/use-colors.ts` | Hook reutilizable para encapsular estado o comportamiento de interfaz. | `useColors` |
| `lib/_core/api.ts` | Utilidad de infraestructura base del proyecto y su entorno de ejecución. | `apiCall`, `establishSession`, `exchangeOAuthCode`, `getMe`, `logout` |
| `lib/_core/auth.ts` | Utilidad de infraestructura base del proyecto y su entorno de ejecución. | `clearUserInfo`, `getSessionToken`, `getUserInfo`, `removeSessionToken`, `setSessionToken`, `setUserInfo` |
| `lib/_core/manus-runtime.ts` | Utilidad de infraestructura base del proyecto y su entorno de ejecución. | `handleMessage`, `initManusRuntime`, `isInIframe`, `isRunningInPreviewIframe`, `isValidInsets`, `isWeb`, `log`, `sendToParent`, `subscribeSafeAreaInsets` |
| `lib/_core/nativewind-pressable.ts` | Utilidad de infraestructura base del proyecto y su entorno de ejecución. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `lib/_core/theme.ts` | Utilidad de infraestructura base del proyecto y su entorno de ejecución. | `buildRuntimePalette`, `buildSchemePalette` |
| `lib/demo-role-context.tsx` | Utilidad, proveedor o fuente de datos compartida por las pantallas. | `DemoRoleProvider`, `useDemoRole` |
| `lib/fortnight-agenda-demo.ts` | Utilidad, proveedor o fuente de datos compartida por las pantallas. | `buildFortnightAgenda`, `classesForDay` |
| `lib/student-academic-demo.ts` | Utilidad, proveedor o fuente de datos compartida por las pantallas. | `academicAverage`, `academicItemById`, `academicItemsByType` |
| `lib/student-attendance-demo.ts` | Utilidad, proveedor o fuente de datos compartida por las pantallas. | `attendanceSummary`, `canRequestJustification`, `filterAttendanceRecords` |
| `lib/student-class-demo.ts` | Utilidad, proveedor o fuente de datos compartida por las pantallas. | `classSummaryForSubject`, `studentActivitiesForSubject`, `studentActivityState`, `studentClassSummaries` |
| `lib/theme-provider.tsx` | Utilidad, proveedor o fuente de datos compartida por las pantallas. | `ThemeProvider`, `useThemeContext` |
| `lib/trpc.ts` | Utilidad, proveedor o fuente de datos compartida por las pantallas. | `createTRPCClient`, `fetch`, `headers` |
| `lib/utils.ts` | Utilidad, proveedor o fuente de datos compartida por las pantallas. | `cn` |
| `scripts/generate_qr.mjs` | Herramienta de línea de comandos para verificar o automatizar tareas del proyecto. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `scripts/load-env.js` | Herramienta de línea de comandos para verificar o automatizar tareas del proyecto. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `scripts/reset-project.js` | Herramienta de línea de comandos para verificar o automatizar tareas del proyecto. | `moveDirectories` |
| `scripts/verify-attendance-flow.mjs` | Herramienta de línea de comandos para verificar o automatizar tareas del proyecto. | `callProcedure` |
| `scripts/verify-commission-activation.mjs` | Herramienta de línea de comandos para verificar o automatizar tareas del proyecto. | `mutation` |
| `scripts/verify-commission-enrollments.mjs` | Herramienta de línea de comandos para verificar o automatizar tareas del proyecto. | `getProcedure`, `mutation` |
| `scripts/verify-student-commission-flow.mjs` | Herramienta de línea de comandos para verificar o automatizar tareas del proyecto. | `mutation`, `query` |
| `scripts/verify-teacher-commission-flow.mjs` | Herramienta de línea de comandos para verificar o automatizar tareas del proyecto. | `mutation`, `query` |
| `server/_core/context.ts` | Infraestructura del servidor: autenticación, contexto, almacenamiento o servicios internos. | `createContext` |
| `server/_core/cookies.ts` | Infraestructura del servidor: autenticación, contexto, almacenamiento o servicios internos. | `getParentDomain`, `getSessionCookieOptions`, `isIpAddress`, `isSecureRequest` |
| `server/_core/dataApi.ts` | Infraestructura del servidor: autenticación, contexto, almacenamiento o servicios internos. | `callDataApi` |
| `server/_core/env.ts` | Infraestructura del servidor: autenticación, contexto, almacenamiento o servicios internos. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `server/_core/heartbeat.ts` | Infraestructura del servidor: autenticación, contexto, almacenamiento o servicios internos. | `buildEndpoint`, `callForge`, `createHeartbeatJob`, `deleteHeartbeatJob`, `listHeartbeatJobs`, `mapForgeError`, `stringifyPayload`, `updateHeartbeatJob`, `validateCallbackPath` |
| `server/_core/imageGeneration.ts` | Infraestructura del servidor: autenticación, contexto, almacenamiento o servicios internos. | `generateImage`, `listImageModels` |
| `server/_core/index.ts` | Infraestructura del servidor: autenticación, contexto, almacenamiento o servicios internos. | `findAvailablePort`, `isPortAvailable`, `startServer` |
| `server/_core/llm.ts` | Infraestructura del servidor: autenticación, contexto, almacenamiento o servicios internos. | `assertApiKey`, `computeBackoffDelay`, `ensureArray`, `fetchWithBackoff`, `invokeLLM`, `listLLMModels`, `normalizeContentPart`, `normalizeMessage`, `normalizeResponseFormat`, `normalizeToolChoice`, `parseRetryAfter`, `resolveApiUrl`, `sleep` |
| `server/_core/notification.ts` | Infraestructura del servidor: autenticación, contexto, almacenamiento o servicios internos. | `buildEndpointUrl`, `isNonEmptyString`, `notifyOwner`, `trimValue`, `validatePayload` |
| `server/_core/oauth.ts` | Infraestructura del servidor: autenticación, contexto, almacenamiento o servicios internos. | `buildUserResponse`, `getQueryParam`, `registerOAuthRoutes`, `syncUser` |
| `server/_core/sdk.ts` | Infraestructura del servidor: autenticación, contexto, almacenamiento o servicios internos. | `authenticateRequest`, `buildCronUser`, `createOAuthHttpClient`, `createSessionToken`, `decodeState`, `deriveLoginMethod`, `exchangeCodeForToken`, `getSessionSecret`, `getTokenByCode`, `getUserInfo`, `getUserInfoByToken`, `getUserInfoWithJwt`, `isNonEmptyString`, `parseCookies`, `signSession`, `verifySession` |
| `server/_core/storageProxy.ts` | Infraestructura del servidor: autenticación, contexto, almacenamiento o servicios internos. | `registerStorageProxy` |
| `server/_core/systemRouter.ts` | Infraestructura del servidor: autenticación, contexto, almacenamiento o servicios internos. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `server/_core/trpc.ts` | Infraestructura del servidor: autenticación, contexto, almacenamiento o servicios internos. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `server/_core/types/cookie.d.ts` | Infraestructura del servidor: autenticación, contexto, almacenamiento o servicios internos. | `parse` |
| `server/_core/types/manusTypes.ts` | Infraestructura del servidor: autenticación, contexto, almacenamiento o servicios internos. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `server/_core/voiceTranscription.ts` | Infraestructura del servidor: autenticación, contexto, almacenamiento o servicios internos. | `getFileExtension`, `getLanguageName`, `transcribeAudio` |
| `server/db.ts` | Capa de servidor que implementa datos, reglas y endpoints del dominio académico. | `academicActivityView`, `academicSubmissionView`, `activateCommission`, `addCommissionEnrollment`, `assignNullable`, `checkInAttendanceDemo`, `closeAttendanceDemoSession`, `commissionSnapshot`, `createCommissionDraft`, `createPlainQrToken`, `createStudentAttendanceJustification`, `createTeacherAcademicActivity`, `deactivateCommissionEnrollment`, `draftCode`, `ensureAttendanceDemo`, `getAdministrativeCommission`, `getAttendanceDemoState`, `getCommissionAttendanceState`, `getCommissionEnrollmentHistory`, `getCommissionEnrollments`, `getCommissionReadModel`, `getDb`, `getJustificationCommission`, `getStudentAttendanceHistory`, `getStudentCommissionAttendanceState`, `getTeacherActivity`, `getTeacherCommission`, `getTeacherCommissionAttendanceState`, `getUserByOpenId`, `gradeTeacherAcademicSubmission`, `hashQrToken`, `justificationStorageName`, `justificationView`, `listAdministrativeAttendanceJustifications`, `listAdministrativeCommissions`, `listStudentAttendanceJustifications`, `listStudentCommissions`, `listTeacherAcademicActivities`, `listTeacherActivitySubmissions`, `listTeacherAttendanceJustifications`, `listTeacherCommissions`, `openAttendanceDemoSession`, `openAttendanceSessionForCommission`, `openTeacherCommissionSession`, `optionalText`, `requireDb`, `reviewAttendanceJustification`, `safeStorageName`, `toIso`, `updateCommissionDraft`, `upsertUser` |
| `server/routers.ts` | Capa de servidor que implementa datos, reglas y endpoints del dominio académico. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `server/storage.ts` | Capa de servidor que implementa datos, reglas y endpoints del dominio académico. | `appendHashSuffix`, `getForgeConfig`, `normalizeKey`, `storageGet`, `storageGetSignedUrl`, `storagePut` |
| `shared/_core/errors.ts` | Tipos o errores compartidos de infraestructura entre cliente y servidor. | `BadRequestError`, `ForbiddenError`, `NotFoundError`, `UnauthorizedError` |
| `shared/activity-flow.ts` | Reglas y tipos del dominio compartidos entre la aplicación y el servidor. | `canAssignAcademicScore`, `isAcademicFileSizeAllowed`, `submissionReviewLabel` |
| `shared/attendance-flow.ts` | Reglas y tipos del dominio compartidos entre la aplicación y el servidor. | `attendanceCheckInOutcome`, `isQrWindowValid`, `qrExpirationFrom` |
| `shared/class-detail-flow.ts` | Reglas y tipos del dominio compartidos entre la aplicación y el servidor. | `classAttendanceStatus` |
| `shared/commission-flow.ts` | Reglas y tipos del dominio compartidos entre la aplicación y el servidor. | `canActivateCommission`, `commissionActivationRequirements` |
| `shared/const.ts` | Reglas y tipos del dominio compartidos entre la aplicación y el servidor. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `shared/enrollment-flow.ts` | Reglas y tipos del dominio compartidos entre la aplicación y el servidor. | `canDeactivateEnrollment` |
| `shared/justification-flow.ts` | Reglas y tipos del dominio compartidos entre la aplicación y el servidor. | `canReviewJustification`, `canSubmitJustification`, `toStudentJustificationStatus` |
| `shared/qr-scan-flow.ts` | Reglas y tipos del dominio compartidos entre la aplicación y el servidor. | `canProcessQrScan` |
| `shared/student-flow.ts` | Reglas y tipos del dominio compartidos entre la aplicación y el servidor. | `canViewStudentCommission` |
| `shared/teacher-flow.ts` | Reglas y tipos del dominio compartidos entre la aplicación y el servidor. | `canStartTeacherSession` |
| `shared/types.ts` | Reglas y tipos del dominio compartidos entre la aplicación y el servidor. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `tests/activity-flow.test.ts` | Prueba automatizada que protege un flujo o regla de negocio del proyecto. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `tests/attendance-flow.test.ts` | Prueba automatizada que protege un flujo o regla de negocio del proyecto. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `tests/auth.logout.test.ts` | Prueba automatizada que protege un flujo o regla de negocio del proyecto. | `createAuthContext` |
| `tests/brand.test.ts` | Prueba automatizada que protege un flujo o regla de negocio del proyecto. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `tests/class-detail-flow.test.ts` | Prueba automatizada que protege un flujo o regla de negocio del proyecto. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `tests/commission-flow.test.ts` | Prueba automatizada que protege un flujo o regla de negocio del proyecto. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `tests/enrollment-flow.test.ts` | Prueba automatizada que protege un flujo o regla de negocio del proyecto. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `tests/fortnight-agenda.test.ts` | Prueba automatizada que protege un flujo o regla de negocio del proyecto. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `tests/justification-flow.test.ts` | Prueba automatizada que protege un flujo o regla de negocio del proyecto. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `tests/navigation-integrity.test.ts` | Prueba automatizada que protege un flujo o regla de negocio del proyecto. | `source` |
| `tests/qr-scan-flow.test.ts` | Prueba automatizada que protege un flujo o regla de negocio del proyecto. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `tests/student-academic.test.ts` | Prueba automatizada que protege un flujo o regla de negocio del proyecto. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `tests/student-attendance.test.ts` | Prueba automatizada que protege un flujo o regla de negocio del proyecto. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `tests/student-class-demo.test.ts` | Prueba automatizada que protege un flujo o regla de negocio del proyecto. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `tests/student-flow.test.ts` | Prueba automatizada que protege un flujo o regla de negocio del proyecto. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |
| `tests/teacher-flow.test.ts` | Prueba automatizada que protege un flujo o regla de negocio del proyecto. | Sin funciones nombradas; contiene tipos, constantes, configuración o casos declarativos. |

## Alcance

Se documentaron archivos propios de las carpetas app, components, constants, hooks, lib, server, shared, drizzle, tests y scripts. Se excluyeron dependencias de terceros, artefactos generados y migraciones automáticas para preservar su mantenimiento por las herramientas correspondientes.
