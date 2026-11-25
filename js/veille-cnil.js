/**
 * veille-cnil.js — Composant Veille Technologique (Flux RSS CNIL)
 * ---------------------------------------------------------------------------
 * Ce module gère l'affichage dynamique des articles de veille (cybersécurité,
 * RGPD, protection des données) avec skeleton loader, gestion d'erreur et
 * rendu sécurisé contre les injections XSS.
 *
 * COMMENT BRANCHER VOTRE FLUX CNIL :
 * 1. Renseignez l'URL / chemin JSON dans `CNIL_CONFIG` (Zone 1).
 * 2. Implémentez ou adaptez `fetchCustomCnilArticles()` (Zone 2) pour parser
 *    votre XML/JSON et retourner un tableau d'objets normalisés.
 */

// ============================================================================
// [ZONE D'INJECTION 1 : CONFIGURATION DU FLUX RSS / JSON CNIL]
// Remplacez `feedUrl` par votre endpoint (ex: './data/cnil.json', API proxy,
// rss2json, worker Cloudflare, etc.)
// ============================================================================
const CNIL_CONFIG = {
    feedUrl: '', // <-- INJECTER VOTRE URL RSS / JSON ICI
    maxArticles: 6,
    sourceLabel: 'CNIL'
};

/**
 * Données d'aperçu affichées UNIQUEMENT tant que `CNIL_CONFIG.feedUrl` et
 * `fetchCustomCnilArticles()` ne sont pas encore connectés.
 * Elles disparaissent automatiquement dès que votre flux réel est branché.
 */
const CNIL_PREVIEW_FALLBACK = [
    {
        title: 'Aperçu — En attente du flux RSS CNIL',
        date: new Date().toISOString(),
        excerpt:
            'Connectez votre script de récupération ou fichier JSON dans js/veille-cnil.js pour afficher automatiquement les dernières publications de la CNIL (RGPD, cybersécurité, sanctions et recommandations).',
        url: 'https://www.cnil.fr/fr/actualites',
        badge: 'CNIL'
    },
    {
        title: 'Exemple de carte — Sécurité des données personnelles & conformité RGPD',
        date: new Date(Date.now() - 86400000 * 3).toISOString(),
        excerpt:
            'Chaque carte affiche le badge source, la date de publication formatée, le titre complet, un extrait limité à trois lignes ainsi qu’un lien direct vers l’article officiel.',
        url: 'https://www.cnil.fr/fr/thematiques/securite-des-donnees',
        badge: 'CNIL'
    },
    {
        title: 'Exemple de carte — État de chargement (Skeleton) & gestion d’erreur',
        date: new Date(Date.now() - 86400000 * 7).toISOString(),
        excerpt:
            'Cliquez sur le bouton « Actualiser » ci-dessus pour prévisualiser l’animation du skeleton loader avant l’injection des articles.',
        url: 'https://www.cnil.fr/fr',
        badge: 'CNIL'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('veille-refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => loadCnilFeed());
    }

    loadCnilFeed();
});

/**
 * Orchestre le cycle de chargement : Skeleton -> Fetch/Parsing -> Rendu ou Erreur
 */
async function loadCnilFeed() {
    const grid = document.getElementById('veille-grid');
    const statusText = document.getElementById('veille-status-text');

    if (!grid) return;

    renderSkeletons(grid, CNIL_CONFIG.maxArticles);
    if (statusText) {
        statusText.textContent = 'Synchronisation du flux RSS CNIL...';
    }

    try {
        const articles = await fetchCustomCnilArticles();

        if (articles === null) {
            // Aucun flux branché pour le moment : affichage propre du mode aperçu
            await wait(350);
            renderArticles(grid, CNIL_PREVIEW_FALLBACK);
            if (statusText) {
                statusText.textContent = 'Mode aperçu · Prêt pour le branchement RSS CNIL';
            }
            return;
        }

        if (!Array.isArray(articles) || articles.length === 0) {
            renderEmptyState(grid);
            if (statusText) {
                statusText.textContent = 'Aucun article disponible pour le moment';
            }
            return;
        }

        const limitedArticles = articles.slice(0, CNIL_CONFIG.maxArticles);
        renderArticles(grid, limitedArticles);

        if (statusText) {
            const now = new Date().toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            statusText.textContent = `Flux CNIL actif · ${limitedArticles.length} articles (maj ${now})`;
        }
    } catch (error) {
        console.error('[Veille CNIL] Erreur de chargement :', error);
        renderErrorState(
            grid,
            'Impossible de récupérer le flux RSS de la CNIL pour le moment. Vérifiez la source ou la politique CORS.'
        );
        if (statusText) {
            statusText.textContent = 'Erreur de synchronisation du flux';
        }
    }
}

