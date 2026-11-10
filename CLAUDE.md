# CLAUDE.md — Legaltech (raíz compartida)

Este archivo aplica a todos los repos bajo esta carpeta. Antes de proponer cambios,
lee [DOCUMENTO-MAESTRO.md](DOCUMENTO-MAESTRO.md): es la fuente única de visión,
alcance y decisiones.

## Resumen para cualquier sesión

- **Misión**: plataforma de consulta jurídica y apoyo jurídico virtual para todos los abogados (jueces, fiscales, inspectores, litigantes, defensores, conciliadores, etc.).
- **Producto fundamental**: oficina virtual. Pantalla de inicio "Mi día". El derecho es un módulo vertical, no el núcleo.
- **Repos actuales** = prototipos materializados de ideas. Pueden reescribirse o descartarse si sirven al núcleo.
- **Piloto**: un inspector de policía, una oficina, uso diario como métrica principal.

## Reglas que aplican a todos los repos

1. Ningún dato real de ciudadanos ni expedientes en Git. Ejemplos ficticios.
2. Ningún secreto, contraseña ni API key en archivos versionados. Reportar solo archivo y nombre de variable.
3. Todo texto normativo tiene estado de validación visible. No presentar como vigente lo "pendiente de validación" (ver `VALIDACION-JURIDICA-PENDIENTE.md`).
4. No push directo a `main` ni `develop` compartidos: rama feature + PR.
5. Código de otros autores: extender o marcar `@Deprecated` con razón; no borrar ni renombrar sin acuerdo.
6. Contenido en español jurídico; identificadores de código en inglés.
7. Antes de agregar un módulo nuevo, comprobar si pertenece al núcleo (ver sección 4 del documento maestro) o a una vertical (sección 5).

## Dónde mirar

| Pregunta | Fuente |
|---|---|
| ¿Por qué existe esto? | `DOCUMENTO-MAESTRO.md` §1–2 |
| ¿Qué construir primero? | `DOCUMENTO-MAESTRO.md` §4 y §10 |
| ¿Qué falta validar jurídicamente? | `legaltech-inspecciones/VALIDACION-JURIDICA-PENDIENTE.md` |
| ¿Cómo arrancar el entorno en otro PC? | `okf-bundles/HANDOFF.md` |
| ¿Qué decisiones siguen abiertas? | `DOCUMENTO-MAESTRO.md` §11 |
