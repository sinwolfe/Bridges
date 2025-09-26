<script lang="ts">
	// Correct import for navigation
	import { goto } from '$app/navigation'; // Correct import
	import type { PageData } from './$types';
  
	// Export the data prop received from the server load function
	export let data: PageData;
  </script>
  
  <main>
	<header class="page-header">
	  <div>
		<h1>bridges / dashboard</h1>
		<p class="subtitle">welcome, <strong>@{data.user?.username ?? 'guest'}</strong> – minimal overview + quick actions</p>
	  </div>
  
	  <!-- logout button -->
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
  
		<!-- Quick actions: only your links button remains -->
		<div class="quick-actions">
		  <button on:click={() => goto('/links')} class="action-btn links-btn">your links</button>
		</div>
	  </div>
	</section>
  
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
  
	/* Quick actions - Updated styling for your links button */
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
	.links-btn {
	  border-color: #ff9800; /* Orange accent for links */
	  color: #ff9800;
	}
	.links-btn:hover {
	  background: #ff9800;
	  color: var(--bg);
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
  