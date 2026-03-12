/**
 * WORKWISE B2B HUB — App Logic
 * Phase 1: Card selection, module switching, greeting, Workwise chat
 */

/* ── Time-aware Greeting ────────────────────────────────────────── */
function initGreeting() {
    const hour = new Date().getHours();
    const labelEl = document.getElementById('greetingLabel');

    let greeting;
    if (hour >= 5 && hour < 12) greeting = 'Good morning';
    else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17 && hour < 21) greeting = 'Good evening';
    else greeting = 'Good evening';

    if (labelEl) labelEl.textContent = greeting;
}

/* ── Timeline Fill ─────────────────────────────────────────────── */
// Consolidated with the more comprehensive version at the end of the file


/* ── Module Switching ───────────────────────────────────────────── */
let activeModule = null;

const cards = document.querySelectorAll('.hub-card, .hub-widget');
const panels = document.querySelectorAll('.module-panel');
const mainCanvas = document.getElementById('mainCanvas');
const quickChips = document.querySelectorAll('.quick-chip');
const homeNavBtn = document.querySelector('.nav-btn[aria-label="Home"]');

function activateModule(moduleKey) {
    // Deactivate all cards
    cards.forEach(c => c.classList.remove('active'));

    // Hide all panels + main canvas
    panels.forEach(p => { p.hidden = true; });
    if (mainCanvas) mainCanvas.style.display = 'none';

    // Activate matching card/widget
    const targetCard = document.querySelector(`.hub-card[data-module="${moduleKey}"], .hub-widget[data-module="${moduleKey}"]`);
    if (targetCard) targetCard.classList.add('active');

    // Show matching panel
    const targetPanel = document.getElementById(`${moduleKey}-panel`);
    if (targetPanel) {
        targetPanel.hidden = false;
        // Re-trigger animation
        targetPanel.style.animation = 'none';
        targetPanel.offsetHeight; // reflow
        targetPanel.style.animation = '';
    }

    activeModule = moduleKey;

    // Init stack when Things to Do is opened
    if (moduleKey === 'todos') {
        requestAnimationFrame(() => requestAnimationFrame(initTodoStack));
    }
}

function deactivateAll() {
    cards.forEach(c => c.classList.remove('active'));
    panels.forEach(p => { p.hidden = true; });
    if (mainCanvas) mainCanvas.style.display = '';
    activeModule = null;
}

if (homeNavBtn) {
    homeNavBtn.addEventListener('click', deactivateAll);
}

// Card click handlers
cards.forEach(card => {
    const key = card.dataset.module;

    card.addEventListener('click', () => {
        if (activeModule === key) {
            deactivateAll(); // clicking active card toggles off
        } else {
            activateModule(key);
        }
    });

    // Keyboard accessibility
    card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
        }
    });
});

// Quick chip handlers (in greeting)
document.querySelectorAll('.gchip').forEach(chip => {
    chip.addEventListener('click', () => {
        const target = chip.dataset.target;
        if (target) activateModule(target);
    });
});

/* ── Workwise Chat Widget ───────────────────────────────────────── */
const workwiseWidget = document.getElementById('wwWidget');
const workwiseFab = document.getElementById('wwFab');
const workwiseTrigger = document.getElementById('workwiseTrigger'); // pill in search
const workwiseClose = document.getElementById('wwClose');
const wwInput = document.getElementById('wwInput');
const wwSend = document.getElementById('wwSend');
const wwBody = document.getElementById('wwBody');

let chatOpen = false;

function openChat() {
    chatOpen = true;
    workwiseWidget.classList.add('open');
    workwiseFab.classList.add('hidden');
    setTimeout(() => wwInput?.focus(), 250);
}

function closeChat() {
    chatOpen = false;
    workwiseWidget.classList.remove('open');
    workwiseFab.classList.remove('hidden');
}

workwiseFab?.addEventListener('click', () => {
    // Dynamically resolve the landing page URL relative to the current URL
    // Works whether served from scratch/ root or hub/ root
    const currentPath = window.location.pathname;
    let landingUrl;
    if (currentPath.includes('/workwise-b2b-hub/')) {
        // Served from parent scratch/ directory — use relative path
        landingUrl = '../workwise-landing/index.html';
    } else {
        // Served from hub/ root — fall back to sibling folder
        landingUrl = '../workwise-landing/index.html';
    }
    window.location.href = landingUrl;
});
workwiseTrigger?.addEventListener('click', openChat);
workwiseClose?.addEventListener('click', closeChat);

