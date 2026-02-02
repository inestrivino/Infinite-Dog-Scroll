// BACK TO TOP BUTTON CODE
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

// FEED DOG IMAGES CODE
const dogImages = new Set(); //To ensure that the same picture doesn't show up twice
let lastApiCallTime = 0; //To ensure there aren't too many calls made to the API
const API_COOLDOWN = 100;

async function fetchDogImage() {
    try {
        const response = await fetch("https://dog.ceo/api/breeds/image/random"); //Call to get pic from API
        const data = await response.json();
        if (data.status === "success") {
            return data.message; //If everything went well the message should be the URL of the picture
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
        //Regex to get the breed name from the URL of the picture
    }
    return "Unknown breed";
}

function createDogImageElement(imageUrl) {
    const div = document.createElement("div");
    const img = document.createElement("img");
    const title = document.createElement("h2");

    img.src = imageUrl; //we set the img element to the URL given by the API
    const breedName = extractBreedName(imageUrl); //we extract the breed of the dog in the picture
    img.alt = `A ${breedName} dog`; //we set the alt value (for accessibility)
    img.title = breedName.charAt(0).toUpperCase() + breedName.slice(1); //we set the title to the breed name (for accesibility)
    title.textContent = breedName.charAt(0).toUpperCase() + breedName.slice(1); //we create a text element with the breed name so we can display it

    div.appendChild(img);
    div.appendChild(title);

    div.classList.add("dog-picture"); //we add the class name (for CSS)

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
    const contentContainer = document.getElementById("content");
    const currentTime = Date.now();

    //we check that we are not makeng too many API calls
    if (currentTime - lastApiCallTime < API_COOLDOWN) {
        return;
    }

    //we update the call time to the API
    lastApiCallTime = currentTime;
    let retries = 3;
    let imageUrl = null;

    //while we have retries left we try to fetch the dog picture
    while (retries > 0) {
        imageUrl = await fetchDogImage();
        //if we get a picture and it has not been shown before, we add it to the set and show it
        if (imageUrl && !dogImages.has(imageUrl)) {
            dogImages.add(imageUrl);
            const img = createDogImageElement(imageUrl);
            contentContainer.appendChild(img);
            break;
        }
        retries--;
    }
    //if we didn't get the picture after 3 retries we just show an error
    if (!imageUrl) {
        const errorDiv = createErrorElement();
        contentContainer.appendChild(errorDiv);
    }
}

async function fillUntilScrollable() {
    handleNearBottom();
    //while we haven't filled the screen, we continue to add dog pictures
    while (document.body.scrollHeight <= window.innerHeight) {
        await handleNearBottom();
        await new Promise(resolve => setTimeout(resolve, API_COOLDOWN));
    }
}

let intervalStarted = false;

function startContinuousCheck() {
    if (intervalStarted) return;
    intervalStarted = true;

    setInterval(() => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const pageHeight = document.body.offsetHeight;
        const distanceFromBottom = pageHeight - scrollPosition;

        if (distanceFromBottom < 100) {
            fillUntilScrollable();
        }
    }, 100);
}

addEventListener("DOMContentLoaded", (event) => {
    //we only run the code for the dog picture if we are in the corresponding screen
    const isIndexPage = window.location.pathname.endsWith("index.html") ||
        window.location.pathname === "/";

    if (isIndexPage) {
        fillUntilScrollable();
        startContinuousCheck();
    }
});