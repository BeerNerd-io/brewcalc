// Constants and State Management
const state = {
  recipes: JSON.parse(localStorage.getItem('recipes') || '[]'),
  currentRecipe: null,
  grainSpecs: {
    'Pale Malt (2 Row)': { ppg: 37, color: 2 },
    'Pilsner Malt': { ppg: 37, color: 1.5 },
    'Vienna Malt': { ppg: 35, color: 4 },
    'Munich Malt': { ppg: 35, color: 10 },
    'Crystal 20L': { ppg: 34, color: 20 },
    'Crystal 40L': { ppg: 34, color: 40 },
    'Crystal 60L': { ppg: 34, color: 60 },
    'Crystal 120L': { ppg: 33, color: 120 },
    'Chocolate Malt': { ppg: 28, color: 350 },
    'Roasted Barley': { ppg: 25, color: 500 },
    'Black Patent': { ppg: 26, color: 500 },
    'Wheat Malt': { ppg: 37, color: 2 },
    'Oat Malt': { ppg: 34, color: 2 }
  },
  hopSpecs: {
    'Cascade': { alpha: 6.5 },
    'Centennial': { alpha: 9.5 },
    'Citra': { alpha: 12 },
    'Chinook': { alpha: 12 },
    'Fuggle': { alpha: 4.5 },
    'Golding': { alpha: 5 },
    'Hallertau': { alpha: 4.5 },
    'Magnum': { alpha: 13 },
    'Mosaic': { alpha: 12.5 },
    'Northern Brewer': { alpha: 8 },
    'Saaz': { alpha: 3.5 },
    'Simcoe': { alpha: 13 },
    'Tettnang': { alpha: 4 }
  },
  waterProfiles: {
    pilsen: {
      calcium: 7,
      magnesium: 2,
      sodium: 2,
      chloride: 5,
      sulfate: 5,
      bicarbonate: 15,
      description: 'Very soft water, ideal for Pilsners and light lagers'
    },
    munich: {
      calcium: 75,
      magnesium: 18,
      sodium: 1,
      chloride: 1,
      sulfate: 58,
      bicarbonate: 152,
      description: 'Moderately hard water, good for dark lagers'
    },
    burton: {
      calcium: 295,
      magnesium: 45,
      sodium: 55,
      chloride: 30,
      sulfate: 725,
      bicarbonate: 300,
      description: 'Very hard water, classic for IPAs and pale ales'
    },
    // ... add other profiles
  }
};

// DOM Elements
const elements = {
  // Calculator elements
  ogInput: document.getElementById('og'),
  fgInput: document.getElementById('fg'),
  abvCalcBtn: document.getElementById('abv-calc-btn'),
  abvResult: document.getElementById('abv-result'),
  
  // Recipe form elements
  recipeForm: document.getElementById('recipe-form'),
  recipeName: document.getElementById('recipe-name'),
  batchSize: document.getElementById('batch-size'),
  grainEntries: document.getElementById('grain-entries'),
  hopsEntries: document.getElementById('hops-entries'),
  yeastStrain: document.getElementById('yeast-strain'),
  yeastAmount: document.getElementById('yeast-amount'),
  mashTemp: document.getElementById('mash-temp'),
  notes: document.getElementById('notes'),
  
  // Buttons
  generatePdfBtn: document.getElementById('generate-pdf-btn'),
  shareBtn: document.getElementById('share-btn'),
  message: document.getElementById('message'),
  
  // Saved recipes elements
  savedRecipesList: document.querySelector('.saved-recipes-list'),
  
  // New bulk control elements
  exportAllBtn: document.getElementById('export-all-btn'),
  importRecipesBtn: document.getElementById('import-recipes-btn'),
  importFile: document.getElementById('import-file'),
  deleteAllBtn: document.getElementById('delete-all-btn'),
  
  // Custom spec elements
  customSpecModal: document.getElementById('custom-spec-modal'),
  closeModal: document.querySelector('.close-modal'),
  customSpecForm: document.getElementById('custom-spec-form'),
  grainSpecsInputs: document.getElementById('grain-specs-inputs'),
  hopSpecsInputs: document.getElementById('hop-specs-inputs'),
  
  // New elements
  estOG: document.getElementById('est-og-display'),
  estFG: document.getElementById('est-fg-display'),
  estABV: document.getElementById('est-abv-display'),
  estIBU: document.getElementById('est-ibu-display'),
  estSRM: document.getElementById('est-srm-display'),
  estEfficiency: document.getElementById('est-efficiency-display'),
  colorPreview: document.getElementById('color-preview'),
  waterPreset: document.getElementById('water-preset'),
  waterInputs: {
    calcium: document.getElementById('calcium'),
    magnesium: document.getElementById('magnesium'),
    sodium: document.getElementById('sodium'),
    chloride: document.getElementById('chloride'),
    sulfate: document.getElementById('sulfate'),
    bicarbonate: document.getElementById('bicarbonate'),
    mashThickness: document.getElementById('mash-thickness'),
    spargeTemp: document.getElementById('sparge-temp')
  },
};

