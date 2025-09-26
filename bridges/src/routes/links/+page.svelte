<script lang="ts">
    // Import the necessary functions from SvelteKit
    import { goto } from '$app/navigation';  // For navigation
    import type { PageData } from './$types';
  
    // Export the data received from the server load function
    export let  data: PageData;  // The data passed from the server-side load function
</script>

<main>
    <header class="page-header">
        <div>
            <h1>Your Links</h1>
            <p class="subtitle muted">A simple list of your shared links.</p>
        </div>
    </header>

    <!-- Links List -->
    <section class="section-box">
        <h2 class="section-title">Active Links</h2>
        <div class="section-content">
            {#if data.totalLinks > 0}
                <ul class="links-list">
                    {#each data.links as link}
                        <li class="link-item">
                            <a href="{link.url}" target="_blank" class="link-url">
                                {link.url}
                            </a>
                            <span class="link-stats">
                                {link.view_count ?? 0} views | {link.download_count ?? 0} downloads
                            </span>
                        </li>
                    {/each}
                </ul>
            {:else}
                <p>No active links found. Start sharing your files!</p>
            {/if}
        </div>
    </section>
</main>

<style>
    :global(:root) {
        --bg: #232025;
        --fg: #efd5c5;
        --muted: #8f8886;
        --line: #3b393e;
        --accent: #6fb3c0;
        --dropdown-bg: #333036;
        --dropdown-fg: #f5e5d5;
        --error: #e57373;
        --success: #81c784;
        --border-color: #4a454e;
    }
    
    :global(body) {
        margin: 0;
        background: var(--bg);
        color: var(--fg);
        font: 15px/1.5 monospace;
    }

    main {
        max-width: 900px;
        margin: 5vh auto 0;
        padding: 0 1rem 5rem;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .page-header div {
        display: flex;
        flex-direction: column;
        gap: 0.2rem; /* Add small gap between title and subtitle */
    }

    .section-box {
        margin: 2rem 0;
        position: relative;
    }

    .section-title {
        font-size: 1rem;
        text-transform: uppercase;
        color: var(--muted);
        margin: 0;
        padding: 0 0.5rem;
        position: relative;
        top: 0.7rem;
        background: var(--bg);
        display: inline-block;
    }

    .section-content {
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 1.2rem;
        margin-top: 0.8rem;
    }

    .links-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .link-item {
        padding: 0.8rem 0;
        border-bottom: 1px solid var(--line);
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    .link-item:last-child {
        border-bottom: none;
    }

    .link-url {
        color: var(--accent);
        text-decoration: none;
        font-weight: bold;
    }

    .link-url:hover {
        text-decoration: underline;
    }

    .link-stats {
        color: var(--muted);
        font-size: 0.8rem;
    }

    .muted {
        color: var(--muted);
    }

    .action-btn {
        padding: 0.8rem 1.2rem;
        border: 2px solid var(--accent);
        background: transparent;
        color: var(--fg);
        cursor: pointer;
        border-radius: 6px;
        font-weight: bold;
        font-size: 0.9rem;
        text-align: center;
        transition: all 0.2s ease;
    }

    .action-btn:hover {
        background: var(--accent);
        color: var(--bg);
        transform: translateY(-2px);
    }

    .quick-actions {
        display: flex;
        gap: 0.6rem;
        margin-top: 0.8rem;
    }
</style>