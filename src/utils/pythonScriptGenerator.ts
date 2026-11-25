import { LabelConfig } from '../types';

export function generatePythonScript(config: LabelConfig): string {
  const isLandscape = config.pageOrientation === 'landscape';
  const widthCm = isLandscape ? config.pageHeightCm : config.pageWidthCm;
  const heightCm = isLandscape ? config.pageWidthCm : config.pageHeightCm;
  const labelsPerPage = config.rows * config.cols;

  return `"""
Generador de Etiquetas en PowerPoint (.pptx)
Convertido desde ReportLab PDF a python-pptx
Requisitos: pip install python-pptx Pillow
"""

import os
from pptx import Presentation
from pptx.util import Cm, Pt
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor

# === CONFIGURACIÓN ===
directorio_actual = os.path.dirname(os.path.abspath(__file__))
imagen_logo = os.path.join(directorio_actual, "${config.logoFileName || 'logo1.jpg'}")
pptx_nombre = os.path.join(directorio_actual, "etiquetas_sicosa.pptx")

# Solicitar número de inicio al usuario
try:
    inicio_numero = int(input("¿De qué número deseas comenzar el conteo? [Default: ${config.startNumber}]: ") or "${config.startNumber}")
except ValueError:
    print("❌ Error: Debes ingresar un número válido. Usando ${config.startNumber} por defecto.")
    inicio_numero = ${config.startNumber}

try:
    total_logos = int(input("¿Total de etiquetas a generar? [Default: ${config.totalLabels}]: ") or "${config.totalLabels}")
except ValueError:
    total_logos = ${config.totalLabels}

filas = ${config.rows}
columnas = ${config.cols}
logos_por_pagina = filas * columnas

# Configuración de página: ${isLandscape ? 'Horizontal' : 'Vertical'} Carta (${widthCm} cm × ${heightCm} cm)
ancho_pagina = ${widthCm}
alto_pagina = ${heightCm}

# Dimensiones fijas de cada etiqueta (en cm)
ancho_logo = ${config.labelWidthCm}
alto_logo = ${config.labelHeightCm}

# Áreas específicas para imagen y texto
alto_imagen = ${config.imageHeightCm}  # Altura fija para la imagen
alto_texto = alto_logo - alto_imagen  # ${Number((config.labelHeightCm - config.imageHeightCm).toFixed(2))} cm para el área de texto

# Márgenes fijos (en cm)
margen_izq = ${config.marginLeftCm}
margen_der = ${config.marginRightCm}
margen_sup = ${config.marginTopCm}
margen_inf = ${config.marginBottomCm}

# Espaciado entre etiquetas (en cm)
espaciado_x = ${config.spacingXCm}
espaciado_y = ${config.spacingYCm}

# Tamaño y estilo de fuente
tamano_fuente = ${config.fontSizePt}
fuente_nombre = "${config.fontFamily || 'Arial'}"
es_negrita = ${config.fontBold ? 'True' : 'False'}
prefijo = "${config.prefix || ''}"
sufijo = "${config.suffix || ''}"
relleno_ceros = ${config.padZeros}

# Colores (R, G, B)
COLOR_TEXTO = RGBColor(0, 0, 0)
COLOR_BORDE = RGBColor(0, 0, 0)
COLOR_FONDO = RGBColor(255, 255, 255)

# Verificar espacio
ancho_total = columnas * ancho_logo + (columnas - 1) * espaciado_x
alto_total = filas * alto_logo + (filas - 1) * espaciado_y
ancho_disponible = ancho_pagina - margen_izq - margen_der
alto_disponible = alto_pagina - margen_sup - margen_inf

if ancho_total > ancho_disponible + 0.01 or alto_total > alto_disponible + 0.01:
    print("⚠️ ADVERTENCIA: Las etiquetas sobrepasan las dimensiones disponibles de la página.")
    print(f"Ancho requerido: {ancho_total:.2f} cm | Disponible: {ancho_disponible:.2f} cm")
    print(f"Alto requerido: {alto_total:.2f} cm | Disponible: {alto_disponible:.2f} cm")

# === CREAR PRESENTACIÓN PPTX ===
prs = Presentation()
prs.slide_width = Cm(ancho_pagina)
prs.slide_height = Cm(alto_pagina)

# Usar diseño en blanco (índice 6 en plantillas estándar)
blank_slide_layout = prs.slide_layouts[6]

numero_actual = inicio_numero
total_paginas = (total_logos + logos_por_pagina - 1) // logos_por_pagina

print(f"\\n🚀 Generando {total_logos} etiquetas en presentación PowerPoint (.pptx)...")

for pagina in range(total_paginas):
    slide = prs.slides.add_slide(blank_slide_layout)
    
    for fila in range(filas):
        for col in range(columnas):
            if numero_actual > inicio_numero + total_logos - 1:
                break

            # Calcular coordenadas (x, y) en cm
            x_cm = margen_izq + col * (ancho_logo + espaciado_x)
            y_cm = margen_sup + fila * (alto_logo + espaciado_y)

            # 1. Dibujar rectángulo de fondo y borde
            rect = slide.shapes.add_shape(
                MSO_SHAPE.RECTANGLE,
                Cm(x_cm), Cm(y_cm),
                Cm(ancho_logo), Cm(alto_logo)
            )
            rect.fill.solid()
            rect.fill.fore_color.rgb = COLOR_FONDO
            ${config.showBorder ? `rect.line.color.rgb = COLOR_BORDE
            rect.line.width = Pt(${config.borderWidthPt || 0.8})` : `rect.line.fill.background()`}

            # 2. Insertar logo si existe el archivo
            if os.path.exists(imagen_logo) and alto_imagen > 0:
                try:
                    # Inserción de imagen ajustada dentro del área superior
                    slide.shapes.add_picture(
                        imagen_logo,
                        Cm(x_cm + 0.05),
                        Cm(y_cm + 0.05),
                        width=Cm(ancho_logo - 0.1),
                        height=Cm(alto_imagen - 0.05)
                    )
                except Exception as e:
                    print(f"Error al insertar logo: {e}")

            # 3. Insertar cuadro de texto para el número
            y_texto_cm = y_cm + alto_imagen
            tx_box = slide.shapes.add_textbox(
                Cm(x_cm),
                Cm(y_texto_cm),
                Cm(ancho_logo),
                Cm(alto_texto)
            )
            tf = tx_box.text_frame
            tf.word_wrap = False
            tf.vertical_anchor = MSO_ANCHOR.MIDDLE
            tf.margin_left = 0
            tf.margin_right = 0
            tf.margin_top = 0
            tf.margin_bottom = 0

            # Formatear texto
            num_str = str(numero_actual)
            if relleno_ceros > 0:
                num_str = num_str.zfill(relleno_ceros)
            texto_final = f"{prefijo}{num_str}{sufijo}"

            p = tf.paragraphs[0]
            p.text = texto_final
            p.alignment = PP_ALIGN.CENTER
            p.font.name = fuente_nombre
            p.font.size = Pt(tamano_fuente)
            p.font.bold = es_negrita
            p.font.color.rgb = COLOR_TEXTO

            numero_actual += 1

# Guardar archivo .pptx
prs.save(pptx_nombre)

# === INFORMACIÓN DETALLADA ===
print("=" * 60)
print(f"✅ Archivo PowerPoint (.pptx) creado con éxito: {pptx_nombre}")
print(f"📄 Numeración: {inicio_numero} al {inicio_numero + total_logos - 1}")
print(f"📊 Distribución: {filas} filas × {columnas} columnas = {logos_por_pagina} etiquetas por diapositiva")
print(f"📐 Tamaño etiqueta: {ancho_logo} cm × {alto_logo} cm (Imagen: {alto_imagen} cm | Texto: {alto_texto:.2f} cm)")
print(f"🔠 Tipografía: {fuente_nombre} {tamano_fuente}pt (Negrita: {es_negrita})")
print(f"📦 Total de diapositivas generadas: {total_paginas}")
print("=" * 60)
`;
}
