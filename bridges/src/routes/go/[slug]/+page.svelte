<script lang="ts">
    // `data` is passed from the `load` function in +page.server.ts
    // `form` is passed from the form action after submission
    export let data;
    export let form;
</script>

<div class="password-container">
    <div class="form-box">
        <h2>Password Required</h2>
        <p>
            To access the file <strong>{data.title || data.fileName}</strong>, please enter the password below.
        </p>

        <form method="POST">
            <label for="password">Password</label>
            <input 
                type="password" 
                name="password" 
                id="password" 
                placeholder="Enter password"
                required
                aria-invalid={form?.error}
            />

            {#if form?.error}
                <p class="error">{form.error}</p>
            {/if}
            
            <button type="submit">Unlock File</button>
        </form>
    </div>
</div>

<style>
    /* Add some basic styling for the password page */
    :global(body) {
        background-color: #121212;
        color: #d1d1d1;
        font-family: 'Source Code Pro', monospace;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
    }

    .password-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 20px;
    }

    .form-box {
        background-color: #202020;
        border: 1px solid #383838;
        border-radius: 4px;
        padding: 30px;
        width: 100%;
        max-width: 400px;
        text-align: center;
    }

    h2 {
        margin-bottom: 10px;
    }

    p {
        color: #888888;
        margin-bottom: 25px;
    }

    form {
        display: flex;
        flex-direction: column;
    }

    label {
        text-align: left;
        margin-bottom: 8px;
        font-size: 0.9em;
    }
    
    input {
        background-color: #121212;
        border: 1px solid #383838;
        color: #d1d1d1;
        padding: 12px;
        border-radius: 4px;
        font-family: inherit;
        font-size: 1em;
        margin-bottom: 15px;
    }

    input:focus {
        outline: none;
        border-color: #3d8dff;
    }

    button {
        background-color: #121212;
        color: white;
        border: none;
        padding: 12px;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        font-size: 1em;
        font-weight: bold;
        transition: background-color 0.2s;
    }

    button:hover {
        background-color: #5a9eff;
    }

    .error {
        color: #ff5555;
        background-color: rgba(255, 85, 85, 0.1);
        border: 1px solid #ff5555;
        border-radius: 4px;
        padding: 10px;
        margin-bottom: 15px;
        text-align: center;
    }

    input[aria-invalid="true"] {
        border-color: #ff5555;
    }
</style>