// Utility Functions
const showMessage = (msg, isError = false) => {
  elements.message.textContent = msg;
  elements.message.className = `message ${isError ? 'error' : 'success'}`;
  setTimeout(() => {
    elements.message.textContent = '';
    elements.message.className = 'message';
  }, 3000);
};

const validateNumber = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

// ABV Calculator Functions
const calculateABV = (og, fg) => {
  return ((og - fg) * 131.25).toFixed(2);
};

// Recipe Entry Management
const createEntryRow = (type, index = Date.now()) => {
  const div = document.createElement('div');
  div.className = 'recipe-entry';
  
  const template = type === 'grain' ? `
    <div class="input-wrapper">
      <label for="${type}-type-${index}">Grain Type:</label>
      <input type="text" 
        class="grain-type" 
        name="${type}-type-${index}" 
        id="${type}-type-${index}" 
        placeholder="Select grain type" 
        list="grain-types" 
        required />
    </div>
    <div class="input-group">
      <label for="${type}-amount-${index}">Amount:</label>
      <input type="number" 
        class="grain-amount" 
        name="${type}-amount-${index}" 
        id="${type}-amount-${index}" 
        step="0.1" 
        placeholder="Weight"
        required />
      <span class="unit">lbs</span>
    </div>
    <div class="grain-specs"></div>
    <div class="entry-buttons">
      <button type="button" class="add-entry-btn" title="Add new row">+</button>
      <button type="button" class="remove-entry-btn" title="Remove row">×</button>
    </div>
  ` : `
    <div class="input-wrapper">
      <label for="${type}-type-${index}">Hop Variety:</label>
      <input type="text" 
        class="hop-type" 
        name="${type}-type-${index}" 
        id="${type}-type-${index}" 
        placeholder="Select hop variety" 
        list="hop-types" 
        required />
    </div>
    <div class="input-group">
      <label for="${type}-amount-${index}">Amount:</label>
      <input type="number" 
        class="hop-amount" 
        name="${type}-amount-${index}" 
        id="${type}-amount-${index}" 
        step="0.1" 
        placeholder="Weight"
        required />
      <span class="unit">oz</span>
    </div>
    <div class="input-group">
      <label for="${type}-time-${index}">Time:</label>
      <input type="number" 
        class="hop-time" 
        name="${type}-time-${index}" 
        id="${type}-time-${index}" 
        placeholder="Boil time"
        required />
      <span class="unit">min</span>
    </div>
    <div class="hop-specs"></div>
    <div class="entry-buttons">
      <button type="button" class="add-entry-btn" title="Add new row">+</button>
      <button type="button" class="remove-entry-btn" title="Remove row">×</button>
    </div>
  `;
  
  div.innerHTML = template;
  
  // Add event listeners for spec updates
  if (type === 'grain') {
    const grainInput = div.querySelector('.grain-type');
    const specsDiv = div.querySelector('.grain-specs');
    grainInput.addEventListener('change', () => handleIngredientChange(grainInput, 'grain'));
  } else {
    const hopInput = div.querySelector('.hop-type');
    const specsDiv = div.querySelector('.hop-specs');
    hopInput.addEventListener('change', () => handleIngredientChange(hopInput, 'hop'));
  }
  
  return div;
};

const addEntryRow = (container, type) => {
  if (!container) return;
  
  const timestamp = Date.now();
  const newRow = createEntryRow(type, timestamp);
  container.appendChild(newRow);
  
  // Update button states
  updateEntryButtons(container);
};

const updateEntryButtons = (container) => {
  if (!container) return;
  
  const entries = container.querySelectorAll('.recipe-entry');
  entries.forEach((entry, index) => {
    const removeBtn = entry.querySelector('.remove-entry-btn');
    if (removeBtn) {
      removeBtn.style.display = entries.length === 1 ? 'none' : 'block';
    }
  });
};

// Recipe Management
const saveRecipe = () => {
  // Validate required fields
  if (!elements.recipeName.value.trim()) {
    throw new Error('Recipe name is required');
  }

  const recipe = {
    id: Date.now(),
    name: elements.recipeName.value.trim(),
    batchSize: elements.batchSize.value,
    grains: Array.from(elements.grainEntries.querySelectorAll('.recipe-entry')).map(entry => ({
      type: entry.querySelector('.grain-type').value.trim(),
      amount: entry.querySelector('.grain-amount').value
    })).filter(grain => grain.type && grain.amount), // Filter out empty entries
    hops: Array.from(elements.hopsEntries.querySelectorAll('.recipe-entry')).map(entry => ({
      type: entry.querySelector('.hop-type').value.trim(),
      amount: entry.querySelector('.hop-amount').value,
      time: entry.querySelector('.hop-time').value
    })).filter(hop => hop.type && hop.amount && hop.time), // Filter out empty entries
    yeast: {
      strain: elements.yeastStrain.value.trim(),
      amount: elements.yeastAmount.value
    },
    mashTemp: elements.mashTemp.value,
    mashThickness: elements.waterInputs.mashThickness?.value,
    spargeTemp: elements.waterInputs.spargeTemp?.value,
    waterProfile: {
      calcium: elements.waterInputs.calcium.value,
      magnesium: elements.waterInputs.magnesium.value,
      sodium: elements.waterInputs.sodium.value,
      chloride: elements.waterInputs.chloride.value,
      sulfate: elements.waterInputs.sulfate.value,
      bicarbonate: elements.waterInputs.bicarbonate.value
    },
    notes: elements.notes.value.trim()
  };

  // Update state and localStorage
  state.recipes = state.recipes.filter(r => r.id !== recipe.id); // Remove if exists
  state.recipes.push(recipe);
  localStorage.setItem('recipes', JSON.stringify(state.recipes));
  return recipe;
};

