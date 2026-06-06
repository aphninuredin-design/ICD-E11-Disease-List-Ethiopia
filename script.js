// Application State
const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');
const categoryDropdownBtn = document.getElementById('categoryDropdownBtn');
const categoryDropdownMenu = document.getElementById('categoryDropdownMenu');
const categoryDropdownLabel = document.getElementById('categoryDropdownLabel');
const categoryDropdownIcon = document.getElementById('categoryDropdownIcon');
const sortBtn = document.getElementById('sortBtn');
const sortStatus = document.getElementById('sortStatus');
const cardViewBtn = document.getElementById('cardViewBtn');
const tableViewBtn = document.getElementById('tableViewBtn');
const frequentSection = document.getElementById('frequentSection');
const frequentResults = document.getElementById('frequentResults');
const frequentCount = document.getElementById('frequentCount');
const resultCount = document.getElementById('resultCount');
const resultCount2 = document.getElementById('resultCount2');
const emptyState = document.getElementById('emptyState');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const sidebar = document.getElementById('sidebar');
const hamburgerMenu = document.getElementById('hamburgerMenu');
const closeSidebarBtn = document.getElementById('closeSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

let currentCategory = 'all';
// Detect if mobile and set default view accordingly
let currentView = window.innerWidth <= 768 ? 'card' : 'table'; // DEFAULT: 'table' or 'card'
let isSorted = false;
let pinnedItems = new Set();

// Listen for window resize to auto-switch views
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768 && currentView === 'table') {
        setViewMode('card');
    } else if (window.innerWidth > 768 && currentView === 'card') {
        setViewMode('table');
    }
});

function loadPinnedItems() {
    const stored = localStorage.getItem('ministry-health-icd11-pinned');
    if (stored) {
        pinnedItems = new Set(JSON.parse(stored));
    }
}

function savePinnedItems() {
    localStorage.setItem('ministry-health-icd11-pinned', JSON.stringify([...pinnedItems]));
}

function renderCategoryDropdown() {
    const categoryOrder = [
        'Certain infectious or parasitic diseases',
        'Neoplasms',
        'Diseases of the blood or blood-forming organs',
        'Diseases of the immune system',
        'Endocrine, nutritional or metabolic diseases',
        'Mental, behavioral or neurodevelopmental disorders',
        'Sleep-wake disorders',
        'Diseases of the nervous system',
        'Diseases of the visual system',
        'Diseases of the ear or mastoid process',
        'Diseases of the circulatory system',
        'Diseases of the respiratory system',
        'Diseases of the digestive system',
        'Diseases of the skin',
        'Diseases of the musculoskeletal system or connective tissue',
        'Diseases of the genitourinary system',
        'Conditions related to sexual health',
        'Pregnancy, childbirth or the puerperium',
        'Certain conditions originating in the perinatal period',
        'Developmental anomalies',
        'Symptoms, signs or clinical findings, not elsewhere classified',
        'Injury, poisoning or certain other consequences of external causes',
        'External causes of morbidity or mortality',
        'Factors influencing health status or contact with health services',
        'Codes for special purposes',
        'Extension Codes'
    ];

    const categories = [...new Set(icdData.map(item => item.category))];
    categories.sort((a, b) => {
        const aIndex = categoryOrder.indexOf(a);
        const bIndex = categoryOrder.indexOf(b);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.localeCompare(b);
    });

    const items = [{
        category: 'all',
        label: 'All Categories'
    }, ...categories.map(category => ({
        category,
        label: category
    }))];

    // Clear menu and render options
    categoryDropdownMenu.innerHTML = '';
    
    items.forEach(item => {
        const option = document.createElement('button');
        option.className = `w-full text-left px-4 py-3 hover:bg-green-50 transition-colors text-sm font-medium text-gray-700 hover:text-green-700 border-b border-gray-100 last:border-b-0 category-option ${item.category === 'all' ? 'bg-green-50 text-green-700 font-bold' : ''}`;
        option.textContent = item.label;
        option.dataset.category = item.category;
        option.type = 'button';
        
        option.addEventListener('click', () => {
            // Update button label
            categoryDropdownLabel.textContent = item.label;
            
            // Update active state in menu
            document.querySelectorAll('.category-option').forEach(o => {
                o.classList.remove('bg-green-50', 'text-green-700', 'font-bold');
            });
            option.classList.add('bg-green-50', 'text-green-700', 'font-bold');
            
            // Close dropdown
            closeDropdown();
            
            // Select category
            selectCategory(item.category);
        });
        
        categoryDropdownMenu.appendChild(option);
    });
}

