<script lang="ts">
	import { enhance } from '$app/forms';
	const USERNAME_PATTERN = '^[a-zA-Z0-9_.-]{4,32}$';

	export let form:
		| {
				message?: string;
				errors?: { username?: string; password?: string; passwordConfirm?: string };
				values?: { username?: string };
		  }
		| undefined;
</script>

<svelte:head>
	<title>register - bridges</title>
</svelte:head>

<main>
	<header>
		<h1>Bridges</h1>
		<div class="muted">a minimal file sharing utility</div>
	</header>

	<form method="POST" use:enhance>
		<fieldset>
			<legend>create account</legend>

			<label for="u">username</label>
			<input
				id="u"
				name="username"
				type="text"
				required
				pattern={USERNAME_PATTERN}
				autocomplete="username"
				value={form?.values?.username ?? ''}
				aria-invalid={form?.errors?.username ? 'true' : 'false'}
				aria-describedby={form?.errors?.username ? 'u-err' : 'u-help'}
			/>
			<small id="u-help" class="muted">
				4 - 32 characters. Use only letters, numbers, and _ . -
			</small>

			{#if form?.errors?.username}
				<div id="u-err" class="err">{form.errors.username}</div>
			{/if}

			<label for="p1">password</label>
			<input
				id="p1"
				name="password"
				type="password"
				required
				autocomplete="new-password"
				minlength="4"
				aria-invalid={form?.errors?.password ? 'true' : 'false'}
				aria-describedby={form?.errors?.password ? 'p1-err' : 'p1-help'}
			/>
			<small id="p1-help" class="muted">At least 4 characters.</small>

			{#if form?.errors?.password}
				<div id="p1-err" class="err">{form.errors.password}</div>
			{/if}

			<label for="p2">confirm password</label>
			<input
				id="p2"
				name="passwordConfirm"
				type="password"
				required
				autocomplete="new-password"
				aria-invalid={form?.errors?.passwordConfirm ? 'true' : 'false'}
				aria-describedby={form?.errors?.passwordConfirm ? 'p2-err' : undefined}
			/>

			{#if form?.errors?.passwordConfirm}
				<div id="p2-err" class="err">{form.errors.passwordConfirm}</div>
			{/if}

			<div class="row">
				<div class="muted">no email required</div>
				<button type="submit">create</button>
			</div>

			{#if form?.message}
				<div class="msg" role="status" aria-live="polite">{form.message}</div>
			{/if}
		</fieldset>
	</form>

	<hr />
	<div><small>no tracking. metadata stripped from uploads.</small></div>
	<div class="muted signin-link">
		already have an account? <a href="/login">sign in</a>
	</div>
</main>

<style>
	/* maybe this will fix the input box overflowing?
	 idk lol just test/bandaid */
	/* update: actually maybe this is the proper way.. */
	:global(*),
	:global(*::before),
	:global(*::after) {
		box-sizing: border-box;
	}

	:global(:root) {
		--bg: #232025;
		--fg: #efd5c5;
		--muted: #8f8886;
		--line: #3b393e;
		--accent: #6fb3c0;
	}
	:global(html, body) {
		height: 100%;
	}
	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--fg);
		font: 15px/1.5 monospace;
		min-height: 100vh;
		display: grid;
		place-content: center;
		padding-bottom: 20vh;
	}
	main {
		max-width: 420px;
		padding: 0 1rem;
		width: 100%;
	}
	h1 {
		font-size: 1rem;
		margin: 0 0 0.25rem 0;
	}
	.muted {
		color: var(--muted);
	}
	fieldset {
		border: 1px solid var(--line);
		padding: 0.9rem;
	}
	legend {
		padding: 0 0.35rem;
		color: var(--muted);
		font-size: 0.85rem;
	}
	label {
		display: block;
		margin: 0.5rem 0 0.25rem;
	}
	input[type='text'],
	input[type='password'] {
		width: 100%;
		padding: 0.5rem 0.6rem;
		border: 1px solid var(--line);
		background: #2b292d;
		color: var(--fg);
	}
	input:focus {
		outline: none;
		border-color: var(--accent);
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 0.5rem;
		gap: 0.75rem;
	}
	button {
		padding: 0.5rem 0.8rem;
		border: 1px solid var(--accent);
		background: transparent;
		color: var(--fg);
		cursor: pointer;
	}
	button:focus {
		outline: 1px solid var(--accent);
		outline-offset: 0;
	}
	a {
		color: var(--accent);
		text-decoration: underline;
	}
	hr {
		border: 0;
		border-top: 1px solid var(--line);
		margin: 1rem 0;
	}
	small {
		color: var(--muted);
	}
	.msg {
		margin-top: 0.75rem;
		font-size: 0.9rem;
		color: var(--fg);
	}
	.err {
		margin-top: 0.25rem;
		font-size: 0.85rem;
		color: #ffb4a2;
	}
	.signin-link {
		margin-top: 0.5rem
	}
</style>