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
                /* Estilos básicos para Word */
                body { font-family: sans-serif; }
                table { border-collapse: collapse; width: 100%; table-layout: fixed; }
                td { padding: 8px; vertical-align: top; word-wrap: break-word; } /* Ensure text wraps */
                img { max-width: 100%; height: auto; display: block; } /* Crucial for image sizing in Word */
            </style>
        </head>
        <body>
            <h1 style="text-align: center; font-size: ${document.querySelector('h1[contenteditable="true"]').style.fontSize || '32px'}; font-family: ${document.querySelector('h1[contenteditable="true"]').style.fontFamily || 'sans-serif'}; color: ${document.querySelector('h1[contenteditable="true"]').style.color || '#1f2937'}; background-color: ${document.querySelector('h1[contenteditable="true"]').style.backgroundColor || 'transparent'};">${document.querySelector('h1[contenteditable="true"]').textContent}</h1>
            <p style="text-align: center; font-size: ${document.querySelector('p[contenteditable="true"]').style.fontSize || '16px'}; font-family: ${document.querySelector('p[contenteditable="true"]').style.fontFamily || 'sans-serif'}; color: ${document.querySelector('p[contenteditable="true"]').style.color || '#6b7280'}; background-color: ${document.querySelector('p[contenteditable="true"]').style.backgroundColor || 'transparent'};">${document.querySelector('p[contenteditable="true"]').textContent}</p>
    `;

    // Function to get image dimensions
    const getImageDimensions = (src) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = () => resolve({ width: 0, height: 0 }); // Fallback
            img.src = src;
        });
    };

    // Constants for conversion (assuming 96 DPI for web pixels to cm)
    const PIXELS_PER_CM = 96 / 2.54; // 96 pixels per inch, 2.54 cm per inch

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
        
        // Data structure to hold image information for calculations
        const imagesData = []; // [{ row, col, imgElement, originalWidth, originalHeight, scale, effectiveWidthCm, effectiveHeightCm }]

        // First pass: Collect all image data
        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            if (rowIndex === 0) continue; // Skip header row for image processing
            const row = rows[rowIndex];
            const cells = row.querySelectorAll('td');
            for (let colIndex = 0; colIndex < cells.length; colIndex++) {
                const cell = cells[colIndex];
                const images = cell.querySelectorAll('.image-wrapper img');
                for (const imgElement of images) {
                    const scaleMatch = imgElement.style.width.match(/(\d+)%/);
                    const scale = scaleMatch ? parseFloat(scaleMatch[1]) / 100 : 1; // Get user's scale, default to 1 (100%)

                    const dimensions = await getImageDimensions(imgElement.src);
                    
                    imagesData.push({
                        row: rowIndex,
                        col: colIndex,
                        imgElement: imgElement,
                        originalWidth: dimensions.width,
                        originalHeight: dimensions.height,
                        scale: scale,
                        effectiveWidthCm: (dimensions.width * scale) / PIXELS_PER_CM,
                        effectiveHeightCm: (dimensions.height * scale) / PIXELS_PER_CM
                    });
                }
            }
        }

        // Apply width constraints per row (excluding header row)
        for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
            let totalRowWidthCm = 0;
            const imagesInRow = imagesData.filter(img => img.row === rowIndex);

            imagesInRow.forEach(img => {
                totalRowWidthCm += img.effectiveWidthCm;
            });

            const MAX_ROW_WIDTH_CM = 15;
            if (totalRowWidthCm > MAX_ROW_WIDTH_CM && imagesInRow.length > 0) {
                const scalingFactor = MAX_ROW_WIDTH_CM / totalRowWidthCm;
                imagesInRow.forEach(img => {
                    img.effectiveWidthCm *= scalingFactor;
                    img.effectiveHeightCm *= scalingFactor; // Maintain aspect ratio
                });
            }
        }

        // Apply height constraints per column (excluding header row)
        for (let colIndex = 0; colIndex < numCols; colIndex++) {
            let totalColHeightCm = 0;
            const imagesInCol = imagesData.filter(img => img.col === colIndex && img.row !== 0);

            imagesInCol.forEach(img => {
                totalColHeightCm += img.effectiveHeightCm;
            });

            const MAX_COL_HEIGHT_CM = 25;
            if (totalColHeightCm > MAX_COL_HEIGHT_CM && imagesInCol.length > 0) {
                const scalingFactor = MAX_COL_HEIGHT_CM / totalColHeightCm;
                imagesInCol.forEach(img => {
                    img.effectiveWidthCm *= scalingFactor;
                    img.effectiveHeightCm *= scalingFactor; // Maintain aspect ratio
                });
            }
        }

        // Second pass: Generate DOCX content with adjusted image sizes
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
                
                // Add header text for the first row
                if (rowIndex === 0) {
                    docxContent += `<p><strong>${cellText}</strong></p>`;
                } else {
                    // For image cells
                    const images = imagesData.filter(img => img.row === rowIndex && img.col === cellIndex);
                    if (images.length > 0) {
                        images.forEach(imgData => {
                            // Convert back from cm to pixels (or use cm directly in style if Word supports it well, but pixels are more consistent with web origins)
                            // Word often prefers explicit pixel dimensions or percentage relative to containing element.
                            // Here, we convert cm back to pixels and apply as width/height in px.
                            const finalWidthPx = imgData.effectiveWidthCm * PIXELS_PER_CM;
                            const finalHeightPx = imgData.effectiveHeightCm * PIXELS_PER_CM;

                            docxContent += `<img src="${imgData.imgElement.src}" style="width: ${finalWidthPx}px; height: ${finalHeightPx}px; max-width: ${finalWidthPx}px; display: block; margin-bottom: 5px;" />`;
                        });
                    } else {
                        docxContent += `<p>${cellText}</p>`; // If no images, show placeholder text
                    }
                }
                docxContent += `</td>`;
            });
            docxContent += `</tr>`;
        });
        docxContent += `</tbody></table>`;
    }

    docxContent += `</body></html>`;

    // Create a Blob with UTF-8 encoding and the BOM
    const blob = new Blob([BOM + docxContent], { type: 'application/msword;charset=utf-8' });

    if (navigator.msSaveOrOpenBlob) { // IE10+
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
    // Disable button and show loading message
    exportPdfBtn.disabled = true;
    const originalPdfButtonText = exportPdfBtn.textContent;
    exportPdfBtn.textContent = 'Generando PDF...';

    // Hide export buttons during PDF generation
    document.querySelectorAll('.hide-for-pdf-buttons button').forEach(btn => {
        btn.classList.add('hide-for-pdf');
    });

    // Save original background colors and styles
    const originalBodyBg = document.body.style.backgroundColor;
    const originalTableContainerBgs = [];
    const originalEnunciadoStyles = []; // Store all relevant styles for enunciado

    document.querySelectorAll('.table-container').forEach(el => {
        originalTableContainerBgs.push(el.style.backgroundColor);
        el.style.backgroundColor = '#ffffff'; // Set to white for export
    });

    document.querySelectorAll('.enunciado-space').forEach(el => {
        originalEnunciadoStyles.push({
            backgroundColor: el.style.backgroundColor,
            color: el.style.color,
            border: el.style.border,
            fontSize: el.style.fontSize,
            fontFamily: el.style.fontFamily
        });
        el.style.backgroundColor = '#ffffff'; // Set to white for export
        el.style.color = '#1f2937'; // Change text color to dark if background is white
        el.style.border = 'none'; // Remove border if not desired in PDF
    });

    // Also handle top H1 and P
    const h1Element = document.querySelector('h1[contenteditable="true"]');
    const pElement = document.querySelector('p[contenteditable="true"]');

    const originalH1Styles = {
        color: h1Element.style.color,
        fontSize: h1Element.style.fontSize,
        fontFamily: h1Element.style.fontFamily,
        backgroundColor: h1Element.style.backgroundColor
    };
    const originalPStyles = {
        color: pElement.style.color,
        fontSize: pElement.style.fontSize,
        fontFamily: pElement.style.fontFamily,
        backgroundColor: pElement.style.backgroundColor
    };

    h1Element.style.color = '#1f2937';
    pElement.style.color = '#1f2937';


    document.body.style.backgroundColor = '#ffffff'; // Set body to white for export

    // Scroll to the top to ensure all content is in the viewport for html2canvas
    window.scrollTo(0, 0);

    // Give a small delay to ensure all images and content are rendered
    setTimeout(() => {
        // Options for html2pdf
        const options = {
            margin: 10,
            filename: 'documento_con_tablas_e_imagenes.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2, // Increase scale for better image quality in PDF
                logging: true,
                useCORS: true,
                allowTaint: true,
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Generate and save the PDF
        html2pdf().set(options).from(documentContent).save().then(() => {
            // Enable button and restore original text after generation
            exportPdfBtn.disabled = false;
            exportPdfBtn.textContent = originalPdfButtonText;
            // Show export buttons again
            document.querySelectorAll('.hide-for-pdf-buttons button').forEach(btn => {
                btn.classList.remove('hide-for-pdf');
            });

            // Restore original background colors and styles
            document.body.style.backgroundColor = originalBodyBg;
            document.querySelectorAll('.table-container').forEach((el, index) => {
                el.style.backgroundColor = originalTableContainerBgs[index];
            });
            document.querySelectorAll('.enunciado-space').forEach((el, index) => {
                el.style.backgroundColor = originalEnunciadoStyles[index].backgroundColor;
                el.style.color = originalEnunciadoStyles[index].color;
                el.style.border = originalEnunciadoStyles[index].border;
                el.style.fontSize = originalEnunciadoStyles[index].fontSize;
                el.style.fontFamily = originalEnunciadoStyles[index].fontFamily;
            });
            // Restore top H1 and P styles
            h1Element.style.color = originalH1Styles.color;
            h1Element.style.fontSize = originalH1Styles.fontSize;
            h1Element.style.fontFamily = originalH1Styles.fontFamily;
            h1Element.style.backgroundColor = originalH1Styles.backgroundColor;

            pElement.style.color = originalPStyles.color;
            pElement.style.fontSize = originalPStyles.fontSize;
            pElement.style.fontFamily = originalPStyles.fontFamily;
            pElement.style.backgroundColor = originalPStyles.backgroundColor;

        }).catch(error => {
            console.error("Error al generar el PDF:", error);
            exportPdfBtn.disabled = false;
            exportPdfBtn.textContent = originalPdfButtonText;
            // Show export buttons again
            document.querySelectorAll('.hide-for-pdf-buttons button').forEach(btn => {
                btn.classList.remove('hide-for-pdf');
            });

            // Restore original background colors and styles in case of error
            document.body.style.backgroundColor = originalBodyBg;
            document.querySelectorAll('.table-container').forEach((el, index) => {
                el.style.backgroundColor = originalTableContainerBgs[index];
            });
            document.querySelectorAll('.enunciado-space').forEach((el, index) => {
                el.style.backgroundColor = originalEnunciadoStyles[index].backgroundColor;
                el.style.color = originalEnunciadoStyles[index].color;
                el.style.border = originalEnunciadoStyles[index].border;
                el.style.fontSize = originalEnunciadoStyles[index].fontSize;
                el.style.fontFamily = originalEnunciadoStyles[index].fontFamily;
            });
            // Restore top H1 and P styles
            h1Element.style.color = originalH1Styles.color;
            h1Element.style.fontSize = originalH1Styles.fontSize;
            h1Element.style.fontFamily = originalH1Styles.fontFamily;
            h1Element.style.backgroundColor = originalH1Styles.backgroundColor;

            pElement.style.color = originalPStyles.color;
            pElement.style.fontSize = originalPStyles.fontSize;
            pElement.style.fontFamily = originalPStyles.fontFamily;
            pElement.style.backgroundColor = originalPStyles.backgroundColor;
            alert("Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.");
        });
    }, 500); // 500ms delay
});

document.getElementById('exportDocxBtn').addEventListener('click', exportToDocx);