let tableCounter = 5; // Initialize with 5 tables initially
const tablesContainer = document.getElementById('tables-container');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const exportDocxBtn = document.getElementById('exportDocxBtn');
const addTableBtn = document.getElementById('addTableBtn');
const removeTableBtn = document.getElementById('removeTableBtn');
const documentContent = document.getElementById('document-content');
const contextMenu = document.getElementById('contextMenu');
const applyToAllTablesBtn = document.getElementById('applyToAllTablesBtn');

let currentEditableElement = null; // To keep track of which element triggered the context menu
let globalCodeText = "Código";
let globalExecutionText = "Ejecución";

// Function to handle editable text behavior
function setupEditableText(element) {
    const defaultText = element.dataset.defaultText;

    element.addEventListener('focus', function() {
        if (this.textContent === defaultText) {
            this.textContent = '';
        }
    });

    element.addEventListener('blur', function() {
        if (this.textContent.trim() === '') {
            this.textContent = defaultText;
        }
    });
}

// Apply setupEditableText to the relevant elements
setupEditableText(document.querySelector('h1[contenteditable="true"]'));
setupEditableText(document.querySelector('p[contenteditable="true"]'));

// Function to handle image upload
function handleImageUpload(event) {
    const cell = event.currentTarget;

    // Prevent opening file dialog if the click is on an image or its controls
    if (event.target.closest('.image-wrapper')) {
        return;
    }

    // Only allow click if the cell has the class 'image-droppable-cell'
    if (!cell.classList.contains('image-droppable-cell')) {
        return;
    }

    const fileInput = cell.querySelector('input[type="file"]');
    
    // If already has an image and it's a single-image cell, don't open the selector
    if (cell.classList.contains('single-image-cell') && cell.querySelector('.image-wrapper')) {
        return;
    }

    fileInput.click(); // Simulate click on the file input
}

// Function to display the selected image
function displayImage(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const cell = event.target.closest('.table-cell');
    const isMultiImageCell = cell.classList.contains('multi-image-cell');
    const isSingleImageCell = cell.classList.contains('single-image-cell');

    // If it's a single-image cell and already has an image, ignore
    if (isSingleImageCell && cell.querySelector('.image-wrapper')) {
        return;
    }

    // Hide placeholder text
    const placeholder = cell.querySelector('.placeholder-text');
    if (placeholder) placeholder.style.display = 'none';

    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'image-wrapper relative w-full mb-2 group'; // Added group for hover effects

            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Imagen subida';
            img.className = 'w-full rounded-md'; // Default to full width of wrapper
            img.style.width = '100%'; // Default scale
            img.style.maxWidth = '100%'; // Default max-width

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.onclick = (e) => {
                e.stopPropagation(); // Prevent click from propagating to cell
                imageWrapper.remove();
                // If no images left, show placeholder again
                if (cell.querySelectorAll('.image-wrapper').length === 0 && placeholder) {
                    placeholder.style.display = 'block';
                }
            };

            const scaleControl = document.createElement('div');
            scaleControl.className = 'scale-control absolute bottom-0 left-0 right-0 bg-gray-700 bg-opacity-75 p-1 hidden group-hover:block rounded-b-md';
            const scalerInput = document.createElement('input');
            scalerInput.type = 'range';
            scalerInput.min = '10';
            scalerInput.max = '100';
            scalerInput.value = '100'; // Default to 100%
            scalerInput.className = 'w-full image-scaler';
            scalerInput.oninput = (e) => {
                e.stopPropagation(); // Stop propagation for slider input
                img.style.width = `${e.target.value}%`;
                img.style.maxWidth = `${e.target.value}%`; // Ensure max-width is also adjusted
            };
            scaleControl.appendChild(scalerInput);

            imageWrapper.appendChild(img);
            imageWrapper.appendChild(removeBtn);
            imageWrapper.appendChild(scaleControl);

            // Append the new image wrapper before the file input
            cell.insertBefore(imageWrapper, cell.querySelector('input[type="file"]'));
        };
        reader.readAsDataURL(file);
    });
}

