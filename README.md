# EasyTable: Generador de Documentos Dinámicos con Tablas e Imágenes

**EasyTable** es una herramienta basada en la web que permite a los usuarios crear, editar y exportar documentos que contienen tablas dinámicas con contenido de texto e imágenes. Está diseñada para ser fácil de usar, permitiendo una rápida generación de documentos con tablas personalizables.

## Tabla de Contenidos

* [Características](#características)
* [Tecnologías Utilizadas](#tecnologías-utilizadas)
* [Configuración e Instalación](#configuración-e-instalación)
* [Uso](#uso)

  * [Añadir/Eliminar Tablas](#añadireliminar-tablas)
  * [Edición de Texto](#edición-de-texto)
  * [Carga y Gestión de Imágenes](#carga-y-gestión-de-imágenes)
  * [Control de Estructura de Tabla](#control-de-estructura-de-tabla)
  * [Personalización del Menú Contextual](#personalización-del-menú-contextual)
  * [Exportación de Documentos](#exportación-de-documentos)
* [Estructura de Archivos](#estructura-de-archivos)
* [Resumen del Código](#resumen-del-código)

  * [index.html](#indexhtml)
  * [style.css](#stylecss)
  * [script.js](#scriptjs)
* [Contribuciones](#contribuciones)
* [Licencia](#licencia)

## Características

* **Generación Dinámica de Tablas**: Añade y elimina tablas según sea necesario.
* **Contenido Editable**: Todos los campos de texto son directamente editables.
* **Carga de Imágenes**: Clic y arrastrar para agregar imágenes a las celdas.
* **Escalado de Imágenes**: Ajuste de tamaño mediante deslizador.
* **Menú Contextual para Estilos**: Cambios de fuente, tamaño, color, etc.
* **Actualización Global del Texto del Encabezado**.
* **Gestión Dinámica de Filas y Columnas**.
* **Exportación a PDF y DOCX**.
* **Diseño Responsivo con Tailwind CSS**.

## Tecnologías Utilizadas

* **HTML5**: Estructura
* **CSS3**: Estilos (incluye Tailwind CSS)
* **JavaScript**: Lógica e interactividad
* **html2pdf.js**: Generación de PDF
* **API FileReader**: Carga de imágenes

## Configuración e Instalación

```bash
git clone https://github.com/tu-usuario/EasyTable.git
cd EasyTable
```

> Reemplaza `tu-usuario` con tu nombre de GitHub.

Crea los archivos:

* `index.html`
* `style.css`
* `script.js`

Pega el código correspondiente en cada archivo.

Abre `index.html` directamente en tu navegador.

## Uso

### Añadir/Eliminar Tablas

* **Agregar Tabla**: Botón para insertar nueva sección de tabla.
* **Quitar Última Tabla**: Elimina la tabla más reciente.

### Edición de Texto

* Haz clic sobre cualquier texto para editarlo.
* Presiona Enter/Tab o haz clic fuera para guardar.
* Texto de marcador aparece si queda vacío.

### Carga y Gestión de Imágenes

* **Clic para Cargar**: En celdas que digan "Haz clic o arrastra...".
* **Arrastrar y Soltar**: Desde tu PC directamente a la celda.
* **Multi-imagen**: Algunas celdas soportan varias imágenes.
* **Escalar Imagen**: Deslizador visible al pasar el ratón.
* **Eliminar Imagen**: Botón "×" en la esquina superior.

### Control de Estructura de Tabla

* Botones discretos visibles al pasar el ratón:

  * `+`/− filas en esquina inferior izquierda.
  * `+`/− columnas en esquina superior derecha.

### Personalización del Menú Contextual

Haz clic derecho en texto editable para cambiar:

* **Tamaño de Fuente**: Pequeño, Mediano, Grande
* **Tipo de Fuente**: Sans, Serif, Monospace
* **Color de Texto**: Negro, Rojo, Azul, Verde
* **Color de Fondo**: Blanco, Amarillo, Azul claro, Verde claro
* **Aplicar a todas las tablas**: Para encabezados comunes

### Exportación de Documentos

* **PDF**: Oculta botones, limpia colores y descarga.
* **DOCX**: Conserva estilo, caracteres especiales y descarga.

## Estructura de Archivos

```
EasyTable/
├── index.html
├── style.css
└── script.js
```

## Resumen del Código

### index.html

Define la estructura de la página. Incluye:

* `<!DOCTYPE html>`
* `<html lang="es">`
* Metaetiquetas de codificación y viewport
* Título y enlaces a Tailwind, html2pdf.js y archivos locales
* Contenedor principal, botones de acción, menú contextual, scripts

### style.css

Define estilos globales y específicos:

* Apariencia general (body, .container)
* Estilos de tabla y celdas
* Gestión de imágenes (escalado, eliminación)
* Estilos del menú contextual
* Estilos de exportación a PDF

### script.js

Toda la lógica interactiva:

* Variables globales
* `setupEditableText`: Marcadores de texto
* `handleImageUpload`: Carga de imágenes
* `displayImage`: Renderiza imagen con controles
* `createTableSection`: Genera tabla completa
* `addRow` / `removeRow`
* `addColumn` / `removeColumn`
* `setupDragAndDrop`
* `exportToDocx` / `exportPdfBtn`: Exportaciones
* Eventos para botones, menú contextual, clic global

## Contribuciones

¡Las contribuciones son bienvenidas! Abre un issue o envía un pull request si tienes ideas, mejoras o correcciones.

