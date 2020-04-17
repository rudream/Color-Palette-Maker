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

randomColors();
