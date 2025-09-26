<script lang="ts">
    // Make sure you have pocketbase installed: npm install pocketbase
    import { onMount } from 'svelte';
    import PocketBase from 'pocketbase';

    // --- State Variables ---
    let pb: PocketBase;
    let files: FileList | null = null;
    let title = "";
    let tags = "";
    let visibility: "public" | "unlisted" | "password" = "unlisted";
    let password = "";
    let expires = "forever";
    let downloadLimit: number = 0;
    let viewOnce = false;
    let resultLink = "";
    let isCreating = false;
    let selectedFileName = "No files selected";

    // Initialize PocketBase client on component mount
    onMount(() => {
        // Replace with your actual PocketBase server URL
        pb = new PocketBase('http://127.0.0.1:8090');
    });

    // --- Event Handlers & Logic ---

    function handleFileChange(e: Event) {
        const target = e.target as HTMLInputElement;
        files = target.files;
        if (files && files.length > 0) {
            selectedFileName = files[0].name;
        } else {
            selectedFileName = "No files selected";
        }
    }

    const expiresOptions = [
        { label: "forever", value: "forever" },
        { label: "in 1 hour", value: "1h" },
        { label: "in 24 hours", value: "24h" },
        { label: "in 7 days", value: "7d" },
        { label: "in 30 days", value: "30d" },
        { label: "in 1 year", value: "1y" },
    ];

    function computeExpiry(value: string): string | null {
        const now = new Date();
        switch (value) {
            case "1h": now.setHours(now.getHours() + 1); break;
            case "24h": now.setDate(now.getDate() + 1); break;
            case "7d": now.setDate(now.getDate() + 7); break;
            case "30d": now.setDate(now.getDate() + 30); break;
            case "1y": now.setFullYear(now.getFullYear() + 1); break;
            case "forever": default: return null;
        }
        return now.toISOString();
    }

    async function createLink() {
        if (!pb) {
            alert("PocketBase client not initialized.");
            return;
        }
        if (!files || !files[0]) {
            alert("Please select a file to upload.");
            return;
        }

        isCreating = true;
        resultLink = ""; // Clear previous result

        const formData = new FormData();
        formData.append("file", files[0], files[0].name);
        formData.append("title", title || "test upload");
        if (tags) formData.append("tags", tags);
        if (visibility) formData.append("visibility", visibility);
        if (visibility === "password" && password) {
            formData.append("password", password);
        }

        const expiryDate = computeExpiry(expires);
        if (expiryDate) formData.append("expires", expiryDate);
        if (downloadLimit > 0) {
            formData.append("downloadLimit", downloadLimit.toString());
        }
        formData.append("viewOnce", viewOnce ? "true" : "false");

        try {
            const record = await pb.collection("uploads").create(formData);
            const fileUrl = pb.files.getUrl(record, record.file);
            let slug: string;
            let created = false;
            while (!created) {
                slug = Math.random().toString(36).substring(2, 8);
                try {
                    await pb.collection("links").create({ slug, target: fileUrl });
                    created = true;
                } catch (err: any) {
                    if (err?.status === 400) {
                        console.warn(`Slug ${slug} already exists, retrying...`);
                        continue;
                    }
                    throw err;
                }
            }
            resultLink = `${window.location.origin}/go/${slug}`;
        } catch (err: any) {
            console.error("Upload error:", err);
            alert("Upload failed: " + (err?.message || JSON.stringify(err)));
        } finally {
            isCreating = false;
        }
    }
</script>