// Function to create and append a new table section
function createTableSection(tableNum) {
    const section = document.createElement('div');
    section.className = 'table-container group'; // Added 'group' class for hover effects

    // Enunciado space
    const enunciado = document.createElement('p');
    enunciado.className = 'enunciado-space';
    enunciado.contentEditable = "true"; // Allow direct editing of the enunciado
    enunciado.textContent = `Enunciado para la Tabla ${tableNum}: [Haz clic para editar]`;
    enunciado.dataset.defaultText = `Enunciado para la Tabla ${tableNum}: [Haz clic para editar]`; // Save default text
    setupEditableText(enunciado); // Apply editable text behavior
    section.appendChild(enunciado);

    // Table
    const table = document.createElement('table');
    table.className = 'w-full border-collapse';
    table.innerHTML = `
        <tbody>
            <tr>
                <td class="table-cell p-2 header-cell" data-header-type="code" style="width: 50%;">
                    <p class="placeholder-text" contenteditable="true">${globalCodeText}</p>
                </td>
                <td class="table-cell p-2 header-cell" data-header-type="execution" style="width: 50%;">
                    <p class="placeholder-text" contenteditable="true">${globalExecutionText}</p>
                </td>
            </tr>
            <tr>
                <td class="table-cell p-2 image-droppable-cell multi-image-cell" style="width: 50%;">
                    <p class="placeholder-text">Haz clic o arrastra varias imágenes aquí</p>
                    <input type="file" accept="image/*" class="hidden" multiple>
                </td>
                <td class="table-cell p-2 image-droppable-cell multi-image-cell" style="width: 50%;">
                    <p class="placeholder-text">Haz clic o arrastra varias imágenes aquí</p>
                    <input type="file" accept="image/*" class="hidden" multiple>
                </td>
            </tr>
        </tbody>
    `;
    section.appendChild(table);

    // Add discreet row/column buttons
    const addRowBtnIcon = document.createElement('button');
    addRowBtnIcon.className = 'table-control-btn add-row-btn-icon';
    addRowBtnIcon.innerHTML = '+';
    addRowBtnIcon.title = 'Agregar Fila';
    addRowBtnIcon.onclick = (e) => { e.stopPropagation(); addRow(table); };
    section.appendChild(addRowBtnIcon);

    const removeRowBtnIcon = document.createElement('button');
    removeRowBtnIcon.className = 'table-control-btn remove-row-btn-icon';
    removeRowBtnIcon.innerHTML = '-';
    removeRowBtnIcon.title = 'Quitar Última Fila';
    removeRowBtnIcon.onclick = (e) => { e.stopPropagation(); removeRow(table); };
    section.appendChild(removeRowBtnIcon);

    const addColBtnIcon = document.createElement('button');
    addColBtnIcon.className = 'table-control-btn add-col-btn-icon';
    addColBtnIcon.innerHTML = '+';
    addColBtnIcon.title = 'Agregar Columna';
    addColBtnIcon.onclick = (e) => { e.stopPropagation(); addColumn(table); };
    section.appendChild(addColBtnIcon);

    const removeColBtnIcon = document.createElement('button');
    removeColBtnIcon.className = 'table-control-btn remove-col-btn-icon';
    removeColBtnIcon.innerHTML = '-';
    removeColBtnIcon.title = 'Quitar Última Columna';
    removeColBtnIcon.onclick = (e) => { e.stopPropagation(); removeColumn(table); };
    section.appendChild(removeColBtnIcon);


    tablesContainer.appendChild(section);

    // Add event listeners to the new image droppable cells
    section.querySelectorAll('.image-droppable-cell').forEach(cell => {
        const fileInput = cell.querySelector('input[type="file"]');
        cell.addEventListener('click', handleImageUpload);
        fileInput.addEventListener('change', displayImage);

        // Handle Drag and Drop
        setupDragAndDrop(cell);
    });

    // Add event listeners for header cells and enunciado for context menu
    section.querySelectorAll('.header-cell p[contenteditable="true"], .enunciado-space[contenteditable="true"]').forEach(editableElement => {
        setupEditableText(editableElement); // Apply default text behavior
        editableElement.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Prevent default browser context menu
            currentEditableElement = editableElement; // Store reference to the clicked element
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.top = `${e.pageY}px`;
        });
    });
}

