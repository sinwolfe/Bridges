<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	let toastMessage = '';
	let toastTimeout: ReturnType<typeof setTimeout>;

	const showToast = (message: string) => {
		clearTimeout(toastTimeout);
		toastMessage = message;
		toastTimeout = setTimeout(() => {
			toastMessage = '';
		}, 3000);
	};

	const copyToClipboard = async (text: string) => {
		if (!navigator.clipboard) {
			showToast('Clipboard API not available.');
			return;
		}
		try {
			await navigator.clipboard.writeText(text);
			showToast('Link copied to clipboard!');
		} catch (err) {
			console.error('Failed to copy: ', err);
			showToast('Failed to copy link.');
		}
	};

	const handleKeyDown = (event: KeyboardEvent, url: string) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			copyToClipboard(url);
		}
	};
</script>

<svelte:head>
	<title>links - bridges</title>
</svelte:head>

<main>
	<header>
		<h1>Your Links</h1>
		<div class="muted">A list of your shared links. Click any row to copy.</div>
	</header>

	<fieldset>
		<legend>Active Links ({data.totalLinks})</legend>
		{#if data.links && data.links.length > 0}
			<div class="scroll-container">
				<div class="link-list">
					{#each data.links as link (link.id)}
						{@const fullUrl = `${data.origin}/go/${link.slug}`}
						{@const displayUrl = `${data.origin.replace(/https?:\/\//, '')}/go/${link.slug}`}
						<div
							class="link-row"
							role="button"
							tabindex="0"
							on:click={() => copyToClipboard(fullUrl)}
							on:keydown={(e) => handleKeyDown(e, fullUrl)}
							title="Click to copy"
						>
							<div class="link-info">
								<a href={fullUrl} target="_blank" rel="noopener noreferrer" on:click|stopPropagation>
									{displayUrl}
								</a>
								<span class="muted date">
									Created: {new Date(link.created).toLocaleDateString()}
								</span>
							</div>
							<div class="link-actions">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="copy-icon"
								>
									<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
									<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
								</svg>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="empty-state">
				<p>You haven't shared any files yet.</p>
				<a href="/upload" class="button-primary">Share your first file</a>
			</div>
		{/if}
	</fieldset>
</main>

{#if toastMessage}
	<div class="toast">
		{toastMessage}
	</div>
{/if}

<style>
	:global(:root) {
		--bg: #232025;
		--bg-light: #3b393e;
		--fg: #efd5c5;
		--muted: #8f8886;
		--line: #3b393e;
		--accent: #6fb3c0;
	}

	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--fg);
		font: 15px/1.5 monospace;
	}

	main {
		max-width: 800px;
		margin: 6vh auto 0;
		padding: 0 1rem;
	}

	header {
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 1rem;
		margin: 0 0 0.25rem 0;
		font-weight: normal;
	}

	.muted {
		color: var(--muted);
	}

	fieldset {
		border: 1px solid var(--line);
		padding: 1.25rem;
		margin: 2rem 0;
	}

	legend {
		padding: 0 0.5rem;
		color: var(--muted);
		font-size: 0.85rem;
		text-transform: uppercase;
	}

	.scroll-container {
		max-height: 60vh;
		overflow-y: auto;
		/* Standard scrollbar styling for Firefox */
		scrollbar-width: thin;
		scrollbar-color: var(--accent) transparent;
	}

	/* Custom scrollbar styling for WebKit browsers */
	.scroll-container::-webkit-scrollbar {
		width: 8px;
	}

	.scroll-container::-webkit-scrollbar-track {
		background: transparent;
	}

	.scroll-container::-webkit-scrollbar-thumb {
		background-color: var(--accent);
	}

	.scroll-container::-webkit-scrollbar-thumb:hover {
		background-color: #82c4d1;
	}

	.link-list {
		display: flex;
		flex-direction: column;
	}

	.link-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.85rem 1rem 0.85rem 0;
		border-bottom: 1px solid var(--line);
		cursor: pointer;
		transition: background-color 0.2s ease-in-out;
		outline: none;
	}
	.link-row:last-child {
		border-bottom: none;
	}
	.link-row:hover {
		background-color: rgba(59, 57, 62, 0.5);
	}

	/* accessibility: only show the focus outline when using keyboard navigation (this is for keyboard users like me lol) */
	.link-row:focus-visible {
		outline: 1px solid var(--accent);
		outline-offset: -1px;
	}

	.link-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	a {
		color: var(--accent);
		text-decoration: none;
		font-size: 0.95rem;
	}
	a:hover {
		text-decoration: underline;
	}

	.date {
		font-size: 0.8rem;
	}

	.copy-icon {
		color: var(--muted);
		transition: color 0.2s ease-in-out;
	}
	.link-row:hover .copy-icon {
		color: var(--fg);
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
	}
	.empty-state p {
		margin: 0 0 1.5rem 0;
		color: var(--fg);
		font-size: 1rem;
	}
	.button-primary {
		display: inline-block;
		padding: 0.6rem 1.2rem;
		border: 1px solid var(--accent);
		background: transparent;
		color: var(--fg);
		font-family: inherit;
		text-decoration: none;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
		outline: none;
	}
	.button-primary:hover {
		background: var(--accent);
		color: var(--bg);
	}
	.button-primary:focus-visible {
		outline: 1px solid var(--accent);
		outline-offset: 2px;
	}

	.toast {
		position: fixed;
		bottom: 6rem;
		left: 50%;
		transform: translateX(-50%);
		background-color: var(--bg);
		color: var(--fg);
		padding: 0.75rem 1.5rem;
		border: 1px solid var(--line);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		font-size: 0.95rem;
		z-index: 1000;
		animation: fadeIn 0.3s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}
</style>