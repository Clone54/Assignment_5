let allIssues = [];
let filteredIssues = [];
let currentFilter = 'all';

const URL = 'https://phi-lab-server.vercel.app/api/v1/lab';

const labelStyles = {
    'bug': {
        classes: 'border-[#FECACA] text-[#EF4444] bg-[#FEECEC]',
        icon : 'fa-solid fa-bug',
        label: 'BUG'
    },
    'help wanted':{
        classes: ' border-[#FDE68A] text-[#D97706] bg-[#FFF8DB]',
        icon: 'fa-solid fa-handshake-angle',
        label: 'HELP'
    },
    'enhancement':{
        classes: 'border-[#BBF7D0] bg-[#DEFCE8] text-[#00A96F]',
        icon: 'fa-solid fa-wand-magic-sparkles',
        label: 'ENHANCEMENT'
    },
    'good first issue':{
        classes: 'border-[#BFDBFE] bg-[#E0F2FE] text-[#3B82F6]',
        icon: 'fa-brands fa-gg',
        label: 'GOOD ISSUE'
    },
    'documentation':{
        classes: 'border-[#F3E8FF] bg-[#FAF5FF] text-[#A855F7]',
        icon: 'fa-solid fa-book',
        label: 'DOCUMENTATION'
    }
    
}

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === 'admin' && pass === 'admin123') {
        showDashboard();
    } else {
        alert("Invalid Credentials", "Please use admin / admin123", "error");
    }
});

function showDashboard() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('main-page').classList.remove('hidden');
    fetchIssues();
}

async function fetchIssues() {
    const grid = document.getElementById('issues-grid');
    if (grid) grid.innerHTML = '';
    showLoader(true);

    try {
        const response = await fetch(`${URL}/issues`);
        const data = await response.json();
        allIssues = data.data || data || []; 
        
        updateCounters();
        filterIssues(currentFilter);
    } catch (error) {
        console.error("Error fetching issues:", error);
        alert("Fetch Error", "Failed to load issues from server", "error");
    } finally {
        showLoader(false);
    }
}

document.getElementById('search-btn').addEventListener('click', performSearch);
document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

async function performSearch() {
    const notifications = document.getElementById('search-input').value.trim();
    if (!notifications) {
        fetchIssues();
        return;
    }

    const grid = document.getElementById('issues-grid');
    if (grid) grid.innerHTML = '';
    showLoader(true);

    try {
        const response = await fetch(`${URL}/issues/search?q=${notifications}`);
        const data = await response.json();
        filteredIssues = data.data || data || [];
        renderIssues(filteredIssues);
        updateDisplayCount(filteredIssues.length);
    } catch (error) {
        console.error("Search error:", error);
    } finally {
        showLoader(false);
    }
}

function updateCounters() {
    const open = allIssues.filter(i => i.status && i.status.toLowerCase() === 'open').length;
    const closed = allIssues.filter(i => i.status && i.status.toLowerCase() === 'closed').length;
    document.getElementById('open-count').innerText = open;
    document.getElementById('closed-count').innerText = closed;
}

function filterIssues(status) {
    currentFilter = status;
    document.querySelectorAll('[id^="tab-"]').forEach(el => el.classList.remove('active-tab'));
    const activeTab = document.getElementById(`tab-${status}`);
    if (activeTab) activeTab.classList.add('active-tab');

    if (status === 'all') {
        filteredIssues = allIssues;
    } else {
        filteredIssues = allIssues.filter(i => i.status && i.status.toLowerCase() === status);
    }

    updateCount(filteredIssues.length);
    renderIssues(filteredIssues);
}

//count format er jonno dilam hudai
function updateCount(count) {
    document.getElementById('issue-count-display').innerText = `${count} Issue${count !== 1 ? 's' : ''}`;
}