/**
 * ============================================================================
 * [ZONE D'INJECTION 2 : RÉCUPÉRATION & PARSING DU FLUX RSS / JSON CNIL]
 * ----------------------------------------------------------------------------
 * Remplacez le corps de cette fonction par votre propre script de parsing.
 * Format attendu en retour (Promise<Array<Article>>) :
 * [
 *   {
 *     title:   string, // Titre de l'article
 *     date:    string, // Date ISO ou timestamp parseable par `new Date()`
 *     excerpt: string, // Résumé / description nettoyée (sans HTML)
 *     url:     string, // Lien vers l'article sur cnil.fr
 *     badge:   string  // Optionnel, défaut : 'CNIL'
 *   }
 * ]
 * Retourner `null` laisse le composant en mode aperçu tant que rien n'est branché.
 * ============================================================================
 */
async function fetchCustomCnilArticles() {
    // Exemple si vous utilisez un fichier JSON généré automatiquement (ex: GitHub Actions) :
    // if (!CNIL_CONFIG.feedUrl) return null;
    // const response = await fetch(CNIL_CONFIG.feedUrl, { cache: 'no-store' });
    // if (!response.ok) throw new Error(`HTTP ${response.status}`);
    // const rawData = await response.json();
    //
    // return rawData.items.map((item) => ({
    //     title: item.title,
    //     date: item.pubDate || item.isoDate || item.date,
    //     excerpt: stripHtmlTags(item.description || item.contentSnippet || ''),
    //     url: item.link || item.url,
    //     badge: 'CNIL'
    // }));

    // Exemple si vous parsez directement du XML RSS via DOMParser :
    // const response = await fetch(CNIL_CONFIG.feedUrl);
    // if (!response.ok) throw new Error(`HTTP ${response.status}`);
    // const xmlText = await response.text();
    // const xmlDoc = new DOMParser().parseFromString(xmlText, 'application/xml');
    // const items = Array.from(xmlDoc.querySelectorAll('item'));
    // return items.map((item) => ({
    //     title: item.querySelector('title')?.textContent?.trim() ?? 'Sans titre',
    //     date: item.querySelector('pubDate')?.textContent?.trim() ?? '',
    //     excerpt: stripHtmlTags(item.querySelector('description')?.textContent ?? ''),
    //     url: item.querySelector('link')?.textContent?.trim() ?? 'https://www.cnil.fr',
    //     badge: 'CNIL'
    // }));

    if (!CNIL_CONFIG.feedUrl) {
        return null;
    }

    const response = await fetch(CNIL_CONFIG.feedUrl, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
    }

    const data = await response.json();
    const list = Array.isArray(data) ? data : data.items || [];

    return list.map((item) => ({
        title: item.title || 'Article CNIL',
        date: item.pubDate || item.isoDate || item.date || '',
        excerpt: stripHtmlTags(item.excerpt || item.description || item.contentSnippet || ''),
        url: sanitizeUrl(item.link || item.url || 'https://www.cnil.fr'),
        badge: item.badge || CNIL_CONFIG.sourceLabel
    }));
}

/**
 * Affiche N cartes Skeleton Loader pendant le chargement
 */