// Chat send logic (demo mode)
function sendMessage() {
    const text = wwInput.value.trim();
    if (!text) return;

    // Append user message
    const userMsg = document.createElement('div');
    userMsg.className = 'ww-msg ww-msg--user';
    userMsg.innerHTML = `<p style="background:var(--brand-500);color:#fff;border-radius:12px 12px 4px 12px;padding:10px 14px;font-size:13.5px;line-height:1.55;text-align:right;margin-left:auto;max-width:85%">${escapeHtml(text)}</p>`;
    wwBody.appendChild(userMsg);
    wwInput.value = '';
    wwBody.scrollTop = wwBody.scrollHeight;

    // Simulate AI response
    setTimeout(() => {
        const replies = [
            "I can help with that! Let me pull up the relevant information for you.",
            "Great question, Sarah. Here's what I found based on your recent data…",
            "On it! I'll check your performance metrics and get back to you with a summary.",
            "Sure — I can handle that task for you. Want me to start the workflow now?",
            "I've analysed your team's recent activity. Would you like a detailed breakdown?"
        ];
        const reply = replies[Math.floor(Math.random() * replies.length)];
        const botMsg = document.createElement('div');
        botMsg.className = 'ww-msg ww-msg--bot';
        botMsg.innerHTML = `<p>${reply}</p>`;
        wwBody.appendChild(botMsg);
        wwBody.scrollTop = wwBody.scrollHeight;
    }, 800);
}

wwSend?.addEventListener('click', sendMessage);
wwInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
});

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

/* ── Search bar behavior ─────────────────────────────────────────── */
const globalSearch = document.getElementById('globalSearch');
const searchPalette = document.getElementById('searchPalette');
const searchDropdown = document.getElementById('searchDropdown');
const searchClear = document.getElementById('searchClear');
const searchRotator = document.getElementById('searchRotator');
const rotatorText = document.getElementById('rotatorText');
const searchWorkspace = document.getElementById('searchWorkspace');

let isWorkspaceActive = false;

// ── Search Rotator Logic ──
const prompts = [
    "Open my goal sheet",
    "View skill rating review",
    "Go to role health",
    "Show skill gaps affecting role health",
    "Find manager rating mismatches",
    "Check feedback signals",
    "Search skills or ask Workwise",
    "Find goals, skills, feedback…"
];

let promptIndex = 0;
let rotatorInterval = null;
let isFocusPaused = false;

function startRotator() {
    if (rotatorInterval) clearInterval(rotatorInterval);
    rotatorInterval = setInterval(() => {
        if (isFocusPaused || globalSearch.value.trim().length > 0) return;

        rotatorText.classList.add('fade-out');
        setTimeout(() => {
            promptIndex = (promptIndex + 1) % prompts.length;
            rotatorText.textContent = prompts[promptIndex];
            rotatorText.classList.remove('fade-out');
        }, 300);
    }, 3500);
}

function handleRotatorVis() {
    if (globalSearch.value.length > 0) {
        searchRotator.style.display = 'none';
    } else {
        searchRotator.style.display = 'flex';
    }
}

// Start initially
startRotator();

/* ── Search Workspace Mode ─────────────────────────────────────── */

// Query → topic data mapping
const workspaceTopics = {
    skills: {
        agent: {
            name: 'Skill Coach',
            av: 'agents/pulse360.png',
            status: 'Ready',
            help: 'I found 2 rating mismatches affecting this skill portfolio and can help you review them.',
            prompts: [
                { label: 'Ask Workwise about this skill map', action: 'map' }
            ]
        },
        results: [
            { name: 'My Skill Portfolio', desc: 'View your mapped and validated skills', icon: 'award', target: 'coach' },
            { name: 'Current Role Skills', desc: 'Review differences between self and manager ratings', icon: 'check-square', target: 'coach' },
            { name: 'Role Health', desc: 'See how skills are affecting alignment', icon: 'activity', target: 'role' },
            { name: 'IDP Plan', desc: 'See development actions linked to flagged gaps', icon: 'calendar', target: 'todos' },
            { name: 'My Learnings', desc: 'Track active learning tied to these skills', icon: 'book-open', target: 'coach' }
        ],
        data: {
            skillsProgress: {
                val: 11,
                total: 14,
                label: 'Skills progress'
            },
            skillsBreakdown: {
                total: 14,
                validated: 11,
                pending: 3,
                roleHealth: 82,
                mismatches: 2
            }
        },
        ai: [
            'Calibration mismatch on 2 core skills is suppressing role health',
            'Validating "Strategic Design" will improve progression'
        ]
    }
};