// Function to add a new row to a specific table
function addRow(tableElement) {
    const newRow = tableElement.insertRow(-1); // Insert at the end
    const currentColumnCount = tableElement.rows[0].cells.length;
    const cellWidth = (100 / currentColumnCount) + '%';

    for (let i = 0; i < currentColumnCount; i++) {
        const newCell = newRow.insertCell(i);
        newCell.className = 'table-cell p-2 image-droppable-cell multi-image-cell';
        newCell.style.width = cellWidth;
        newCell.innerHTML = `
            <p class="placeholder-text">Haz clic o arrastra varias imágenes aquí</p>
            <input type="file" accept="image/*" class="hidden" multiple>
        `;
        const fileInput = newCell.querySelector('input[type="file"]');
        newCell.addEventListener('click', handleImageUpload);
        fileInput.addEventListener('change', displayImage);
        setupDragAndDrop(newCell); // Re-apply drag and drop listeners
    }
}

// Helper function to set up drag and drop for new cells
function setupDragAndDrop(cell) {
    cell.addEventListener('dragover', (e) => {
        e.preventDefault();
        cell.classList.add('border-blue-500', 'bg-blue-50');
    });
    cell.addEventListener('dragleave', (e) => {
        cell.classList.remove('border-blue-500', 'bg-blue-50');
    });
    cell.addEventListener('drop', (e) => {
        e.preventDefault();
        cell.classList.remove('border-blue-500', 'bg-blue-50');

        const files = e.dataTransfer.files;
        const isMultiImageCell = cell.classList.contains('multi-image-cell');
        const isSingleImageCell = cell.classList.contains('single-image-cell');

        if (isSingleImageCell && cell.querySelector('.image-wrapper')) {
            return;
        }

        const placeholder = cell.querySelector('.placeholder-text');
        if (placeholder) placeholder.style.display = 'none';

        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imageWrapper = document.createElement('div');
                    imageWrapper.className = 'image-wrapper relative w-full mb-2 group';

                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.alt = 'Imagen subida';
                    img.className = 'w-full rounded-md';
                    img.style.width = '100%';
                    img.style.maxWidth = '100%';

                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'remove-image-btn';
                    removeBtn.innerHTML = '&times;';
                    removeBtn.onclick = (e) => {
                        e.stopPropagation();
                        imageWrapper.remove();
                        if (cell.querySelectorAll('.image-wrapper').length === 0 && placeholder) {
                            placeholder.style.display = 'block';
                        }
                    };

                    const scaleControl = document.createElement('div');
                    scaleControl.className = 'scale-control absolute bottom-0 left-0 right-0 bg-gray-700 bg-opacity-75 p-1 hidden group-hover:block rounded-b-md';
                    const scalerInput = document.createElement('input');
                    scalerInput.type = 'range';
                    scalerInput.min = '10';
                    scalerInput.max = '100';
                    scalerInput.value = '100';
                    scalerInput.className = 'w-full image-scaler';
                    scalerInput.oninput = (e) => {
                        e.stopPropagation();
                        img.style.width = `${e.target.value}%`;
                        img.style.maxWidth = `${e.target.value}%`;
                    };
                    scaleControl.appendChild(scalerInput);

                    imageWrapper.appendChild(img);
                    imageWrapper.appendChild(removeBtn);
                    imageWrapper.appendChild(scaleControl);

                    cell.insertBefore(imageWrapper, cell.querySelector('input[type="file"]'));
                };
                reader.readAsDataURL(file);
            }
        });
    });
}

// Function to remove the last row from a specific table
function removeRow(tableElement) {
    if (tableElement.rows.length > 2) { // Keep header row and at least one content row
        tableElement.deleteRow(-1);
    }
}

