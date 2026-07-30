const usernameInput = document.getElementById("username");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");

const loading = document.getElementById("loading");
const error = document.getElementById("error");
const profile = document.getElementById("profile");
const repos = document.getElementById("repos");

const historyList = document.getElementById("historyList");
const themeBtn = document.getElementById("themeBtn");
const welcome = document.getElementById("welcome");

let searches = JSON.parse(localStorage.getItem("history")) || [];

searchBtn.addEventListener("click", () => {

    const username = usernameInput.value.trim();

    if (username === "") {

        showError("Please enter a GitHub username.");

        return;

    }

    saveHistory(username);

    fetchUser(username);

});


usernameInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        searchBtn.click();

    }

});


usernameInput.addEventListener("input", () => {

    if (usernameInput.value.trim() !== "") {

        clearBtn.style.display = "block";

    } else {

        clearBtn.style.display = "none";

    }

});

clearBtn.addEventListener("click", () => {

    usernameInput.value = "";

    usernameInput.focus();

    clearBtn.style.display = "none";

});

async function fetchUser(username) {

    showLoading();

    welcome.style.display = "none";

    profile.innerHTML = "";

    repos.innerHTML = "";

    error.classList.add("hidden");

    try {

        const response = await fetch(
            `https://api.github.com/users/${username}`
        );

        if (response.status === 404) {

            throw new Error("User Not Found.");

        }

        if (response.status === 403) {

            throw new Error(
                "GitHub API Rate Limit Exceeded. Try Again Later."
            );

        }

        if (!response.ok) {

            throw new Error("Something went wrong.");

        }

        const user = await response.json();

        displayUser(user);

        fetchRepos(username);

    }

    catch (err) {

        hideLoading();

        profile.innerHTML = "";

        repos.innerHTML = "";

        showError(err.message);

    }

}

async function fetchRepos(username) {

    try {

        const response = await fetch(

            `https://api.github.com/users/${username}/repos?sort=updated&per_page=5`

        );

        const repoList = await response.json();

        displayRepos(repoList);

    }

    catch (err) {

        console.log(err);

    }

    hideLoading();

}

function displayUser(user) {

    profile.innerHTML = `

    <div class="profile-card">

        <img src="${user.avatar_url}" alt="${user.login}">

        <div class="info">

            <h2>${user.name || "No Name"}</h2>

            <p><strong>@${user.login}</strong></p>

            <p>${user.bio || "No Bio Available"}</p>

            <div class="stats">

                <div>

                    <strong>${user.followers}</strong>

                    Followers

                </div>

                <div>

                    <strong>${user.following}</strong>

                    Following

                </div>

                <div>

                    <strong>${user.public_repos}</strong>

                    Repositories

                </div>

            </div>

            <p>

                📅 Joined :

                ${formatDate(user.created_at)}

            </p>

            <br>

            <a href="${user.html_url}" target="_blank">

                🔗 Visit GitHub Profile

            </a>

        </div>

    </div>

    `;

}


function displayRepos(repoList) {

    if (repoList.length === 0) {

        repos.innerHTML = `

        <div class="error">

            <h3>No Public Repositories Found</h3>

        </div>

        `;

        return;

    }

    repos.innerHTML = "<h2>Latest Repositories</h2>";

    repoList.forEach(repo => {

        repos.innerHTML += `

        <div class="repo">

            <h3>

                <a href="${repo.html_url}" target="_blank">

                    ${repo.name}

                </a>

            </h3>

            <p>

                ${repo.description || "No Description Available"}

            </p>

            <p>

                ⭐ ${repo.stargazers_count}

                &nbsp;&nbsp;

                🍴 ${repo.forks_count}

                &nbsp;&nbsp;

                💻 ${repo.language || "N/A"}

            </p>

        </div>

        `;

    });

}

function showLoading() {

    loading.classList.remove("hidden");

    searchBtn.disabled = true;

    searchBtn.innerHTML = "Searching...";

}

function hideLoading() {

    loading.classList.add("hidden");

    searchBtn.disabled = false;

    searchBtn.innerHTML = `

        <i class="fa-solid fa-magnifying-glass"></i>

        Search

    `;

}


function showError(message) {

    error.classList.remove("hidden");

    error.innerHTML = `

    <h3>❌ Error</h3>

    <p>${message}</p>

    `;

}


function formatDate(date) {

    return new Date(date).toLocaleDateString(

        "en-GB",

        {

            day: "numeric",

            month: "short",

            year: "numeric"

        }

    );

}


if (localStorage.getItem("theme") === "light") {

    document.body.classList.add("light");

    themeBtn.textContent = "☀";

}

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {

        localStorage.setItem("theme", "light");

        themeBtn.textContent = "☀";

    }

    else {

        localStorage.setItem("theme", "dark");

        themeBtn.textContent = "🌙";

    }

});

function saveHistory(username) {

    if (searches.includes(username)) return;

    searches.unshift(username);

    if (searches.length > 5) {

        searches.pop();

    }

    localStorage.setItem(

        "history",

        JSON.stringify(searches)

    );

    renderHistory();

}

function renderHistory() {

    historyList.innerHTML = "";

    searches.forEach(user => {

        historyList.innerHTML += `

        <li onclick="historySearch('${user}')">

            🔍 ${user}

        </li>

        `;

    });

}

function historySearch(username) {

    usernameInput.value = username;

    clearBtn.style.display = "block";

    fetchUser(username);

}

renderHistory();