//SELECTORS

const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustButtons = document.querySelectorAll(".adjust");
const lockButtons = document.querySelectorAll(".lock");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
let initialColors;
let savedPalettes = [];

//Event Listeners

generateBtn.addEventListener("click", randomColors);

sliders.forEach((slider) => {
    slider.addEventListener("input", hslControls);
});

colorDivs.forEach((slider, index) => {
    slider.addEventListener("change", () => {
        updateTextUI(index);
    });
});

lockButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
        colorDivs[index].classList.toggle("locked");
        if (colorDivs[index].classList.contains("locked")) {
            button.innerHTML = '<i class="fas fa-lock"></i>';
        } else {
            button.innerHTML = '<i class="fas fa-lock-open"></i>';
        }
    });
});

currentHexes.forEach((hex) => {
    hex.addEventListener("click", () => {
        copyToClipboard(hex);
    });
});

popup.addEventListener("transitionend", () => {
    const popupBox = popup.children[0];
    popup.classList.remove("active");
    popupBox.classList.remove("active");
});

adjustButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
        openAdjustmentPanel(index);
    });
});

closeAdjustments.forEach((button, index) => {
    button.addEventListener("click", () => {
        closeAdjustmentPanel(index);
    });
});

//Functions

function generateHex() {
    const letters = "0123456789abcdef";
    let hex = "#";
    for (let i = 0; i < 6; i++) {
        hex += letters[Math.floor(Math.random() * 16)];
    }
    return hex;
}

function randomColors() {
    initialColors = [];
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();
        if (div.classList.contains("locked")) {
            initialColors.push(hexText.innerText);
            return;
        } else {
            initialColors.push(randomColor);
        }
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
        updateContrast(randomColor, hexText); //Updates the color of the text based on the color to increase contrast and make it readable
        updateContrast(randomColor, div.children[1].children[0]); //Also updates the color of the buttons
        updateContrast(randomColor, div.children[1].children[1]);
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input");
        const brightness = sliders[0];
        const hue = sliders[1];
        const saturation = sliders[2];
        colorizeSliders(color, hue, brightness, saturation);
    });
    resetInputs();
}

function updateContrast(color, text) {
    const luminance = chroma(color).luminance();
    if (luminance > 0.5) {
        text.style.color = "black";
    } else {
        text.style.color = "white";
    }
}