// PDF Generation
const generatePDF = async (recipe) => {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    });

    // A4 size in mm: 210 x 297
    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Add section header helper function
    const addSectionHeader = (text, yPosition) => {
      doc.setFillColor(240, 240, 240); // Light gray background
      doc.rect(margin - 2, yPosition - 5, pageWidth - (margin * 2) + 4, 10, 'F');
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(text, margin, yPosition);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(12);
      return yPosition + 12;
    };

    // Function to add logo to current page
    const addLogoToPage = () => {
      try {
        // Set width first, then calculate height to maintain aspect ratio
        const logoWidth = 80; // Make the logo a bit narrower
        const logoHeight = logoWidth / 2; // 2:1 aspect ratio (width:height)
        const logoX = (pageWidth - logoWidth) / 2; // Center horizontally
        
        doc.addImage('images/beernerd-logo.png', 'PNG', logoX, margin, logoWidth, logoHeight);
        return logoHeight + margin + 10; // Add space after logo
      } catch (error) {
        console.warn('Could not add logo:', error);
        return margin;
      }
    };

    // Add logo and get initial Y position
    let yPos = addLogoToPage();

    // Recipe Title with more emphasis
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    const title = recipe.name || 'Untitled Recipe';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, yPos); // Center title
    doc.setFont(undefined, 'normal');
    yPos += 20;

    // Helper function to check page space and add new page if needed
    const checkSpace = (neededSpace = 20) => {
      if (yPos + neededSpace > 260) {
        doc.addPage();
        yPos = addLogoToPage(); // Add logo to new page
        return true;
      }
      return false;
    };

    // Basic Info Section
    doc.setFontSize(12);
    doc.text(`Batch Size: ${recipe.batchSize || 5} gallons`, margin, yPos += 10);

    // Calculate Recipe Statistics
    const batchSize = parseFloat(recipe.batchSize) || 5;
    const efficiency = 0.75;
    const grains = recipe.grains || [];
    const hops = recipe.hops || [];
    
    const gravityPoints = calculateGravityPoints(grains, batchSize, efficiency);
    const og = 1 + (gravityPoints / 1000);
    const fg = calculateFinalGravity(og);
    const abv = (og - fg) * 131.25;
    const ibu = calculateIBUs(hops, batchSize, og);
    const srm = calculateSRM(grains, batchSize);

    // Recipe Statistics in a nice box
    yPos = addSectionHeader('Recipe Statistics', yPos);
    const stats = [
      [`Original Gravity (OG): ${og.toFixed(3)}`, `Final Gravity (FG): ${fg.toFixed(3)}`],
      [`ABV: ${abv.toFixed(1)}%`, `IBU: ${Math.round(ibu)}`],
      [`Color: ${srm.toFixed(1)} SRM`, `Efficiency: ${(efficiency * 100).toFixed(0)}%`]
    ];
    
    stats.forEach(row => {
      doc.text(row[0], margin + 5, yPos += 8);
      doc.text(row[1], pageWidth / 2 + 5, yPos);
    });
    yPos += 10;

    // Grain Bill in columns
    if (grains.length) {
      yPos = addSectionHeader('Grain Bill', yPos);
      grains.forEach(grain => {
        if (grain.type && grain.amount) {
          const grainSpec = state.grainSpecs[grain.type] || { ppg: 35, color: 2 };
          doc.text(`• ${grain.type}`, margin + 5, yPos += 7);
          doc.text(`${grain.amount} lbs`, pageWidth - margin - 40, yPos);
        }
      });
      yPos += 10;
    }

    // Hops Schedule Section
    if (hops.length) {
      doc.setFontSize(16);
      doc.text('Hops Schedule:', margin, yPos += 15);
      doc.setFontSize(12);
      
      hops.forEach(hop => {
        if (hop.type && hop.amount && hop.time) {
          const hopSpec = state.hopSpecs[hop.type] || { alpha: 0 };
          const hopText = `${hop.type}: ${hop.amount} oz at ${hop.time} min (${hopSpec.alpha}% AA)`;
          doc.text(hopText, margin + 5, yPos += 7);
        }
      });
    }

    // Yeast Section
    if (recipe.yeast?.strain || recipe.yeast?.amount) {
      doc.setFontSize(16);
      doc.text('Yeast:', margin, yPos += 15);
      doc.setFontSize(12);
      const yeastText = `${recipe.yeast.strain || 'Unspecified'}: ${recipe.yeast.amount || 'N/A'} packs`;
      doc.text(yeastText, margin + 5, yPos += 7);
    }

    // Mash & Water Chemistry Section
    doc.setFontSize(16);
    doc.text('Mash & Water Profile:', margin, yPos += 15);
    doc.setFontSize(12);

    // Mash Parameters
    const mashParams = [
      `Mash Temperature: ${recipe.mashTemp || 'N/A'}°F`,
      `Mash Thickness: ${recipe.mashThickness || 'N/A'} qt/lb`,
      `Sparge Temperature: ${recipe.spargeTemp || 'N/A'}°F`
    ];
    
    mashParams.forEach(param => {
      doc.text(param, margin + 5, yPos += 7);
    });

    // Water Chemistry in a clear table format
    if (recipe.waterProfile) {
      checkSpace(80); // Ensure enough space for water profile
      yPos = addSectionHeader('Water Chemistry Profile', yPos);
      
      // Create two even columns
      const colWidth = (pageWidth - (margin * 2) - 10) / 2;
      const leftCol = margin + 5;
      const rightCol = margin + colWidth + 15;
      
      // Draw table headers with background
      doc.setFillColor(245, 245, 245);
      doc.rect(leftCol - 2, yPos - 2, colWidth, 8, 'F');
      doc.rect(rightCol - 2, yPos - 2, colWidth, 8, 'F');
      
      // Add descriptive text
      doc.text('Water ion concentrations in parts per million (ppm):', margin, yPos += 10);
      
      // Create two-column layout for water profile
      const waterProfile = [
        ['Calcium (Ca²⁺)', recipe.waterProfile.calcium || 'N/A'],
        ['Magnesium (Mg²⁺)', recipe.waterProfile.magnesium || 'N/A'],
        ['Sodium (Na⁺)', recipe.waterProfile.sodium || 'N/A'],
        ['Chloride (Cl⁻)', recipe.waterProfile.chloride || 'N/A'],
        ['Sulfate (SO₄²⁻)', recipe.waterProfile.sulfate || 'N/A'],
        ['Bicarbonate (HCO₃⁻)', recipe.waterProfile.bicarbonate || 'N/A']
      ];

      // Draw water profile in two columns
      yPos += 10;
      const rowHeight = 7;
      const halfLength = Math.ceil(waterProfile.length / 2);
      
      waterProfile.forEach((row, i) => {
        const isRightColumn = i >= halfLength;
        const x = isRightColumn ? rightCol : leftCol;
        const rowY = yPos + (isRightColumn ? (i - halfLength) : i) * rowHeight;
        doc.text(`${row[0]}: ${row[1]} ppm`, x, rowY);
      });
      
      yPos += halfLength * rowHeight + 10;

      // Add water profile explanation in two columns
      const explanations = [
        '• Calcium: Affects enzyme activity and clarity',
        '• Sulfate: Enhances hop bitterness',
        '• Chloride: Enhances malt sweetness',
        '• Magnesium: Important for yeast health',
        '• Sodium: Can enhance malt sweetness',
        '• Bicarbonate: Buffers mash pH'
      ];
      
      doc.text('Water Profile Impact:', margin, yPos += 10);
      
      explanations.forEach((text, i) => {
        const isRightColumn = i >= halfLength;
        const x = isRightColumn ? rightCol : leftCol;
        const rowY = yPos + 10 + (isRightColumn ? (i - halfLength) : i) * rowHeight;
        doc.text(text, x, rowY);
      });
    }

    // Notes section with proper spacing
    checkSpace(60);
    yPos = addSectionHeader('Brewing Notes', yPos);
    
    // Add subtle grid for notes
    const lineSpacing = 7;
    doc.setDrawColor(210, 210, 210);
    for (let i = 0; i < 15; i++) {
      doc.line(margin, yPos + (lineSpacing * i), pageWidth - margin, yPos + (lineSpacing * i));
    }

    // If there are existing notes, add them with proper text wrapping
    if (recipe.notes) {
      doc.setTextColor(0, 0, 0);
      const maxWidth = pageWidth - (margin * 2);
      const splitNotes = doc.splitTextToSize(recipe.notes, maxWidth);
      
      // Check if notes will fit in remaining space
      if (yPos + (splitNotes.length * lineSpacing) > 260) {
        // Start notes on new page if they won't fit
        doc.addPage();
        yPos = addLogoToPage();
        doc.setFontSize(16);
        doc.text('Brewing Notes (continued):', margin, yPos += 15);
        doc.setFontSize(12);
      }
      
      doc.text(splitNotes, margin, yPos += lineSpacing);
    }

    // Add footer on each page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      const dateStr = new Date().toLocaleDateString();
      doc.text(`Generated by Brewery Calculator on ${dateStr} - Page ${i} of ${pageCount}`, margin, 285);
    }

    // Save the PDF
    const filename = recipe.name ? 
      `${recipe.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf` : 
      'brewery-recipe.pdf';

    // Set metadata
    doc.setProperties({
      title: recipe.name || 'Brewery Recipe',
      subject: 'Beer Recipe',
      author: 'Brewery Calculator',
      keywords: 'brewery,recipe,beer,homebrew',
      creator: 'Brewery Calculator'
    });

    // Save with standard options
    doc.save(filename);
    showMessage('PDF generated successfully!');
  } catch (error) {
    console.error('PDF generation failed:', error);
    showMessage('Failed to generate PDF: ' + error.message, true);
  }
};