function resolveTopicKey(query) {
    const q = query.trim().toLowerCase();
    if (q === 'skill' || q === 'skills') return 'skills';
    return null;
}

function enterSearchWorkspace() {
    const topicKey = resolveTopicKey(globalSearch.value);
    if (!topicKey) {
        exitSearchWorkspace();
        return;
    }
    if (isWorkspaceActive) {
        populateWorkspace(topicKey);
        return;
    }

    const greetingBody = document.querySelector('.greeting-body');
    const agentPills = document.querySelector('.agent-pill-row');

    greetingBody?.classList.add('sw-hiding');
    agentPills?.classList.add('sw-hiding');

    setTimeout(() => {
        if (greetingBody) greetingBody.style.display = 'none';
        if (agentPills) agentPills.style.display = 'none';

        populateWorkspace(topicKey);
        searchWorkspace.hidden = false;
        searchWorkspace.style.animation = 'none';
        searchWorkspace.offsetHeight;
        searchWorkspace.style.animation = '';

        isWorkspaceActive = true;
    }, 280);
}

function exitSearchWorkspace() {
    if (!isWorkspaceActive) return;

    const greetingBody = document.querySelector('.greeting-body');
    const agentPills = document.querySelector('.agent-pill-row');

    searchWorkspace.hidden = true;

    if (greetingBody) {
        greetingBody.style.display = '';
        greetingBody.classList.remove('sw-hiding');
    }
    if (agentPills) {
        agentPills.style.display = '';
        agentPills.classList.remove('sw-hiding');
    }

    isWorkspaceActive = false;
}