function colorizeSliders(color, hue, brightness, saturation) {
    //Hue Scale
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75, 75), rgb(204, 204, 75), rgb(75, 204, 75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75)`;
    //Brightness Scale
    const midBright = color.set("hsl.l", 0.5);
    const scaleBright = chroma.scale(["black", midBright, "white"]);
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(1)})`; //prettier-ignore
    //Saturation Scale
    const noSat = color.set("hsl.s", 0);
    const fullSat = color.set("hsl.s", 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`; //prettier-ignore
}

function hslControls(e) {
    const index =
        e.target.getAttribute("data-bright") ||
        e.target.getAttribute("data-hue") ||
        e.target.getAttribute("data-sat");

    let sliders = e.target.parentElement.querySelectorAll(
        'input[type="range"]'
    );
    const brightness = sliders[0];
    const hue = sliders[1];
    const saturation = sliders[2];
    const bgColor = initialColors[index];
    let color = chroma(bgColor)
        .set("hsl.s", saturation.value)
        .set("hsl.l", brightness.value)
        .set("hsl.h", hue.value);

    colorDivs[index].style.backgroundColor = color;

    colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector("h2");
    const icons = activeDiv.querySelectorAll(".controls button");
    textHex.innerText = color.hex();
    updateContrast(color.hex(), textHex);
    updateContrast(color.hex(), icons[0]);
    updateContrast(color.hex(), icons[1]);
}

function resetInputs() {
    const sliders = document.querySelectorAll(".sliders input");
    sliders.forEach((slider) => {
        if (slider.name === "hue") {
            const hueColor = initialColors[slider.getAttribute("data-hue")];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = hueValue;
        } else if (slider.name === "brightness") {
            const brightnessColor =
                initialColors[slider.getAttribute("data-bright")];
            const brightnessValue = chroma(brightnessColor).hsl()[2];
            slider.value = Math.floor(brightnessValue * 100) / 100;
        } else if (slider.name === "saturation") {
            const saturationColor =
                initialColors[slider.getAttribute("data-sat")];
            const saturationValue = chroma(saturationColor).hsl()[1];
            slider.value = Math.floor(saturationValue * 100) / 100;
        }
    });
}

function copyToClipboard(hex) {
    const el = document.createElement("textarea");
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    const popupBox = popup.children[0];
    popup.classList.add("active");
    popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
    sliderContainers[index].classList.toggle("active");
}

function closeAdjustmentPanel(index) {
    sliderContainers[index].classList.remove("active");
}

// LOCAL STORAGE

const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

function openPalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.add("active");
    popup.classList.add("active");
}

function closePalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove("active");
    popup.classList.remove("active");
}

function savePalette(e) {
    saveContainer.classList.remove("active");
    popup.classList.remove("active");
    const name = saveInput.value;
    const colors = [];
    currentHexes.forEach((hex) => {
        colors.push(hex.innerText);
    });

    let paletteNr = savedPalettes.length;
    const paletteObject = {
        name,
        colors,
        nr: paletteNr,
    };
    saveToLocal(paletteObject);
    saveInput.value = "";
    const palette = document.createElement("div");
    palette.classList.add("custom-palette");
    const title = document.createElement("h4");
    title.innerText = paletteObject.name;
    const preview = document.createElement("div");
    preview.classList.add("small-preview");
    paletteObject.colors.forEach((smallColor) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
    });
    const paletteBtn = document.createElement("button");
    savedPalettes.push(paletteObject);
    paletteBtn.classList.add("pick-palette-btn");
    paletteBtn.classList.add(paletteObject.nr);
    paletteBtn.innerText = "Select";

    paletteBtn.addEventListener("click", (e) => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        savedPalettes[paletteIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            updateContrast(color, text);
            updateContrast(color, colorDivs[index].children[1].children[0]);
            updateContrast(color, colorDivs[index].children[1].children[1]);
            const colorChroma = chroma(color);
            const sliders = colorDivs[index].querySelectorAll(".sliders input");
            const brightness = sliders[0];
            const hue = sliders[1];
            const saturation = sliders[2];
            colorizeSliders(colorChroma, hue, brightness, saturation);
        });
        resetInputs();
    });

    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(paletteObject) {
    let localPalettes;
    if (localStorage.getItem("palettes") === null) {
        localPalettes = [];
    } else {
        localPalettes = JSON.parse(localStorage.getItem("palettes"));
    }
    localPalettes.push(paletteObject);
    localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function openLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add("active");
    popup.classList.add("active");
}

function closeLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove("active");
    popup.classList.remove("active");
}

function getLocal() {
    if (localStorage.getItem("palettes") === null) {
        localPalettes = [];
    } else {
        const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
        paletteObjects.forEach((paletteObject) => {
            const palette = document.createElement("div");
            palette.classList.add("custom-palette");
            const title = document.createElement("h4");
            title.innerText = paletteObject.name;
            const preview = document.createElement("div");
            preview.classList.add("small-preview");
            paletteObject.colors.forEach((smallColor) => {
                const smallDiv = document.createElement("div");
                smallDiv.style.backgroundColor = smallColor;
                preview.appendChild(smallDiv);
            });
            const paletteBtn = document.createElement("button");
            savedPalettes.push(paletteObject);
            paletteBtn.classList.add("pick-palette-btn");
            paletteBtn.classList.add(paletteObject.nr);
            paletteBtn.innerText = "Select";

            paletteBtn.addEventListener("click", (e) => {
                closeLibrary();
                const paletteIndex = e.target.classList[1];
                initialColors = [];
                savedPalettes[paletteIndex].colors.forEach((color, index) => {
                    initialColors.push(color);
                    colorDivs[index].style.backgroundColor = color;
                    const text = colorDivs[index].children[0];
                    text.innerText = color;
                    updateContrast(color, text);
                    updateContrast(
                        color,
                        colorDivs[index].children[1].children[0]
                    );
                    updateContrast(
                        color,
                        colorDivs[index].children[1].children[1]
                    );
                    const colorChroma = chroma(color);
                    const sliders = colorDivs[index].querySelectorAll(
                        ".sliders input"
                    );
                    const brightness = sliders[0];
                    const hue = sliders[1];
                    const saturation = sliders[2];
                    colorizeSliders(colorChroma, hue, brightness, saturation);
                });
                resetInputs();
            });

            palette.appendChild(title);
            palette.appendChild(preview);
            palette.appendChild(paletteBtn);
            libraryContainer.children[0].appendChild(palette);
        });
    }
}

getLocal();
randomColors();