// Helper function to load images asynchronously
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Add cross-origin handling
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    
    // Add timestamp to prevent caching issues
    const timestamp = new Date().getTime();
    img.src = `${src}?t=${timestamp}`;
  });
};

// Add these new functions for recipe management
const displaySavedRecipes = () => {
  elements.savedRecipesList.innerHTML = '';
  
  if (state.recipes.length === 0) {
    elements.savedRecipesList.innerHTML = '<p class="no-recipes">No saved recipes yet</p>';
    return;
  }
  
  state.recipes.forEach(recipe => {
    const recipeCard = document.createElement('div');
    recipeCard.className = 'recipe-card';
    recipeCard.innerHTML = `
      <h3>${recipe.name}</h3>
      <p>Batch Size: ${recipe.batchSize} gallons</p>
      <div class="recipe-card-buttons">
        <button class="secondary-btn load-recipe" data-id="${recipe.id}">Load</button>
        <button class="secondary-btn export-recipe" data-id="${recipe.id}">Export</button>
        <button class="delete-btn" data-id="${recipe.id}">Delete</button>
      </div>
    `;
    elements.savedRecipesList.appendChild(recipeCard);
  });
};

const loadRecipe = (recipeId) => {
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  // Fill form with recipe data
  elements.recipeName.value = recipe.name;
  elements.batchSize.value = recipe.batchSize;
  
  // Clear existing entries
  elements.grainEntries.innerHTML = '';
  elements.hopsEntries.innerHTML = '';
  
  // Load grains with unique IDs
  recipe.grains.forEach((grain, index) => {
    const grainRow = createEntryRow('grain', index);
    elements.grainEntries.appendChild(grainRow);
    const inputs = grainRow.querySelectorAll('input');
    inputs[0].value = grain.type;
    inputs[1].value = grain.amount;
  });
  
  // Load hops with unique IDs
  recipe.hops.forEach((hop, index) => {
    const hopRow = createEntryRow('hops', index);
    elements.hopsEntries.appendChild(hopRow);
    const inputs = hopRow.querySelectorAll('input');
    inputs[0].value = hop.type;
    inputs[1].value = hop.amount;
    inputs[2].value = hop.time;
  });
  
  // Load yeast and other fields
  elements.yeastStrain.value = recipe.yeast.strain;
  elements.yeastAmount.value = recipe.yeast.amount;
  elements.mashTemp.value = recipe.mashTemp;
  elements.notes.value = recipe.notes;
  
  // Update buttons
  updateEntryButtons(elements.grainEntries);
  updateEntryButtons(elements.hopsEntries);
  
  // Scroll to recipe form
  elements.recipeForm.scrollIntoView({ behavior: 'smooth' });
};

