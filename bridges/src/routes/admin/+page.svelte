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
            <table>
                <tbody>
                    <tr><th>Username</th><td>{data.user?.username}</td></tr>
                    <tr><th>User ID</th><td><code>{data.user?.id}</code></td></tr>
                    <tr><th>Status</th><td><span class="ok">Admin Privileges Active</span></td></tr>
                </tbody>
            </table>
        </fieldset>
    </section>

    <section>
        <fieldset>
            <legend>User Management</legend>
            <p class="muted">
                Total users: {data.users?.length || 0}
            </p>
            <table>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Created</th>
                        <th>Status</th>
                        <th>Admin</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#if data.users?.length}
                        {#each data.users as u (u.id)}
                            <tr>
                                <td>@{u.username || u.email}</td>
                                <td class="nowrap">{new Date(u.created).toLocaleDateString()}</td>
                                <td>
                                    {#if u.isVerified}
                                        {#if u.disabled}
                                            <span class="bad">disabled</span>
                                        {:else}
                                            <span class="ok">verified</span>
                                        {/if}
                                    {:else}
                                        <span class="muted">pending</span>
                                    {/if}
                                </td>
                                <td>
                                    {#if u.isAdmin}
                                        <span class="ok">✓</span>
                                    {:else}
                                        <span class="muted">—</span>
                                    {/if}
                                </td>
                                <td class="nowrap">
                                    <a class="muted-btn" href={`/admin/users/${u.id}`}>View</a>

                                    {#if !u.verified}
                                        <form method="POST" style="display:inline;">
                                            <input type="hidden" name="id" value={u.id} />
                                            <button class="btn-ok" formaction="?/verify">Verify</button>
                                        </form>
                                    {/if}

                                    {#if u.id !== data.user?.id}
                                        <form method="POST" style="display:inline;">
                                            <input type="hidden" name="id" value={u.id} />
                                            <input type="hidden" name="disabled" value={u.disabled ? 'true' : 'false'} />
                                            <button class="btn-warn" formaction="?/toggleDisable">
                                                {u.disabled ? 'Enable' : 'Disable'}
                                            </button>
                                        </form>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    {:else}
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
    :root {
        --bg: #232025;
        --fg: #efd5c5;
        --muted: #8f8886;
        --line: #3b393e;
        --accent: #6fb3c0;
        --ok: #51b04f;
        --warn: #d09950;
        --bad: #ff7a5f;
    }
    main {
        max-width: 980px;
        margin: 6vh auto;
        padding: 0 1rem;
        font: 15px/1.5 monospace;
        color: var(--fg);
    }
    h1 { font-size: 1rem; margin: 0 0 0.25rem 0; }
    .muted { color: var(--muted); }
    .ok { color: var(--ok); }
    .bad { color: var(--bad); }
    a { color: var(--muted); text-decoration: none; }
    a:hover { color: var(--accent); }
    fieldset { border: 1px solid var(--line); padding: 1rem; margin: 2rem 0 1rem 0; }
    legend { padding: 0 0.4rem; color: var(--muted); font-size: 0.85rem; }
    .row { display: flex; gap: 0.75rem; align-items: center; }
    .between { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 2rem; }
    button, .muted-btn { padding: 0.45rem 0.7rem; border: 1px solid var(--accent); background: transparent; color: var(--fg); cursor: pointer; font-family: inherit; font-size: inherit; }
    .muted-btn { border-color: transparent; color: var(--muted); }
    .muted-btn:hover { color: var(--accent); }
    .btn-warn { border-color: var(--warn); }
    .btn-ok { border-color: var(--ok); }
    table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
    th, td { padding: 0.5rem 0.6rem; border: 1px solid var(--line); vertical-align: top; }
    th { color: var(--muted); text-align: left; }
    code { background: #2b292d; border: 1px solid var(--line); padding: 0.05rem 0.3rem; }
    .nowrap { white-space: nowrap; }
</style>
