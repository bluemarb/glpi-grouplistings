const initGroupListings = () => {
    const toolbar = document.querySelector('.grouplistings-toolbar');
    const host = document.querySelector('.grouplistings-search-host');
    if (!toolbar || !host) return;

    const listingSelect = toolbar.querySelector('[data-ga-listing]');
    const groupField = toolbar.querySelector('[data-ga-group-field]');
    const groupButton = toolbar.querySelector('[data-ga-action="group"]');
    const status = toolbar.querySelector('[data-ga-status]');
    const itemtype = toolbar.dataset.itemtype || 'default';
    const expectedEntityLabel = (toolbar.dataset.entityLabel || 'Entity').trim().toLowerCase();
    const preferenceKey = `grouplistings.groupBy.${itemtype}`;
    let groupingEnabled = true;
    let observer;
    let refreshTimer;

    const cleanText = (value) => value.replace(/\s+/g, ' ').trim();
    const getHeaders = (table) => {
        const rows = table.tHead ? [...table.tHead.rows] : [];
        return rows.length ? [...rows[rows.length - 1].cells] : [];
    };
    const headerLabel = (header) => cleanText(header.textContent);

    const findSearchTable = () => [...host.querySelectorAll('table')].find((table) => {
        const headers = getHeaders(table);
        return headers.length > 1 && table.tBodies.length > 0;
    });

    const getTextParts = (cell) => {
        const parts = [];
        const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            const text = cleanText(node.nodeValue || '');
            if (text && parts[parts.length - 1] !== text) parts.push(text);
        }
        return parts;
    };

    const setRowVisibility = (header, collapsed) => {
        header.classList.toggle('is-collapsed', collapsed);
        header.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        let row = header.nextElementSibling;
        while (row && !row.classList.contains('ga-entity-row')) {
            row.classList.toggle('d-none', collapsed);
            row = row.nextElementSibling;
        }
    };

    const removeGrouping = (table) => {
        table.querySelectorAll('tr.ga-entity-row').forEach((row) => row.remove());
        table.querySelectorAll('tbody tr.d-none').forEach((row) => row.classList.remove('d-none'));
        const body = table.tBodies[0];
        if (!body) return;
        [...body.rows]
            .filter((row) => row.dataset.gaOriginalOrder !== undefined)
            .sort((a, b) => Number(a.dataset.gaOriginalOrder) - Number(b.dataset.gaOriginalOrder))
            .forEach((row) => body.appendChild(row));
    };

    const populateGroupFields = (headers) => {
        const available = headers
            .map((header, index) => ({index, label: headerLabel(header)}))
            .filter((field) => field.label !== '');
        if (!available.length) return false;

        const signature = available.map((field) => `${field.index}:${field.label}`).join('|');
        if (groupField.dataset.signature === signature) return true;

        const savedLabel = localStorage.getItem(preferenceKey);
        const entityField = available.find((field) => {
            const label = field.label.toLowerCase();
            return label === expectedEntityLabel || label === 'entity' || label === 'entitet';
        });
        const selected = available.find((field) => field.label === savedLabel)
            || entityField
            || available[0];

        groupField.replaceChildren();
        available.forEach((field) => {
            const option = document.createElement('option');
            option.value = String(field.index);
            option.textContent = field.label;
            option.selected = field.index === selected.index;
            groupField.appendChild(option);
        });
        groupField.disabled = false;
        groupField.dataset.signature = signature;
        return true;
    };

    const applyGrouping = () => {
        const table = findSearchTable();
        if (!table) {
            status.textContent = '';
            return;
        }

        observer?.disconnect();
        removeGrouping(table);
        const headers = getHeaders(table);
        if (!populateGroupFields(headers) || !groupingEnabled) {
            status.textContent = '';
            observer?.observe(host, {childList: true, subtree: true});
            return;
        }

        const groupIndex = Number(groupField.value);
        const selectedLabel = headerLabel(headers[groupIndex] || document.createElement('span'));
        const isEntity = ['entity', 'entitet', expectedEntityLabel].includes(selectedLabel.toLowerCase());
        const body = table.tBodies[0];
        const rows = [...body.rows].filter((row) => !row.classList.contains('ga-entity-row'));
        const dataRows = rows.filter((row) => row.cells.length > groupIndex);

        dataRows.forEach((row, index) => {
            if (row.dataset.gaOriginalOrder === undefined) row.dataset.gaOriginalOrder = String(index);
        });

        const groups = new Map();
        dataRows.forEach((row) => {
            const cell = row.cells[groupIndex];
            const parts = isEntity ? getTextParts(cell) : [cleanText(cell.textContent)];
            const normalizedParts = parts.filter(Boolean).length ? parts.filter(Boolean) : ['Empty'];
            const key = normalizedParts.join('\u001f');
            if (!groups.has(key)) groups.set(key, {parts: normalizedParts, rows: []});
            groups.get(key).rows.push(row);
        });

        groups.forEach((group) => {
            const leaf = group.parts[group.parts.length - 1];
            const parent = isEntity ? group.parts.slice(0, -1).join(' › ') : '';
            const header = document.createElement('tr');
            header.className = 'ga-entity-row';
            header.tabIndex = 0;
            header.setAttribute('role', 'button');
            header.setAttribute('aria-expanded', 'true');

            const cell = document.createElement('td');
            cell.colSpan = Math.max(headers.length, group.rows[0].cells.length);
            cell.innerHTML = '<div class="ga-entity-header"><span class="ga-entity-title">'
                + '<i class="ti ti-chevron-down ga-chevron" aria-hidden="true"></i>'
                + '<span class="ga-entity-levels"><span class="ga-entity-parent"></span>'
                + '<span class="ga-entity-childline"><span class="ga-entity-name"></span>'
                + '<span class="badge bg-blue-lt"></span></span></span></span></div>';
            const parentElement = cell.querySelector('.ga-entity-parent');
            parentElement.textContent = parent;
            parentElement.classList.toggle('d-none', parent === '');
            cell.querySelector('.ga-entity-name').textContent = leaf;
            cell.querySelector('.badge').textContent = String(group.rows.length);
            header.appendChild(cell);
            body.appendChild(header);
            group.rows.forEach((row) => body.appendChild(row));
            setRowVisibility(header, true);

            const toggle = () => setRowVisibility(header, !header.classList.contains('is-collapsed'));
            header.addEventListener('click', toggle);
            header.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggle();
                }
            });
        });

        status.textContent = `${groups.size} groups on this page`;
        observer?.observe(host, {childList: true, subtree: true});
    };

    listingSelect?.addEventListener('change', () => {
        const url = new URL(window.location.href);
        url.search = '';
        url.searchParams.set('itemtype', listingSelect.value);
        window.location.assign(url.toString());
    });

    groupField?.addEventListener('change', () => {
        localStorage.setItem(preferenceKey, groupField.options[groupField.selectedIndex].textContent);
        applyGrouping();
    });

    groupButton?.addEventListener('click', () => {
        groupingEnabled = !groupingEnabled;
        groupButton.setAttribute('aria-pressed', groupingEnabled ? 'true' : 'false');
        groupButton.classList.toggle('btn-primary', groupingEnabled);
        groupButton.classList.toggle('btn-outline-secondary', !groupingEnabled);
        groupButton.lastChild.textContent = groupingEnabled ? 'Grouping on' : 'Grouping off';
        applyGrouping();
    });

    toolbar.querySelector('[data-ga-action="expand"]')?.addEventListener('click', () => {
        host.querySelectorAll('.ga-entity-row').forEach((row) => setRowVisibility(row, false));
    });
    toolbar.querySelector('[data-ga-action="collapse"]')?.addEventListener('click', () => {
        host.querySelectorAll('.ga-entity-row').forEach((row) => setRowVisibility(row, true));
    });

    observer = new MutationObserver(() => {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(applyGrouping, 100);
    });
    observer.observe(host, {childList: true, subtree: true});
    applyGrouping();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGroupListings, {once: true});
} else {
    initGroupListings();
}
