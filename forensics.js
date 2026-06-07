/* ═══════════════════════════════════════════════════════════
   Win Forensics — Shared JS
   Sidebar collapsible groups + state persistence
═══════════════════════════════════════════════════════════ */

const NAV_STORAGE_KEY = 'wf-nav-state';

document.addEventListener('DOMContentLoaded', () => {
    buildCollapsibleNav();
    restoreNavState();
    buildCollapseAllButton();
    initCommandTemplating();
});

/* ═══════════════════════════════════════════════════════════
   COMMAND TEMPLATING
   Rewrites any .command[data-tmpl] by substituting tokens with
   values typed into matching input bars. Each token's value
   persists across pages via localStorage.
     {u} — username  → "<name>_" (or nothing when blank)
     {d} — drive     → "<letter>" (defaults to "C" when blank)
     {e} — MFT entry → "<number>" (defaults to "624" when blank)
═══════════════════════════════════════════════════════════ */

const TEMPLATE_TOKENS = [
    { token: '{u}', inputId: 'wf-user-input',  storageKey: 'wf-username', format: v => v ? v + '_' : '' },
    { token: '{d}', inputId: 'wf-drive-input', storageKey: 'wf-drive',    format: v => v || 'C' },
    { token: '{e}', inputId: 'wf-entry-input', storageKey: 'wf-entry',    format: v => v || '624' },
];

function initCommandTemplating() {
    const tmplCmds = document.querySelectorAll('.command[data-tmpl]');
    if (tmplCmds.length === 0) return;

    const tokens = TEMPLATE_TOKENS.map(t => {
        let saved = '';
        try { saved = localStorage.getItem(t.storageKey) || ''; } catch (e) {}
        return Object.assign({}, t, { input: document.getElementById(t.inputId), value: saved });
    });

    function render() {
        tmplCmds.forEach(el => {
            let out = el.getAttribute('data-tmpl');
            tokens.forEach(t => { out = out.split(t.token).join(t.format(t.value)); });
            el.textContent = out;
        });
    }

    tokens.forEach(t => {
        if (!t.input) return;
        t.input.value = t.value;
        t.input.addEventListener('input', () => {
            t.value = t.input.value.trim();
            try { localStorage.setItem(t.storageKey, t.value); } catch (e) {}
            render();
        });
    });
    render();
}

function buildCollapsibleNav() {
    const ul = document.querySelector('.side-nav ul');
    if (!ul) return;

    const items = Array.from(ul.children);
    let i = 0;

    while (i < items.length) {
        const item = items[i];

        if (item.classList.contains('nav-group')) {
            // Collect all items that belong to this group
            const groupItems = [];
            let j = i + 1;

            while (j < items.length) {
                const next = items[j];
                if (next.classList.contains('nav-group') || next.classList.contains('nav-divider')) break;
                groupItems.push(next);
                j++;
            }

            if (groupItems.length > 0) {
                // Create a unique ID for this group
                const groupId = 'navg-' + item.textContent.trim().toLowerCase().replace(/\s+/g, '-');
                item.setAttribute('data-navgroup', groupId);

                // Add arrow icon
                const arrow = document.createElement('span');
                arrow.className = 'nav-group-arrow';
                arrow.textContent = '▾';
                item.appendChild(arrow);

                // Wrap group items in a collapsible container
                const wrapper = document.createElement('li');
                wrapper.className = 'nav-group-body';
                wrapper.setAttribute('data-navbody', groupId);

                const innerUl = document.createElement('ul');
                groupItems.forEach(gi => innerUl.appendChild(gi));
                wrapper.appendChild(innerUl);

                // Insert wrapper after the group header
                item.after(wrapper);

                // Click to toggle
                item.style.cursor = 'pointer';
                item.addEventListener('click', () => toggleNavGroup(groupId));
            }

            // Re-read items after DOM change
            const newItems = Array.from(ul.children);
            items.length = 0;
            newItems.forEach(n => items.push(n));
            i = items.indexOf(item) + 1;

        } else {
            i++;
        }
    }
}

function toggleNavGroup(groupId) {
    const body  = document.querySelector(`[data-navbody="${groupId}"]`);
    const arrow = document.querySelector(`[data-navgroup="${groupId}"] .nav-group-arrow`);
    if (!body) return;

    const collapsed = body.classList.toggle('nav-collapsed');
    if (arrow) arrow.textContent = collapsed ? '▸' : '▾';

    // Save state
    const state = JSON.parse(localStorage.getItem(NAV_STORAGE_KEY) || '{}');
    state[groupId] = collapsed;
    localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(state));
}

/* ═══════════════════════════════════════════════════════════
   COLLAPSE / EXPAND ALL SECTIONS
═══════════════════════════════════════════════════════════ */

function buildCollapseAllButton() {
    const main  = document.querySelector('.main-content');
    const title = main && main.querySelector('.page-title');
    const sections = main && main.querySelectorAll('.topic-body, .cl-section-body');
    if (!main || !sections || sections.length === 0) return;

    const bar = document.createElement('div');
    bar.className = 'collapse-all-bar';

    const btn = document.createElement('button');
    btn.className = 'collapse-all-btn';
    btn.innerHTML = '⊖ Collapse All';
    btn.setAttribute('data-collapsed', 'false');

    btn.addEventListener('click', () => {
        const isCollapsed = btn.getAttribute('data-collapsed') === 'true';
        document.querySelectorAll('.topic-body').forEach(body => {
            const toggle = document.querySelector(`[data-toggle="${body.id}"] .toggle-icon`);
            if (isCollapsed) {
                body.classList.remove('collapsed');
                if (toggle) toggle.textContent = '▼';
            } else {
                body.classList.add('collapsed');
                if (toggle) toggle.textContent = '▶';
            }
        });
        document.querySelectorAll('.cl-section-body').forEach(body => {
            const icon = body.previousElementSibling?.querySelector('.cl-toggle-icon');
            if (isCollapsed) {
                body.classList.remove('collapsed');
                if (icon) icon.textContent = '▼';
            } else {
                body.classList.add('collapsed');
                if (icon) icon.textContent = '▶';
            }
        });
        btn.setAttribute('data-collapsed', isCollapsed ? 'false' : 'true');
        btn.innerHTML = isCollapsed ? '⊖ Collapse All' : '⊕ Expand All';
    });

    bar.appendChild(btn);

    // Insert after the page title
    if (title && title.nextSibling) {
        main.insertBefore(bar, title.nextSibling);
    } else if (title) {
        title.after(bar);
    } else {
        main.prepend(bar);
    }
}

function restoreNavState() {
    const state = JSON.parse(localStorage.getItem(NAV_STORAGE_KEY) || '{}');
    Object.entries(state).forEach(([groupId, collapsed]) => {
        if (collapsed) {
            const body  = document.querySelector(`[data-navbody="${groupId}"]`);
            const arrow = document.querySelector(`[data-navgroup="${groupId}"] .nav-group-arrow`);
            if (body)  body.classList.add('nav-collapsed');
            if (arrow) arrow.textContent = '▸';
        }
    });
}