// Function to add a new column to a specific table
function addColumn(tableElement) {
    const rows = tableElement.rows;
    if (rows.length === 0) return;

    const currentColumnCount = rows[0].cells.length;
    const newColumnCount = currentColumnCount + 1;
    const newCellWidth = (100 / newColumnCount) + '%';

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const newCell = row.insertCell(-1); // Add cell at the end

        // Update width for all cells in this row
        for (let j = 0; j < row.cells.length; j++) {
            row.cells[j].style.width = newCellWidth;
        }

        // Configure the new cell
        if (i === 0) { // Header row
            const headerType = `col${newColumnCount}`; // Simple naming for new columns
            newCell.className = 'table-cell p-2 header-cell';
            newCell.dataset.headerType = headerType;
            newCell.innerHTML = `<p class="placeholder-text" contenteditable="true">Columna ${newColumnCount}</p>`;
            setupEditableText(newCell.querySelector('p')); // Apply default text behavior
            // Add context menu listener for new header cell
            const headerP = newCell.querySelector('p');
            headerP.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                currentEditableElement = headerP;
                contextMenu.style.display = 'block';
                contextMenu.style.left = `${e.pageX}px`;
                contextMenu.style.top = `${e.pageY}px`;
            });
        } else { // Content rows
            newCell.className = 'table-cell p-2 image-droppable-cell multi-image-cell';
            newCell.innerHTML = `
                <p class="placeholder-text">Haz clic o arrastra varias imágenes aquí</p>
                <input type="file" accept="image/*" class="hidden" multiple>
            `;
            const fileInput = newCell.querySelector('input[type="file"]');
            newCell.addEventListener('click', handleImageUpload);
            fileInput.addEventListener('change', displayImage);
            setupDragAndDrop(newCell);
        }
    }
}

// Function to remove the last column from a specific table
function removeColumn(tableElement) {
    const rows = tableElement.rows;
    if (rows.length === 0) return;

    const currentColumnCount = rows[0].cells.length;
    if (currentColumnCount <= 2) { // Keep at least 2 columns
        return;
    }

    const newColumnCount = currentColumnCount - 1;
    const newCellWidth = (100 / newColumnCount) + '%';

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        row.deleteCell(-1); // Delete the last cell

        // Update width for remaining cells in this row
        for (let j = 0; j < row.cells.length; j++) {
            row.cells[j].style.width = newCellWidth;
        }
    }
}

// Generate the initial 5 tables
for (let i = 1; i <= tableCounter; i++) {
    createTableSection(i);
}

// Event listener for "Aplicar a todas las tablas" button in context menu
applyToAllTablesBtn.addEventListener('click', () => {
    if (currentEditableElement && currentEditableElement.closest('.header-cell')) {
        const newText = currentEditableElement.textContent;
        const headerType = currentEditableElement.closest('.header-cell').dataset.headerType;

        // Update global text only for "code" and "execution" headers
        if (headerType === 'code') {
            globalCodeText = newText;
        } else if (headerType === 'execution') {
            globalExecutionText = newText;
        }

        // Update all existing tables
        document.querySelectorAll('.table-container').forEach(section => {
            // Find the correct header cell based on data-header-type
            const targetHeaderCell = Array.from(section.querySelectorAll('.header-cell')).find(cell => cell.dataset.headerType === headerType);
            if (targetHeaderCell) {
                targetHeaderCell.querySelector('p').textContent = newText;
            }
        });
    }
    contextMenu.style.display = 'none'; // Hide context menu
});

// Handle context menu styling actions
contextMenu.addEventListener('click', (e) => {
    const targetItem = e.target.closest('.context-menu-item');
    if (!targetItem || !currentEditableElement) return;

    const action = targetItem.dataset.action;
    const value = targetItem.dataset.value;

    if (action && value) {
        switch (action) {
            case 'fontSize':
                currentEditableElement.style.fontSize = value;
                break;
            case 'fontFamily':
                currentEditableElement.style.fontFamily = value;
                break;
            case 'textColor':
                currentEditableElement.style.color = value;
                break;
            case 'bgColor':
                currentEditableElement.style.backgroundColor = value;
                break;
        }
        contextMenu.style.display = 'none';
    }
});


