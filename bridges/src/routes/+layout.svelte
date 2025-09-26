<script>
	export let data;
</script>

<main>
	<slot />
</main>

<footer>
	<a href="/">home</a>

	{#if data.user}
		<a href="/upload">upload</a>
	{/if}

	<a href="/about">about</a>

	{#if data.user && data.user.isAdmin}
		<a href="/admin">admin</a>
	{/if}
</footer>

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
		padding-bottom: 5rem;
		background: var(--bg);
		color: var(--fg);
		font: 15px/1.5 monospace;
	}

	main {
		max-width: 640px;
		margin: 8vh auto 0;
		padding: 0 1rem;
	}

	footer {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background-color: var(--bg);
		border-top: 1px solid var(--line);
		padding: 1.25rem 0;
		display: flex;
		justify-content: center;
		gap: 2rem;
	}

	footer a {
		color: var(--muted);
		text-decoration: none;
		transition: color 0.2s ease;
	}

	footer a:hover {
		color: var(--fg);
		text-decoration: underline;
	}
</style>