<div class="container">
    <div class="form-container">
        <form on:submit|preventDefault={createLink}>
            <fieldset class="form-section">
                <legend class="section-title">upload</legend>
                <div class="form-group">
                    <label for="file-upload" class="file-picker-label">
                        {selectedFileName}
                    </label>
                    <input type="file" id="file-upload" on:change={handleFileChange} hidden />
                </div>
                <div class="form-group">
                    <label for="title">title <span class="label-hint">(optional)</span></label>
                    <input type="text" id="title" bind:value={title} placeholder="optional label" />
                </div>
                <div class="form-group">
                    <label for="tags">tags <span class="label-hint">(optional)</span></label>
                    <input type="text" id="tags" bind:value={tags} placeholder="comma, separated" />
                </div>
            </fieldset>

            <fieldset class="form-section">
                <legend class="section-title">link</legend>
                <div class="form-group">
                    <label>visibility</label>
                    <div class="radio-group">
                        <div class="radio-option">
                            <input type="radio" id="public" bind:group={visibility} value="public" />
                            <label for="public">public</label>
                        </div>
                        <div class="radio-option">
                            <input type="radio" id="unlisted" bind:group={visibility} value="unlisted" />
                            <label for="unlisted">unlisted</label>
                        </div>
                        <div class="radio-option">
                            <input type="radio" id="password-protected" bind:group={visibility} value="password" />
                            <label for="password-protected">password protected</label>
                        </div>
                    </div>
                </div>

                {#if visibility === 'password'}
                <div class="form-group">
                    <label for="password">password</label>
                    <input type="password" id="password" bind:value={password} placeholder="leave blank unless password protected" />
                </div>
                {/if}

                <div class="form-group">
                    <label for="expires">expires</label>
                    <div class="select-wrapper">
                        <select id="expires" bind:value={expires}>
                            {#each expiresOptions as option}
                                <option value={option.value}>{option.label}</option>
                            {/each}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="download-limit">download limit</label>
                    <input type="number" id="download-limit" bind:value={downloadLimit} min="0" />
                    <span class="input-hint">(infinite)</span>
                </div>
                <div class="form-group checkbox-group">
                    <input type="checkbox" id="view-once" bind:checked={viewOnce} />
                    <label for="view-once">view-once</label>
                </div>
            </fieldset>

            <fieldset class="form-section result-section">
                <legend class="section-title">result: <span class="label-hint">(short link appears after upload)</span></legend>
                {#if resultLink}
                <div class="result-display">{resultLink}</div>
                {/if}
                <button type="submit" class="create-link-btn" disabled={isCreating}>
                    {isCreating ? 'creating...' : 'create link'}
                </button>
            </fieldset>
        </form>

        <p class="tip">tip: choose visibility, expiry, and limits before creating a link. you can revoke later.</p>
    </div>
</div>

<style>
    /* Using :global() ensures these styles apply correctly, as they were originally in a global stylesheet */
    :global(*) {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }
    :global(:root) {
        --bg-color: #121212;
        --surface-color: #202020;
        --border-color: #383838;
        --text-color: #d1d1d1;
        --text-muted-color: #888888;
        --accent-color: #3d8dff;
        --font-family: 'Source Code Pro', monospace;
    }
    :global(body) {
        background-color: var(--bg-color);
        color: var(--text-color);
        font-family: var(--font-family);
        font-size: 14px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 50px 20px;
        min-height: 100vh;
    }
    /* Add other global styles here or wrap the entire CSS block in :global() if preferred */
    .container {
        display: flex;
        flex-wrap: wrap;
        gap: 60px;
        align-items: flex-start;
        justify-content: center;
        width: 100%;
        max-width: 960px;
    }
    .form-container {
        width: 100%;
        max-width: 450px;
    }
    form {
        display: flex;
        flex-direction: column;
        gap: 25px;
    }
    fieldset {
        border: none;
    }
    .form-section {
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 25px 20px 5px 20px;
        position: relative;
    }
    .section-title {
        font-size: 1em;
        font-weight: 400;
        color: var(--text-muted-color);
        text-transform: lowercase;
        background-color: var(--bg-color);
        padding: 0 8px;
        position: absolute;
        top: -9px;
        left: 12px;
    }
    .form-group {
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
    }
    .form-group label {
        margin-bottom: 8px;
        color: var(--text-color);
    }
    input[type="text"],
    input[type="password"],
    input[type="number"],
    select,
    textarea {
        background-color: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        color: var(--text-color);
        padding: 10px;
        font-family: var(--font-family);
        font-size: 1em;
        width: 100%;
        outline: none;
        transition: border-color 0.2s;
    }
    input[type="text"]:focus,
    input[type="password"]:focus,
    input[type="number"]:focus,
    select:focus,
    textarea:focus {
        border-color: var(--accent-color);
    }
    :global(::placeholder) {
        color: var(--text-muted-color);
        opacity: 1;
    }
    .label-hint, .input-hint {
        color: var(--text-muted-color);
        font-weight: 400;
    }
    .file-picker-label {
        background-color: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 10px;
        cursor: pointer;
        color: var(--text-muted-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .radio-group { display: flex; flex-direction: column; gap: 10px; }
    .radio-option { display: flex; align-items: center; }
    .radio-option input[type="radio"] { display: none; }
    .radio-option label { margin: 0; cursor: pointer; position: relative; padding-left: 25px; }
    .radio-option label::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; border-radius: 50%; border: 1px solid var(--border-color); background-color: var(--surface-color); }
    .radio-option input[type="radio"]:checked + label::before { border-color: var(--accent-color); }
    .radio-option input[type="radio"]:checked + label::after { content: ''; position: absolute; left: 4px; top: 50%; transform: translateY(-50%); width: 8px; height: 8px; border-radius: 50%; background-color: var(--accent-color); }
    .select-wrapper { position: relative; }
    .select-wrapper::after { content: 'v'; position: absolute; top: 50%; right: 12px; transform: translateY(-50%); pointer-events: none; color: var(--text-muted-color); font-size: 12px; }
    select { appearance: none; -webkit-appearance: none; -moz-appearance: none; }
    .checkbox-group { flex-direction: row; align-items: center; }
    .checkbox-group input[type="checkbox"] { display: none; }
    .checkbox-group label { margin: 0; position: relative; padding-left: 25px; cursor: pointer; }
    .checkbox-group label::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; border: 1px solid var(--border-color); background-color: var(--surface-color); border-radius: 3px; }
    .checkbox-group input[type="checkbox"]:checked + label::before { background-color: var(--accent-color); border-color: var(--accent-color); background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='white'%3E%3Cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: center; }
    .result-section { padding-top: 15px; }
    .create-link-btn { background-color: var(--surface-color); border: 1px solid var(--border-color); color: var(--text-color); padding: 10px 15px; font-family: var(--font-family); cursor: pointer; border-radius: 4px; align-self: flex-start; transition: all 0.2s; }
    .create-link-btn:hover { border-color: var(--text-color); }
    .create-link-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .result-display {
        margin-bottom: 15px;
        color: var(--accent-color);
        word-break: break-all;
    }
    .tip { font-size: 0.85em; color: var(--text-muted-color); }
</style>