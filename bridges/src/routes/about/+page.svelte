<script>
	export let data;

	const { contributors } = data;
</script>

<svelte:head>
	<title>about - bridges</title>
</svelte:head>

<main>
    <header>
        <img
            src="https://raw.githubusercontent.com/sinwolfe/Bridges/refs/heads/main/images/bridges.png"
			alt="bridges project logo"
			class="project-logo"
			width="80"
			height="80"
        />
        <div>
            <h1>bridges</h1>
			<div class="muted">a minimal file sharing utility</div>
        </div>
	</header>

    <hr />

	<div class="github-link">
		<a href="https://github.com/sinwolfe/Bridges" target="_blank" rel="noopener noreferrer">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="icon"
			>
				<path
					d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
				></path>
			</svg>
			<span>source code</span>
		</a>
	</div>

	<section>
		{#each contributors as contributor}
			<fieldset>
				<legend>
					<div class="legend-content">
						<img
							src={`https://github.com/${contributor.name}.png?size=40`}
							alt={`GitHub profile for ${contributor.name}`}
							class="avatar"
							width="40"
							height="40"
						/>
						<a href={contributor.url} target="_blank" rel="noopener noreferrer">
							{contributor.name}
						</a>
					</div>
				</legend>
				<p>{contributor.notes}</p>
			</fieldset>
		{/each}
	</section>

	<hr />

	<footer>
		<small>built with a focus on simplicity and privacy.</small>
	</footer>
</main>

<style>
	:root {
		--bg: #232025;
		--fg: #efd5c5;
		--muted: #8f8886;
		--line: #3b393e;
		--accent: #6fb3c0;
	}

	* {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--fg);
		font: 15px/1.5 monospace;
	}

	main {
		max-width: 640px;
		margin: 8vh auto 0;
		padding: 0 1rem;
	}

	h1 {
		font-size: 1rem;
		margin: 0 0 0.25rem 0;
		font-weight: normal;
	}

	.muted {
		color: var(--muted);
	}

	a {
		color: var(--accent);
		text-decoration: none;
	}
	a:hover {
		text-decoration: underline;
	}

	hr {
		border: 0;
		border-top: 1px solid var(--line);
		margin: 2rem 0;
	}

	fieldset {
		border: 1px solid var(--line);
		padding: 1rem 1.5rem;
		margin: 0 0 1.25rem 0;
	}

	legend {
		padding: 0 0.5rem;
		font-size: 0.9rem;
		margin-bottom: 0.5rem;
	}

	.legend-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	legend a {
		font-weight: bold;
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 4px;
		border: 1px solid var(--line);
	}

	p {
		margin: 0;
		color: var(--fg);
	}

	footer {
		text-align: center;
		padding-bottom: 2rem;
	}

	small {
		color: var(--muted);
	}

	.github-link {
		margin: 1.5rem 0;
	}

	.github-link a {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.icon {
		position: relative;
		top: -1px;
	}
</style>