// Hide context menu if clicked anywhere else
document.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target) && e.target !== currentEditableElement) {
        contextMenu.style.display = 'none';
    }
});


// Function to add a new table
addTableBtn.addEventListener('click', () => {
    tableCounter++;
    createTableSection(tableCounter);
    // Scroll to the new table
    tablesContainer.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
});

// Function to remove the last table
removeTableBtn.addEventListener('click', () => {
    if (tablesContainer.children.length > 0) {
        tablesContainer.removeChild(tablesContainer.lastElementChild);
        tableCounter--;
    }
});


// Function to export to DOCX
async function exportToDocx() {
    // Disable button and show loading message
    exportDocxBtn.disabled = true;
    const originalDocxButtonText = exportDocxBtn.textContent;
    exportDocxBtn.textContent = 'Generando DOCX...';

    // Use a BOM for UTF-8 encoding
    const BOM = "\uFEFF"; 

    let docxContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="utf-8">
            <title>Documento</title>
            <style>
                body { font-family: sans-serif; }
                table { border-collapse: collapse; width: 100%; table-layout: fixed; }
                td { padding: 8px; vertical-align: top; word-wrap: break-word; }
                img { max-width: 100%; height: auto; display: block; }
            </style>
        </head>
        <body>
            <h1 style="text-align: center; font-size: ${document.querySelector('h1[contenteditable="true"]').style.fontSize || '32px'}; font-family: ${document.querySelector('h1[contenteditable="true"]').style.fontFamily || 'sans-serif'}; color: ${document.querySelector('h1[contenteditable="true"]').style.color || '#1f2937'}; background-color: ${document.querySelector('h1[contenteditable="true"]').style.backgroundColor || 'transparent'};">${document.querySelector('h1[contenteditable="true"]').textContent}</h1>
            <p style="text-align: center; font-size: ${document.querySelector('p[contenteditable="true"]').style.fontSize || '16px'}; font-family: ${document.querySelector('p[contenteditable="true"]').style.fontFamily || 'sans-serif'}; color: ${document.querySelector('p[contenteditable="true"]').style.color || '#6b7280'}; background-color: ${document.querySelector('p[contenteditable="true"]').style.backgroundColor || 'transparent'};">${document.querySelector('p[contenteditable="true"]').textContent}</p>
    `;

    const getImageDimensions = (src) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = () => resolve({ width: 0, height: 0 }); // Fallback
            img.src = src;
        });
    };
    
    // --- CAMBIO: Constantes para el control de tamaño ---
    const PIXELS_PER_CM = 37.8; // Standard conversion for 96 DPI
    const MAX_ROW_WIDTH_CM = 15;
    const TARGET_ROW_WIDTH_CM = 12; // Target width if row is too wide
    const MAX_COL_HEIGHT_CM = 20;

    for (const section of document.querySelectorAll('.table-container')) {
        const enunciadoElement = section.querySelector('.enunciado-space');
        const enunciadoText = enunciadoElement.textContent;
        const enunciadoFontSize = enunciadoElement.style.fontSize || '0.875rem';
        const enunciadoFontFamily = enunciadoElement.style.fontFamily || 'Inter, sans-serif';
        const enunciadoColor = enunciadoElement.style.color || '#3b82f6';
        const enunciadoBgColor = enunciadoElement.style.backgroundColor || '#eff6ff';

        docxContent += `<p style="margin-top: 20px; margin-bottom: 10px; font-style: italic; font-size: ${enunciadoFontSize}; font-family: ${enunciadoFontFamily}; color: ${enunciadoColor}; background-color: ${enunciadoBgColor};">${enunciadoText}</p>`;
        docxContent += `<table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; table-layout: fixed;"><tbody>`;

        const rows = section.querySelectorAll('table tbody tr');
        const numCols = rows.length > 0 ? rows[0].cells.length : 0;
        
        const imagesData = [];

        // --- CAMBIO: Fase 1 - Recopilar datos de imágenes ---
        for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) { // Start at 1 to skip header
            const cells = rows[rowIndex].querySelectorAll('td');
            for (let colIndex = 0; colIndex < cells.length; colIndex++) {
                const images = cells[colIndex].querySelectorAll('.image-wrapper img');
                for (const imgElement of images) {
                    const scaleMatch = imgElement.style.width.match(/(\d+)%/);
                    const scale = scaleMatch ? parseFloat(scaleMatch[1]) / 100 : 1;
                    const dimensions = await getImageDimensions(imgElement.src);
                    
                    if (dimensions.width > 0) {
                        imagesData.push({
                            row: rowIndex,
                            col: colIndex,
                            imgElement: imgElement,
                            aspectRatio: dimensions.width / dimensions.height,
                            finalWidthCm: ((dimensions.width * scale) / PIXELS_PER_CM),
                            finalHeightCm: ((dimensions.height * scale) / PIXELS_PER_CM)
                        });
                    }
                }
            }
        }

        // --- CAMBIO: Fase 2 - Aplicar restricciones de ancho por fila ---
        for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
            const imagesInRow = imagesData.filter(img => img.row === rowIndex);
            if (imagesInRow.length === 0) continue;

            const totalRowWidthCm = imagesInRow.reduce((sum, img) => sum + img.finalWidthCm, 0);

            if (totalRowWidthCm > MAX_ROW_WIDTH_CM) {
                const scalingFactor = TARGET_ROW_WIDTH_CM / totalRowWidthCm;
                imagesInRow.forEach(img => {
                    img.finalWidthCm *= scalingFactor;
                    img.finalHeightCm *= scalingFactor;
                });
            }
        }

        // --- CAMBIO: Fase 3 - Aplicar restricciones de alto por columna ---
        for (let colIndex = 0; colIndex < numCols; colIndex++) {
            const imagesInCol = imagesData.filter(img => img.col === colIndex);
            if (imagesInCol.length === 0) continue;

            const totalColHeightCm = imagesInCol.reduce((sum, img) => sum + img.finalHeightCm, 0);

            if (totalColHeightCm > MAX_COL_HEIGHT_CM) {
                const scalingFactor = MAX_COL_HEIGHT_CM / totalColHeightCm;
                imagesInCol.forEach(img => {
                    img.finalHeightCm *= scalingFactor;
                    img.finalWidthCm = img.finalHeightCm * img.aspectRatio; // Recalculate width
                });
            }
        }

        // --- CAMBIO: Fase 4 - Generar contenido DOCX con tamaños ajustados ---
        rows.forEach((row, rowIndex) => {
            docxContent += `<tr>`;
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, cellIndex) => {
                const contentElement = cell.querySelector('p[contenteditable="true"]') || cell.querySelector('.placeholder-text');
                let cellText = contentElement ? contentElement.textContent : '';
                const cellFontSize = contentElement ? (contentElement.style.fontSize || '0.875rem') : '0.875rem';
                const cellFontFamily = contentElement ? (contentElement.style.fontFamily || 'sans-serif') : 'sans-serif';
                const cellColor = contentElement ? (contentElement.style.color || '#6b7280') : '#6b7280';
                const cellBgColor = contentElement ? (contentElement.style.backgroundColor || 'white') : 'white';
                
                docxContent += `<td style="width: ${cell.style.width || '50%'}; padding: 8px; vertical-align: top; font-size: ${cellFontSize}; font-family: ${cellFontFamily}; color: ${cellColor}; background-color: ${cellBgColor};">`;
                
                if (rowIndex === 0) {
                    docxContent += `<p><strong>${cellText}</strong></p>`;
                } else {
                    const images = imagesData.filter(img => img.row === rowIndex && img.col === cellIndex);
                    if (images.length > 0) {
                        images.forEach(imgData => {
                            const finalWidthPx = imgData.finalWidthCm * PIXELS_PER_CM;
                            const finalHeightPx = imgData.finalHeightCm * PIXELS_PER_CM;
                            docxContent += `<img src="${imgData.imgElement.src}" style="width:${finalWidthPx}px; height:${finalHeightPx}px; display: block; margin-bottom: 5px;" />`;
                        });
                    } else {
                        docxContent += `<p>${cellText}</p>`;
                    }
                }
                docxContent += `</td>`;
            });
            docxContent += `</tr>`;
        });
        docxContent += `</tbody></table>`;
    }

    docxContent += `</body></html>`;

    const blob = new Blob([BOM + docxContent], { type: 'application/msword;charset=utf-8' });
    if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, 'documento_con_tablas.doc');
    } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'documento_con_tablas.doc';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    exportDocxBtn.disabled = false;
    exportDocxBtn.textContent = originalDocxButtonText;
}


