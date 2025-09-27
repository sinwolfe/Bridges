
<script lang="ts">

    // Make sure you have pocketbase installed: npm install pocketbase

    import { onMount } from 'svelte';

    import { pb } from '$lib/pocketbase';


    // --- State Variables ---

    let files: FileList | null = null;

    let title = "";

    let tags = "";

    let visibility: "public" | "password" = "public";

    let password = "";

    let expires = "forever";

    let downloadLimit: number = 0;

    let viewOnce = false;

    let resultLink = "";

    let isCreating = false;

    let selectedFileName = "No files selected";

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


    function copyLink()     {

        if (resultLink) {

            navigator.clipboard.writeText(resultLink);

            alert("Link copied to clipboard!");

            }

        }



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

        if (downloadLimit <= 0) {
            formData.append("downloadLimit", "-1");
        } else {
            formData.append("downloadLimit", downloadLimit.toString());
        }

        formData.append("viewOnce", viewOnce ? "true" : "false");


        // The outer 'try' block starts here

        try {

            const record = await pb.collection("uploads").create(formData);

            

            let slug: string = ""; // Initialize slug

            let created = false;

            

            while (!created) {

                slug = Math.random().toString(36).substring(2, 8);

                

                // The inner 'try...catch' for handling slug collisions

                try {

                    // Use the 'upload_id' relation we set up

                    await pb.collection("links").create({ slug, upload_id: record.id });

                    created = true;

                } catch (err: any) {

                    // This 'catch' only handles errors from creating the link

                    if (err?.status === 400) {

                        console.warn(`Slug ${slug} already exists, retrying...`);

                        continue; // Try again with a new slug

                    }

                    // For any other error, stop the process

                    throw err; 

                }

            }

            

            resultLink = `${window.location.origin}/go/${slug}`;


        // This 'catch' handles errors from the entire upload process

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

                            <label for="public">anyone with the link</label>

                        </div>

                        <div class="radio-option">

                            <input type="radio" id="password-protected" bind:group={visibility} value="password" />

                            <label for="password-protected">protect with a password</label>

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

                    <span class="input-hint">(0 = infinite)</span>

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

                <button

                type="submit"

                class="create-link-btn"

                disabled={isCreating}

                on:click|preventDefault={resultLink ? copyLink : createLink}

                >

                {#if isCreating}

                    creating...

                {:else if resultLink}

                    copy link

                {:else}

                    create link

                {/if}

                </button>

            </fieldset>

        </form>


        <p class="tip">tip: choose visibility, expiry, and limits before creating a link. you can revoke later.</p>

    </div>

</div>


<style>
    /* maybe this will fix the input box overflowing? idk lol just test/bandaid */
	/* update: actually maybe this is the proper way.. */
    /* styled by hakimi */
	:global(*),
	:global(*::before),
	:global(*::after) {
		box-sizing: border-box;
	}

    .container {
        max-width: 480px;
        margin: 0 auto;
    }

	.form-section {
		border: 1px solid var(--line);
		padding: 1rem;
		margin: 0 0 1rem 0;
	}

	.section-title {
		position: static;
		background-color: transparent;
		padding: 0 0.4rem;
		color: var(--muted);
		font-size: 0.85rem;
		margin-bottom: 0.5rem;
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