function renderSkeletons(container, count = 6) {
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i += 1) {
        const card = document.createElement('div');
        card.className = 'skeleton-card';
        card.setAttribute('aria-hidden', 'true');
        card.innerHTML = `
            <div class="skeleton-row">
                <div class="skeleton-line sk-badge"></div>
                <div class="skeleton-line sk-date"></div>
            </div>
            <div class="skeleton-line sk-title"></div>
            <div class="skeleton-line sk-title-short"></div>
            <div class="skeleton-line sk-text"></div>
            <div class="skeleton-line sk-text"></div>
            <div class="skeleton-line sk-text-short"></div>
            <div class="skeleton-line sk-link"></div>
        `;
        fragment.appendChild(card);
    }

    container.appendChild(fragment);
}

/**
 * Rendu DOM sécurisé (anti-XSS) des articles CNIL
 */
function renderArticles(container, articles) {
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    articles.forEach((article) => {
        const card = document.createElement('article');
        card.className = 'tech-card veille-card';

        const topWrap = document.createElement('div');

        const metaRow = document.createElement('div');
        metaRow.className = 'veille-card-top';

        const badge = document.createElement('span');
        badge.className = 'cnil-badge';
        badge.textContent = article.badge || CNIL_CONFIG.sourceLabel;

        const dateEl = document.createElement('time');
        dateEl.className = 'veille-date';
        if (article.date) {
            dateEl.setAttribute('datetime', article.date);
        }
        dateEl.textContent = formatDateFr(article.date);

        metaRow.append(badge, dateEl);

        const title = document.createElement('h3');
        title.className = 'veille-title';
        title.textContent = article.title || 'Publication CNIL';

        const excerpt = document.createElement('p');
        excerpt.className = 'veille-excerpt';
        excerpt.textContent =
            article.excerpt || 'Consultez l’article complet directement sur le site officiel de la CNIL.';

        topWrap.append(metaRow, title, excerpt);

        const link = document.createElement('a');
        link.className = 'veille-link';
        link.href = sanitizeUrl(article.url);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Lire l’article source ';

        const arrow = document.createElement('span');
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '↗';
        link.appendChild(arrow);

        card.append(topWrap, link);
        fragment.appendChild(card);
    });

    container.appendChild(fragment);
}

/**
 * Affichage propre en cas d'erreur réseau / CORS / parsing
 */
function renderErrorState(container, message) {
    container.innerHTML = '';

    const box = document.createElement('div');
    box.className = 'veille-error';
    box.setAttribute('role', 'alert');

    const info = document.createElement('div');
    info.className = 'veille-error-info';

    const title = document.createElement('h3');
    title.textContent = 'Flux RSS CNIL indisponible';

    const desc = document.createElement('p');
    desc.textContent = message;

    info.append(title, desc);

    const retryBtn = document.createElement('button');
    retryBtn.type = 'button';
    retryBtn.className = 'btn btn-secondary';
    retryBtn.textContent = 'Réessayer';
    retryBtn.addEventListener('click', () => loadCnilFeed());

    box.append(info, retryBtn);
    container.appendChild(box);
}

/**
 * État vide si le flux ne renvoie aucun élément
 */
function renderEmptyState(container) {
    container.innerHTML = '';

    const box = document.createElement('div');
    box.className = 'tech-card';
    box.style.gridColumn = '1 / -1';

    const text = document.createElement('p');
    text.textContent = 'Aucun article récent trouvé dans le flux CNIL.';
    box.appendChild(text);

    container.appendChild(box);
}

/* Helpers utilitaires */
function formatDateFr(dateValue) {
    if (!dateValue) return 'Date inconnue';
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return String(dateValue);

    return parsed.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function stripHtmlTags(html) {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return (temp.textContent || temp.innerText || '').replace(/\s+/g, ' ').trim();
}

function sanitizeUrl(url) {
    try {
        const parsed = new URL(url, window.location.origin);
        if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
            return parsed.href;
        }
    } catch {
        // Fallback sécurisé
    }
    return 'https://www.cnil.fr';
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// API publique optionnelle pour faciliter l'intégration d'un script externe
window.VeilleCNIL = {
    reload: loadCnilFeed,
    renderArticles: (articles) => {
        const grid = document.getElementById('veille-grid');
        if (grid) renderArticles(grid, articles);
    },
    renderError: (msg) => {
        const grid = document.getElementById('veille-grid');
        if (grid) renderErrorState(grid, msg);
    }
};
