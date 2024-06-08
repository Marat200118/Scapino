const updateSectionDisplay = (currentState, items) => {

    document.querySelector(".introduction").style.display = "none";
    document.querySelector(".in-between").style.display = "none";
    document.querySelector(".misogyny").style.display = "none";
    document.querySelector(".life").style.display = "none";
    document.querySelector(".norms").style.display = "none";
    document.querySelector(".reproductive-rights").style.display = "none";

    document.querySelectorAll("video").forEach((video) => {
        video.pause();
    });

    switch (currentState.section) {
        case "start":
            document.querySelector(".introduction").style.display = "block";
            break;
        case "in-between":
            document.querySelector(".inbetween").style.display = "block";
            break;
        case "content":
            const highlightedItem = items.find((item) => item.isHighlighted);
            if (highlightedItem) {
                document.querySelector(`.${highlightedItem.section}`).style.display = "block";
            } else {
                console.log("No highlighted item found");
            };
            break;

        default:
            document.querySelector(".introduction").style.display = "block";
            break;
    };
};

export { updateSectionDisplay };