function populateWorkspace(topicKey) {
    const topic = workspaceTopics[topicKey];
    if (!topic) return;

    // 1. Primary Grid (Left Rail)
    const swResults = document.getElementById('swResults');
    if (swResults) {
        swResults.innerHTML = '';
        topic.results.forEach((res, idx) => {
            const item = document.createElement('a');
            item.className = `sw-result-item ${idx === 0 ? 'active' : ''}`;
            item.innerHTML = `
                <div class="sw-rail-icon"><i data-lucide="${res.icon}"></i></div>
                <div class="sw-rail-text">
                    <div class="sw-rail-title">${res.name}</div>
                    ${res.desc ? `<div class="sw-rail-desc">${res.desc}</div>` : ''}
                </div>
            `;
            item.addEventListener('click', (e) => {
                e.preventDefault();
                activateModule(res.target);
                globalSearch.value = '';
                searchClear.hidden = true;
                handleRotatorVis();
                exitSearchWorkspace();
            });
            swResults.appendChild(item);
        });
    }

    // 2. Skill Coach Identity (top of right panel)
    const swAgentName = document.getElementById('swAgentName');
    const swAgentAv = document.getElementById('swAgentAv');
    const swAgentStatus = document.querySelector('.sw-agent-status');

    if (topic.agent && swAgentName) {
        swAgentName.textContent = topic.agent.name;
        swAgentAv.src = topic.agent.av;
        if (swAgentStatus) swAgentStatus.textContent = topic.agent.status;
    }

    // 3. Skill Metrics (Ring + Supporting Data)
    const swData = document.getElementById('swData');
    if (swData && topic.data) {
        let html = '';
        if (topic.data.skillsProgress && topic.data.skillsBreakdown) {
            const sp = topic.data.skillsProgress;
            const sb = topic.data.skillsBreakdown;

            // Calculate SVG circle properties
            const radius = 36;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (sp.val / sp.total) * circumference;
            const ringColor = sb.pending > 0 ? '#F59E0B' : '#10B981';

            html += `
            <div class="sw-portfolio-snapshot">
                <div class="sw-radial-wrapper">
                    <svg class="sw-radial-ring" width="88" height="88" viewBox="0 0 88 88">
                        <circle class="sw-radial-bg" cx="44" cy="44" r="${radius}" />
                        <circle class="sw-radial-progress" cx="44" cy="44" r="${radius}" 
                            stroke="${ringColor}" 
                            stroke-dasharray="${circumference}" 
                            stroke-dashoffset="${strokeDashoffset}" />
                    </svg>
                    <div class="sw-radial-content">
                        <span class="sw-radial-val">${sp.val}</span>
                        <span class="sw-radial-lbl">/ ${sp.total}</span>
                    </div>
                </div>
                <div class="sw-radial-title">${sp.label}</div>

                <div class="sw-mapped-skills">
                    
                    <div class="sw-ms-row">
                        <i data-lucide="activity" class="sw-ms-icon sw-ms-icon--neutral"></i>
                        <span class="sw-ms-row-lbl">Role health — ${sb.roleHealth} / 100</span>
                    </div>

                    <div class="sw-ms-row">
                        <i data-lucide="check-circle-2" class="sw-ms-icon sw-ms-icon--validated"></i>
                        <span class="sw-ms-row-lbl">${sb.validated} validated</span>
                    </div>

                    <div class="sw-ms-row">
                        <i data-lucide="clock" class="sw-ms-icon sw-ms-icon--pending"></i>
                        <span class="sw-ms-row-lbl">${sb.pending} pending manager validation</span>
                    </div>

                    <div class="sw-ms-row">
                        <i data-lucide="alert-circle" class="sw-ms-icon sw-ms-icon--caution"></i>
                        <span class="sw-ms-row-lbl">Manager mismatches — ${sb.mismatches}</span>
                    </div>

                </div>
            </div>`;
            swData.className = 'sw-coach-metrics';
        }

        swData.innerHTML = html;
    }

    // 4. AI Insights
    const swAI = document.getElementById('swAI');
    if (topic.ai && swAI) {
        swAI.innerHTML = topic.ai.map(signal => `
            <div class="sw-insight-signal">${signal}</div>
        `).join('');
    }

    // 5. Coach Guidance
    const swHelpMessage = document.getElementById('swHelpMessage');
    if (swHelpMessage && topic.agent) {
        swHelpMessage.textContent = topic.agent.help;
    }

    // 6. CTA (Primary Action Button)
    const swCoachTopBtn = document.getElementById('swCoachTopBtn');
    if (swCoachTopBtn) {
        if (topic.agent && topic.agent.prompts.length > 0) {
            swCoachTopBtn.hidden = false;

            // Ensure we don't layer multiple click listeners across searches
            const newBtn = swCoachTopBtn.cloneNode(true);
            swCoachTopBtn.replaceWith(newBtn);

            newBtn.addEventListener('click', () => {
                openCoachModal();
            });
        } else {
            swCoachTopBtn.hidden = true;
        }
    }

    // Global Lucide refresh
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

/* ── Search Event Listeners ── */

globalSearch?.addEventListener('input', () => {
    const hasText = globalSearch.value.trim().length > 0;
    searchClear.hidden = !hasText;
    handleRotatorVis();

    if (hasText) {
        enterSearchWorkspace();
    } else {
        exitSearchWorkspace();
    }
});

globalSearch?.addEventListener('focus', () => {
    isFocusPaused = true;
    const topicKey = resolveTopicKey(globalSearch.value);
    if (topicKey) enterSearchWorkspace();
});

globalSearch?.addEventListener('blur', () => {
    isFocusPaused = false;
});

globalSearch?.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isWorkspaceActive) {
        globalSearch.value = '';
        searchClear.hidden = true;
        handleRotatorVis();
        exitSearchWorkspace();
        globalSearch.blur();
    } else if (e.key === 'Enter' && !isWorkspaceActive) {
        openChat();
    }
});

searchClear?.addEventListener('click', () => {
    globalSearch.value = '';
    searchClear.hidden = true;
    handleRotatorVis();
    exitSearchWorkspace();
});


