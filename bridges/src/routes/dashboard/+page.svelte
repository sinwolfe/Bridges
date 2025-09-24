<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketbase';
	import { browser } from '$app/environment';
	import type { PageData } from './$types';
  
	export let data;
  
	// State for file upload
	let selectedFile: File | null = null;
	let isUploading: boolean = false;
	let uploadError: string = '';
  
	// Configuration state
	let expires: string = '24h'; // default
	let visibility: string = 'public';
	let password: string = '';
	let downloadLimitEnabled: boolean = false;
	let downloadLimit: number = 10;
	let viewOnce: boolean = false;
	let embedPreview: boolean = false;
  
	// State for generated link
	let generatedLink: string = '';
	let isGenerating: boolean = false;
	let error: string = '';
  
	// Convert expiration string to timestamp
	function getExpirationTimestamp(expiration: string): number | null {
	  if (expiration === 'never') return null;
	  
	  const now = Date.now();
	  switch (expiration) {
		case '1h':
		  return now + (1 * 60 * 60 * 1000);
		case '24h':
		  return now + (24 * 60 * 60 * 1000);
		case '7d':
		  return now + (7 * 24 * 60 * 60 * 1000);
		case '30d':
		  return now + (30 * 24 * 60 * 60 * 1000);
		case '1y':
		  return now + (365 * 24 * 60 * 60 * 1000);
		default:
		  return now + (24 * 60 * 60 * 1000); // default 24h
	  }
	}
  
	// Generate a unique short ID for the share link
	function generateShortId(length: number = 8): string {
	  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	  let result = '';
	  for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	  }
	  return result;
	}
  
	// Handle file selection
	function handleFileSelect(event: Event) {
	  const input = event.target as HTMLInputElement;
	  if (input.files && input.files[0]) {
		selectedFile = input.files[0];
		uploadError = '';
		// Reset any previous generated links when a new file is selected
		generatedLink = '';
		error = '';
	  }
	}
  
	// Upload file to PocketBase via your existing API endpoint
	async function handleUpload() {
	  if (!selectedFile) {
		uploadError = 'Please select a file first';
		return;
	  }
  
	  isUploading = true;
	  uploadError = '';
  
	  try {
		// Step 1: Upload the file using your existing working API
		const formData = new FormData();
		formData.append('file', selectedFile);
  
		const uploadResponse = await fetch('/api/upload', {
		  method: 'POST',
		  body: formData,
		});
  
		if (!uploadResponse.ok) {
		  const errorData = await uploadResponse.json().catch(() => ({}));
		  throw new Error(`Upload failed: ${errorData.error || 'Unknown error'}`);
		}
  
		// Parse the response - this should contain the file ID
		const uploadResult = await uploadResponse.json();
  
		console.log('Upload result:', uploadResult);
  
		// Check if we have an ID in the response
		// Your API might return it in a different field name
		let fileId = uploadResult.id || uploadResult.fileId || uploadResult.record?.id;
		
		if (!fileId) {
		  // If no ID found, try to find it in common response structures
		  if (uploadResult.data && uploadResult.data.id) {
			fileId = uploadResult.data.id;
		  } else if (typeof uploadResult === 'string') {
			// Sometimes APIs return just the ID as a string
			fileId = uploadResult;
		  }
		}
		
		if (!fileId) {
		  console.error('No file ID found in upload response:', uploadResult);
		  throw new Error('Upload succeeded but no file ID was returned. Check your /api/upload endpoint.');
		}
		
		console.log('✅ File uploaded successfully, ID:', fileId);
  
		// Step 2: Create share record directly in PocketBase (not via API)
		const shareData = {
		  file: fileId,
		  owner: data.user?.id || null,
		  expires_at: getExpirationTimestamp(expires),
		  visibility: visibility,
		  password: visibility === 'password' ? password : null,
		  download_limit: downloadLimitEnabled ? downloadLimit : null,
		  download_count: 0,
		  view_count: 0,
		  view_once: viewOnce,
		  embed_preview: embedPreview,
		  short_id: generateShortId(),
		  is_active: true
		};
  
		console.log('📤 Creating share record with data:', shareData);
  
		const shareRecord = await pb.collection('shares').create(shareData);
  
		// Refresh the page to get updated dashboard data
		window.location.reload();
  
		// Generate the share link
		const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
		generatedLink = `${baseUrl}/share/${shareRecord.short_id}`;
  
		// Show success message and copy link to clipboard
		alert('Share link generated successfully!');
		
		// Copy to clipboard if in browser
		if (browser && navigator.clipboard) {
		  await navigator.clipboard.writeText(generatedLink);
		  alert('Link copied to clipboard!');
		}
  
	  } catch (err) {
		console.error('🚨 LINK GENERATION ERROR:', err);
		uploadError = err instanceof Error ? err.message : 'Failed to generate share link';
		alert('Error: ' + uploadError);
	  } finally {
		isUploading = false;
	  }
	}
  
	// Validate form before submission
	function validateForm() {
	  if (visibility === 'password' && !password.trim()) {
		alert('Please enter a password for password-protected sharing');
		return false;
	  }
	  if (downloadLimitEnabled && (downloadLimit <= 0 || isNaN(downloadLimit))) {
		alert('Please enter a valid download limit (greater than 0)');
		return false;
	  }
	  return true;
	}
  </script>
  
  <main>
	<header class="page-header">
	  <div>
		<h1>bridges / dashboard</h1>
		<p class="subtitle">welcome, <strong>@{data.user?.username ?? 'guest'}</strong> – minimal overview + quick actions</p>
	  </div>
  
	  <!-- Simplified logout button as requested -->
	  <nav class="nav-links">
		<form method="POST" action="?/logout" use:enhance class="logout-form">
		  <button type="submit" class="logout-link">Logout</button>
		</form>
	  </nav>
	</header>
  
	<!-- quick -->
	<section class="section-box">
	<h2 class="section-title">quick</h2>
	<div class="section-content">
	  <!-- Full-width Upload button -->
	  <button on:click={() => goto('/upload')} class="action-btn upload-page-btn full-width">
		Upload
	  </button>
  
	  <!-- Quick actions: your files & your links -->
	  <div class="quick-actions">
		<button on:click={() => goto('/files')} class="action-btn files-btn">your files</button>
		<button on:click={() => goto('/links')} class="action-btn links-btn">your links</button>
	  </div>
  
	</div>
  </section>
  
	<!-- Configuration Section (automatically shown after file selection) -->
	{#if selectedFile}
	  <section class="section-box">
		<h2 class="section-title">configure sharing settings</h2>
		
		<div class="section-content">
		  <section class="config-subsection">
			<h3 class="section-subtitle">expiration</h3>
			<div class="select-wrapper">
			  <select
				name="expires"
				bind:value={expires}
				class="custom-select"
			  >
				{#each [
				  { value: '1h', label: '1 hour' },
				  { value: '24h', label: '24 hours' },
				  { value: '7d', label: '7 days' },
				  { value: '30d', label: '30 days' },
				  { value: '1y', label: '1 year' },
				  { value: 'never', label: 'Never expire' }
				] as option}
				  <option value={option.value}>
					{option.label}
				  </option>
				{/each}
			  </select>
			</div>
		  </section>
  
		  <section class="config-subsection">
			<h3 class="section-subtitle">visibility</h3>
			<div class="select-wrapper">
			  <select
				name="visibility"
				bind:value={visibility}
				class="custom-select"
			  >
				{#each [
				  { value: 'public', label: 'Public – anyone with link' },
				  { value: 'unlisted', label: 'Unlisted – not searchable' },
				  { value: 'password', label: 'Password protected' }
				] as option}
				  <option value={option.value}>
					{option.label}
				  </option>
				{/each}
			  </select>
			</div>
  
			{#if visibility === 'password'}
			  <div class="input-group" style="margin-top: 1rem;">
				<label>Set password</label>
				<input
				  type="password"
				  bind:value={password}
				  placeholder="Enter password"
				  style="width: 100%;"
				/>
			  </div>
			{/if}
		  </section>
  
		  <section class="config-subsection">
			<h3 class="section-subtitle">limits & behavior</h3>
			<div class="toggle-row">
			  <label class="toggle-label-large">
				<span>Download limit</span>
			  </label>
			  <div class="toggle-controls">
				<input
				  type="checkbox"
				  bind:checked={downloadLimitEnabled}
				  class="toggle-checkbox"
				/>
				{#if downloadLimitEnabled}
				  <input
					type="number"
					min="1"
					bind:value={downloadLimit}
					class="download-limit-input"
				  />
				{/if}
			  </div>
			</div>
  
			<div class="toggle-row">
			  <label class="toggle-label-large">
				<span>View once (auto-delete after first view)</span>
			  </label>
			  <div class="toggle-controls">
				<input
				  type="checkbox"
				  bind:checked={viewOnce}
				  class="toggle-checkbox"
				/>
			  </div>
			</div>
  
			<div class="toggle-row">
			  <label class="toggle-label-large">
				<span>Embed preview (opens in page, no direct download)</span>
			  </label>
			  <div class="toggle-controls">
				<input
				  type="checkbox"
				  bind:checked={embedPreview}
				  class="toggle-checkbox"
				/>
			  </div>
			</div>
		  </section>
  
		  {#if generatedLink}
			<div class="success-section">
			  <h3>Your Share Link</h3>
			  <div class="link-container">
				<input 
				  type="text" 
				  value={generatedLink} 
				  readonly 
				  class="link-input"
				/>
				<button 
				  on:click={() => {
					if (browser && navigator.clipboard) {
					  navigator.clipboard.writeText(generatedLink);
					  alert('Link copied to clipboard!');
					}
				  }}
				  class="copy-button"
				>
				  Copy
				</button>
			  </div>
			  <div class="share-options">
				<a href={generatedLink} target="_blank" rel="noopener noreferrer" class="preview-button">
				  Preview Share Page
				</a>
			  </div>
			</div>
		  {/if}
		</div>
	  </section>
	{/if}
  
	<!-- overview -->
	<section class="section-box">
	  <h2 class="section-title">overview</h2>
	  <div class="section-content">
		<table>
		  <tbody>
			<tr>
			  <td>storage used</td>
			  <td>{data.storageUsed > 0 ? `${data.storageUsed.toFixed(2)} MB` : '0 MB'}</td>
			  <td>files</td>
			  <td>{data.totalFiles}</td>
			</tr>
			<tr>
			  <td>links active</td>
			  <td>{data.totalLinks}</td>
			  <td>expiring soon</td>
			  <td>{data.expiringSoon}</td>
			</tr>
			<tr>
			  <td>views (30d)</td>
			  <td>{data.totalViews.toLocaleString()}</td>
			  <td>downloads (30d)</td>
			  <td>{data.totalDownloads.toLocaleString()}</td>
			</tr>
			<tr>
			  <td>last login</td>
			  <td>{data.user?.lastLogin ? new Date(data.user.lastLogin).toLocaleString() : 'Never'}</td>
			  <td>account status</td>
			  <td>OK</td>
			</tr>
		  </tbody>
		</table>
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
  
	/* header with simple text navigation */
	.page-header {
	  display: flex;
	  justify-content: space-between;
	  align-items: flex-start;
	  gap: 1rem;
	  margin-bottom: 1rem;
	}
	h1 {
	  font-size: 1.1rem;
	  margin: 0 0 0.25rem 0;
	}
	.subtitle {
	  margin: 0;
	  color: var(--muted);
	  font-size: 0.9rem;
	}
	strong {
	  color: var(--accent);
	}
  
	/* Simple text navigation */
	.nav-links {
	  display: flex;
	  gap: 1.5rem;
	  align-items: center;
	}
	.nav-link, .logout-link {
	  color: var(--fg);
	  text-decoration: none;
	  font-size: 0.9rem;
	  padding: 0.5rem 0.8rem;
	  border-radius: 4px;
	  transition: all 0.2s ease;
	}
	.nav-link:hover, .logout-link:hover {
	  color: var(--accent);
	  background: rgba(111, 179, 192, 0.1);
	}
	.logout-link {
	  background: transparent;
	  border: none;
	  padding: 0.5rem 0.8rem;
	  cursor: pointer;
	  font-size: 0.9rem;
	}
	.logout-link:hover {
	  color: var(--accent);
	  background: rgba(111, 179, 192, 0.1);
	}
  
	/* section title-on-border layout */
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
  
	/* Dropzone styling */
	.dropzone {
	  border: 2px dashed var(--accent);
	  border-radius: 6px;
	  padding: 2rem;
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: center;
	  gap: 0.8rem;
	  margin-bottom: 1rem;
	  background-color: rgba(111, 179, 192, 0.05);
	}
	.hidden-input {
	  display: none;
	}
	.custom-file-btn {
	  padding: 0.4rem 0.7rem;
	  border: 1px solid var(--accent);
	  background: transparent;
	  color: var(--fg);
	  cursor: pointer;
	  display: inline-block;
	  text-align: center;
	}
	.custom-file-btn:hover {
	  background: var(--accent);
	  color: var(--bg);
	}
	.muted {
	  color: var(--muted);
	  font-size: 0.75rem;
	}
	.upload-btn {
	  padding: 0.4rem 0.7rem;
	  border: 1px solid var(--accent);
	  background: transparent;
	  color: var(--fg);
	  cursor: pointer;
	  margin-top: 0.5rem;
	}
	.upload-btn:hover:not(:disabled) {
	  background: var(--accent);
	  color: var(--bg);
	}
	.upload-btn.disabled {
	  opacity: 0.6;
	  cursor: not-allowed;
	}
  
	/* Quick actions - Updated styling for your files and your links buttons */
	.quick-actions {
	  display: flex;
	  gap: 0.6rem;
	  margin-top: 0.8rem;
	}
	.action-btn {
	  flex: 1;
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
	.files-btn {
	  border-color: #8bc34a; /* Greenish accent for files */
	  color: #8bc34a;
	}
	.files-btn:hover {
	  background: #8bc34a;
	  color: var(--bg);
	}
	.links-btn {
	  border-color: #ff9800; /* Orange accent for links */
	  color: #ff9800;
	}
	.links-btn:hover {
	  background: #ff9800;
	  color: var(--bg);
	}
  
	/* Configuration styling */
	.config-subsection {
	  margin: 1.5rem 0;
	}
	.section-subtitle {
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
  
	/* Dropdown Styling */
	.select-wrapper {
	  position: relative;
	  width: 100%;
	  margin-top: 0.5rem;
	}
	.custom-select {
	  appearance: none;
	  background: var(--dropdown-bg);
	  border: 1px solid var(--line);
	  color: var(--dropdown-fg);
	  padding: 0.6rem 1rem;
	  width: 100%;
	  border-radius: 4px;
	  cursor: pointer;
	  font: inherit;
	}
	.custom-select:hover {
	  background: #444147;
	}
	.custom-select option {
	  background: var(--dropdown-bg);
	  color: var(--dropdown-fg);
	}
	.select-wrapper::after {
	  content: '▼';
	  font-size: 0.7rem;
	  position: absolute;
	  right: 1rem;
	  top: 50%;
	  transform: translateY(-50%);
	  pointer-events: none;
	  color: var(--muted);
	}
  
	/* Toggle rows styling */
	.toggle-row {
	  display: flex;
	  align-items: center;
	  justify-content: space-between;
	  padding: 1rem 0;
	  border-bottom: 1px solid var(--line);
	}
	.toggle-row:last-child {
	  border-bottom: none;
	}
	.toggle-label-large {
	  flex: 1;
	  font-size: 1rem;
	  color: var(--fg);
	  cursor: pointer;
	  padding: 0.5rem 0;
	}
	.toggle-controls {
	  display: flex;
	  align-items: center;
	  gap: 1rem;
	}
	.toggle-checkbox {
	  width: 24px;
	  height: 24px;
	  cursor: pointer;
	  appearance: none;
	  background: var(--line);
	  border: 2px solid var(--accent);
	  border-radius: 6px;
	  position: relative;
	  transition: all 0.2s ease;
	}
	.toggle-checkbox:checked {
	  background: var(--accent);
	  border-color: var(--accent);
	}
	.toggle-checkbox:checked::after {
	  content: '✓';
	  position: absolute;
	  top: 50%;
	  left: 50%;
	  transform: translate(-50%, -50%);
	  color: var(--bg);
	  font-size: 14px;
	  font-weight: bold;
	}
	.download-limit-input {
	  background: transparent;
	  border: 1px solid var(--line);
	  color: var(--fg);
	  padding: 0.5rem;
	  width: 80px;
	  text-align: center;
	  border-radius: 4px;
	  font-size: 1rem;
	}
  
	.input-group {
	  display: flex;
	  flex-direction: column;
	  gap: 0.3rem;
	  margin-top: 1rem;
	}
	.input-group label {
	  font-size: 0.7rem;
	  color: var(--muted);
	}
	input[type="text"], input[type="password"] {
	  background: transparent;
	  border: 1px solid var(--line);
	  color: var(--fg);
	  padding: 0.6rem;
	  width: 100%;
	  border-radius: 4px;
	  font-size: 1rem;
	}
  
	/* Upload status */
	.upload-status {
	  margin-top: 0.5rem;
	  color: var(--muted);
	  font-size: 0.8rem;
	}
  
	/* Error message */
	.error-message {
	  background: var(--error);
	  color: var(--bg);
	  padding: 0.8rem;
	  border-radius: 8px;
	  margin: 0.5rem 0;
	  font-weight: bold;
	  font-size: 0.9rem;
	}
  
	/* Success section styling */
	.success-section {
	  margin-top: 2rem;
	  padding: 2rem;
	  background: var(--success);
	  color: var(--bg);
	  border-radius: 8px;
	  text-align: center;
	}
	.success-section h3 {
	  margin: 0 0 1rem 0;
	  font-size: 1.2rem;
	}
	.link-container {
	  display: flex;
	  gap: 0.5rem;
	  margin: 1rem 0;
	}
	.link-input {
	  flex: 1;
	  padding: 0.8rem;
	  border: 2px solid var(--bg);
	  border-radius: 4px;
	  font-size: 1rem;
	  background: var(--bg);
	  color: var(--fg);
	}
	.copy-button {
	  padding: 0.8rem 1.5rem;
	  background: var(--bg);
	  color: var(--success);
	  border: 2px solid var(--bg);
	  border-radius: 4px;
	  cursor: pointer;
	  font-weight: bold;
	  transition: all 0.2s ease;
	}
	.copy-button:hover {
	  background: transparent;
	  color: var(--bg);
	}
	.share-options {
	  margin-top: 1rem;
	}
	.preview-button {
	  display: inline-block;
	  padding: 0.8rem 1.5rem;
	  background: var(--bg);
	  color: var(--success);
	  text-decoration: none;
	  border-radius: 4px;
	  font-weight: bold;
	  transition: all 0.2s ease;
	}
	.preview-button:hover {
	  background: transparent;
	  color: var(--bg);
	  border: 2px solid var(--bg);
	}
  
	/* Table styling */
	table {
	  width: 100%;
	  border-collapse: collapse;
	  font-size: 0.85rem;
	}
	td {
	  padding: 0.4rem 0.6rem;
	  border: 1px solid var(--line);
	}
	
	.full-width {
  width: 100%;
  justify-content: center; /* keeps text centered */
	}
  </style>