function renderIssues(issues) {
    const grid = document.getElementById('issues-grid');
    grid.innerHTML = '';

    if (!issues || issues.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-12 text-center text-gray-500">No issues found matching the criteria.</div>`;
        return;
    }

    issues.forEach(issue => {
        const status = (issue.status || 'open').toLowerCase();
        const isClosed = status === 'closed';
        const borderColor = isClosed ? 'border-purple-500' : 'border-green-500';
        const statusColor = isClosed ? 'text-purple-600 bg-purple-50' : 'text-green-600 bg-green-50';
        
        const rawId = issue.id;
        const displayId = String(rawId).slice(-4);

        const card = document.createElement('div');
        card.className = `issue-card bg-white rounded-lg border border-0.2 shadow-sm border-t-5 ${borderColor} p-5 flex flex-col h-full`;

        const statusIcon = issue.status === 'closed' ? 'assets/Closed-Status.png' : 'assets/Open-Status.png';

        const priority = (issue.priority || 'low').toLowerCase();
        
        let pColor = 'bg-gray-400';
        if (priority === 'high') pColor = 'bg-[#FEECEC] text-[#EF4444]';
        else if (priority === 'medium') pColor = 'bg-[#FFF6D1] text-[#F59E0B]';
        else if (priority === 'low') pColor = 'bg-[#EEEFF2] text-[#9CA3AF]';
        
        card.innerHTML = `
        <div  onclick="showIssueDetail('${issue.id}')" class = "cursor-pointer">
            <div class="flex justify-between items-start mb-3">
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${statusColor}"><img src="${statusIcon}" alt="${issue.status || 'Open'}" class="h-4 w-4 inline-block"></span>
                <span class="px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider ${pColor} font-mono">${issue.priority}</span>
            </div>
            <h3 class="text-base font-bold text-gray-900 mb-2 transition truncate" title="${issue.title || 'No Title'}">
                ${issue.title || 'No Title'}
            </h3>
            <p class="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                ${issue.description || 'No description provided.'}
            </p>
            <div class="flex items-center gap-2">
                ${(issue.labels || [])
                    .filter(label => label && label.trim() !== '')
                    .map(label => {
                        const key = label.toLowerCase().trim();
                        const style = labelStyles[key];

                        return `
                            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-[11px] font-bold ${style.classes}">
                                <i class="${style.icon}"></i> ${style.label}
                            </span>
                        `;
                    }).join('')}
            </div>
            <div class="space-y-3 mt-auto pt-4">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-medium text-gray-700">#${displayId} by ${issue.author || 'Unknown'}</span>
                </div>
                <div>
                    <p class="text-xs font-medium text-gray-700">${issue.createdAt.split('T')[0]}</p>
                </div>
            </div>
        </div>
        `;
        grid.appendChild(card);
    });
}

async function showIssueDetail(id) {
    showLoader(true); 
    
    try {
        const response = await fetch(`${URL}/issue/${id}`);
        const data = await response.json();
        const issue = data.data || data;

        if (!issue) throw new Error("Issue not found");

        document.getElementById('modal-title').innerText = issue.title || 'No Title';
        document.getElementById('modal-desc').innerText = issue.description || 'No description provided.';
        document.getElementById('modal-author').innerText = issue.author || 'Unknown';
        
        const dateStr = issue.createdAt ? new Date(issue.createdAt).toLocaleDateString('en-GB') : 'Unknown Date';
        document.getElementById('modal-meta-text').innerText = `Opened by ${issue.author || 'Admin'} • ${dateStr}`;

        const statusBadge = document.getElementById('modal-status-badge');
        const status = (issue.status).toLowerCase();
        statusBadge.innerText = `${issue.status === 'closed' ? 'CLOSED' : 'OPENED'}`;
        statusBadge.className = `px-3 py-1 rounded-full text-white font-bold text-xs uppercase ${status === 'closed' ? 'bg-purple-500' : 'bg-green-800'}`;

        const priorityBadge = document.getElementById('modal-priority-badge');
        const priority = (issue.priority || 'low').toLowerCase();
        priorityBadge.innerText = (issue.priority || 'LOW').toUpperCase();
        
        let pColor = 'bg-gray-400';
        if (priority === 'high') pColor = 'bg-[#ff4d4d]';
        else if (priority === 'medium') pColor = 'bg-[#ff9f43]';
        else if (priority === 'low') pColor = 'bg-gray-400';
        priorityBadge.className = `px-4 py-1.5 rounded-full text-white font-black text-xs uppercase tracking-wider ${pColor}`;

        const tags = document.getElementById('modal-tags');
        tags.innerHTML = `
            <div class="flex items-center gap-2">
                ${(issue.labels || [])
                    .filter(label => label && label.trim() !== '')
                    .map(label => {
                        const key = label.toLowerCase().trim();
                        const style = labelStyles[key];

                        return `
                            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-[11px] font-bold ${style.classes}">
                                <i class="${style.icon}"></i> ${style.label}
                            </span>
                        `;
                    }).join('')}
        `;

        document.getElementById('issue-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error("Modal fetch error:", error);
        showMessage("Error", "Could not load issue details", "error");
    } finally {
        showLoader(false);
    }
}

function closeModal() {
    document.getElementById('issue-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.toggle('hidden', !show);
}