/* ── Theme Toggle Logic ─────────────────────────────────────────── */
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const darkBtn = document.getElementById('themeDark');
    const lightBtn = document.getElementById('themeLight');

    if (darkBtn && lightBtn) {
        darkBtn.classList.toggle('active', theme === 'dark');
        lightBtn.classList.toggle('active', theme === 'light');
        darkBtn.setAttribute('aria-pressed', theme === 'dark');
        lightBtn.setAttribute('aria-pressed', theme === 'light');
    }
}

/* ── Global Agent Popover ────────────────────────────────────────── */
/* ── Things To Do Data (Real Platform Areas) ────────────────────── */
const thingsToDo = [
    {
        id: 'skills',
        area: 'Skill Rating Review',
        detail: '2 ratings differ from manager review',
        agent: 'skillcoach',
        cta: 'Open Review',
        target: 'coach',
        img: 'agents/talent-atlas.png',
        abbr: 'SC'
    },
    {
        id: 'goals',
        area: 'Goal Sheet Review',
        detail: '1 KPI goal needs update',
        agent: 'goalforge',
        cta: 'Update Goals',
        target: 'todos',
        img: 'agents/goalforge.png',
        abbr: 'GF'
    },
    {
        id: 'feedback',
        area: '360 Feedback Review',
        detail: '3 peer responses are ready',
        agent: 'pulse360',
        cta: 'Read Feedback',
        target: 'insights',
        img: 'agents/pulse360.png',
        abbr: 'P3'
    },
    {
        id: 'idp',
        area: 'IDP Review',
        detail: 'Development plan is ready for review',
        agent: 'growthplanner',
        cta: 'Activate Plan',
        target: 'todos',
        img: 'agents/growth-planner.png',
        abbr: 'GP'
    }
];

/* ── Agent Data (Popover content) ── */
const agentData = {
    skillcoach: { name: 'Skill Coach', line: 'Skills recorded, but calibration is pending.', item: '2 ratings differ from manager review', cta: 'Open Review →', target: 'coach' },
    goalforge: { name: 'GoalForge', line: 'Your Q1 OKRs are 3 days from deadline.', item: '1 KPI goal needs update', cta: 'Update Goals →', target: 'todos' },
    pulse360: { name: 'Pulse360', line: 'Team sentiment signal updated.', item: '3 peer responses are ready', cta: 'Read Feedback →', target: 'insights' },
    growthplanner: { name: 'GrowthPlanner', line: 'Your IDP action is linked to a skill gap.', item: 'Development plan is ready', cta: 'Activate Plan →', target: 'todos' }
};

/* ── Dynamic Agent Strip ── */
function renderAgentStrip() {
    const strip = document.getElementById('agentStrip');
    if (!strip) return;

    if (thingsToDo.length === 0) {
        strip.style.display = 'none';
        return;
    }

    strip.style.display = 'flex';
    strip.innerHTML = '';

    thingsToDo.forEach((task) => {
        const chip = document.createElement('div');
        chip.className = 'as-chip';
        chip.dataset.agent = task.agent;
        chip.id = `asChip-${task.agent}`;

        chip.innerHTML = `
            <div class="as-av" style="background:var(--s2)">
                <img src="${task.img}" alt="${task.agent}"
                    onerror="this.style.display='none';this.parentElement.innerHTML='<span style=\'font-size:7px;font-weight:800;color:var(--purple)\'>${task.abbr}</span>'" />
            </div>
        `;

        strip.appendChild(chip);

        chip.addEventListener('click', (e) => {
            e.stopPropagation();
            const asPopover = document.getElementById('asPopover');
            if (asPopover) showAgentPopover(chip, asPopover);
        });
    });

    const popoverTemplate = `
        <div class="as-popover" id="asPopover" hidden>
            <button class="as-pop-close" id="asPopClose">✕</button>
            <p class="as-pop-name" id="asPopName"></p>
            <p class="as-pop-line" id="asPopLine"></p>
            <p class="as-pop-item" id="asPopItem"></p>
            <a class="as-pop-cta" id="asPopCta"></a>
        </div>
    `;
    strip.insertAdjacentHTML('beforeend', popoverTemplate);

    const asPopover = document.getElementById('asPopover');
    document.getElementById('asPopClose')?.addEventListener('click', (e) => {
        e.stopPropagation();
        asPopover.hidden = true;
    });

    document.getElementById('asPopCta')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = e.target.dataset.target;
        if (target) activateModule(target);
        asPopover.hidden = true;
    });
}

