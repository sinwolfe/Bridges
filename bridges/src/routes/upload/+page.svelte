<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let form;

	let files: FileList | null = null;
	let visibility: 'public' | 'password' = 'public';
	let selectedFileName = 'No files selected';
	let isCreating = false;

	$: resultLink = form?.success ? `${window.location.origin}${form.link}` : '';

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		files = target.files;
		selectedFileName = files && files.length > 0 ? files[0].name : 'No files selected';

		if (form?.success) {
			form = undefined;
		}
	}

	function copyLink() {
		if (resultLink) {
			navigator.clipboard.writeText(resultLink);
			alert('Link copied to clipboard!');
		}
	}

	const expiresOptions = [
		{ label: 'forever', value: 'forever' },
		{ label: 'in 1 hour', value: '1h' },
		{ label: 'in 24 hours', value: '24h' },
		{ label: 'in 7 days', value: '7d' },
		{ label: 'in 30 days', value: '30d' },
		{ label: 'in 1 year', value: '1y' }
	];

	const handleSubmit: SubmitFunction = () => {
		isCreating = true;
		return async ({ update }) => {
			await update();
			isCreating = false;
		};
	};
</script>

<svelte:head>
	<title>upload - bridges</title>
</svelte:head>

<div class="container">
	<div class="form-container">
		<form method="POST" enctype="multipart/form-data" use:enhance={handleSubmit}>
			<fieldset class="form-section">
				<legend class="section-title">upload</legend>
				<div class="form-group">
					<label for="file-upload" class="file-picker-label">
						{selectedFileName}
					</label>
					<input type="file" id="file-upload" name="file" on:change={handleFileChange} hidden required />
				</div>
				<div class="form-group">
					<label for="title">title <span class="label-hint">(optional)</span></label>
					<input type="text" id="title" name="title" placeholder="optional label" />
				</div>
				<div class="form-group">
					<label for="tags">tags <span class="label-hint">(optional)</span></label>
					<input type="text" id="tags" name="tags" placeholder="comma, separated" />
				</div>
			</fieldset>

			<fieldset class="form-section">
				<legend class="section-title">link</legend>
				<fieldset class="form-group">
					<legend>visibility</legend>
					<div class="radio-group">
						<div class="radio-option">
							<input type="radio" id="public" bind:group={visibility} value="public" name="visibility" />
							<label for="public">anyone with the link</label>
						</div>
						<div class="radio-option">
							<input
								type="radio"
								id="password-protected"
								bind:group={visibility}
								value="password"
								name="visibility"
							/>
							<label for="password-protected">protect with a password</label>
						</div>
					</div>
				</fieldset>

				{#if visibility === 'password'}
					<div class="form-group">
						<label for="password">password</label>
						<input
							type="password"
							id="password"
							name="password"
							placeholder="leave blank unless password protected"
						/>
					</div>
				{/if}

				<div class="form-group">
					<label for="expires">expires</label>
					<div class="select-wrapper">
						<select id="expires" name="expires">
							{#each expiresOptions as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="form-group">
					<label for="download-limit">download limit</label>
					<input type="number" id="download-limit" name="downloadLimit" min="0" value="0" />
					<span class="input-hint">(0 = infinite)</span>
				</div>
				<div class="form-group checkbox-group">
					<input type="checkbox" id="view-once" name="viewOnce" />
					<label for="view-once">view-once</label>
				</div>
			</fieldset>

			<fieldset class="form-section result-section">
				<legend class="section-title">result: <span class="label-hint">(short link appears after upload)</span>
				</legend>
				{#if resultLink}
					<div class="result-display">{resultLink}</div>
				{/if}

				{#if resultLink}
					<button type="button" class="create-link-btn" on:click={copyLink}> copy link </button>
				{:else}
					<button type="submit" class="create-link-btn" disabled={isCreating}>
						{#if isCreating}
							creating...
						{:else}
							create link
						{/if}
					</button>
				{/if}
			</fieldset>
		</form>

		{#if form?.message}
			<p class="tip" style="color: red;">Error: {form.message}</p>
		{/if}

		<p class="tip">
			tip: choose visibility, expiry, and limits before creating a link. you can revoke later.
		</p>
	</div>
</div>

<style>
	:global(*),
	:global(*::before),
	:global(*::after) {
		box-sizing: border-box;
	}
	.container {
		max-width: 480px;
		margin: 0 auto;
	}
	.form-section, .form-group {
		border: 1px solid var(--line);
		padding: 1rem;
		margin: 0 0 1rem 0;
	}

	.form-group {
		border: none;
		padding: 0;
		margin: 0;
	}

	.section-title, .form-group legend {
		position: static;
		background-color: transparent;
		padding: 0 0.4rem;
		color: var(--muted);
		font-size: 0.85rem;
		margin-bottom: 0.5rem;
	}

	.form-group legend {
		padding: 0;
		font-size: 1em;
		color: var(--fg);
		font-weight: bold;
		margin: 0.6rem 0 0.25rem;
	}


	label {
		display: block;
		margin: 0.6rem 0 0.25rem;
	}
	.label-hint,
	.input-hint,
	.tip {
		color: var(--muted);
		font-weight: normal;
	}
	input[type='text'],
	input[type='password'],
	input[type='number'],
	select {
		width: 100%;
		padding: 0.5rem 0.6rem;
		border: 1px solid var(--line);
		background: #2b292d;
		color: var(--fg);
		font-family: monospace;
		font-size: 15px;
		border-radius: 0;
	}
	.file-picker-label {
		width: 100%;
		padding: 0.5rem 0.6rem;
		border: 1px solid var(--line);
		background: #2b292d;
		color: var(--muted);
		cursor: pointer;
		display: block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		border-radius: 0;
	}
	input:focus,
	select:focus {
		outline: none;
		border-color: var(--accent);
	}
	.radio-group {
		display: grid;
		gap: 0.35rem;
	}
	.radio-option {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.radio-option input[type='radio'] {
		display: inline-block;
	}
	.radio-option label::before,
	.radio-option label::after {
		display: none;
	}
	.radio-option label {
		padding-left: 0;
		margin: 0;
	}
	.checkbox-group {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		color: var(--muted);
	}
	.checkbox-group label {
		margin: 0;
	}
	.checkbox-group input[type='checkbox'] {
		display: inline-block;
	}
	.checkbox-group label::before {
		display: none;
	}
	.result-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		justify-content: space-between;
		flex-wrap: wrap;
	}
	.result-section .section-title {
		padding: 0;
		font-size: 1em;
		color: var(--muted);
		margin: 0;
		flex-grow: 1;
	}
	.create-link-btn {
		padding: 0.5rem 0.8rem;
		border: 1px solid var(--accent);
		background: transparent;
		color: var(--fg);
		cursor: pointer;
		font-family: monospace;
		font-size: 15px;
		flex-shrink: 0;
		border-radius: 0;
	}
	.create-link-btn:focus {
		outline: 1px solid var(--accent);
		outline-offset: 0;
	}
	.create-link-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		border-color: var(--muted);
		color: var(--muted);
	}
	.result-display {
		color: var(--accent);
		text-decoration: underline;
		word-break: break-all;
		margin-bottom: 1rem;
		width: 100%;
	}
	.tip {
		color: var(--muted);
		font-size: 0.9rem;
		margin-top: 1rem;
	}
</style>