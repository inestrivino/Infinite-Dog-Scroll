let backToTopBtn = document.getElementById("backToTopBtn");

window.onscroll = function () {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        backToTopBtn.style.display = "flex";
    } else {
        backToTopBtn.style.display = "none";
    }
};

function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

const dogImages = new Set();
let lastApiCallTime = 0;
const API_COOLDOWN = 200;

async function fetchDogImage() {
    try {
        const response = await fetch("https://dog.ceo/api/breeds/image/random");
        const data = await response.json();
        if (data.status === "success") {
            return data.message;
        } else {
            throw new Error("Failed to fetch dog image");
        }
    } catch (error) {
        console.error("Error fetching dog image:", error);
        return null;
    }
}

function extractBreedName(imageUrl) {
    const parts = imageUrl.split("/breeds/");
    if (parts.length > 1) {
        const breedPart = parts[1].split("/")[0];
        return breedPart.replace(/-/g, " ");
    }
    return "Unknown breed";
}

function createDogImageElement(imageUrl) {
    const div = document.createElement("div");
    const img = document.createElement("img");
    const title = document.createElement("h2");

    img.src = imageUrl;
    const breedName = extractBreedName(imageUrl);
    img.alt = `A ${breedName} dog`;
    img.title = breedName.charAt(0).toUpperCase() + breedName.slice(1);
    title.textContent = breedName.charAt(0).toUpperCase() + breedName.slice(1);

    div.appendChild(img);
    div.appendChild(title);

    div.classList.add("dog-picture");

    return div;
}

function createErrorElement() {
    const errorDiv = document.createElement("div");
    errorDiv.textContent = "Error: Couldn't load a new dog image.";
    errorDiv.style.color = "red";
    errorDiv.style.margin = "10px";
    return errorDiv;
}

async function handleNearBottom() {
    const currentTime = Date.now();
    if (currentTime - lastApiCallTime < API_COOLDOWN) {
        return;
    }

    lastApiCallTime = currentTime;
    let retries = 3;
    let imageUrl = null;

    while (retries > 0) {
        imageUrl = await fetchDogImage();
        if (imageUrl && !dogImages.has(imageUrl)) {
            dogImages.add(imageUrl);
            break;
        }
        retries--;
    }

    const contentContainer = document.getElementById("content");
    if (imageUrl) {
        const img = createDogImageElement(imageUrl);
        contentContainer.appendChild(img);
    } else {
        const errorDiv = createErrorElement();
        contentContainer.appendChild(errorDiv);
    }
}

window.addEventListener("scroll", function () {
    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.body.offsetHeight;
    const distanceFromBottom = pageHeight - scrollPosition;

    if (distanceFromBottom < 100) {
        handleNearBottom();
    }
});

addEventListener("DOMContentLoaded", (event) => {
    const isIndexPage = window.location.pathname.endsWith("index.html") ||
        window.location.pathname === "/";

    if (isIndexPage) {
        const contentContainer = document.getElementById("content");
        const viewportHeight = window.innerHeight;

        function checkAndFill() {
            const containerHeight = contentContainer.offsetHeight;
            if (containerHeight < viewportHeight) {
                handleNearBottom();
                setTimeout(checkAndFill, 100);
            }
        }

        checkAndFill();
    }
});
