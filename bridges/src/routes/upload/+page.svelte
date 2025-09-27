<script lang="ts">
	import { enhance, applyAction, deserialize } from '$app/forms';
	import type { SubmitFunction, ActionResult } from '@sveltejs/kit';

	export let form;

	let files: FileList | null = null;
	let visibility: 'public' | 'password' = 'public';
	let selectedFileName = 'click or drop a file';
	let isCreating = false;
	let copyStatus = '';
	let uploadProgress = 0;
	let viewOnce = false;
	let downloadLimit = 0;

	$: resultLink = form?.success ? `${window.location.origin}${form.link}` : '';

	$: if (viewOnce) {
		downloadLimit = 1;
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		files = target.files;
		selectedFileName = files && files.length > 0 ? files[0].name : 'click or drop a file';
		copyStatus = '';

		if (form?.success) {
			form = undefined;
		}
	}

	function copyLink() {
		if (resultLink) {
			navigator.clipboard.writeText(resultLink);
			copyStatus = 'Copied!';
			setTimeout(() => (copyStatus = 'copy'), 2000);
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

	const handleSubmit: SubmitFunction = ({ formElement, action, cancel }) => {
		if (!files || files.length === 0) {
			form = { message: 'A file is required.' };
			cancel();
			return;
		}

		isCreating = true;
		uploadProgress = 0;

		const xhr = new XMLHttpRequest();
		xhr.open('POST', action.href);

		xhr.upload.addEventListener('progress', (event) => {
			if (event.lengthComputable) {
				const percentComplete = (event.loaded / event.total) * 100;
				uploadProgress = Math.round(percentComplete);
			}
		});

		xhr.addEventListener('loadend', () => {
			if (xhr.status >= 400) {
				let message = xhr.statusText;
				try {
					const errorData = deserialize(xhr.responseText);
					if (errorData.type === 'failure' && errorData.data && typeof errorData.data.message === 'string') {
						message = errorData.data.message;
					}
				} catch (e) {
				}
				const errorResult: ActionResult = { type: 'failure', status: xhr.status, data: { message } };
				applyAction(errorResult);
			} else {
				const result: ActionResult = deserialize(xhr.responseText);
				if (result.type === 'success') {
					copyStatus = 'copy';
				}
				applyAction(result);
			}

			isCreating = false;
			uploadProgress = 0;
		});

		const formData = new FormData(formElement);
		xhr.send(formData);

		cancel();
	};
</script>

<svelte:head>
	<title>upload - bridges</title>
</svelte:head>

<div class="container">
	<div class="form-container">
		<form method="POST" action="?/upload" enctype="multipart/form-data" use:enhance={handleSubmit}>
			<fieldset class="form-section">
				<legend class="section-title">upload</legend>
				<div class="form-group">
					<label for="file-upload" class="file-picker-label">
						<span>{selectedFileName}</span>
					</label>
					<input type="file" id="file-upload" name="file" on:change={handleFileChange} hidden />
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
							<input type="radio" id="public" bind:group={visibility} value="public" name="visibility" checked />
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
							placeholder="password is required"
							required
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
					<input type="number" id="download-limit" name="downloadLimit" min="0" bind:value={downloadLimit} disabled={viewOnce} />
					<span class="input-hint">(0 for unlimited)</span>
				</div>
				<div class="form-group checkbox-group">
					<input type="checkbox" id="view-once" name="viewOnce" bind:checked={viewOnce}/>
					<label for="view-once">view-once (sets download limit to 1)</label>
				</div>
			</fieldset>

			<fieldset class="form-section result-section">
				<legend class="section-title">result</legend>

				{#if isCreating}
					<div class="progress-bar-container">
						<div class="progress-bar" style="width: {uploadProgress}%"></div>
						<span>{uploadProgress}%</span>
					</div>
				{/if}

				{#if resultLink}
					<div class="result-display">
						<a href={resultLink} target="_blank" rel="noopener noreferrer">{resultLink}</a>
						<button type="button" class="copy-btn" on:click={copyLink}>
							{copyStatus || 'copy'}
						</button>
					</div>
				{/if}

				<button type="submit" class="create-link-btn" disabled={isCreating || form?.success}>
					{#if isCreating}
						uploading...
					{:else if form?.success}
						done! select a new file
					{:else}
						create link
					{/if}
				</button>
			</fieldset>
		</form>

		{#if form?.message && !form.success}
			<p class="tip error">Error: {form.message}</p>
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
		margin: 2rem auto;
		padding: 1rem;
	}
	.form-section, .form-group {
		border: 1px solid var(--line);
		padding: 0.25rem 1rem 1rem;
		margin: 0 0 1rem 0;
	}
	.form-group {
		border: none;
		padding: 0;
		margin: 0;
	}
	.section-title, .form-group legend {
		padding: 0 0.4rem;
		color: var(--muted);
		font-size: 0.85rem;
		margin-bottom: 0.5rem;
	}
	.form-group legend {
		font-size: 1em;
		color: var(--fg);
		font-weight: bold;
		margin: 0 0 0.25rem;
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
		font-size: 0.8rem;
	}
	.tip.error {
		color: #ff5555;
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
		padding: 2rem 0.6rem;
		border: 1px dashed var(--line);
		background: #2b292d;
		color: var(--muted);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		transition: all 0.2s ease;
		border-radius: 0;
	}
    .file-picker-label span {
        white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
        max-width: 100%;
    }
	.file-picker-label:hover {
		border-color: var(--accent);
		color: var(--fg);
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
	.radio-option label {
		padding-left: 0;
		margin: 0;
		font-weight: normal;
	}
	.checkbox-group {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		color: var(--muted);
	}
	.checkbox-group label {
		margin: 0;
		font-weight: normal;
	}
	.checkbox-group input[type='checkbox'] {
		display: inline-block;
	}
	.result-section {
		padding: 1rem;
	}

	.create-link-btn {
        width: 100%;
		padding: 0.75rem 0.8rem;
		border: 1px solid var(--accent);
		background: transparent;
		color: var(--fg);
		cursor: pointer;
		font-family: monospace;
		font-size: 15px;
		border-radius: 0;
		min-width: 100px;
		text-align: center;
		transition: all 0.2s ease;
	}
    .create-link-btn:hover:not(:disabled) {
        background: var(--accent);
        color: #111;
    }
	.create-link-btn:focus {
		outline: 1px solid var(--accent);
		outline-offset: 2px;
	}
	.create-link-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		border-color: var(--muted);
		color: var(--muted);
	}
	.result-display {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: #2b292d;
		border: 1px solid var(--line);
		padding: 0.5rem 0.6rem;
		margin-bottom: 1rem;
		width: 100%;
		word-break: break-all;
		border-radius: 0;
	}
	.result-display a {
		color: var(--accent);
		text-decoration: none;
		flex-grow: 1;
	}
    .result-display a:hover {
        text-decoration: underline;
    }
    .copy-btn {
        padding: 0.3rem 0.6rem;
        border: 1px solid var(--muted);
        background: transparent;
        color: var(--muted);
        cursor: pointer;
        font-family: monospace;
        font-size: 14px;
        border-radius: 0;
        flex-shrink: 0;
        transition: all 0.2s ease;
    }
    .copy-btn:hover {
        background-color: var(--muted);
        color: #111;
    }
	.tip {
		color: var(--muted);
		font-size: 0.9rem;
		margin-top: 1rem;
		text-align: center;
	}

	.progress-bar-container {
		width: 100%;
		background-color: #2b292d;
		border: 1px solid var(--line);
		margin-bottom: 1rem;
		height: 30px;
		position: relative;
		color: var(--fg);
		border-radius: 0;
		overflow: hidden;
	}
	.progress-bar {
		height: 100%;
		background-color: var(--accent);
		width: 0%;
		transition: width 0.2s linear;
	}
	.progress-bar-container span {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		mix-blend-mode: difference;
		color: white;
		font-weight: bold;
	}
</style>