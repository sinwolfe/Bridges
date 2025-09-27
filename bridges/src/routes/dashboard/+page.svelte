<script>
	export let data;
</script>

<svelte:head>
	<title>dashboard - bridges</title>
</svelte:head>

<main>
	<header class="between">
		<div>
			<h1>bridges / dashboard</h1>
			{#if data.user}
				<div class="muted">
					welcome, @{data.user.username} — minimal overview + quick actions
				</div>
			{/if}
		</div>
		<nav>
			<form method="POST" action="?/logout">
				<button type="submit" class="link-button">Logout</button>
			</form>
		</nav>
	</header>

	<section>
		<fieldset>
			<legend>OVERVIEW</legend>
			<table>
				<tbody>
					<tr>
						<th>last login</th>
						<td class="nowrap">2025-09-27 19:43</td>
						<th>account status</th>
						<td>OK</td>
					</tr>
					<tr>
						<th>server status</th>
						<td>NOMINAL</td>
						<th>data integrity</th>
						<td>OK</td>
					</tr>
				</tbody>
			</table>
		</fieldset>
	</section>

	<section>
		<fieldset>
			<legend>QUICK ACTIONS</legend>
			<div class="actions">
				<a href="/links" class="button your-links">your links</a>
			</div>
		</fieldset>
	</section>

	<section>
		<fieldset>
			<legend>SCRATCH PAD</legend>
			<textarea placeholder="Type anything..."></textarea>
		</fieldset>
	</section>
</main>

<style>
	:root {
		--bg: #232025;
		--fg: #efd5c5;
		--muted: #8f8886;
		--line: #3b393e;
		--accent: #6fb3c0;
		--warn: #d09950;
	}

	:global(*),
	:global(*::before),
	:global(*::after) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--fg);
		font: 15px/1.5 monospace;
	}

	main {
		max-width: 980px;
		margin: 6vh auto 0;
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

	fieldset {
		border: 1px solid var(--line);
		padding: 1rem;
		margin: 0 0 1.5rem 0;
	}

	legend {
		padding: 0 0.4rem;
		color: var(--muted);
		font-size: 0.85rem;
		text-transform: uppercase;
	}

	textarea {
		width: 100%;
		height: 150px;
		padding: 0.5rem 0.6rem;
		border: 1px solid var(--line);
		background: #2b292d;
		color: var(--fg);
		resize: vertical;
		font-family: monospace;
	}

	textarea:focus {
		outline: none;
		border-color: var(--accent);
	}

	.between {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
	}

	.button {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		border: 1px solid var(--accent);
		background: transparent;
		color: var(--fg);
		cursor: pointer;
		text-align: center;
		text-decoration: none;
		width: 100%;
	}

	.button.your-links {
		border-color: var(--warn);
	}

	.button:focus-visible,
	.link-button:focus-visible {
		outline: 1px solid var(--accent);
		outline-offset: 2px;
	}

	.link-button {
		background: none;
		border: none;
		padding: 0;
		color: var(--muted);
		font-family: monospace;
		font-size: 15px;
		cursor: pointer;
		text-decoration: underline;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		padding: 0.45rem 0.6rem;
		border: 1px solid var(--line);
		vertical-align: middle;
	}
	th {
		color: var(--muted);
		text-align: left;
		font-weight: normal;
		width: 15%;
	}
	.nowrap {
		white-space: nowrap;
	}
</style>