const deleteRecipe = (recipeId) => {
  if (!confirm('Are you sure you want to delete this recipe?')) return;
  
  state.recipes = state.recipes.filter(r => r.id !== recipeId);
  localStorage.setItem('recipes', JSON.stringify(state.recipes));
  displaySavedRecipes();
  showMessage('Recipe deleted');
};

const exportRecipe = (recipe) => {
  const recipeText = JSON.stringify(recipe, null, 2);
  const blob = new Blob([recipeText], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${recipe.name.toLowerCase().replace(/\s+/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Add new bulk control functions
const exportAllRecipes = () => {
  if (state.recipes.length === 0) {
    showMessage('No recipes to export', true);
    return;
  }

  const recipesJson = JSON.stringify(state.recipes, null, 2);
  const blob = new Blob([recipesJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  
  a.href = url;
  a.download = `brewery-recipes-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showMessage('All recipes exported successfully!');
};

const importRecipes = async (file) => {
  try {
    const text = await file.text();
    const importedRecipes = JSON.parse(text);
    
    if (!Array.isArray(importedRecipes)) {
      throw new Error('Invalid recipe file format');
    }

    // Merge with existing recipes, avoiding duplicates by ID
    const existingIds = new Set(state.recipes.map(r => r.id));
    const newRecipes = importedRecipes.filter(r => !existingIds.has(r.id));
    
    state.recipes = [...state.recipes, ...newRecipes];
    localStorage.setItem('recipes', JSON.stringify(state.recipes));
    displaySavedRecipes();
    
    showMessage(`Imported ${newRecipes.length} new recipes successfully!`);
  } catch (error) {
    showMessage('Failed to import recipes: ' + error.message, true);
  }
};

const deleteAllRecipes = () => {
  if (!confirm('Are you sure you want to delete ALL recipes? This cannot be undone!')) {
    return;
  }
  
  state.recipes = [];
  localStorage.setItem('recipes', JSON.stringify(state.recipes));
  displaySavedRecipes();
  showMessage('All recipes deleted');
};

// Fix and improve the share functionality
const shareRecipe = async (recipe) => {
  const shareText = generateShareText(recipe);
  
  try {
    if (navigator.share) {
      await navigator.share({
        title: `Brewery Recipe: ${recipe.name}`,
        text: shareText,
      });
      showMessage('Recipe shared successfully!');
    } else {
      await copyToClipboard(shareText);
      showMessage('Recipe copied to clipboard!');
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      throw error;
    }
  }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // ABV Calculator
  elements.abvCalcBtn.addEventListener('click', () => {
    const og = parseFloat(elements.ogInput.value);
    const fg = parseFloat(elements.fgInput.value);
    
    if (!validateNumber(og, 1, 1.2) || !validateNumber(fg, 0.95, 1.2)) {
      showMessage('Please enter valid gravity values', true);
      return;
    }
    
    const abv = calculateABV(og, fg);
    elements.abvResult.textContent = `ABV: ${abv}%`;
  });
  
  // Recipe Entry Management
  document.querySelectorAll('.add-entry-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const container = e.target.closest('.recipe-entry').parentElement;
      const type = container.id === 'grain-entries' ? 'grain' : 'hops';
      addEntryRow(container, type);
    });
  });
  
  // Remove entry button delegation
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-entry-btn')) {
      const container = e.target.closest('div[id$=-entries]');
      if (container) {
        e.target.closest('.recipe-entry').remove();
        updateEntryButtons(container);
        updateRecipeStats();
      }
    }
  });
  
  // Recipe Form Submission
  elements.recipeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    try {
      const recipe = saveRecipe();
      showMessage('Recipe saved successfully!');
      displaySavedRecipes();
    } catch (error) {
      showMessage(error.message || 'Error saving recipe', true);
      console.error(error);
    }
  });
  
  // PDF Generation
  elements.generatePdfBtn.addEventListener('click', async () => {
    if (!elements.recipeName.value.trim()) {
      showMessage('Please enter a recipe name before generating PDF', true);
      elements.recipeName.focus();
      return;
    }

    elements.generatePdfBtn.disabled = true;
    elements.generatePdfBtn.textContent = 'Generating...';
    
    try {
      const recipe = saveRecipe();
      await generatePDF(recipe);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      showMessage('Failed to generate PDF', true);
    } finally {
      elements.generatePdfBtn.disabled = false;
      elements.generatePdfBtn.textContent = 'Generate PDF';
    }
  });
  
  // Share Recipe
  elements.shareBtn.addEventListener('click', async () => {
    if (!elements.recipeName.value.trim()) {
      showMessage('Please enter a recipe name before sharing', true);
      elements.recipeName.focus();
      return;
    }

    elements.shareBtn.disabled = true;
    elements.shareBtn.textContent = 'Sharing...';
    
    try {
      const recipe = saveRecipe();
      await shareRecipe(recipe);
    } catch (error) {
      showMessage('Failed to share recipe', true);
      console.error('Share failed:', error);
    } finally {
      elements.shareBtn.disabled = false;
      elements.shareBtn.textContent = 'Share Recipe';
    }
  });
  
  // Display saved recipes on load
  displaySavedRecipes();
  
  // Recipe card button handlers
  elements.savedRecipesList.addEventListener('click', (e) => {
    const recipeId = parseInt(e.target.dataset.id);
    
    if (e.target.classList.contains('load-recipe')) {
      loadRecipe(recipeId);
    } else if (e.target.classList.contains('export-recipe')) {
      const recipe = state.recipes.find(r => r.id === recipeId);
      if (recipe) exportRecipe(recipe);
    } else if (e.target.classList.contains('delete-btn')) {
      deleteRecipe(recipeId);
    }
  });
  
  // Initialize first rows
  if (elements.grainEntries) {
    const firstGrainRow = createEntryRow('grain');
    elements.grainEntries.appendChild(firstGrainRow);
    updateEntryButtons(elements.grainEntries);
  }
  
  if (elements.hopsEntries) {
    const firstHopRow = createEntryRow('hops');
    elements.hopsEntries.appendChild(firstHopRow);
    updateEntryButtons(elements.hopsEntries);
  }

  // Add entry button delegation
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-entry-btn')) {
      const container = e.target.closest('div[id$=-entries]');
      if (container) {
        const type = container.id === 'grain-entries' ? 'grain' : 'hops';
        addEntryRow(container, type);
        updateRecipeStats();
      }
    }
  });
  
  // Bulk control event listeners
  elements.exportAllBtn.addEventListener('click', exportAllRecipes);
  
  elements.importRecipesBtn.addEventListener('click', () => {
    elements.importFile.click();
  });
  
  elements.importFile.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      importRecipes(e.target.files[0]);
      e.target.value = ''; // Reset file input
    }
  });
  
  elements.deleteAllBtn.addEventListener('click', deleteAllRecipes);

  // Modal event listeners
  elements.closeModal.addEventListener('click', hideCustomSpecModal);
  elements.customSpecForm.addEventListener('submit', handleCustomSpec);
  
  window.addEventListener('click', (e) => {
    if (e.target === elements.customSpecModal) {
      hideCustomSpecModal();
    }
  });

  // Initialize recipe stats and listeners
  updateRecipeStats();
  addRecipeUpdateListeners();

  // Add water profile handling
  elements.waterPreset.addEventListener('change', (e) => {
    if (e.target.value) {
      loadWaterProfile(e.target.value);
    }
  });
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.error('ServiceWorker registration failed:', err);
      });
  });
}

// Helper function to generate share text
const generateShareText = (recipe) => {
  const lines = [
    `🍺 ${recipe.name || 'Untitled Recipe'}`,
    `Batch Size: ${recipe.batchSize || 'N/A'} gallons`,
    '',
    '📝 Grain Bill:',
    ...(recipe.grains || []).map(g => `- ${g.type}: ${g.amount} lbs`),
    '',
    '🌿 Hops Schedule:',
    ...(recipe.hops || []).map(h => `- ${h.type}: ${h.amount} oz at ${h.time} min`),
    '',
    '🧬 Yeast:',
    `- ${recipe.yeast?.strain || 'Unspecified'}: ${recipe.yeast?.amount || 'N/A'} packs`,
    '',
    '💧 Water Profile:',
    `- Mash Temperature: ${recipe.mashTemp || 'N/A'}°F`,
  ];

  if (recipe.notes) {
    lines.push('', '📌 Notes:', recipe.notes);
  }

  lines.push('', '🔗 Created with Beer Nerd (beernerd.io)');
  
  return lines.join('\n');
};

// Helper function for clipboard fallback
const copyToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
};

// Brewing calculation functions
const calculateGravityPoints = (grains, batchSize, efficiency = 0.75) => {
  if (!grains.length || !batchSize) return 0;
  
  const totalPoints = grains.reduce((sum, grain) => {
    const spec = state.grainSpecs[grain.type] || { ppg: 35 }; // default PPG if type unknown
    return sum + (spec.ppg * grain.amount);
  }, 0);
  
  return (totalPoints * efficiency) / batchSize;
};

const calculateFinalGravity = (og, attenuation = 0.75) => {
  const gravityPoints = (og - 1) * 1000;
  const finalPoints = gravityPoints * (1 - attenuation);
  return 1 + (finalPoints / 1000);
};

const calculateIBUs = (hops, batchSize, boilGravity) => {
  if (!hops.length || !batchSize) return 0;
  
  return hops.reduce((total, hop) => {
    const spec = state.hopSpecs[hop.type] || { alpha: 10 }; // default alpha if type unknown
    const utilization = getHopUtilization(hop.time, boilGravity);
    const ibu = (spec.alpha * hop.amount * utilization * 74.89) / batchSize;
    return total + ibu;
  }, 0);
};

const getHopUtilization = (time, gravity) => {
  // Tinseth formula
  const gravityFactor = 1.65 * Math.pow(0.000125, gravity - 1);
  const timeFactor = (1 - Math.exp(-0.04 * time)) / 4.15;
  return gravityFactor * timeFactor;
};

const calculateSRM = (grains, batchSize) => {
  if (!grains.length || !batchSize) return 0;
  
  const mcu = grains.reduce((sum, grain) => {
    const spec = state.grainSpecs[grain.type] || { color: 2 }; // default color if type unknown
    return sum + (spec.color * grain.amount / batchSize);
  }, 0);
  
  return 1.4922 * Math.pow(mcu, 0.6859); // Morey equation
};

const getSRMColor = (srm) => {
  // SRM to RGB conversion
  const srmColors = {
    1: '#FFE699',
    2: '#FFD878',
    3: '#FFCA5A',
    4: '#FFBF42',
    5: '#FBB123',
    6: '#F8A600',
    7: '#F39C00',
    8: '#EA8F00',
    9: '#E58500',
    10: '#DE7C00',
    11: '#D77200',
    12: '#CF6900',
    13: '#CB6200',
    14: '#C35900',
    15: '#BB5100',
    20: '#A54800',
    25: '#8F4000',
    30: '#7C3900',
    35: '#6B3300',
    40: '#5D2E00'
  };
  
  const roundedSRM = Math.min(40, Math.round(srm));
  let closestSRM = 1;
  
  Object.keys(srmColors).forEach(key => {
    if (Math.abs(roundedSRM - key) < Math.abs(roundedSRM - closestSRM)) {
      closestSRM = key;
    }
  });
  
  return srmColors[closestSRM];
};

// Update the recipe statistics in real-time
const updateRecipeStats = () => {
  try {
    const batchSize = parseFloat(elements.batchSize.value) || 5; // default to 5 gallons
    const efficiency = 0.75; // 75% efficiency
    
    // Get current grain and hop entries
    const grains = Array.from(elements.grainEntries.querySelectorAll('.recipe-entry'))
      .map(entry => ({
        type: entry.querySelector('.grain-type').value,
        amount: parseFloat(entry.querySelector('.grain-amount').value) || 0
      }))
      .filter(grain => grain.type && grain.amount > 0);
    
    const hops = Array.from(elements.hopsEntries.querySelectorAll('.recipe-entry'))
      .map(entry => ({
        type: entry.querySelector('.hop-type').value,
        amount: parseFloat(entry.querySelector('.hop-amount').value) || 0,
        time: parseFloat(entry.querySelector('.hop-time').value) || 0
      }))
      .filter(hop => hop.type && hop.amount > 0 && hop.time > 0);
    
    // Calculate values
    const gravityPoints = calculateGravityPoints(grains, batchSize, efficiency);
    const og = 1 + (gravityPoints / 1000);
    const fg = calculateFinalGravity(og);
    const abv = (og - fg) * 131.25;
    const ibu = calculateIBUs(hops, batchSize, og);
    const srm = calculateSRM(grains, batchSize);
    
    // Update display with validation
    elements.estOG.textContent = og.toFixed(3);
    elements.estFG.textContent = fg.toFixed(3);
    elements.estABV.textContent = `${abv.toFixed(1)}%`;
    elements.estIBU.textContent = Math.round(ibu);
    elements.estSRM.textContent = srm.toFixed(1);
    elements.estEfficiency.textContent = `${(efficiency * 100).toFixed(0)}%`;
    
    // Update color preview
    const colorPreview = elements.colorPreview;
    if (colorPreview) {
      colorPreview.style.backgroundColor = getSRMColor(srm);
    }
    
    // Add tooltips or additional information
    elements.estOG.title = `Based on ${grains.length} grain(s) at ${efficiency * 100}% efficiency`;
    elements.estIBU.title = `Based on ${hops.length} hop addition(s)`;
    elements.estSRM.title = `Beer color estimation`;
  } catch (error) {
    console.error('Error updating recipe stats:', error);
    // Don't show error message to user, just maintain last valid values
  }
};

// Add real-time update listeners for all relevant inputs
const addRecipeUpdateListeners = () => {
  const updateStats = () => {
    requestAnimationFrame(updateRecipeStats);
  };

  elements.batchSize.addEventListener('input', updateStats);
  elements.grainEntries.addEventListener('input', updateStats);
  elements.hopsEntries.addEventListener('input', updateStats);
  
  // Add mutation observer for dynamic content
  const observer = new MutationObserver(updateStats);
  observer.observe(elements.grainEntries, { childList: true, subtree: true });
  observer.observe(elements.hopsEntries, { childList: true, subtree: true });
};

// Custom spec handling functions
const showCustomSpecModal = (type) => {
  elements.customSpecModal.style.display = 'block';
  elements.grainSpecsInputs.style.display = type === 'grain' ? 'block' : 'none';
  elements.hopSpecsInputs.style.display = type === 'hop' ? 'block' : 'none';
  elements.customSpecForm.dataset.type = type;
};

const hideCustomSpecModal = () => {
  elements.customSpecModal.style.display = 'none';
  elements.customSpecForm.reset();
};

const handleCustomSpec = (e) => {
  e.preventDefault();
  const type = e.target.dataset.type;
  const name = document.getElementById('custom-ingredient-name').value.trim();

  if (type === 'grain') {
    const ppg = parseFloat(document.getElementById('custom-grain-ppg').value);
    const color = parseFloat(document.getElementById('custom-grain-color').value);
    state.grainSpecs[name] = { ppg, color };
  } else {
    const alpha = parseFloat(document.getElementById('custom-hop-alpha').value);
    state.hopSpecs[name] = { alpha };
  }

  // Add to datalist
  const datalist = document.getElementById(`${type}-types`);
  const option = document.createElement('option');
  option.value = name;
  datalist.insertBefore(option, datalist.lastElementChild);

  hideCustomSpecModal();
  showMessage(`Custom ${type} added successfully!`);
};

// Update createEntryRow function to handle "Other..." selection
const handleIngredientChange = (input, type) => {
  if (input.value === 'Other...') {
    showCustomSpecModal(type);
    input.value = ''; // Clear the "Other..." selection
  } else {
    const specs = type === 'grain' ? state.grainSpecs[input.value] : state.hopSpecs[input.value];
    const specsDiv = input.closest('.recipe-entry').querySelector(`.${type}-specs`);
    
    if (specs) {
      specsDiv.textContent = type === 'grain' 
        ? `PPG: ${specs.ppg}, Color: ${specs.color}°L`
        : `Alpha: ${specs.alpha}%`;
      updateRecipeStats();
    } else {
      specsDiv.textContent = '';
    }
  }
};

// Add water profile handling
const loadWaterProfile = (profileName) => {
  const profile = state.waterProfiles[profileName];
  if (!profile) return;

  Object.entries(profile).forEach(([ion, value]) => {
    if (elements.waterInputs[ion]) {
      elements.waterInputs[ion].value = value;
    }
  });

  // Show a tooltip or message about the selected profile
  showMessage(profile.description);
};