function toggleDropdown() {
    categoryDropdownMenu.classList.toggle('hidden');
    categoryDropdownIcon.style.transform = categoryDropdownMenu.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';

    if (!categoryDropdownMenu.classList.contains('hidden')) {
        const button = categoryDropdownBtn;
        const rect = button.getBoundingClientRect();

        categoryDropdownMenu.style.position = 'fixed';
        categoryDropdownMenu.style.top = (rect.bottom + 8) + 'px';
        categoryDropdownMenu.style.left = rect.left + 'px';
        categoryDropdownMenu.style.width = rect.width + 'px';
        categoryDropdownMenu.style.minWidth = '260px';
        categoryDropdownMenu.style.background = '#ffffff';
        categoryDropdownMenu.style.backgroundColor = '#ffffff';
        categoryDropdownMenu.style.opacity = '1';
        categoryDropdownMenu.style.zIndex = '99999';
        categoryDropdownMenu.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.12)';
        categoryDropdownMenu.style.borderRadius = '0.5rem';
        categoryDropdownMenu.style.border = '1px solid #e5e7eb';
    }
}

function closeDropdown() {
    categoryDropdownMenu.classList.add('hidden');
    categoryDropdownIcon.style.transform = 'rotate(0deg)';
}

function openSidebar() {
    sidebar.classList.add('active');
    sidebarOverlay.classList.remove('hidden');
}

function closeSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.add('hidden');
}

function togglePin(code) {
    if (pinnedItems.has(code)) {
        pinnedItems.delete(code);
    } else {
        pinnedItems.add(code);
    }
    savePinnedItems();
    filterAndSearch();
    showToast(pinnedItems.has(code) ? 'Added to frequent diagnoses' : 'Removed from frequent diagnoses');
}

function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.remove('translate-y-full');
    setTimeout(() => {
        toast.classList.add('translate-y-full');
    }, 3000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('ICD-11 code copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showToast('Failed to copy code');
    });
}

function updateFrequentDiagnoses() {
    if (pinnedItems.size === 0) {
        frequentSection.classList.add('hidden');
        return;
    }

    frequentSection.classList.remove('hidden');
    frequentCount.textContent = `${pinnedItems.size} diagnosis${pinnedItems.size > 1 ? 'es' : ''}`;
    frequentResults.innerHTML = '';

    const pinnedData = icdData.filter(item => pinnedItems.has(item.code));

    pinnedData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 shadow-sm';
        card.innerHTML = `
            <div class="flex items-start justify-between mb-2">
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span class="text-sm font-medium text-yellow-800">${item.category}</span>
                </div>
                <button class="text-red-500 hover:text-red-700 p-1" onclick="togglePin('${item.code}')" title="Remove from frequent diagnoses">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <div class="font-bold text-blue-600 text-lg mb-1">${item.code}</div>
            <div class="text-gray-700 text-sm">${item.description}</div>
        `;
        frequentResults.appendChild(card);
    });
}

function displayResults(results) {
    resultsDiv.innerHTML = '';
    emptyState.classList.add('hidden');

    if (results.length === 0) {
        emptyState.classList.remove('hidden');
        resultCount.textContent = '0 diseases';
        resultCount2.textContent = '0';
        return;
    }

    resultCount.textContent = `${results.length} disease${results.length > 1 ? 's' : ''}`;
    resultCount2.textContent = results.length;

    updateFrequentDiagnoses();

    if (currentView === 'table') {
        displayTableView(results);
    } else {
        displayCardView(results);
    }
}

function displayTableView(results) {
    const tableHTML = `
        <div class="table-container">
            <table class="w-full">
                <thead>
                    <tr>
                        <th style="width: 3rem;" class="text-center">Pin</th>
                        <th style="width: 5rem;">Code</th>
                        <th>Description</th>
                        <th style="min-width: 200px;">Category</th>
                        <th style="width: 3rem;" class="text-center">Copy</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(item => `
                        <tr class="${pinnedItems.has(item.code) ? 'frequent-item' : ''}">
                            <td class="text-center">
                                <button class="star-btn p-2 rounded hover:bg-gray-100 text-gray-400 ${pinnedItems.has(item.code) ? 'starred' : ''}" 
                                        onclick="togglePin('${item.code}')" 
                                        title="${pinnedItems.has(item.code) ? 'Remove from frequent diagnoses' : 'Add to frequent diagnoses'}">
                                    <svg class="w-4 h-4" fill="${pinnedItems.has(item.code) ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                                    </svg>
                                </button>
                            </td>
                            <td class="font-bold text-blue-600">${item.code}</td>
                            <td class="text-gray-700">${item.description}</td>
                            <td>
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-blue-100 text-green-800">
                                    ${item.category}
                                </span>
                            </td>
                            <td class="text-center">
                                <button class="p-2 rounded hover:bg-blue-50 text-blue-600" onclick="copyToClipboard('${item.code}')" title="Copy code">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    resultsDiv.innerHTML = tableHTML;
}