function showAgentPopover(chip, asPopover) {
    let type = chip.dataset.agent;
    const data = agentData[type];
    if (!data) return;

    document.getElementById('asPopName').textContent = data.name;
    document.getElementById('asPopLine').textContent = data.line;
    document.getElementById('asPopItem').textContent = data.item;
    const cta = document.getElementById('asPopCta');
    cta.textContent = data.cta;
    cta.dataset.target = data.target;

    asPopover.hidden = false;

    const rect = chip.getBoundingClientRect();
    const popoverWidth = 240;
    asPopover.style.position = 'fixed';
    asPopover.style.top = `${rect.top - 12}px`;
    asPopover.style.transform = 'translateY(-100%)';

    const chipCenter = rect.left + rect.width / 2;
    const rawLeft = chipCenter - popoverWidth / 2;
    const clampedLeft = Math.max(12, Math.min(rawLeft, window.innerWidth - popoverWidth - 12));
    asPopover.style.left = `${clampedLeft}px`;
}

function initAgentPopovers() {
    const asPopover = document.getElementById('asPopover');
    // Delegation for non-pill chips (timeline, etc)
    document.addEventListener('click', (e) => {
        const chip = e.target.closest('.tl-av, .coach-av, .iblock-av, .inbox-agent-avatar');
        if (chip) {
            e.stopPropagation();
            showAgentPopover(chip, asPopover || document.getElementById('asPopover'));
            return;
        }
        if (asPopover && !asPopover.hidden && !asPopover.contains(e.target)) {
            asPopover.hidden = true;
        }
    });
}

/* ── Prepared Work Cards ────────────────────────────────────────── */
function initPrepCards() {
    document.querySelectorAll('.prep-card').forEach(card => {
        const moduleKey = card.dataset.module;
        if (!moduleKey) return;
        card.addEventListener('click', () => activateModule(moduleKey));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateModule(moduleKey); }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initGreeting();
    initPrepCards();
    initAgentPopovers();
    initTodoStack();


    document.getElementById('themeDark')?.addEventListener('click', () => setTheme('dark'));
    document.getElementById('themeLight')?.addEventListener('click', () => setTheme('light'));

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setTheme(savedTheme);

    deactivateAll();
});

// Consolidated with initTodoStack below


/* ── TODO STACK INITIALIZATION ─────────────────────────────────── */
function initTodoStack() {
    const todosPanel = document.getElementById('todos-panel');
    const cards = document.querySelectorAll('.todo-card');

    if (!todosPanel || cards.length === 0) return;

    // Fade in cards with a slight delay for a premium feel
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px)';
        card.style.transition = `all 400ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 100}ms`;

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 50);
    });
}


/* ── AGENT POPUPS LOGIC ────────────────────────────────────────── */
const agentDataMap = {
    skillmatrix: {
        avatar: "agents/pulse360.png",
        name: "SkillMatrix",
        role: "Skill calibration agent",
        summary: "I reviewed the current skill ratings and compared self-ratings with manager validation.",
        findings: [
            "2 skill ratings differ from manager review",
            "1 skill has been marked as a gap",
            "3 skills are still pending validation"
        ],
        impact: "These rating differences are affecting current role alignment and reducing role health.",
        cta: "Open skill rating review →"
    },
    rolearchitect: {
        avatar: "agents/insight360.png",
        name: "RoleArchitect",
        role: "Role health agent",
        summary: "I checked current role alignment using skill validation status and manager-reviewed capability signals.",
        findings: [
            "Role health is 76 / 100",
            "Skill validation gaps are reducing alignment",
            "1 manager-marked skill gap is contributing to the score drop"
        ],
        impact: "Role health reflects how well the employee’s validated capability profile aligns with the role expectations.",
        cta: "Open role health →"
    },
    talentatlas: {
        avatar: "agents/talent-atlas.png",
        name: "TalentAtlas",
        role: "Role and benchmark agent",
        summary: "I compared the current role skill structure with the mapped expectations and benchmarked competency framework.",
        findings: [
            "Core role-to-skill mapping is in place",
            "Most mapped skills align with the expected role structure",
            "1 capability area should be tracked for future development"
        ],
        impact: "This helps confirm whether the current role setup and mapped skills are structurally aligned before deeper review.",
        cta: "View my skills →"
    },
    flowgen: {
        avatar: "agents/goalforge.png",
        name: "Flowgen",
        role: "Goal structure agent",
        summary: "I reviewed the current goal sheet structure and checked whether the active goals are ready for performance review.",
        findings: [
            "Performance health is 3.8 / 5",
            "1 KPI goal still needs update",
            "Overall goal structure is mostly healthy"
        ],
        impact: "The goal sheet health reflects whether the current performance plan is complete and review-ready.",
        cta: "Open goal sheet →"
    }
};

