import { UserManager } from "https://cdn.jsdelivr.net/npm/oidc-client-ts@2.2.2/+esm";

const cognitoAuthConfig = {
    authority: "[PAT HERE]",
    client_id: "[PAT HERE]",
    redirect_uri: "http://localhost:5500/callback", // Changed back to port 5500 for local testing
    response_type: "code",
    scope: "email openid phone"
};

export const userManager = new UserManager({
    ...cognitoAuthConfig,
});

const signOutRedirect = () =>
{
    // Clear tokens from UI
    document.getElementById("email").textContent = "";
    document.getElementById("access-token").value = "";
    document.getElementById("id-token").value = "";
    document.getElementById("refresh-token").value = "";
    // Remove oidc-client user from localStorage/sessionStorage
    localStorage.removeItem("oidc.user:[Use Authority value]:[client id]");
    sessionStorage.removeItem("oidc.user:[Use Authority value]:[client id]");
    // Redirect to Cognito logout
    const clientId = "[PAT HERE]";
    const logoutUri = "http://localhost:5500";
    const cognitoDomain = "[PAT HERE]";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
};

// UI logic
window.addEventListener("DOMContentLoaded", () =>
{
    const signInBtn = document.getElementById("signIn");
    const signOutBtn = document.getElementById("signOut");
    const emailEl = document.getElementById("email");
    const accessTokenEl = document.getElementById("access-token");
    const idTokenEl = document.getElementById("id-token");
    const refreshTokenEl = document.getElementById("refresh-token");
    const copyAccessBtn = document.getElementById("copy-access");
    const copyIdBtn = document.getElementById("copy-id");
    const copyRefreshBtn = document.getElementById("copy-refresh");

    if (signInBtn)
    {
        signInBtn.addEventListener("click", async () =>
        {
            await userManager.signinRedirect();
        });
    }
    if (signOutBtn)
    {
        signOutBtn.addEventListener("click", async () =>
        {
            await signOutRedirect();
        });
    }

    if (copyAccessBtn && accessTokenEl)
    {
        copyAccessBtn.addEventListener("click", () =>
        {
            accessTokenEl.select();
            document.execCommand("copy");
        });
    }
    if (copyIdBtn && idTokenEl)
    {
        copyIdBtn.addEventListener("click", () =>
        {
            idTokenEl.select();
            document.execCommand("copy");
        });
    }
    if (copyRefreshBtn && refreshTokenEl)
    {
        copyRefreshBtn.addEventListener("click", () =>
        {
            refreshTokenEl.select();
            document.execCommand("copy");
        });
    }

    // Handle callback
    if (window.location.pathname.endsWith("/callback") || window.location.search.includes("code="))
    {
        userManager.signinCallback().then(function (user)
        {
            emailEl.textContent = user.profile?.email || "";
            accessTokenEl.value = user.access_token || "";
            idTokenEl.value = user.id_token || "";
            refreshTokenEl.value = user.refresh_token || "";
            if (signInBtn) signInBtn.style.display = "none";
        }).catch(() =>
        {
            emailEl.textContent = "";
            accessTokenEl.value = "";
            idTokenEl.value = "";
            refreshTokenEl.value = "";
            if (signInBtn) signInBtn.style.display = "";
        });
    } else
    {
        // Try to get user from storage
        userManager.getUser().then(function (user)
        {
            if (user && !user.expired)
            {
                emailEl.textContent = user.profile?.email || "";
                accessTokenEl.value = user.access_token || "";
                idTokenEl.value = user.id_token || "";
                refreshTokenEl.value = user.refresh_token || "";
                if (signInBtn) signInBtn.style.display = "none";
            } else {
                if (signInBtn) signInBtn.style.display = "";
            }
        });
    }
});
