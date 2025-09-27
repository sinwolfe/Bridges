<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<svelte:head>
	<title>Admin Dashboard</title>
</svelte:head>

<main>
	<header class="between">
		<div>
			<h1>Admin Panel</h1>
			<div class="muted">Welcome, {data.user?.username || 'Admin'}!</div>
		</div>
		<form method="POST" class="row">
			<a href="/" class="muted">Home</a>
			<button type="submit" formaction="?/logout" class="muted-btn">Logout</button>
		</form>
	</header>

	<section>
		<fieldset>
			<legend>Overview</legend>
			<table class="overview-table">
				<tbody>
					<tr>
						<th>Username</th>
						<td>{data.user?.username}</td>
					</tr>
					<tr>
						<th>User ID</th>
						<td>
							<code>{data.user?.id}</code>
						</td>
					</tr>
					<tr>
						<th>Status</th>
						<td><span class="ok">Admin Privileges Active</span></td>
					</tr>
				</tbody>
			</table>
		</fieldset>
	</section>

	<section>
		<fieldset>
			<legend>User Management</legend>
			<p class="muted">Total users: {data.users?.length || 0}</p>
			{#if data.error}
				<p class="bad">{data.error}</p>
			{/if}
			<table class="user-management-table">
				<thead>
					<tr>
						<th>User</th>
						<th class="center">Created</th>
						<th class="center">Status</th>
						<th class="center">Admin</th>
						<th class="center">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#if data.users?.length}
						{#each data.users as u (u.id)}
							<tr>
								<td>@{u.username || u.email}</td>
								<td class="nowrap center">{new Date(u.created).toLocaleDateString()}</td>
								<td class="center">
									{#if u.disabled}
										<span class="bad">Disabled</span>
									{:else}
										<span class="ok">Enabled</span>
									{/if}
								</td>
								<td class="center">
									{#if u.isAdmin}
										<svg
											class="checkmark"
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2.5"
											stroke-linecap="round"
											stroke-linejoin="round"
											><polyline points="20 6 9 17 4 12" /></svg
										>
									{:else}
										<span class="muted">—</span>
									{/if}
								</td>
								<td class="nowrap center">
									{#if u.id !== data.user?.id}
										<form method="POST" style="display:inline;">
											<input type="hidden" name="id" value={u.id} />
											<input type="hidden" name="disabled" value={u.disabled ? 'true' : 'false'} />

											{#if u.disabled}
												<button class="btn-ok action-btn" formaction="?/toggleStatus"
													>Enable</button
												>
											{:else}
												<button class="btn-warn action-btn" formaction="?/toggleStatus"
													>Disable</button
												>
											{/if}
										</form>
									{/if}
								</td>
							</tr>
						{/each}
					{:else if !data.error}
						<tr>
							<td colspan="5" class="muted">No users found.</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</fieldset>
	</section>
</main>

<style>
	:global(*),
	:global(*::before),
	:global(*::after) {
		box-sizing: border-box;
	}
	main {
		max-width: 980px;
		margin: 6vh auto;
		padding: 0 1rem;
		font:
			15px/1.5 monospace,
			sans-serif;
		color: var(--fg);
	}
	h1 {
		font-size: 1rem;
		margin: 0 0 0.25rem 0;
	}
	.muted {
		color: var(--muted);
	}
	.ok {
		color: var(--ok);
	}
	.bad {
		color: var(--bad);
	}
	a {
		color: var(--muted);
		text-decoration: none;
	}
	a:hover {
		color: var(--accent);
	}
	fieldset {
		border: 1px solid var(--line);
		padding: 1rem;
		margin: 2rem 0 1rem 0;
	}
	legend {
		padding: 0 0.4rem;
		color: var(--muted);
		font-size: 0.85rem;
	}
	.row {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}
	.between {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2rem;
	}
	button,
	.muted-btn {
		padding: 0.45rem 0.7rem;
		border: 1px solid var(--accent);
		background: transparent;
		color: var(--fg);
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
	}
	.muted-btn {
		border-color: transparent;
		color: var(--muted);
	}
	.muted-btn:hover {
		color: var(--accent);
	}
	.action-btn {
		min-width: 90px;
	}
	.btn-warn {
		border-color: var(--warn);
	}
	.btn-ok {
		border-color: var(--ok);
	}
	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 0.5rem;
		table-layout: fixed;
	}
	th,
	td {
		padding: 0.5rem 0.6rem;
		border: 1px solid var(--line);
		vertical-align: middle;
	}
	th {
		color: var(--muted);
		text-align: left;
	}

	.checkmark {
		color: var(--ok);
		width: 1.1em;
		height: 1.1em;
		vertical-align: middle;
	}

	.overview-table th:first-child {
		width: 25%;
	}

	.user-management-table th:nth-child(1) { width: 30%; }
	.user-management-table th:nth-child(2) { width: 20%; }
	.user-management-table th:nth-child(3) { width: 17%; }
	.user-management-table th:nth-child(4) { width: 13%; }
	.user-management-table th:nth-child(5) { width: 20%; }

	.user-management-table td:first-child {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	code {
		background: #2b292d;
		border: 1px solid var(--line);
		padding: 0.05rem 0.3rem;
	}
	.nowrap {
		white-space: nowrap;
	}
	.center {
		text-align: center;
	}
</style>