function openAgentPopup(agentId) {
    try {
        const data = agentDataMap[agentId];
        if (!data) return;

        const apOverlay = document.getElementById('apOverlay');
        const apPanel = document.getElementById('apPanel');

        if (document.getElementById('apAvatar')) document.getElementById('apAvatar').src = data.avatar;
        if (document.getElementById('apName')) document.getElementById('apName').textContent = data.name;
        if (document.getElementById('apRole')) document.getElementById('apRole').textContent = data.role;
        if (document.getElementById('apSummary')) document.getElementById('apSummary').textContent = data.summary;

        const apFindings = document.getElementById('apFindings');
        if (apFindings) {
            apFindings.innerHTML = '';
            data.findings.forEach(f => {
                const li = document.createElement('li');
                li.textContent = f;
                apFindings.appendChild(li);
            });
        }

        if (document.getElementById('apImpact')) document.getElementById('apImpact').textContent = data.impact;
        if (document.getElementById('apCta')) document.getElementById('apCta').textContent = data.cta;

        if (apPanel) {
            apPanel.style.animation = 'none';
            apPanel.offsetHeight; // force reflow
            apPanel.style.animation = '';
        }

        if (apOverlay) {
            apOverlay.hidden = false;
        } else {
            console.error('apOverlay not found in DOM');
        }
    } catch (err) {
        console.error('Error opening agent popup:', err);
    }
}

function closeAgentPopup() {
    const apOverlay = document.getElementById('apOverlay');
    if (apOverlay) apOverlay.hidden = true;
}

document.addEventListener('click', (e) => {
    // Check if click was inside an agent pill
    const pill = e.target.closest('.agent-pill[data-agent]');
    if (pill) {
        e.preventDefault(); // Prevent accidental unwanted behaviors
        e.stopPropagation();
        openAgentPopup(pill.getAttribute('data-agent'));
        return;
    }

    // Check if click was on the close button or backdrop
    const closeBtn = e.target.closest('#apClose');
    const apOverlay = document.getElementById('apOverlay');
    if (closeBtn || (apOverlay && e.target === apOverlay)) {
        closeAgentPopup();
    }
});

/* ── Skill Coach Modal Logic ──────────────────────────────────── */

function openCoachModal() {
    const coachModal = document.getElementById('coachModal');
    if (!coachModal) return;
    coachModal.hidden = false;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    // Refresh Lucide icons in modal
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function closeCoachModal() {
    const coachModal = document.getElementById('coachModal');
    if (!coachModal) return;
    coachModal.hidden = true;
    document.body.style.overflow = '';
}

// Global listener for Modal Actions
document.addEventListener('click', (e) => {
    // Backdrop click
    const coachModal = document.getElementById('coachModal');
    if (coachModal && e.target === coachModal) {
        closeCoachModal();
        return;
    }

    // Close button click (using delegation)
    const closeBtn = e.target.closest('#closeCoachModal');
    if (closeBtn) {
        closeCoachModal();
    }
});

// Escape key listener (merged / updated)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const apOverlay = document.getElementById('apOverlay');
        const coachModal = document.getElementById('coachModal');

        if (apOverlay && !apOverlay.hidden) closeAgentPopup();
        if (coachModal && !coachModal.hidden) closeCoachModal();
    }
});