function displayCardView(results) {
    const grid = document.createElement('div');
    grid.className = 'grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

    results.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `disease-card rounded-xl p-4 sm:p-6 fade-in ${pinnedItems.has(item.code) ? 'ring-2 ring-yellow-400' : ''}`;
        card.style.animationDelay = `${index * 0.05}s`;

        card.innerHTML = `
            <div class="flex items-start justify-between mb-4 gap-2">
                <div class="flex items-center gap-2 min-w-0 flex-1">
                    <span class="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border border-green-200 whitespace-nowrap">
                        ${item.category.substring(0, 15)}${item.category.length > 15 ? '...' : ''}
                    </span>
                    ${pinnedItems.has(item.code) ? '<svg class="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' : ''}
                </div>
                <div class="flex gap-2 flex-shrink-0">
                    <button class="star-btn p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors ${pinnedItems.has(item.code) ? 'starred' : ''}"
                            onclick="togglePin('${item.code}')"
                            title="${pinnedItems.has(item.code) ? 'Remove from frequent diagnoses' : 'Add to frequent diagnoses'}">
                        <svg class="w-5 h-5" fill="${pinnedItems.has(item.code) ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                        </svg>
                    </button>
                    <button class="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            onclick="copyToClipboard('${item.code}')"
                            title="Copy ICD-11 code">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="mb-3">
                <div class="text-xl sm:text-2xl font-bold text-blue-600 mb-2 break-words">${item.code}</div>
                <div class="text-sm sm:text-base text-gray-700 leading-relaxed line-clamp-3">${item.description}</div>
            </div>
        `;

        grid.appendChild(card);
    });

    resultsDiv.appendChild(grid);
}

function filterAndSearch() {
    const query = searchInput.value.trim().toLowerCase();
    let filtered = icdData;

    if (currentCategory !== 'all') {
        filtered = filtered.filter(item => item.category === currentCategory);
    }

    if (query) {
        filtered = filtered.filter(item =>
            item.code.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        );
    }

    if (isSorted) {
        filtered = [...filtered].sort((a, b) => a.description.localeCompare(b.description));
    }

    displayResults(filtered);
}

function setViewMode(mode) {
    currentView = mode;

    if (mode === 'table') {
        tableViewBtn.classList.remove('inactive');
        tableViewBtn.classList.add('active');
        cardViewBtn.classList.remove('active');
        cardViewBtn.classList.add('inactive');
    } else {
        cardViewBtn.classList.remove('inactive');
        cardViewBtn.classList.add('active');
        tableViewBtn.classList.remove('active');
        tableViewBtn.classList.add('inactive');
    }

    filterAndSearch();
}

function toggleCategoryDropdown() {
    // Not needed with new button grid approach
}

function selectCategory(category) {
    currentCategory = category;
    filterAndSearch();
}

function toggleSorting() {
    isSorted = !isSorted;
    sortStatus.textContent = isSorted ? 'Alphabetical order' : 'Default order';
    sortBtn.classList.toggle('bg-blue-50', isSorted);
    sortBtn.classList.toggle('text-blue-600', isSorted);
    filterAndSearch();
}

searchInput.addEventListener('input', () => {
    filterAndSearch();
});

renderCategoryDropdown();

categoryDropdownBtn.addEventListener('click', toggleDropdown);
sortBtn.addEventListener('click', toggleSorting);

tableViewBtn.addEventListener('click', () => setViewMode('table'));
cardViewBtn.addEventListener('click', () => setViewMode('card'));

hamburgerMenu.addEventListener('click', openSidebar);
closeSidebarBtn.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const isClickInsideDropdown = categoryDropdownBtn.contains(e.target) || categoryDropdownMenu.contains(e.target);
    if (!isClickInsideDropdown && !categoryDropdownMenu.classList.contains('hidden')) {
        closeDropdown();
    }
    
    // Close sidebar when clicking on main content area on mobile
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !hamburgerMenu.contains(e.target)) {
        closeSidebar();
    }
});

// Handle keyboard navigation
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // No dropdown to close anymore
    }
});

loadPinnedItems();
filterAndSearch();

// Initialize correct view based on screen size
if (window.innerWidth <= 768) {
    setViewMode('card');
    cardViewBtn.classList.remove('inactive');
    cardViewBtn.classList.add('active');
    tableViewBtn.classList.remove('active');
    tableViewBtn.classList.add('inactive');
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