// Handle PDF export
document.getElementById('exportPdfBtn').addEventListener('click', () => {
    exportPdfBtn.disabled = true;
    const originalPdfButtonText = exportPdfBtn.textContent;
    exportPdfBtn.textContent = 'Generando PDF...';

    document.querySelectorAll('.hide-for-pdf-buttons button').forEach(btn => {
        btn.classList.add('hide-for-pdf');
    });

    const originalStyles = [];
    document.querySelectorAll('h1, p, .enunciado-space').forEach(el => {
        originalStyles.push({ el, color: el.style.color, backgroundColor: el.style.backgroundColor });
        el.style.backgroundColor = '#ffffff';
        el.style.color = '#1f2937';
    });

    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#ffffff';

    window.scrollTo(0, 0);

    setTimeout(() => {
        // --- CAMBIO: Lógica para insertar saltos de página ---
        const A4_PAGE_HEIGHT_PX = 1050; // Approx. height in pixels for A4 portrait minus margins
        const headerHeight = document.querySelector('h1').offsetHeight + document.querySelector('p[contenteditable="true"]').offsetHeight;
        let currentPageHeight = headerHeight;

        // Remove old page breaks before recalculating
        document.querySelectorAll('.html2pdf__page-break').forEach(pb => pb.remove());

        const tableContainers = document.querySelectorAll('#tables-container .table-container');
        tableContainers.forEach((container, index) => {
            const containerHeight = container.offsetHeight;
            if (index > 0 && currentPageHeight + containerHeight > A4_PAGE_HEIGHT_PX) {
                // Insert a page-break element before this container
                container.insertAdjacentHTML('beforebegin', '<div class="html2pdf__page-break" style="page-break-before: always;"></div>');
                currentPageHeight = containerHeight; // Reset height for the new page
            } else {
                currentPageHeight += containerHeight;
            }
        });

        const options = {
            margin: 10,
            filename: 'documento_con_tablas_e_imagenes.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, logging: true, useCORS: true, allowTaint: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            // Tell html2pdf to respect our manually added page breaks
            pagebreak: { mode: ['css', 'legacy'], before: '.html2pdf__page-break' }
        };

        html2pdf().set(options).from(documentContent).save().finally(() => {
            // This block runs whether the promise is resolved or rejected
            exportPdfBtn.disabled = false;
            exportPdfBtn.textContent = originalPdfButtonText;
            document.querySelectorAll('.hide-for-pdf-buttons button').forEach(btn => {
                btn.classList.remove('hide-for-pdf');
            });
            
            document.body.style.backgroundColor = originalBodyBg;
            originalStyles.forEach(item => {
                item.el.style.color = item.color;
                item.el.style.backgroundColor = item.backgroundColor;
            });

            // Clean up the added page-break elements
            document.querySelectorAll('.html2pdf__page-break').forEach(pb => pb.remove());
        });
    }, 500);
});

document.getElementById('exportDocxBtn').addEventListener('click', exportToDocx);